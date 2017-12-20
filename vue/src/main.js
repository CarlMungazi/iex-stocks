// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import state from './state'

Vue.config.productionTip = false

Vue.prototype.$appState = state

/* eslint-disable no-new */
new Vue({
  	el: '#app',
  	template: '<App/>',
  	components: { App }
})
