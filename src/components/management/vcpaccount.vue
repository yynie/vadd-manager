<template>
    <div>
        <Card>
            <div slot="title" style="padding:10px 10px 0 10px">
                <p >VCP 账户：<span style="color:#aaa;font-weight:1">(数据涉及主从同步，会有延时)</span></p>
                <div style="margin:10px 20px 0 20px">
                    <Tag v-show="showTip">{{tipInfo}}</Tag>
                    <seletable-tag v-show="data.accounts.length>0" v-for="item in data.accounts" type="gradual" :key="item.accname" :index="item.index" :selected="data.current"
                     @on-click="clickVCP">{{item.accname}}</seletable-tag>
                    <Button :disabled="data.loading" type="primary"  @click="loadVcp">刷&nbsp;&nbsp;新</Button>
                    <Button :disabled="data.loading" icon="ios-plus-empty" type="ghost"  @click="addOneVCP">新&nbsp;&nbsp;增</Button>
                </div>
            </div>
            <div style="padding:20px">
                <Table :loading="data.loading" border stripe :show-header="false" no-data-text="请选择VCP" size="small"
                :columns="vcpcolumns" :data="tableData" width="800"></Table>

                <p style="margin:20px 0 4px 0; color:#ff9900">————————————  已绑定的网页用户  ————————————</p>

                <Table  style="marginTop:10px" :loading="retail.loading===1" border stripe :show-header="false" size="small"
                :columns="vcpRetailColumes" :data="retail.info" width='800'></Table>

                <Row style="margin:10px;width:780px" v-show="retail.loading===2">
                    <Button v-show="retail.has===true" type="primary" style="float:right;marginLeft:10px" @click="lockPwd">锁&nbsp;定&nbsp;密&nbsp;码</Button>
                    <Button v-show="retail.has===true" type="primary" style="float:right;marginLeft:10px" @click="resetPwd">重&nbsp;置&nbsp;密&nbsp;码</Button>
                    <Button v-show="retail.has===true" type="primary" style="float:right" @click="charge(true)">小&nbsp;额&nbsp;充&nbsp;值</Button>
                    <Button v-show="retail.has===false" type="primary" style="float:right" @click="addRetail">创&nbsp;建</Button>
                </Row>

                <p style="margin:10px 0 4px 0; color:#ff9900">————————————  项目授权  ————————————</p>
                <Table :loading="subject.loading" border stripe  size="small" :columns="subcolumns" :data="subject.items" width="800" height="300"></Table>
                <Row style="margin:10px;width:780px">
                    <div style="float:right">
                <Button :disabled="data.loading||subject.loading" type="primary"  @click="addSubject">添&nbsp;&nbsp;加&nbsp;&nbsp;授&nbsp;&nbsp;权</Button>
                    </div>
                </Row>
            </div>
        </Card>
    </div>
