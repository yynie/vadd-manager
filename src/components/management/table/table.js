export const DtCustColumns = (vm) => {
    return [
        { key: 'name', title: '名称'},
        { key: 'disp', title: '描述'},
        { key: 'apikey', title: 'KEY'},
        { key: 'quotas', title: '流量指标(M)'},
        { key: 'options',title: '操作',
           render: (h, params) => {
               return h('div', [
                   h('Button', {
                       props: {
                           type: "ghost",
                           size: 'small'
                       },
                       style: {
                           margin:'0 8px'
                       },
                       on: {
                           click: () => {
                           vm.onEdit(params.row.index);
                       }
                   }
                   }, '编辑'),
                   h('Button', {
                       props: {
                           type: "error",
                           size: 'small'
                       },
                       on: {
                           click: () => {
                            vm.onDelete(params.row.index);
                       }
                   }
                   }, '删除')
               ]);
           }
        }
    ]
}

export const VcpColumns = (vm) => {
    return [
        {key:'a',title:'a',width:200,fixed:'let'},
        {key:'b',title:'b'},
        {key:'c',title:'c',width:150,
        render: (h, params) => {
           if(params.row.c === ''){
               return h('span','');
           }else{
           return h('Button', {
                       props: {
                           type: "primary",
                           size: 'small'
                       },
                       style: {
                           margin:'0 8px'
                       },
                       on: {
                           click: () => {
                           vm.onItemClick(params.row.do);
                           }
                       }
                   }, params.row.c)
           }
        }}
    ]
}

export const VcpRetailColumes = () => {
    return [
        {key:'a',title:'a',width:200},
        {key:'b',title:'b'},
    ]
}

export const SubjectColumns = (vm) => {
    return [
        {key:'subname',title:'名称'},
        {key:'subid',title:'Sub ID'},
        {key:'subtype',title:'类型'},
        {key:'price',title:'单价(￥)'},
        {key:'onoff',title:'是否授权'},
        {key:'option',title:'',
            render: (h, params) => {
                return h('div', [
                        h('Button', {
                            props: {
                                type: "ghost",
                                size: 'small'
                            },
                            style: {
                                margin:'0 10px 0 0'
                            },
                            on: {
                                click: () => {
                                    vm.onSubjectEdit(params.row.index);
                                }
                            }
                        }, '编辑'),
                        h('Button', {
                            props: {
                                type: "error",
                                size: 'small'
                            },
                            on: {
                                click: () => {
                                    vm.onSubjectDelete(params.row.index);
                                }
                            }
                        }, '删除')
                ]);
            }}
    ]
}

export const VerifytaskTerminalColumns = () => {
    return [
        {
            type: 'selection',
            width: 60,
            align: 'center'
        },
        {key:'phonenum', width: 120, title:'号码'},
        {key:'failed_cnt', width: 120, title:'未上报次数',
        filters: [
            {
                label: '0次',
                value: 1
            },
            {
                label: '1~10次',
                value: 2
            },
            {
                label: '11~20次',
                value: 3
            },
            {
                label: '大于20次',
                value: 4
            }
        ],
        filterMultiple: true,
        filterMethod (value, row) {
            if(value === 1){
                return row.failed_cnt==='0';
            }else if(value === 2){
                return ((row.failed_cnt>'0') && (row.failed_cnt<='10'));
            }else if(value === 3){
                return ((row.failed_cnt>'10') && (row.failed_cnt<='20'));
            }else if(value === 4){
                return row.failed_cnt>'20';
            }
        }
        },
        {key:'sta', width: 110, title:'pnt-state',
        filters: [
            {
                label: '0-可用',
                value: 0
            },
            {
                label: '1-永远关闭',
                value: 1
            }
        ],
        filterMultiple: false,
        filterMethod (value, row) {
            if(value === 0){
                return row.sta === '0';
            }else if(value === 1){
                return row.sta === '1';
            }
        }
        },
        {key:'nextrate', width: 85, title:'nextrate'},
        {key:'finish_cnt', width: 100, title:'totalcnt',
        filters: [
            {
                label: '未完成',
                value: 1
            },
            {
                label: '已完成',
                value: 2
            }
        ],
        filterMultiple: false,
        filterMethod (value, row) {
            if(value === 1){
                return row.finish_cnt === '0';
            }else if(value === 2){
                return row.finish_cnt > '0';
            }
        }
        },
        {key:'prov', width: 120, title:'protocolver',
        filters: [
            {
                label: '0',
                value: 0
            },
            {
                label: '1',
                value: 1
            },
            {
                label: '2',
                value: 2
            },
            {
                label: '4',
                value: 4
            },
        ],
        filterMultiple: true,
        filterMethod (value, row) {
            if(value === 0){
                return row.prov === '0';
            }else if(value === 1){
                return row.prov === '1';
            }else if(value === 2){
                return row.prov === '2';
            }else if(value === 4){
                return row.prov === '4';
            }
        }
        },
        {key:'buildid', width: 450, title:'buildid'},
        {key:'buildidkey', width: 120, title:'buildidkey',
        filters: [
            {
                label: '功能机',
                value: 1
            },
            {
                label: '智能机',
                value: 2
            }
        ],
        filterMultiple: false,
        filterMethod (value, row) {
            if(value === 1){
                return row.prov === 'forvt';
            }else if(value === 2){
                return row.prov != 'forvt';
            }
        }
        },
        {key:'createtime', width: 150, title:'createtime'}
    ]
}
