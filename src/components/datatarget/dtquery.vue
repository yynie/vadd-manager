<template>
    <div>
        <Card>
            <div slot="title">
                <Row>
                    <div class="filter-div">
                    <span style="color:#ff9900;marginRight:4px">客户</span>
                    <Select style="width:160px" v-model="userindex" @on-change="userChanged" :loading="custloading">
                        <Option v-for="item in customers" :value="item.index" :key="item.index">
                            <span>{{item.name}}</span>
                            <span style="float:right;color:#ccc">{{item.disp}}</span>
                        </Option>
                    </Select>
                    <Button :loading="custloading" style="height:30px" @click="loadCustomer" type="text" :disabled="data.loading"><u>刷新</u></Button>
                    </div>
                    <div class="filter-div">
                    <span v-show="!dateEditing" style="color:#ff9900;marginRight:4px">任务日期:<b style="marginLeft:4px;color:#19be6b">{{ currentDate }}</b></span>
                    <Button v-show="!dateEditing" style="height:30px" @click="dateEditing=true" type="text" :disabled="data.loading"><u>修改</u></Button>
                    <DatePicker v-show="dateEditing" @on-change="setTasktime" type="month" style="width:200px;" placeholder="选择日期和时间" ></DatePicker>
                    </div>
                    <div class="filter-div"> 
                    <span style="color:#ff9900;marginRight:4px">流量</span>
                    <Select style="width:160px;" v-model="quota">
                        <Option v-for="item in targetlist" :value="item" :key="item">{{ item }}</Option>
                    </Select>
                    </div>
                    <!-- <div class="filter-div" > 
                    <span style="color:#ff9900;marginRight:4px">状态</span>
                    <Select style="width:160px;" v-model="status">
                        <Option v-for="item in statuslist" :value="item" :key="item">{{ item }}</Option>
                    </Select>
                    </div> -->
                    <div class="filter-div-end">
                    <Button style="width:90px;height:34px" @click="loadAll" type="primary" :loading="data.loading">载&nbsp;&nbsp;&nbsp;&nbsp;入</Button>
                    </div>
                </Row>
                <Row style="margin:20px 0 0 0">
                <div class="filter-div">
                <span style="color:#ff9900;marginRight:4px">搜索IMEI</span>
                <Input v-model="search.imei" style="marginLeft:10px;width:280px" @on-keyup="search.imei=search.imei.replace(/[^0-9]/g,'')"></Input>
                <Button style="width:90px;height:34px" @click="searchOne" type="ghost" :disabled="search.imei.trim().length<15"><Icon type='search' size='20'></Icon></Button>
                </div>
                </Row>
            </div>
            <div>
                <Table :loading="data.loading" border stripe :columns="columns" :data="tableData" height='580'></Table>
                <div style="overflow: hidden; marginTop: 10px">
                    <div style="float: right;height:40px">
                        <Page v-show="!data.loading" show-total size="small" :page-size="data.pagesize" :total="data.total" :current="data.page" @on-change="changePage" :style="{lineHeight:'40px'}"></Page> 
                    </div>
                </div>
            </div>
        </Card>
    </div>
