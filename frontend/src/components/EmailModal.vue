<template>
    <modal name="email-modal" :adaptive="true">
        <form>

            <div class="modal-content" style="height: 300px;">
                <div class="modal-body text-center">

                    <div class="form-group">
                        <label for="exampleInputEmail1">Email address</label>
                        <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"
                               placeholder="Enter email">
                        <small id="emailHelp" class="form-text text-muted">
                            We'll send an email with the link to this box.
                        </small>
                    </div>

                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">Submit</button>
                    <button type="button" class="btn btn-secondary" v-on:click="$modal.hide('email-modal')">Close
                    </button>
                </div>
            </div>
        </form>
    </modal>
</template>

<script>

  export default {
    name: 'EmailModal',
    computed: {}
  }
</script>

