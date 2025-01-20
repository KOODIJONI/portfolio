<template>
    <div class="text-center pa-4">
      <v-dialog
        v-model="dialog"
        max-width="400"
        persistent
      >
        <v-card color="black">
          <v-card-title>
            {{ dialogHeader }}
          </v-card-title>
          <v-card-text>
            {{ dialogMessage }}
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn 
              color="error" 
              text 
              @click="dialog = false"
            >
              Disagree
            </v-btn>
            <v-btn 
              color="success" 
              text 
              @click="closeDialog"
              :href="dialogLink"
            >
              Agree
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, defineExpose } from 'vue'
  
  // Define dialog state and content
  const dialog = ref(false)
  const dialogHeader = ref('')
  const dialogMessage = ref('')
  const dialogLink = ref('')
  
  // Expose the openDialog method to the parent component
  defineExpose({
    openDialog(header, message, link) {
      // Set the dialog content
      dialogHeader.value = header
      dialogMessage.value = message
      dialogLink.value = link
      dialog.value = true // Open the dialog
      console.log("Dialog opened with link:", link)
    },
    closeDialog() {
      dialog.value = false // Close the dialog
      window.location.href = dialogLink.value // Redirect to the provided link
    }
  })
  </script>
  

<style scoped>
.text-center.pa-4 {
  position: fixed; /* Ensures the dialog won't affect the parent container */
}
</style>