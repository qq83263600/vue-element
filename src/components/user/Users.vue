<template>
  <div>
    <!--面包削导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card >
      <!--搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.query"
                    clearable
                    @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>

      <!--用户列表区域-->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" >
          <!--接收当前作用域的数据 slot-scope="scope"-->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!--修改按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!--删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!--分配角色按钮-->
            <el-tooltip  effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning"
                         icon="el-icon-setting"
                         size="mini"
                          @click="setRole(scope.row)"></el-button>
            </el-tooltip>

          </template>
        </el-table-column>
      </el-table>

      <!--分页-->
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[1, 2, 5, 10]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>
    </el-card>
    <!--添加用户的对话框-->
    <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
      <!--内容主体区域-->
      <el-form :model="addForm"
               :rules="addFormRules"
               ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>

        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>

    <!--修改用户的对话框-->
    <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed">
      <el-form :model="editForm"
               :rules="editFormRules"
               ref="editFormRef"
               label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" ></el-input>
        </el-form-item>

        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile" ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
    </el-dialog>

    <!--分配角色的对话框-->
    <el-dialog
            title="分配角色"
            :visible.sync="setRoleDialogVisible"
            width="50%"
            @close="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
                    v-for="item in rolesList"
                    :key="item.id"
                    :label="item.roleName"
                    :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name: "Users",
    data(){
      //验证邮箱的规则
      var checkEmail=(rule,value,cb)=>{
        //验证邮箱的正则表达式
        const regEmail =  /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
        if (regEmail.test(value)){
          return cb();
        }else {
          cb(new Error('请输入合法的邮箱'))
        }
      }

      //验证mobile的规则,cb是callback（）回调函数的缩写，可以写成其他
      var checkMobile=(rule,value,cb)=>{
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)){
          return cb();
        }else {
          cb(new Error('请输入合法的邮箱'))
        }
      }
      return{
        //获取用户列表的参数对象
        queryInfo:{
          query:'',
          //当前页数
          pagenum:1,
          //当前每页显示多少天数据
          pagesize:2,
        },
        userList:[],
        total:0,
        //控制添加用户对话框的显示和隐藏
        addDialogVisible:false,
        //添加用户的表单数据
        addForm:{
          username:'',
          password:'',
          email:'',
          mobile:'',
        },
        //添加表单验证规则的对象
        addFormRules:{
          username:[
              //trigger:'blur'，失去焦点时触发
            {required:true, message:'请输入用户名', trigger:'blur'},
            {min:3,max:10,message: '用户名长度在3-10个字符之间',trigger:'blur'},
          ],
          password:[
            {required:true, message:'请输入用户密码', trigger:'blur'},
            {min:6,max:15,message: '用户名长度在6-15个字符之间',trigger:'blur'},
          ],
          email:[
            {required:true, message:'请输入邮箱', trigger:'blur'},
            {validator:checkEmail,trigger:'blur'}
          ],
          mobile:[
            {required:true, message:'请输入手机号', trigger:'blur'},
            {validator:checkMobile,trigger:'blur'}
          ],
        },
        //控制修改用户信息对话框的显示与隐藏
        editDialogVisible:false,
        //查询到的用户信息保存对象
        editForm:{},
        //修改表单的验证规则对象
        editFormRules:{
          email:[
            {required:true, message:'请输入邮箱', trigger:'blur'},
            {validator:checkEmail,trigger:'blur'}
          ],
          mobile:[
            {required:true, message:'请输入手机号', trigger:'blur'},
            {validator:checkMobile,trigger:'blur'}
          ],
        },
        //控制修改角色对话框的显示与隐藏
        setRoleDialogVisible : false,
        //需要被分配角色的用户信息
        userInfo:{},
        // 所有角色的数据列表
        rolesList: [],
        // 已选中的角色Id值
        selectedRoleId:''
      }
    },
    created() {
      this.getUserList()
    },
    methods:{
      async getUserList(){
        const {data:res}=await this.$http.get('users',{params:this.queryInfo})
        // console.log(res);
        if (res.meta.status !==200) {
          return this.$message.error('获取用户列表失败')
        }
        this.userList = res.data.users
        this.total = res.data.total
      },
      //监听pagesize改变的事件
      handleSizeChange(newSize){
        // console.log(newSize);
        this.queryInfo.pagesize=newSize
        this.getUserList()
      },
      //监听页码值改变的事件
      handleCurrentChange(newPage){
        console.log(newPage);
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      //监听switch 开关状态的改变
      async userStateChanged(userinfo){
        const {data:res}=await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        if (res.meta.status!==200){
          userInfo.mg_state = !userInfo.mg_state
          return this.$message.error('更新用户状态信息失败！')
        }
        this.$message.success('更新用户状态信息成功')
      },
      //监听添加用户对话框的关闭事件
      addDialogClosed(){
        this.$refs.addFormRef.resetFields()
      },
      //点击按钮，添加新用户
      addUser(){
        this.$refs.addFormRef.validate(async valid=>{
          if (!valid){
            return
          }else {
            //可以发起添加用户的网络请求
            const {data:res}=await this.$http.post('users',this.addForm)
            if (res.meta.status!==201){
              this.$message.error('添加用户失败！')
            }else {
              this.$message.success('添加用户成功！')
              //添加用户成功后隐藏添加用户的对话框
              this.addDialogVisible = false
              //重写获取用户列表数据
              this.getUserList();
            }
          }
          // console.log(valid);
        })
      },
      //点击修改按钮，展示编辑用户的对话框
      async showEditDialog(id){

        const {data:res} = await this.$http.get('users/'+id)
        if (res.meta.status !==200){
          return this.$message.error('查询用户信息失败')
        }else {
          this.editForm = res.data
        }
        this.editDialogVisible=true;
      },
      //监听修改用户对话框的关闭事件
      async editDialogClosed(){
        this.$refs.editFormRef.resetFields()
      },
      //修改用户信息并提交
      editUserInfo(){
        this.$refs.editFormRef.validate(async valid => {
          if (!valid){
            return
          }else {
            //发起新的用户的网络请求
            const {data:res}=await this.$http.put('users/'+this.editForm.id,{
              email:this.editForm.email,
              mobile:this.editForm.mobile
            })
            if (res.meta.status!==200){
              return this.$message.error('修改用户信息失败！')
            }
              this.$message.success('修改用户信息成功！')
              //修改用户成功后隐藏添加用户的对话框
              this.editDialogVisible = false
              //重写获取用户列表数据
              this.getUserList();
          }
        })
      },
      //根据id删除对应的用户信息
      async removeUserById(id){
        //弹框询问是否继续
        const confirmResult = await this.$confirm('此操作将永久删除该用户，是否继续', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
              type: 'warning',
            }
          ).catch(err=>err)
        //如果用户确定删除，则返回值为字符串confirm
        //如果用户取消了删除，则返回字符串cancel
        // console.log(confirmResult);
        if (confirmResult !=='confirm'){
          return this.$message.info('取消删除成功')
        }else {
          // console.log('确定删除');
          const {data:res} = await this.$http.delete('users/'+id)
          if (res.meta.status!==200){
            return this.$message.error('删除该用户失败')
          }else {
            this.$message.success('删除该用户成功')
            this.getUserList()
          }
        }
      },
      //点击分配用户，展示分配角色对话框
      async setRole(userInfo){
        this.userInfo = userInfo
        // console.log(userInfo);
        //在展示对话框之前，获取所有角色的列表
        const {data:res} = await this.$http.get(`roles`)
        // console.log(res);
        if (res.meta.status!==200){
          return this.$message.error('获取角色列表失败')
        }else {
          this.rolesList = res.data
          console.log(this.rolesList);
        }
        this.setRoleDialogVisible=true
      },
      //点击按钮角色分配，
      async saveRoleInfo(){
        if (!this.selectedRoleId){
          return this.$message.error('请选择需要分配的角色')
        }else {
          //获取分配用户角色地址
         const {data:res}=await this.$http.put(
             `users/${this.userInfo.id}/role`,
             {rid:this.selectedRoleId}
             )
          if (res.meta.status!==200){
            return this.$message.error('更新角色失败')
          }else {
            this.$message.success('更新角色成功！')
            this.getUserList()
            this.setRoleDialogVisible=false
          }
        }
      },
      //监听分配角色对话框的关闭事件
      setRoleDialogClosed(){
        //关闭时将selectedRoleId和userInfo重置为空对象
        this.selectedRoleId = ''
        this.userInfo = {}
      },
    }
  }
</script>

<style lang="less" scoped>

</style>