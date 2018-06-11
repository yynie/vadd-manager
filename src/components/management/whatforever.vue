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
          当前页：{{exxxParsed.SheetNames[exxxParsed.sheetIndex]}}&nbsp;&nbsp;&nbsp;本页共 {{tableData.length}} 条
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
      </Row>
      <Row style="margin: 10px 0 0 0">
        <Input v-model="format.result" type="textarea" :rows="20"></Input>
      </Row>
    </Card>
  </div>
</template>
<script>
import XLSX from 'xlsx';
import NamedPage from "../common/NamedPage.vue"

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
      tableData:[
        // {it0:"first",it1:"11111",it2:"aaaaa"},
        // {it0:"第二",it1:"22222",it2:"BBBBB"},
        // {it0:"no3",it1:"三三三",it2:"Cat"},
        // {it0:"四四",it1:"fourth",it2:"Dolor"},
      ],
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
      }
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
            this.tableData.push(one);
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
    genFormatedResult:function(){
      this.format.result="";
      this.tableData.forEach((e) => {
        var str = this.format.fstr;
        for(var i = 0; i < this.formatItems.length; i++){
          var fe = this.formatItems[i];
          var p = e[fe.paramkey];
          str = str.replace("{"+i+"}",p);
        }
        if(this.format.result !== ""){
          this.format.result += this.format.sep;
        }
        this.format.result += str;
      })
    }
  }
}
</script>

