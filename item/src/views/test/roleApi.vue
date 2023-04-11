<template>
  <div style="text-align: center;margin: 100px">
    <el-button type="primary" round v-hasPermi="['roleKey1']">我是自定义指令：菜单权限字符 《roleKey1》</el-button>
    <el-button type="primary" round v-hasPermi="['roleKey2']">我是自定义指令：菜单权限字符 《roleKey2》</el-button>
    <el-row style="margin-top: 20px">
      <el-button type="success" round v-hasRole="['primary']">我是自定义指令：角色权限字符 《primary》</el-button>
      <el-button type="success" round v-hasRole="['middle']">我是自定义指令：角色权限字符 《middle》</el-button>
    </el-row>
    <el-button @click="checkMenu" style="margin-top: 20px" type="primary" plain>点击请求拥有菜单：roleKey1权限的接口</el-button>
    <el-button @click="checkRoleEvent" style="margin-top: 20px" type="warning" plain>点击请求拥有角色：primary权限的接口</el-button>
    <div style="margin-top: 50px;color: red">请登录不同账户来测试不同 显示和隐藏（请看控制台打印信息）</div>
  </div>
</template>

<script>
import {checkPermi,checkRole} from "@/utils/permission";
import {checkMenu,checkRole as checkRoleEvent} from "@/api/tests";

console.log(checkPermi(["roleKey1"]),"菜单权限：roleKey1") //菜单权限
console.log(checkRole(["primary"]),"角色权限：primary") //角色权限
console.log(checkRole(["middle"],true),"角色权限：middle (总管理也要遵守)") //角色权限(总管理也要遵守)
export default {
  name: "role",
  data(){
    return{

    }
  },
  created() {
  },
  methods:{
    async checkMenu(){
      await checkMenu();
      this.$message.success("请求通过！");
    },
    async checkRoleEvent(){
      await checkRoleEvent();
      this.$message.success("请求通过！！！");
    }
  }
}
</script>

<style scoped>

</style>
