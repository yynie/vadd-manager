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