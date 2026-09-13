import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', component: () => import('../views/Login.vue') },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/orders',
    children: [
      { path: 'orders', component: () => import('../views/Orders.vue') },
      { path: 'cards', component: () => import('../views/Cards.vue') },
      { path: 'import', component: () => import('../views/Import.vue') },
      { path: 'change-password', component: () => import('../views/ChangePassword.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router