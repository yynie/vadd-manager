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
                    <Button style="marginLeft:20px" type="ghost" size='small'><!-- @click="downloadSample" -->
                        <a href="https://github.com/yynie/vadd-manager/raw/master/IMEI-%E6%89%B9%E9%87%8F%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx" 
                        download="IMEI-批量导入模板.txt">下载Excel模板</a>  
                        </Button>
                </div>
                <div style="float:right">
                    <Upload v-if="exxxLoading === false" action="" :before-upload="uploadExcel" :disabled="exxxLoading"
                     accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                     >
                        <Button type="primary" size='small' icon="ios-cloud-upload-outline">导入Excel</Button>
                    </Upload>
                    <Button v-else loading type="primary" size='small' icon="ios-cloud-upload-outline">正在上传..</Button>
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
                        <DatePicker type="month" placeholder="年-月" style="width: 120px" v-model="startMonth" format="yyyy-MM" @on-change="setStartTime"></DatePicker>
                        <span style="marginLeft:4px;marginRight:10px">到</span>
                        <DatePicker type="month" placeholder="年-月" style="width: 120px" v-model="endMonth" format="yyyy-MM" @on-change="setEndTime"></DatePicker>
                    </Row>
                    <Row style="marginTop:20px">
                        <p v-if="imeierror !== ''" style="color:#f00">{{imeierror}}</p>
                        <p v-else>多个号码用英文 , 号分隔</p>
                        <Input v-model="imeis" type="textarea" :rows="10" placeholder="Enter imei..."></Input>
                        <Button style="marginTop:20px" type="primary" size="large" :loading="commitingData" :disabled="editQuota" @click="commitData">
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
import XLSX from 'xlsx';
import moment from 'moment';
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
            MAXLEN:2000,
            exxxLoading:false
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
            this.startMonth='';
            this.endMonth='';
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
          //  console.log("setStartTime "+this.startMonth)
        },
        setEndTime:function(date){
            this.endMonth = date;
        },
        uploadExcel:function(file){
            if(typeof FileReader === undefined){
                this.$Message.error("浏览器不支持HTML5");
                return
            }
            this.exxxLoading = true;
            console.log("uploadExcel:"+file.name);
            if(!file){
                this.exxxLoading = false;
                return;
            }
            var importdata = null;
            var fileReader = new FileReader();
            let $me = this;
            fileReader.onload = function(ev) {
                try {
                    var data = ev.target.result;
                    const workbook = XLSX.read(data, {type: 'binary'});
                    if(workbook.SheetNames.length > 0){
                        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                        var json = XLSX.utils.sheet_to_json(worksheet);
                        console.log(JSON.stringify(json))
                        if(json.length > $me.MAXLEN){
                            $me.$Message.error({content:"批次导入数据请勿超过 "+$me.MAXLEN+" 条",duration:5});
                            $me.exxxLoading = false;
                            return;
                        }else if(json.length > 0){
                            var line0 = json[0];
                            importdata = {
                                quota:line0['流量'],
                                start:line0['发布开始于'],
                                end:line0['发布截至于'],
                                imeis:[]
                            };
                            if(importdata.quota === null || importdata.quota === undefined){
                                $me.$Message.error({content:"没解析到 [流量] ，请检查文件",duration:5});
                                $me.exxxLoading = false;
                                return;
                            }
                            if(importdata.start === null || importdata.start === undefined){
                                $me.$Message.error({content:"没解析到 [发布起始日期] ，请检查文件",duration:5});
                                $me.exxxLoading = false;
                                return;
                            }
                            if(importdata.end === null || importdata.end === undefined){
                                $me.$Message.error({content:"没解析到 [发布截至日期] ，请检查文件",duration:5});
                                $me.exxxLoading = false;
                                return;
                            }
                            var len = json.length;
                            for(var i=0; i<len; i++){
                                var imei = json[i].IMEI;
                                if(imei !== null && imei !== undefined){
                                    importdata.imeis.push(json[i].IMEI);
                                }
                            }
                        }
                        $me.fillExxxData(importdata);
                    }else{
                        $me.$Message.error({content:"文件格式错误",duration:5});
                        $me.exxxLoading = false;
                        return;
                    }
                }catch (e) {
                    console.log('文件类型err:'+e);
                    $me.$Message.error({content:"文件类型错误",duration:5});
                    $me.exxxLoading = false;
                    return;
                }
            }

            fileReader.readAsBinaryString(file);
        },
        fillExxxData:function(data){
            this.selectedQuota = '';
            this.startMonth = '';
            this.endMonth = '';
            this.imeis = ''
            if(data === null || data.imeis.length === 0){
                this.$Message.error("文件内容为空");
                this.exxxLoading = false;
                return;
            }
            var quotas = this.targetlist;
            if(Util.isInArray(quotas,data.quota)){
                //it's ok
                this.editQuota = false;
                this.selectedQuota = data.quota;
            }else{
                this.editQuota = true;
                this.newquota = parseInt(data.quota);
            }
            this.startMonth = data.start;
            this.endMonth = data.end;
            data.imeis.forEach(imei => {
                this.imeis += imei + ",";
            });
            this.imeis = this.imeis.replace(/(,*$)/g,"");
            this.exxxLoading = false;
        },
        downloadSample:function(){
            //出现一个新窗口 然后又自动消失 感觉很low
           // window.open("https://github.com/yynie/vadd-manager/raw/master/IMEI-%E6%89%B9%E9%87%8F%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx");
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
           // console.log("commitData "+ imeilen + ",start from " + this.startMonth + " end to " + this.endMonth);
            if(imeilen > this.MAXLEN){
                this.imeierror = "记录个数"+imeilen+"超过最大限制("+this.MAXLEN+"个)";
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
                        start:moment(this.startMonth).format('YYYY-MM'),
                        end:moment(this.endMonth).format('YYYY-MM'),
                        quota:this.selectedQuota,
                        imeiarr:commitarr,
                        customer:this.customer
                    }
                   // console.log("commitData "+ JSON.stringify(commit));
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