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
               <Icon type="ios-cloud-upload-outline" size='20' style="marginRight:10px"></Icon>
                发布流量任务
            </h3>
            </div>
        </Row>
        <div class="step-content-con">
            <p style="margin:10px 0">总数: <b>{{mydata.total}}</b></p>
            <p style="margin:10px 0">任务时间: <b>{{mydata.pubtime.replace('-','')}}</b></p>
            <span style="color:#ff9900;marginRight:10px">任务模式:</span>
            <Select multiple :disabled="isWorking" style="width:220px" v-model="mode" @on-change="change">
                <Option v-for="item in modeList" :value="item" :key="item">{{ item }}</Option>
            </Select>
            <div v-show="!isWorking" style="marginTop:10px;height:160px;text-align:center">
                <Button type="primary" style="marginTop:30px;pading:auto; width:110px; height:100px" @click="start">
                    <Icon type="ios-cloud-upload-outline" size='40'></Icon>
                    <p style="font-size:14px;marginTop:10px">开 始</p>
                </Button>
            </div>
            <div v-show="isWorking" style="marginTop:10px;height:160px;text-align:center">
                <p style="marginTop:30px;color:#ff9900;font-size:16px">{{working.status}}</p>
                <p style="marginTop:30px;color:#009966;font-size:20px">{{progress}}</p>
                <Button v-show="showPause" :loading="isPauseing" type="primary" style="marginTop:30px;width:110px; height:40px" @click="pause">
                    <Icon type="pause" size='20'></Icon>
                </Button>
                <Button v-show="showResume" type="primary" style="marginTop:30px;width:110px; height:40px" @click="go">
                    <Icon type="play" size='20'></Icon>
                </Button>
                <Alert show-icon v-show="showDone" style="marginTop:30px" :type="doneInfo.type">{{doneInfo.info}}</Alert>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'pubBatch',
    props: {
        modal:Object
    },
    data () {
        return {
            mode:['nosms','rapid'],
            modeList:['nosms','rapid'],
            mydata:{pubtime:'',total:0},
            isWorking:false,
            isPaused:false,
            isPauseing:false,
            needReload:false,
            pubednum:0,  //已处理的数目
            working:{
                MAX_PER_REQ:100,//200, //每次请求发布的最大个数
                CHECKOUT_SIZE:200, //全部发布时每次检出的imei个数，理论上应该大于每次发布的个数
                offset:0,
                total:0,
                array:Array,
                pubingArray:Array,
                status:'正在获取...',
            },
            doneInfo:{info:"",type:'success'},
            done:false,
        }
    },
    computed:{
        canQuit(){
            return (this.isWorking === false || this.isPaused === true || this.done === true);
        },
        progress(){
            return this.pubednum + "  /  " + this.mydata.total;
        },
        showPause(){
            return (this.isPaused === false && this.done === false);
        },
        showResume(){
            return (this.isPaused === true && this.done === false);
        },
        showDone(){
            return (this.done === true);
        }
    },
    
    methods:{
        input(indata){
            this.mydata = indata;
            //console.log("input:" + JSON.stringify(this.mydata));
            this.mode = ['nosms','rapid'],
            this.isWorking = false;
            this.isPaused = false;
            this.isPauseing = false;
            this.needReload = false;
            this.pubednum = 0;
            this.done = false;
        },
        start(){
            this.isWorking = true;
            this.isPaused = false;
            this.isPauseing = false;
            if(this.mydata.all === true){
                this.checkOutImeis();
            }else{
                this.pubItems(this.mydata.items);
            }
        },
        pause(){
            this.isPauseing = true;
           // this.isPaused = true;
        },
        go(){
            this.isPaused = false;
            this.pubNext();
        },
        change(value){
            if(this.mode.length === 0){
                this.mode = ['nosms','rapid'];
            }
            this.mydata.mode =this.mode[0];
            if(this.mode.length > 1){
                this.mydata.mode += "_"+this.mode[1];
            }
        },
        close:function(){
           if(this.canQuit){
            this.modal.close();
            this.$emit('on-result', this.needReload);
           }
        },
        checkOutImeis(){
            var params = {
                    custkey:this.mydata.custkey,
                    page:1,
                    pagesize:this.working.CHECKOUT_SIZE,
                    tasktime:this.mydata.pubtime,
                    pubstate:2,
                    quota:0
            };
            this.working.status = '正在获取...',
            console.log("checkOutImeis");
            this.$http.get(URL_DATATARGET_IMEIS,{params:params}).then((response) => {
                if(response.status === 200){
                    var res = response.body;
                    var array = [];
                    console.log("checkOutImeis length="+res.data.length);
                    if(res.data.length > 0){
                        res.data.forEach(item => {
                            if(item.pub > 0){
                                console.error("checkout data error!")
                            }else{
                                console.log("checkout:"+JSON.stringify(item));
                                var todo = {imei:item.imei,quota:item.quota};
                                array.push(todo);
                            }
                        });
                        setTimeout(function(){
                            this.pubItems(array);
                        }.bind(this),500);
                    }else{
                        console.log("checkOutImeis res="+JSON.stringify(res));
                        this.done = true;
                        this.doneInfo.info = '发布完成!';
                        this.doneInfo.type = 'success'
                    } 
                }else{
                    console.log("responseok="+JSON.stringify(response));
                    this.working.status = '获取IMEI失败(code:'+response.status+')';
                    this.done = true;
                    this.doneInfo.info = '发布终止!';
                    this.doneInfo.type = 'error'
                }
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                this.working.status = '获取IMEI失败(code:'+response.status+')';
                this.done = true;
                this.doneInfo.info = '发布终止!';
                this.doneInfo.type = 'error'
            });
        },
        pubItems(array){
            this.working.array = array;
            this.working.offset = 0;
            this.working.total = array.length;
            console.log("pubItems="+JSON.stringify(this.working.array));
            this.pubNext();
        },
        pubNext(){
            if(this.isPauseing){
                this.isPauseing = false;
                this.isPaused = true;
                console.log("pubNext paused");
                return;
            }
            if(this.working.offset >= this.working.total){
                if(this.mydata.all === true){
                    if(this.pubednum >= this.mydata.total){
                        this.done = true;
                        this.doneInfo.info = '发布完成!';
                        this.doneInfo.type = 'success'
                        return;
                    }
                    this.checkOutImeis();
                    return;
                }else{
                    this.done = true;
                    this.doneInfo.info = '发布完成!';
                    this.doneInfo.type = 'success'
                    return;
                }
            }
            var max = Math.min(this.working.MAX_PER_REQ, this.working.total/3);
            if(max < 1){
                max = 1;
            }
            var end = Math.min(this.working.offset + max, this.working.total);
            this.working.pubingArray = this.working.array.slice(this.working.offset,end);
            console.log("pubingArray="+JSON.stringify(this.working.pubingArray));
            var pubdata = {
                items:[...this.working.pubingArray],
                pubtime:this.mydata.pubtime.replace('-',''),
                mode:this.mydata.mode,
                custkey:this.mydata.custkey
            }
            this.pubOne(pubdata);
        },
        pubOne(pubdata){
            this.working.status = "正在发布...";
            console.log("pubOne:"+JSON.stringify(pubdata));
            this.$http.post(VURL_DATATARGET_PUB,pubdata).then((response) => {
                    console.log("response ok="+JSON.stringify(response.body));
                    if(response.body.state === 200000){
                        setTimeout(function(){
                            var imeis = [];
                            pubdata.items.forEach(el => {
                                imeis.push(el.imei);
                            });
                            this.writePubed(imeis,pubdata.pubtime,pubdata.custkey);
                        }.bind(this),500);
                    }else{
                        console.log("onlineCheck:state="+response.body.state);
                        this.working.status = "发布失败(state:"+response.body.state+")";
                        this.done = true;
                        this.doneInfo.info = '发布终止!';
                        this.doneInfo.type = 'error'
                    }
                },(response) => {
                    console.log("err:response="+JSON.stringify(response));
                    this.working.status = "发布失败,网络错误(code:"+response.status+")";
                    this.done = true;
                    this.doneInfo.info = '发布终止!';
                    this.doneInfo.type = 'error'
                });
        },
        writePubed:function(imeis, pubtime, custkey){
            this.working.status = "正在同步状态...";
           
            this.$http.post(URL_DATATARGET_IMEI_PUBED,{imeis:imeis,custkey:custkey,pubtime:pubtime}).then((response) => {
                console.log("response("+URL_DATATARGET_IMEI_ONLINE+")="+response.status);
                if(response.status === 200){
                    
                    //this.pubednum += imeis.length;
                    this.working.offset += imeis.length;
                    this.needReload = true;
                    var count = imeis.length;
                    var time = Math.max(1000/count, 100);
                    var it = setInterval(function(){
                        if(count>0){
                          //  console.log("setInterval count="+count);
                            this.pubednum++;
                            count --;
                        }else{
                          //  console.log("setInterval clear count="+count);
                            clearInterval(it);
                            this.working.status = "完成";
                            this.pubNext();
                        }
                    }.bind(this),time);
                }else{
                    this.working.status = "同步状态失败(state:"+response.body.state+")";
                    this.done = true;
                    this.doneInfo.info = '发布终止! 这是个悲剧，因为后台数据同步失败,可能需要联系后台人员手动修复了!';
                    this.doneInfo.type = 'error'
                }
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                this.working.status = "同步状态失败(code:"+response.status+")";
                this.done = true;
                this.doneInfo.info = '发布终止! 这是个悲剧，因为后台数据同步失败,可能需要联系后台人员手动修复了!';
                this.doneInfo.type = 'error'
            });
        },
    }
}
</script>
<style lang="less" scoped>
    @import './modal.less';
</style>
