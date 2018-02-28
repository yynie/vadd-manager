import Vue from 'vue'
import VueRouter from 'vue-router'
import iView from 'iview';
import Util from '../libs/util';
import Cookies from '../libs/Cookies';

import {helloRouter,signinRouter} from './routers'

Vue.use(VueRouter)

export const router = new VueRouter(
  {
//  mode: 'history', //这样就url就不会显示#
  routes: [
    helloRouter,
    signinRouter
  ]
  }
);

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start();
  Util.title(to.meta.title);
  console.log("from:"+from.name+",to:" + to.name);
  var user = Cookies.get('user');
  console.log("user:" + user);
  if (!Cookies.get('user') && to.name !== 'SignIn') {
    console.log("not sign in, redirect to \"SignIn\"");
    next({name: 'SignIn'});
  }else if(Cookies.get('user') && to.name === 'SignIn'){
    if(from.name === 'HelloWorld'){
      console.log("sign in, stay in \"Home\"");
      iView.LoadingBar.finish();
      window.scrollTo(0, 0);
      next(false);
    }else{
      console.log("sign in, redirect to \"Home\"");
      next({name: 'HelloWorld'});
    }
  }else{
    console.log("go!");
    next();
  }

});

router.afterEach(route => {
  iView.LoadingBar.finish();
  window.scrollTo(0, 0);
});
