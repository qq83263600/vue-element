<template>
  <div>
    <!--面包削导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图-->
    <el-card>
<!--添加角色按钮-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!--角色列表视图-->
      <el-table :data="rolesList" border stripe>
        <!--展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1,index1) in scope.row.children"
                    :key="item1.id"
                    :class="['dbbottom',index1 ===0?'dbtop':'','vcenter']">
              <!--渲染一级权限-->
              <el-col :span="5" >
                <el-tag closable
                        @close="removeRightByID(scope.row,item1.id)">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right" ></i>
              </el-col>
              <!--渲染二，三级权限-->
              <el-col :span="19">
                <!--for循环嵌套渲染二级权限-->
                <el-row v-for="(item2,index2) in item1.children"
                        :key="item2.id"
                        :class="[index2 ===0?'':'dbtop','vcenter']">
                  <!--渲染二级权限-->
                  <el-col :span="6">
                    <el-tag type="success"
                            closable
                            @close="removeRightByID(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right" ></i>
                  </el-col>
                  <!--渲染三级权限-->
                  <el-col :span="18">
                    <el-tag v-for="(item3,index3) in item2.children"
                            type="warning"
                            :key="item3.id"
                            closable
                            @close="removeRightByID(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

          </template>
        </el-table-column>
<!--        索引列-->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-select" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--添加用户的对话框-->
    <el-dialog
            title="添加角色"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
      <!--内容主体区域-->
      <el-form :model="addForm"
               :rules="addFormRules"
               ref="addFormRef"
               label-width="70px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>

        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>

      </el-form>
<!--      底部区域-->
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
        <el-form-item label="角色名">
          <el-input v-model="editForm.roleName" disabled></el-input>
        </el-form-item>

        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc" ></el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
    </el-dialog>

    <!--分配权限的对话框-->
    <el-dialog
            title="分配权限"
            :visible.sync="SetRightDialogVisible"
            width="60%"
            @close="SetRightDialogClosed">
      <!--树形控件-->
      <el-tree :data="rightslist"
               :props="treeProps"
               show-checkbox
               node-key="id"
               default-expand-all
               :default-checked-keys="defKeys"
                ref="treeRef">

      </el-tree>

      <span slot="footer" class="dialog-footer">
    <el-button @click="SetRightDialogVisible = false">取 消</el-button>
    <el-button type="primary"
               @click="allotRights">
      确 定
    </el-button>
  </span>
    </el-dialog>


  </div>
</template>

