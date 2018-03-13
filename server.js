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

//测试接口 未使用
app.get(base+'login', function (req, res) {
    console.log("get login");
    var create = moment().format('YYYY-MM-DD h:mm:ss'); 
    res.jsonp({test:create});
})

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

//查询流量任务用户
app.get(base+'datatarget/customers', function (req, res) {
    console.log("get datatarget/customers");
    var sql = 'SELECT apikey,name,disp,quotas FROM t_customer';
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

//查询imei
app.get(base+'datatarget/imeis', function(req, res){
    console.log("get datatarget/imeis?query=" + JSON.stringify(req.query));
    var custkey = req.query.custkey;
    var taskTime = req.query.taskTime;
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
    
    var pubtime = taskTime.replace('-','');

    var sql = 'SELECT count(1) as total FROM t_imei_pub WHERE custkey=\''+custkey+'\' AND start<=\''+taskTime+'\' AND end>=\''+taskTime+'\'';
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
                    sql = sql.replace('count(1) as total','imei,createtime,start,end,quota,locate(\''+pubtime+'\',pubdate) as pub');
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

//曾经imei
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

var server = app.listen(3000, function () {
 
    var host = server.address().address
    var port = server.address().port
   
    console.log("vadd nodejs server http://%s:%s", host, port)
   
})