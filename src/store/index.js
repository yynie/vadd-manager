import Vue from 'vue';
import Vuex from 'vuex';
import dataTarget from './modules/data-target';
import { LOG_IN,LOG_OUT,SET_CUR_PATH,SIDER_COLLAPSE } from './mutation-types'
Vue.use(Vuex);



const store = new Vuex.Store({
    state: {
        isAdmin:false,
        user:'',
        currentPath:[],
        isCollapsed:false,
    },
    mutations: {
        [LOG_IN] (state, payload) {
            //console.log("STORE: user (" + payload.user + ") login");
            state.isAdmin = payload.admin;
            state.user = payload.user;
        },
        [LOG_OUT](state) {
            //console.log("STORE: user (" + state.user + ") logout");
            state.isAdmin = false;
            state.user = '';
        },
        [SET_CUR_PATH](state, payload) {
            state.currentPath = payload;
            console.log("STORE: set currentPath:" + JSON.stringify(state.currentPath));
        },
        [SIDER_COLLAPSE](state, payload) {
            state.isCollapsed = payload;
            //console.log("STORE: set isCollapsed:" + state.isCollapsed);
        }
    },
    actions: {

    },
    modules: {
        dataTarget
    }
});

export default store;