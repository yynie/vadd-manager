/* node.js 作为后台在ali从库上执行数据库查询
* 需要安装 cnpm install mysql -g， 可选安装 cnpm install @types/mysql -g
* 使用express做框架  cnpm install express -g
* 要上传json数据  cnpm install body-parser -g
*/
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var mysql  =require("mysql"); 

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
var pool = mysql.createPool({  
    host: '106.14.9.175',  
    user: 'mysql',  
    password: 'MySQL56Meng',  
    database: 'vaddservice',  
    port: '3188'
});  

app.get(base+'login', function (req, res) {
    console.log("get login");
    res.jsonp({test:"2222"});
})

app.post(base+'login', function (req, res) {
    console.log("body:"+JSON.stringify(req.body));
    var key = req.body.key;
    //AABBCCDDEEFF00112233445566770000
    var sql = 'SELECT accname,disp,apikey FROM t_account WHERE apikey=\'' + key + '\'';
    //console.log(sql);

    pool.getConnection(function(err,conn){  
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

var server = app.listen(3000, function () {
 
    var host = server.address().address
    var port = server.address().port
   
    console.log("vadd nodejs server http://%s:%s", host, port)
   
})