</template>
<script>
import {VcpColumns,SubjectColumns,VcpRetailColumes} from './table/table';
import fullscreenVue from '../common/fullscreen.vue';
export default {
    data () {
        return {
            data:{
                loading:false,
                accounts:[],
                current:0
            },
            info:[],
            subject:{
                loading:false,
                items:[]
            },
            retail:{
                //0:未获取-获取失败  1:载入中  2:载入成功
                loading:0,
                has:false,
                info:[{a:"用户名",b:"未注册"}]
            },
            modifyvalue:'',
            modifysub:Object
        }
    },
    computed:{
        vcpcolumns(){
            return VcpColumns(this);
        },
        subcolumns(){
            return SubjectColumns(this);
        },
        vcpRetailColumes(){
            return VcpRetailColumes();
        },
        tableData(){
            return this.info;
        },
        showTip(){
            if(this.data.loading === true){
                return true;
            }else if(this.data.accounts.length === 0){
                return true;
            }
            return false;
        },
        tipInfo(){
            if(this.data.loading === true){
                return "LOADING....";
            }else if(this.data.accounts.length === 0){
                return "无 VCP 账号";
            }
            return '';
        }
    },
    methods:{
        loadVcp: function(){
            this.data.loading = true;
            this.data.accounts = [];
            this.$http.get(URL_VCP_ACCOUNTS).then((response) => {
                //console.log("response ok="+JSON.stringify(response.body));
                var index = 0;
                response.body.forEach(item => {
                    var one = {
                        index:index,
                        accname:item.accname,
                        disp:item.disp,
                        apikey:item.apikey,
                        accbalance:item.accbalance,
                        test:item.test
                    };
                    this.data.accounts.push(one);
                    index ++;
                });
                this.clickVCP(0);
                this.data.loading = false;
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                this.$Message.error("请求失败(code:"+response.status+")");
                this.data.loading = false;
            });
        },
        loadCurrentVcp: function(){
            this.data.loading = true;
            var vcp = this.data.accounts[this.data.current];
            this.$http.get(URL_VCP_ACCOUNT,{params:{apikey:vcp.apikey}}).then((response) => {
                //console.log("response ok="+JSON.stringify(response.body));
                var item = response.body[0];
                if(vcp.apikey === item.apikey){
                    this.data.accounts[this.data.current].accname = item.accname;
                    this.data.accounts[this.data.current].disp = item.disp;
                    this.data.accounts[this.data.current].accbalance = item.accbalance;
                    this.data.accounts[this.data.current].test = item.test;
                    this.clickVCP(this.data.current);
                }else{
                    this.$Message.error("请求失败(apikey不匹配:"+item.apikey+")");
                }
                this.data.loading = false;
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                this.$Message.error("请求失败(code:"+response.status+")");
                this.data.loading = false;
            });
        },
        loadSubject: function(apikey){
            this.subject.loading = true;
            this.subject.items = [];
            this.$http.get(URL_VCP_SUB_CUST,{params:{apikey:apikey}}).then((response) => {
                //console.log("response ok="+JSON.stringify(response.body));
                var index = 0;
                response.body.forEach(item => {
                    var one = {
                        index:index,
                        subid:item.subid,
                        subtype:item.subtype,
                        subname:item.subname,
                        price:item.price,
                        onoff:item.onoff
                    };
                    this.subject.items.push(one);
                    index ++;
                });
                this.subject.loading = false;
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                this.$Message.error("请求项目表失败(code:"+response.status+")");
                this.subject.loading = false;
            });
        },
        loadVcpRetail: function(apikey){
            var moment = require('moment');
            this.retail.loading = 1;
            this.retail.info = [];
            this.$http.get(URL_VCP_ACCOUNT_RETAIL,{params:{apikey:apikey}}).then((response) => {
                if(response.body.length === 0) {
                    this.retail.has = false;
                    var item = response.body[0];
                    var name = {a:"用户名",b:"未注册"};
                    this.retail.info.push(name);
                    var md5pwd = {a:"密码md5",b:""};
                    this.retail.info.push(md5pwd);
                    var pwdtime = {a:"密码生成于",b:""};
                    this.retail.info.push(pwdtime);
                    var lockcount = {a:"密码试错",b:""};
                    this.retail.info.push(lockcount);
                }else {
                    this.retail.has = true;
                    var item = response.body[0];
                    console.log("resp=" + JSON.stringify(item));
                    var name = {a:"用户名",b:item.username};
                    this.retail.info.push(name);
                    var md5pwd = {a:"密码md5",b:item.md5pwd};
                    this.retail.info.push(md5pwd);
                    var pwdtime = {a:"密码生成于",b:moment(item.pwdtime).format('YYYY-MM-DD HH:mm:ss')};
                    this.retail.info.push(pwdtime);
                    var lockcount = {a:"密码试错",b:item.lockcount};
                    this.retail.info.push(lockcount);
                }
                this.retail.loading = 2;
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                this.$Message.error("请求散户失败(code:"+response.status+")");
                this.retail.loading = 0;
            });
        },
        addOneVCP: function(){
            var data = {name:'',apikey:'',disp:'',teston:true,testval:5};
            this.$Modal.confirm({
                render: (h) => {
                    return h('newvcp_edit', {
                        props:{
                            data:data
                        },
                    })
                },
                loading: true,
                onOk: () => {
                    console.log("onOk:"+JSON.stringify(data));
                    var commit={
                        accname:data.name.trim(),
                        disp:data.disp.trim(),
                        apikey:data.apikey,
                        test:-1
                    }
                    if(commit.apikey.length === 0){
                        this.$Message.error({content:"APIKEY 未生成",duration:10});
                        this.$Modal.remove();
                        return;
                    }
                    if(commit.accname.length === 0 || commit.disp.length === 0){
                        this.$Message.error({content:"数据不全",duration:10});
                        this.$Modal.remove();
                        return;
                    }
                    if(data.teston === true){
                        commit.test=data.testval;
                    }
                    console.log("commit:"+JSON.stringify(commit));
                    this.$http.post(VURL_VCP_ACCOUNT,commit).then((response) => {
                        if(response.body.state === "200000"){
                            this.$Message.info("提交成功");
                            this.$Modal.remove();
                            this.loadVcp();
                        }else{
                            this.$Message.error("提交失败(state:"+response.body.state+")");
                            this.$Modal.remove();
                        }
                    },(response) => {
                        console.log("err:response="+JSON.stringify(response));
                        this.$Message.error("提交失败,网络错误(code:"+response.status+")");
                        this.$Modal.remove();
                    });
                }
            })
        },
        onItemClick: function(action){
            var vcp = this.data.accounts[this.data.current];
            console.log("do "+ action + " to vcp["+vcp.accname+"]");
            if(action === 'disp'){
                this.modifyDisp(action);
            }else if(action === 'charge'){
                this.charge(false);
            }else if(action === 'test'){
                this.testOnOff();
            }
        },
        modifyDisp:function(){
            var vcp = this.data.accounts[this.data.current];
            this.modifyvalue = vcp.disp;
            this.$Modal.confirm({
            render: (h) => {
                return h('div',[
                    h('p',{style:{marginBottom:'10px'}},'编辑'+vcp.accname+'的描述信息'),
                    h('Input', {props: {value: this.modifyvalue,autofocus: true,placeholder: '输入描述信息',maxlength:50},
                        on: {input: (val) => {
                                this.modifyvalue = val;
                            }}
                        })
                ])
                },
            loading: true,
            onOk: () => {
                this.modifyvalue = this.modifyvalue.trim()
                console.log('modifyvalue:'+this.modifyvalue);
                console.log('vcp:'+JSON.stringify(vcp));
                if(this.modifyvalue.length === 0){
                    this.$Message.error({duration:5,content:'内容不能为空！'})
                    this.$Modal.remove();
                }else if(this.modifyvalue === vcp.disp){
                    this.$Modal.remove();
                }else{
                    var commit = {apikey:vcp.apikey, disp:this.modifyvalue};
                    this.commitVcpInfo(commit);
                }
            }
            });
        },
        charge:function(isSmall){
            var title = (isSmall === true)?' 小额充值':' 账户充值';
            var minAmount = (isSmall === true)?10:1000;
            var vcp = this.data.accounts[this.data.current];
            this.modifyvalue = {money:minAmount,comments:''};
            this.$Modal.confirm({
            render: (h) => {
                return h('div',[
                    h('p',{style:{marginBottom:'30px'}},vcp.accname+title),
                    h('div',{style:{margin:'0 10px'}},[
                        h('span',{style:{marginRight:'10px'}},'充值金额'),
                        h('InputNumber',{props: {value: this.modifyvalue.money,autofocus: true,min:minAmount,max:10000},
                            on: {input: (val) => {
                                this.modifyvalue.money = val;
                                }}
                            }),
                        h('span',{style:{marginLeft:'10px'}},'元')
                    ]),
                    h('div',{style:{margin:'10px 10px 0 10px'}},[
                        h('p',{style:{marginRight:'10px'}},'备注'),
                        h('Input',{props: {value: this.modifyvalue.comments,type:'textarea',rows:2},
                            on: {input: (val) => {
                                this.modifyvalue.comments = val;
                                }}
                            })
                    ])
                ])
            },
            loading: true,
            onOk: () => {
                console.log('modifyvalue:'+JSON.stringify(this.modifyvalue));
                console.log('vcp:'+JSON.stringify(vcp));
                var commit = {apikey:vcp.apikey, recharge:this.modifyvalue.money, comments:this.modifyvalue.comments};
                this.commitVcpCharge(commit);
            }
            })
        },
        commitVcpCharge:function(commit){
            this.$http.post(VURL_VCP_ACCOUNT_CHARGE + "/" + commit.apikey, commit).then((response) => {
                if(response.body.state === "200000"){
                    this.$Message.success({duration:8,content:"提交成功！等等同步..."})
                    setTimeout(function(){
                        this.loadCurrentVcp();
                        this.$Modal.remove();
                    }.bind(this), 10* 1000);
                }else{
                    this.$Message.error("提交失败(state:"+response.body.state+")");
                    this.$Modal.remove();
                }
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                this.$Message.error("提交失败(code:"+response.status+")");
                this.$Modal.remove();
            })
        },
        testOnOff:function(){
            var vcp = this.data.accounts[this.data.current];
            if(vcp.test === null || vcp.test === undefined){
                this.modifyvalue = {on:false,val:0};
            }else{
                this.modifyvalue = {on:true,val:vcp.test};
            }
            let orig = {
                on:this.modifyvalue.on,
                val:this.modifyvalue.val
            };
            this.$Modal.confirm({
            render: (h) => {
                return h('div',[
                    h('p',{style:{marginBottom:'30px'}},vcp.accname+'测试开关'),
                    h('div',{style:{margin:'0 10px'}},[
                        h('span',{style:{marginRight:'46px'}},'开关'),
                        h('i-switch',{props:{value:this.modifyvalue.on},
                            on:{input: (val) => {
                                this.modifyvalue.on = val;
                                }}
                        }),
                    ]),
                    h('div',{style:{margin:'20px 10px 0 10px'}},[
                        h('span',{style:{marginRight:'20px'}},'测试次数'),
                        h('InputNumber',{props: {disabled:!this.modifyvalue.on,value: this.modifyvalue.val,autofocus: true,min:0,max:10},
                            on: {input: (val) => {
                                this.modifyvalue.val = val;
                                }}
                        })
                    ])
                ])
            },
            loading: true,
            onOk: () => {
                console.log('modifyvalue:'+JSON.stringify(this.modifyvalue));
                console.log('orig:'+JSON.stringify(orig));
                if(this.modifyvalue.on === false && orig.on === false){
                    this.$Modal.remove();
                }else if(this.modifyvalue.on === orig.on && this.modifyvalue.val === orig.val){
                    this.$Modal.remove();
                }else{
                    var testValue = this.modifyvalue.val;
                    var commit = {apikey:vcp.apikey, test:testValue};
                    if(this.modifyvalue.on == false){
                        commit['test']=-1;
                    }
                    this.commitVcpInfo(commit);
                }
            }
            })
        },
        commitVcpInfo:function(commit){
            this.$http.post(VURL_VCP_ACCOUNT + "/" + commit.apikey, commit).then((response) => {
                if(response.body.state === "200000"){
                    this.$Message.success({duration:8,content:"提交成功！等等同步..."})
                    setTimeout(function(){
                        this.loadCurrentVcp();
                        this.$Modal.remove();
                    }.bind(this), 10* 1000);
                }else{
                    this.$Message.error("提交失败(state:"+response.body.state+")");
                    this.$Modal.remove();
                }
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                this.$Message.error("提交失败(code:"+response.status+")");
                this.$Modal.remove();
            })
        },
        clickVCP: function(index){
            this.data.current = index;
            this.info = [];
            if(this.data.accounts.length > index){
                var vcp = this.data.accounts[index];
                //console.log("clickVCP("+vcp.accname+")")
                this.loadSubject(vcp.apikey);
                this.loadVcpRetail(vcp.apikey);
                var name = {a:"名称",b:vcp.accname,c:''};
                this.info.push(name);
                var disp = {a:"描述",b:vcp.disp,c:'修改',do:'disp'};
                this.info.push(disp);
                var key = {a:"KEY",b:vcp.apikey,c:''};
                this.info.push(key);
                var balance = {a:"余额",b:vcp.accbalance,c:'充值',do:'charge'};
                this.info.push(balance);
                var test = {a:"测试开关",c:'开启/关闭',do:'test'};
                if(vcp.test === null || vcp.test === undefined){
                    test['b'] = '未开启'
                }else{
                    test['b'] = '剩余次数:'+vcp.test;
                }
                this.info.push(test);
            }
        },
        onSubjectEdit:function(index){
            var sub = this.subject.items[index];
            var vcp = this.data.accounts[this.data.current];
            this.modifysub = {onoff:sub.onoff===0?false:true,price:sub.price};
            
            let orig = {
                onoff:this.modifysub.onoff,
                price:this.modifysub.price
            };
         
            this.$Modal.confirm({
            render: (h) => {
                return h('div',[
                    h('p',{style:{marginBottom:'30px'}},"["+sub.subname+']授权给'+vcp.accname+'?'),
                    h('div',{style:{margin:'0 10px'}},[
                        h('span',{style:{marginRight:'46px'}},'是否授权'),
                        h('i-switch',{props:{value:this.modifysub.onoff},
                            on:{input: (val) => {
                                this.modifysub.onoff = val;
                                }}
                        }),
                    ]),
                    h('div',{style:{margin:'20px 10px 0 10px'}},[
                        h('span',{style:{marginRight:'20px'}},'项目单价'),
                        h('InputNumber',{
                            props: {
                                disabled:!this.modifysub.onoff,
                                value: this.modifysub.price,
                                autofocus: true,
                                min:0.10,
                                max:50.00,
                                step:0.01
                            },
                            on: {input: (val) => {
                                this.modifysub.price = val;
                                }}
                        })
                    ])
                ])
            },
            loading: true,
            onOk: () => {
               // console.log('modifysub:'+JSON.stringify(this.modifysub));
                //console.log('orig:'+JSON.stringify(orig));
                if(this.modifysub.onoff === false && orig.onoff === false){
                    this.$Modal.remove();
                }else if(this.modifysub.onoff === orig.onoff && this.modifysub.price === orig.price){
                    this.$Modal.remove();
                }else{
                    var commit = {onoff:this.modifysub.onoff?1:0};
                    if(this.modifysub.onoff){
                        commit['price']=this.modifysub.price;
                    }
                    
                    this.authorizeSubject(vcp.apikey,sub.subid,commit);
                }
            }
            })
        },
        authorizeSubject:function(apikey,subid,commit){
            this.$http.post(VURL_VCP_SUBJECT_UPDATE,commit,{params:{apikey:apikey,subid:subid}}).then((response) => {
                if(response.body.state === "200000"){
                    this.$Message.success({duration:8,content:"提交成功！等等同步..."})
                    setTimeout(function(){
                        this.loadCurrentVcp();
                        this.$Modal.remove();
                    }.bind(this), 10* 1000);
                }else{
                    this.$Message.error("提交失败(state:"+response.body.state+")");
                    this.$Modal.remove();
                }
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                this.$Message.error("提交失败(code:"+response.status+")");
                this.$Modal.remove();
            })
        },
        onSubjectDelete:function(){
            this.$Message.info("没做,感觉不需要这个功能")
        },
        addSubject:function(){
            var vcp = this.data.accounts[this.data.current];
            var data = {subid:'',subname:'',subtype:'',requiredver:0,price:0.2,onoff:true,ok:false};
            this.$Modal.confirm({
                render: (h) => {
                    return h('addcustsub_edit', {
                        props:{
                            vcp:vcp,
                            data:data
                        },
                    })
                },
                loading: true,
                onOk: () => {
                    if(data.ok === false || data.subid.length === 0 || data.subname.length === 0){
                        this.$Message.error({duration:5,content:'您填写的信息不正确!'});
                        this.$Modal.remove();
                        return;
                    }
                    var commit={
                        apikey:vcp.apikey,
                        subid:data.subid,
                        subtype:data.subtype,
                        custname:vcp.accname,
                        subname:data.subname,
                        price:data.price,
                        onoff:data.onoff?1:0
                    }
                    console.log("addSubject="+JSON.stringify(commit));
                    this.$http.post(VURL_VCP_SUBJECT,commit).then((response) => {
                        if(response.body.state === "200000"){
                            this.$Message.success({duration:8,content:"提交成功！等等同步..."})
                            setTimeout(function(){
                                this.loadCurrentVcp();
                                this.$Modal.remove();
                            }.bind(this), 10* 1000);
                        }else{
                            this.$Message.error("提交失败(state:"+response.body.state+")");
                            this.$Modal.remove();
                        }
                    },(response) => {
                        console.log("err:response="+JSON.stringify(response));
                        this.$Message.error("提交失败(code:"+response.status+")");
                        this.$Modal.remove();
                    })
                }
            })
        },
        addRetail:function(){
            var data = {username:"",boundkey:this.data.accounts[this.data.current].apikey};
            this.$Modal.confirm({
                render:(h) => {
                    return h('addretail_edit', {
                        props:{
                            data:data
                        },
                    })
                },
                loading:0,
                onOk:() => {
                    if(data.username.length === 0) {
                        this.$Message.error({duration:5,content:'您填写的信息不正确!'});
                        this.$Modal.remove();
                        return;
                    }
                    var commit = {
                        username:data.username,
                        boundkey:data.boundkey
                    }
                    console.log("addRetail="+JSON.stringify(commit));
                    this.$http.post(VURL_VCP_ACCOUNT_RETAIL,commit).then((response) => {
                        if(response.body.state === "200000"){
                            this.$Message.success({duration:1,content:"提交成功！"})
                            setTimeout(function(){
                                this.showPwd(response.body.result);
                            }.bind(this), 1* 1000);
                        }else{
                            this.$Message.error("提交失败(state:"+response.body.state+")");
                            this.$Modal.remove();
                        }
                    },(response) => {
                        console.log("err:response="+JSON.stringify(response));
                        this.$Message.error("提交失败(code:"+response.status+")");
                        this.$Modal.remove();
                    })
                }
            })
        },
        showPwd:function(result){
            var data = {
                pwd:result.pwd,
                index:this.data.current
            }
            this.$Modal.success({
                title: '明文密码',
                content: data.pwd,
                onOk:() => {
                    this.$Message.success({duration:8,content:"等等同步..."})
                    setTimeout(function(){
                        this.$Modal.remove();
                        this.clickVCP(data.index);
                    }.bind(this), 4* 1000);
                }
            })
        },
        resetPwd:function(){
            var data = {
                boundkey:this.data.accounts[this.data.current].apikey
            }
            this.$Modal.confirm({
                title: '重置密码',
                content: '密码每天只能重置一次，并且不可找回。需要重置？',
                onOk:() => {
                    var commit = {
                        boundkey:data.boundkey
                    }
                    console.log("resetPwd="+JSON.stringify(commit));
                    this.$http.post(VURL_VCP_ACCOUNT_RETAIL_PWD,commit).then((response) => {
                        if(response.body.state === "200000"){
                            this.$Message.success({duration:1,content:"提交成功！"})
                            setTimeout(function(){
                                this.showPwd(response.body.result);
                            }.bind(this), 1* 1000);
                        }else{
                            this.$Message.error("提交失败(state:"+response.body.state+")");
                            this.$Modal.remove();
                        }
                    },(response) => {
                        console.log("err:response="+JSON.stringify(response));
                        this.$Message.error("提交失败(code:"+response.status+")");
                        this.$Modal.remove();
                    })
                }
            })
        },
        lockPwd:function(){
            var data = {
                boundkey:this.data.accounts[this.data.current].apikey,
                index:this.data.current
            }
            this.$Modal.confirm({
                title: '锁定密码',
                content: '密码锁定后无法解锁。需要锁定？',
                onOk:() => {
                    var commit = {
                        boundkey:data.boundkey
                    }
                    console.log("lockPwd="+JSON.stringify(commit));
                    this.$http.post(VURL_VCP_ACCOUNT_RETAIL_LOCK,commit).then((response) => {
                        if(response.body.state === "200000"){
                            this.$Message.success({duration:1,content:"提交成功！等等同步..."})
                            setTimeout(function(){
                                this.$Modal.remove();
                                this.clickVCP(data.index);
                            }.bind(this), 4* 1000);
                        }else{
                            this.$Message.error("提交失败(state:"+response.body.state+")");
                            this.$Modal.remove();
                        }
                    },(response) => {
                        console.log("err:response="+JSON.stringify(response));
                        this.$Message.error("提交失败(code:"+response.status+")");
                        this.$Modal.remove();
                    })
                }
            })
        }
    },
    mounted(){
        this.loadVcp();
    }
}
</script>
<style lang="less" scoped>
.sh{
    background:#deebf8;
    margin-left:10px
}
</style>

