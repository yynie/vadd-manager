/* node.js 作为后台在ali从库上执行数据库查询
* 需要安装 cnpm install mysql -g， 可选安装 cnpm install @types/mysql -g
* 使用express做框架  cnpm install express -g
* 要上传json数据  cnpm install body-parser -g
* moment 处理时间容易一点   cnpm install moment -g
* nodejs 有生成uuid的库  cnpm install node-uuid -g
*/
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var mysql  =require("mysql"); 
var moment = require('moment');
var nodeUuid = require('node-uuid');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

var base = "/mnger/";
var poolrdonly = mysql.createPool({  
    host: '106.14.9.175',  
    user: 'mysql',  
    password: 'MySQL56Meng',  
    database: 'vaddservice',  
    port: '3188'
});  

var poolmnger = mysql.createPool({  
    host: '106.14.9.175',  
    user: 'vaddmnger',  
    password: 'LYP82NDLF',  
    database: 'vaddmanage',  
    port: '3306'
});  



//vcp登陆
app.post(base+'login', function (req, res) {
    console.log("body:"+JSON.stringify(req.body));
    var key = req.body.key;
    //AABBCCDDEEFF00112233445566770000
    var sql = 'SELECT accname,disp,apikey FROM t_account WHERE apikey=\'' + key + '\'';
    //console.log(sql);

    poolrdonly.getConnection(function(err,conn){  
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.json(results[0]);
                }
            });
        }
    });
    
})

//查询流量用户名是否存在
app.get(base+'datatarget/customer/count', function (req, res) {
    console.log("get datatarget/customer/count?name=" + req.query.name);
    var sql = 'SELECT count(1) as count FROM t_customer WHERE name=\''+req.query.name+'\'';
    poolmnger.getConnection(function(err,conn){
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.json(results);
                }
            });
        }
    });
})

//查询流量任务用户
app.get(base+'datatarget/customers', function (req, res) {
    console.log("get datatarget/customers");
    var sql = 'SELECT id,apikey,name,disp,quotas FROM t_customer ORDER BY name asc';
    poolmnger.getConnection(function(err,conn){
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.json(results);
                }
            });
        }
    });
})

//新增或修改用户
app.post(base+'datatarget/customers', function (req, res) {
    var commit = req.body;
    console.log("pos datatarget/customers body:"+JSON.stringify(commit));
    var sql = '';
    if(commit.id.length === 0){
        //new
        var uuid = nodeUuid.v1().replace(/-/g,''); 
        sql = 'INSERT INTO t_customer(`id`,`apikey`, `name`, `disp`, `quotas`) VALUES(\'' +
            uuid + '\',\'' + commit.apikey + '\',\'' + commit.name + '\',\'' + commit.disp + '\',\'' + JSON.stringify(commit.quotas) +
            '\')';
    }else{
        //update
        sql = 'UPDATE t_customer SET disp=\'' + commit.disp + '\',quotas=\'' + JSON.stringify(commit.quotas) + '\' WHERE id=\'' + commit.id + '\'';
    }
    console.log(sql);
    poolmnger.getConnection(function(err,conn){
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.status(200).end();
                }
            });
        }
    });
})

//删除用户
app.post(base+'datatarget/customer/delete', function (req, res) {
    var delid = req.body.id;
    console.log("pos datatarget/customers delid:"+delid);
    var sql = 'DELETE FROM t_customer WHERE id=\''+ delid + '\'';
    console.log(sql);
    poolmnger.getConnection(function(err,conn){
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.status(200).end();
                }
            });
        }
    });
})

//指定用户增加流量指标
app.post(base+'datatarget/quota', function (req, res) {
   // console.log("pos datatarget/quota body:"+JSON.stringify(req.body));
    var quotas = req.body.quotas;
    var name = req.body.name;
    console.log("pos datatarget/quota quotas:"+JSON.stringify(quotas) + ",name:"+name);
    var sql = 'UPDATE t_customer SET quotas=\'' + JSON.stringify(quotas) + '\' WHERE name=\'' + name + '\'';
    //console.log(sql);
   
    poolmnger.getConnection(function(err,conn){
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.status(200).end();
                }
            });
        }
    });
})

