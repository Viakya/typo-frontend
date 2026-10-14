<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

interface Exam {
  id: number
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

const router = useRouter()

const exams = ref<Exam[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')

const showForm = ref(false)
const editingExam = ref<Exam | null>(null)

const form = ref({
  name: '',
  description: '',
})

async function loadExams() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get<Exam[]>(
      '/admin/exams'
    )

    exams.value = response.data
  } catch (err) {
    console.error(err)
    error.value = 'Unable to load exams.'
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  editingExam.value = null

  form.value = {
    name: '',
    description: '',
  }

  showForm.value = true
}

function openEditForm(exam: Exam) {
  editingExam.value = exam

  form.value = {
    name: exam.name,
    description: exam.description || '',
  }

  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingExam.value = null
}

async function saveExam() {
  const name = form.value.name.trim()

  if (!name) {
    error.value = 'Exam name is required.'
    return
  }

  saving.value = true
  error.value = ''

  try {
    if (editingExam.value) {
      await api.put(
        `/admin/exams/${editingExam.value.id}`,
        {
          name,
          description:
            form.value.description.trim() || null,
        }
      )
    } else {
      await api.post(
        '/admin/exams',
        {
          name,
          description:
            form.value.description.trim() || null,
        }
      )
    }

    closeForm()
    await loadExams()
  } catch (err: any) {
    console.error(err)

    error.value =
      err?.response?.data?.error ||
      'Unable to save exam.'
  } finally {
    saving.value = false
  }
}

async function toggleExam(exam: Exam) {
  error.value = ''

  try {
    await api.patch(
      `/admin/exams/${exam.id}/status`,
      {
        is_active: !exam.is_active,
      }
    )

    await loadExams()
  } catch (err: any) {
    console.error(err)

    error.value =
      err?.response?.data?.error ||
      'Unable to update exam status.'
  }
}

onMounted(loadExams)
</script>

<template>
  <main
    class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
  >
    <div
      class="mb-8 flex items-center justify-between"
    >
      <div>
        <button
          type="button"
          class="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
          @click="router.push('/admin')"
        >
          ← Admin Dashboard
        </button>

        <h1
          class="text-2xl font-bold text-slate-900"
        >
          Exams
        </h1>

        <p
          class="mt-1 text-sm text-slate-500"
        >
          Create and manage typing exam categories.
        </p>
      </div>

      <button
        type="button"
        class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        @click="openCreateForm"
      >
        + Add Exam
      </button>
    </div>

    <div
      v-if="error"
      class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <!-- Create/Edit form -->
    <div
      v-if="showForm"
      class="mb-6 rounded-xl border border-slate-200 bg-white p-6"
    >
      <h2
        class="text-lg font-semibold text-slate-900"
      >
        {{
          editingExam
            ? 'Edit Exam'
            : 'Create Exam'
        }}
      </h2>

      <div class="mt-5 space-y-4">
        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700"
          >
            Exam Name
          </label>

          <input
            v-model="form.name"
            type="text"
            placeholder="e.g. SSC"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700"
          >
            Description
          </label>

          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Optional description"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          ></textarea>
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            :disabled="saving"
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            @click="saveExam"
          >
            {{
              saving
                ? 'Saving...'
                : editingExam
                  ? 'Save Changes'
                  : 'Create Exam'
            }}
          </button>

          <button
            type="button"
            :disabled="saving"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            @click="closeForm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500"
    >
      Loading exams...
    </div>

    <!-- Exams table -->
    <div
      v-else
      class="overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <div
        v-if="exams.length === 0"
        class="p-8 text-center text-sm text-slate-500"
      >
        No exams found.
      </div>

      <table
        v-else
        class="w-full"
      >
        <thead
          class="border-b border-slate-200 bg-slate-50"
        >
          <tr>
            <th
              class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Exam
            </th>

            <th
              class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Description
            </th>

            <th
              class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Status
            </th>

            <th
              class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody
          class="divide-y divide-slate-100"
        >
          <tr
            v-for="exam in exams"
            :key="exam.id"
            class="hover:bg-slate-50"
          >
            <td
              class="px-5 py-4 text-sm font-medium text-slate-900"
            >
              {{ exam.name }}
            </td>

            <td
              class="max-w-md px-5 py-4 text-sm text-slate-500"
            >
              {{ exam.description || 'No description' }}
            </td>

            <td class="px-5 py-4">
              <span
                class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                :class="
                  exam.is_active
                    ? 'bg-green-50 text-green-700'
                    : 'bg-slate-100 text-slate-500'
                "
              >
                {{
                  exam.is_active
                    ? 'Active'
                    : 'Inactive'
                }}
              </span>
            </td>

            <td
              class="px-5 py-4"
            >
              <div
                class="flex justify-end gap-2"
              >
                <button
                  type="button"
                  class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  @click="openEditForm(exam)"
                >
                  Edit
                </button>

                <button
                  type="button"
                  class="rounded-lg border px-3 py-1.5 text-sm font-medium"
                  :class="
                    exam.is_active
                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                      : 'border-green-200 text-green-600 hover:bg-green-50'
                  "
                  @click="toggleExam(exam)"
                >
                  {{
                    exam.is_active
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
  </main>
</template>