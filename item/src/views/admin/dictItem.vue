<template>
  <div class="boxs">
    <el-form
        :model="queryParams"
        ref="queryForm"
        :inline="true"
    >
      <el-form-item label="字典归属" prop="listClass">
        <el-select v-model="queryParams.dictId" @change="$forceUpdate()">
          <el-option
              v-for="item in dictList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
          ></el-option>
        </el-select>
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
      <el-table-column label="字典编码" align="center" prop="id" />
      <el-table-column label="字典标签" align="center" prop="dictLabel">
        <template slot-scope="scope">
          <span v-if="scope.row.dictClass == '' || scope.row.dictClass == 'default'">{{scope.row.dictLabel}}</span>
          <el-tag v-else :type="scope.row.dictClass == 'primary' ? '' : scope.row.dictClass">{{scope.row.dictLabel}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="字典键值" align="center" prop="dictValue" />
      <el-table-column label="字典排序" align="center" prop="dictSort" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status==1">显示</el-tag>
          <el-tag v-else type="danger">隐藏</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ formatDate(scope.row.dictItemCreateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" >
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete( scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="操作框" :visible.sync="open" width="40%">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典类型">
          <el-input v-model="form.type" :disabled="true" />
        </el-form-item>
        <el-form-item label="数据标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入数据标签" />
        </el-form-item>
        <el-form-item label="数据键值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入数据键值" />
        </el-form-item>
        <el-form-item label="显示排序" prop="dictSort">
          <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="回显样式" prop="listClass">
          <el-select v-model="form.dictClass">
            <el-option
                v-for="item in listClassOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
                v-for="dict in statusOptions"
                :key="dict.dictValue"
                :label="dict.dictValue"
            >{{dict.dictLabel}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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
import {addDictItem, getDictItem, upDictItem, delDictItem, getDictAll, getDictType} from "@/api/admin";
import {formatDate} from "@/utils";

export default {
  name: "DictItem",
  data(){
    return {
      queryParams:{},
      total:0,
      loading:false,
      addLoading:false,
      list:[],
      open:false,
      form:{},
      dictType:"",
      dictList:[],
      statusOptions:[
          {dictLabel:"显示",dictValue:1},
          {dictLabel:"隐藏",dictValue:0},
      ],
      // 数据标签回显样式
      listClassOptions: [
        {
          value: "default",
          label: "默认"
        },
        {
          value: "primary",
          label: "主要"
        },
        {
          value: "success",
          label: "成功"
        },
        {
          value: "info",
          label: "信息"
        },
        {
          value: "warning",
          label: "警告"
        },
        {
          value: "danger",
          label: "危险"
        }
      ],
      rules:{
        dictLabel: [
          { required: true, message: "数据标签不能为空", trigger: "blur" }
        ],
        dictValue: [
          { required: true, message: "数据键值不能为空", trigger: "blur" }
        ],
        dictSort: [
          { required: true, message: "数据顺序不能为空", trigger: "blur" }
        ]
      }
    }
  },
  created() {
    let {id}=this.$route.query;
    if(id) this.queryParams.dictId=Number(id);
    this.getDictItem();
    this.getDictAll();
  },
  methods:{
    formatDate,
    affirm(){
      this.$refs.form.validate(async (validate)=>{
        if(!validate) return;
        try {
          this.addLoading=true;
          !this.form.id&&await addDictItem(this.form);
          this.form.id&&await upDictItem(this.form);
          this.addLoading=false;
          this.getDictItem();
          this.open=false;
          this.$message.success(this.form.id?"修改成功！":"新增成功！");
        }catch (e) {
          this.addLoading=false;
        }
      })
    },
    add(){
      this.form={
        dictId:this.queryParams.dictId,
        type:this.dictType,
        dictLabel:undefined,
        dictValue:undefined,
        dictSort:0,
        dictClass:undefined,
        status:1,
        remark:undefined
      };
      this.open=true;
    },
    async getDictItem(){
      this.loading=true;
      let {data}=await getDictItem(this.queryParams);
      this.loading=false;
      this.list=data;
    },
    async getDictAll(){
      let {data}=await getDictAll();
      this.dictList=data;
      let arr=data.filter(t=>t.id==this.queryParams.dictId);
      this.dictType=arr[0].type;
    },
    handleQuery(){
      this.getDictAll();
      this.getDictItem();
    },
    handleEdit(row){
      this.form={...row};
      this.open=true;
    },
    handleDelete(row){
      this.$confirm(`是否删除《${row.dictLabel}》字典项目？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await delDictItem(row);
        this.getDictItem();
        this.$message.success("删除成功！");
      })
    }
  }
}
</script>

<style scoped>

</style>
