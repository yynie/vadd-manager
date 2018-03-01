export const homeRouter = {
    path: '/',
    name: 'Home',
    component: () => import('@/components/Home.vue'),
    redirect: '/query',
    children: [
        { path: 'query', title: 'query', name: 'query', component: () => import('@/components/query/query.vue') },
        { path: 'dtquery', title: 'dtquery', name: 'dtquery', component: () => import('@/components/datatarget/dtquery.vue') },
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