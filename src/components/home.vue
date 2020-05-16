<template>
  <el-container class="home-container">
    <!--头部-->
    <el-header>
      <div>
        <img src="../assets/img/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logOut">退出按钮</el-button>
    </el-header>
    <!--页面主体-->
    <el-container>
      <!--左栏-->
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button" @click="toggleClollapse">|||</div>
        <!--左栏菜单区域-->
        <!--unique-opened是element UI的方法-->
        <el-menu
                background-color="#333744"
                text-color="#fff"
                active-text-color="#409eff"
                :unique-opened="true"
                :collapse="isCollapse"
                :collapse-transition="false"
                :router="true"
                :default-active="activePath">
          <!--1级菜单-->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <!--1级菜单的模板区域-->
            <template slot="title">
              <!--图标-->
              <i :class="iconsObj[item.id]"></i>
              <!--文本-->
              <span>{{item.authName}}</span>
            </template>

            <!--二级菜单-->
            <el-menu-item
                    :index="'/'+subItem.path+''"
                    v-for="subItem in item.children"
                    :key="subItem.id"
            @click="saveNavState('/'+subItem.path)">
              <template slot="title">
                <!--图标-->
                <i class="el-icon-menu"></i>
                <!--文本-->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--右栏-->
      <el-main>
        <!--路由占位栏-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: "home",
    data(){
      return{
        menuList:[],
        iconsObj: {
          '125': 'iconfont icon-user',
          '103': 'iconfont icon-tijikongjian',
          '101': 'iconfont icon-shangpin',
          '102': 'iconfont icon-danju',
          '145': 'iconfont icon-baobiao'
        },
        //是否收起左边栏
        isCollapse:false,
        //被激活的链接地址
        activePath:''
      }
    },
    //生命周期函数，此网页打开时才有效
    created() {
      this.getMenuList(),
      this.activePath=window.sessionStorage.getItem('activePath')
    },
    methods:{
      logOut(){
        window.sessionStorage.clear();
        this.$router.push('/login')
      },
      async getMenuList() {
        const { data: res } = await this.$http.get('menus')
        if (res.meta.status !==200)return this.$message.error(res.meta.msg)
        this.menuList = res.data
    // console.log(res);
      },
      //点击后收起左侧菜单栏
      toggleClollapse(){
        this.isCollapse=!this.isCollapse
      },
      //保存链接激活的状态
      saveNavState(activePath){
        window.sessionStorage.setItem('activePath',activePath)
        this.activePath=activePath
      }
    }
  }
</script>

<style scoped>
  .home-container{
    height: 100%;
  }
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
  > div {
    display: flex;
    align-items: center;
  span {
    margin-left: 15px;
  }
  }
  }

  .el-aside {
    background-color: #333744;
  .el-menu {
    border-right: none;
  }
  }
  .el-main{
    background-color: #eaedf1;
  }
  .iconfont{
    margin-right: 10px;
  }
  .toggle-button{
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
  ;
  }
</style>