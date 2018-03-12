<template>
    <div>
        <Row>
            <Col :span="mainSpancols">
            <Card>
                <Row slot="title" >
                    <div class="filter-div">
                    <Icon style="color:#ff9900" type="speedometer"></Icon>
                    <span style="color:#ff9900;marginLeft:4px;marginRight:10px">流量指标筛选:</span>
                    <Select style="width:120px" v-model="selectedQuota" @on-change="selectedQuotaChanged">
                        <Option v-for="item in targetlist" :value="item" :key="item">{{ item }}</Option>
                    </Select>
                    </div>
                    
                    <div class="filter-div-right">
                        <Button type="ghost" @click="onlineCheckAll">检测上线</Button>
                    </div>
                </Row>
                <Table :loading="data.loading" border stripe :columns="columns" :data="tableData" height='630'></Table>
                <div style="overflow: hidden; marginTop: 10px">
                    <div style="float: right;height:40px">
                        <Page v-show="!data.loading" show-total size="small" :page-size="data.pagesize" :total="data.filtertotal" :current="data.page" @on-change="changePage" :style="{lineHeight:'40px'}"></Page> 
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
                    <Select filterable size="small" style="width:180px" v-model="selectedUserID" :loading="loadingCustomer" @on-change="userChanged">
                        <Option v-for="item in customers" :value="item.index" :key="item.index">
                            <span>{{item.name}}</span>
                            <span style="float:right;color:#ccc">{{item.disp}}</span>
                        </Option>
                    </Select>
                    <Button :loading="loadingCustomer" size="small" @click="handleloadCustomer" type="text"><u>刷新</u></Button>
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
                    <Button class="add-button" type="primary" :loading="data.loading" @click="handleLoad">载入已入库imei</Button>
                    <Button class="add-button" @click="handleImportImei">导入新imei</Button>
                    
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
                    <Select size="small" style="width:180px" v-model="selectedPubRange">
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
                 <Button class="publish-button" type="primary">发布</Button>
                 </div>
            </Card>
            <Card class="margin-top-10">
                <span slot="title">
                    <Icon type="information-circled" size='18'></Icon>&nbsp;&nbsp;&nbsp;&nbsp;{{currentDate}} 任务数量:
                </span>
                    <p >
                        总数：<b>{{ data.total }}</b>
                    </p>
                    <p class="margin-top-10">
                        已发布：<b style="color:#19be6b">{{ data.pubed }}</b>
                    </p>
                    <p class="margin-top-10">
                        待发布：<b style="color:#ed3f14">{{ data.tobepub }}</b>
                    </p>
            </Card>
            </Col>
        </Row>
   
    </div>
</template>
<script>
import {SET_DT_CUSTOMER} from '../../store/mutation-types'
import * as table from './table/publish';
import {datapub} from './table/testdata';
import addimeiModal from './addImeiModal.vue';
import workFlow from '../common/workFlow.vue';
import checkimeiModal from './checkImeiModal.vue'
import commitimeiModal from './commitImeiModal.vue'
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
            targetlist:[],
            data:{
                loading:false,
                origin:[],
                filterData:[],
                shown:[],
                pagesize: 5,
                filtertotal:0,
                filterTobePub:0,
                page:1,
                total:0,
                pubed:0,
                tobepub:0,
                filterAndSort:{status:0,online:0,quota:0}
            },
            errorMsg1:'',
            selectedPubRange:'全部',
            pubRangetlist:[{name:'全部',disp:''},{name:'筛选全部',disp:''},{name:'当前页',disp:''}],
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
                var d = new Date;
                this.taskTime = d.getFullYear()+ "-" + ((d.getMonth() + 1)>9?(d.getMonth() + 1):"0"+(d.getMonth() + 1));
            }
            return this.taskTime;
        },
        customers(){
            return this.$store.state.dataTarget.customers;
        },
        tableData(){        
            return this.data.shown;
        },
        pubcalc(){
            if(this.selectedPubRange === '全部'){
                return this.data.tobepub;
            }else if(this.selectedPubRange === '筛选全部'){
                return this.data.filterTobePub;
            }else{
                var count = 0;
                this.data.shown.forEach(item => {
                    if(item.status === false){
                        count++;
                    }
                });
                return count;
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
        },
        cancelEditTaskTime: function() {
            this.publishTimeType = 'immediately';
            this.dateEditing = false;
        },
        changePage: function(curpage){
            this.data.page = curpage;
            console.log("page change to " + this.data.page);
            this.generateShownData();
        },
        handleImportImei: function(){
            if(this.selectedUserID === ''){
                this.$Message.error("请选择客户");
            }else{
                this.importImei=true;
            }
        },
        handleLoad: function(){
            if(this.selectedUserID === ''){
                this.$Message.error("请选择客户");
            }else{
                this.data.origin = datapub.list;
                this.data.total = datapub.total;
                this.data.pubed = datapub.pubed;
                this.data.tobepub = datapub.tobepub;
                this.generateFilterData();
                this.generateShownData();
                this.data.loading = false;
            }
        },
        generateFilterData:function(){
            this.data.filterData = [];
            this.data.filterTobePub = 0;
            // if(this.data.origin.length === 0){
            //     return
            // }
            var status = this.data.filterAndSort.status;
            var online = this.data.filterAndSort.online;
            var quota = this.data.filterAndSort.quota;
            
            this.data.origin.forEach(item => {
                var add = true;
                if((status === 1) && (item.status === false)){
                    add = false;
                }else if((status === 2) && (item.status === true)){
                    add = false;
                }

                if((online === 1) && (item.online !== 1)){
                    add = false;
                }else if((online === 2) && (item.online !== 2)){
                    add = false;
                }else if((online === 3) && (item.online !== 3)){
                    add = false;
                }

                if(quota > 0 && quota != item.quota){
                    add = false;
                }

                if(add){
                    this.data.filterData.push(item);
                    if(item.status === false){
                        this.data.filterTobePub++;
                    }
                }
                this.data.filtertotal = this.data.filterData.length;
            });
        },
        generateShownData:function(){
            this.data.shown = [];
            var start = this.data.pagesize * (this.data.page - 1);
            var size = Math.min(this.data.filterData.length - start,this.data.pagesize);

            for(var i=0; i<size; i++){
                this.data.shown.push(this.data.filterData[start+i]);
            }
            
        },
        selectedQuotaChanged:function(value){
            console.log("selectedQuotaChanged:"+value);
            if(this.selectedQuota === "不限"){
                this.data.filterAndSort.quota=0;
            }else{
                this.data.filterAndSort.quota = parseInt(this.selectedQuota);
            }
            console.log("selectedQuotaChanged:quota="+this.data.filterAndSort.quota);
            this.data.page = 1;
            this.generateFilterData();
            this.generateShownData();
        },
        tablefilterRemote: function(checked, key, column){
            console.log("tablefilterRemote:key="+key+",checked="+checked[0]);
            var value = 0;
            if(checked.length > 0){
                value = checked[0];
            }
            
            if(key === 'status'){//发布状态
                this.data.filterAndSort.status = value;
            }else if(key === 'online'){
                this.data.filterAndSort.online = value;
            }
            this.data.page = 1;
            this.generateFilterData();
            this.generateShownData();
        },
        userChanged:function(value){
            console.log("userChanged:value="+value+ ",selectedUserID="+this.selectedUserID);
            if(this.selectedUserID === ''){
                this.targetlist = [];
                this.selectedQuota='';
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
