<template>
    <div>
        <Row>
            <span>添加项目授权</span><span style="color:#ff9900;marginLeft:10px">[客户:{{vcp.accname}}]</span>
        </Row>
        <Row style="marginTop:10px">
        <span>填写subid</span><Input v-model="mydata.subid" style="marginLeft:10px;width: 280px" 
            @on-blur="checkSubid" @on-change="onChangeSubid"
            @on-keyup="mydata.subid=mydata.subid.replace(/[^0-9]/g,'')"></Input>
        </Row>
        <Row style="marginTop:4px">
            <Alert :type="alertType" show-icon>{{ alertInfo }}</Alert>
        </Row>
        <Row style="marginTop:10px">
        <span>填写subtype</span><Input v-model="mydata.subtype" placeholder="项目类型" style="marginLeft:10px;width: 280px"></Input>
        </Row>
         <Row style="marginTop:10px">
            <span>定价：</span>
            <InputNumber style="marginLeft:10px" v-model="mydata.price" :min='0.10' :max='50.00' :step='0.01'></InputNumber>
        </Row>
        <Row style="marginTop:10px">
            <span>授权：</span>
            <i-switch v-model="mydata.onoff">
                <span slot="open">开</span>
                <span slot="close">关</span>
            </i-switch>
        </Row>
    </div>
</template>
<script>
export default {
    name:'AddCustSubjectEditor',
    props:{
        vcp:Object,
        data:Object
    },
    data(){
        return {
            mydata:this.data,
            checking:0, //0 未知，1 通过，2 失败
            errorinfo:''
        }
    },
    computed:{
        alertInfo(){
            if(this.checking===1){
                return "项目:" + this.mydata.subname+"  协议版本:"+this.mydata.requiredver;
            }else if(this.checking===2){
                return this.errorinfo;
            }else{
                return "subid必须是六位数字";
            }
        },
        alertType(){
            if(this.checking===1){
                return "success";
            }else if(this.checking===2){
                return "error";
            }else{
                return "info";
            }
        }
    },
    methods:{
        onChangeSubid:function(event){
            this.checking = 0;
            this.mydata.subname = '';
            this.mydata.requiredver = 0;
            this.mydata.ok = false;
        },
        checkSubid:function(){
            console.log("checkSubid:",this.mydata.subid);
            this.mydata.subid = this.mydata.subid.trim();
            if(this.mydata.subid.length !== 6){
                this.errorinfo="subid无效";
                this.checking = 2;
                return;
            }
            this.$http.get(URL_SUBJECT_CUST,{params:{subid:this.mydata.subid,vcpkey:this.vcp.apikey}}).then((response) => {
                //console.log(response.body);
                var sub = response.body[0];
                if(sub.id === null){
                    this.errorinfo=this.mydata.subid+"不存在";
                    this.checking = 2;
                }else if(sub.exist === 1){
                    this.errorinfo=this.mydata.subid+"授权已存在";
                    this.checking = 2;
                }else{
                    this.mydata.subname = sub.subname;
                    this.mydata.requiredver = sub.requiredver;
                    this.mydata.subtype = sub.subtype;
                    this.mydata.ok = true;
                    this.checking = 1;
                }
            },(response) => {
                console.log("err response:" + JSON.stringify(response));
                this.errorinfo="网络错误(code:"+response.status+")";
                this.checking = 2;
            })
        }
    }
}
</script>
