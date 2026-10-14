<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../services/api'

interface Exam {
  id: number
  name: string
}

interface TestSeries {
  id: number
  exam_id: number
  name: string
  language: string
  duration_seconds: number
  is_active: boolean
}

interface Passage {
  id: number
  title: string
  language: string
  word_count: number
  character_count: number
  is_active: boolean
}

interface Test {
  id: number
  test_series_id: number
  series_name: string
  exam_id: number
  exam_name: string
  passage_id: number
  passage_title: string
  title: string
  test_number: number
  duration_seconds: number
  is_published: boolean
  created_at: string
  updated_at: string
}

const exams = ref<Exam[]>([])
const seriesList = ref<TestSeries[]>([])
const passages = ref<Passage[]>([])
const tests = ref<Test[]>([])

const filteredSeries = ref<TestSeries[]>([])
const filteredPassages = ref<Passage[]>([])

const loading = ref(true)
const saving = ref(false)

const error = ref('')
const success = ref('')

const editingId = ref<number | null>(null)

const form = ref({
  exam_id: '',
  test_series_id: '',
  passage_id: '',
  title: '',
  test_number: 1,
  duration_seconds: 600,
})


async function loadExams() {
  const response =
    await api.get<Exam[]>('/exams')

  exams.value = response.data
}


async function loadSeries() {
  const response =
    await api.get<TestSeries[]>(
      '/admin/test-series',
    )

  seriesList.value = response.data
}


async function loadPassages() {
  const response =
    await api.get<Passage[]>(
      '/admin/passages',
    )

  passages.value = response.data
}


async function loadTests() {
  const response =
    await api.get<Test[]>('/admin/tests')

  tests.value = response.data
}


async function loadData() {
  loading.value = true
  error.value = ''

  try {
    await Promise.all([
      loadExams(),
      loadSeries(),
      loadPassages(),
      loadTests(),
    ])
  } catch (err) {
    console.error(err)
    error.value =
      'Unable to load test management data.'
  } finally {
    loading.value = false
  }
}


function updateSeriesForExam(
  clearSelection = true,
) {
  if (!form.value.exam_id) {
    filteredSeries.value = []
    filteredPassages.value = []

    if (clearSelection) {
      form.value.test_series_id = ''
      form.value.passage_id = ''
    }

    return
  }

  filteredSeries.value =
    seriesList.value.filter(
      (series) =>
        series.exam_id ===
        Number(form.value.exam_id),
    )

  if (clearSelection) {
    form.value.test_series_id = ''
    form.value.passage_id = ''
    filteredPassages.value = []
  }
}


function updatePassagesForSeries(
  clearSelection = true,
) {
  if (!form.value.test_series_id) {
    filteredPassages.value = []

    if (clearSelection) {
      form.value.passage_id = ''
    }

    return
  }

  /*
   * A test can use any active passage.
   * We deliberately do not filter passages by language.
   */
  filteredPassages.value =
    passages.value.filter(
      (passage) => passage.is_active,
    )

  if (clearSelection) {
    form.value.passage_id = ''
  }
}


function resetForm() {
  editingId.value = null

  form.value = {
    exam_id: '',
    test_series_id: '',
    passage_id: '',
    title: '',
    test_number: 1,
    duration_seconds: 600,
  }

  filteredSeries.value = []
  filteredPassages.value = []

  error.value = ''
}


function startEdit(test: Test) {
  editingId.value = test.id

  /*
   * Set all form values first.
   * We then calculate the dependent dropdowns
   * without clearing the selected values.
   */
  form.value = {
    exam_id: String(test.exam_id),
    test_series_id: String(
      test.test_series_id,
    ),
    passage_id: String(test.passage_id),
    title: test.title,
    test_number: test.test_number,
    duration_seconds:
      test.duration_seconds,
  }

  updateSeriesForExam(false)
  updatePassagesForSeries(false)

  error.value = ''
  success.value = ''

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}


