<template>
    <div>
        <Row>
        <div class="step-prestep-con" @click="preStep">
            <Icon type="ios-arrow-thin-left" size='30' color='#999'></Icon>
        </div>
        <div class="step-close-con" @click="close">
            <Icon type="ios-close-empty" size='30' color='#999'></Icon>
        </div>
        </Row>
        <Row class="step-header-con">
            <div>
            <h3>
                <Icon type="information-circled" size='18' style="marginRight:20px"></Icon>
                检测冲突
            </h3>
            </div>
        </Row>
        <div class="step-content-con">
            <Row>
                <span>客户: {{ customer.name }}</span>
                <span>{{ customer.disp }}</span>
            </Row>
            <div style="margin:20px;height:400px">
                <Row style="marginTop:26px">
                    <span style="color:#ff9900;marginRight:10px">
                        总数：<b>{{total}}</b>
                    </span>
                    <Progress :percent="percent" status="active">
                        <Icon v-show="status" size='18' type="checkmark-circled"></Icon>
                        <span></span>
                    </Progress>
                    <div style="height:20px">
                    <span style="height:20px">{{statusHint}}</span><Button v-show="status === 2" style="marginLeft:10px" size="small" type="error" @click="startChecking">重试</Button>
                    </div>
                </Row>
                <Row v-if="canCommit" style="marginTop:10px">
                    <div style="height:274px;border:1px solid #2b85e4">
                        <h4 style="margin:20px 0 0 20px;color:#2b85e4">有效IMEI共 {{commitTotal}} 个</h4>
                        <h4 style="margin:20px 0 0 20px;color:#2b85e4">流量指标 {{mydata.quota}} 兆</h4>
                        <h4 style="margin:20px 0 0 20px;color:#2b85e4">发布月: 从 {{mydata.start}} 到 {{mydata.end}}</h4>
                    </div>
                </Row>
                <Row v-else style="marginTop:10px">
                    <Table border stripe :columns="columns" :data="tableData" height='244'></Table>
                    <div style="float:right">
                    <Button style="marginTop:4px" type="error" :disabled="!canDeleteAll" @click="onDeleteAll">
                        删除所有冲突项
                    </Button>
                    </div>
                </Row>
                <Row style="marginTop:20px">
                    <Button style="marginTop:0px" type="primary" size="large" :disabled="!canCommit" :loading="commitingData" @click="commitData">
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;提&nbsp;&nbsp;&nbsp;&nbsp;交&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </Button>
                    <span style="marginLeft:20px;color:#ff9900">&gt;&gt; 待提交IMEI共&nbsp;&nbsp;<b>{{mydata.imeiarr.length}}</b>&nbsp;&nbsp;个 &lt;&lt;</span>
                </Row>
            </div>
        </div>
    </div>
</template>
<script>
import * as table from './table/publish';
import Util from '../../libs/util'
export default {
  name: 'checkimeiModal',
    props: {
        modal:Object
    },
    data () {
        return {
            index:0,
            status:0,//0 检测中, 1 完成， 2 错误
            errorimei:[],
            commitingData:false,
            mydata:{},
            total:0
        }
    },
    computed:{
        tableData(){
            return this.errorimei;
        },
        commitTotal(){
            if(this.mydata.imeiarr){
                return this.mydata.imeiarr.length;
            }
            return 0;
        },
        customer(){
            var cust={name:'', disp:''};
            if(this.mydata.customer){
                cust.name = this.mydata.customer.name;
                cust.disp = this.mydata.customer.disp;
            }
            return cust;
        },
        statusHint(){
            if(this.mydata.imeiarr){
                if(this.status === 1){
                    return "完成(" + this.index + "/" + this.total + ")";
                }else if(this.status === 2){
                    return "检测出错"
                }else{
                    return "正在检测(" + this.index + "/" + this.total + ")...";
                }
            }else{
                return "未工作"
            }
        },
        percent(){
            if(this.status === 1){
                return 100;
            }else if(this.mydata.imeiarr){
                var p = this.index * 100 / this.total;
                return p;
            }else{
                return 0;
            }
        },
        columns(){
            return table.checkcolumns(this);
        },
        canCommit(){
            return (this.errorimei.length === 0 && this.status === 1 && this.mydata.imeiarr.length>0)
        },
        canDeleteAll(){
            return (this.errorimei.length > 0 && this.status === 1)
        }
    },
    methods:{
        input(stepdata){
            this.mydata = stepdata;
            this.errorimei=[];
            if(this.mydata.imeiarr){
                this.total = this.mydata.imeiarr.length;
            }
        },
        startChecking(){
            this.errorimei=[];
            this.status = 0;
            this.index = 0;
            if(this.mydata.imeiarr.length > 0){
                
                this.checkNext();
            }
        },
        checkNext(){
            if(this.index < this.mydata.imeiarr.length){
                var imei = this.mydata.imeiarr[this.index];
                this.checkImei(imei);
            }else{
                this.status = 1;
            }
        },
        checkImei(imei){
            this.$http.get(URL_DATATARGET_CHECK_CONFLICT,{params:{imei:imei}}).then((response) => {
                if(response.status === 200){
                   // console.log("response ="+JSON.stringify(response));
                    var body = response.body;
                    if(body.length > 0){ //表示imei已存在
                        var o = {
                            imei:body[0].imei,
                            customer:body[0].custname + " " + body[0].custdisp,
                            status:"发布月: 从 "+body[0].start + " 到 " + body[0].end,
                        };
                        this.errorimei.push(o);
                    }
                    this.index++;
                    this.checkNext();
                }else{
                    console.log("response="+JSON.stringify(response));
                    this.$Message.error("网络错误!");
                    this.status = 2;
                }
               // setTimeout(function(){
                    // this.index++;
                    // this.checkNext();
               // }.bind(this),1000);
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                //var o = {imei:imei,customer:'',status:"网络错误"};
                //this.errorimei.push(o);
                this.$Message.error("网络错误!");
                this.status = 2;
            });
        },
        close:function(){
            this.$emit('on-cancel');
            this.modal.close();
        },
        preStep:function(){
            this.$emit('on-prestep');
        },
        onDelete:function(imei){
            console.log("errorimei="+JSON.stringify(this.errorimei));
            console.log("mydata="+JSON.stringify(this.mydata));
            var index = -1;
            for (var i = 0; i < this.errorimei.length; i++) {
                if (this.errorimei[i].imei === imei){
                    index = i;
                    break;
                }
            }
            if(index > -1){
                this.errorimei.splice(index, 1);
                 Util.removeFromArray(this.mydata.imeiarr,imei);
            }
            console.log("errorimei="+JSON.stringify(this.errorimei));
            console.log("mydata="+JSON.stringify(this.mydata));
        },
        onDeleteAll:function(){
            console.log("errorimei="+JSON.stringify(this.errorimei));
            console.log("mydata="+JSON.stringify(this.mydata));
            this.errorimei.forEach(item=>{
                Util.removeFromArray(this.mydata.imeiarr,item.imei);
            });
            this.errorimei=[];
            console.log("errorimei="+JSON.stringify(this.errorimei));
            console.log("mydata="+JSON.stringify(this.mydata));
        },
        commitData: function(){
            this.commitingData = true;
            this.$emit('on-commit', this.mydata);
            this.commitingData = false;
        }
    }
}
</script>

<style lang="less" scoped>
    @import './modal.less';
</style>