//指定用户检测imei冲突
app.get(base+'datatarget/conflict', function(req, res){
    var imei = req.query.imei;
    console.log("get datatarget/conflict?imei=" + imei);
    
    var sql = 'SELECT imei,name as custname,disp as custdisp,start,end FROM t_imei_pub pub left join t_customer cust on pub.custkey=cust.apikey'
        +' where imei=\''+imei+'\''
    //console.log(sql);
    poolmnger.getConnection(function(err,conn){
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.json(results);
                }
            });
        }
    });
})

//统计发布状态
app.get(base+'datatarget/imeis/statistics', function(req, res){
    var custkey =  req.query.custkey;
    var tasktime = req.query.tasktime;
    var pubtime = tasktime.replace('-','');
    console.log("get datatarget/imeis/statistics?custkey="+custkey+"&pubtime="+ tasktime);
    var sql = 'SELECT count(1) as total, sum(if(locate(\'' + pubtime + '\',pubdate)>0,1,0)) as pubed, '+
        'sum(if(locate(\'' + pubtime + '\',pubdate)>0,0,1)) as tobepub FROM t_imei_pub WHERE custkey=\''+custkey+'\' AND'+
        ' start<=\''+tasktime+'\' AND end>=\''+tasktime+'\'';
    //console.log(sql);
    poolmnger.getConnection(function(err,conn){
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.json(results);
                }
            });
        }
    });
})
//查询一个imei
app.get(base+'datatarget/sigleimei', function(req, res){
    console.log("get datatarget/sigleimei?query=" + JSON.stringify(req.query));
    var custkey = req.query.custkey;
    var tasktime = req.query.tasktime;
    var pubstate = parseInt(req.query.pubstate);
    var imei = req.query.imei;
    
    var pubtime = tasktime.replace('-','');

    var sql = 'SELECT imei,createtime,start,end,quota,online,locate(\''+pubtime+'\',pubdate) as pub FROM t_imei_pub'+
    ' WHERE custkey=\''+custkey+'\' AND start<=\''+tasktime+'\' AND end>=\''+tasktime+'\' AND imei=\''+imei+'\'';
    if(pubstate === 1){
        sql += ' AND locate(\''+pubtime+'\',pubdate)>0';
    }else if(pubstate === 2){
        sql += ' AND (pubdate is null OR locate(\''+pubtime+'\',pubdate)=0)';
    }
    
    poolmnger.getConnection(function(err,conn){
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.status(200).json(results);
                }
            });
        }
    });
})

//查询imei
app.get(base+'datatarget/imeis', function(req, res){
    console.log("get datatarget/imeis?query=" + JSON.stringify(req.query));
    var custkey = req.query.custkey;
    var tasktime = req.query.tasktime;
    var pubstate = parseInt(req.query.pubstate);
    var quota = parseInt(req.query.quota);
    var page = parseInt(req.query.page);
    
    if((page === undefined) || (page < 1)){
        page = 1;
    }
    var pagesize = parseInt(req.query.pagesize);
    if((pagesize === undefined) || (pagesize < 1)){
        pagesize = 10;
    }
    
    var pubtime = tasktime.replace('-','');

    var sql = 'SELECT count(1) as total FROM t_imei_pub WHERE custkey=\''+custkey+'\' AND start<=\''+tasktime+'\' AND end>=\''+tasktime+'\'';
    if(pubstate === 1){
        sql += ' AND locate(\''+pubtime+'\',pubdate)>0';
    }else if(pubstate === 2){
        sql += ' AND (pubdate is null OR locate(\''+pubtime+'\',pubdate)=0)';
    }
    if(quota>0){
        sql += ' AND quota='+quota;
    }
    //console.log(sql);
    poolmnger.getConnection(function(err,conn){
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                if(err){
                    conn.release();
                    res.status(500).json({error:err});
                }else{
                    //console.log(results[0].total);
                    var final = {
                        total:results[0]['total'],
                        page:page,
                        pagesize:pagesize,
                        data:Array
                    }
                    //console.log(final);
                    sql = sql.replace('count(1) as total','imei,createtime,start,end,quota,online,locate(\''+pubtime+'\',pubdate) as pub');
                    var offset = (page - 1) * pagesize;
                    sql += ' ORDER BY start asc LIMIT ' + offset + "," + pagesize;
                   // console.log(sql);
                    conn.query(sql,function(err,results,fields){ 
                        conn.release();
                        if(err){
                            res.status(500).json({error:err});
                        }else{
                            final.data=results;
                           // console.log("final:"+JSON.stringify(final));
                            res.status(200).json(final);
                        }
                    });
                }
            });
        }
    });
})

