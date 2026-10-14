<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

interface AttemptError {
  position_start: number
  position_end: number
  error_type: string
  severity: string
  expected_text: string
  actual_text: string
}

interface Attempt {
  id: number
  test_id: number

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

  omission_errors: number
  substitution_errors: number
  addition_errors: number
  spelling_errors: number
  repetition_errors: number
  incomplete_word_errors: number

  spacing_errors: number
  capitalization_errors: number
  punctuation_errors: number
  transposition_errors: number
  paragraph_errors: number

  errors: AttemptError[]
  typed_text?: string
}

const route = useRoute()
const router = useRouter()

const attempt = ref<Attempt | null>(null)

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const attemptId = route.params.attemptId

    const response = await api.get<Attempt>(
      `/attempts/${attemptId}`
    )

    attempt.value = response.data
  } catch (err) {
    error.value = 'Failed to load the result.'
    console.error(err)
  } finally {
    loading.value = false
  }
})

function goToTests() {
  router.push('/tests')
}

function goToHistory() {
  router.push('/history')
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60

  if (minutes === 0) {
    return `${remaining} sec`
  }

  if (remaining === 0) {
    return `${minutes} min`
  }

  return `${minutes} min ${remaining} sec`
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function formatErrorType(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatSeverity(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <!-- Loading -->
    <div
      v-if="loading"
      class="flex min-h-screen items-center justify-center"
    >
      <p class="text-sm text-slate-500">
        Loading result...
      </p>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="flex min-h-screen items-center justify-center px-4"
    >
      <div
        class="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      >
        <h1
          class="text-xl font-semibold text-slate-900"
        >
          Unable to load result
        </h1>

        <p class="mt-3 text-sm text-red-600">
          {{ error }}
        </p>

        <button
          type="button"
          class="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          @click="goToTests"
        >
          Back to Tests
        </button>
      </div>
    </div>

    <!-- Result -->
    <main
      v-else-if="attempt"
      class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <!-- Header -->
      <section
        class="border-b border-slate-300 pb-5"
      >
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p
              class="text-sm font-semibold text-blue-600"
            >
              Typing Result
            </p>

            <h1
              class="mt-1 text-3xl font-bold text-slate-900"
            >
              Test Completed
            </h1>

            <div
              class="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500"
            >
              <span>
                Attempt #{{ attempt.id }}
              </span>

              <span>
                Completed:
                {{ formatDate(attempt.completed_at) }}
              </span>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              @click="goToHistory"
            >
              History
            </button>

            <button
              type="button"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              @click="goToTests"
            >
              Back to Tests
            </button>
          </div>
        </div>
      </section>

      <!-- Primary results -->
      <section
        class="mt-6 grid grid-cols-2 border-y border-slate-300 bg-white sm:grid-cols-4"
      >
        <div
          class="border-b border-r border-slate-300 px-5 py-5 sm:border-b-0"
        >
          <p class="text-sm text-slate-500">
            Gross WPM
          </p>

          <p
            class="mt-1 text-3xl font-bold tabular-nums text-slate-900"
          >
            {{ attempt.gross_wpm.toFixed(2) }}
          </p>
        </div>

        <div
          class="border-b border-slate-300 px-5 py-5 sm:border-b-0 sm:border-r"
        >
          <p class="text-sm text-slate-500">
            Net WPM
          </p>

          <p
            class="mt-1 text-3xl font-bold tabular-nums text-slate-900"
          >
            {{ attempt.net_wpm.toFixed(2) }}
          </p>
        </div>

        <div
          class="border-r border-slate-300 px-5 py-5"
        >
          <p class="text-sm text-slate-500">
            Accuracy
          </p>

          <p
            class="mt-1 text-3xl font-bold tabular-nums text-slate-900"
          >
            {{ attempt.accuracy.toFixed(2) }}%
          </p>
        </div>

        <div class="px-5 py-5">
          <p class="text-sm text-slate-500">
            Error
          </p>

          <p
            class="mt-1 text-3xl font-bold tabular-nums text-slate-900"
          >
            {{ attempt.error_percentage.toFixed(2) }}%
          </p>
        </div>
      </section>

      <!-- Test statistics -->
      <section class="mt-7">
        <div
          class="mb-3 flex items-center justify-between"
        >
          <h2
            class="text-xl font-semibold text-slate-900"
          >
            Test Statistics
          </h2>

          <span
            class="text-sm text-slate-500"
          >
            Attempt #{{ attempt.id }}
          </span>
        </div>

        <div
          class="overflow-hidden border-y border-slate-300 bg-white"
        >
          <div
            class="grid grid-cols-2 sm:grid-cols-3"
          >
            <div
              class="border-b border-r border-slate-200 px-5 py-4"
            >
              <p class="text-sm text-slate-500">
                Total Words Typed
              </p>

              <p
                class="mt-1 text-xl font-semibold tabular-nums text-slate-900"
              >
                {{ attempt.total_words }}
              </p>
            </div>

            <div
              class="border-b border-slate-200 px-5 py-4 sm:border-r"
            >
              <p class="text-sm text-slate-500">
                Actual Key Depressions
              </p>

              <p
                class="mt-1 text-xl font-semibold tabular-nums text-slate-900"
              >
                {{ attempt.actual_key_depressions }}
              </p>
            </div>

            <div
              class="border-b border-r border-slate-200 px-5 py-4 sm:border-r-0"
            >
              <p class="text-sm text-slate-500">
                Candidate Key Depressions
              </p>

              <p
                class="mt-1 text-xl font-semibold tabular-nums text-slate-900"
              >
                {{ attempt.candidate_key_depressions }}
              </p>
            </div>

            <div
              class="border-r border-slate-200 px-5 py-4"
            >
              <p class="text-sm text-slate-500">
                Duration
              </p>

              <p
                class="mt-1 text-xl font-semibold tabular-nums text-slate-900"
              >
                {{ formatDuration(attempt.duration_seconds) }}
              </p>
            </div>

            <div
              class="border-t border-slate-200 px-5 py-4 sm:border-r"
            >
              <p class="text-sm text-slate-500">
                Full Mistakes
              </p>

              <p
                class="mt-1 text-xl font-semibold tabular-nums text-slate-900"
              >
                {{ attempt.full_mistakes }}
              </p>
            </div>

            <div
              class="border-t border-slate-200 px-5 py-4"
            >
              <p class="text-sm text-slate-500">
                Half Mistakes
              </p>

              <p
                class="mt-1 text-xl font-semibold tabular-nums text-slate-900"
              >
                {{ attempt.half_mistakes }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Mistake breakdown -->
      <section class="mt-7">
        <h2
          class="mb-3 text-xl font-semibold text-slate-900"
        >
          Mistake Breakdown
        </h2>

        <div
          class="overflow-hidden border-y border-slate-300 bg-white"
        >
          <!-- Full mistakes -->
          <div>
            <div
              class="border-b border-slate-200 bg-slate-50 px-5 py-3"
            >
              <h3
                class="text-sm font-semibold uppercase tracking-wide text-slate-600"
              >
                Full Mistakes
              </h3>
            </div>

            <div
              class="grid grid-cols-2 sm:grid-cols-3"
            >
              <div
                class="border-b border-r border-slate-200 px-5 py-4"
              >
                <p class="text-sm text-slate-500">
                  Omission
                </p>

                <p
                  class="mt-1 text-xl font-semibold tabular-nums"
                >
                  {{ attempt.omission_errors }}
                </p>
              </div>

              <div
                class="border-b border-slate-200 px-5 py-4 sm:border-r"
              >
                <p class="text-sm text-slate-500">
                  Substitution
                </p>

                <p
                  class="mt-1 text-xl font-semibold tabular-nums"
                >
                  {{ attempt.substitution_errors }}
                </p>
              </div>

              <div
                class="border-b border-r border-slate-200 px-5 py-4 sm:border-r-0"
              >
                <p class="text-sm text-slate-500">
                  Addition
                </p>

                <p
                  class="mt-1 text-xl font-semibold tabular-nums"
                >
                  {{ attempt.addition_errors }}
                </p>
              </div>

              <div
                class="border-r border-slate-200 px-5 py-4"
              >
                <p class="text-sm text-slate-500">
                  Spelling
                </p>

                <p
                  class="mt-1 text-xl font-semibold tabular-nums"
                >
                  {{ attempt.spelling_errors }}
                </p>
              </div>

              <div
                class="border-t border-slate-200 px-5 py-4 sm:border-r"
              >
                <p class="text-sm text-slate-500">
                  Repetition
                </p>

                <p
                  class="mt-1 text-xl font-semibold tabular-nums"
                >
                  {{ attempt.repetition_errors }}
                </p>
              </div>

              <div
                class="border-t border-slate-200 px-5 py-4"
              >
                <p class="text-sm text-slate-500">
                  Incomplete Words
                </p>

                <p
                  class="mt-1 text-xl font-semibold tabular-nums"
                >
                  {{ attempt.incomplete_word_errors }}
                </p>
              </div>
            </div>
          </div>

          <!-- Half mistakes -->
          <div
            class="border-t border-slate-300"
          >
            <div
              class="border-b border-slate-200 bg-slate-50 px-5 py-3"
            >
              <h3
                class="text-sm font-semibold uppercase tracking-wide text-slate-600"
              >
                Half Mistakes
              </h3>
            </div>

            <div
              class="grid grid-cols-2 sm:grid-cols-3"
            >
              <div
                class="border-b border-r border-slate-200 px-5 py-4"
              >
                <p class="text-sm text-slate-500">
                  Spacing
                </p>

                <p
                  class="mt-1 text-xl font-semibold tabular-nums"
                >
                  {{ attempt.spacing_errors }}
                </p>
              </div>

              <div
                class="border-b border-slate-200 px-5 py-4 sm:border-r"
              >
                <p class="text-sm text-slate-500">
                  Capitalization
                </p>

                <p
                  class="mt-1 text-xl font-semibold tabular-nums"
                >
                  {{ attempt.capitalization_errors }}
                </p>
              </div>

              <div
                class="border-b border-r border-slate-200 px-5 py-4 sm:border-r-0"
              >
                <p class="text-sm text-slate-500">
                  Punctuation
                </p>

                <p
                  class="mt-1 text-xl font-semibold tabular-nums"
                >
                  {{ attempt.punctuation_errors }}
                </p>
              </div>

              <div
                class="border-r border-slate-200 px-5 py-4"
              >
                <p class="text-sm text-slate-500">
                  Transposition
                </p>

                <p
                  class="mt-1 text-xl font-semibold tabular-nums"
                >
                  {{ attempt.transposition_errors }}
                </p>
              </div>

              <div
                class="border-t border-slate-200 px-5 py-4 sm:border-r"
              >
                <p class="text-sm text-slate-500">
                  Paragraph
                </p>

                <p
                  class="mt-1 text-xl font-semibold tabular-nums"
                >
                  {{ attempt.paragraph_errors }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Detailed errors -->
      <section class="mt-7">
        <div
          class="mb-3 flex items-center justify-between"
        >
          <h2
            class="text-xl font-semibold text-slate-900"
          >
            Detailed Errors
          </h2>

          <span
            class="text-sm text-slate-500"
          >
            {{ attempt.errors.length }} detected
          </span>
        </div>

        <div
          v-if="attempt.errors.length > 0"
          class="overflow-hidden border-y border-slate-300 bg-white"
        >
          <div class="overflow-x-auto">
            <table
              class="w-full min-w-[760px] text-left text-sm"
            >
              <thead
                class="bg-slate-50 text-slate-600"
              >
                <tr>
                  <th
                    class="px-5 py-3 font-semibold"
                  >
                    Type
                  </th>

                  <th
                    class="px-5 py-3 font-semibold"
                  >
                    Severity
                  </th>

                  <th
                    class="px-5 py-3 font-semibold"
                  >
                    Expected
                  </th>

                  <th
                    class="px-5 py-3 font-semibold"
                  >
                    Typed
                  </th>

                  <th
                    class="px-5 py-3 font-semibold"
                  >
                    Position
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(item, index) in attempt.errors"
                  :key="index"
                  class="border-t border-slate-200"
                >
                  <td
                    class="px-5 py-4 font-medium text-slate-800"
                  >
                    {{ formatErrorType(item.error_type) }}
                  </td>

                  <td class="px-5 py-4">
                    <span
                      class="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      {{ formatSeverity(item.severity) }}
                    </span>
                  </td>

                  <td
                    class="px-5 py-4 font-mono text-slate-700"
                  >
                    <span
                      v-if="item.expected_text"
                      class="whitespace-pre-wrap"
                    >
                      {{ item.expected_text }}
                    </span>

                    <span
                      v-else
                      class="text-slate-400"
                    >
                      ∅
                    </span>
                  </td>

                  <td
                    class="px-5 py-4 font-mono text-slate-700"
                  >
                    <span
                      v-if="item.actual_text"
                      class="whitespace-pre-wrap"
                    >
                      {{ item.actual_text }}
                    </span>

                    <span
                      v-else
                      class="text-slate-400"
                    >
                      ∅
                    </span>
                  </td>

                  <td
                    class="px-5 py-4 tabular-nums text-slate-500"
                  >
                    {{ item.position_start }}
                    -
                    {{ item.position_end }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          v-else
          class="border-y border-slate-300 bg-white px-5 py-8 text-center"
        >
          <p
            class="font-medium text-slate-800"
          >
            No detailed errors detected
          </p>

          <p
            class="mt-1 text-sm text-slate-500"
          >
            The evaluator did not record any individual
            error positions for this attempt.
          </p>
        </div>
      </section>

      <!-- Bottom actions -->
      <div
        class="mt-8 flex flex-wrap gap-2 border-t border-slate-300 pt-5"
      >
        <button
          type="button"
          class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          @click="goToTests"
        >
          Take Another Test
        </button>

        <button
          type="button"
          class="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          @click="goToHistory"
        >
          View History
        </button>
      </div>
    </main>
  </div>
</template>