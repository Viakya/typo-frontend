<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

interface TestInfo {
  id: number
  title: string
  test_number: number
  duration_seconds: number
}

interface Attempt {
  id: number
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

interface TestHistoryResponse {
  test: TestInfo
  attempts: Attempt[]
}

const route = useRoute()
const router = useRouter()

const testId = Number(route.params.testId)

const test = ref<TestInfo | null>(null)
const attempts = ref<Attempt[]>([])

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const response =
      await api.get<TestHistoryResponse>(
        `/tests/${testId}/history`
      )

    test.value = response.data.test
    attempts.value = response.data.attempts
  } catch (err) {
    error.value =
      'Failed to load test history.'

    console.error(err)
  } finally {
    loading.value = false
  }
})

function openResult(attemptId: number) {
  router.push(`/result/${attemptId}`)
}

function startTest() {
  router.push(`/test/${testId}`)
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(
    undefined,
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  )
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(
    seconds / 60
  )

  const remainingSeconds =
    seconds % 60

  if (minutes === 0) {
    return `${remainingSeconds}s`
  }

  if (remainingSeconds === 0) {
    return `${minutes} min`
  }

  return `${minutes}m ${remainingSeconds}s`
}
</script>

<template>
  <main
    class="min-h-[calc(100vh-65px)] bg-slate-100"
  >
    <div
      class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <!-- Header -->
      <section
        class="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <button
            type="button"
            class="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
            @click="router.push('/tests')"
          >
            ← Back to tests
          </button>

          <p
            class="text-sm font-semibold uppercase tracking-wide text-blue-600"
          >
            Test History
          </p>

          <h1
            v-if="test"
            class="mt-1 text-2xl font-bold tracking-tight text-slate-900"
          >
            {{ test.title }}
          </h1>

          <h1
            v-else
            class="mt-1 text-2xl font-bold tracking-tight text-slate-900"
          >
            Test History
          </h1>

          <p
            v-if="test"
            class="mt-1 text-sm text-slate-500"
          >
            Your previous attempts for this
            test.
          </p>
        </div>

        <button
          v-if="test"
          type="button"
          class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          @click="startTest"
        >
          Start Test
        </button>
      </section>

      <!-- Error -->
      <div
        v-if="error"
        class="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <!-- Loading -->
      <div
        v-else-if="loading"
        class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div
          v-for="n in 5"
          :key="n"
          class="border-b border-slate-100 px-5 py-5"
        >
          <div
            class="h-4 w-40 animate-pulse rounded bg-slate-200"
          ></div>

          <div
            class="mt-3 h-4 w-72 animate-pulse rounded bg-slate-100"
          ></div>
        </div>
      </div>

      <!-- Content -->
      <template v-else>
        <!-- Attempts -->
        <div
          v-if="attempts.length"
          class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <!-- Desktop Header -->
          <div
            class="hidden grid-cols-[1.5fr_100px_100px_100px_100px_130px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid"
          >
            <div>Date</div>

            <div>Gross WPM</div>

            <div>Net WPM</div>

            <div>Accuracy</div>

            <div>Mistakes</div>

            <div class="text-right">
              Result
            </div>
          </div>

          <!-- Rows -->
          <div
            v-for="attempt in attempts"
            :key="attempt.id"
            class="border-b border-slate-100 last:border-b-0"
          >
            <!-- Desktop -->
            <div
              class="hidden grid-cols-[1.5fr_100px_100px_100px_100px_130px] items-center gap-4 px-5 py-4 md:grid"
            >
              <div>
                <p
                  class="font-medium text-slate-900"
                >
                  {{
                    formatDate(
                      attempt.completed_at
                    )
                  }}
                </p>

                <p
                  class="mt-1 text-xs text-slate-500"
                >
                  Duration:
                  {{
                    formatDuration(
                      attempt.duration_seconds
                    )
                  }}
                </p>
              </div>

              <div
                class="font-semibold text-slate-900"
              >
                {{
                  attempt.gross_wpm.toFixed(2)
                }}
              </div>

              <div
                class="font-semibold text-blue-600"
              >
                {{
                  attempt.net_wpm.toFixed(2)
                }}
              </div>

              <div
                class="font-medium text-slate-700"
              >
                {{
                  attempt.accuracy.toFixed(1)
                }}%
              </div>

              <div>
                <span
                  class="rounded-md bg-slate-100 px-2 py-1 text-sm text-slate-700"
                >
                  {{
                    attempt.full_mistakes +
                    attempt.half_mistakes
                  }}
                </span>
              </div>

              <div class="text-right">
                <button
                  type="button"
                  class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  @click="
                    openResult(attempt.id)
                  "
                >
                  View Result
                </button>
              </div>
            </div>

            <!-- Mobile -->
            <div
              class="p-4 md:hidden"
            >
              <div
                class="flex items-start justify-between gap-4"
              >
                <div>
                  <p
                    class="font-medium text-slate-900"
                  >
                    {{
                      formatDate(
                        attempt.completed_at
                      )
                    }}
                  </p>

                  <p
                    class="mt-1 text-xs text-slate-500"
                  >
                    Duration:
                    {{
                      formatDuration(
                        attempt.duration_seconds
                      )
                    }}
                  </p>
                </div>

                <span
                  class="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700"
                >
                  {{
                    attempt.net_wpm.toFixed(2)
                  }}
                  WPM
                </span>
              </div>

              <div
                class="mt-4 grid grid-cols-3 gap-2"
              >
                <div
                  class="rounded-lg bg-slate-50 p-3 text-center"
                >
                  <p
                    class="text-xs text-slate-500"
                  >
                    Gross
                  </p>

                  <p
                    class="mt-1 font-semibold text-slate-800"
                  >
                    {{
                      attempt.gross_wpm.toFixed(
                        2
                      )
                    }}
                  </p>
                </div>

                <div
                  class="rounded-lg bg-slate-50 p-3 text-center"
                >
                  <p
                    class="text-xs text-slate-500"
                  >
                    Accuracy
                  </p>

                  <p
                    class="mt-1 font-semibold text-slate-800"
                  >
                    {{
                      attempt.accuracy.toFixed(
                        1
                      )
                    }}%
                  </p>
                </div>

                <div
                  class="rounded-lg bg-slate-50 p-3 text-center"
                >
                  <p
                    class="text-xs text-slate-500"
                  >
                    Mistakes
                  </p>

                  <p
                    class="mt-1 font-semibold text-slate-800"
                  >
                    {{
                      attempt.full_mistakes +
                      attempt.half_mistakes
                    }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                class="mt-4 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                @click="
                  openResult(attempt.id)
                "
              >
                View Result
              </button>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div
          v-else
          class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"
        >
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl"
          >
            ⌨
          </div>

          <h2
            class="mt-4 font-semibold text-slate-800"
          >
            No attempts yet
          </h2>

          <p
            class="mt-1 text-sm text-slate-500"
          >
            You haven't completed this test
            yet.
          </p>

          <button
            type="button"
            class="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            @click="startTest"
          >
            Start Test
          </button>
        </div>
      </template>
    </div>
  </main>
</template>