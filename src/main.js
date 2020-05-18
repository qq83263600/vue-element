import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
//导入
import TreeTable from 'vue-table-with-tree-grid'


import axiox from "axios"
//配置请求的根路径
axiox.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
axiox.interceptors.request.use(config=>{
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //在最后必须return
  return config;
})
Vue.prototype.$http = axiox

Vue.config.productionTip = false

Vue.component('tree-table',TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
