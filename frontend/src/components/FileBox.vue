<template>
    <div class="card mb-4">

        <qr-code-modal :boxUrl="boxUrl"/>
        <email-modal/>


        <file-box-header :boxUrl="boxUrl" :boxId="boxId" :newBox="newBox"></file-box-header>

        <div class="card-body" v-if="error">
            <div class="alert alert-danger">{{ error }}</div>
        </div>

        <div class="card-body text-center" v-if="newBox">
            <h2 class="card-title">This is a new box</h2>
            <p class="card-text text-muted">Add files to this box to enable sharing options.</p>
            <!--<input class="form-control form-control-lg" type="text" placeholder="Box Name - optional">-->
            <!--<input class="form-control" type="text" placeholder="Description - optional">-->
        </div>

        <!--<div class="card-body" v-if="boxMeta">-->
            <!--<h2 class="card-title">Multiple Files</h2>-->
            <!--<p class="card-text text-muted">Description of files.</p>-->
        <!--</div>-->

        <!-- Multiple Files -->
        <div class="card-body" v-if="files.length > 1">
            <ul class="list-group list-group-flush">
                <li class="list-group-item" v-for="file in files">
                    <em class="fa fa-file-archive-o"></em>&nbsp;&nbsp; {{ file.name }}
                    <span class="float-right">
                            <span class="text-muted">Size</span> : {{ file.size | prettyBytes }} &nbsp;
                            <button class="btn btn-sm btn-success" v-on:click="getFile(boxId,file.id)"><em
                                    class="fa fa-download"></em> Download</button>
                            <button class="btn btn-sm btn-outline-danger"><em class="fa fa-times"></em></button>
                        </span>
                </li>
            </ul>
        </div>

        <!-- Single File -->
        <div class="card-body text-center" v-if="files.length == 1">
            <h2><em class="fa fa-file"></em></h2>
            <h2 class="card-title">{{ singleFile.name }}a</h2>
            <div>
                <span class="text-muted">Size</span> : {{ singleFile.size | prettyBytes }}  &nbsp;&nbsp;&nbsp;&nbsp;
                <button class="btn btn-sm btn-success" v-on:click="getFile(boxId,singleFile.id)"><em
                        class="fa fa-download"></em> Download
                </button>
            </div>
        </div>

        <div class="card-body" v-if="!newBox">
            <div class="text-center">
                <button v-on:click="showDropBox = !showDropBox" class="btn btn-outline-success btn-sm"><em
                        class="fa fa-plus"></em> Add files
                </button>
            </div>
        </div>
        <div class="card-body">

            <transition name="expand">
                <finedropbox class="dropbox" :boxId="boxId" v-on:complete="completeUpload"
                             v-if="showDropBox || newBox"></finedropbox>
            </transition>

        </div>

        <file-box-footer :boxData="boxData"></file-box-footer>

    </div>
</template>

<script>
  import axios from 'axios'
  import finedropbox from './FineUploader'
  import QrCodeModal from "./QrCodeModal.vue";
  import FileBoxHeader from "./FileBoxHeader.vue";
  import FileBoxFooter from "./FileBoxFooter.vue";
  import EmailModal from "./EmailModal.vue";

  export default {
    name: 'FileBox',
    props: {
      boxId: {
        type: String,
        default: function () {
          return uuidv4()
        }
      },
      newBox: {
        type: Boolean,
        default: true
      }
    },
    data: function () {
      return {
        files: [],
        boxData: null,
        error: null,
        errorStatus: null,
        showQr: false,
        showDropBox: false
      }
    },
    watch: {
      boxId: 'fetchData'
    },
    computed: {
      singleFile: function () {
        return this.files[0];
      },
      boxUrl: function () {
        return window.location.protocol+"//" + window.location.host + "/box/" + this.boxId
      }
    },
    components: {
      FileBoxHeader,
      FileBoxFooter,
      QrCodeModal,
      EmailModal,
      finedropbox
    },
    created() {

      //Only fetch if not newbox.
      if(!this.newBox){
        this.fetchData();
      }
    },
    mounted() {
    },
    methods: {
      fetchData: function () {

        this.error = null
        axios.get(process.env.AWS_LAMBDA_ENDPOINT + '/box/' + this.boxId)
          .then(response => {

            this.incr = null

            this.files = response.data.files
            this.boxData = response.data
            this.newBox = false;
          })
          .catch(e => {
            this.error = e.response.data.error
            this.errorStatus = e.response.status
          });
      },
      completeUpload: function () {
        this.fetchData();
      },
      getFile: function (boxId, fileId) {
        axios.get(process.env.AWS_LAMBDA_ENDPOINT + '/file/' + boxId + '/' + fileId)
          .then(response => {
            window.location.assign(response.data);
            // JSON responses are automatically parsed.
            //this.posts = response.data
          })
          .catch(e => {
            this.error = e.response.data.error
            this.errorStatus = e.response.status
          });
      }
    }

  }

  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
  }
</script>

<style lang="css">


    .expand-enter-active, .expand-leave-active {
        transition: all .5s ease;
        overflow-y: hidden;
    }

    .expand-enter, .expand-leave-to {
        height: 0;
        opacity: 0;
        padding-top: 0;
        padding-bottom: 0;
        border-top-width: 0;
        border-bottom-width: 0;
    }
</style>
