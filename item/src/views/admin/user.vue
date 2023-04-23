<template>
  <div class="boxs">
    <el-form
        :model="queryParams"
        ref="queryForm"
        :inline="true"
    >
      <el-form-item label="用户名称" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入名称"
            clearable
            size="small"
        />
      </el-form-item>
      <el-form-item>
        <el-button
            type="primary"
            icon="el-icon-search"
            size="small"
            @click="handleQuery"
        >搜索</el-button>
      </el-form-item>
    </el-form>
    <el-button icon="el-icon-plus" type="primary" plain size="small" @click="openDialog">添加用户</el-button>

    <el-table :data="userArr" style="width: 100%" v-loading="loading">
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="用户名称" align="center" prop="name">
        <template slot-scope="scope">
          {{scope.row.name}} <el-tag v-if="scope.row.admin===1" size="mini" effect="dark">超级管理员</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="name">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status===1" size="mini" effect="dark">正常</el-tag>
          <el-tag v-else size="mini" effect="dark" type="danger">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="账号归属" align="center" prop="name" :formatter="formatMore" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="formatterCreateTime" />
      <el-table-column label="操作" align="center" width="350">
        <template slot-scope="scope">
          <el-button size="mini" v-if="scope.row.admin!==1" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button size="mini" @click="upUserPwd(scope.row)" type="warning" icon="el-icon-edit">修改密码</el-button>
          <el-button size="mini" v-if="scope.row.admin!==1" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          <el-button size="mini" @click="upTheme(scope.row)" type="text" icon="el-icon-edit" >主题修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.page"
        :limit.sync="queryParams.size"
        @pagination="getUser"
    />
    <el-dialog title="操作框" :visible.sync="dialogVisible" width="40%">
      <el-form class="demo-form-inline" label-width="80px" :model="form" :rules="rules" ref="ruleForm">
        <el-form-item label="用户名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入用户名称" />
        </el-form-item>

        <el-form-item label="用户密码" prop="pwd" v-if="!form.id">
          <el-input  v-model="form.pwd" placeholder="请输入密码">
          </el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status" >
          <el-select v-model="form.status" placeholder="请选择状态" >
            <el-option  label="正常" :value="1">
            </el-option>
            <el-option  label="禁用" :value="0">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色选择" prop="rolesId" v-if="form.admin!==1">
          <el-select v-model="form.rolesId" filterable placeholder="请选择角色" multiple>
            <el-option v-for="item in rolesArr" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账号归属" prop="moreId" v-if="form.admin!==1">
          <el-select v-model="form.moreId" filterable placeholder="请选择账号">
            <el-option v-for="item in moreArr" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer" v-loading="addLoading">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button :type="form.id ? 'warning' : 'primary'" @click="affirm">{{
            form.id ? "确认修改" : "确认添加"
        }}</el-button>
      </div>
    </el-dialog>

    <el-dialog title="主题修改" :visible.sync="themeOpen" width="500" >
      <el-form class="demo-form-inline" label-width="80px" :model="form" ref="themeForm" >
        <div style="text-align: center;margin-bottom: 30px;" @click="defaultTheme"><el-button type="primary" size="mini" plain>恢复默认主题</el-button></div>
        <el-row style="text-align: center">
          <el-col :span="4">
            <div class="color-title">默认背景</div>
            <el-color-picker v-model="form.menuBg" @change="changeColor($event,'--menuBg-color')"  class="color-picker"  popper-class="theme-picker-dropdown" ></el-color-picker>
          </el-col>
          <el-col :span="4">
            <div class="color-title">展开背景</div>
            <el-color-picker v-model="form.menuSubBg" @change="changeColor($event,'--menuSubBg-color')"  class="color-picker"  popper-class="theme-picker-dropdown" ></el-color-picker>
          </el-col>
          <el-col :span="4">
            <div class="color-title">默认文字</div>
            <el-color-picker v-model="form.menuText" @change="changeColor($event,'--menuText-color')"  class="color-picker"  popper-class="theme-picker-dropdown" ></el-color-picker>
          </el-col>
          <el-col :span="4">
            <div class="color-title">选中文字</div>
            <el-color-picker v-model="form.menuActiveText" @change="changeColor($event,'--menuActiveText-color')"  class="color-picker"  popper-class="theme-picker-dropdown" ></el-color-picker>
          </el-col>
          <el-col :span="4">
            <div class="color-title">当前选中展开文字</div>
            <el-color-picker v-model="form.menuSubActiveText" @change="changeColor($event,'--menuSubActiveText-color')"  class="color-picker"  popper-class="theme-picker-dropdown" ></el-color-picker>
          </el-col>
          <el-col :span="4">
            <div class="color-title">hover背景</div>
            <el-color-picker v-model="form.menuHoverBg" @change="changeColor($event,'--menuHoverBg-color')"  class="color-picker"  popper-class="theme-picker-dropdown" ></el-color-picker>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer" v-loading="addLoading">
        <el-button @click="$router.go(0)">取 消</el-button>
        <el-button type="primary" @click="changeTheme">确认修改</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {getUser, addUser, upUser, delUser, getMoreAll, upUserPwd, getRolesAll,upTheme} from '@/api/admin';
