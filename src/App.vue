<style lang='less' scoped>
  .title {
    color: skyblue
  }
</style>

<template>
  <div>
    <h2 class="title">hello app</h2>
    <ul>
      <li>
        <router-link to="/home">Home</router-link>
      </li>
      <li>
        <router-link to="/about">About</router-link>
      </li>
    </ul>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: "App",
  }
</script>