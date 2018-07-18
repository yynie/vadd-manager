<template>
  <div>
    <Card>
      <p slot="title">1. 导入表格</p>
      <Row>
        <div style="float:left;lineHeight:30px">
        <p>选择解析列名：</p>
        </div>
        <div style="float:left">
          <Tag v-for="(item,index) in catchItems" :key="item.col" :name="item.col" closable @on-close="deleteCatchItem(index)">
            {{item.col}}
          </Tag>
          <Button v-show="this.catchItems.length<10" icon="ios-plus-empty" type="dashed" @click="catchItemAdd">添加</Button>
          <Checkbox style="marginLeft:10px" v-model="noDupRows">去重复行</Checkbox>
        </div>
      </Row>
      <Row style="margin: 20px 0 0 0;padding:10px;background:#eee">
        <div style="float:left">
          <Upload v-if="exxxLoading === false" action="" :before-upload="uploadExcel"
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            >
            <Button type="primary" size='small' icon="ios-cloud-upload-outline">导入Excel</Button>
          </Upload>
          <Button v-else loading type="primary" size='default' icon="ios-cloud-upload-outline">正在上传..</Button>
        </div>
        <div style="float:left;margin:0 20px;lineHeight:28px">
          <p>{{exxxFile}}</p>
        </div>
      </Row>
      <Row style="margin: 2px 0 0 0;padding:20px;">
        <div v-if="catchItems.length === 0"><b style="color:#f00">
          <Icon type="information-circled"></Icon>
          &nbsp;&nbsp;&nbsp;未定义捕捉字段</b></div>
        <div v-else>
          <Table height="400" border stripe size="small" :columns="getColumns" :data="tableData" :loading="parsing"></Table>
        </div>
      </Row>
      <Row style="padding:10px 2px;">
        <div style="float:left">
        <named-page :pages="exxxParsed.SheetNames" :current="exxxParsed.sheetIndex" @on-change="pageChanged"></named-page>
        </div>
        <div style="float:left;marginLeft:40px;lineHeight:30px">
          当前页：{{exxxParsed.SheetNames[exxxParsed.sheetIndex]}}&nbsp;&nbsp;&nbsp;本页共 {{tableData.length}} 条,&nbsp;&nbsp;&nbsp;&nbsp;原生数据共 {{curPageInfo.origTotal}} 条
        </div>
      </Row>
    </Card>
    <Card>
      <p slot="title">2. 格式化数据</p>
      <Row>
        <div style="float:left;lineHeight:30px">
        <p>选择格式化参数：</p>
        </div>
        <div style="float:left">
          <Tag v-for="(item,index) in formatItems" :key="item.col" :name="item.col" closable @on-close="deleteFormatItem(index)">
            param{{index}}:{{item.name}}
          </Tag>
          <Button v-show="this.formatItems.length<10" icon="ios-plus-empty" type="dashed" 
           :disabled="catchItems.length === 0" @click="formatItemAdd">添加</Button>
          <Checkbox style="marginLeft:10px" v-model="noDupData">数据去重</Checkbox>
        </div>
      </Row>
      <Row style="margin: 10px 0 0 0">
        <div style="float:left;lineHeight:30px">
          格式：
        </div>
        <div style="float:left;lineHeight:30px">
          <Input v-model="format.fstr" style="width: 300px"></Input>
        </div>
        <div style="float:left;lineHeight:30px;marginLeft:10px">
          分隔符：
        </div>
        <div style="float:left;lineHeight:30px;">
          <Input v-model="format.sep" style="width: 80px"></Input>
        </div>
        <!-- <div style="float:left;lineHeight:30px;marginLeft:10px">
          <Checkbox v-model="!format.inline" size="large">分&nbsp;行</Checkbox>
        </div>  -->
        <div style="float:left;lineHeight:30px;marginLeft:10px">
          <Button :disabled="formatItems.length === 0" @click="genFormatedResult">开始转换数据</Button>
        </div>
        <div style="float:left;lineHeight:30px;marginLeft:10px">
          <Checkbox style="marginLeft:10px" v-model="noDupInFile">文件去重</Checkbox>
        </div>
        <div style="float:left;lineHeight:30px;marginLeft:2px">
          <Input :disabled="noDupInFile === false" type="file" style="width: 400px" @on-change="checkDupFileChanged">
          </Input>
        </div>
      </Row>
      <Row style="margin: 10px 0 0 0">
        <Input v-model="format.result" type="textarea" :rows="20"></Input>
      </Row>
    </Card>
    <Card>
      <p slot="title">3. 超时号码核对</p>
      <Row>
        <div style="float:left;lineHeight:30px">
          <span>apikey:<Input v-model="failedStatistics.apikey" style="width: 300px"></Input></span>
        </div>
        <div style="float:left;lineHeight:30px;marginLeft:10px">
          <span>subid:<Input v-model="failedStatistics.subid" style="width: 100px"></Input></span>
        </div>
        <div style="float:left;lineHeight:30px;marginLeft:10px">
          <DatePicker type="date" placeholder="Select Month" style="width: 160px" @on-change="setDate"></DatePicker>
        </div>
        <div style="float:left;lineHeight:30px;marginLeft:10px">
          <Button :disabled="failedStatistics.loading === true || format.result.length === 0" @click="checkDeviation">查表找出疑似误差记录</Button>
        </div>
        <div style="float:left;lineHeight:30px;marginLeft:20px">
          <Button @click="exportWx">导出误差表</Button>
        </div>
        
        <div style="float:right;lineHeight:30px;margin:0 20px">
          <p>疑似误差119总数:{{c119Count}}</p>
        </div>
        <div style="float:right;lineHeight:30px">
          <p>疑似误差103总数:{{c103Count}}</p>
        </div>
      </Row>
      <Row style="marginTop:20px">
        <Table ref="fftable" height="800" border stripe size="small" :columns="SSColumn" :data="failedStatistics.tableData" :loading="failedStatistics.loading"
        @on-selection-change="ssTableSelectChange"></Table>
      </Row>
    </Card>
  </div>
