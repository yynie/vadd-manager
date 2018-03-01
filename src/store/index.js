import Vue from 'vue';
import Vuex from 'vuex';
import { LOG_IN,LOG_OUT } from './mutation-types'
Vue.use(Vuex);



const store = new Vuex.Store({
    state: {
        isAdmin:false,
        user:''
    },
    mutations: {
        [LOG_IN] (state, payload) {
            console.log("STORE: user (" + payload.user + ") login");
            state.isAdmin = payload.admin;
            state.user = payload.user;
        },

        [LOG_OUT](state) {
            console.log("STORE: user (" + state.user + ") logout");
            state.isAdmin = false;
            state.user = '';
        }
    },
    actions: {

    },
    modules: {
        
    }
});

export default store;