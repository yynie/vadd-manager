<template>
    <div>
        <Row>
            <Col :span="mainSpancols">
            <Card>
                <Row slot="title" >
                    <div class="filter-div">
                    <!--
                    <Icon style="color:#ff9900" type="speedometer"></Icon>
                    -->
                    <span style="color:#ff9900;marginLeft:0px;marginRight:10px">流量指标筛选:</span>
                    <Select style="width:120px" v-model="selectedQuota" @on-change="selectedQuotaChanged" :disabled="data.loading">
                        <Option v-for="item in targetlist" :value="item" :key="item">{{ item }}</Option>
                    </Select>
                    <!--
                    <Icon style="color:#ff5500;marginLeft:20px" type="speedometer"></Icon>
                    -->
                    <span style="color:#ff5500;marginLeft:20px;marginRight:10px">{{ currentDate }} 发布状态:</span>
                    <Select style="width:120px" v-model="selectedPubState" @on-change="selectedPubStateChanged" :disabled="data.loading">
                        <Option v-for="item in ['不限','已发布','未发布']" :value="item" :key="item">{{ item }}</Option>
                    </Select>
                    <Button style="marginLeft:20px;padding:6px 20px" type="primary" @click="filterImeis">
                        <Icon type='search' size='16'></Icon>
                    </Button>
                    </div>
                    
                    <div class="filter-div-right">
                        <Button type="ghost" @click="onlineCheckAll"  :disabled="data.loading">检测上线</Button>
                    </div>
                </Row>
                <Table :loading="data.loading" border stripe :columns="columns" :data="tableData" height='630'></Table>
                <div style="overflow: hidden; marginTop: 10px">
                    <div style="float: right;height:40px">
                        <Page v-show="!data.loading" show-total size="small" :page-size="data.pagesize" :total="data.total" :current="data.page" @on-change="changePage" :style="{lineHeight:'40px'}"></Page> 
                    </div>
                </div>
            </Card>
            </Col>
            <Col :span="subSpancols" class="padding-left-5">
            <Card>
                <span slot="title">
                    <Icon type="gear-a" size='18'></Icon><b>&nbsp;&nbsp;选&nbsp;项</b>
                </span>
                <p class="margin-top-20">
                    客户&nbsp;&nbsp;
                    <Select filterable size="small" style="width:180px" v-model="selectedUserID" :loading="loadingCustomer" @on-change="userChanged" :disabled="data.loading">
                        <Option v-for="item in customers" :value="item.index" :key="item.index">
                            <span>{{item.name}}</span>
                            <span style="float:right;color:#ccc">{{item.disp}}</span>
                        </Option>
                    </Select>
                    <Button :loading="loadingCustomer" size="small" @click="handleloadCustomer" type="text" :disabled="data.loading"><u>刷新</u></Button>
                    <p v-show="errorMsg1 !== ''" style="color:#f00;font-size:12px">*{{errorMsg1}}*</p>
                </p>
                <p class="margin-top-20">
                    <Icon type="android-time"></Icon>&nbsp;任务日期&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b style="color:#19be6b">{{ currentDate }}</b>
                    <Button v-show="!dateEditing" size="small" @click="handleEditOpenness" type="text"><u>修改</u></Button>
                    <transition name="dttask-time">
                        <div v-show="dateEditing" class="dttask-time-picker">
                        <div class="margin-top-10">
                            <DatePicker @on-change="setPublishTime" type="month" style="width:200px;" placeholder="选择日期和时间" ></DatePicker>                                    
                        </div>
                        <div class="margin-top-10">
                            <Button type="primary" @click="handleChangeTaskTime">确认</Button>
                            <Button type="ghost" @click="cancelEditTaskTime">取消</Button>
                        </div>
                        </div>
                    </transition>
                </p>
                <div class="add-button-con margin-top-20">
                    <Button class="add-button" type="primary" :loading="data.loading" @click="handleLoadAll">载入已入库imei</Button>
                    <Button class="add-button" @click="handleImportImei" :disabled="data.loading">导入新imei</Button>
                    
                    <Modal ref="modal1" v-model="importImei" :mask-closable="false" :closable="false" width="1200">
                        <addimei-modal ref="addimei" v-show="curStep===0" :customerid="selectedUserID" :modal="this.$refs.modal1"
                             @on-commit="addImeiCommit" @on-cancel="stepCanceled"></addimei-modal>
                        <checkimei-modal ref="checkimei" v-show="curStep===1" :modal="this.$refs.modal1" 
                            @on-commit="checkImeiCommit" @on-cancel="stepCanceled" @on-prestep="preStep"></checkimei-modal>
                        <commitimei-modal ref="commitimei" v-show="curStep===2" :modal="this.$refs.modal1"
                            @on-commit="commitImeiDone"></commitimei-modal>
                        <div slot="footer">
                            <work-flow :steps="addimeiSteps" :current="curStep" :status="curStepStatus"></work-flow>
                        </div>
                    </Modal>
                    
                </div>
            </Card>
            <Card class="margin-top-10">
                <span slot="title">
                    <Icon type="paper-airplane" size='18'></Icon><b>&nbsp;&nbsp;发&nbsp;布</b>
                </span>
                <p class="margin-top-20">
                    <Icon type="play"></Icon>&nbsp;范围&nbsp;&nbsp;&nbsp;&nbsp;
                    <Select size="small" style="width:180px" v-model="selectedPubRange"  :disabled="data.loading">
                        <Option v-for="item in pubRangetlist" :value="item.name" :key="item.name">
                            <span>{{item.name}}</span>
                            <span style="float:right;color:#ccc">{{item.disp}}</span>
                        </Option>
                    </Select>
                </p>
                 <p class="margin-top-10">
                     待发布数量：<b style="color:#ed3f14">{{ pubcalc }}</b>
                 </p>
                 <div class="publish-button-con margin-top-20">
                 <Button class="publish-button" type="primary"  :disabled="data.loading">发布</Button>
                 </div>
            </Card>
            <Card class="margin-top-10">
                <span slot="title">
                    <Icon type="information-circled" size='18'></Icon>&nbsp;&nbsp;&nbsp;&nbsp;{{currentDate}} 任务数量:
                </span>
                    <p >
                        总数：<b>{{ info.total>=0?info.total:((info.total=== -2)?"获取中":"未知") }}</b>
                    </p>
                    <p class="margin-top-10">
                        已发布：<b style="color:#19be6b">{{ info.pubed>=0?info.pubed:((info.pubed=== -2)?"获取中":"未知") }}</b>
                    </p>
                    <p class="margin-top-10">
                        待发布：<b style="color:#ed3f14">{{ info.tobepub>=0?info.tobepub:((info.tobepub=== -2)?"获取中":"未知") }}</b>
                    </p>
            </Card>
            </Col>
        </Row>
   
    </div>
