<template>
    <div class="card-footer" v-if="boxData">
        <div class="float-left">
            <span class="text-muted">Created </span> : {{ boxData.createdDate | moment }}
            &nbsp;&nbsp;
            <span class="text-muted">Total Size</span> : {{ totalSize | prettyBytes }}
            &nbsp;&nbsp;
            <span class="text-muted"># Files</span> : {{ boxData.incr }}
        </div>
        <div class="float-right">
            <button class="btn btn-outline-default btn-sm" title="Config"><em class="fa fa-cog"></em></button>
            <button class="btn btn-outline-danger btn-sm" title="Delete this box"><em class="fa fa-times"></em></button>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'FileBoxFooter',
    props: {
      boxData: {}
    },
    computed: {
      totalSize: function () {
        let calcSize = 0;
        this.boxData.files.forEach(function (file) {
          calcSize = calcSize + file.size
        });
        return calcSize;
      }
    }

  }
</script>
