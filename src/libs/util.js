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

util.isInArray = function (arr,value){
    for(var i = 0; i < arr.length; i++){
        if(value === arr[i]){
            return true;
        }
    }
    return false;
};

util.indexOfArray = function (arr,val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === val) return i;
    }
    return -1;
};

util.removeFromArray = function (arr,val) {
    var index = util.indexOfArray(arr,val);
    if (index > -1) {
        arr.splice(index, 1);
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