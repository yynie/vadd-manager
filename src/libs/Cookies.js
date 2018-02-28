let cookies = {
    
};

export default cookies;

// var tiny = require('tiny-cookie');

// cookies.set = function (name, value, daysOrOptions) {
//     var opts = daysOrOptions;
//     if(Number.isInteger(daysOrOptions)) {
//         opts = {expires: daysOrOptions};
//     }
//     return tiny.set(name, value, opts);
// };

// cookies.get = function (name) {
//     return tiny.get(name);
// };

// cookies.delete = function (name) {
//     var opts = {expires: -1};
//     tiny.set(name, '', opts);
// };

cookies.set = function (name, value, daysOrOptions) {
    var opts = daysOrOptions;
    var unit = 24 * 60 * 60 * 1000; //day
    if(Number.isInteger(daysOrOptions)) {
        
    }else if(daysOrOptions instanceof Object){
        if(daysOrOptions.expires){
            opts = daysOrOptions.expires;
        }else{
            console.error("daysOrOptions should be Integer or {expires: integer, unit: 'day|hour|minute'}");
            return;
        }
        if(daysOrOptions.unit){
            if(daysOrOptions.unit === 'hour'){
                unit = 60 * 60 * 1000;
            }else if(daysOrOptions.unit === 'minute'){
                unit = 60 * 1000;
            }else if(daysOrOptions.unit !== 'day'){
                console.error("daysOrOptions should be Integer or {expires: integer, unit: 'day|hour|minute'}");
                return;
            }
        }else{
            console.log("daysOrOptions.unit="+daysOrOptions.unit+",use default unit 'day'.");
        }
    }else{
        console.error("daysOrOptions should be Integer or {expires: integer, unit: 'day|hour|minute'}");
        return;
    }
    var d = new Date;
    d.setTime(d.getTime() + unit*opts);
    window.document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
};


cookies.get = function (name) {
    var v = window.document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}

cookies.delete = function (name) {
    this.set(name, '', -1);
}