export const homeRouter = {
    path: '/',
    name: 'Home',
    meta: {
        title: 'Home'
    },
    component: () => import('@/components/Home.vue')
};

export const signinRouter = {
    path: '/login',
    name: 'SignIn',
    meta: {
        title: '登录'
    },
    component: () => import('@/components/SignIn.vue')
};