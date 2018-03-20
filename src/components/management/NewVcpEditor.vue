<template>
    <div>
        <Row>
        <span>客户名称</span><Input v-model="mydata.name" style="marginLeft:10px;width: 280px" 
            @on-blur="checkName" @on-change="onChangeName"
            @on-keyup="mydata.name=mydata.name.replace(/[^a-zA-Z0-9_\-]/g,'')"></Input>
        </Row>
        <Row style="marginTop:4px">
            <Alert :type="alertType" show-icon>{{ alertInfo }}</Alert>
        </Row>
        <Row style="marginTop:10px">
        <span>描述信息</span><Input v-model="mydata.disp" placeholder="中文描述" style="marginLeft:10px;width: 280px"></Input>
        </Row>
        <Row style="marginTop:10px">
            <span>测试开关：</span>
            <i-switch v-model="mydata.teston">
                <span slot="open">开</span>
                <span slot="close">关</span>
            </i-switch>
            <span style="margin:0 4px 0 10px">测试次数：</span>
            <InputNumber v-model="mydata.testval" :disabled="mydata.teston === false" :min='0' :max='100'></InputNumber>
        </Row>
    </div>
</template>
<script>
export default {
    name:'NewVcpEditor',
    props:{
        data:Object
    },
    data(){
        return{
            mydata:this.data,
            checking:0, //0 未知，1 通过，2 失败
            errorinfo:''
        }
    },
    computed:{
        alertInfo(){
            if(this.checking===1){
                return "APIKEY:" + this.mydata.apikey;
            }else if(this.checking===2){
                return this.errorinfo;
            }else{
                return "可输入\"英文,数字,符号-,符号_\"，客户名称不可重复，提交后不可修改";
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
        checkName:function(){
            console.log("checkName:",this.mydata.name);
            this.mydata.name = this.mydata.name.trim();
            if(this.mydata.name.length === 0){
                this.errorinfo="名称不可为空";
                this.checking = 2;
                return;
            }
            this.$http.get(URL_VCP_NAME_CHECK,{params:{name:this.mydata.name}}).then((response) => {
                var res = response.body[0];
                if(res.count > 0){
                    this.errorinfo="名称"+this.mydata.name+"已被使用";
                    this.checking = 2;
                }else{
                    this.mydata.apikey = this.mydata.name.MD5(32).toUpperCase();
                    this.checking = 1;
                }
            },(response) => {
                console.log("err response:" + JSON.stringify(response));
                this.errorinfo="网络错误(code:"+response.status+")";
                this.checking = 2;
            })
        },
        onChangeName(event){
            //console.log("onChangeName:"+this.mydata.name);
            this.checking = 0;
            this.mydata.apikey = '';
        },
    }
}
</script>

