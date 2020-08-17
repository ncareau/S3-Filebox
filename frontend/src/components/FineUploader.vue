<template>
    <div>
        <div id="fineuploader" ref="fineuploader"></div>
        <script type="text/template" id="qq-template">
            <div class="qq-uploader-selector qq-uploader">

                <div class="qq-upload-drop-area-selector uploader-drop-zone">
                    <div class="text-center" style="margin-top: 10px;margin-bottom: 20px;">
                    <div class="qq-upload-button-selector btn btn-outline-primary">
                        <div>Select files</div>
                    </div>
                    <span class="drop-zone-text">or Drop files here</span>
                    </div>
                    <ul class="qq-upload-list-selector qq-upload-list">
                        <li class="file-container">
                            <div class="qq-progress-bar-container-selector">
                                <div class="qq-progress-bar-selector qq-progress-bar"></div>
                            </div>
                            <div class="file-info">
                                <span class="qq-upload-spinner-selector qq-upload-spinner"></span>
                                <img class="qq-thumbnail-selector" qq-max-size="50" qq-server-scale>
                                <span class="qq-upload-file-selector qq-upload-file"></span>
                                <span class="qq-upload-size-selector qq-upload-size"></span>
                            </div>
                            <button class="qq-upload-cancel-selector qq-upload-cancel" href="#">Cancel</button>
                            <button class="qq-upload-retry-selector qq-upload-retry" href="#">Retry</button>
                            <span class="qq-upload-status-text-selector qq-upload-status-text"></span>
                            <a class="view-btn" target="_blank" style="display: none;">
                                <input type="button" value="View">
                            </a>
                        </li>
                    </ul>
                </div>
                <span class="qq-drop-processing-selector qq-drop-processing">
                    <span>Processing dropped files...</span>
                    <span class="qq-drop-processing-spinner-selector qq-drop-processing-spinner"></span>
                </span>
            </div>
        </script>

    </div>
</template>

<script>
  import qq from 'fine-uploader/lib/s3'
  import axios from 'axios'

  import 'fine-uploader/s3.fine-uploader/fine-uploader-new.css'

    export default {
        name: 'finedropbox',
        props: ['boxId'],

      data: function() {
        return {
          fu_options: ''
        }
      },
      mounted () {

        let vm = this;
        let boxId = this.boxId;
        let completedFiles = [];

        this.fu_options = {
          element: this.$refs.fineuploader,
          request: {
            endpoint: "https://"+process.env.AWS_BUCKET_NAME+".s3.amazonaws.com",
            accessKey: process.env.AWS_ACCESS_KEY
          },
          objectProperties: {
            region: "ca-central-1",
            key: function(fileId) {
              return boxId + '/' + this.getUuid(fileId);
            }
          },
          signature: {
            endpoint: process.env.AWS_LAMBDA_ENDPOINT+"/sign",
            version: 4
          },
//          uploadSuccess:{
//            endpoint: process.env.AWS_LAMBDA_ENDPOINT+"/verify",
//          },
          callbacks:{
            onComplete:function(id, name, res, xhr){

              let fu = this;

              let fileKey;
              let fileId;
              let file;

              if(res.success){
                fileId = fu.getUuid(id);
                fileKey = boxId + '/' + fileId;
                file = fu.getFile(id);

                completedFiles.push({
                  fileKey: fileKey,
                  boxId: boxId,
                  fileId: fileId,
                    lastModified: file.lastModified,
                    name: file.name,
                    size: file.size,
                    type: file.type
                })
              }

            },
            onAllComplete: function(succeeded, failed){

                if(completedFiles.length > 0){
                  axios.post(process.env.AWS_LAMBDA_ENDPOINT+'/complete',{files:completedFiles, boxId: boxId}).then(response => {
                    completedFiles = []
                    console.log(response.data);
                    // JSON responses are automatically parsed.
                    //this.posts = response.data
                    vm.$emit('complete')
                  })
                    .catch(e => {
                      //this.errors.push(e)
                    });
                }
            }
          },
          cors: {
            //all requests are expected to be cross-domain requests
            expected: true,
            //if you want cookies to be sent along with the request
            sendCredentials: true
          },
          retry: {
            enableAuto: false
          },
          chunking: {
            enabled: true
          },
          resume: {
            enabled: true
          }
        };

        const uploader = new qq.s3.FineUploader(this.fu_options);

        }
    }
</script>

<style lang="css">

</style>
