<template>
    <modal name="qrcode-modal" :width="400" :height="450" :adaptive="true">
        <div class="modal-content">
            <div class="modal-body text-center">
                <img width="350" id="qrimg" :src="computeQRCode" alt="QR Code">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" v-on:click="$modal.hide('qrcode-modal')">Close</button>
            </div>
        </div>
    </modal>
</template>

<script>
  const QRCode = require('qrcode');

  export default {
    name: 'QrCodeModal',
    props: {
      boxUrl: {
        type: String
      },
    },
    computed: {
      computeQRCode: function () {
        var opts = {
          errorCorrectionLevel: 'L',
          type: 'image/jpeg',
          rendererOpts: {
            quality: 0.92
          }
        };

        var img_data= ""

        QRCode.toDataURL(this.boxUrl, opts, function (err, url) {
          if (err) throw err
          img_data = url
        })
        return img_data;
      }
    }
  }
</script>