<script>
  export default {
    name: "roles",
    data(){
      return{
        rolesList:[],
        //控制添加用户对话框的显示和隐藏
        addDialogVisible:false,
        //添加角色的表单数据
        addForm:{
          roleName:'',
          roleDesc:'',
        },
        //添加表单验证规则的对象
        addFormRules:{
          roleName:[
            //trigger:'blur'，失去焦点时触发
            {required:true, message:'请输入角色名', trigger:'blur'},
            {min:1,max:10,message: '用户名长度在3-10个字符之间',trigger:'blur'},
          ],
          roleDesc:[
            {required:true, message:'请输入角色描述', trigger:'blur'},
            {min:2,max:15,message: '角色描述长度在2-15个字符之间',trigger:'blur'},
          ],
        },
        //查询到的用户信息保存对象
        editForm:{},
        //修改表单的验证规则对象
        editFormRules:{
          roleDesc:[
            {required:true, message:'请输入描述', trigger:'blur'},
            {trigger:'blur'}
          ],
        },
        //控制修改用户信息对话框的显示与隐藏
        editDialogVisible:false,
        //控制权限分配信息对话框的显示与隐藏
        SetRightDialogVisible:false,
        //查询到的权限分配的数据保存对象
        rightslist: [],
        //树形控件的属性绑定对象
        treeProps:{
          label:'authName',
          children:'children'
        },
        //树形控件中节点id值数组
        defKeys:[],
        //当前即将分配权限的角色id
        roleId:'',
      }
    },
    created() {
      this.getRolesList()
    },
    methods:{
      async getRolesList(){
        const {data:res} = await this.$http.get('roles')
        // console.log(res);
        if (res.meta.status !==200){
          return this.$message.error('获取权限列表信息失败')
        }else {
          this.rolesList = res.data
        }
      },
      //监听添加用户对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      //点击按钮，添加新用户
      addUser(){
        this.$refs.addFormRef.validate(async valid=>{
          if (!valid){
            return
          }else {
            //可以发起添加用户的网络请求
            const {data:res}=await this.$http.post('roles',this.addForm)
            // console.log(res);
            if (res.meta.status!==201){
              this.$message.error('添加角色失败！')
            }else {
              this.$message.success('添加角色成功！')
              //添加用户成功后隐藏添加用户的对话框
              this.addDialogVisible = false
              //重写获取用户列表数据
              this.getRolesList();
            }
          }
        })
      },
      //点击修改按钮，展示编辑用户的对话框
      async showEditDialog(id){

        const {data:res} = await this.$http.get('roles/'+id)
        console.log(res);
        if (res.meta.status !==200){
          return this.$message.error('查询用户信息失败')
        }else {
          this.editForm = res.data
        }
        this.editDialogVisible=true;
      },
      //监听修改角色对话框的关闭事件
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
            const {data:res}=await this.$http.put('roles/'+this.editForm.roleId,{
              roleName:this.editForm.roleName,
              roleDesc:this.editForm.roleDesc,
            })
            console.log(res);
            if (res.meta.status!==200){
              return this.$message.error('修改角色描述失败！')
            }
            this.$message.success('修改角色描述成功！')
            //修改用户成功后隐藏添加用户的对话框
            this.editDialogVisible = false
            //重写获取用户列表数据
            this.getRolesList();
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
          const {data:res} = await this.$http.delete('roles/'+id)
          if (res.meta.status!==200){
            return this.$message.error('删除该用户失败')
          }else {
            this.$message.success('删除该用户成功')
            this.getRolesList()
          }
        }
      },
      //根据id删除对应的权限
      async removeRightByID(role,rightId){
        //弹框提示是否删除
        const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        if (confirmResult !=='confirm'){
          return this.$message.info('取消删除成功！')
        }else {
          const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            if (res.meta.status!==200){
              return this.$message.error('删除权限失败！')
            }else {
              role.children = res.data
            }
        }
      },
      //点击分配权限，展示权限分配的对话框
      async showSetRightDialog(role){
        this.roleId = role.id
        //获取所有权限的数据
        const {data:res} = await this.$http.get('rights/tree')
        // console.log(res);
        if (res.meta.status!==200){
          return this.$message.error('获取权限分配数据失败！')
        }
          //把获取到的数据保存到data中
          this.rightslist = res.data
          // console.log(this.rightslist );
          //递归获取三级节点的ID
          this.getLeafKeys(role,this.defKeys)



        this.SetRightDialogVisible=true
      },
      //监听分配权限对话框的关闭事件
      SetRightDialogClosed(){
        this.defKeys=[]
        // this.$refs.treeRef.resetFields()
      },
      //通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys数组中
      getLeafKeys(node,arr){
        //如果当前node节点不包含children属性，则是三级节点
        if (!node.children){
          return arr.push(node.id)
        }
          //这里的foreach就是遍历，this.getLeafKeys就是递归
          node.children.forEach(item=> this.getLeafKeys(item,arr))
      },
      //权限分配对话框，点击确定为角色分配权限
      async allotRights(){
        const keys=[
            ...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        // console.log(keys);
        const idStr = keys.join(',')
        const {data:res} = await this.$http.post(
            `roles/${this.roleId}/rights`,
            {rids:idStr}
            )
        if (res.meta.status!==200){
          return this.$message.error('分配权限失败')
        }
          this.$message.success('分配权限成功')
          this.getRolesList()
          this.SetRightDialogVisible=false

      },
    }
  }
</script>

<style lang="less" scoped>
.el-tag{
  margin: 7px;
}
  .dbtop{
    border-top: 1px solid #eee;
  }
  .dbbottom{
    border-bottom: 1px solid #eee;
  }
  .vcenter{
    display: flex;
    align-items: center;
  }
</style>