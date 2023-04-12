<template>
  <div class="boxs">
    <el-form
        :model="queryParams"
        ref="queryForm"
        :inline="true"
    >
      <el-form-item label="角色名称" prop="name">
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
    <el-button icon="el-icon-plus" type="primary" plain size="small" @click="openDialog">添加角色</el-button>
    <el-table :data="rolesArr" v-loading="loading">
      <el-table-column label="编号" prop="id" align="center" width="60" />
      <el-table-column label="角色名称" prop="name" align="center">
        <template slot-scope="scope"  >
          {{ scope.row.name }}
          <el-tag v-if="scope.row.roleKey === 'admin'" size="mini" effect="dark"
            >超级管理员</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column label="权限字符" prop="roleKey" align="center"  />
      <el-table-column label="创建时间" prop="roleKey" align="createTime" :formatter="formatterCreateTime"  />
      <el-table-column  width="200" label="操作">
        <template slot-scope="scope" v-if="scope.row.roleKey !== 'admin'">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.page"
        :limit.sync="queryParams.size"
        @pagination="getRoles"
    />

    <el-dialog title="提示" :visible.sync="dialogVisible" width="40%">
      <el-form class="demo-form-inline" label-width="80px" :model="form" :rules="rules" ref="form">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限字符" prop="roleKey">
          <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="菜单权限" prop="roles">
          <el-tree
            ref="tree"
            :data="routerMenu"
            :props="props"
            show-checkbox
            :check-on-click-node="true"
            node-key="id"
            :default-checked-keys="checkedRoles"
            :default-expanded-keys="checkedRoles"
            @check-change="handleCheckChange"
            @check="handleClick"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer" v-loading="addLoading">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button :type="form.id ? 'warning' : 'primary'" @click="affirm">{{
          form.id ? "确认修改" : "确认添加"
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getRouterSystem, getRoles, addRoles, upRoles, delRoles } from "@/api/admin";
import {formatDate} from "@/utils";
export default {
  name:"Role",
  data() {
    return {
      queryParams:{
        page:1,
        size:10
      },
      total:0,
      loading:false,
      addLoading:false,
      dialogVisible: false,
      routerMenu: [],
      props: {
        label: (t) => t.meta.title,
        children: "children",
      },
      form:{},
      rules:{
        name:[
          { required: true, message: '请输入角色名称', trigger: 'blur' },
        ],
        roles:[
          { required: true, message: '请选择菜单权限', trigger: 'change' },
        ]
      },
      rolesArr: [],
      search: "",
      name: "",
      roles: [],
      checkedRoles: [],
      id: undefined,
    };
  },
  created() {
    this.getRouterSystem();
    this.getRoles();
  },
  methods: {
    formatterCreateTime(row){
      return formatDate(row.createTime);
    },
    handleDelete(index, row) {
      this.$confirm("此操作将永久删除该角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error",
      }).then(async () => {
        await delRoles({ id: row.id });
        this.getRoles();
        this.$message({
          message: "删除成功！",
          type: "success",
        });
      });
    },
    handleEdit(index, row) {
      const {  roles } = row;
      const checkedRoles = row.checkedRoles.split(",");
      const rolesArr = roles.split(",");
      this.form={...row};
      this.roles = rolesArr;
      this.dialogVisible = true;
      this.$nextTick(()=>{
        this.$refs.tree.setCheckedKeys([]);
        this.checkedRoles = checkedRoles;
      })
    },
    async affirm() {
      let roles=this.$refs.tree.getCheckedNodes(false,true).map(t=>t.id);
      let checkedRoles=this.$refs.tree.getCheckedKeys(true);
      this.$set(this.form,"roles",roles.toString())
      this.form.checkedRoles = checkedRoles.toString();
      this.$refs.form.validate(async (validate)=>{
        if(!validate) return;
        try {
          this.addLoading=true;
          this.form.id && await upRoles(this.form);
          !this.form.id &&await addRoles(this.form);
          this.addLoading=false;
          this.$message({
            message: this.form.id ? "修改成功" : "添加成功！",
            type: "success",
          });
          this.clearEvent();
          this.getRoles();
          this.dialogVisible = false;
        }catch (e) {
          this.addLoading=false;
        }
      })

    },
    clearEvent() {
      this.$nextTick(()=>{
        this.$refs.tree.setCheckedKeys([]);
      });
      this.form={};
      this.roles = [];
    },
    openDialog() {
      this.dialogVisible = true;
      this.clearEvent();
    },
    async getRoles() {
      this.loading=true;
      const {data,total} = await getRoles(this.queryParams);
      this.loading=false;
      this.rolesArr = data;this.total=total;
    },
    handleQuery(){
      this.queryParams.page=1;
      this.getRoles();
    },
    async getRouterSystem() {
      const {data} = await getRouterSystem();
      const { routerMenu } = data;
      this.routerMenu = routerMenu;

    },
    handleCheckChange(data, checked, indeterminate) {
    },
    handleClick(data, checked) {
      this.roles = checked.checkedNodes;
    },
  },
};
</script>
<style scoped lang="scss">
.boxs {
  padding: 20px;
}
</style>