//增加imei
app.post(base+'datatarget/imeis', function (req, res) {
    console.log("post datatarget/imeis body:"+JSON.stringify(req.body));
    var data = req.body;
    var start = data.start;
    var end = data.end;
    var quota = data.quota;
    var custkey = data.custkey;
    var array = data.imeiarr;
    var len = array.length;
    
    var create = moment().format('YYYY-MM-DD HH:mm:ss'); 
    var sql1 = 'INSERT INTO t_imei_pub(`id`,`imei`, `custkey`, `start`, `end`, `quota`, `createtime`) VALUES(';
    var sql2 = '\''+custkey+'\',\''+start+'\',\''+end+'\',\''+quota+'\',\''+create+'\')';
     poolmnger.getConnection(function(err,conn){
         if(err){
             res.status(500).json({error:err});
         }else{
            inputImei(sql1, sql2, conn, res, array, 0)
         }
     });
 })

 inputImei=function(sqlpart1, sqlpart2, conn, res, array, i){
    if(i >= array.length){
        conn.release();   
        res.status(200).end();
        return;
    }
    var suuid = nodeUuid.v1();
    //console.log("suuid:"+suuid);
    var uuid = suuid.replace(/-/g,'');  
   
    //console.log("uuid:"+uuid);
    var index = i;
    var sql=sqlpart1 + '\''+ uuid+'\',\'' + array[index]+'\','+sqlpart2;
    console.log("inputImei:"+sql);
    conn.query(sql,function(err,results,fields){ 
        if(err){
            conn.release();
            res.status(500).json({error:err});
        }else{
            index ++;
            inputImei(sqlpart1, sqlpart2, conn, res, array, index);
        }
    });
 }

 //查询是否已上线 ali从库
 app.get(base+'datatarget/imei/online', function (req, res) {
    console.log("get datatarget/imei/online?imei="+req.query.imei+"&custkey="+req.query.custkey);
    var sql = 'SELECT count(1) as count FROM t_pnterminal WHERE imei=\'' + req.query.imei +'\'';
    
    poolrdonly.getConnection(function(err,conn){  
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    var count = results[0].count;
                    console.log(JSON.stringify(results[0])+"count="+count);
                    if(count > 0){
                        writeOnline(req.query.imei,req.query.custkey,res,count);
                    }else{
                        res.json({count:count});
                    }
                }
            });
        }
    });
 })

 writeOnline=function(imei,custkey,res,count){
    var sql = 'UPDATE t_imei_pub SET online=\'1\' WHERE imei=\'' + imei + '\' AND custkey=\''+custkey+'\'';
    console.log("writeOnline:"+sql);
    poolmnger.getConnection(function(err,conn){
         if(err){
             res.status(500).json({error:err});
         }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.json({count:count});
                }
            });
         }
     });
 }
