<template>
  <div>
    <Row>
      <span>绑定KEY</span><span style="color:#ff9900;marginLeft:10px">{{mydata.boundkey}}</span>
    </Row>
    <Row style="marginTop:20px">
      <span>填写网页用户名</span><Input v-model="mydata.username" style="marginLeft:10px;width: 280px"
        @on-blur="checkName" @on-keyup="mydata.username=mydata.username.replace(/[^a-zA-Z0-9_\-]/g,'')"></Input>
    </Row>
    <Row style="marginTop:4px">
      <Alert :type="alertType" show-icon>{{ alertInfo }}</Alert>
    </Row>
  </div>
</template>
<script>
export default {
  name:'AddRetailEditor',
  props:{
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
      if(this.checking === 2) {
        return this.errorinfo;
      }else if(this.checking === 1) {
        return "用户名可用";
      }else {
        return "可输入\"英文,数字,符号-,符号_\"，客户名称不可重复，提交后不可修改";
      }
    },
    alertType(){
      if(this.checking === 2) {
        return "error";
      }else if(this.checking === 1) {
        return "success";
      }else {
        return "info";
      }
    }
  },
  methods:{
    checkName:function(){
      console.log("checkName:",this.mydata.username);
      this.mydata.username = this.mydata.username.trim();
      if(this.mydata.username.length === 0){
        this.errorinfo="名称不可为空";
        this.checking = 2;
        return;
      }
      this.$http.get(URL_VCP_ACCOUNT_RETAIL_NAME_CHECK,{params:{name:this.mydata.username}}).then((response) => {
        var res = response.body[0];
        if(res.count > 0){
          this.errorinfo="名称"+this.mydata.username+"已被使用";
          this.checking = 2;
        }else {
          this.checking = 1;
        }
      },(response) => {
        console.log("err response:" + JSON.stringify(response));
        this.errorinfo="网络错误(code:"+response.status+")";
        this.checking = 2;
      });
    }
  }
}
</script>
