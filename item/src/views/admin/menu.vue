<template>
  <div class="boxs">
    <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>

    <el-table v-if="refreshTable" v-loading="loading" :data="routerMenu" row-key="id" :default-expand-all="isExpandAll" :tree-props="{ children: 'children' }">
<!--      <el-table-column prop="title" label="菜单名称" :show-overflow-tooltip="true" width="160" />-->
      <el-table-column prop="icon" label="菜单名称"  width="200">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.meta.icon" />
          <span style="margin-left: 5px">{{scope.row.title}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="60" />
      <el-table-column prop="component" label="页面路径" :show-overflow-tooltip="true" />
      <el-table-column prop="pathView" label="路由地址" width="150" />
      <el-table-column prop="roleKey" label="权限字符" />

      <el-table-column label="当前状态" align="center" prop="createTime">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.hidden == 0">正常</el-tag>
          <el-tag v-else type="danger">隐藏</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="类型" align="center" prop="menuType">
        <template slot-scope="scope">
          <el-tag type="warning" v-if="scope.row.menuType == 'M'">目录</el-tag>
          <el-tag type="success" v-if="scope.row.menuType == 'C'">菜单</el-tag>
          <el-tag type="info" v-if="scope.row.menuType == 'F'" >按钮</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="更新时间" align="center" prop="createTime" :formatter="formatTime" />

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="250">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-plus" @click="handleAdd(scope.row)">新增</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="操作" :visible.sync="dialogVisible" width="800px" :close-on-click-modal="false">
      <div>
        <el-form ref="form" :model="form" label-width="100px" :rules="rules">
          <el-row>
            <el-col :span="24">
              <el-form-item label="上级菜单" prop="parentId">
                <treeselect v-model="form.parentId" :options="selectRouterMenu" :normalizer="normalizer" :show-count="true" placeholder="选择上级菜单" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="菜单类型" prop="menuType">
                <el-radio-group v-model="form.menuType">
                  <el-radio label="M">目录</el-radio>
                  <el-radio label="C">菜单</el-radio>
                  <el-radio label="F">按钮</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="菜单名称" prop="title">
                <el-input placeholder="请输入菜单名称" v-model="form.title" clearable>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="权限字符">
                <el-input  v-model="form.roleKey" placeholder="请输入权限字符"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="form.menuType==='C'">
              <el-form-item label="页面名称" prop="name">
                <el-input  placeholder="请输入页面名称（Name）英文" v-model="form.name" >
                </el-input>
              </el-form-item>
            </el-col>

              <el-col :span="12" v-if="form.menuType==='C'||form.menuType==='M'">
                <el-form-item label="路由地址" prop="path">
                  <el-input placeholder="请输入路由地址（/path）" v-model="form.path" >
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-if="form.menuType==='C'">
                <el-form-item label="页面地址" prop="component">
                  <el-input  placeholder="请输入页面地址（index/index）" v-model="form.component" clearable>
                  </el-input>
                </el-form-item>
              </el-col>

            <el-col :span="12">
              <el-form-item label="显示排序">
                <el-input-number v-model="form.sort" controls-position="right" :min="0" :max="100"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="24" >
              <el-form-item label="菜单图标" prop="icon">
                <el-popover placement="bottom-start" width="460" trigger="click" @show="$refs['iconSelect'].reset()">
                  <IconSelect ref="iconSelect" @selected="selected" />
                  <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" readonly>
                    <svg-icon v-if="form.icon" slot="prefix" :icon-class="form.icon" class="el-input__icon" style="height: 38px; width: 15px" />

                    <i v-else slot="prefix" class="el-icon-search el-input__icon" />
                  </el-input>
                </el-popover>
              </el-form-item>
            </el-col>

            <el-col :span="12" v-if="form.menuType==='C'">
              <el-form-item label="缓存状态">
                <el-radio-group v-model="form.noCache">
                  <el-radio :label="1">否</el-radio>
                  <el-radio :label="0">是</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="form.menuType!=='F'">
              <el-form-item label="显示状态">
                <el-radio-group v-model="form.hidden">
                  <el-radio :label="0">显示</el-radio>
                  <el-radio :label="1">隐藏</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer" v-loading="addLoading">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="affirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getRouterSystem, addMenu, changeMenu, delMenu } from '@/api/admin'
