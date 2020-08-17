This project is in the proof of concept stage. It is missing critical functionalities (Ex: Deleting Files). The project is also not active at the moment. Any comments, forks or PRs is still encouraged.

# S3-Filebox

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ncareau_S3-Filebox&metric=alert_status)](https://sonarcloud.io/dashboard?id=ncareau_S3-Filebox)

This is a combination of a Frontend made in vuejs and a backend for AWS Serverless Nodejs. It is an application to easily share files using a virtual "box". 

<br/>

![S3-Filebox Demo](demo.gif)

<br/>

## Installation - WIP

### Prerequisites

* `aws cli` with configured credentials (`aws configure`)
* `node` 
* AWS ACCESS KEY and AWS SECRET KEY
* If you don't follow the next steps in order, you will miss some parameter needed to complete the steps. 

### AWS Config

1. First, you need to install `aws cli` and configure it with your credentials.
1. Create 3 following buckets
    * `<custombucketname>-web`
    * `<custombucketname>-files`
    * `<custombucketname>-lambda`
1. For more security, create a new AWS ACCESS KEY that has full permission on the `<custombucketname>-files` bucket.
1. Host the `<custombucketname>-web` using either S3 'Static website hosting' or a Cloudfront distribution.
    * Use `index.html` as Index document. 
    * The created url in this step will be the origin used for the rest of the installation.
    * When using cloudfront, add error pages to redirect both error 403 and 404 to `/index.html` (code 200)
1. Put the following CORS config in `<custombucketname>-files` bucket, using the origin from the url of your s3 webserver.
    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>http://custombucketname.s3-website.us-east-1.amazonaws.com</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedMethod>PUT</AllowedMethod>
        <AllowedMethod>POST</AllowedMethod>
        <AllowedMethod>DELETE</AllowedMethod>
        <MaxAgeSeconds>3000</MaxAgeSeconds>
        <ExposeHeader>ETag</ExposeHeader>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
    </CORSConfiguration>
    ```

### Backend

* Copy file `serverless/parameters.dist.json` to `serverless/parameters.dist.json` and complete the information needed
    * S3FileBoxClientHostName
        * Use the origin of the s3 `-web` bucket 
    * S3FileBoxPublicKey
        * Use the specific `-files` bucket key
    * S3FileBoxSecretKey
        * Use the specific `-files` bucket secret
    * S3FileBoxBucketName
        * s3fileboxbucket
    * S3FileBoxMinSize 
        * min filesize in bytes, default is -1 (zero)
    * S3FileBoxMaxSize 
        * max filesize in bytes, default is -1 (infinite)
* Must edit simple-proxy-api.yaml with Region, Origin and accountId. //TODO, better way
* `npm run install` 
* `npm run setup`

### Frontend 

* Copy file `frontend/config/prod.env.dist.js` to `frontend/config/prod.env.js` and complete the information needed
    * AWS_LAMBDA_ENDPOINT
        * Use the adress provided in the cloudformation page from the previous step. ApiUrl
    * AWS_ACCESS_KEY
    * AWS_BUCKET_NAME
* `npm run install` then `npm run build`
* Uploads all the files in `frontend/dist/` to the  `<custombucketname>-web` bucket
    * If using the S3 Website Hosting feature, make sure you set public permission.
