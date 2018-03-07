<template>
    <div>
        <Row>
            <Col span="18">
            <Card>
            </Card>
            </Col>
            <Col span="6" class="padding-left-5">
            <Card>
                <span slot="title">
                    <Icon type="gear-a" size='18'></Icon><b>&nbsp;&nbsp;选&nbsp;项</b>
                </span>
                <p class="margin-top-20">
                    客户&nbsp;&nbsp;
                    <Select size="small" style="width:180px" v-model="selectedUser" :loading="loadingCustomer" @on-change="userChanged">
                        <Option v-for="item in customers" :value="item.name" :key="item.name">
                            <span>{{item.name}}</span>
                            <span style="float:right;color:#ccc">{{item.disp}}</span>
                        </Option>
                    </Select>
                </p>
                <p class="margin-top-20">
                    <Icon type="android-time"></Icon>&nbsp;任务日期&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b style="color:#19be6b">{{ currentDate }}</b>
                    <Button v-show="!dateEditing" size="small" @click="handleEditOpenness" type="text"><u>修改</u></Button>
                    <transition name="dttask-time">
                        <div v-show="dateEditing" class="dttask-time-picker">
                        <div class="margin-top-10">
                            <DatePicker @on-change="setPublishTime" type="date" style="width:200px;" placeholder="选择日期和时间" ></DatePicker>                                    
                        </div>
                        <div class="margin-top-10">
                            <Button type="primary" @click="handleChangeTaskTime">确认</Button>
                            <Button type="ghost" @click="cancelEditTaskTime">取消</Button>
                        </div>
                        </div>
                    </transition>
                </p>
                <div class="add-button-con margin-top-20">
                    <Button class="add-button" type="primary" :loading="readingImei">载入已入库imei</Button>
                    <Button class="add-button" @click="handleImportImei">导入新imei</Button>
                </div>
            </Card>
            <Card class="margin-top-10">
                <span slot="title">
                    <Icon type="paper-airplane" size='18'></Icon><b>&nbsp;&nbsp;发&nbsp;布</b>
                </span>
                <p class="margin-top-20">
                    <Icon type="play"></Icon>&nbsp;流量指标&nbsp;&nbsp;&nbsp;&nbsp;
                    <Select size="small" style="width:90px" v-model="selectedQuota">
                        <Option v-for="item in targetlist" :value="item" :key="item">{{ item }}</Option>
                    </Select>
                </p>
                 <p class="margin-top-20">
                     总数：<b>{{ data.total }}</b>
                 </p>
                 <p class="margin-top-10">
                     已发布：<b style="color:#19be6b">{{ data.pubed }}</b>
                 </p>
                 <p class="margin-top-10">
                     待发布：<b style="color:#ed3f14">{{ data.tobepub }}</b>
                 </p>
                 <div class="publish-button-con margin-top-20">
                 <Button class="publish-button" type="primary">发布</Button>
                 </div>
            </Card>
            </Col>
        </Row>
   
    </div>
</template>
<script>
import {SET_DT_CUSTOMER} from '../../store/mutation-types'
export default {
    data () {
        return {
            dateEditing:false,
            setTaskTime:'',
            taskTime:'',
            readingImei:false,
            loadingCustomer:true,
            selectedUser:'',
            selectedQuota:'',
            targetlist:[],
            data:{
                total:1000,
                pubed:200,
                tobepub:800,
            }
        }
    },
   computed: {
        currentDate(){
            if(this.taskTime === ''){
                var d = new Date;
                return d.getFullYear()+ "-" + ((d.getMonth() + 1)>9?(d.getMonth() + 1):"0"+(d.getMonth() + 1));
            }else{
                return this.taskTime;
            }
        },
        customers(){
            return this.$store.state.dataTarget.customers;
        }
    },
    methods:{
        handleEditOpenness:function(){
            this.dateEditing = !this.dateEditing;
        },
        setPublishTime (datetime) {
            this.setTaskTime = datetime;
        },
        handleChangeTaskTime: function() {
            this.taskTime = this.setTaskTime.substr(0,7);
            this.dateEditing = false;
        },
        cancelEditTaskTime: function() {
            this.publishTimeType = 'immediately';
            this.dateEditing = false;
        },
        handleImportImei: function(){

        },
        userChanged:function(value){
            console.log("userChanged:value="+value+ ",selectedUser="+this.selectedUser);
            this.targetlist = [
                "不限"
            ];
            this.$store.state.dataTarget.customers.forEach(item => {
                if(item.name === value){
                    this.targetlist.push(...item.quotas);
                }
            });
            this.selectedQuota="不限";
        },
        getDataTargetCumtomers: function(){
            var cus = [
                {name:"yyn", disp:"我的", quotas:["50","70","100"]},
                {name:"nyy", disp:"小号",quotas:["50"]}
            ]
            //TODO: 从数据库拿数据
            this.$store.commit(SET_DT_CUSTOMER, cus);
            this.loadingCustomer = false;
        }
   },
   mounted(){
       console.log("dt mounted");
       this.getDataTargetCumtomers();
   }
}
</script>
<style lang="less" scoped>
    @import './dttask.less';
</style>
