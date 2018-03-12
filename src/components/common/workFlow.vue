<template>
    <div>
      <Steps :current="current" :status="status">
          <Step v-for="item in steps" :title="item.title" :content="item.describe" :key="item.title"></Step>
      </Steps>
    </div>
</template>
<script>
export default {
  name: 'workFlow',
  props: {
    steps:Array,
    current:0,
    status:String
  }
}
</script>
<style>
.ivu-modal-footer{border-top:1px solid #ff9900;padding:20px 20px;text-align:left}
</style>

