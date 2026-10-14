<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../services/api'

interface User {
  id: number
  email: string
  name: string
  profile_picture_url: string | null
  role: 'USER' | 'ADMIN'
  created_at: string
  last_login_at: string | null
}

const users = ref<User[]>([])
const loading = ref(true)
const error = ref('')
const updatingUserId = ref<number | null>(null)

async function loadUsers() {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get<User[]>('/admin/users')
    users.value = response.data
  } catch (err: any) {
    error.value =
      err.response?.data?.error ||
      'Failed to load users.'
  } finally {
    loading.value = false
  }
}

async function changeRole(user: User) {
  const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'

  const confirmed = window.confirm(
    `Change ${user.name}'s role to ${newRole}?`
  )

  if (!confirmed) {
    return
  }

  updatingUserId.value = user.id
  error.value = ''

  try {
    const response = await api.patch<User>(
      `/admin/users/${user.id}/role`,
      {
        role: newRole,
      }
    )

    const index = users.value.findIndex(
      (item) => item.id === user.id
    )

    if (index !== -1) {
      users.value[index] = response.data
    }
  } catch (err: any) {
    error.value =
      err.response?.data?.error ||
      'Failed to update user role.'
  } finally {
    updatingUserId.value = null
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Never'
  }

  return new Date(value).toLocaleString()
}

onMounted(loadUsers)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-7xl px-6 py-8">

      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Users
          </h1>

          <p class="mt-1 text-sm text-gray-500">
            Manage user accounts and administrator roles.
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
        Loading users...
      </div>

      <!-- Users -->
      <div
        v-else
        class="overflow-hidden rounded-xl border border-gray-200 bg-white"
      >
        <div class="border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-semibold text-gray-900">
                All Users
              </h2>

              <p class="mt-1 text-sm text-gray-500">
                {{ users.length }} user{{ users.length === 1 ? '' : 's' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div
          v-if="users.length === 0"
          class="px-6 py-12 text-center text-sm text-gray-500"
        >
          No users found.
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
                  Email
                </th>

                <th
                  class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Role
                </th>

                <th
                  class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Created
                </th>

                <th
                  class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Last Login
                </th>

                <th
                  class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200 bg-white">
              <tr
                v-for="user in users"
                :key="user.id"
                class="hover:bg-gray-50"
              >
                <!-- User -->
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="user.profile_picture_url"
                      :src="user.profile_picture_url"
                      :alt="user.name"
                      class="h-9 w-9 rounded-full object-cover"
                    />

                    <div
                      v-else
                      class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600"
                    >
                      {{ user.name.charAt(0).toUpperCase() }}
                    </div>

                    <div>
                      <div class="font-medium text-gray-900">
                        {{ user.name }}
                      </div>

                      <div class="text-xs text-gray-500">
                        ID: {{ user.id }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Email -->
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  {{ user.email }}
                </td>

                <!-- Role -->
                <td class="whitespace-nowrap px-6 py-4">
                  <span
                    class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    "
                  >
                    {{ user.role }}
                  </span>
                </td>

                <!-- Created -->
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {{ formatDate(user.created_at) }}
                </td>

                <!-- Last Login -->
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {{ formatDate(user.last_login_at) }}
                </td>

                <!-- Action -->
                <td class="whitespace-nowrap px-6 py-4 text-right">
                  <button
                    type="button"
                    :disabled="updatingUserId === user.id"
                    @click="changeRole(user)"
                    class="rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                    :class="
                      user.role === 'ADMIN'
                        ? 'border border-red-200 bg-white text-red-600 hover:bg-red-50'
                        : 'bg-black text-white hover:bg-gray-800'
                    "
                  >
                    {{
                      updatingUserId === user.id
                        ? 'Updating...'
                        : user.role === 'ADMIN'
                          ? 'Remove Admin'
                          : 'Make Admin'
                    }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>