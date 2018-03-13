/* node.js 作为后台在ali从库上执行数据库查询
* 需要安装 cnpm install mysql -g， 可选安装 cnpm install @types/mysql -g
* 使用express做框架  cnpm install express -g
* 要上传json数据  cnpm install body-parser -g
* moment 处理时间容易一点   cnpm install moment -g
*/
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var mysql  =require("mysql"); 
var moment = require('moment');

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

app.get(base+'login', function (req, res) {
    console.log("get login");
    var create = moment().format('YYYY-MM-DD h:mm:ss'); 
    res.jsonp({test:create});
})

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

app.post(base+'datatarget/imeis', function (req, res) {
    console.log("post datatarget/imeis body:"+JSON.stringify(req.body));
    var data = req.body;
    var start = data.start;
    var end = data.end;
    var quota = data.quota;
    var custkey = data.custkey;
    var array = data.imeiarr;
    var len = array.length;
    
    var create = moment().format('YYYY-MM-DD h:mm:ss'); 
    var sql1 = 'INSERT INTO t_imei_pub(`imei`, `custkey`, `start`, `end`, `quota`, `createtime`) VALUES(';
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
    
    var index = i;
    var sql=sqlpart1 + '\'' + array[index]+'\','+sqlpart2;
   // console.log("inputImei:"+sql);
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