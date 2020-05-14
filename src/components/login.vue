<template>
  <div class="login">
    <div class="login_box">
      <!--头像-->
      <div class="avatar_box">
        <img src="../assets/img/abc.jpg" alt="">
      </div>
      <!--表单-->
      <el-form ref="loginFromRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
        <!--username-->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid"></el-input>
        </el-form-item>
        <!--password-->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <!--button-->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="danger" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: "login",
    data(){
      return{
        //登录表单数据的绑定对象
        loginForm:{
          username:'admin',
          password:'123456',
        },
        //表单验证的规则对象
        loginFormRules:{
          //验证username
          username:[
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
          ],
          //验证password
          password:[
            { required: true, message: '请输入用户密码', trigger: 'blur' },
            { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
          ]
        }
      }
    },
    methods:{
      //点击重置按钮
      resetLoginForm(){
        this.$refs.loginFromRef.resetFields();
      },
      login(){
        this.$refs.loginFromRef.validate(async valid=>{
          // console.log(valid);
          if (!valid)return;
          const {data:res}=await this.$http.post('login',this.loginForm)

          if(res.meta.status!==200)return this.$message.error('登录失败');
          this.$message.success('登录成功');
          //1.将登录成功之后的token，保存到客户端的sessionStorage中
          //1.1项目中除了登录之外的其他api接口，必须在登录之后才能访问
          //1.2token只能在当前网站打开期间生效，所以讲token保存在sessionStorage中
          window.sessionStorage.setItem("token",res.data.token);
          //2.通过编程式导航跳转到后台主页，路由地址是/home
          this.$router.push('./home')
        });
      }
    }
  }
</script>

<style lang="less" scoped>
  .login{
    background-color: #2b4b6b;
    height: 100%;
  }
  .login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);

    .avatar_box{
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 #ddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%,-50%);
      background-color: #fff;
      img{
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eeeeee;
      }
    }
  }
  .btns{
    display: flex;
    justify-content: flex-end;
  }
  .login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
</style>