async function saveTest() {
  error.value = ''
  success.value = ''

  if (!form.value.exam_id) {
    error.value = 'Please select an exam.'
    return
  }

  if (!form.value.test_series_id) {
    error.value =
      'Please select a test series.'
    return
  }

  if (!form.value.passage_id) {
    error.value = 'Please select a passage.'
    return
  }

  if (!form.value.title.trim()) {
    error.value = 'Test title is required.'
    return
  }

  if (form.value.test_number <= 0) {
    error.value =
      'Test number must be greater than zero.'
    return
  }

  if (form.value.duration_seconds <= 0) {
    error.value =
      'Duration must be greater than zero.'
    return
  }

  saving.value = true

  const wasEditing =
    editingId.value !== null

  try {
    const payload = {
      test_series_id:
        Number(form.value.test_series_id),

      passage_id:
        Number(form.value.passage_id),

      title:
        form.value.title.trim(),

      test_number:
        Number(form.value.test_number),

      duration_seconds:
        Number(form.value.duration_seconds),
    }

    if (wasEditing) {
      await api.put(
        `/admin/tests/${editingId.value}`,
        payload,
      )
    } else {
      await api.post(
        '/admin/tests',
        payload,
      )
    }

    await loadTests()

    resetForm()

    success.value = wasEditing
      ? 'Test updated successfully.'
      : 'Test created successfully.'
  } catch (err: any) {
    console.error(err)

    error.value =
      err?.response?.data?.error ||
      'Unable to save test.'
  } finally {
    saving.value = false
  }
}


async function togglePublish(
  test: Test,
) {
  error.value = ''
  success.value = ''

  try {
    await api.patch(
      `/admin/tests/${test.id}/publish`,
      {
        is_published:
          !test.is_published,
      },
    )

    await loadTests()

    success.value = test.is_published
      ? 'Test unpublished.'
      : 'Test published.'
  } catch (err: any) {
    console.error(err)

    error.value =
      err?.response?.data?.error ||
      'Unable to update test status.'
  }
}


function formatDuration(
  seconds: number,
) {
  const minutes = Math.floor(
    seconds / 60,
  )

  const remainingSeconds =
    seconds % 60

  if (remainingSeconds === 0) {
    return `${minutes} min`
  }

  return `${minutes} min ${remainingSeconds} sec`
}


