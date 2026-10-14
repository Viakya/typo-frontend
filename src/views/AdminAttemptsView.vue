<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../services/api'

interface AttemptUser {
  id: number | null
  name: string
  email: string | null
}

interface AttemptTest {
  id: number
  title: string
  test_number: number
}

interface Mistakes {
  omission: number
  substitution: number
  addition: number
  spelling: number
  repetition: number
  incomplete_word: number
  spacing: number
  capitalization: number
  punctuation: number
  transposition: number
  paragraph: number
}

interface Attempt {
  id: number
  user: AttemptUser
  test: AttemptTest
  started_at: string
  completed_at: string
  duration_seconds: number
  total_words: number
  actual_key_depressions: number
  candidate_key_depressions: number
  gross_wpm: number
  net_wpm: number
  accuracy: number
  error_percentage: number
  full_mistakes: number
  half_mistakes: number
  mistakes: Mistakes
  created_at: string
}

const attempts = ref<Attempt[]>([])
const loading = ref(true)
const error = ref('')

async function loadAttempts() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get<Attempt[]>('/admin/attempts')
    attempts.value = response.data
  } catch (err: any) {
    error.value =
      err.response?.data?.error ||
      'Failed to load attempts.'
  } finally {
    loading.value = false
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

onMounted(loadAttempts)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-7xl px-6 py-8">

      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Attempts
          </h1>

          <p class="mt-1 text-sm text-gray-500">
            View typing test attempts and performance.
          </p>
        </div>

        <RouterLink
          to="/admin"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Dashboard
        </RouterLink>
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500"
      >
        Loading attempts...
      </div>

      <!-- Content -->
      <div
        v-else
        class="overflow-hidden rounded-xl border border-gray-200 bg-white"
      >
        <!-- Summary -->
        <div class="border-b border-gray-200 px-6 py-4">
          <h2 class="font-semibold text-gray-900">
            All Attempts
          </h2>

          <p class="mt-1 text-sm text-gray-500">
            {{ attempts.length }}
            attempt{{ attempts.length === 1 ? '' : 's' }}
          </p>
        </div>

        <!-- Empty -->
        <div
          v-if="attempts.length === 0"
          class="px-6 py-12 text-center text-sm text-gray-500"
        >
          No typing attempts have been recorded yet.
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  User
                </th>

                <th
                  class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Test
                </th>

                <th
                  class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Date
                </th>

                <th
                  class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Duration
                </th>

                <th
                  class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Gross WPM
                </th>

                <th
                  class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Net WPM
                </th>

                <th
                  class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Accuracy
                </th>

                <th
                  class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Errors
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200 bg-white">
              <tr
                v-for="attempt in attempts"
                :key="attempt.id"
                class="hover:bg-gray-50"
              >
                <!-- User -->
                <td class="px-6 py-4">
                  <div class="font-medium text-gray-900">
                    {{ attempt.user.name }}
                  </div>

                  <div class="mt-1 text-xs text-gray-500">
                    {{ attempt.user.email || 'No email' }}
                  </div>
                </td>

                <!-- Test -->
                <td class="px-6 py-4">
                  <div class="font-medium text-gray-900">
                    {{ attempt.test.title }}
                  </div>

                  <div class="mt-1 text-xs text-gray-500">
                    Test #{{ attempt.test.test_number }}
                  </div>
                </td>

                <!-- Date -->
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {{ formatDate(attempt.completed_at) }}
                </td>

                <!-- Duration -->
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {{ formatDuration(attempt.duration_seconds) }}
                </td>

                <!-- Gross WPM -->
                <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {{ attempt.gross_wpm.toFixed(2) }}
                </td>

                <!-- Net WPM -->
                <td class="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                  {{ attempt.net_wpm.toFixed(2) }}
                </td>

                <!-- Accuracy -->
                <td class="whitespace-nowrap px-6 py-4">
                  <span
                    class="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700"
                  >
                    {{ attempt.accuracy.toFixed(2) }}%
                  </span>
                </td>

                <!-- Errors -->
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ attempt.full_mistakes }}
                    full
                  </div>

                  <div class="mt-1 text-xs text-gray-500">
                    {{ attempt.half_mistakes }} half
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>