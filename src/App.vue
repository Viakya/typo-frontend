<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

function logout() {
  auth.clearAuth()
  router.push('/login')
}

function isActive(path: string) {
  return route.path === path
}
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <header
      v-if="auth.user"
      class="sticky top-0 z-50 border-b border-slate-200 bg-white"
    >
      <nav
        class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
      >
        <button
          type="button"
          class="text-lg font-bold text-slate-900"
          @click="
            router.push(
              auth.user.role === 'ADMIN'
                ? '/admin'
                : '/tests'
            )
          "
        >
          Typing Practice
        </button>

        <div class="flex items-center gap-2">

          <!-- Normal user navigation -->
          <template v-if="auth.user.role !== 'ADMIN'">
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium"
              :class="
                isActive('/tests')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              "
              @click="router.push('/tests')"
            >
              Tests
            </button>

            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium"
              :class="
                isActive('/history')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              "
              @click="router.push('/history')"
            >
              History
            </button>
          </template>

          <!-- Admin navigation -->
          <template v-if="auth.user.role === 'ADMIN'">
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium"
              :class="
                isActive('/admin')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              "
              @click="router.push('/admin')"
            >
              Admin
            </button>
          </template>

          <div
            class="mx-2 hidden h-6 w-px bg-slate-200 sm:block"
          ></div>

          <span
            class="hidden max-w-40 truncate text-sm text-slate-600 sm:block"
          >
            {{ auth.user.name }}
          </span>

          <button
            type="button"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>

    <RouterView />
  </div>
</template>