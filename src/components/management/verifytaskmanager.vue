<template>
  <div>
    <Card>
      <Row slot="title" style="padding:10px 10px 0 10px">
        <div class="filter-div" style="width:1400px">
          <span style="color:#ff9900;marginRight:4px">项目</span>
          <Select style="width:160px" v-model="subjectindex" @on-change="subjectChanged" :loading="subject.loading">
            <Option v-for="item in subject.items" :value="item.index" :key="item.index">
              <span>{{item.id}}</span>
              <span>{{item.subname}}</span>
            </Option>
          </Select>
          <Button :loading="subject.loading" style="height:30px" @click="loadSubject" type="text" :disabled="subject.loading"><u>刷新</u></Button>
          <span style="color:#ff9900;marginRight:4px;marginLeft:10px">每页显示</span>
          <Select style="width:80px" v-model="pagesizeOptionIndex" @on-change="pagesizeChanged">
            <Option v-for="item in pagesizeOptions" :value="item.index" :key="item.index">
              <span>{{item.name}}</span>
            </Option>
          </Select>
          <span style="color:#ff9900;marginRight:4px;marginLeft:2px">个号码</span>
          <span style="color:#ff9900;marginRight:4px;marginLeft:30px">数据库选项</span>
          <Button style="height:30px,float:right" @click="editDatabase">{{database.addr}}</Button>
          <Button style="width:90px;height:34px;marginLeft:40px" @click="loadVerifytaskTerminal" type="primary" :loading="terminal.loading"
            :disabled="getTerminalClosed">获取终端</Button>
          <Button style="width:90px;height:34px;marginRight:10px;float:right" @click="confirmPhones" type="primary" :loading="terminal.loading"
            :disabled="terminalSelection.length === 0">处理终端</Button>
        </div>
      </Row>
      <div style="padding:10px 10px 0 10px">
        <p>打码终端统计 <span style="color:#aaa;font-weight:1">(数据涉及主从同步，会有延时)</span></p>
        <Table ref="selection" style="marginTop:10px" :loading="terminal.loading" border stripe  size="small" :columns="verifytaskterminalColumns" 
          :data="terminal.terminals" width="1400" height="650" @on-selection-change="handleSelectCurrent"></Table>
        <Page style="margin:5px 10px 0 0" size="small" :page-size="terminal.pagesize" :current="terminal.page" @on-change="changePage"
          show-total :total="terminal.total"></Page>
        <Button style="margin:10px 10px 0 0" type="primary" @click="handleSelectAll(true)">全选</Button>
        <Button style="margin:10px 10px 0 0" type="primary" @click="handleSelectAll(false)">全部取消</Button>
      </div>
    </Card>
  </div>
