import Vue from 'vue'
import VueRouter from 'vue-router'
import {helloRouter} from './routers'

Vue.use(VueRouter)

export const router = new VueRouter(
  {
//  mode: 'history', //这样就url就不会显示#
  routes: [
    helloRouter
  ]
  }
);
