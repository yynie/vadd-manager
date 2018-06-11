<template>
  <div>
    <p style="margin:10px 0 10px 0">字段(列名)</p>
    <Input autofocus v-model="mine.col" @on-change="changed"></Input>
    <!-- <p style="margin:20px 0 10px 0">子项序号(此列下分拆单元格序号，从0开始)</p>
    <Input v-model="mine.sub" @on-keyup="keyup"></Input> -->
  </div>
</template>
<script>
export default {
  name:"ExxxcatchEditor",
  props:{
    data:Object
  },
  data(){
    return {
      mine:this.data
    }
  },
  methods:{
    changed(){
      //inputsub.tirm().split(",")
    },
    // keyup(){
    //   this.mine.sub = this.mine.sub.replace(/[^0-9,]/g,'');
    // }
  }
}
</script>
