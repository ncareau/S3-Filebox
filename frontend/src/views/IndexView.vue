<template>

    <div class="col-md-8">

        <h1>FileBox
            <small>Easy file sharing in a simple "box"</small>
        </h1>


        <div class="card mb-4" style="margin-top: 20px;">
            <div class="card-header">
                Retrieve your box with it's ID
            </div>

            <div class="card-body">
                <div class="input-group">
                    <input type="text" class="form-control" placeholder="Box ID - xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                           aria-label="Search for...">
                    <span class="input-group-btn">
                            <button class="btn btn-secondary" type="button">Go!</button>
                        </span>
                </div>
            </div>
        </div>

        <div id="filebox_group">
            <filebox></filebox>
        </div>

        <div class="text-center" style="margin:20px;">
            <button class="btn btn-outline-primary"><i class="fa fa-plus"></i> New FileBox</button>
            <button class="btn btn-outline-primary"><i class="fa fa-plus"></i> <i class="fa fa-lock"></i> New encrypted FileBox </button>
        </div>
    </div>
</template>


<script>
  import filebox from '../components/FileBox.vue'

  export default {
    name: 'IndexView',
    components: {
      filebox
    }
  }
</script>