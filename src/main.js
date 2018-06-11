// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import {router} from './router/index'
import store from './store'
import iView from 'iview'
import 'iview/dist/styles/iview.css'   // 使用 CSS
import './themes/index.less' //需要安装less-loader和less 用 --save-dev 安装
import VueResource from 'vue-resource'
import './const'

//自定义组件
import fullScreen from './components/common/fullscreen.vue';
import messageTip from './components/common/messagetip.vue';
import breadcrumbNav from './components/common/breadcrumbnav.vue'
import puboneConfirm from './components/datatarget/puboneConfirmModal.vue'
import dtcustomerEdit from './components/management/dtcustomerModal.vue'
import SelectableTag from './components/common/SelectableTag.vue'
import NewVcpEditor from './components/management/NewVcpEditor.vue'
import AddCustSubjectEditor from './components/management/AddCustSubjectEditor.vue'
import AddRetailEditor from './components/management/AddRetailEditor.vue'
import ExxxcatchEditor from './components/management/ExxxcatchEditor.vue'
import ParamSelect from "./components/management/ParamSelect.vue"

Vue.config.productionTip = false
Vue.use(iView);
Vue.use(VueResource);

Vue.component('full-screen', fullScreen);
Vue.component('message-tip', messageTip);
Vue.component('breadcrumb-nav', breadcrumbNav);
Vue.component('pubone-confirm', puboneConfirm);
Vue.component('dtcustomer_edit', dtcustomerEdit);
Vue.component('seletable-tag',SelectableTag);
Vue.component('newvcp_edit', NewVcpEditor);
Vue.component('addcustsub_edit', AddCustSubjectEditor);
Vue.component('addretail_edit', AddRetailEditor);
Vue.component('exxxcatch-editor',ExxxcatchEditor);
Vue.component('param-select',ParamSelect);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store: store,
  components: { App },
  template: '<App/>'
})
