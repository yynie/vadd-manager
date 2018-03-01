import Vue from 'vue'
import VueRouter from 'vue-router'
import iView from 'iview'
import Util from '../libs/util'
import Cookies from '../libs/Cookies'
import store from '../store'
import {LOG_IN,LOG_OUT} from '../store/mutation-types'
import {homeRouter,signinRouter} from './routers'

Vue.use(VueRouter)

export const router = new VueRouter(
  {
//  mode: 'history', //这样就url就不会显示#
  routes: [
    homeRouter,
    signinRouter
  ]
  }
);

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start();
  Util.title(to.meta.title);
  console.log("from:"+from.name+",to:" + to.name);
  
  var user = Cookies.get('user');
  console.log("cookie user:"+user);
  if (!user){
    if (store.state.user !== ''){
      store.commit(LOG_OUT);
    }
    if (to.name !== 'SignIn') {
      if (from.name === 'SignIn') {
        console.log("sign in, stay in \"SignIn\"");
        iView.LoadingBar.finish();
        window.scrollTo(0, 0);
        next(false);
      }else{
        console.log("not sign in, redirect to \"SignIn\"");
        next({name: 'SignIn'});
      }
    } else {
      console.log("go SignIn!");
      next();
    }
  } else {
    var json = JSON.parse(user);
    if (json.user !== store.state.user || json.admin !== store.state.isAdmin){
      store.commit(LOG_IN, json);
    }
    if (to.name === 'SignIn') {
      if (from.name === 'Home') {
        console.log("sign in, stay in \"Home\"");
        iView.LoadingBar.finish();
        window.scrollTo(0, 0);
        next(false);
      } else {
        console.log("sign in, redirect to \"Home\"");
        next({name: 'Home'});
      }
    } else {
      console.log("go!");
      next();
    }
  }

});

router.afterEach(route => {
  iView.LoadingBar.finish();
  window.scrollTo(0, 0);
});