import {formatDate} from "@/utils";
import md5 from 'js-md5';
export default {
  name:"User",
  data () {
    return {
      queryParams:{
        page:1,
        size:10
      },
      total:0,
      loading:false,
      addLoading:false,
      userArr: [],
      dialogVisible: false,
      themeOpen:false,
      rolesArr: [],
      moreArr: [],
      search: '',
      form: {
      },
      rules: {
        name: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ],
        pwd: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' },
        ],
        rolesId: [
          { required: true, message: '请选择用户角色', trigger: 'change' }
        ],
        moreId: [
          { required: true, message: '请选择归属账号', trigger: 'change' }
        ],
      },
    }
  },
  async created () {
    await this.getRoles();
    await this.getMoreAll();
    this.getUser()
  },
  methods: {
    formatterCreateTime(row){
      return formatDate(row.createTime);
    },
    formatMore (row) {
      if(row.admin===1) return "总管理";
      let res = this.moreArr.filter(t => t.id == row.moreId);
      if (res.length == 0) return "“账号不存在”"
      return res[0].name
    },
    handleDelete (index, row) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(async () => {
        await delUser({ id: row.id });
        this.getUser();
        this.$message({
          message: '删除成功！',
          type: 'success'
        });
      })
    },
    resetForm () {
      this.form = {status:1};
    },
    handleEdit (index, row) {
      this.resetForm();
      this.form = {...row};
      this.$set(this.form, "rolesId", row.rolesId.split(","));
      this.dialogVisible = true;
    },
    async affirm () {
      this.$refs['ruleForm'].validate(async (valid) => {
        if (!valid) return;
        try {
          this.addLoading=true;
          let rolesId=this.form.rolesId.join(",");
          !this.form.id&& await addUser({...this.form,rolesId,pwd:md5(this.form.pwd)});
          this.form.id&& await upUser({ ...this.form,rolesId});
          this.addLoading=false;
          this.$message.success(this.form.id?'修改成功！':'添加成功！');
          this.getUser();
          this.dialogVisible = false;
        }catch (e) {
          this.addLoading=false;
        }

      });
    },
    upUserPwd(row){
      let {name,admin}=row;
      this.$prompt(admin===1?`当前修改的是《总管理》密码，请务必再次确认！`:`当前修改的是《${name}》密码`, '温馨提示', {
        confirmButtonText: '确定修改',
        cancelButtonText: '取消',
        inputPattern: /.{6,15}/,
        inputErrorMessage: '密码6-15位密码'
      }).then(async ({ value }) => {
        await upUserPwd({id:row.id,pwd:md5(value)});
        this.$message.success("修改成功！");
        if(admin===1){
          this.$store.dispatch("user/logout");
          this.$router.replace("/login");
        }
      })
    },
    upTheme(row){
      this.form={...row};
      this.themeOpen=true;
    },
    changeColor(val,name){
      document.getElementsByTagName('body')[0].style.setProperty(name,val);
      name==='--menuBg-color'&&this.$store.dispatch('settings/changeSetting', {
        key: 'theme',
        value: val
      });
    },
    async changeTheme(){
      try {
        this.addLoading=true;
        await upTheme(this.form);
        this.addLoading=false;
        this.themeOpen=false;
        this.$message.success("修改主题成功！");
        this.$router.go(0);
      }catch (e) {
        this.addLoading=false;
      }
    },
    defaultTheme(){
      let theme={
        "menuBg":{val:"#304156",name:"--menuBg-color"},
        "menuSubBg":{val:"#304156",name:"--menuSubBg-color"},
        "menuText":{val:"#bfcad5",name:"--menuText-color"},
        "menuActiveText":{val:"#409eff",name:"--menuActiveText-color"},
        "menuSubActiveText":{val:"#fff",name:"--menuSubActiveText-color"},
        "menuHoverBg":{val:"#001528",name:"--menuHoverBg-color"},
      };

      for (const themeKey in theme) {
        this.changeColor(theme[themeKey].val,theme[themeKey].name);
        this.form[themeKey]=theme[themeKey].val;
      }
    },
    openDialog () {
      this.resetForm();
      this.dialogVisible = true
    },
    async getRoles () {
      const {data} = await getRolesAll();
      this.rolesArr = data.map(t=>{t.id=t.id.toString(); return t});
    },
    async getMoreAll () {
      const {data} = await getMoreAll();
      this.moreArr = data;
    },
    async getUser () {
      this.loading=true;
      const {data,total} = await getUser(this.queryParams);
      this.loading=false;
      this.userArr = data;this.total=total;
    },
    handleQuery(){
      this.queryParams.page=1;
      this.getUser();
    }
  }
}
</script>
<style scoped lang="scss">
.boxs {
  padding: 20px;
}
.color-title{
  margin-bottom: 10px;
  color: #000;
}
</style>
