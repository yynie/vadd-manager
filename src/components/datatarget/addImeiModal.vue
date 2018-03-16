<template>
    <div>
        <Row>
        <div class="step-close-con" @click="close">
            <Icon type="ios-close-empty" size='30' color='#999'></Icon>
        </div>
        </Row>
        <Row class="step-header-con">
            <div>
            <h3>
                <Icon type="information-circled" size='18' style="marginRight:20px"></Icon>
                导入imei
            </h3>
            </div>
        </Row>
        <div class="step-content-con">
            <Row>
                <span>客户: {{ customer.name }}</span>
                <span>{{ customer.disp }}</span>
                <div style="float:right">
                    <Button type="primary" size='small' icon="ios-upload"  @click="readExcel">导入Excel</Button>
                    <Button style="marginLeft:20px" type="ghost" size='small' @click="downloadSample">下载Excel模板</Button>
                </div>
            </Row>
            <div style="margin:20px;height:400px">
                <div>
                    <Row style="marginTop:20px">
                    <span style="color:#ff9900;marginRight:10px">流量指标:</span>
                    <Select :disabled="editQuota" style="width:120px" v-model="selectedQuota">
                        <Option v-for="item in targetlist" :value="item" :key="item">{{ item }}</Option>
                    </Select>
                    <Button v-show="!editQuota" type="primary" icon="edit" @click="addQuota">添加新指标</Button>

                    <InputNumber style="marginLeft:20px" v-show="editQuota" :max="300" :min="20" v-model="newquota"></InputNumber>
                    <Button v-show="editQuota" type="primary"  :loading="commitingQuota" @click="commitQuota">提交</Button>
                    <Button v-show="editQuota" type="ghost"  :disabled="commitingQuota" @click="cancelQuota">取消</Button>
                    </Row>
                    <Row style="marginTop:20px">
                        <span style="color:#ff9900;marginRight:10px">时间区间:</span>
                        <span style="marginLeft:4px;marginRight:10px">从</span>
                        <DatePicker type="month" placeholder="年-月" style="width: 120px" @on-change="setStartTime"></DatePicker>
                        <span style="marginLeft:4px;marginRight:10px">到</span>
                        <DatePicker type="month" placeholder="年-月" style="width: 120px" @on-change="setEndTime"></DatePicker>
                    </Row>
                    <Row style="marginTop:20px">
                        <p v-if="imeierror !== ''" style="color:#f00">{{imeierror}}</p>
                        <p v-else>多个号码用英文 , 号分隔</p>
                        <Input v-model="imeis" type="textarea" :rows="10" placeholder="Enter imei..."></Input>
                        <Button style="marginTop:20px" type="primary" size="large" :loading="commitingData" @click="commitData">
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;提&nbsp;&nbsp;&nbsp;&nbsp;交&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        </Button>
                    </Row>
                </div>
            </div>
        </div>
        
    </div>  
