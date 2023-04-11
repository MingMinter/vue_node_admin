<template>
  <div class="boxs">
    <el-form
        :model="queryParams"
        ref="queryForm"
        :inline="true"
    >
      <el-form-item label="字典名称" prop="name">
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
    <el-button icon="el-icon-plus" type="primary" plain size="small" @click="add">新增</el-button>
    <el-table :data="list" style="margin-top: 15px" v-loading="loading">
      <el-table-column label="编号" align="center" width="100" prop="id" />
      <el-table-column label="测试账号名称" align="center" prop="name"></el-table-column>
      <el-table-column label="字典类型" align="center" prop="type">
        <template slot-scope="scope">
          <el-link type="primary" @click="goDictList(scope.row)"> {{scope.row.type}} <i class="el-icon-view el-icon--right"></i></el-link>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="formatterCreateTime" />
      <el-table-column label="操作" align="center" >
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete( scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.page"
        :limit.sync="queryParams.size"
        @pagination="getDict"
    />

    <el-dialog title="操作框" :visible.sync="open" width="40%">
      <el-form class="demo-form-inline" label-width="100px" :model="form" :rules="rules" ref="form">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="type">
          <el-input v-model="form.type" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input type="textarea" v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer" v-loading="addLoading">
        <el-button @click="open = false">取 消</el-button>
        <el-button :type="form.id ? 'warning' : 'primary'" @click="affirm">{{
            form.id ? "确认修改" : "确认添加"
          }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {addDict,getDict,upDict,delDict} from "@/api/admin";
import {formatDate} from "@/utils";

export default {
  name: "Dict",
  data(){
    return {
      queryParams:{
        page:1,
        size:10
      },
      total:0,
      loading:false,
      addLoading:false,
      list:[],
      open:false,
      form:{},
      rules:{
        name:[
          { required: true, message: '请输入字典名称', trigger: 'blur' },
        ],
        type:[
          { required: true, message: '请输入字典类型', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getDict();
  },
  methods:{
    affirm(){
      this.$refs.form.validate(async (validate)=>{
        if(!validate) return;
        try {
          this.addLoading=true
          !this.form.id&&await addDict(this.form);
          this.form.id&&await upDict(this.form);
          this.addLoading=false;
          this.getDict();
          this.open=false;
          this.$message.success(this.form.id?"修改成功！":"新增成功！");
        }catch (e) {
          this.addLoading=false;
        }
      })
    },
    add(){
      this.form={};
      this.open=true;
    },
    async getDict(){
      this.loading=true;
      let {data,total}=await getDict(this.queryParams);
      this.loading=false;
      this.list=data;this.total=total;
    },
    handleQuery(){
      this.queryParams.page=1;
      this.getDict();
    },
    handleEdit(row){
      this.form={...row};
      this.open=true;
    },
    handleDelete(row){
      this.$confirm(`是否删除《${row.name}》字典？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await delDict(row);
        this.getDict();
        this.$message.success("删除成功！");
      })
    },
    goDictList(row){
      this.$router.push({path:"/menus/dict/dictItem",query:{id:row.id}})
    },
    formatterCreateTime(row){
      return formatDate(row.createTime);
    }
  }
}
</script>

<style scoped>

</style>
