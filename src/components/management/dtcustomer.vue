<template>
    <div>
        <Card>
            <div style="width:1200px;height:740px">
                <Row>
                    <div style="float:left;height:30px;margin:10px 10px">
                        <h4 style="color:#ff7700">共&nbsp;&nbsp;{{ total }}&nbsp;&nbsp;条记录</h4>
                    </div>
                    <div style="float:right;height:30px;margin:10px 10px">
                        <Button :loading="data.loading" type="text" large style="width:100px;height:30px" @click="loadCustomer">
                            <u>刷&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;新</u>
                        </Button>
                    </div>
                </Row>
                <Table :loading="data.loading" border stripe :columns="columns" :data="tableData" height='600'></Table>
                <div style="float:left;height:40px;margin:20px 10px 0 10px">
                    <Button type="primary" large style="width:140px;height:40px" @click="add" :disabled="data.loading">
                        新&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;增
                    </Button>
                </div>
            </div>
        </Card>
    </div>
</template>
<script>
import {DtCustColumns} from './table/table';
export default {
    data () {
        return {
            data:{
                loading:false,
                items:[]
            },
        }
    },
    computed:{
        columns(){
            return DtCustColumns(this);
        },
        tableData(){
            return this.data.items;
        },
        total(){
            return this.data.items.length;
        }
    },
    methods:{
        onEdit: function(index){
            this.editModal(this.data.items[index]);
        },
        onDelete:function(index){
            var delid = this.data.items[index].id;
            var name = this.data.items[index].name;
            this.$Modal.confirm({
                render: (h) => {
                    return h('div',{
                            style:{textAlign:'center'}
                        },
                        [
                        h('Icon',{
                            props:{
                                type:'information-circled',
                                size:'40',
                                color:'#f00'
                            }
                        }),
                        h('p',
                        {
                            style:{margin:'40px 0',color:'#f00',fontSize:'14px'}
                        },
                        '确认删除用户 '+ name + " ?")
                        ]
                    )
                },
                loading: true,
                onOk: () => {
                    this.$http.post(URL_DATATARGET_DEL_CUSTOMER,{id:delid}).then((response) => {
                        this.$Message.info("删除成功");
                        this.$Modal.remove();
                        this.loadCustomer();
                    },(response) => {
                        console.log("err:response="+JSON.stringify(response));
                        this.$Message.error("删除失败,网络错误(code:"+response.status+")");
                        this.$Modal.remove();
                    });
                }
           })
        },
        add:function(){
            this.editModal();
        },
        editModal: function(orig){
            var data = {id:'', name:'', disp:'', quotas:'', apikey:''};
            if(orig){
                data.id = orig.id;
                data.name = orig.name;
                data.disp = orig.disp;
                data.quotas = orig.quotas;
                data.apikey = orig.apikey;
            }
            this.$Modal.confirm({
               render: (h) => {
                        return h('dtcustomer_edit', {
                            props: {
                                data: data
                            },
                            // on: {
                            //     changed: (key,value) => {  
                            //         data[key] = value;
                            //       //  console.log("dd changed:"+JSON.stringify(data));
                            //     }
                            // }
                        })
                    },
                loading: true,
                onOk: () => {
                    var commit={
                        name:data.name.trim(),
                        disp:data.disp.trim(),
                        quotas:[],
                        apikey:data.apikey,
                        id:data.id.trim(),
                    };
                    
                    var qs = data.quotas.replace(/(,*$)/g,""); //去尾部,
                    qs = qs.replace(/(^,*)/g,"");//去头部,
                    if(commit.apikey.length === 0){
                        this.$Message.error({content:"APIKEY 未生成",duration:10});
                        this.$Modal.remove();
                        return;
                    }
                    if(commit.name.length === 0 || commit.disp.length === 0 || qs.length === 0){
                        this.$Message.error({content:"数据不全",duration:10});
                        this.$Modal.remove();
                        return;
                    }
                    var qsarr = qs.split(',');
                    qsarr.forEach((q) => {
                        commit.quotas.push(q);
                    });
                    commit.quotas.sort();
                    console.log("commit:"+JSON.stringify(commit));
                    this.$http.post(URL_DATATARGET_GET_CUSTOMERS,commit).then((response) => {
                        this.$Message.info("提交成功");
                        this.$Modal.remove();
                        this.loadCustomer();
                    },(response) => {
                        console.log("err:response="+JSON.stringify(response));
                        this.$Message.error("提交失败,网络错误(code:"+response.status+")");
                        this.$Modal.remove();
                    });
                }
           })
        },
        loadCustomer: function(){
            this.data.loading = true;
            this.data.items = [];
            this.$http.get(URL_DATATARGET_GET_CUSTOMERS).then((response) => {
                console.log("response ok="+JSON.stringify(response.body));
                var index = 0;
                response.body.forEach(item => {
                    var one = {
                        index:index.toString(),
                        id:item.id,
                        name:item.name,
                        disp:item.disp,
                        apikey:item.apikey,
                        quotas:''
                    };
                    var qs = '';
                    var itemqs = JSON.parse(item.quotas);
                    itemqs.forEach((q) => {
                        qs += q+","
                    });
                    one.quotas = qs.replace(/(,*$)/g,""); //去尾部,
                    this.data.items.push(one);
                    index ++;
                });
                this.data.loading = false;
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                this.errorMsg1="请求客户列表失败";
                this.$Message.error(this.errorMsg1);
                this.data.loading = false;
            });
        },
    },
    mounted(){
        this.loadCustomer();
    }
}
</script>
<style lang="less" scoped>
    @import './dtcustomer.less';
</style>

