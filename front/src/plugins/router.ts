import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue';
import Account from '../views/Account.vue';
import NotFound from '../views/404.vue';
import InternalServerError from '../views/500.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/account/:username',
        name: 'Account',
        component: Account,
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'InternalServerError',
        component: InternalServerError,
    },
];

if (process.env.NODE_ENV === 'development') {
    routes.push(
        ...[
            {
                path: '/404',
                name: '404',
                component: NotFound,
            },
            {
                path: '/500',
                name: '500',
                component: InternalServerError,
            },
        ],
    );
}

const router = createRouter({
    routes,
    history: createWebHistory(),
});

export default router;
