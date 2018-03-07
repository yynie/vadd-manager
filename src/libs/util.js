import {SET_CUR_PATH} from '../store/mutation-types'
let util = {

};

export default util;

util.title = function (title) {
    if(title){
        window.document.title = 'vadd-后台管理 | ' + title;
    }else{
        window.document.title = 'vadd-后台管理';
    }
    
};

util.setCurrentPath = function (vm, to) {
    var patharr = [];
    if(to.name === 'home_index'){
        patharr = [
            {name:to.name, path:to.path, title:to.title}
        ]
    }else{
        if(to.group){
            patharr = [
                {name:'home_index', path:'/home_index', title:'首页'},
                {name:to.group, path:'',title:to.groupname},
                {name:to.name, path:to.path, title:to.title}
            ]
        }else{
            patharr = [
                {name:'home_index', path:'/home_index', title:'首页'},
                {name:to.name, path:to.path, title:to.title}
            ]
        }
    }
    vm.$store.commit(SET_CUR_PATH, patharr);
}