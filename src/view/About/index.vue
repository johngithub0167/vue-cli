<style lang='less' scoped>
  .title {
    color: blue;
    font-size: 30px;
  }
</style>

<template>
  <div>
    <h2 class="title">hello about</h2>
    <el-button type="success">按钮</el-button>
  </div>
</template>

<script>
  import {
    ElButton
  } from "element-plus";

  export default {
    name: "About",
    components: {
      ElButton
    }
  }
</script>