import { formatTime, deepClone } from '@/utils'
// import the component
import Treeselect from '@riophae/vue-treeselect'
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import IconSelect from '@/components/IconSelect'
export default {
  name: "Menu",
  data () {
    let pathValidate=(rule, value, callback)=>{
      let reg = /^\//
      if (!reg.test(value)) {
        callback(new Error('首个字符必须为 /'))
      } else {
        callback()
      }
    }
    return {
      routerMenu: [],
      selectRouterMenu: [],
      refreshTable: true,
      loading: false,
      addLoading:false,
      isExpandAll: false,
      dialogVisible: false,
      form: {
        icon: '',
        sort: 0,
        noCache: 1,
        hidden: 0,
        parentView: 0,
        alone: 0,
        menuType:"C"
      },
      rules: {
        parentId: [
          { required: true, message: '请选择父级菜单', trigger: 'change' }
        ],
        title: [
          { required: true, message: '请输入菜单名称', trigger: 'blur' },
        ],
        name: [
          { required: true, message: '请输入页面名称', trigger: 'blur' },
        ],
        path: [
          { required: true, message: '请输入路由地址', trigger: 'blur' },
          // { validator:pathValidate, message: '首个字符必须为 /', trigger: 'blur' },
        ],
        component: [
          { required: true, message: '请输入页面地址', trigger: 'blur' },
        ],
        icon: [
          { required: true, message: '请选择菜单图标', trigger: 'change' },
        ],
      }
    }
  },
  created () {
    this.getRouterSystem()
  },
  methods: {
    // 选择图标
    selected (name) {
      this.form.icon = name;
    },
    async affirm () {
      this.$refs["form"].validate(async (valid) => {
        if (!valid) return;
        try {
          this.addLoading=true;
          if(this.form.menuType==="F"||this.form.menuType==="M"){
            this.form.name="";
            this.form.component="/";
          }
          !this.form.id&&await addMenu(this.form);
          this.form.id&&await changeMenu(this.form);
          this.addLoading=false;
          this.$message.success(this.form.id?"修改成功":"添加成功！")
          this.getRouterSystem();
          this.dialogVisible = false;
        }catch (e) {
          this.addLoading=false;
        }
      });

    },
    formatTime (date) {
      return formatTime(new Date(date.updateTime))
    },
    async getRouterSystem () {
      this.loading=true;
      const {data} = await getRouterSystem();
      this.loading=false;
      let { routerMenu } = data;
      this.routerMenu = routerMenu
      let selectRouterMenu = deepClone(routerMenu)
      selectRouterMenu.unshift({
        title: "一级菜单",
        id: 0
      });
      this.selectRouterMenu = selectRouterMenu
    },
    //处理弹窗树形结构
    normalizer (data) {
      if (data.children && !data.children.length) {
        delete data.children
      }
      return {
        id: data.id,
        label: data.title,
        children: data.children
      }
    },
    handleAdd (row) {
      this.resetForm();
      if (row.id !== undefined) this.form.parentId = row.id;
      this.dialogVisible = true;
    },
    resetForm () {
      this.form = {
        id:undefined,
        icon: '',
        sort: 0,
        noCache: 1,
        hidden: 0,
        parentView: 0,
        alone: 0,
        menuType:"C",
        path:"/"
      };
    },
    handleUpdate (row) {
      this.resetForm();
      let data={...row};
      data.icon=row.meta.icon;
      data.noCache=row.meta.noCache ? 1 : 0;
      data.path=row.pathView;
      this.form = data;
      this.dialogVisible = true
    },
    handleDelete (row) {
      this.$confirm(`此操作将永久删除【${row.title}】, 是否继续?`, '提示', {
        confirmButtonText: '取消',
        cancelButtonText: '确定',
        type: 'warning',
        distinguishCancelAndClose: true
      }).catch(async (err) => {
        if (err == "cancel") {
          await delMenu({ id: row.id });
          this.$message.success("删除成功！");
          this.getRouterSystem();
        }
      })
    }
  },
  components: { Treeselect, IconSelect }
}
</script>
<style lang="scss" scoped>
.boxs {
  padding: 20px;
}
</style>