</template>
<script>
import {SET_DT_CUSTOMER} from '../../store/mutation-types'
import * as table from './table/publish';
import addimeiModal from './addImeiModal.vue';
import workFlow from '../common/workFlow.vue';
import checkimeiModal from './checkImeiModal.vue'
import commitimeiModal from './commitImeiModal.vue'
import moment from 'moment';
export default {
    components: {
        //'addimei-modal':AddImeiModal
        addimeiModal,
        checkimeiModal,
        commitimeiModal,
        workFlow
    },
    data () {
        return {
            dateEditing:false,
            setTaskTime:'',
            taskTime:'',
            importImei:false,
            loadingCustomer:true,
            selectedUserID:'',
            selectedQuota:'',
            selectedPubState:'',
            targetlist:[],
            data:{
                loading:false,
                origin:[],
                filterdata:[],
                pagesize: 15,
                page:1,
                total:0,
                tobepub:0,
                filteredtobepub:0,
                query:{status:0,quota:0},
                filter:{pub:'',online:''},
            },
            info:{
                total:-1,
                pubed:-1,
                tobepub:-1
            },
            errorMsg1:'',
            selectedPubRange:'全部',
            pubRangetlist:[{name:'全部',disp:''},{name:'当前筛选项',disp:''},{name:'当前页',disp:''}],
            addimeiSteps:[{title:'新增',describe:'导入或手动输入'},{title:'检测',describe:'检测冲突'},{title:'提交',describe:'提交至数据库'}],
            curStep:0,
            curStepStatus:'process'
           // stepData:{}
        }
    },
   computed: {
        columns(){
            return table.columns(this);
        },
        mainSpancols(){
            return this.$store.state.isCollapsed?19:18;
        },
        subSpancols(){
            return this.$store.state.isCollapsed?5:6;
        },
        currentDate(){
            if(this.taskTime === ''){
                this.taskTime = moment().format("YYYY-MM");
           //     console.log("currentDate:"+this.taskTime);
           //     var d = new Date;
           //     this.taskTime = d.getFullYear()+ "-" + ((d.getMonth() + 1)>9?(d.getMonth() + 1):"0"+(d.getMonth() + 1));
            }
            return this.taskTime;
        },
        customers(){
            return this.$store.state.dataTarget.customers;
        },
        tableData(){        
            return this.data.filterdata;
        },
        pubcalc(){
            if(this.selectedPubRange === '全部'){
                return this.info.tobepub>=0?this.info.tobepub:((this.info.tobepub=== -2)?"获取中":"未知");
            }else if(this.selectedPubRange === '当前筛选项'){
                return this.data.filteredtobepub;
            }else{
                return this.data.tobepub;
            }
        }
    },
    methods:{
        handleEditOpenness:function(){
            this.dateEditing = !this.dateEditing;
        },
        setPublishTime (datetime) {
            console.log("setPublishTime:"+datetime);
            this.setTaskTime = datetime;
        },
        handleChangeTaskTime: function() {
            this.taskTime = this.setTaskTime;
            this.dateEditing = false;
            this.clearTable(true);
            if(this.selectedUserID === ''){
                this.info.total = -1;
                this.info.pubed = -1;
                this.info.tobepub = -1;
                return;
            }
            
            var id = parseInt(this.selectedUserID);
            var user = this.$store.state.dataTarget.customers[id];
        },
        cancelEditTaskTime: function() {
            this.publishTimeType = 'immediately';
            this.dateEditing = false;
        },
        changePage: function(curpage){
            this.data.page = curpage;
            console.log("page change to " + this.data.page);
            if(this.selectedUserID === ''){
                console.error("page change no user");
                return;
            }else if(this.data.loading === true){
                console.error("page change in loading");
                return;
            }
            this.data.loading = true;
            var id = parseInt(this.selectedUserID);
            var user = this.$store.state.dataTarget.customers[id];
           
            var params = {
                custkey:user.apikey,
                page:this.data.page,
                pagesize:this.data.pagesize,
                taskTime:this.taskTime,
                pubstate:this.data.query.status,
                quota:this.data.query.quota
            }
            
            this.checkStatistics(user.apikey);
            this.getImeis(params);
        },
        handleImportImei: function(){
            if(this.selectedUserID === ''){
                this.$Message.error("请选择客户");
            }else{
                this.importImei=true;
            }
        },
        checkStatistics:function(custkey){
            console.log("checkStatistics:custkey="+custkey+",taskTime="+this.taskTime);
            this.info.total = -2;
            this.info.pubed = -2;
            this.info.tobepub = -2;
            this.$http.get(URL_DATATARGET_IMEIS_STATISTICS,{params:{custkey:custkey,tasktime:this.taskTime}}).then((response) => {
                if(response.status === 200){
               
                   this.info.total = response.body[0].total;
                   if(this.info.total === 0){
                        this.info.pubed = 0;
                        this.info.tobepub = 0;
                   }else{
                        this.info.pubed = response.body[0].pubed;
                        this.info.tobepub = response.body[0].tobepub;
                   }
                    console.log("checkStatistics:"+JSON.stringify(this.info));
                }else{
                    console.log("responseok="+JSON.stringify(response));
                    this.info.total = -1;
                    this.info.pubed = -1;
                    this.info.tobepub = -1;
                }
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                this.info.total = -1;
                this.info.pubed = -1;
                this.info.tobepub = -1;
            });
        },
        filterImeis: function(){
            if(this.selectedUserID === ''){
                this.$Message.error("请选择客户");
            }else if(this.data.loading === true){
                this.$Message.error("正在加载 请稍后");
            }else{
                this.data.loading = true;
                var id = parseInt(this.selectedUserID);
                var user = this.$store.state.dataTarget.customers[id];
                this.data.page = 1;

                var params = {
                    custkey:user.apikey,
                    page:this.data.page,
                    pagesize:this.data.pagesize,
                    taskTime:this.taskTime,
                    pubstate:this.data.query.status,
                    quota:this.data.query.quota
                }
                console.log("load:"+JSON.stringify(params));
                this.checkStatistics(user.apikey);
                this.getImeis(params);
            }
        },
        handleLoadAll: function(){
            if(this.selectedUserID === ''){
                this.$Message.error("请选择客户");
            }else if(this.data.loading === true){
                this.$Message.error("正在加载 请稍后");
            }else{
                this.selectedQuota="不限";
                this.selectedPubState="不限";
                this.data.loading = true;
                var id = parseInt(this.selectedUserID);
                var user = this.$store.state.dataTarget.customers[id];
                this.data.page = 1;

                var params = {
                    custkey:user.apikey,
                    page:this.data.page,
                    pagesize:this.data.pagesize,
                    taskTime:this.taskTime,
                    pubstate:0,
                    quota:0
                }
                console.log("load:"+JSON.stringify(params));
                this.checkStatistics(user.apikey);
                this.getImeis(params);
            }
        },
        getImeis:function(query){
            this.data.loading = true;
            this.$http.get(URL_DATATARGET_IMEIS,{params:query}).then((response) => {
                if(response.status === 200){
                   var res = response.body;
                   if(res.total === 0){
                       console.log("getImeis="+JSON.stringify(res));
                       this.clearTable(false);
                   }else{
                        this.parseData(res.data);
                  
                        this.data.page = res.page;
                        this.data.total = res.total;
                   }
                   this.data.loading = false;
                }else{
                    console.log("responseok="+JSON.stringify(response));
                    this.clearTable(false);
                    this.$Message.error("网络错误!");
                    this.data.loading = false;
                }
            },(response) => {
                this.clearTable(false);
                console.log("err:response="+JSON.stringify(response));
                this.$Message.error("网络错误!");
                this.data.loading = false;
            });
        },
        clearTable:function(clearInfo){
            this.data.origin=[];
            this.data.total=0;
            this.data.tobepub = 0;
            if(clearInfo === true){
                this.info.total = -1;
                this.info.pubed = -1;
                this.info.tobepub = -1;
            } 
        },
        parseData:function(data){
            this.data.origin=[];
            this.data.tobepub=0;
            data.forEach(item => {
                if(item.pub > 0){
                    
                }else{
                    this.data.tobepub ++;
                }
                var ct = moment(item.createtime);
                item.createtime = ct.format('YYYY-MM-DD HH:mm:ss');
                item['duration']=item.start+" ~ "+item.end;
                item['online']=3;
                this.data.origin.push(item);
            })
            this.filterTableData();
        },
        filterTableData:function(){
            this.data.filterdata = [];
            this.data.filteredtobepub = 0;
            
            if(this.data.origin.length == 0){
                return;
            }
            this.data.origin.forEach(item => {
                var add = true;
                if(this.data.filter.pub === 'pubed'){
                    add = (item.pub > 0);
                }else if(this.data.filter.pub === 'tobe'){
                    add = !(item.pub > 0);
                }
                if(this.data.filter.online === 'online'){
                    add = (item.online === 1);
                }else if(this.data.filter.online === 'offline'){
                     add = (item.online === 2);
                }else if(this.data.filter.online === 'unknown'){
                     add = (item.online === 3);
                }
                if(add === true){
                     if(item.pub > 0){
                    
                    }else{
                    this.data.filteredtobepub ++;
                    }
                    this.data.filterdata.push(item);
                }
            })
        },
        tablefilterRemote:function(checked, key, column){
          //  console.log("remoteFilter key:"+key+",checked="+checked);
            if(key === 'pub'){
                if(checked.length > 0){
                    if(checked[0] === 1)
                        this.data.filter.pub = 'pubed';
                    else if(checked[0] === 2)
                        this.data.filter.pub = 'tobe';
                }else{
                    this.data.filter.pub = '';
                }
            }else if(key === 'online'){
                 if(checked.length > 0){
                    if(checked[0] === 1)
                        this.data.filter.online = 'online';
                    else if(checked[0] === 2)
                        this.data.filter.online = 'offline';
                    else if(checked[0] === 3)
                        this.data.filter.online = 'unknown';
                 }else{
                     this.data.filter.online = '';
                 }      
            }
            console.log("remoteFilter filter:"+JSON.stringify(this.data.filter));
            this.filterTableData();
        },
        selectedQuotaChanged:function(value){
            console.log("selectedQuotaChanged:"+value);
            if(this.selectedQuota === "不限"){
                this.data.query.quota=0;
            }else{
                this.data.query.quota = parseInt(this.selectedQuota);
            }
            console.log("selectedQuotaChanged:quota="+this.data.query.quota);
        },
        selectedPubStateChanged:function(value){
            if(this.selectedPubState === "已发布"){
                this.data.query.status=1;
            }else if(this.selectedPubState === "未发布"){
                this.data.query.status=2;
            }else{
                this.data.query.status=0;
            }
        },
        userChanged:function(value){
            console.log("userChanged:value="+value+ ",selectedUserID="+this.selectedUserID);
            this.clearTable(true);

            if(this.selectedUserID === ''){
                this.targetlist = [];
                this.selectedQuota='';
                this.selectedPubState='';
                return;
            }
            
            this.targetlist = [
                "不限"
            ];
            var id = parseInt(this.selectedUserID);
            var user = this.$store.state.dataTarget.customers[id];
            this.targetlist.push(...user.quotas);
            // this.$store.state.dataTarget.customers.forEach(item => {
            //     if(item.name === value){
            //         this.targetlist.push(...item.quotas);
            //     }
            // });
            this.selectedQuota="不限";
            this.selectedPubState="不限";
            this.$refs.addimei.clear();
        },
        stepCanceled: function(){
            this.curStep=0;
            //this.stepData={};
        },
        preStep: function(){
            this.curStep--;
        },
        addImeiCommit: function(commit){
            console.log("addImeiCommit:" + JSON.stringify(commit));
            this.curStep++;
            this.$refs.checkimei.input(commit);
            this.$refs.checkimei.startChecking();
           // this.stepData=commit;
        },
        checkImeiCommit: function(commit){
            console.log("checkImeiCommit:" + JSON.stringify(commit));
            this.curStep++;
            this.$refs.commitimei.input(commit);
            this.$refs.commitimei.startCommit();
        },
        commitImeiDone: function(ok){
            this.curStep=0;
            if(ok === true){
                this.$refs.addimei.clear();
                //this.$refs.checkimei.clear();
                //this.$refs.commitimei.clear();
            }
            console.log("commitImeiDone ok="+ok);
        },
        handleloadCustomer: function(){
            this.loadingCustomer = true;
            this.errorMsg1='';
            this.selectedUserID='';
            this.$http.get(URL_DATATARGET_GET_CUSTOMERS).then((response) => {
                    //console.log("response ok="+JSON.stringify(response.body));
                    var cus = [];
                    var index = 0;
                    response.body.forEach(item => {
                        var one = {
                            index:index.toString(),
                            name:item.name,
                            disp:item.disp,
                            apikey:item.apikey,
                            quotas:JSON.parse(item.quotas)
                        };
                        //console.log("one="+JSON.stringify(one));
                        cus.push(one);
                        index ++;
                    });
                    //console.log("cus="+JSON.stringify(cus));
                    this.$store.commit(SET_DT_CUSTOMER, cus);
                    this.errorMsg1='';
                    this.loadingCustomer = false;
                    },(response) => {
                        console.log("err:response="+JSON.stringify(response));
                        this.errorMsg1="请求客户列表失败";
                        this.$Message.error(this.errorMsg1);
                        this.loadingCustomer = false;
                    });
        },
        onlineCheckAll: function(){

        },

        onlineCheck: function(id){
            console.log("onlineCheck:" + id);
        },
        pubOne: function(id){
            console.log("pubOne:" + id);
        }
   },
   mounted(){
      // console.log("dt mounted");
       this.handleloadCustomer();
   }
}
</script>
<style lang="less" scoped>
    @import './dttask.less';
</style>
