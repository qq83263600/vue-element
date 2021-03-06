import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login'
import Home from '../components/home'
import Welcome from '../components/welcome'
import Users from '../components/user/Users'
import Rights from '../components/power/rights'
import Roles from '../components/power/roles'
import Cate from '../components/goods/cate'
import Params from '../components/goods/params'

Vue.use(VueRouter)

  const routes = [
    {path:'/', redirect:'./login'},
    {path:'/login', component:Login},
    {path:'/home',
      component:Home,
      redirect:'/welcome',
      children:[
        {path:'/welcome', component:Welcome},
        {path:'/users', component:Users},
        {path:'/rights', component:Rights},
        {path:'/roles', component:Roles},
        { path: '/categories', component: Cate }
      ]},

]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  //to,代表将要访问的路径
  //form,代表在哪里路径开始跳转
  //next 是函数，代表放行
  //next（）放行   next（./login）强制跳转
  if (to.path=='/login'){return next();}
  //获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr){
    return next('/login');
  }else {
    return next();
  }
})

export default router
