<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

interface DashboardData {
  users: {
    total: number
  }
  exams: {
    total: number
    active: number
  }
  test_series: {
    total: number
    active: number
  }
  passages: {
    total: number
    active: number
  }
  tests: {
    total: number
    published: number
  }
  attempts: {
    total: number
  }
}

const router = useRouter()

const dashboard = ref<DashboardData | null>(null)
const loading = ref(true)
const error = ref('')

async function loadDashboard() {
  loading.value = true
  error.value = ''

  try {
    const response =
      await api.get<DashboardData>(
        '/admin/dashboard'
      )

    dashboard.value = response.data
  } catch (err) {
    console.error(err)

    error.value =
      'Unable to load the admin dashboard.'
  } finally {
    loading.value = false
  }
}

function goTo(path: string) {
  router.push(path)
}

onMounted(loadDashboard)
</script>

<template>
  <main
    class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
  >
    <!-- Header -->
    <div class="mb-8">
      <h1
        class="text-2xl font-bold text-slate-900"
      >
        Admin Dashboard
      </h1>

      <p
        class="mt-1 text-sm text-slate-500"
      >
        Manage exams, tests, passages and
        platform activity.
      </p>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500"
    >
      Loading dashboard...
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"
    >
      {{ error }}
    </div>

    <!-- Dashboard -->
    <template v-else-if="dashboard">

      <!-- Statistics -->
      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <!-- Users -->
        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:bg-blue-50"
          @click="goTo('/admin/users')"
        >
          <p
            class="text-sm font-medium text-slate-500"
          >
            Users
          </p>

          <p
            class="mt-2 text-3xl font-bold text-slate-900"
          >
            {{ dashboard.users.total }}
          </p>
        </button>

        <!-- Exams -->
        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:bg-blue-50"
          @click="goTo('/admin/exams')"
        >
          <p
            class="text-sm font-medium text-slate-500"
          >
            Exams
          </p>

          <p
            class="mt-2 text-3xl font-bold text-slate-900"
          >
            {{ dashboard.exams.total }}
          </p>

          <p
            class="mt-1 text-xs text-slate-500"
          >
            {{ dashboard.exams.active }} active
          </p>
        </button>

        <!-- Test Series -->
        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:bg-blue-50"
          @click="goTo('/admin/test-series')"
        >
          <p
            class="text-sm font-medium text-slate-500"
          >
            Test Series
          </p>

          <p
            class="mt-2 text-3xl font-bold text-slate-900"
          >
            {{ dashboard.test_series.total }}
          </p>

          <p
            class="mt-1 text-xs text-slate-500"
          >
            {{ dashboard.test_series.active }} active
          </p>
        </button>

        <!-- Passages -->
        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:bg-blue-50"
          @click="goTo('/admin/passages')"
        >
          <p
            class="text-sm font-medium text-slate-500"
          >
            Passages
          </p>

          <p
            class="mt-2 text-3xl font-bold text-slate-900"
          >
            {{ dashboard.passages.total }}
          </p>

          <p
            class="mt-1 text-xs text-slate-500"
          >
            {{ dashboard.passages.active }} active
          </p>
        </button>

        <!-- Tests -->
        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:bg-blue-50"
          @click="goTo('/admin/tests')"
        >
          <p
            class="text-sm font-medium text-slate-500"
          >
            Tests
          </p>

          <p
            class="mt-2 text-3xl font-bold text-slate-900"
          >
            {{ dashboard.tests.total }}
          </p>

          <p
            class="mt-1 text-xs text-slate-500"
          >
            {{ dashboard.tests.published }} published
          </p>
        </button>

        <!-- Attempts -->
        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:bg-blue-50"
          @click="goTo('/admin/attempts')"
        >
          <p
            class="text-sm font-medium text-slate-500"
          >
            Attempts
          </p>

          <p
            class="mt-2 text-3xl font-bold text-slate-900"
          >
            {{ dashboard.attempts.total }}
          </p>
        </button>
      </div>

      <!-- Content Management -->
      <div class="mt-8">
        <h2
          class="text-lg font-semibold text-slate-900"
        >
          Content Management
        </h2>

        <div
          class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <!-- Exams -->
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:bg-blue-50"
            @click="goTo('/admin/exams')"
          >
            <p
              class="font-semibold text-slate-900"
            >
              Exams
            </p>

            <p
              class="mt-1 text-sm text-slate-500"
            >
              Create and manage exams.
            </p>
          </button>

          <!-- Test Series -->
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:bg-blue-50"
            @click="goTo('/admin/test-series')"
          >
            <p
              class="font-semibold text-slate-900"
            >
              Test Series
            </p>

            <p
              class="mt-1 text-sm text-slate-500"
            >
              Organize tests into series.
            </p>
          </button>

          <!-- Passages -->
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:bg-blue-50"
            @click="goTo('/admin/passages')"
          >
            <p
              class="font-semibold text-slate-900"
            >
              Passages
            </p>

            <p
              class="mt-1 text-sm text-slate-500"
            >
              Manage typing passages.
            </p>
          </button>

          <!-- Tests -->
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:bg-blue-50"
            @click="goTo('/admin/tests')"
          >
            <p
              class="font-semibold text-slate-900"
            >
              Tests
            </p>

            <p
              class="mt-1 text-sm text-slate-500"
            >
              Create and publish tests.
            </p>
          </button>
        </div>
      </div>
    </template>
  </main>
</template>