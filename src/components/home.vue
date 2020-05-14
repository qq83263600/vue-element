<template>
  <div>
    <el-button type="warning" @click="logOut">退出按钮</el-button>
  </div>
</template>

<script>
  export default {
    name: "home",
    methods:{
      logOut(){
        window.sessionStorage.clear();
        this.$router.push('/login')
      }
    }
  }
</script>

<style scoped>

</style>