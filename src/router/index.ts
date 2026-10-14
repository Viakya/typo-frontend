import {
  createRouter,
  createWebHistory,
} from 'vue-router'

import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(
    import.meta.env.BASE_URL
  ),

  routes: [
    {
      path: '/',
      name: 'home',
      component: () =>
        import('../views/HomeView.vue'),
    },

    {
      path: '/login',
      name: 'login',
      component: () =>
        import('../views/LoginView.vue'),
      meta: {
        guestOnly: true,
      },
    },

    {
      path: '/tests',
      name: 'tests',
      component: () =>
        import('../views/TestsView.vue'),
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/test/:testId',
      name: 'typing-test',
      component: () =>
        import('../views/TypingTestView.vue'),
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/test/:testId/history',
      name: 'test-history',
      component: () =>
        import('../views/TestHistoryView.vue'),
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/result/:attemptId',
      name: 'result',
      component: () =>
        import('../views/ResultView.vue'),
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/history',
      name: 'history',
      component: () =>
        import('../views/HistoryView.vue'),
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/admin',
      name: 'admin',
      component: () =>
        import('../views/AdminDashboardView.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },

    {
      path: '/admin/exams',
      name: 'admin-exams',
      component: () =>
        import('../views/AdminExamsView.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },

    {
      path: '/admin/test-series',
      name: 'admin-test-series',
      component: () =>
        import('../views/AdminTestSeriesView.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },

    {
      path: '/admin/passages',
      name: 'admin-passages',
      component: () => 
        import('../views/AdminPassagesView.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },

    {
      path: '/admin/tests',
      name: 'admin-tests',
      component: () => 
        import('../views/AdminTestsView.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },

    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/AdminUsersView.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },

    {
      path: '/admin/attempts',
      name: 'admin-attempts',
      component: () => import('../views/AdminAttemptsView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },

  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (
    to.meta.requiresAuth &&
    !auth.user
  ) {
    return {
      name: 'login',
    }
  }

  if (
    to.meta.guestOnly &&
    auth.user
  ) {
    return auth.user.role === 'ADMIN'
      ? { name: 'admin' }
      : { name: 'tests' }
  }

  if (
    to.meta.requiresAdmin &&
    auth.user?.role !== 'ADMIN'
  ) {
    return {
      name: 'tests',
    }
  }

  return true
})

export default router