</template>
<script>
import XLSX from 'xlsx';
import moment from 'moment';
import NamedPage from "../common/NamedPage.vue"
import expandTable from './table/table-expand.vue';
export default {
  components: {
    NamedPage,
  },
  data () {
    return {
      exxxLoading:false,
      exxxFile:'无',
      catchItems:[
        // {col:"第一列"},{col:"第二列"},{col:"第3列"}
      ],
      noDupRows:true,
      tableData:[
        // {it0:"first",it1:"11111",it2:"aaaaa"},
        // {it0:"第二",it1:"22222",it2:"BBBBB"},
        // {it0:"no3",it1:"三三三",it2:"Cat"},
        // {it0:"四四",it1:"fourth",it2:"Dolor"},
      ],
      curPageInfo:{
        origTotal:0,
      },
      parsing:false,
      exxxParsed:{
        workbook:null,
        sheetIndex:0,
        SheetNames:[]
      },
      /////
      formatItems:[],
      format:{
        fstr: "\"{0}\"",
        sep: ",",
        inline: false,
        result:"",
      },
      noDupData:true,
      noDupInFile:true,
      checkDupFile:null,
      dupFileData:null,

      failedStatistics:{
        apikey:'72786A1CF2C8CB09BDEA3953D3E2C57C',
        subid:'003002',
        date:'',
        tableData:[],
        loading:false,
        offset:0
      },
      SSColumn:[
        {width:60 ,fixed:'left',align: 'center',type: 'selection'},
        {width:40 ,align: 'center',type: 'expand',
          render: (h, params) => {
              return h(expandTable, {
                  props: {
                    row: params.row
                  }
              })
          }
        },
        {key:'phonenum',title:'phonenum',width:140,
          render:  (h, params) => {
            if(params.row.sub.length > 1){
              return h('div', {style:{background:'#ff6600', color:'#fff', padding:'4px 8px'}}, [h('span',"? "+params.row.phonenum)])
            }else{
              return h('span',params.row.phonenum)
            }  
          },
          filters: [{label: '?',value: 1}],
          filterMethod (value, row) {
            return (row.sub.length > 1);
          }
        },
        {key:'createtime',title:'任务创建',width:160},
        {key:'updatetime',title:'任务更新',width:160},
        {key:'status',title:'status',width:90},
        {key:'verifysms',title:'sms'},
      ]
    }
  },
  computed:{
    getColumns(){
      var tabcols = [];
      var index = 0;
      this.catchItems.forEach((e) =>{
        var colbase = e.col;
        var keybase = "it"+index;
        var one = {
          title: colbase, 
          key: keybase,
          width:240
        }
        tabcols.push(one);
        index++;
      });
      console.log("getColumns:" + JSON.stringify(tabcols));
      return tabcols;
    },
    c103Count(){
      var count = 0;
      if(this.failedStatistics.tableData.length > 0){
        this.failedStatistics.tableData.forEach((e) => {
          if(e._checked === true && e.status === 103){
            count ++;
          }
        })
      }
      return count;
    },
    c119Count(){
      var count = 0;
      if(this.failedStatistics.tableData.length > 0){
        this.failedStatistics.tableData.forEach((e) => {
          if(e._checked === true && e.status === 119){
            count ++;
          }
        })
      }
      return count;
    }
  },
  methods:{
    pageChanged:function(val){
      this.exxxParsed.sheetIndex = val;
      //console.log("pageChanged sheetIndex:"+this.exxxParsed.sheetIndex)
      this.doParseOneSheet();
    },
    deleteCatchItem:function(index){
      this.catchItems.splice(index, 1);
      this.formatItems.splice(0,this.formatItems.length);
      this.format.result="";
    },
    catchItemAdd:function(){
      var data={
        col:''
      }
      this.$Modal.confirm({
        render: (h) => {
          return h('exxxcatch-editor', {
            props: {
              data: data
            },
          })
        },
        onOk: () => {
          if(data.col.length > 0){
            var one = {col:data.col};
            this.catchItems.push(one);
            this.formatItems.splice(0,this.formatItems.length);
            this.format.result="";
          }
        }
      })
    },
    uploadExcel:function(file){
      if(typeof FileReader === undefined){
          this.$Message.error("浏览器不支持HTML5");
          return
      }
      this.exxxLoading = true;
      this.exxxFile = file.name;
      if(!file){
          this.exxxLoading = false;
          return;
      }
           
      var fileReader = new FileReader();
      let $me = this;
      var rAAB = false;
      if (!FileReader.prototype.readAsBinaryString) {
          rAAB = true; //IE 的FileReader不支持readAsBinaryString
      }
      console.log("rAAB="+rAAB);
      fileReader.onload = function(ev) {
        try {
          var data = ev.target.result;
          $me.exxxParsed.sheetIndex = 0;
          $me.exxxParsed.workbook = null;
          $me.exxxParsed.SheetNames.splice(0, $me.exxxParsed.SheetNames.length);
          var workbook = null;
          if(rAAB) {
            var arry = $me.fixdata(data);
            workbook = XLSX.read(btoa(arry), {type: 'base64'});
          }else{
            workbook = XLSX.read(data, {type: 'binary'});
          }

          if(workbook.SheetNames.length > 0){
            $me.exxxParsed.workbook = workbook;
            $me.exxxParsed.SheetNames = [...workbook.SheetNames];
            $me.doParseOneSheet()
            $me.exxxLoading = false;
          }else{
            $me.$Message.error({content:"文件格式错误",duration:5});
            $me.exxxLoading = false;
            return;
          }
        }catch (e) {
          console.log('文件类型err:'+e);
          $me.$Message.error({content:"文件类型错误",duration:5});
          $me.exxxLoading = false;
          return;
        }
      }
      if(rAAB === true){
        fileReader.readAsArrayBuffer(file);
      }else{
        fileReader.readAsBinaryString(file);
      }
    },
    doParseOneSheet:function(){
      this.parsing = true;
      setTimeout(function(){
        this.parseSheet();
      }.bind(this), 500);
    },
    parseSheet:function(){
      
      this.tableData.splice(0, this.tableData.length);
      var sname = this.exxxParsed.SheetNames[this.exxxParsed.sheetIndex];
      const worksheet = this.exxxParsed.workbook.Sheets[sname];
      var json = XLSX.utils.sheet_to_json(worksheet);
      //console.log(JSON.stringify(json))
      this.curPageInfo.origTotal = 0;
     
      if(json.length > 0){
        var len = json.length;
        for(var i=0; i<len; i++){
          var d = json[i];
          var one = {};
          var index = 0;
          this.catchItems.forEach((e) =>{
            var colbase = e.col;
            var keybase = "it"+index;
            for (var de in d){
              if(de === colbase){
                one[keybase] = d[de];
              }
            }
            index ++;
          });
          if(JSON.stringify(one) !== "{}" ){
            //console.log("table data:"+JSON.stringify(one));
            this.curPageInfo.origTotal ++;
            var toBeAdd = true;
            if(this.noDupRows === true){
              for(var k = 0; k < this.tableData.length; k++){
                var pickone = this.tableData[k];
                if(JSON.stringify(one) === JSON.stringify(pickone)){
                  toBeAdd = false;
                  break;
                }
              }
            }
            if(toBeAdd === true){
              this.tableData.push(one);
            }
          }
        } 
      }
      this.parsing = false;
    },

    //////
    deleteFormatItem:function(index){
      this.formatItems.splice(index, 1);
    },
    formatItemAdd:function(){
      var data={
        list:[],
        sel:{}
      }
      var index = 0;
      this.catchItems.forEach((e) => {
        var one = {
          index:index.toString(),
          name:e.col
        }
        data.list.push(one);
        index++;
      });
      this.$Modal.confirm({
        render: (h) => {
          return h('param-select', {
            props: {
              data: data
            },
          })
        },
        onOk: () => {
          //console.log("formatItemAdd:"+JSON.stringify(data.sel));
          this.formatItems.push(data.sel);
        }
      })
    },
    checkDupFileChanged:function(e){
     // console.log("checkDupFileChanged:" + JSON.stringify(e));
      this.checkDupFile = e.target.files[0];
      this.dupFileData = null;
      let $me = this;
      if(this.checkDupFile !== null){
        if(typeof FileReader === undefined){
          this.$Message.error("无法检查<"+ this.checkDupFile.name + ">文件，浏览器不支持HTML5");
          return;
        }
        var fileReader = new FileReader();
        fileReader.onload=function(ev){      
          $me.dupFileData = ev.target.result;
          console.log("read dupFileData done");
        }
        fileReader.readAsText(this.checkDupFile);
      }

      console.log("checkDupFileChanged:" + this.checkDupFile.name);
    },
    isInCheckDupFile:function(str){
      return (this.dupFileData.indexOf(str) >= 0);
    },
    genFormatedResult:function(){
      var dupInFCount = 0;
      var dupCount = 0;
      var checkfile = false;
      if(this.noDupInFile === true && this.dupFileData !== null){
        checkfile = true;
        console.log("checkfile="+checkfile)
      }
      this.format.result="";
      this.tableData.forEach((e) => {
        var str = this.format.fstr;
        var hasdata = false;
        for(var i = 0; i < this.formatItems.length; i++){
          var fe = this.formatItems[i];
          var p = e[fe.paramkey];
          if(p === undefined){
            continue;
          }else if(this.noDupData === true && this.format.result.indexOf(p) >= 0){//去重
            ///console.log("重复的"+p);
            dupCount ++;
            continue;
          }else if(checkfile === true && this.isInCheckDupFile(p)){
            dupInFCount ++;
            continue;
          }else{
            str = str.replace("{"+i+"}",p);
            hasdata = true;
          }
        }
        if(hasdata === true){
          if(this.format.result !== ""){
            this.format.result += this.format.sep;
          }
          this.format.result += str;
        }
      })
      console.log("去重个数："+dupCount)
      console.log("文件去重个数："+dupInFCount)
    },

    ssTableSelect:function(selection, row){
      //console.log("ssTableSelect:" + JSON.stringify(selection) + ","+JSON.stringify(row))
      this.failedStatistics.tableData[row.index]._checked = true;
      console.log("ssTableSelect:" + JSON.stringify(this.failedStatistics.tableData))
    },

    ssTableSelectCancel:function(selection, row){
      //console.log("ssTableSelectCancel:"  + JSON.stringify(selection) + ","+JSON.stringify(row))
      this.failedStatistics.tableData[row.index]._checked = false;
      console.log("ssTableSelectCancel:" + JSON.stringify(this.failedStatistics.tableData))
    },

    ssTableSelectChange:function(selection){ 
      //console.log("ssTableSelectChange selection:" + JSON.stringify(selection))
      this.failedStatistics.tableData.forEach((e) => {
        e._checked = false;
        for(var i=0;i<selection.length;i++){
          var one = selection[i];
          //console.log("ssTableSelectChange one:" + JSON.stringify(one))
          if(e.index === one.index){
            e._checked = true;
            break;
          }
        }
      });
      console.log("ssTableSelectChange:" + JSON.stringify(this.failedStatistics.tableData))
    },

    setDate:function(date){
      this.failedStatistics.date = date;
      console.log("setDate:"+this.failedStatistics.date)
    },

    exportWx:function(){
      this.$refs.fftable.exportCsv({
          filename: '超时统计误差'+ this.failedStatistics.date,
          columns: this.SSColumn.filter((col, index) => index>1),
          data: this.failedStatistics.tableData.filter((data, index) => {
            //console.log("filter data:"+JSON.stringify(data)+","+index)
            return data._checked === true;
          })
      });
    },

    checkDeviation:function(){
      if(this.failedStatistics.date === null || this.failedStatistics.date === undefined
        || this.failedStatistics.date.trim().length === 0){
          this.$Message.error("没选日期");
          return;
        }
      var data={
        phonenums:this.format.result,
      };
      //console.log(data.phonenums);
      this.failedStatistics.loading = true;
      this.failedStatistics.tableData.splice(0, this.failedStatistics.tableData.length);
      this.failedStatistics.offset = 0;
      this.$http.post(URL_VTF_CHECK_DEVIATION,data,{
            params:{
              apikey:this.failedStatistics.apikey,
              subid:this.failedStatistics.subid,
              date:this.failedStatistics.date,
            }
          }).then((response) => {
          var arr = response.body;
          if(arr.length > 0){
            var index = 0;
            arr.forEach((a) => {
              var one = {
                index:index,
                phonenum:a.phonenum,
                createtime:moment(a.createtime).format('YYYY-MM-DD HH:mm:ss'),
                updatetime:moment(a.updatetime).format('YYYY-MM-DD HH:mm:ss'),
                status:a.status,
                verifysms:a.verifysms,
                _checked: true,
                sub:[]
              };
              this.failedStatistics.tableData.push(one);
              index++;
            });
            console.log("checkDeviation:total="+this.failedStatistics.tableData.length);
            setTimeout(function(){
              this.doCheckDetail();
            }.bind(this), 300);
            //this.failedStatistics.loading = false;
          }else{
            this.failedStatistics.loading = false;
          }
      },(response) => {
          console.log("checkDeviation response="+JSON.stringify(response));
          this.$Message.error(JSON.stringify(response))
          this.failedStatistics.loading = false;
      });
    },

    doCheckDetail:function(){
      console.log("doCheckDetail:offset=" + this.failedStatistics.offset)
      var num = 0;
      var leftnum = this.failedStatistics.tableData.length - this.failedStatistics.offset;
      console.log("doCheckDetail:leftnum=" + leftnum)
      if(leftnum === 0){
        this.failedStatistics.loading = false;
        return;
      }
      var maxnum = Math.min(leftnum, 800);
      var phones = [];
      for(var i=0;i<maxnum;i++){
        var e = this.failedStatistics.tableData[this.failedStatistics.offset+i];
        phones.push(e.phonenum);
      }
      this.failedStatistics.offset += phones.length;
      this.checkDeviationDetail(phones);
    },

    checkDeviationDetail:function(phones){
      var data={
         phones:phones,
      };
      this.$http.post(URL_VTF_CHECK_ITEMS,data,{
        params:{
              apikey:this.failedStatistics.apikey,
              subid:this.failedStatistics.subid,
              date:this.failedStatistics.date,
            }
      }).then((response) => {
        var arr = response.body;
       // console.log("checkDeviationDetail:" + JSON.stringify(arr))
        var indexcache = -1;
        var phnumcache = '';
        arr.forEach((a) => {
          var index = indexcache;
          if(a.phonenum !== phnumcache){
            index = this.findIndexInFF(a.phonenum);
            indexcache = index;
            phnumcache = a.phonenum;
            //console.log("checkDeviationDetail:index=" + index);
          }else{
            console.log("checkDeviationDetail:cached index=" + index);
          }
          if(index>=0){
            var ss = {
                phonenum:a.phonenum,
                createtime:moment(a.createtime).format('YYYY-MM-DD HH:mm:ss'),
                updatetime:moment(a.updatetime).format('YYYY-MM-DD HH:mm:ss'),
                status:a.status,
                verifysms:a.verifysms
              };
            this.failedStatistics.tableData[index].sub.push(ss);
          }
          
        });
        this.doCheckDetail();
      }, (response) => {
          console.log("checkDeviationDetail response="+JSON.stringify(response));
          this.$Message.error(JSON.stringify(response));
          this.failedStatistics.loading = false;
      });

    },

    findIndexInFF:function(phonenum){
      var ret = -1;
      for(var i=0; i<this.failedStatistics.tableData.length;i++){
        var e = this.failedStatistics.tableData[i];
        if(e.phonenum === phonenum){
          ret = e.index;
          break;
        }
      }
      return ret;
    }
  }
}
</script>

