<template>

    <div class="col-md-8 py-5">

        <h1 class="my-4">FileBox
            <small>Easy file sharing in a simple "box"</small>
        </h1>

        <filebox :boxId="boxId" :newBox="false"></filebox>

    </div>

</template>

<script>
  import filebox from '../components/FileBox.vue'

  export default {
    name: 'BoxView',
    computed: {
      boxId () {
        return this.$route.params.id
      }
    },
    components: {
      filebox
    },
    beforeMount () {

    }
  }
</script>