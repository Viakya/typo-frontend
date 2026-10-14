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
  exam_name: string
  name: string
  description: string | null
  language: string
  duration_seconds: number
  is_active: boolean
  created_at: string
  updated_at: string
}

const exams = ref<Exam[]>([])
const seriesList = ref<TestSeries[]>([])

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

const editingId = ref<number | null>(null)

const form = ref({
  exam_id: '',
  name: '',
  description: '',
  language: 'English',
  duration_seconds: 600,
})

function resetForm() {
  editingId.value = null

  form.value = {
    exam_id: '',
    name: '',
    description: '',
    language: 'English',
    duration_seconds: 600,
  }

  error.value = ''
  success.value = ''
}

async function loadExams() {
  const response = await api.get<Exam[]>('/exams')
  exams.value = response.data
}

async function loadSeries() {
  const response =
    await api.get<TestSeries[]>('/admin/test-series')

  seriesList.value = response.data
}

async function loadData() {
  loading.value = true
  error.value = ''

  try {
    await Promise.all([
      loadExams(),
      loadSeries(),
    ])
  } catch (err) {
    console.error(err)
    error.value = 'Unable to load test series.'
  } finally {
    loading.value = false
  }
}

function startEdit(series: TestSeries) {
  editingId.value = series.id

  form.value = {
    exam_id: String(series.exam_id),
    name: series.name,
    description: series.description || '',
    language: series.language,
    duration_seconds: series.duration_seconds,
  }

  error.value = ''
  success.value = ''

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

async function saveSeries() {
  error.value = ''
  success.value = ''

  if (!form.value.exam_id) {
    error.value = 'Please select an exam.'
    return
  }

  if (!form.value.name.trim()) {
    error.value = 'Series name is required.'
    return
  }

  if (!form.value.language.trim()) {
    error.value = 'Language is required.'
    return
  }

  if (form.value.duration_seconds <= 0) {
    error.value = 'Duration must be greater than zero.'
    return
  }

  saving.value = true

  const wasEditing = editingId.value !== null

  try {
    const payload = {
      exam_id: Number(form.value.exam_id),
      name: form.value.name.trim(),
      description:
        form.value.description.trim() || null,
      language: form.value.language.trim(),
      duration_seconds:
        Number(form.value.duration_seconds),
    }

    if (wasEditing) {
      await api.put(
        `/admin/test-series/${editingId.value}`,
        payload,
      )
    } else {
      await api.post('/admin/test-series', payload)
    }

    await loadSeries()

    resetForm()

    success.value = wasEditing
      ? 'Test series updated successfully.'
      : 'Test series created successfully.'
  } catch (err: any) {
    console.error(err)

    error.value =
      err?.response?.data?.error ||
      'Unable to save test series.'
  } finally {
    saving.value = false
  }
}

async function toggleStatus(series: TestSeries) {
  error.value = ''
  success.value = ''

  try {
    await api.patch(
      `/admin/test-series/${series.id}/status`,
      {
        is_active: !series.is_active,
      },
    )

    await loadSeries()

    success.value = series.is_active
      ? 'Test series deactivated.'
      : 'Test series activated.'
  } catch (err: any) {
    console.error(err)

    error.value =
      err?.response?.data?.error ||
      'Unable to update test series status.'
  }
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

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
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900">
        Test Series
      </h1>

      <p class="mt-1 text-sm text-slate-500">
        Create and manage test series for each exam.
      </p>
    </div>

    <div
      v-if="error"
      class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

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
            {{ editingId === null
              ? 'Add Test Series'
              : 'Edit Test Series' }}
          </h2>

          <p
            class="mt-1 text-sm text-slate-500"
          >
            Configure the series details.
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
        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700"
          >
            Exam
          </label>

          <select
            v-model="form.exam_id"
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

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700"
          >
            Series Name
          </label>

          <input
            v-model="form.name"
            type="text"
            placeholder="e.g. SSC CGL Practice Set"
            class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700"
          >
            Language
          </label>

          <input
            v-model="form.language"
            type="text"
            placeholder="English"
            class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700"
          >
            Duration (seconds)
          </label>

          <input
            v-model.number="form.duration_seconds"
            type="number"
            min="1"
            class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div class="md:col-span-2">
          <label
            class="mb-1 block text-sm font-medium text-slate-700"
          >
            Description
          </label>

          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Optional description"
            class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          ></textarea>
        </div>
      </div>

      <div class="mt-5 flex justify-end">
        <button
          type="button"
          :disabled="saving"
          class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          @click="saveSeries"
        >
          {{
            saving
              ? 'Saving...'
              : editingId === null
                ? 'Add Series'
                : 'Save Changes'
          }}
        </button>
      </div>
    </section>

    <!-- List -->
    <section
      class="overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <div
        class="border-b border-slate-200 px-6 py-4"
      >
        <h2
          class="text-lg font-semibold text-slate-900"
        >
          All Test Series
        </h2>
      </div>

      <div
        v-if="loading"
        class="p-8 text-center text-slate-500"
      >
        Loading test series...
      </div>

      <div
        v-else-if="seriesList.length === 0"
        class="p-8 text-center text-slate-500"
      >
        No test series found.
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
                Series
              </th>

              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Exam
              </th>

              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Language
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
              v-for="series in seriesList"
              :key="series.id"
              class="hover:bg-slate-50"
            >
              <td class="px-6 py-4">
                <p
                  class="font-medium text-slate-900"
                >
                  {{ series.name }}
                </p>

                <p
                  v-if="series.description"
                  class="mt-1 max-w-sm truncate text-sm text-slate-500"
                >
                  {{ series.description }}
                </p>
              </td>

              <td
                class="px-6 py-4 text-sm text-slate-600"
              >
                {{ series.exam_name }}
              </td>

              <td
                class="px-6 py-4 text-sm text-slate-600"
              >
                {{ series.language }}
              </td>

              <td
                class="px-6 py-4 text-sm text-slate-600"
              >
                {{ formatDuration(series.duration_seconds) }}
              </td>

              <td class="px-6 py-4">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="
                    series.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  "
                >
                  {{
                    series.is_active
                      ? 'Active'
                      : 'Inactive'
                  }}
                </span>
              </td>

              <td
                class="px-6 py-4 text-right"
              >
                <div
                  class="flex justify-end gap-2"
                >
                  <button
                    type="button"
                    class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    @click="startEdit(series)"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    class="rounded-lg border px-3 py-1.5 text-sm font-medium"
                    :class="
                      series.is_active
                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                        : 'border-green-200 text-green-600 hover:bg-green-50'
                    "
                    @click="toggleStatus(series)"
                  >
                    {{
                      series.is_active
                        ? 'Deactivate'
                        : 'Activate'
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