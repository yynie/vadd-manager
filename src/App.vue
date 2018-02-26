<template>
  <div id="main" class="app-main">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<!--
引入src/style/style.scss 统一管理css
依赖：
cnpm install sass-loader -–save
cnpm install node-sass --save
-->
<style lang="scss">
@import "./style/style";
</style>
<!--
<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
-->
