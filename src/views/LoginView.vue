<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const errorMessage = ref('')
const googleButton = ref<HTMLElement | null>(null)

interface GoogleCredentialResponse {
  credential: string
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
  }) => void

  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: string
      size?: string
      width?: number
      text?: string
    }
  ) => void
}

interface GoogleGlobal {
  accounts: {
    id: GoogleAccountsId
  }
}

declare global {
  interface Window {
    google: GoogleGlobal
  }
}

async function handleGoogleLogin(
  response: GoogleCredentialResponse
) {
  errorMessage.value = ''
  auth.loading = true

  try {
    const result = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api'}/auth/google`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      }
    )

    const data = await result.json()

    if (!result.ok) {
      throw new Error(
        data.error || 'Google login failed.'
      )
    }

    auth.setToken(data.token)

    await auth.fetchCurrentUser()


    router.push(
      auth.user?.role === 'ADMIN'
      ? '/admin'
      : '/tests'
    )
    
  } catch (error) {
    console.error(error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Google login failed.'
  } finally {
    auth.loading = false
  }
}

function renderGoogleButton() {
  if (!googleButton.value) return

  if (!window.google?.accounts?.id) {
    errorMessage.value =
      'Google Sign-In could not be loaded.'
    return
  }

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!clientId) {
    errorMessage.value =
      'Google Client ID is not configured.'
    return
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: handleGoogleLogin,
  })

  window.google.accounts.id.renderButton(
    googleButton.value,
    {
      theme: 'outline',
      size: 'large',
      width: 360,
      text: 'signin_with',
    }
  )
}

onMounted(() => {
  const waitForGoogle = () => {
    if (window.google?.accounts?.id) {
      renderGoogleButton()
      return
    }

    window.setTimeout(waitForGoogle, 100)
  }

  waitForGoogle()
})
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-slate-100 px-4"
  >
    <section
      class="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm"
    >
      <div class="text-center">
        <p
          class="text-sm font-semibold text-blue-600"
        >
          Typing Practice
        </p>

        <h1
          class="mt-2 text-3xl font-bold text-slate-900"
        >
          Login
        </h1>

        <p
          class="mt-3 text-sm text-slate-500"
        >
          Sign in to save your typing attempts
          and view your history.
        </p>
      </div>

      <div
        class="mt-8 flex justify-center"
      >
        <div
          ref="googleButton"
        ></div>
      </div>

      <p
        v-if="auth.loading"
        class="mt-4 text-center text-sm text-slate-500"
      >
        Signing in...
      </p>

      <p
        v-if="errorMessage"
        class="mt-4 rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-600"
      >
        {{ errorMessage }}
      </p>
    </section>
  </main>
</template>