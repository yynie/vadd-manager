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