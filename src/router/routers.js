export const helloRouter = {
    path: '/',
    name: 'HelloWorld',
    component: () => import('@/components/HelloWorld.vue')
};