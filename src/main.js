// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import {router} from './router/index'
import iView from 'iview';
import 'iview/dist/styles/iview.css';    // 使用 CSS
import './themes/index.less'; //需要安装less-loader和less 用 --save-dev 安装
import VueResource from 'vue-resource'
import './const'

Vue.config.productionTip = false
Vue.use(iView);
Vue.use(VueResource);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
