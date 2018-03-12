<template>
    <div>
        <h4>lotus平常需要的查询</h4>
        <div>
        <Input v-model="text" size="large"></Input>
        <Button @click="ok">ok</Button>
        <p>md5 16:{{md516}}</p>
        <p>md5 32:{{md532}}</p>
        </div>
    </div>
</template>

<script>
import '../../libs/md5';
export default {
    data () {
        return {
            text:'',
            textcalc:''
        }
    },
    computed: {
        md516(){
            if(this.textcalc === ''){
                return '';
            }else{
                return this.textcalc.MD5();
            }
        },
        md532(){
            if(this.textcalc === ''){
                return '';
            }else{
                return this.textcalc.MD5(32);
            }
        }
    },
    methods:{
        ok:function(){
            if(this.text !== ''){
                this.textcalc = this.text;
            }
        }
    }
}
</script>
