<template>
  <div>
    <ButtonGroup v-for="">
      <Button type="ghost" :disabled="!canPrevvvv" @click="prevvvv(false)"><Icon type="ios-arrow-left"></Icon><Icon type="ios-arrow-left"></Icon></Button>
      <Button type="ghost" icon="ios-arrow-left" :disabled="!canPrev" @click="prev"></Button>
      <Button :type="seltype(0)" v-show="isShow(0)" @click="pageClick(0)">{{ showInfo(0) }}</Button>
      <Button :type="seltype(1)" v-show="isShow(1)" @click="pageClick(1)">{{ showInfo(1) }}</Button>
      <Button :type="seltype(2)" v-show="isShow(2)" @click="pageClick(2)">{{ showInfo(2) }}</Button>
      <Button :type="seltype(3)" v-show="isShow(3)" @click="pageClick(3)">{{ showInfo(3) }}</Button>
      <Button :type="seltype(4)" v-show="isShow(4)" @click="pageClick(4)">{{ showInfo(4) }}</Button>
      <Button type="ghost" icon="ios-arrow-right" :disabled="!canNext" @click="next"></Button>
      <Button type="ghost" :disabled="!canNextttt" @click="nextttt(false)"><Icon type="ios-arrow-right"></Icon><Icon type="ios-arrow-right"></Icon></Button>
    </ButtonGroup>
  </div>
</template>
<script>
export default {
  name: "NamedPage",
  props: { 
    current: {
      type: Number,
      default: 0
    },
    pages: {
      type: Array,
      default() {
        return [];
      }
    },
  },
  data() {
    return {
      first:0,
      selpage:this.current,
      showSize:5,
    }
  },
  computed: {
    canPrev(){
      if(this.selpage === 0){
        return false;
      }
      return true;
    },
    canPrevvvv(){
      if(this.first > 0){
        return true;
      }else{
        return false;
      }
    },
    canNext(){
      if(this.pages.length === 0 || this.selpage === (this.pages.length - 1)){
        return false;
      }
      return true;
    },
    canNextttt(){
      var last = this.first + this.showSize - 1;
      if(last >= (this.pages.length - 1)){
        return false;
      }else{
        return true;
      }
    }
  },
  methods:{
    pageClick(offset){
      var old = this.selpage;
      this.selpage = this.first + offset;
      if(old !== this.selpage){
        this.$emit("on-change", this.selpage);
      }
    },
    prev(){
      if(this.selpage > 0){
        if(this.selpage === this.first){
          this.prevvvv(true);
        }else{
          this.selpage --;
          this.$emit("on-change", this.selpage);
        }
      }
    },
    prevvvv(setpage){
      if(this.first > 0){
        this.first -= 5;
        if(setpage){
          this.selpage = Math.min((this.first + this.showSize - 1), (this.pages.length - 1));
          this.$emit("on-change", this.selpage);
        }
      }
    },
    next(){
      if(this.selpage < (this.pages.length - 1)){
        if(this.selpage === (this.first + this.showSize - 1)){
          this.nextttt(true);
        }else{
          this.selpage ++;
          this.$emit("on-change", this.selpage);
        }
      }
    },
    nextttt(setpage){
      var last = this.first + this.showSize - 1;;
      if(last < (this.pages.length - 1)){
        this.first = Math.min((last+1), (this.pages.length - 1));
        if(setpage){
          this.selpage = this.first;
          this.$emit("on-change", this.selpage);
        }
      }
    },
    isShow(offset){
      var index = this.first + offset;
      if(index >= this.pages.length){
        return false;
      }
      return true;
    },
    showInfo(offset){
      var index = this.first + offset;
      if(index < this.pages.length){
        return this.pages[index];
      }
      return null;
    },
    seltype(offset){
      var index = this.first + offset;
      if(this.selpage === index){
        return "primary";
      }else{
        return "default";
      }
    }
  }
}
</script>
<style lang="less" scoped>
li{
  float: left;
}
</style>


