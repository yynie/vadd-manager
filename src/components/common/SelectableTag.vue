<template>
    <transition name="fade">
        <div :class="tagClasses" @click="check">
            <span :class="dotClasses"></span>
            <span :class="textClasses"><slot></slot></span>
        </div>
    </transition>
</template>
<script>
export default {
  name: 'SelectableTag',
  props: {
      type:{
        type: String,
        default: 'default'
      },
      index:{
        type: Number,
        default: 0
      },
      selected:{
        type: Number,
        default: 0
      }
  },
  data () {
    return {
        gradual:(this.type === 'gradual'),
    };
  },
  computed: {
      tagClasses(){
          var ret = ['tag-base'];
          if(this.gradual === true){
              var cls = 'tag-base';
              if(this.selected === this.index){
                  cls += '-sel'
              }
              ret.push(cls+'-color'+this.index%5);
          }else{
              if(this.selected === this.index){
                  ret.push('tag-base-sel')
              }
             // ret.push('tag-base-default')
          }
          return ret;
      },
      dotClasses(){
          var ret = ['tag-dot'];
          if(this.gradual === true){
              if(this.selected === this.index){
                  ret.push('tag-dot-color-sel')
              }else{
                  ret.push('tag-dot-color'+this.index%5);
              }
          }else{
              if(this.selected === this.index){
                  ret.push('tag-dot-default-sel')
              }else{
                  ret.push('tag-dot-default')
              }
          }
          return ret;
      },
      textClasses(){
          var ret = ['text'];
          if(this.gradual === true){
              if(this.selected === this.index){
                ret.push('text-sel-color'+this.index%5);
              }else{
                  ret.push('text-color'+this.index%5);
              }
          }else{
              ret.push('text-default')
          }
          return ret;
      }
  },
  methods:{
      check:function(){
          this.$emit('on-click', this.index);
      }
  }
}
</script>
<style lang="less" scoped>
.tag-base{
    display: inline-block;
    height: 26px;
    line-height: 26px;
    margin: 2px 4px 2px 0;
    padding: 0 8px;
    border: 1px solid #bbb;
    border-radius: 2px;
    background: #fff;
    font-size: 14px;
    vertical-align: middle;
    
    &-sel{border: 1px solid #888;}
    &-color0{border: 1px solid #ff5500;}
    &-color1{border: 1px solid #ff7700;}
    &-color2{border: 1px solid #ff9900;}
    &-color3{border: 1px solid #ffbb00;}
    &-color4{border: 1px solid #9bc067;}
    
    &-sel-color0{border: 1px solid #ff5500;background:#ff5500}
    &-sel-color1{border: 1px solid #ff7700;background:#ff7700}
    &-sel-color2{border: 1px solid #ff9900;background:#ff9900}
    &-sel-color3{border: 1px solid #ffbb00;background:#ffbb00}
    &-sel-color4{border: 1px solid #9bc067;background:#9bc067}
}
.tag-dot{
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-right: 4px;
    border-radius: 50%;
    position: relative;
    top: 1px;
    &-default{background: #ddd;}
    &-default-sel{background: #888;}
    &-color-sel{background: #eee;}
    &-color0{background: #ff5500;}
    &-color1{background: #ff7700;}
    &-color2{background: #ff9900;}
    &-color3{background: #ffbb00;}
    &-color4{background: #9bc067;}
}
.text{
    display: inline-block;
    padding: 0 8px;
    &-default{color: #444;}
    &-color0{color: #ff5500;}
    &-color1{color: #ff7700;}
    &-color2{color: #ff9900;}
    &-color3{color: #ffbb00;}
    &-color4{color: #9bc067;}

    &-sel-color0{color: #fff;}
    &-sel-color1{color: #fff;}
    &-sel-color2{color: #fff;}
    &-sel-color3{color: #fff;}
    &-sel-color4{color: #fff;}
}
</style>


