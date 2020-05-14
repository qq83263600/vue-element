import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

import './assets/css/global.css'

import axiox from "axios"
//配置请求的根路径
axiox.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axiox

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
