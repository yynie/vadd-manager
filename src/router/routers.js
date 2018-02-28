export const helloRouter = {
    path: '/',
    name: 'HelloWorld',
    component: () => import('@/components/HelloWorld.vue')
};

export const signinRouter = {
    path: '/login',
    name: 'SignIn',
    meta: {
        title: '登录'
    },
    component: () => import('@/components/SignIn.vue')
};