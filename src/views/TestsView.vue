<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

interface Exam {
  id: number
  name: string
  description: string | null
}

interface TestSeries {
  id: number
  name: string
  description: string | null
  language: string
  duration_seconds: number
}

interface TypingTest {
  id: number
  title: string
  test_number: number
  duration_seconds: number
}

interface TestRow {
  examId: number
  examName: string
  seriesId: number
  seriesName: string
  language: string
  testId: number
  testTitle: string
  testNumber: number
  durationSeconds: number
}

const router = useRouter()

const rows = ref<TestRow[]>([])

const loading = ref(true)
const error = ref('')

const currentPage = ref(1)
const pageSize = 10

const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(rows.value.length / pageSize)
  )
)

const paginatedRows = computed(() => {
  const start =
    (currentPage.value - 1) * pageSize

  return rows.value.slice(
    start,
    start + pageSize
  )
})

const pageNumbers = computed(() => {
  const pages: number[] = []

  for (
    let page = 1;
    page <= totalPages.value;
    page++
  ) {
    pages.push(page)
  }

  return pages
})

onMounted(async () => {
  await loadTests()
})

async function loadTests() {
  loading.value = true
  error.value = ''

  try {
    const examResponse =
      await api.get<Exam[]>('/exams')

    const exams = examResponse.data

    const flattenedRows: TestRow[] = []

    for (const exam of exams) {
      const seriesResponse =
        await api.get<TestSeries[]>(
          `/exams/${exam.id}/test-series`
        )

      for (const series of seriesResponse.data) {
        const testsResponse =
          await api.get<TypingTest[]>(
            `/test-series/${series.id}/tests`
          )

        for (const test of testsResponse.data) {
          flattenedRows.push({
            examId: exam.id,
            examName: exam.name,
            seriesId: series.id,
            seriesName: series.name,
            language: series.language,
            testId: test.id,
            testTitle: test.title,
            testNumber: test.test_number,
            durationSeconds:
              test.duration_seconds,
          })
        }
      }
    }

    rows.value = flattenedRows
  } catch (err) {
    error.value =
      'Failed to load typing tests.'

    console.error(err)
  } finally {
    loading.value = false
  }
}

function openTest(testId: number) {
  router.push(`/test/${testId}`)
}

function openTestHistory(testId: number) {
  router.push(`/test/${testId}/history`)
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    return remainingMinutes
      ? `${hours} hr ${remainingMinutes} min`
      : `${hours} hr`
  }

  return `${minutes} min`
}

