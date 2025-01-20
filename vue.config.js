const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,

  // Extend Webpack configuration
  configureWebpack: {
    resolve: {
      fallback: {
        path: require.resolve('path-browserify'), // Use path-browserify as a polyfill
        fs: false,
      },
    },
  },

  pluginOptions: {
    vuetify: {
			// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
		}
  }
});