//修改发布状态
app.post(base+'datatarget/imei/pubed', function (req, res) {
    //console.log("post datatarget/imei/pubed body:"+JSON.stringify(req.body));
    var imeis = req.body.imeis;
    var custkey = req.body.custkey;
    var pubtime = req.body.pubtime;
    console.log("post datatarget/imei/pubed imeis len:"+imeis.length);
    var sql = 'UPDATE t_imei_pub SET pubdate=CONCAT(pubdate,\''+pubtime+',\') WHERE custkey=\''+custkey+'\' AND imei in (';
    imeis.forEach(element => {
        sql += '\''+element+'\','
    });
    sql = sql.replace(/(,*$)/g,""); //去尾部,
    sql +=')';
   // console.log(sql);
    poolmnger.getConnection(function(err,conn){
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.status(200).end();
                }
            });
        }
    });
    
})

//根据custkey查询已发布的任务
app.post(base+'datatarget/tasks', function (req, res) {
    console.log("get datatarget/tasks:"+JSON.stringify(req.body));
    var tasktime = req.body.tasktime;
    var status = req.body.status;
    var imeis = req.body.imeis;
    
    var sql = 'SELECT imei,state,mode,mtotal as total,mrest as rest,durationtotal as duration,dlastuploadspeed as speed,stateupdatetime as statetime,updatetime FROM t_datatarget' +
        ' WHERE batchno=\''+tasktime+'\'';
    if(status === 'off'){
        sql += ' AND state=0';
    }else if(status === 'working'){
        sql += ' AND state=5';
    }else if(status === 'error'){
        sql += ' AND state=900';
    }else if(status === 'done'){
        sql += ' AND state=200';
    }
    sql += ' AND imei in(';
    imeis.forEach((imei) => {
        sql += '\'' + imei +'\',';
    })
    sql = sql.replace(/(,*$)/g,""); //去尾部,
    sql += ')';
    poolrdonly.getConnection(function(err,conn){
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.status(200).json(results);
                }
            });
        }
    });
    
})

//查所有VCP account
app.get(base+'vcp/accounts', function (req, res) {
    console.log("get vcp/accounts");
    var sql = 'SELECT * FROM t_account ORDER BY accname ASC';
    
    poolrdonly.getConnection(function(err,conn){  
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.json(results);
                }
            });
        }
    });
 })

//查一个VCP account 
 app.get(base+'vcp/account', function (req, res) {
    console.log("get vcp/account?apikey="+req.query.apikey);
    var sql = 'SELECT * FROM t_account WHERE apikey=\''+req.query.apikey+'\'';
    
    poolrdonly.getConnection(function(err,conn){  
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.json(results);
                }
            });
        }
    });
 })

 //查一个VCP account retail
 app.get(base+'vcp/account/retail', function (req, res) {
    console.log("get vcp/account/retail?boundkey="+req.query.apikey);
    var sql = 'SELECT * FROM t_vcp_retail WHERE boundkey=\''+req.query.apikey+'\'';

    poolrdonly.getConnection(function(err,conn){
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.json(results);
                }
            });
        }
    });
 });

 //查一个VCP account retail 名称冲突
 app.get(base+'vcp/account/retail/name/check', function (req, res) {
    console.log("get vcp/account/retail/name/check?username=" + req.query.name);
    var sql = 'SELECT count(1) as count FROM t_vcp_retail WHERE username=\''+req.query.name+'\'';
    poolrdonly.getConnection(function(err,conn){
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    console.log("vcp/account/retail/name/check count=" + JSON.stringify(results));
                    res.json(results);
                }
            });
        }
    });
})
 
 //VCP subject关联
