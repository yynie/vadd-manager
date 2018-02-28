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
                    <i-switch size="large" v-model="form.isAdmin" :disabled="isProcessing">
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
                    <Input :type="keyType" size="large" clearable :disabled="isProcessing" v-model="form.password" :placeholder="keyTypeHint">
                        <span slot="prepend">
                            <Icon :size="20" style="width:20px" :type="keyHintIcon"></Icon>
                        </span>
                    </Input>
                </FormItem>
                <FormItem>
                    <Button @click="handleSubmit" size="large" type="primary" long :disabled="isProcessing">登录</Button>
                </FormItem>
            </Form>
            </div>
        </Card>
    </div>
  </div>
</template>

<script>
import Cookies from '../libs/Cookies';
export default {
  data () {
      return {       
        photo: {
          backgroundImage: 'url(' + require('../assets/9a28ebc78837.jpg') + ')',
        },
        isProcessing:false,
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
          return this.form.isAdmin?"password":"text";
      },
      keyHintIcon(){
          return this.form.isAdmin?"locked":"key";
      }
  },
  methods: {
    loginOk(user,passed){
        this.isProcessing = false;
        console.log("login user="+user+",passed="+passed);
        if(passed){
            Cookies.set('user', this.form.isAdmin?"Admin":user, {expires:5,unit:'minute'});
            this.$router.push({
                name: 'HelloWorld'
            });
        }else{
            this.$Message.error('密码或Key错误！');   
        }
      },
    handleSubmit () {
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
                    }, 3000);
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
                        this.loginOk(false);
                    });
                }
            }
        })
    }
  }
}
</script>

