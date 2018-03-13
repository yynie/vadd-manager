<template>
    <div>
        <Row>
        <div class="step-close-con" @click="close">
            <Icon v-if="canQuit" type="ios-close-empty" size='30' color='#444'></Icon>
            <Icon v-else type="ios-close-empty" size='30' color='#ccc'></Icon>
        </div>
        </Row>
        <Row class="step-header-con">
            <div>
            <h3>
                <Icon type="information-circled" size='18' style="marginRight:20px"></Icon>
                提交
            </h3>
            </div>
        </Row>
        <div class="step-content-con">
            <Row>
                <span>客户: {{ customer.name }}</span>
                <span>{{ customer.disp }}</span>
            </Row>
            <div style="margin:20px;height:400px;text-align:center">
                <div v-show="!done">
                    <Spin style="line-height:300px">
                    <Icon type="load-c" color="#19be6b" size=88 class="spin-icon-load"></Icon>
                    </Spin>
                    <p style="font-size:16px;">正在提交....</p>
                </div>
                <div v-show="showResult">
                    <div style="text-align:center;height:300px">
                    <Icon v-if="error === true" style="line-height:300px;color:#ed3f14;" type="close-round" size=88></Icon>
                    <Icon v-else style="line-height:300px;color:#19be6b;" type="checkmark-round" size=88></Icon>
                    </div>
                    <p style="font-size:16px;">{{error?"提交出错了-_-!":"完成"}}</p>
                </div>
            </div>
        </div>
        
    </div>
</template>
<script>
export default {
    name: 'commitimeiModal',
    props: {
        modal:Object
    },
    data () {
        return {
            mydata:{},
            done:false,
            error:false,
            showResult:false,
            offset:0,
            COMMITLENPER:500
        }
    },
    computed:{
        customer(){
            var cust={name:'', disp:''};
            if(this.mydata.customer){
                cust.name = this.mydata.customer.name;
                cust.disp = this.mydata.customer.disp;
            }
            return cust;
        },
        canQuit(){
            return (this.done === true);
        },
        canRetry(){
            return (this.error === true);
        }
    },
    methods:{
        input(stepdata){
            this.mydata = stepdata;
            console.log("mydata:"+JSON.stringify(this.mydata));
        },
        startCommit(){
            this.done = false;
            this.error = false;
            this.showResult=false;
            this.offset = 0;
            if(this.mydata.imeiarr.length > 0){
                setTimeout(function(){
                this.next(0);
                }.bind(this), 1000);
            }
        },
        next(donelen){
            this.offset += donelen;
            var len = this.mydata.imeiarr.length - this.offset;
            len = Math.min(len,this.COMMITLENPER);
            if(len > 0){
                this.commit(this.offset,this.offset + len)
            }else{
                this.done = true;
                this.error = false;
                setTimeout(function(){
                this.showResult = true;
                }.bind(this), 500);
            }
        },
        commit(start, end){
            var data={
                start:this.mydata.start,
                end:this.mydata.end,
                quota:this.mydata.quota,
                custkey:this.mydata.customer.apikey,
                imeiarr:[]
            };
            for(var i=start; i<end; i ++){
                data.imeiarr.push(this.mydata.imeiarr[i]);
            }
            if(data.imeiarr.length > 0){
                this.$http.post(URL_DATATARGET_IMEIS,data).then((response) => {
                        console.log("responseok="+JSON.stringify(response));
                        if(response.status === 200){
                            this.next(data.imeiarr.length);
                        }else{
                            console.log("response="+JSON.stringify(response));
                            this.done = true;
                            this.error = true;
                            setTimeout(function(){
                            this.showResult = true;
                            }.bind(this), 300);
                        } 
                    },(response) => {
                        console.log("response="+JSON.stringify(response));
                        this.done = true;
                        this.error = true;
                        setTimeout(function(){
                        this.showResult = true;
                        }.bind(this), 300);
                    });
                // console.log("commit:" + JSON.stringify(data));
                // setTimeout(function(){
                // this.next(data.imeiarr.length);
                // }.bind(this), 2000);
            }else{
                console.error("commit no data");
            }
        },
        close:function(){
           this.$emit('on-commit', (this.error === false));
           if(this.canQuit){
            this.modal.close();
           }
        },
    }
}
</script>

<style lang="less" scoped>
    @import './modal.less';
</style>