app.get(base+'vcp/subcust', function (req, res) {
    console.log("get vcp/subcust?apikey="+req.query.apikey);
    var sql = 'SELECT * FROM t_cust_sub WHERE apikey=\''+req.query.apikey+'\' ORDER BY subid ASC';
    
    poolrdonly.getConnection(function(err,conn){  
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.json(results);
                }
            });
        }
    });
 })

 //VCP 检查用户名是否重复
 app.get(base+'vcp/name/check', function(req, res) {
    console.log("get vcp/name/check?name="+req.query.name);
    var sql = 'SELECT count(1) as count FROM t_account WHERE accname=\''+req.query.name+'\'';
    poolrdonly.getConnection(function(err,conn){  
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.json(results);
                }
            });
        }
    });
 })

 app.get(base+'subjectcust', function(req, res) {
    console.log("get subjectcust?subid="+req.query.subid+"&vcpkey="+req.query.vcpkey);
    var sql = 'SELECT sub.id,sub.subname,sub.requiredver,SUM(IF(cust.apikey=\''+req.query.vcpkey+'\',1,0)) exist FROM t_subject AS sub'
    +' LEFT JOIN t_cust_sub AS cust ON sub.id=cust.subid WHERE sub.id=\''+req.query.subid+'\'';

    poolrdonly.getConnection(function(err,conn){  
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.json(results);
                }
            });
        }
    });
 })

 app.get(base+'subject', function(req,res){
    var sql = 'SELECT * FROM t_subject ORDER BY updatetime ASC';

    poolrdonly.getConnection(function(err,conn){  
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    res.json(results);
                }
            });
        }
    });

 })

 app.get(base+'verifytask/terminal/status', function(req,res){
    var page = parseInt(req.query.page);
    if((page === undefined) || (page < 1)){
        page = 1;
    }
    var pagesize = parseInt(req.query.pagesize);
    if((pagesize === undefined) || (pagesize < 1)){
        pagesize = 15;
    }
    var final = {
        total:0,
        page:page,
        pagesize:pagesize,
        data:[]
    }
    final.data = req.query.terminals;
    var phones = '\(';
    for(var i=0; i<final.data.length; i++){
        //console.log("ph=" + final.data[i].phonenum);
        phones += final.data[i].phonenum;
        if(i < final.data.length - 1){
            phones += ',';
        }
    }
    phones += '\)';

    var sql = 'SELECT t_pnt.phonenum phonenum, t_pnt.state sta, t_cons.nextrate nextrate, t_sta.totalcount finish_cnt, t_pnt.protocolver prov,'
        + ' t_pnt.buildid buildid, t_pnt.buildidkey buildidkey, t_cons.createtime createtime, t_pnt.id imsi'
        + ' FROM t_pnterminal as t_pnt'
        + ' left join t_vt_consume as t_cons on t_cons.imsi = t_pnt.id'
        + ' left join t_vt_statistics as t_sta on t_pnt.phonenum = t_sta.phonenum'
        + ' WHERE t_pnt.phonenum IN ' + phones;
    poolrdonly.getConnection(function(err,conn){  
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                conn.release();   
                if(err){
                    res.status(500).json({error:err});
                }else{
                    //console.log("final2:"+JSON.stringify(results));
                    for(var i=0; i<results.length; i++){
                        for(var j=0; j<final.data.length; j++){
                            if(final.data[j].phonenum === results[i].phonenum){
                                results[i]["failed_cnt"] = final.data[j].failed_cnt;
                                break;
                            }
                        }
                    }
                    final.data = results;
                    res.status(200).json(final);
                }
            });
        }
    });
 })

 app.get(base+'verifytask/terminal', function(req,res){
    var page = parseInt(req.query.page);
    if((page === undefined) || (page < 1)){
        page = 1;
    }
    var pagesize = parseInt(req.query.pagesize);
    if((pagesize === undefined) || (pagesize < 1)){
        pagesize = 15;
    }

    var phones = '\(';
    var final = {
        total:0,
        page:page,
        pagesize:pagesize,
        data:[]
    }
    var poolTemp = mysql.createPool({  
        host: req.query.addr,
        user: req.query.user,
        password: req.query.pwd,
        database: 'vaddservice',
        port: req.query.port,
    });
    var sql = 'SELECT count(1) total FROM '
    + ' (SELECT vtask.phonenum phonenum, count(1) cnt FROM t_verifytaskfail vtask '
    + ' where status=\'1\' and vtask.subid=\'' + req.query.subid + '\' '
    + ' group by phonenum) as tt where tt.cnt>=10 ';
    poolTemp.getConnection(function(err,conn){
        if(err){
            res.status(500).json({error:err});
        }else{
            conn.query(sql,function(err,results,fields){ 
                if(err){
                    conn.release();
                    res.status(500).json({error:err});
                }else{
                    //console.log(results[0].total);
                    final.total = results[0]['total'];
                    final.data = Array;
                    //console.log(final);
                    var offset = (page - 1) * pagesize;
                    var sql2 = 'SELECT tt.phonenum, tt.failed_cnt from '
                    + ' (SELECT vtask.phonenum, count(1) failed_cnt FROM t_verifytaskfail vtask '
                    + ' where status=\'1\' and vtask.subid=\'' + req.query.subid + '\' '
                    + ' group by phonenum) as tt where tt.failed_cnt>=10 '
                    + ' order by failed_cnt desc '
                    + ' limit ' + offset + ',' + pagesize;
                    //console.log(sql);
                    conn.query(sql2,function(err,results,fields){ 
                        conn.release();
                        if(err){
                            res.status(500).json({error:err});
                        }else{
                            final.data=results;
                            res.status(200).json(final);                            
                        }
                    });
                }
            });
        }
    });
 })


 app.post(base+'vtf/deviation', function(req,res){
  //console.log(JSON.stringify(req.body))
  var phonenums = req.body.phonenums;
  var key = req.query.apikey;
  var subid = req.query.subid;
  var date = req.query.date;

  //console.log(phonenums);
  var sql = 'SELECT phonenum,createtime,updatetime,status,verifysms FROM t_verifytaskfail WHERE status>=103 AND phonenum in (' + phonenums
  sql = sql.replace(/(,*$)/g,""); //去尾部,
  sql +=')';
  if(key !== undefined && key.trim().length > 0){
    sql += ' AND apikey=\''+key+'\'';
  }
  if(subid !== undefined && subid.trim().length > 0){
    sql += ' AND subid=\''+subid+'\'';
  }

  sql += ' AND date_format(createtime, \'%Y-%m-%d\')=\''+date + '\'';
  //console.log(sql)

  poolrdonly.getConnection(function(err,conn){  
    if(err){
        res.status(500).json({error:err});
    }else{
        conn.query(sql,function(err,results,fields){ 
            conn.release();   
            if(err){
                res.status(500).json({error:err});
            }else{
                res.status(200).json(results);
            }
        });
    }
  });
 })


 app.post(base+'vtf/items', function(req,res){
  var phones = req.body.phones;
  var key = req.query.apikey;
  var subid = req.query.subid;
  var date = req.query.date;

  var sql = 'SELECT phonenum,createtime,updatetime,status,verifysms FROM t_verifytaskfail WHERE phonenum in (' + phones + ')';
  if(key !== undefined && key.trim().length > 0){
    sql += ' AND apikey=\''+key+'\'';
  }
  if(subid !== undefined && subid.trim().length > 0){
    sql += ' AND subid=\''+subid+'\'';
  }

  sql += ' AND date_format(createtime, \'%Y-%m-%d\')=\''+date + '\'';
  sql += ' ORDER BY phonenum asc, createtime asc'
  //console.log(sql)

  poolrdonly.getConnection(function(err,conn){  
    if(err){
        res.status(500).json({error:err});
    }else{
        conn.query(sql,function(err,results,fields){ 
            conn.release();   
            if(err){
                res.status(500).json({error:err});
            }else{
                res.status(200).json(results);
            }
        });
    }
  });
 })


var server = app.listen(3000, function () {
 
    var host = server.address().address
    var port = server.address().port
   
    console.log("vadd nodejs server http://%s:%s", host, port)
   
})