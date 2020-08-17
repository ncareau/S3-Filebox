<template>
    <div id="app">
        <div class="container">
            <div class="row">
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>

<script>

  import finedropbox from './components/FineUploader'
  import filebox from './components/FileBox'
  import appnav from './components/AppNav'

  export default {
    name: 'app',
    components: {
      finedropbox,
      filebox
    }
  }
</script>

<style lang="stylus">
    body
        font-family 'Open Sans', sans-serif
</style>

<style lang="css">
    body {
        padding-top: 50px;
    }
</style>