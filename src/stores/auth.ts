import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

interface User {
  id: number
  google_id: string
  email: string
  name: string
  profile_picture_url: string | null
  role: string
  created_at: string
  last_login_at: string | null
}

interface DevLoginResponse {
  token: string
  user: {
    id: number
    email: string
    name: string
    role: string
  }
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<string | null>(
      localStorage.getItem('access_token')
    )

    const user = ref<User | null>(null)

    const loading = ref(false)

    function setToken(value: string) {
      token.value = value
      localStorage.setItem(
        'access_token',
        value
      )
    }

    function clearAuth() {
      token.value = null
      user.value = null

      localStorage.removeItem(
        'access_token'
      )
    }

    async function devLogin() {
      loading.value = true

      try {
        const response =
          await api.post<DevLoginResponse>(
            '/auth/dev-login',
            {
              email: 'dev@example.com',
              name: 'Development User',
              google_id: 'dev-google-user',
            }
          )

        setToken(response.data.token)

        await fetchCurrentUser()
      } finally {
        loading.value = false
      }
    }

    async function fetchCurrentUser() {
      if (!token.value) {
        user.value = null
        return
      }

      try {
        const response =
          await api.get<User>(
            '/auth/me'
          )

        user.value = response.data
      } catch (error) {
        clearAuth()
        throw error
      }
    }

    async function initialize() {
      if (!token.value) {
        return
      }

      try {
        await fetchCurrentUser()
      } catch {
        clearAuth()
      }
    }

    return {
      token,
      user,
      loading,
      setToken,
      clearAuth,
      devLogin,
      fetchCurrentUser,
      initialize,
    }
  }
)