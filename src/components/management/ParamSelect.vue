<template>
  <div>
    <Select v-model="selindex" clearable style="width:200px" placeholder="请选择参数" @on-change="change">
      <Option v-for="item in list" :value="item.index" :key="item.index">{{ item.name }}</Option>
    </Select>
  </div>
</template>
<script>
export default {
  name:"ParamSelect",
  props:{
    data:Object
  },
  data(){
    return {
      list:this.data.list,
      selindex:"",
      sel:this.data.sel,
    }
  },
  methods:{
    change(value){
      // console.log(value)
      // console.log(this.selindex)
      if(this.selindex.trim().length > 0){
        var index = parseInt(this.selindex.trim());
        if(isNaN(index)){

        }else{
          var name = this.list[index].name;
          var paramkey = "it"+index;
          this.sel["name"] = name;
          this.sel["paramkey"] = paramkey;
        }
      }
    }
  }
}
</script>
