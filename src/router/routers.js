import ERROR404 from '@/components/error-404';
export const homeRouter = {
    path: '/',
    name: 'Home',
    component: () => import('@/components/Home.vue'),
    redirect: '/home_index',
    children: [
        { path: 'home_index', meta:{title: '首页'}, name: 'home_index', component: () => import('@/components/homeindex.vue') },
        
        { path: 'query', meta:{title: 'query', group:'dquery', groupname:'数据查询'}, name: 'query', component: () => import('@/components/query/query.vue') },
        //流量任务
        { path: 'dtquery', meta:{title: '查询', group:'dtarget', groupname:'流量消耗'}, name: 'dtquery', component: () => import('@/components/datatarget/dtquery.vue') },
        { path: 'dttask', meta:{title: '发布', group:'dtarget', groupname:'流量消耗'}, name: 'dttask', component: () => import('@/components/datatarget/dttask.vue')},
        //管理
        { path: 'vcpaccount',meta:{title: 'VCP 账户', group:'management', groupname:'管理'}, name: 'vcpaccount', component: () => import('@/components/management/vcpaccount.vue')},
        { path: 'dtcustomer',meta:{title: '流量任务客户', group:'management', groupname:'管理'}, name: 'dtcustomer', component: () => import('@/components/management/dtcustomer.vue')},
        { path: 'bonuspool',meta:{title: '奖励池', group:'management', groupname:'管理'}, name: 'bonuspool', component: () => import('@/components/management/bonuspool.vue')},
        { path: 'subject',meta:{title: 'Vadd项目', group:'management', groupname:'管理'}, name: 'subject', component: () => import('@/components/management/subject.vue')},
        { path: 'whatforever', meta:{title: 'WhatForEver', group:'management', groupname:'管理'}, name:'whatforever', component: () => import('@/components/management/whatforever.vue')},
    ]
};

export const signinRouter = {
    path: '/login',
    name: 'SignIn',
    meta: {
        title: '登录'
    },
    component: () => import('@/components/SignIn.vue')
};

export const page404 = {
    path: '/*',
    name: '404',
    meta: {
        title: '404-页面不存在'
    },
    component: ERROR404
};