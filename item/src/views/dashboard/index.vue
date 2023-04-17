<template>
  <div class="dashboard-container">
    <div class="title">欢迎进入vue+node后台管理系统</div>
<!--    <div class="hint1">由于演示需要，某些固定数据无法进行编辑和删除，可新增数据进行测试！<span>（如需完整体验，请将代码拉到本地进行使用）</span></div>-->
    <el-row type="flex" justify="center">
      <el-col :span="8">
       <div class="flex">
         <img class="img-icon" src="@/assets/images/gitee.png" alt="gitee">
         <el-link type="primary" target="_blank" href="https://gitee.com/MMinter/vue_node">https://gitee.com/MMinter/vue_node</el-link>
       </div>
      </el-col>
      <el-col :span="8">
       <div class="flex">
         <img class="img-icon" src="@/assets/images/github.png" alt="gitee">
         <el-link type="primary" target="_blank" href="https://github.com/MingMinter/vue_node_admin">https://github.com/MingMinter/vue_node_admin</el-link>
       </div>
      </el-col>
    </el-row>
    <div class="flex">
      <img class="img-icon" src="@/assets/images/qq.png" alt="gitee">
      <el-link type="primary" target="_blank" href="https://gitee.com/MMinter/vue_node_wiki/wikis/vue+node%E4%BA%A4%E6%B5%81%E7%BE%A4">点击进入问题解答交流社区！</el-link>
    </div>
    <el-row type="flex" justify="center">
      <el-col :span="8">
        <div class="flex">
          <img class="img-icon" src="@/assets/images/vue.png" alt="gitee">
          <el-link type="primary" target="_blank" href="https://gitee.com/MMinter/vue_node_wiki/wikis/%E5%89%8D%E7%AB%AF%E5%8A%9F%E8%83%BD%E8%AF%A6%E8%A7%A3">点击进入前端功能详解</el-link>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="flex">
          <img class="img-icon" src="@/assets/images/node.png" alt="gitee">
          <el-link type="primary" target="_blank" href="https://gitee.com/MMinter/vue_node_wiki/wikis/%E5%90%8E%E7%AB%AF%E5%8A%9F%E8%83%BD%E8%AF%A6%E8%A7%A3">点击进入后端功能详解</el-link>
        </div>
      </el-col>
    </el-row>

    <div class="flex star">
      <img class="img-icon" src="@/assets/images/star.png" alt="gitee">
      <div >开源不易，点个Star是让作者更加有动力，谢谢！</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .dashboard-container{
    padding: 50px 20px;
    text-align: center;
  }
  .title{
    font-size: 46px;
    font-weight: 700;
  }
  .hint1{
    font-size: 20px;
    font-weight: 700;
    color: #d00202;
    margin-top: 50px;
    span{
      color: #666;
    }
  }
  .flex{
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 50px;
  }
  .img-icon{
    width: 50px;
    margin-right: 10px;
  }
  .star{
    margin-top: 100px;
    img{
      width: 100px;
    }
    div{
      font-size: 26px;
      font-weight: 700;
      color: #c11c22;
    }
  }
</style>

