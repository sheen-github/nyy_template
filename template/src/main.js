import Vue from 'vue'
import App from './App'
import router from './router'
import Vuex from 'vuex'
import store from  './store/store'
Vue.use(Vuex)
Vue.config.productionTip = false

new Vue({
  el: '#app',
  store,
  router,
  {{#if_eq build "runtime"}}
  render: h => h(App)，
  {{/if_eq}}
  {{#if_eq build "standalone"}}
  components: { App },
  template: '<App/>'
  {{/if_eq}}
})