</template>
<script>
import Util from '../../libs/util'
export default {
    name: 'addimeiModal',
    props: {
        customerid:String,
        modal:Object
    },
    data () {
        return {
            curTargetList:[],
            selectedQuota:'',
            editQuota:false,
            commitingQuota:false,
            newquota:50,
            imeis:'',
            startMonth:'',
            endMonth:'',
            imeierror:'',
            commitingData:false,
            MAXLEN:5000
        }
    },
    computed:{
        customer(){   
            var id = parseInt(this.customerid);
            console.log("addimei:cust id="+id);
            var cust={name:'', disp:''};
            if(isNaN(id)){
                return cust;
            }else{
                var cust = this.$store.state.dataTarget.customers[id];
                return cust;
            }
        },
        targetlist(){
            if(this.curTargetList.length > 0){
                return this.curTargetList;
            }
            var id = parseInt(this.customerid);
            console.log("targetlist:cust id="+id);
            if(isNaN(id)){
                return this.curTargetList;
            }

            var cust = this.$store.state.dataTarget.customers[id];
                 
            this.curTargetList.push(...cust.quotas);
            this.selectedQuota=this.curTargetList[0];
            return this.curTargetList;
        }
    },
    methods:{
        clear:function(){
            this.imeis='';
            //this.startMonth='';
           // this.endMonth='';
            this.curTargetList=[];
            this.selectedQuota='';
            this.editQuota=false;
            this.commitingQuota=false;
            this.newquota=50;
            this.imeierror='';
            this.commitingData=false;
        },
        close:function(){
            //this.$emit('on-cancel');
            this.modal.close();
        },
        setStartTime:function(date){
            this.startMonth = date;
        },
        setEndTime:function(date){
            this.endMonth = date;
        },
        readExcel:function(){

        },
        downloadSample:function(){

        },
        addQuota:function(){
            this.editQuota = true;
        },
        cancelQuota:function(){
            this.editQuota = false;
        },
        commitQuota:function(){
            this.commitingQuota = true;
            if(Util.isInArray(this.curTargetList, this.newquota.toString()) === true){
                this.selectedQuota = this.newquota.toString();
                this.editQuota = false;
                this.commitingQuota = false;
            }else{
                var quotas = [...this.curTargetList, this.newquota.toString()];
                quotas.sort();
                var name = this.customer.name;
                console.log("commitQuota:name="+name+",quotas="+JSON.stringify(quotas));
                this.$http.post(URL_DATATARGET_ADD_QUOTA,{quotas:quotas,name:name}).then((response) => {
                        console.log("responseok="+JSON.stringify(response));
                        if(response.status === 200){
                            this.curTargetList = [...quotas];
                            this.selectedQuota = this.newquota.toString();
                            this.commitingQuota = false;
                            this.editQuota = false;
                        }else{
                            this.$Message.error("提交失败！");
                            this.commitingQuota = false;
                        }
                    },(response) => {
                        console.log("response="+JSON.stringify(response));
                        this.$Message.error("提交失败！");
                        this.commitingQuota = false;
                    }
                );
            }
        },
        commitData: function(){
            this.commitingData = true;
            if(this.imeis.length <= 0 || this.startMonth === '' || this.endMonth === ''){
                this.$Message.error("数据？有效期？哪个没填吧...");
                this.commitingData = false;
                return;
            }
            var data = this.imeis.replace(/(,*$)/g,""); //去尾部,
            data = data.replace(/(^,*)/g,"");//去头部,
            
            var arr = data.split(',');
            var imeilen = arr.length;
            //console.log("commitData "+ this.imeilen + ",start from " + this.startMonth + " end to " + this.endMonth);
            if(imeilen > this.MAXLEN){
                this.imeierror = "记录个数"+imeilen+"超过最大限制(2000个)";
            }else{
                this.imeierror = '';
                var commitarr = [];
                for(var i=0; i<imeilen; i++){
                    var item = arr[i].trim();
                    if(item.length === 0){
                        console.log("empty ignore");
                        continue;
                    }
                    var reg = /^[\d]+$/;
                    if(false === reg.test(item)){
                        this.imeierror = "记录"+item+"格式错误";
                        break;
                    }

                     if(item.length !== 15){
                        this.imeierror = "记录"+item+"不足15位";
                        break;
                    }

                    if(Util.isInArray(commitarr,item)){
                        this.imeierror = "记录"+item+"重复";
                        break;
                    }

                    commitarr.push(item);
                }
                if(this.imeierror === ''){
                    var commit = {
                        start:this.startMonth,
                        end:this.endMonth,
                        quota:this.selectedQuota,
                        imeiarr:commitarr,
                        customer:this.customer
                    }
                    //console.log("commitData "+ JSON.stringify(commit));
                    this.$emit('on-commit', commit);
                }
            }
            this.commitingData = false;
        }
    }
    
};
</script>
<style lang="less" scoped>
    @import './modal.less';
</style>