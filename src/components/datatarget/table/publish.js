export const columns = (vm) => {
    var addwidth = vm.$store.state.isCollapsed?32:0;
    return [
    {
        key: 'imei',
        title: 'IMEI',
        fixed: 'left',
        width: 170+addwidth
    },
    {
        key: 'create',
        title: '创建日期',
        width: 140+addwidth,
        sortable: true
    },
    {
        key: 'duration',
        title: '发布时间区间',
        width: 140+addwidth
    },
    {
        key: 'quota',
        title: '指标(M)',
        width: 90+addwidth
    },
    {
        key: 'status',
        title: '发布状态',
        width: 180+addwidth,
        filters: [
            {
                label: '已发布',
                value: 1
            },
            {
                label: '未发布',
                value: 2
            }
        ],
        filterMultiple: false,
        // filterMethod (value, row) {
        //     if (value === 1) {
        //         return row.status === true;
        //     } else if (value === 2) {
        //         return row.status === false;
        //     }
        // },
        filterRemote(checked, key, column){
            vm.tablefilterRemote(checked, key, column);
        },
        render: (h, params) => {
            const color = params.row.status?'':'red';
            const text = params.row.status?'已发布':'未发布';
        
            return h('Tag', {
                props: {
                    type: 'dot',
                    color: color
                }
            }, text);
        }
    },
    {
        key: 'online',
        title: '终端上线',
        width: 180+addwidth,
        filters: [
            {
                label: '已上线',
                value: 1
            },
            {
                label: '未上线',
                value: 2
            },
            {
                label: '未知',
                value: 3
            }
        ],
        filterMultiple: false,
        filterRemote(checked, key, column){
            vm.tablefilterRemote(checked, key, column);
        },
        render: (h, params) => {
            const color = params.row.online===3?'':(params.row.online===1?'green':'red');
            const text = params.row.online===3?'未知':(params.row.online===1?'已上线':'未上线');
            const icon = params.row.online===3?'help':(params.row.online===1?'checkmark':'close');
            return h('div', [
                h('Icon', {
                    props: {
                        type: icon,
                        size: '14',
                        color: color
                    }
                }),
                h('span', {
                    style: {
                        fontSize:'13px',
                        marginLeft:'10px',
                        color: color
                    }
                },text)
            ]);
        }
    },
    {
        key: 'options',
        title: '操作',
        width: 180+addwidth,
        render: (h, params) => {
            var txt = '发布'+vm.taskTime+'任务';
            var disabledpub = params.row.status;
            var disabledSearch = params.row.online !== 0;
            return h('div', [
                    h('Tooltip', {
                        props: {
                            content: '查询是否上线',
                            placement: 'top',
                            transfer: true
                        },
                    }, [
                        h('Button', {
                            props: {
                                type: "ghost",
                                size: 'small',
                                disabled: disabledSearch
                            },
                            style: {
                                width:'40px',
                                height: '30px'
                            },
                            on: {
                                click: () => {
                                    vm.onlineCheck(params.row.imei);
                                }
                            },
                        },[h('Icon',{props:{type:'search',size:'18'}})])
                        ]
                    ),
                    h('Tooltip', {
                        props: {
                            content: txt, 
                            placement: 'top',
                            transfer: true
                        },
                        style: {
                            marginLeft:'10px'
                        }
                    }, [
                        h('Button', {
                            props: {
                                type: "success",
                                //shape: "circle",
                                size: 'small',
                                disabled: disabledpub
                            },
                            style: {
                                width:'40px',
                                height: '30px'
                            },
                            on: {
                                click: () => {
                                    vm.pubOne(params.row.imei);
                                }
                            },
                        },[h('Icon',{props:{type:'paper-airplane',size:'16'}})])
                        ]
                    ),
            ]);
        }
    }
]
};

export const checkcolumns = (vm) => {
    return [
        {
            key: 'imei',
            title: '冲突IMEI',
            render: (h, params) => {
                return h('p',{style:{color:'#f00'}}, params.row.imei);
            }
        },
        {
            key: 'customer',
            title: '所属客户',
            render: (h, params) => {
                return h('p',{style:{color:'#f00'}}, params.row.customer);
            }
        },
        {
            key: 'status',
            title: '状态',
        },
        {
            key: 'options',
            title: '删除？',
            render: (h, params) => {
                var disabled = (vm.status != 1);
                var txt = disabled?"检测中...":" 删 除 ";
                return h('Button', {
                        props: {
                            type: "error",
                            size: 'small',
                            disabled: disabled
                        },
                        on: {
                            click: () => {
                                vm.onDelete(params.row.imei);
                            }
                        },
                    },txt
                );
            }
        }
    ]
};
