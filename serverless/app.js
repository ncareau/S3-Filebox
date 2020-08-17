'use strict';
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const aws = require("aws-sdk");
const CryptoJS = require("crypto-js");

const app = express();

const
  fileboxPublicKey = process.env.S3FILEBOX_PUBLIC_KEY,
  fileboxSecretKey = process.env.S3FILEBOX_SECRET_KEY,

  fileboxBucketName = process.env.S3FILEBOX_BUCKET_NAME,
  expectedHostname = fileboxBucketName + ".s3.amazonaws.com",

  expectedMinSize = process.env.S3FILEBOX_MIN_SIZE === '-1' ? null : process.env.S3FILEBOX_MIN_SIZE,
  expectedMaxSize = process.env.S3FILEBOX_MAX_SIZE === '-1' ? null : process.env.S3FILEBOX_MAX_SIZE;

app.use(cors({origin: process.env.S3FILEBOX_HOST_NAME, credentials: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(awsServerlessExpressMiddleware.eventContext());

// Init S3, given your server-side keys.
aws.config.update({
  accessKeyId: fileboxPublicKey,
  secretAccessKey: fileboxSecretKey
});
const s3 = new aws.S3();

app.get("/box/:boxId", function (req, res) {
  console.log("****GETBOX****")

  const boxId = req.params.boxId

  console.log(boxId)

  s3.getObject({
    Bucket: fileboxBucketName,
    Key: boxId + "/metadata",
  }, function (err, data) {

    if (err) {

      //Check if error NotFound
      if (err.statusCode === 404) {
        console.log("*noMetaFile*")
        console.log(err)
        res.status(404);
        res.end(JSON.stringify({error: "No box found!"}));
      } else {
        res.status(500);
        console.log(err);
        res.end(JSON.stringify({error: "Problem querying S3!"}));
      }
    } else {
      res.end(data.Body.toString());
    }

  })

});

app.get("/file/:boxId/:fileId", function (req, res) {
  console.log("****GETFILE****")

  const boxId = req.params.boxId
  const fileId = req.params.fileId


  s3.getObject({
    Bucket: fileboxBucketName,
    Key: boxId + "/metadata",
  }, function (err, data) {

    if (err) {

      //Check if error NotFound
      if (err.statusCode === 404) {
        console.log("*noMetaFile*")
        console.log(err)
        res.status(404);
        res.end(JSON.stringify({error: "No box found!"}));
      } else {
        res.status(500);
        console.log(err);
        res.end(JSON.stringify({error: "Problem querying S3!"}));
      }
    } else {

      let getFile = null;

      let meta = JSON.parse(data.Body.toString())

      console.log(meta);

      meta.files.forEach(function (file) {
        if (file.id === fileId) {
          getFile = file
        }
      });

      let url = s3.getSignedUrl('getObject', {
        Bucket: fileboxBucketName,
        Key: boxId + '/' + fileId,
        ResponseContentDisposition: "attachment;filename=" + getFile.name
      });
      res.end(url);

    }

  })


});

app.post("/complete", function (req, res) {
  console.log("****COMPLETE****")
  let meta = {};

  console.log(req.body);

  const boxId = req.body.boxId;

  if (req.body.files && req.body.files.length > 0) {

    //Check if meta data file exist.
    s3.getObject({
      Bucket: fileboxBucketName,
      Key: boxId + "/metadata",
    }, function (err, data) {
      console.log("*updating*")

      if (err) {

        //Check if error NotFound
        if (err.statusCode === 404) {
          console.log("*newMetaFile*")
          console.log(err)

          meta = {
            version: 1,
            incr: 0,
            meta: {
              id: boxId,
              createdAt: Date.now()
            },
            files: []
          }
        } else {
          res.status(500);
          console.log(err);
          res.end(JSON.stringify({error: "Problem querying S3!"}));
        }
      } else {
        console.log(data);
        meta = JSON.parse(data.Body.toString())
      }

      //ADD FILE TO META
      req.body.files.forEach(function (file) {

        let fileId = file.fileId;
        let fileName = file.name;

        meta.incr = meta.incr + 1;

        meta.files.push({
          id: fileId,
          uploadeddAt: Date.now(),
          modifiedAt: file.lastModified,
          size: file.size,
          type: file.type,
          name: fileName
        });

      })

      console.log(meta);

      //Put file in s3.
      s3.putObject({
        Bucket: fileboxBucketName,
        Key: boxId + "/metadata",
        Body: JSON.stringify(meta)
      }, function (err, data) {
        if (err) {
          res.status(500);
          console.log(err);
          res.end(JSON.stringify({error: "Problem querying S3!"}));
        }

        console.log("*ok*")
        res.end(JSON.stringify({type: "success", url: "fileurl"}));
      })
    });

  }

});

app.post("/verify", function (req, res) {
  console.log("****VERIFY****")
  verifyFileInS3(req, res);
});

app.post("/sign", function (req, res) {
  console.log("****SIGN****")
  signRequest(req, res);
});

app.delete("/delete/:boxId/:fileId", function (req, res) {
  console.log("****DELETE FILE****")

  const boxId = req.params.boxId
  const fileId = req.params.fileId

  deleteFile(req.query.bucket, req.query.key, function (err) {
    if (err) {
      console.log("Problem deleting file: " + err);
      res.status(500);
    }

    res.end();
  });
});

app.delete("/deletebox/:boxId", function (req, res) {
  console.log("****DELETE FILE****")

  const boxId = req.params.boxId
  const fileId = req.params.fileId

  deleteFile(req.query.bucket, req.query.key, function (err) {
    if (err) {
      console.log("Problem deleting file: " + err);
      res.status(500);
    }

    res.end();
  });
});

// Signs any requests.  Delegate to a more specific signer based on type of request.
function signRequest(req, res) {
  console.log(req.body);

  if (!req.query.v4) {
    res.status(500);
    console.log(err);
    res.end(JSON.stringify({error: "API signing must be using v4"}));
  }

  if (req.body.headers) {
    signRestRequest(req, res);
  }
  else {
    signPolicy(req, res);
  }
}

// Signs multipart (chunked) requests.  Omit if you don't want to support chunking.
function signRestRequest(req, res) {
  let version = req.query.v4 ? 4 : 2,
    stringToSign = req.body.headers,
    signature = signV4RestRequest(stringToSign);

  let jsonResponse = {
    signature: signature
  };

  res.setHeader("Content-Type", "application/json");

  if (isValidRestRequest(stringToSign, version)) {
    res.end(JSON.stringify(jsonResponse));
  }
  else {
    res.status(400);
    res.end(JSON.stringify({invalid: true, 'd': 1}));
  }
}

function signV4RestRequest(headersStr) {
  let matches = /.+\n.+\n(\d+)\/(.+)\/s3\/aws4_request\n([\s\S]+)/.exec(headersStr),
    hashedCanonicalRequest = CryptoJS.SHA256(matches[3]),
    stringToSign = headersStr.replace(/(.+s3\/aws4_request\n)[\s\S]+/, '$1' + hashedCanonicalRequest);

  return getV4SignatureKey(fileboxSecretKey, matches[1], matches[2], "s3", stringToSign);
}

// Signs "simple" (non-chunked) upload requests.
function signPolicy(req, res) {
  let policy = req.body,
    base64Policy = new Buffer(JSON.stringify(policy)).toString("base64"),
    signature = signV4Policy(policy, base64Policy);

  let jsonResponse = {
    policy: base64Policy,
    signature: signature
  };

  res.setHeader("Content-Type", "application/json");

  if (isPolicyValid(req.body)) {
    res.end(JSON.stringify(jsonResponse));
  }
  else {
    res.status(400);
    res.end(JSON.stringify({invalid: true, 'd': 2}));
  }
}

function signV4Policy(policy, base64Policy) {
  let conditions = policy.conditions,
    credentialCondition;

  for (let i = 0; i < conditions.length; i++) {
    credentialCondition = conditions[i]["x-amz-credential"];
    if (credentialCondition !== undefined) {
      break;
    }
  }
  console.log(credentialCondition);

  let matches = /.+\/(.+)\/(.+)\/s3\/aws4_request/.exec(credentialCondition);
  console.log(matches)
  return getV4SignatureKey(fileboxSecretKey, matches[1], matches[2], "s3", base64Policy);
}

// Ensures the REST request is targeting the correct bucket.
// Omit if you don't want to support chunking.
function isValidRestRequest(headerStr, version) {

  console.log(version);
  console.log(headerStr);
  if (version === 4) {
    return new RegExp("host:" + expectedHostname).exec(headerStr) !== null;
  }

  return new RegExp("\/" + fileboxBucketName + "\/.+$").exec(headerStr) !== null;
}

// Ensures the policy document associated with a "simple" (non-chunked) request is
// targeting the correct bucket and the min/max-size is as expected.
// Comment out the expectedMaxSize and expectedMinSize variables near
// the top of this file to disable size validation on the policy document.
function isPolicyValid(policy) {
  let bucket, parsedMaxSize, parsedMinSize, isValid;

  policy.conditions.forEach(function (condition) {
    if (condition.bucket) {
      bucket = condition.bucket;
    }
    else if (condition instanceof Array && condition[0] === "content-length-range") {
      parsedMinSize = condition[1];
      parsedMaxSize = condition[2];
    }
  });

  console.log(bucket)
  console.log(fileboxBucketName)

  isValid = bucket === fileboxBucketName;

  // If expectedMinSize and expectedMax size are not null (see above), then
  // ensure that the client and server have agreed upon the exact same
  // values.
  if (expectedMinSize !== null && expectedMaxSize !== null) {
    isValid = isValid && (parsedMinSize === expectedMinSize.toString())
      && (parsedMaxSize === expectedMaxSize.toString());
  }

  return isValid;
}

// After the file is in S3, make sure it isn't too big.
// Omit if you don't have a max file size, or add more logic as required.
function verifyFileInS3(req, res) {
  function headReceived(err, data) {
    if (err) {
      res.status(500);
      console.log(err);
      res.end(JSON.stringify({error: "Problem querying S3!"}));
    }
    else if (expectedMaxSize !== null && data.ContentLength > expectedMaxSize) {
      res.status(400);
      res.write(JSON.stringify({error: "Too big!"}));
      deleteFile(req.body.bucket, req.body.key, function (err) {
        if (err) {
          console.log("Couldn't delete invalid file!");
        }

        res.end();
      });
    }

  }

  callS3("head", {
    bucket: req.body.bucket,
    key: req.body.key
  }, headReceived);
}

function getV4SignatureKey(key, dateStamp, regionName, serviceName, stringToSign) {
  let kDate = CryptoJS.HmacSHA256(dateStamp, "AWS4" + key),
    kRegion = CryptoJS.HmacSHA256(regionName, kDate),
    kService = CryptoJS.HmacSHA256(serviceName, kRegion),
    kSigning = CryptoJS.HmacSHA256("aws4_request", kService);

  return CryptoJS.HmacSHA256(stringToSign, kSigning).toString();
}

function deleteFile(bucket, key, callback) {
  callS3("delete", {
    bucket: bucket,
    key: key
  }, callback);
}

function callS3(type, spec, callback) {
  s3[type + "Object"]({
    Bucket: spec.bucket,
    Key: spec.key
  }, callback)
}

// Export your express server so you can import it in the lambda function.
module.exports = app;