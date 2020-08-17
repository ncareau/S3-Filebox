<template>

    <div class="card-header" v-if="boxId" :style="boxHeaderStyle">

            <span class="boxTitle">
                <router-link :to="{name: 'box', params: {id: boxId}}"><span class="text-muted"><i
                        class="fa fa-link"></i></span> /box/{{ boxId }}</router-link>
            </span>

        <span class="float-right" v-if="!newBox">
                <button class="btn btn-primary btn-sm" title="Copy to clipboard" v-clipboard="boxUrl"><i
                        class="fa fa-clipboard"></i></button>
                <button class="btn btn-primary btn-sm" title="Qr Code"
                        v-on:click="$modal.show('qrcode-modal', { boxUrl: boxUrl })"><i
                        class="fa fa-qrcode"></i></button>
                <button class="btn btn-primary btn-sm" title="Send an email"
                        v-on:click="$modal.show('email-modal', { boxUrl: boxUrl })"><i
                        class="fa fa-envelope-o"></i></button>
        </span>

        <span  class="float-right" v-if="newBox">
            <span class="badge badge-secondary">New</span>
        </span>
    </div>
</template>

<script>
  export default {
    name: 'FileBoxHeader',
    props: {
      boxId: {type: String},
      boxUrl: {type: String},
      newBox: {type: Boolean}
    },
    computed: {
      boxHeaderStyle: function () {
        return {
          //TODO use color for better box identification.
//          'background-color':stringToColour(this.boxId)
        }
      }
    }
  }

  function stringToColour(str) {
    let i;
    let hash = 0;
    for (i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let colour = '#';
    for (i = 0; i < 3; i++) {
      let value = (hash >> (i * 8)) & 0xFF;
      colour += ('00' + value.toString(16)).substr(-2);
    }
    console.log(colour)
    return colour;
  }
</script>

<style lang="css">
    .card-header {
        font-size: 1.25em;
    }
</style>