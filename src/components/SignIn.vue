<template>
  <div class="sign-in" :style="photo">
      <div class="sign-in-card">
        <Card :bordered="false">
            <template slot="title">
                <Icon type="log-in" size="24"/>
                <span :style="{fontSize:'18px', margin:'0 0 0 10px'}">欢迎登录</span>
            </template>
            
            <div class="form-con">
            <Form ref="loginForm" :model="form" :rules="rules">
                <FormItem>
                    <span slot="label" :style="{fontSize:'14px'}">管理员?</span>
                    <i-switch size="large" v-model="form.isAdmin" :disabled="isProcessing" @on-change="adminChange">
                        <span slot="open">YES</span>
                        <span slot="close">NO</span>
                    </i-switch>
                </FormItem>
                <FormItem>
                    <Input v-model="userName" readonly size="large" :disabled="isProcessing">
                        <span slot="prepend">
                            <Icon :size="20" style="width:20px " type="person"></Icon>
                        </span>
                    </Input>
                </FormItem>
                <FormItem prop="password">
                    <Input ref="pwdinput" :type="keyType" size="large" :disabled="isProcessing" v-model="form.password" :placeholder="keyTypeHint">
                        <span slot="prepend">
                            <Icon :size="20" style="width:20px" :type="keyHintIcon"></Icon>
                        </span>
                        
                        <span slot="append" v-on:click="eyeClicked">
                            <Icon :size="20" style="width:20px" :type="eyeIcon"></Icon>
                        </span>
                    </Input>
                </FormItem>
                <FormItem>
                    <Button @click="handleSubmit" size="large" type="primary" long :loading="isProcessing">
                        <span v-if="!isProcessing">登 录</span>
                        <span v-else>正在登录...</span>
                    </Button>
                </FormItem>
            </Form>
            </div>
        </Card>
    </div>
  </div>
</template>

<script>
import Cookies from '../libs/Cookies'
import {LOG_IN} from '../store/mutation-types'
export default {
  data () {
      return {       
        photo: {
          backgroundImage: 'url(' + require('../assets/9a28ebc78837.jpg') + ')',
        },
        isProcessing:false,
        pwdSee:false,
        form:{
        isAdmin:false,
        password:'',
        },
        rules: {
            password: [
                { required: true, message: 'please enter a key or passwd', trigger: 'blur' }
            ]
        }
      }
    },
  computed:{
      userName(){
          return this.form.isAdmin?"Administrator":"Customer";
      },
      keyTypeHint(){
          return this.form.isAdmin?"请输入密码":"请输入API Key";
      },
      keyType(){
          return (this.form.isAdmin && !this.pwdSee)?"password":"text";
      },
      keyHintIcon(){
          return this.form.isAdmin?"locked":"key";
      },
      eyeIcon(){
          return (this.form.isAdmin && this.pwdSee)?"ios-eye":"ios-eye-outline";
      }
  },
  mounted: function () {
      this.$refs.pwdinput.append = false; //页面挂载后隐藏小眼睛
  },
  methods: {
    eyeClicked: function(){
        if(this.form.isAdmin){
        this.pwdSee = !this.pwdSee;
        console.log("eyeClicked pwdSee="+this.pwdSee);
        }
    },
    adminChange: function(){
        //隐藏或显示小眼睛
        this.$refs.pwdinput.append = this.form.isAdmin;
    },
    loginOk: function(user,passed,errmsg){
        this.isProcessing = false;
        console.log("login user="+user+",passed="+passed);
        if(passed){
            var data = {user:this.form.isAdmin?"Admin":user, admin:this.form.isAdmin};
            Cookies.set('A7FBD15A58DDCA81050C568A7222FE6C', JSON.stringify(data), {expires:COOKIE_EXPIRED,unit:COOKIE_EXPIRED_UNIT});
            this.$store.commit(LOG_IN, data);
            
            this.$router.replace({
                name: 'query'
            });
        }else{
            this.$Message.error(errmsg||'密码或Key错误！');   
        }
      },
    handleSubmit: function() {
        this.$refs.loginForm.validate((valid) => {
            if (valid) {
                this.isProcessing = true;
                this.$Message.loading({
                    content: '正在登录...',
                    duration: 0
                });   
                if(this.form.isAdmin){
                    var d = new Date;
                    var ch = d.getHours();
                    var cm = d.getMinutes();
                    
                    var prefix = this.form.password.substr(0,5);
                    var sh = this.form.password.substr(5,2);
                    var h = parseInt(sh);
                    var sm = this.form.password.substr(7 );
                    var m = parseInt(sm);
                    console.log("input:"+h+","+m);
                    setTimeout(() => {
                        if(prefix === 'admin' && h === ch && (cm - m)<=2 && (cm - m)>=-2){
                            this.$Message.destroy();
                            this.loginOk(null,true);
                        }else{
                            this.$Message.destroy();
                            this.loginOk(null,false);
                        }
                    }, 2000);
                }else{
                    // this.$http.jsonp(URL_LOGIN,{},{emulateJSON: true}).then((response) => {
                    //      console.log("responseok="+JSON.stringify(response));
                    //     console.log("status="+response.status);
                    //     console.log("body="+response.body);
                    //     this.$Message.destroy();
                    //     this.loginOk(false);
                    // },(response) => {
                    //     console.log("response="+JSON.stringify(response));
                    //     this.$Message.destroy();
                    //     this.loginOk(false);
                    // });
                    this.$http.post(URL_LOGIN,{key:this.form.password}).then((response) => {
                        var user = response.body.accname;
                        this.$Message.destroy();
                        console.log("user " + user );
                        if(user){
                            console.log("user " + user + " login!");
                            this.loginOk(user,true);
                        }else{
                            console.log("key " + this.form.password + " login failed");
                            this.loginOk(null,false);
                        }
                    },(response) => {
                        console.log("response="+JSON.stringify(response));
                        this.$Message.destroy();
                        this.loginOk(null,false,"网络错误");
                    });
                }
            }
        })
    }
  }
}
</script>

