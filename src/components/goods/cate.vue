<template>
  <div>
    <!--面包削导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图-->
    <el-card>
      <!--添加角色按钮-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialogVisible">添加分类</el-button>
        </el-col>
      </el-row>
      <!--商品列表视图-->
      <tree-table :data="catesList"
                  :columns="columns"
                  :selection-type="false"
                  :expand-type="false"
                  :show-index="true"
                  index-text="#"
                  border
                  class="treeTable">
        <!--是否有效-->
        <!--v-slot语法的使用-->
        <template v-slot:isOk="scope">
<!--          <template #isOk="scope">-->
<!--        <template slot="isOk" slot-scope="scope">-->
          <i class="el-icon-success"
             v-if="scope.row.cat_deleted===false"
             style="color: lightblue"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!--排序-->
        <template #order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!--操作-->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini"  @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

<!--      分页区域-->
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="querInfo.pagenum"
              :page-sizes="[3, 5, 10, 20]"
              :page-size="querInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>
    </el-card>

    <!--添加分类的对话框-->
    <el-dialog
            title="添加分类"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addCateDialogClosed">
      <!--添加分类的表单-->
      <el-form :model="addCateForm"
               :rules="addCateFormRules"
               ref="addCateFormRef"
               label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类">
          <!--options 用来指定数据源-->
          <!--options 用来指定配置对象-->
          <el-cascader
                  expandTrigger="hover"
                  v-model="selectedKeys"
                  :options="parentCateList"
                  :props="cascaderProps"
                  @change="parentCateChange"
                  clearable
                  change-on-select>
          </el-cascader>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>

    <!--修改用户的对话框-->
    <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="50%">
      <el-form
              :model="editCateForm"
              :rules="editCateFormRules"
              ref="editCateFormRef"
              label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="eidtCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "cate",
    data(){
      return{
        //控制添加分类对话框的显示和隐藏
        addDialogVisible:false,
        //商品分类的数据
        catesList:[],
        //查询条件
        querInfo:{
          type:3,
          pagenum:1,
          pagesize:5
        },
        //总数据条数
        total:0,
        //为table指定列的定义
        columns:[
          {
            label:'分类名称',
            prop:'cat_name'
          },
          {
            label:'是否有效',
            //将当前列定义为模板列
            type:'template',
            //表示当前这一列使用的模板名称
            template:'isOk',
          },
          {
            label:'排序',
            type:'template',
            template:'order',
          },
          {
            label:'操作',
            type:'template',
            template:'opt',
          },
        ],
        //添加分类的表单数据对象
        addCateForm:{},
        //添加分类的分类名称
        cat_name:{},
        //添加分类的分类父 ID
        cat_pid:0,
        //添加分类的分类层级,默认是1级
        cat_level:0,
        //添加分类表单的验证规则对象
        addCateFormRules:{
          cat_name:[
            {required:true, message:'请输入分类名称', trigger:'blur'},
          ]
        },
        //父级分类列表存放的数据
        parentCateList:[],
        //指定级联选择器的配置对象
        cascaderProps:{
          value:'cat_id',
          label:'cat_name',
          children:'children'
        },
        //选择的父级分类的id数组
        selectedKeys:[],
        //查询到的用户信息保存对象
        editCateDialogVisible: false,
        // 编辑分类表单验证
        editCateFormRules: {
          cat_name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' }
          ]
        },
        // 编辑表单 绑定对象
        editCateForm: ''
      }
    },
    created() {
      this.getCateList()
    },
    methods:{
      async getCateList(){
        const {data:res} = await this.$http.get(
            `categories`,{params:this.querInfo}
            )
        if (res.meta.status!==200){
          return this.$message.error('获取商品分类失败')
        }else {
          //把数据列表赋值给catelist
          this.catesList=res.data.result
          //把总数据条数赋值
          this.total = res.data.total
        }
      },
      //监听pagesize事件
      handleSizeChange(newSize){
        this.querInfo.pagesize = newSize
        this.getCateList()
      },
      //监听pagenum的改变
      handleCurrentChange(newPage){
        this.querInfo.pagenum = newPage
        this.getCateList()
      },
      //点击添加分类按钮，显示对话框
      showAddDialogVisible(){
        //先获取父类分类的数据列表
        this.getParentCateList()
        //再展示出对话框
        this.addDialogVisible=true
      },
      //获取父级分类的数据列表
      async getParentCateList(){
        const {data:res} = await this.$http.get(
            'categories',
            {params:{type:2}
            })
        if (res.meta.status !==200){
          return this.$message.error('获取父级分类数据失败')
        }else {
          this.parentCateList=res.data
          // console.log(res.data);
        }
      },
      //复联选择项中发生变化触发这个函数
      parentCateChange(){
        console.log(this.selectedKeys);
        //如果selectedKeys中的length>0,则表示选中父级分类，反则没有选中
        if (this.selectedKeys.length>0){
          //父级分类的id
          this.addCateForm.cat_pid=this.selectedKeys[
              this.selectedKeys.length-1
              ]
          //为当前分类的等级赋值
          this.addCateForm.cat_level = this.selectedKeys.length
          return
        }else {
          //父级分类的id
          this.addCateForm.cat_pid=0
          //为当前分类的等级赋值
          this.addCateForm.cat_level = 0
        }
      },
      //点击按钮，添加新的分类
       addCate(){
        this.$refs.addCateFormRef.validate(async valid=>{
          if (!valid){return}else {
            const {data:res} = await this.$http.post(
                `categories`,this.addCateForm)
            if (res.meta.status!==201){
              return this.$message.error('添加分类失败！')
            }else {
              this.$message.success('添加分类成功！')
              this.getCateList()
              this.addDialogVisible = false
            }
          }
        })
        // console.log(this.addCateForm);

      },
      //监听添加分类对话框关闭的事件，重置表单数据
      addCateDialogClosed(){
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys = []
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      },
      // 显示编辑对话框
      async showEditCateDialog (id) {
        const { data: res } = await this.$http.get('categories/' + id)
        if (res.meta.status !== 200) return this.$message.error('获取分类失败！')
        this.editCateForm = res.data
        this.editCateDialogVisible = true
      },
      //监听修改角色对话框的关闭事件
      async editDialogClosed(){
        this.$refs.editFormRef.resetFields()
      },
      // 编辑分类名
      eidtCate () {
        this.$refs.editCateFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id,
              {
                cat_name: this.editCateForm.cat_name
              })
          if (res.meta.status !== 200) return this.$message.error('更新分类名失败！')
          this.$message.success('更新分类名成功！')
          this.getCateList()
          this.editCateDialogVisible = false
        })
      },
      //根据id删除对应的用户信息
      async removeCateById(id){
        //弹框询问是否继续
        const confirmResult = await this.$confirm('此操作将永久删除该分类名称，是否继续', '提示', {
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
          const {data:res} = await this.$http.delete('categories/'+id)
          if (res.meta.status!==200){
            return this.$message.error('删除该用户失败')
          }else {
            this.$message.success('删除该用户成功')
            this.getCateList()
          }
        }
      },

    }
  }
</script>

<style scoped>
  .treeTable{
    margin-top: 15px;
  }
  .el-cascader{
    width: 100%;
  }
</style>