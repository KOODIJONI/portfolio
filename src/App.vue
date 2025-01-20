<template>
  <v-app>
    <v-main>
      <ThreeJsWindow/>
    </v-main>
  </v-app>
</template>

<script>
import ThreeJsWindow from './components/ThreeJsWindow.vue';

export default {
  name: 'App',

  components: {
    ThreeJsWindow,
  },

  data: () => ({
    //
  }),
}
</script>