</template>
<script>
import moment from 'moment';
import {dtqueryColumns} from './table/publish';
export default {
    data () {
        return {
            custloading:false,
            customers:[],
            targetlist:[],
            userindex:'',
            custkey:'',
            taskTime:'',
            quota:'',
            status:'',
            statuslist:['不限','未开始','失败','完成','执行中'],
            dateEditing:false,
            search:{imei:''},
            data:{
                origin:[],
                loading:false,
                pagesize: 15,
                page:1,
                total:0
            },
        }
    },
    computed:{
        currentDate(){
            if(this.taskTime === ''){
                this.taskTime = moment().format("YYYY-MM");
            }
            return this.taskTime;
        },
        tableData(){
            return this.data.origin;
        },
        columns(){
            return dtqueryColumns();
        }
    },
    methods:{
        userChanged:function(value){
            if(this.userindex === ''){
                this.targetlist = [];
                this.quota='';
                this.custkey='';
                return;
            }
            
            this.targetlist = [
                "不限"
            ];
            var id = parseInt(this.userindex);
            this.custkey = this.customers[id].apikey;
            this.targetlist.push(...this.customers[id].quotas);
            this.quota="不限";
            this.status="不限";
        },
        setTasktime (datetime) {
            this.taskTime = datetime;
            this.dateEditing = false;
        },
        loadCustomer: function(){
            this.custloading = true;
            this.customers = [];
            this.custkey='';
            this.$http.get(URL_DATATARGET_GET_CUSTOMERS).then((response) => {
                console.log("response ok="+JSON.stringify(response.body));
                var index = 0;
                response.body.forEach(item => {
                    var one = {
                        index:index.toString(),
                        name:item.name,
                        disp:item.disp,
                        apikey:item.apikey,
                        quotas:JSON.parse(item.quotas)
                    };
                    this.customers.push(one);
                    index ++;
                });
                this.custloading = false;
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                this.errorMsg1="请求客户列表失败";
                this.$Message.error(this.errorMsg1);
                this.custloading = false;
            });
        },
        changePage:function(curpage){
            this.data.page = curpage;
            this.load();
        },
        loadAll:function(){
            this.data.page=1;
            this.load();
        },
        load:function(){
            if(this.custkey === ''){
                this.$Message.error("无有效客户");
                return;
            }
            
            var query = {
                custkey:this.custkey,
                page:this.data.page,
                pagesize:this.data.pagesize,
                tasktime:this.taskTime,
                pubstate:1,
                quota:0,
            }
            if(this.quota === '不限'){
                query.quota = 0;
            }else{
                query.quota = parseInt(this.quota);
            }
            console.log("query:"+JSON.stringify(query));
            this.data.loading = true;
            this.$http.get(URL_DATATARGET_IMEIS,{params:query}).then((response) => {
                if(response.status === 200){
                   var res = response.body;
                   if(res.total === 0){
                       this.data.page = 1;
                       this.data.total = 0;
                       this.data.loading = false;
                       this.data.origin = [];
                   }else{
                        var imeis = [];
                        this.data.origin = [];
                        res.data.forEach(item => {
                            var it = {
                                imei:item.imei,
                                total:item.quota,
                                state:'',
                                mode:'',
                                rest:'',
                                duration:'',
                                speed:'',
                                statetime:'',
                                updatetime:''
                            }

                            this.data.origin.push(it);
                            imeis.push(it.imei);
                        });
                        this.data.page = res.page;
                        this.data.total = res.total;
                        this.getTasks(query,imeis);
                   }
                }
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                this.$Message.error("网络错误!");
                this.data.loading = false;
            });
        },
        getTasks:function(basequery,imeis){
            if(imeis.length === 0){
                this.data.loading = false;
                return;
            }
            var params = {
                tasktime:basequery.tasktime.replace('-',''),
                status:'none',
                imeis:imeis
            }
            // if(this.status === '不限'){
            //     params.status = 'none';
            // }else if(this.status === '未开始'){
            //     params.status = 'off';
            // }else if(this.status === '错误'){
            //     params.status = 'error';
            // }else if(this.status === '完成'){
            //     params.status = 'done';
            // }else if(this.status === '执行中'){
            //     params.status = 'working';
            // }
            
            this.$http.post(URL_DATATARGET_GET_DTTASK,params).then((response) => {
                
                var array = response.body;
                var len = array.length;
                //console.log("response="+JSON.stringify(array)+",len="+len);
                var copy = [];
                copy.push(...this.data.origin);
                this.data.origin.splice(0, this.data.origin.length);
                copy.forEach((it) => {
                    for(var i=0; i<len; i++){
                        if(it.imei === array[i].imei){
                            it['total'] = array[i].total;
                            it['state'] = array[i].state.toString();
                            it['mode'] = array[i].mode;
                            it['rest'] = array[i].rest.toString();
                            it['duration'] = array[i].duration.toString();
                            it['speed'] = array[i].speed.toString();
                            it['statetime'] = moment(array[i].statetime).format('YYYY-MM-DD HH:mm:ss');
                            it['updatetime'] = moment(array[i].updatetime).format('YYYY-MM-DD HH:mm:ss');
                            this.data.origin.push(it);
                            break;
                        }
                    }
                });
                this.data.loading = false;
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                var error="请求失败(code:"+response.status+")";
                this.$Message.error(error);
                this.data.loading = false;
            })

        },
        searchOne:function(){
            if(this.custkey === ''){
                this.$Message.error("无有效客户");
                return;
            }
            
            var query = {
                custkey:this.custkey,
                tasktime:this.taskTime,
                pubstate:1,
                imei:this.search.imei
            }
            
            console.log("query:"+JSON.stringify(query));
            this.data.loading = true;
            this.$http.get(URL_DATATARGET_ONE_IMEI,{params:query}).then((response) => {
                if(response.status === 200){
                   var res = response.body;
                   console.log("res:"+JSON.stringify(res));
                   if(res.length === 0){
                       this.data.page = 1;
                       this.data.total = 0;
                       this.data.loading = false;
                       this.data.origin = [];
                   }else{
                        var imeis = [];
                        this.data.origin = [];
                        res.forEach(item => {
                            var it = {
                                imei:item.imei,
                                total:item.quota,
                                state:'',
                                mode:'',
                                rest:'',
                                duration:'',
                                speed:'',
                                statetime:'',
                                updatetime:''
                            }

                            this.data.origin.push(it);
                            imeis.push(it.imei);
                        });
                        this.data.page = 1;
                        this.data.total = res.length;
                        this.getTasks(query,imeis);
                   }
                }
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                this.$Message.error("网络错误!");
                this.data.loading = false;
            });
            
        }
  },
  mounted(){
      // console.log("dt mounted");
       this.loadCustomer();
   }
}
</script>
<style lang="less" scoped>
    @import './dtquery.less';
</style>

