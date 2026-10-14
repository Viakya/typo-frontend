<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../services/api'

interface Passage {
  id: number
  title: string
  content: string
  language: string
  word_count: number
  character_count: number
  source: string | null
  is_active: boolean
  created_at: string
}

const passages = ref<Passage[]>([])

const loading = ref(true)
const saving = ref(false)

const error = ref('')
const success = ref('')

const editingId = ref<number | null>(null)

const form = ref({
  title: '',
  content: '',
  language: 'English',
  source: '',
})

function resetForm() {
  editingId.value = null

  form.value = {
    title: '',
    content: '',
    language: 'English',
    source: '',
  }

  error.value = ''
}

async function loadPassages() {
  loading.value = true
  error.value = ''

  try {
    const response =
      await api.get<Passage[]>('/admin/passages')

    passages.value = response.data
  } catch (err) {
    console.error(err)
    error.value = 'Unable to load passages.'
  } finally {
    loading.value = false
  }
}

function startEdit(passage: Passage) {
  editingId.value = passage.id

  form.value = {
    title: passage.title,
    content: passage.content,
    language: passage.language,
    source: passage.source || '',
  }

  error.value = ''
  success.value = ''

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

async function savePassage() {
  error.value = ''
  success.value = ''

  if (!form.value.title.trim()) {
    error.value = 'Passage title is required.'
    return
  }

  if (!form.value.content.trim()) {
    error.value = 'Passage content is required.'
    return
  }

  if (!form.value.language.trim()) {
    error.value = 'Language is required.'
    return
  }

  saving.value = true

  const wasEditing = editingId.value !== null

  try {
    const payload = {
      title: form.value.title.trim(),
      content: form.value.content,
      language: form.value.language.trim(),
      source: form.value.source.trim() || null,
    }

    if (wasEditing) {
      await api.put(
        `/admin/passages/${editingId.value}`,
        payload,
      )
    } else {
      await api.post(
        '/admin/passages',
        payload,
      )
    }

    await loadPassages()

    resetForm()

    success.value = wasEditing
      ? 'Passage updated successfully.'
      : 'Passage created successfully.'
  } catch (err: any) {
    console.error(err)

    error.value =
      err?.response?.data?.error ||
      'Unable to save passage.'
  } finally {
    saving.value = false
  }
}

async function toggleStatus(passage: Passage) {
  error.value = ''
  success.value = ''

  try {
    await api.patch(
      `/admin/passages/${passage.id}/status`,
      {
        is_active: !passage.is_active,
      },
    )

    await loadPassages()

    success.value = passage.is_active
      ? 'Passage deactivated.'
      : 'Passage activated.'
  } catch (err: any) {
    console.error(err)

    error.value =
      err?.response?.data?.error ||
      'Unable to update passage status.'
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    undefined,
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  )
}

onMounted(loadPassages)
</script>

<template>
  <main
    class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
  >
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900">
        Passages
      </h1>

      <p class="mt-1 text-sm text-slate-500">
        Create and manage typing passages.
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
                ? 'Add Passage'
                : 'Edit Passage'
            }}
          </h2>

          <p
            class="mt-1 text-sm text-slate-500"
          >
            Add the passage text used for typing tests.
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
        <!-- Title -->
        <div>
          <label
            class="mb-1 block text-sm font-medium text-slate-700"
          >
            Title
          </label>

          <input
            v-model="form.title"
            type="text"
            placeholder="e.g. General English Passage 1"
            class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <!-- Language -->
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

        <!-- Source -->
        <div class="md:col-span-2">
          <label
            class="mb-1 block text-sm font-medium text-slate-700"
          >
            Source
            <span
              class="font-normal text-slate-400"
            >
              (optional)
            </span>
          </label>

          <input
            v-model="form.source"
            type="text"
            placeholder="e.g. SSC CGL 2025"
            class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <!-- Content -->
        <div class="md:col-span-2">
          <label
            class="mb-1 block text-sm font-medium text-slate-700"
          >
            Passage Content
          </label>

          <textarea
            v-model="form.content"
            rows="12"
            placeholder="Enter the complete typing passage here..."
            class="w-full resize-y rounded-lg border border-slate-300 px-3 py-3 text-sm leading-7 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          ></textarea>

          <p class="mt-2 text-xs text-slate-500">
            Word and character counts are calculated
            automatically when the passage is saved.
          </p>
        </div>
      </div>

      <!-- Preview counts -->
      <div
        class="mt-5 flex flex-wrap gap-3"
      >
        <div
          class="rounded-lg bg-slate-50 px-4 py-2"
        >
          <span class="text-xs text-slate-500">
            Characters
          </span>

          <span
            class="ml-2 text-sm font-semibold text-slate-900"
          >
            {{ form.content.length }}
          </span>
        </div>

        <div
          class="rounded-lg bg-slate-50 px-4 py-2"
        >
          <span class="text-xs text-slate-500">
            Words
          </span>

          <span
            class="ml-2 text-sm font-semibold text-slate-900"
          >
            {{
              form.content.trim()
                ? form.content.trim().split(/\s+/).length
                : 0
            }}
          </span>
        </div>
      </div>

      <div class="mt-5 flex justify-end">
        <button
          type="button"
          :disabled="saving"
          class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          @click="savePassage"
        >
          {{
            saving
              ? 'Saving...'
              : editingId === null
                ? 'Add Passage'
                : 'Save Changes'
          }}
        </button>
      </div>
    </section>

    <!-- Passage List -->
    <section
      class="overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <div
        class="border-b border-slate-200 px-6 py-4"
      >
        <h2
          class="text-lg font-semibold text-slate-900"
        >
          All Passages
        </h2>
      </div>

      <div
        v-if="loading"
        class="p-8 text-center text-slate-500"
      >
        Loading passages...
      </div>

      <div
        v-else-if="passages.length === 0"
        class="p-8 text-center text-slate-500"
      >
        No passages found.
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
                Passage
              </th>

              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Language
              </th>

              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Size
              </th>

              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Status
              </th>

              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Created
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
              v-for="passage in passages"
              :key="passage.id"
              class="hover:bg-slate-50"
            >
              <!-- Passage -->
              <td class="px-6 py-4">
                <p
                  class="font-medium text-slate-900"
                >
                  {{ passage.title }}
                </p>

                <p
                  v-if="passage.source"
                  class="mt-1 text-xs text-slate-500"
                >
                  Source: {{ passage.source }}
                </p>

                <p
                  class="mt-1 max-w-md truncate text-sm text-slate-500"
                >
                  {{ passage.content }}
                </p>
              </td>

              <!-- Language -->
              <td
                class="px-6 py-4 text-sm text-slate-600"
              >
                {{ passage.language }}
              </td>

              <!-- Size -->
              <td class="px-6 py-4">
                <p
                  class="text-sm font-medium text-slate-700"
                >
                  {{ passage.word_count }} words
                </p>

                <p
                  class="mt-1 text-xs text-slate-500"
                >
                  {{ passage.character_count }}
                  characters
                </p>
              </td>

              <!-- Status -->
              <td class="px-6 py-4">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="
                    passage.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  "
                >
                  {{
                    passage.is_active
                      ? 'Active'
                      : 'Inactive'
                  }}
                </span>
              </td>

              <!-- Created -->
              <td
                class="px-6 py-4 text-sm text-slate-500"
              >
                {{ formatDate(passage.created_at) }}
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
                    @click="startEdit(passage)"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    class="rounded-lg border px-3 py-1.5 text-sm font-medium"
                    :class="
                      passage.is_active
                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                        : 'border-green-200 text-green-600 hover:bg-green-50'
                    "
                    @click="toggleStatus(passage)"
                  >
                    {{
                      passage.is_active
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