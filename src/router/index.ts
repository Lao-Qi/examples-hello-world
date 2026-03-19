import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/orders'
    },
    {
      path: '/parts',
      name: 'parts',
      component: () => import('../views/PartsManagementView.vue')
    },
    {
      path: '/sku',
      name: 'sku',
      component: () => import('../views/SkuManagementView.vue')
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrderManagementView.vue')
    },
    {
      path: '/orders/:id',
      name: 'orderDetail',
      component: () => import('../views/OrderDetailView.vue')
    }
  ]
})

export default router
