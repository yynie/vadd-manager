<template>
  <div>
      <Card>
            <div style="width:1480px;height:740px">
                <Row>
                    <div style="float:left;height:30px;margin:10px 10px">
                        <h4 style="color:#ff7700">共&nbsp;&nbsp;{{ total }}&nbsp;&nbsp;条记录</h4>
                    </div>
                    <div style="float:right;height:30px;margin:10px 10px">
                        <Button :loading="data.loading" type="text" large style="width:100px;height:30px" @click="load">
                            <u>刷&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;新</u>
                        </Button>
                    </div>
                </Row>
                <Table :loading="data.loading" border stripe :columns="columns" :data="tableData" width='1480' height='600'></Table>
                <div style="float:left;height:40px;margin:20px 10px 0 10px">
                    项目配置做到前端没什么意义吧，反正都看不懂
                </div>
            </div>
        </Card>
  </div>
</template>
<script>
import moment from 'moment';
export default {
    data () {
        return {
            data:{
                loading:false,
                items:[]
            },
            substate:{
                curindex:0,
                onoff:1,
                offexpires:0,
                subjectExpireCounter:0
            },
            columns:[
                {key:'id',title:'subid',width:100,fixed:'left'},
                {key:'subname',title:'项目名',width:100,fixed:'left'},
                {key:'requiredver',title:'协议版本',width:100},
                {key:'dependon',title:'依赖于',width:100},
                {key:'maxcount',title:'可执行总次数',width:110},
                {key:'maxpermonth',title:'月执行次数',width:110},
                {key:'maxperday',title:'日执行次数',width:110},
                {key:'minduration',title:'执行时间间隔',width:110},
                {key:'localized',title:'是否地域化',width:110},
                {key:'timeperiodstart',title:'发布时间起始',width:110},
                {key:'timeperiodend',title:'发布时间截至',width:110},
                {key:'exprovince',title:'排除省',width:300},
                {key:'status',title:'状态',width:110,
                    render: (h, params) => {
                        return h('div', [
                            h('Button', {
                                props: {
                                type: "primary",
                                size: 'small'
                                },
                                style: {
                                    margin:'0 10px 0 0'
                                },
                                on: {
                                    click: () => {
                                        this.checkSubjectStatus(params.row.index);
                                    }
                                }
                            }, '查看禁用')
                        ])
                    }}
            ]
        }
    },
    computed:{
        tableData(){
            return this.data.items;
        },
        total(){
            return this.data.items.length;
        }
    },
    methods:{
        load: function(){
            this.data.loading = true;
            this.data.items = [];
            this.$http.get(URL_SUBJECT).then((response) => {
               // console.log("response ok="+JSON.stringify(response.body));
                var index = 0;
                response.body.forEach(item => {
                    item['index']=index;
                    this.data.items.push(item);
                    index ++;
                });
                this.data.loading = false;
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                this.errorMsg1="请求项目列表失败";
                this.$Message.error(this.errorMsg1);
                this.data.loading = false;
            });
        },
        checkSubjectStatus: function(index){
            this.$http.get(VURL_VCP_SUBJECT_STATUS + "/" + this.data.items[index].id).then((response) => {
                //console.log("response response="+JSON.stringify(response));
                var sta = response.body.result;
                sta.subid = this.data.items[index].id;
                sta.subname = this.data.items[index].subname === '' ? sta.subid : this.data.items[index].subname;
                //console.log("response sta="+JSON.stringify(sta));
                this.showSubjectStatus(sta);
                
            },(response) => {
                console.log("err:response="+JSON.stringify(response));
                this.errorMsg1="获取项目状态失败";
                this.$Message.error(this.errorMsg1);
                this.data.loading = false;
            });
        },
        showSubjectStatus: function(sta){
            var name = sta.subname;
            if(sta.onoff === 1) {
                var success = '可用，超时任务 ' + sta.subjectExpireCounter + ' 个';
                this.$Modal.success({
                    title: name,
                    content: success,
                })
            }else {
                var closed = '在 ' + this.calSubjectCloseTime(sta.offexpires) + ' 已被禁用！';
                this.$Modal.warning({
                    title: name,
                    content:closed,
                })
            }
        },
        calSubjectCloseTime: function(expired){
            var today = moment();
            return today.subtract(7*24*60*60, 'seconds').add(expired, 'seconds').format('YYYY-MM-DD HH:mm');
        }
    },
    mounted(){
        this.load();
    }
}
</script>

