<template>
    <div>
        <Row>
        <span>客户名称</span><Input v-model="mydata.name" style="marginLeft:10px;width: 280px" 
            @on-blur="checkName" @on-change="onChangeName" :disabled="!nameEditable"
            @on-keyup="mydata.name=mydata.name.replace(/[^a-zA-Z0-9_\-]/g,'')"></Input>
        </Row>
        <Row style="marginTop:4px">
            <Alert :type="alertType" show-icon>{{ alertInfo }}</Alert>
        </Row>
        <Row style="marginTop:10px">
        <span>描述信息</span><Input v-model="mydata.disp" placeholder="中文描述" @on-change="onChangeDisp" style="marginLeft:10px;width: 280px"></Input>
        </Row>
        <Row style="marginTop:10px">
            <span>流量指标</span><Input name="quotas" v-model="mydata.quotas" @on-change="onChangeQuotas" style="marginLeft:10px;width: 280px"
            @on-keyup="mydata.quotas=mydata.quotas.replace(/[^0-9,]/g,'')"></Input>
            <div>
                <p style="font-size:8px;color:#aaa">* 单位兆(M),多个指标用英文 , 号分隔 *</p>
            </div>
        </Row>
    </div>
</template>
<script>
import '../../libs/md5';
export default {
  name:'dtcustomerEdit',
  props: {
        data:Object
    },
    data () {
        return {
            mydata:this.data,
            checking:0, //0 未知，1 通过，2 失败
            errorinfo:''
        }
    },
    computed:{
        nameEditable(){
            if(this.mydata.id === ''){
                return true;
            }else{
                return false;
            }
        },
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
            this.$http.get(URL_DATATARGET_CUSTOMERS_CHECK,{params:{name:this.mydata.name}}).then((response) => {
                var res = response.body[0];
                if(res.count > 0){
                    this.errorinfo="名称"+this.mydata.name+"已被使用";
                    this.checking = 2;
                }else{
                    this.mydata.apikey = this.mydata.name.MD5();
                    this.checking = 1;
                    this.changed('apikey',this.mydata.apikey);
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
            this.changed('name', this.mydata.name);
        },
        onChangeDisp(event){
            //console.log("onChangeDisp:"+this.mydata.disp);
            this.changed('disp', this.mydata.disp);
        },
        onChangeQuotas(event){
            //console.log("onChangeQuotas:"+this.mydata.quotas);
            
           // if(event.inputType === 'insertText'){
                this.changed('quotas', this.mydata.quotas);
            //}
        },
        changed:function(key,value){
            this.$emit('changed',{key:key,value:value});
        },
        getData(){
            return this.mydata;
        }
    },
    mounted(){
        console.log("mount:"+JSON.stringify(this.mydata));
        if(this.mydata.id === ''){
        }else{
            this.checking = 1;
        }
    }
}
</script>

