<template>
    <div>
        <div class="step-header-small-con">
            <p>
                发布流量任务
            </p>
        </div>
        <div class="step-content-small-con">
            <p style="margin:4px 0">任务IMEI: <b>{{imei}}</b></p>
            <p style="margin:4px 0">任务时间: <b>{{pubtime}}</b></p>
            <p style="margin:4px 0">流量指标: <b>{{quota}}</b></p>
            <span style="color:#ff9900;marginRight:10px">任务模式:</span>
            <Select multiple style="width:220px" v-model="mode" @on-change="change">
                <Option v-for="item in modeList" :value="item" :key="item">{{ item }}</Option>
            </Select>
      </div>
  </div>
</template>

<script>
export default {
    name: 'puboneConfirm',
    props: {
        data:Object
    },
    data () {
        return {
            mode:['nosms','rapid'],
            modeList:['nosms','rapid'],
            mydata:this.data,
        }
    },
    computed:{
        imei(){
            return this.mydata.items[0].imei;
        },
        quota(){
            return this.mydata.items[0].quota;
        },
        pubtime(){
            return this.mydata.pubtime;
        }
    },
    mounted () {
        console.log("mounted:" + JSON.stringify(this.mydata));
    },
    methods:{
        change(value){
            if(this.mode.length === 0){
                this.mode = ['nosms','rapid'];
            }
            this.mydata.mode =this.mode[0];
            if(this.mode.length > 1){
                this.mydata.mode += "_"+this.mode[1];
            }
            this.$emit('changed', this.mydata.mode);
        }
    }
}
</script>
<style lang="less" scoped>
    @import './modal.less';
</style>