</template>
<script>
import moment from 'moment';
import {VerifytaskTerminalColumns} from './table/table';
export default {
  data() {
    return {
      subjectindex:'',
      subid:'',
      subject:{
        loading:false,
        items:[]
      },
      terminal:{
        loading:false,
        terminals:[],
        pagesize: 15,
        page:1,
        total:0
      },
      database:{
        addr:'192.168.20.234',
        port:'3306',
        user:'mysql',
        pwd:'mypwd'
      },
      pagesizeOptionIndex:0,
      pagesizeOptions:[
        {index:0, name:'15', value:15},
        {index:1, name:'30', value:30},
        {index:2, name:'50', value:50},
        {index:3, name:'100', value:100}
      ],
      terminalSelection:[]
    }
  },
  computed:{
    verifytaskterminalColumns(){
      return VerifytaskTerminalColumns();
    },
    getTerminalClosed(){
      return this.terminal.loading || this.subid === '' || this.database.addr === '' || this.database.port === ''
              || this.database.user === '' || this.database.pwd === '';
    }
  },
  methods:{
    subjectChanged: function(value){
      if(this.subjectindex === ''){
        this.subid = '';
      }
      this.subid = this.subject.items[value].id;
      //console.log("subjectChanged, value=" + value + ", subid=" + this.subid);
    },
    pagesizeChanged: function(value){
      //console.log("pagesizeChanged, value=" + value);
      this.pagesizeOptionIndex = value;
      this.terminal.pagesize = this.pagesizeOptions[this.pagesizeOptionIndex].value;
    },
    editDatabase: function(){
      var data = this.database;
      this.$Modal.confirm({
        render: (h) => {
          return h('div', {style:{height:'150px'}}, [
            h('div', [
              h('span',{style:{width:'70px',marginLeft:'10px',display:'inline-block'}},'IP'),
              h('Input',{style:{width:'150px',marginLeft:'20px'},props: {value: data.addr,autofocus: true,placeholder: '输入数据库IP',maxlength:80},
                on: {input: (val) => {
                  data.addr = val;
                }}
              })
            ]),
            h('div', {style:{marginTop:'10px'}}, [
              h('span',{style:{width:'70px',marginLeft:'10px',display:'inline-block'}},'PORT'),
              h('Input',{style:{width:'150px',marginLeft:'20px'},props: {value: data.port,placeholder: '输入数据库端口号',maxlength:80},
                on: {input: (val) => {
                  data.port = val;
                }}
              })
            ]),
            h('div', {style:{marginTop:'10px'}}, [
              h('span',{style:{width:'70px',marginLeft:'10px',display:'inline-block'}},'用户名'),
              h('Input',{style:{width:'150px',marginLeft:'20px'},props: {value: data.user,placeholder: '输入数据库用户名',maxlength:80},
                on: {input: (val) => {
                  data.user = val;
                }}
              })
            ]),
            h('div', {style:{marginTop:'10px'}}, [
              h('span',{style:{width:'70px',marginLeft:'10px',display:'inline-block'}},'密码'),
              h('Input',{style:{width:'150px',marginLeft:'20px'},props: {value: data.pwd,placeholder: '输入数据库密码',maxlength:80},
                on: {input: (val) => {
                  data.pwd = val;
                }}
              })
            ])
          ])
        },
        onOk: () => {
          if((data.addr.length === 0) || (data.port.length === 0) || (data.user.length === 0) || (data.pwd.length === 0)){
            this.$Message.error({duration:5,content:'内容不能为空！'})
            this.$Modal.remove();
          }else{
            this.database = data;
          }
        }
      })
    },
    loadSubject: function(){
      this.subject.loading = true;
      this.subject.items = [];
      this.$http.get(URL_SUBJECT).then((response) => {
        //console.log("response ok="+JSON.stringify(response.body));
        var index = 0;
        response.body.forEach(item => {
          item['index']=index;
          this.subject.items.push(item);
          index ++;
        });
        this.subject.loading = false;
      },(response) => {
        console.log("err:response="+JSON.stringify(response));
        this.errorMsg1="请求项目列表失败";
        this.$Message.error(this.errorMsg1);
        this.subject.loading = false;
      });
    },
    loadVerifytaskTerminal: function(){
      this.terminal.loading = true;
      this.terminal.terminals = [];
      this.$http.get(URL_VERIFYTASK_TERMINAL,{params:{subid:this.subid, addr:this.database.addr, port:this.database.port,
      user:this.database.user,pwd:this.database.pwd,
      page:this.terminal.page, pagesize:this.terminal.pagesize}}).then((response) => {
        //console.log("response ok="+JSON.stringify(response.body));
        response.body.data.forEach(item => {
          item['createtime'] = moment(item.createtime).format('YYYY-MM-DD HH:mm:ss');
          this.terminal.terminals.push(item);
        });
        //this.terminal.loading = false;
        this.terminal.total = response.body.total;
        this.$http.get(URL_VERIFYTASK_TERMINAL_STATUS,{params:{page:this.terminal.page, pagesize:this.terminal.pagesize,
        terminals:this.terminal.terminals}}).then((response) => {
          this.terminal.terminals = response.body.data;
          this.terminal.loading = false;
        }),(response) => {
          this.errorMsg1="请求打码终端统计失败";
          this.$Message.error(this.errorMsg1);
          this.terminal.loading = false;
        };
      },(response) => {
        //console.log("err:response="+JSON.stringify(response));
        this.errorMsg1="请求打码终端统计失败";
        this.$Message.error(this.errorMsg1);
        this.terminal.loading = false;
      });
    },
    handleSelectCurrent:function(selection, row){
      this.terminalSelection = selection;
    },
    handleSelectAll:function(status){
      this.$refs.selection.selectAll(status);
      if(status === true){
        this.terminalSelection = this.terminal.terminals;
      }else{
        this.terminalSelection = [];
      }
    },
    changePage:function(curpage){
    this.terminal.page = curpage;
    this.loadVerifytaskTerminal();
    },
    confirmPhones:function() {
      var phonenums = '';
      var imsis = '';
      //console.log("terminalSelection:  " + JSON.stringify(this.terminalSelection))
      for(var i = 0; i <this.terminalSelection.length; i++) {
        //console.log("terminal:  " + JSON.stringify(this.terminalSelection[i]))
        phonenums += this.terminalSelection[i].phonenum;
        imsis += ('\'' + this.terminalSelection[i].imsi + '\'');
        if(i < this.terminalSelection.length - 1){
          phonenums += ',';
          imsis += ',';
        }
      }
      this.$Modal.confirm({
        render: (h) => {
          return h('div', {style:{height:'150px'}}, [
            h('p', '终端处理'),
            h('p', {style:{height:'100px',marginTop:'10px',wordBreak:'break-all'}}, phonenums),
            h('p', {style:{marginTop:'10px'}}, 'nextrate修改为65535，是否修改？')
          ])
        },
        onOk: () => {
          //console.log("imsi: " + imsis);
          this.$http.post(URL_VT_CONSUME_NEXTRATE, {imsi:imsis,nextrate:65535}).then((response) => {
            this.loadVerifytaskTerminal();
          }, (response) => {
            this.$Message.error("修改失败！");
          });
        }
      })
    }
  },
  mounted(){
    this.loadSubject();
  }
}
</script>