onMounted(loadData)
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
        Tests
      </h1>

      <p
        class="mt-1 text-sm text-slate-500"
      >
        Create, edit and publish typing tests.
      </p>
    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <!-- Success -->
    <div
      v-if="success"
      class="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
    >
      {{ success }}
    </div>

    <!-- Form -->
    <section
      class="mb-8 rounded-xl border border-slate-200 bg-white p-6"
    >
      <div
        class="mb-5 flex items-center justify-between"
      >
        <div>
          <h2
            class="text-lg font-semibold text-slate-900"
          >
            {{
              editingId === null
                ? 'Add Test'
                : 'Edit Test'
            }}
          </h2>

          <p
            class="mt-1 text-sm text-slate-500"
          >
            Connect a test series with a
            typing passage.
          </p>
        </div>

        <button
          v-if="editingId !== null"
          type="button"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          @click="resetForm"
        >
          Cancel Edit
        </button>
      </div>

      <div
        class="grid grid-cols-1 gap-5 md:grid-cols-2"
      >
        <!-- Exam -->
        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700"
          >
            Exam
          </label>

          <select
            v-model="form.exam_id"
            @change="
              updateSeriesForExam()
            "
            class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              Select an exam
            </option>

            <option
              v-for="exam in exams"
              :key="exam.id"
              :value="exam.id"
            >
              {{ exam.name }}
            </option>
          </select>
        </div>

        <!-- Series -->
        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700"
          >
            Test Series
          </label>

          <select
            v-model="form.test_series_id"
            @change="
              updatePassagesForSeries()
            "
            :disabled="!form.exam_id"
            class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {{
                form.exam_id
                  ? 'Select a test series'
                  : 'Select an exam first'
              }}
            </option>

            <option
              v-for="series in filteredSeries"
              :key="series.id"
              :value="series.id"
            >
              {{ series.name }}
            </option>
          </select>
        </div>

        <!-- Passage -->
        <div class="md:col-span-2">
          <label
            class="mb-1 block text-sm font-medium text-slate-700"
          >
            Passage
          </label>

          <select
            v-model="form.passage_id"
            :disabled="
              !form.test_series_id
            "
            class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {{
                form.test_series_id
                  ? 'Select a passage'
                  : 'Select a test series first'
              }}
            </option>

            <option
              v-for="passage in filteredPassages"
              :key="passage.id"
              :value="passage.id"
            >
              {{ passage.title }}
              ({{ passage.word_count }} words)
            </option>
          </select>

          <p
            v-if="
              form.test_series_id &&
              filteredPassages.length === 0
            "
            class="mt-2 text-xs text-amber-600"
          >
            No active passages available.
          </p>
        </div>

        <!-- Title -->
        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700"
          >
            Test Title
          </label>

          <input
            v-model="form.title"
            type="text"
            placeholder="e.g. Practice Test 1"
            class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <!-- Test Number -->
        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700"
          >
            Test Number
          </label>

          <input
            v-model.number="
              form.test_number
            "
            type="number"
            min="1"
            class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <!-- Duration -->
        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700"
          >
            Duration (seconds)
          </label>

          <input
            v-model.number="
              form.duration_seconds
            "
            type="number"
            min="1"
            class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <!-- Save -->
      <div class="mt-5 flex justify-end">
        <button
          type="button"
          :disabled="saving"
          class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          @click="saveTest"
        >
          {{
            saving
              ? 'Saving...'
              : editingId === null
                ? 'Add Test'
                : 'Save Changes'
          }}
        </button>
      </div>
    </section>

    <!-- Tests -->
    <section
      class="overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <div
        class="border-b border-slate-200 px-6 py-4"
      >
        <h2
          class="text-lg font-semibold text-slate-900"
        >
          All Tests
        </h2>
      </div>

      <div
        v-if="loading"
        class="p-8 text-center text-slate-500"
      >
        Loading tests...
      </div>

      <div
        v-else-if="tests.length === 0"
        class="p-8 text-center text-slate-500"
      >
        No tests found.
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="min-w-full">
          <thead
            class="border-b border-slate-200 bg-slate-50"
          >
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Test
              </th>

              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Exam / Series
              </th>

              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Passage
              </th>

              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Duration
              </th>

              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Status
              </th>

              <th
                class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody
            class="divide-y divide-slate-100"
          >
            <tr
              v-for="test in tests"
              :key="test.id"
              class="hover:bg-slate-50"
            >
              <!-- Test -->
              <td class="px-6 py-4">
                <p
                  class="font-medium text-slate-900"
                >
                  #{{ test.test_number }}
                  {{ test.title }}
                </p>
              </td>

              <!-- Exam / Series -->
              <td class="px-6 py-4">
                <p
                  class="text-sm font-medium text-slate-700"
                >
                  {{ test.exam_name }}
                </p>

                <p
                  class="mt-1 text-xs text-slate-500"
                >
                  {{ test.series_name }}
                </p>
              </td>

              <!-- Passage -->
              <td
                class="px-6 py-4 text-sm text-slate-600"
              >
                {{ test.passage_title }}
              </td>

              <!-- Duration -->
              <td
                class="px-6 py-4 text-sm text-slate-600"
              >
                {{
                  formatDuration(
                    test.duration_seconds,
                  )
                }}
              </td>

              <!-- Status -->
              <td class="px-6 py-4">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="
                    test.is_published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  "
                >
                  {{
                    test.is_published
                      ? 'Published'
                      : 'Draft'
                  }}
                </span>
              </td>

              <!-- Actions -->
              <td
                class="px-6 py-4 text-right"
              >
                <div
                  class="flex justify-end gap-2"
                >
                  <button
                    type="button"
                    class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    @click="
                      startEdit(test)
                    "
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    class="rounded-lg border px-3 py-1.5 text-sm font-medium"
                    :class="
                      test.is_published
                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                        : 'border-green-200 text-green-600 hover:bg-green-50'
                    "
                    @click="
                      togglePublish(test)
                    "
                  >
                    {{
                      test.is_published
                        ? 'Unpublish'
                        : 'Publish'
                    }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>