function goToPage(page: number) {
  if (
    page < 1 ||
    page > totalPages.value
  ) {
    return
  }

  currentPage.value = page

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

function previousPage() {
  goToPage(currentPage.value - 1)
}

function nextPage() {
  goToPage(currentPage.value + 1)
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
      <section class="mb-7">
        <h1
          class="text-2xl font-bold tracking-tight text-slate-900"
        >
          Typing Tests
        </h1>

        <p
          class="mt-1 text-sm text-slate-500"
        >
          Choose a test and start your typing
          practice.
        </p>
      </section>

      <!-- Error -->
      <div
        v-if="error"
        class="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div
          class="border-b border-slate-200 px-5 py-4"
        >
          <div
            class="h-5 w-32 animate-pulse rounded bg-slate-200"
          ></div>
        </div>

        <div
          v-for="n in 6"
          :key="n"
          class="flex gap-6 border-b border-slate-100 px-5 py-5"
        >
          <div
            class="h-4 w-20 animate-pulse rounded bg-slate-100"
          ></div>

          <div
            class="h-4 w-32 animate-pulse rounded bg-slate-100"
          ></div>

          <div
            class="h-4 w-48 animate-pulse rounded bg-slate-100"
          ></div>
        </div>
      </div>

      <!-- Content -->
      <template v-else>
        <!-- Test Table -->
        <div
          v-if="rows.length"
          class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <!-- Desktop Header -->
          <div
            class="hidden grid-cols-[1fr_1.4fr_2fr_100px_170px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid"
          >
            <div>Exam</div>

            <div>Test Series</div>

            <div>Test</div>

            <div>Duration</div>

            <div class="text-right">
              Actions
            </div>
          </div>

          <!-- Rows -->
          <div
            v-for="row in paginatedRows"
            :key="row.testId"
            class="border-b border-slate-100 last:border-b-0"
          >
            <!-- Desktop -->
            <div
              class="hidden grid-cols-[1fr_1.4fr_2fr_100px_170px] items-center gap-4 px-5 py-4 md:grid"
            >
              <!-- Exam -->
              <div>
                <p
                  class="font-semibold text-slate-900"
                >
                  {{ row.examName }}
                </p>
              </div>

              <!-- Series -->
              <div>
                <p
                  class="text-sm text-slate-700"
                >
                  {{ row.seriesName }}
                </p>

                <span
                  class="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase text-slate-500"
                >
                  {{ row.language }}
                </span>
              </div>

              <!-- Test -->
              <div>
                <p
                  class="font-medium text-slate-900"
                >
                  {{ row.testTitle }}
                </p>

                <p
                  class="mt-0.5 text-xs text-slate-500"
                >
                  Test {{ row.testNumber }}
                </p>
              </div>

              <!-- Duration -->
              <div
                class="text-sm text-slate-600"
              >
                {{
                  formatDuration(
                    row.durationSeconds
                  )
                }}
              </div>

              <!-- Actions -->
              <div
                class="flex items-center justify-end gap-2"
              >
                <button
                  type="button"
                  class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  @click="
                    openTestHistory(row.testId)
                  "
                >
                  History
                </button>

                <button
                  type="button"
                  class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  @click="
                    openTest(row.testId)
                  "
                >
                  Start
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
                    class="text-xs font-semibold uppercase tracking-wide text-blue-600"
                  >
                    {{ row.examName }}
                  </p>

                  <p
                    class="mt-1 text-sm font-medium text-slate-500"
                  >
                    {{ row.seriesName }}
                  </p>

                  <h3
                    class="mt-2 font-semibold text-slate-900"
                  >
                    {{ row.testTitle }}
                  </h3>
                </div>

                <span
                  class="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                >
                  {{
                    formatDuration(
                      row.durationSeconds
                    )
                  }}
                </span>
              </div>

              <div
                class="mt-4 grid grid-cols-2 gap-2"
              >
                <button
                  type="button"
                  class="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  @click="
                    openTestHistory(row.testId)
                  "
                >
                  History
                </button>

                <button
                  type="button"
                  class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  @click="
                    openTest(row.testId)
                  "
                >
                  Start Test
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div
          v-else
          class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"
        >
          <h2
            class="font-semibold text-slate-800"
          >
            No typing tests available
          </h2>

          <p
            class="mt-1 text-sm text-slate-500"
          >
            There are currently no published
            tests.
          </p>
        </div>

        <!-- Pagination -->
        <div
          v-if="rows.length > pageSize"
          class="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <p
            class="text-sm text-slate-500"
          >
            Showing
            <span
              class="font-medium text-slate-700"
            >
              {{
                (currentPage - 1) * pageSize + 1
              }}
            </span>
            -
            <span
              class="font-medium text-slate-700"
            >
              {{
                Math.min(
                  currentPage * pageSize,
                  rows.length
                )
              }}
            </span>
            of
            <span
              class="font-medium text-slate-700"
            >
              {{ rows.length }}
            </span>
            tests
          </p>

          <div
            class="flex items-center gap-1"
          >
            <button
              type="button"
              :disabled="currentPage === 1"
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              @click="previousPage"
            >
              ← Previous
            </button>

            <button
              v-for="page in pageNumbers"
              :key="page"
              type="button"
              class="h-9 min-w-9 rounded-lg px-3 text-sm font-medium"
              :class="
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-white'
              "
              @click="goToPage(page)"
            >
              {{ page }}
            </button>

            <button
              type="button"
              :disabled="
                currentPage === totalPages
              "
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              @click="nextPage"
            >
              Next →
            </button>
          </div>
        </div>
      </template>
    </div>
  </main>
</template>