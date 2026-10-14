<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

interface Attempt {
  id: number
  test_id: number
  test_title: string
  completed_at: string
  duration_seconds: number
  total_words: number
  gross_wpm: number
  net_wpm: number
  accuracy: number
  error_percentage: number
  full_mistakes: number
  half_mistakes: number
}

const router = useRouter()

const attempts = ref<Attempt[]>([])

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const response =
      await api.get<Attempt[]>(
        '/history'
      )

    attempts.value = response.data
  } catch (err) {
    error.value =
      'Failed to load your test history.'

    console.error(err)
  } finally {
    loading.value = false
  }
})

function openResult(attemptId: number) {
  router.push(
    `/result/${attemptId}`
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(
    'en-IN',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  )
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(
    seconds / 60
  )

  const remaining = seconds % 60

  if (minutes === 0) {
    return `${remaining}s`
  }

  return `${minutes}m ${remaining}s`
}
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <main
      class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <header
        class="mb-6 rounded-2xl bg-white p-6 shadow-sm"
      >
        <p
          class="text-sm font-semibold text-blue-600"
        >
          Progress
        </p>

        <h1
          class="mt-1 text-3xl font-bold text-slate-900"
        >
          Test History
        </h1>

        <p
          class="mt-2 text-sm text-slate-500"
        >
          Your previous typing test attempts.
        </p>
      </header>

      <div
        v-if="loading"
        class="rounded-2xl bg-white p-8 text-center shadow-sm"
      >
        <p class="text-slate-600">
          Loading history...
        </p>
      </div>

      <div
        v-else-if="error"
        class="rounded-2xl bg-white p-8 text-center shadow-sm"
      >
        <p class="text-red-600">
          {{ error }}
        </p>
      </div>

      <div
        v-else-if="attempts.length === 0"
        class="rounded-2xl bg-white p-10 text-center shadow-sm"
      >
        <h2
          class="text-xl font-semibold text-slate-900"
        >
          No tests completed yet
        </h2>

        <p
          class="mt-2 text-sm text-slate-500"
        >
          Complete your first typing test and
          your result will appear here.
        </p>
      </div>

      <div
        v-else
        class="overflow-hidden rounded-2xl bg-white shadow-sm"
      >
        <div
          class="hidden overflow-x-auto md:block"
        >
          <table
            class="w-full text-left text-sm"
          >
            <thead
              class="border-b border-slate-200 bg-slate-50"
            >
              <tr>
                <th
                  class="px-5 py-4 font-semibold text-slate-600"
                >
                  Date
                </th>

                <th
                  class="px-5 py-4 font-semibold text-slate-600"
                >
                  Test
                </th>

                <th
                  class="px-5 py-4 font-semibold text-slate-600"
                >
                  Gross WPM
                </th>

                <th
                  class="px-5 py-4 font-semibold text-slate-600"
                >
                  Net WPM
                </th>

                <th
                  class="px-5 py-4 font-semibold text-slate-600"
                >
                  Accuracy
                </th>

                <th
                  class="px-5 py-4 font-semibold text-slate-600"
                >
                  Mistakes
                </th>

                <th class="px-5 py-4"></th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="attempt in attempts"
                :key="attempt.id"
                class="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td
                  class="px-5 py-4 text-slate-600"
                >
                  {{ formatDate(
                    attempt.completed_at
                  ) }}
                </td>

                <td
                  class="px-5 py-4 font-medium text-slate-900"
                >
                  {{ attempt.test_title }}
                </td>

                <td
                  class="px-5 py-4 font-semibold text-slate-900"
                >
                  {{
                    attempt.gross_wpm.toFixed(2)
                  }}
                </td>

                <td
                  class="px-5 py-4 font-semibold text-slate-900"
                >
                  {{
                    attempt.net_wpm.toFixed(2)
                  }}
                </td>

                <td class="px-5 py-4">
                  {{
                    attempt.accuracy.toFixed(2)
                  }}%
                </td>

                <td class="px-5 py-4">
                  {{
                    attempt.full_mistakes +
                    attempt.half_mistakes
                  }}
                </td>

                <td
                  class="px-5 py-4 text-right"
                >
                  <button
                    type="button"
                    class="rounded-lg bg-blue-50 px-4 py-2 font-semibold text-blue-600 hover:bg-blue-100"
                    @click="openResult(
                      attempt.id
                    )"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="divide-y divide-slate-100 md:hidden"
        >
          <div
            v-for="attempt in attempts"
            :key="attempt.id"
            class="p-5"
          >
            <div
              class="flex items-start justify-between gap-4"
            >
              <div>
                <p
                  class="font-semibold text-slate-900"
                >
                  {{ attempt.test_title }}
                </p>

                <p
                  class="mt-1 text-sm text-slate-500"
                >
                  {{ formatDate(
                    attempt.completed_at
                  ) }}
                </p>
              </div>

              <button
                type="button"
                class="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-100"
                @click="openResult(
                  attempt.id
                )"
              >
                View
              </button>
            </div>

            <div
              class="mt-4 grid grid-cols-2 gap-4"
            >
              <div>
                <p
                  class="text-xs text-slate-500"
                >
                  Gross WPM
                </p>

                <p class="mt-1 font-semibold">
                  {{
                    attempt.gross_wpm.toFixed(2)
                  }}
                </p>
              </div>

              <div>
                <p
                  class="text-xs text-slate-500"
                >
                  Net WPM
                </p>

                <p class="mt-1 font-semibold">
                  {{
                    attempt.net_wpm.toFixed(2)
                  }}
                </p>
              </div>

              <div>
                <p
                  class="text-xs text-slate-500"
                >
                  Accuracy
                </p>

                <p class="mt-1 font-semibold">
                  {{
                    attempt.accuracy.toFixed(2)
                  }}%
                </p>
              </div>

              <div>
                <p
                  class="text-xs text-slate-500"
                >
                  Duration
                </p>

                <p class="mt-1 font-semibold">
                  {{
                    formatDuration(
                      attempt.duration_seconds
                    )
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>