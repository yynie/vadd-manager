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
        key: 'createtime',
        title: '创建日期',
        width: 160+addwidth,
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
        key: 'pub',
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
        //     vm.remoteFilter('pub', value);
        //     if (value === 1) {
        //         return row.pub>0;
        //     } else if (value === 2) {
        //         return row.pub === 0;
        //     }
        // },
        filterRemote(checked, key, column){
            vm.tablefilterRemote(checked, key, column);
        },
        render: (h, params) => {
            const color = params.row.pub>0?'':'red';
            const text = params.row.pub>0?'已发布':'未发布';
        
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
        // filterMethod (value, row) {
        //    // vm.remoteFilter('online', value);
        //     return (row.online === value);
        // },
        filterRemote(checked, key, column){
            vm.tablefilterRemote(checked, key, column);
        },
        render: (h, params) => {
            const color = params.row.online===0?'':(params.row.online===1?'green':'red');
            const text = params.row.online===0?'未知':(params.row.online===1?'已上线':'未上线');
            const icon = params.row.online===0?'help':(params.row.online===1?'checkmark':'close');
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
            var disabledpub = (params.row.pub > 0);
            var disabledSearch = (params.row.online === 1);
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
                                    vm.onlineCheck(params.row.id);
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
                                    vm.pubOne(params.row.id);
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

export const dtqueryColumns = () => {
    return [
        {key: 'imei', title: 'IMEI'},
        {key: 'state', title: '状态',
        render: (h, params) => {
            var color = ''
            var text = 'state:'+params.row.state;
            var icon = 'help';
            if(params.row.state==='900'){
                color = 'red';
                text = '失败';
                icon = 'close';
            }else if(params.row.state==='200'){
                color = 'green';
                text = '完成';
                icon = 'checkmark';
            }else if(params.row.state==='5'){
                color = '#ff7700';
                text = '执行中';
                icon = 'flash';
            }else if(params.row.state==='0'){
                color = '';
                text = '未开始';
                icon = 'ios-circle-outline';
            }else if(params.row.state===''){
                color = '#aaa';
                text = '???';
                icon = 'help';
            }

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
        {key: 'mode', title: '模式',
            render: (h, params) => {
                const text = params.row.mode === ''?'???':params.row.mode;
                const color = params.row.mode === ''?'#aaa':'';
                return h('span', {
                    style: {
                        fontSize:'13px',
                        color: color
                    }
                },text)
            },
        },
        {key: 'total', title: '总量(M)',sortable:true},
        {key: 'rest', title: '剩余(M)',
            render: (h, params) => {
                const text = params.row.rest === ''?'???':params.row.rest;
                const color = params.row.rest === ''?'#aaa':'';
                return h('span', {
                    style: {
                        fontSize:'13px',
                        color: color
                    }
                },text)
            },
        },
        {key: 'duration', title: '耗时(秒)',sortable: true,
            render: (h, params) => {
                const text = params.row.duration === ''?'???':params.row.duration;
                const color = params.row.duration === ''?'#aaa':'';
                return h('span', {
                    style: {
                        fontSize:'13px',
                        color: color
                    }
                },text)
            },
        },
        {key: 'speed', title: '估算速度(B/秒)',sortable: true,
            render: (h, params) => {
                const text = params.row.speed === ''?'???':params.row.speed;
                const color = params.row.speed === ''?'#aaa':'';
                return h('span', {
                    style: {
                        fontSize:'13px',
                        color: color
                    }
                },text)
            },
        },
        {key: 'statetime', title: '状态更新时间',sortable: true,
            render: (h, params) => {
                const text = params.row.statetime === ''?'???':params.row.statetime;
                const color = params.row.statetime === ''?'#aaa':'';
                return h('span', {
                    style: {
                        fontSize:'13px',
                        color: color
                    }
                },text)
            },
        },
        {key: 'updatetime', title: '最后更新时间',sortable: true,
            render: (h, params) => {
                const text = params.row.updatetime === ''?'???':params.row.updatetime;
                const color = params.row.updatetime === ''?'#aaa':'';
                return h('span', {
                    style: {
                        fontSize:'13px',
                        color: color
                    }
                },text)
            },
        },
    ]
}
