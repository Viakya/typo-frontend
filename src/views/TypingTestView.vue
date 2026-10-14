<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

interface Passage {
  id: number
  title: string
  content: string
  language: string
}

interface TypingTest {
  id: number
  title: string
  test_number: number
  duration_seconds: number
  passage: Passage
}

interface SessionResponse {
  token: string
  expires_at: string
  duration_seconds: number
}

interface SubmitResponse {
  id: number
  test_id: number
}

const route = useRoute()
const router = useRouter()

const test = ref<TypingTest | null>(null)
const typedText = ref('')

const loading = ref(true)
const error = ref('')

const started = ref(false)
const finished = ref(false)
const submitting = ref(false)

const remainingSeconds = ref(0)
const elapsedSeconds = ref(0)

const sessionToken = ref<string | null>(null)

const passageFontSize = ref(27)
const typingFontSize = ref(23)

let timer: number | null = null

const wordCount = computed(() => {
  const text = typedText.value.trim()

  if (!text) {
    return 0
  }

  return text.split(/\s+/).length
})

const grossWpm = computed(() => {
  if (typedText.value.length === 0) {
    return 0
  }

  const minutes = Math.max(
    elapsedSeconds.value / 60,
    1 / 60
  )

  return (
    typedText.value.length / 5 / minutes
  )
})

const formattedGrossWpm = computed(() => {
  return `${grossWpm.value.toFixed(1)} wpm`
})

const formattedTime = computed(() => {
  const minutes = Math.floor(
    remainingSeconds.value / 60
  )

  const seconds =
    remainingSeconds.value % 60

  return `${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(2, '0')}`
})

onMounted(async () => {
  try {
    const testId = route.params.testId

    const response =
      await api.get<TypingTest>(
        `/tests/${testId}`
      )

    test.value = response.data

    remainingSeconds.value =
      response.data.duration_seconds
  } catch (err) {
    error.value =
      'Failed to load the typing test.'

    console.error(err)
  } finally {
    loading.value = false
  }
})

async function startTest() {
  if (
    !test.value ||
    started.value ||
    finished.value
  ) {
    return
  }

  error.value = ''

  try {
    const response =
      await api.post<SessionResponse>(
        `/tests/${test.value.id}/sessions`
      )

    sessionToken.value =
      response.data.token

    remainingSeconds.value =
      response.data.duration_seconds

    elapsedSeconds.value = 0
    started.value = true

    startTimer()
  } catch (err) {
    error.value =
      'Failed to start the typing test.'

    console.error(err)
  }
}

function startTimer() {
  if (timer !== null) {
    window.clearInterval(timer)
  }

  timer = window.setInterval(() => {
    if (remainingSeconds.value <= 1) {
      remainingSeconds.value = 0
      elapsedSeconds.value += 1

      finishTest()

      void submitTest()

      return
    }

    remainingSeconds.value -= 1
    elapsedSeconds.value += 1
  }, 1000)
}

function handleInput() {
  if (!started.value) {
    void startTest()
    return
  }

  if (
    !test.value ||
    finished.value
  ) {
    return
  }

  const passageLength =
    test.value.passage.content.length

  if (
    typedText.value.length >
    passageLength
  ) {
    typedText.value =
      typedText.value.slice(
        0,
        passageLength
      )
  }
}

function finishTest() {
  if (finished.value) {
    return
  }

  finished.value = true

  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
}

function confirmSubmit() {
  if (
    !started.value ||
    finished.value ||
    submitting.value
  ) {
    return
  }

  if (
    window.confirm(
      'Are you sure you want to submit this test?'
    )
  ) {
    finishTest()
    void submitTest()
  }
}

async function submitTest() {
  if (
    !test.value ||
    !sessionToken.value ||
    submitting.value
  ) {
    return
  }

  submitting.value = true
  error.value = ''

  try {
    const response =
      await api.post<SubmitResponse>(
        `/tests/${test.value.id}/sessions/${sessionToken.value}/submit`,
        {
          typed_text: typedText.value,
        }
      )

    router.push(
      `/result/${response.data.id}`
    )
  } catch (err: any) {
    error.value =
      err?.response?.data?.error ||
      'Failed to submit the test.'

    console.error(err)
  } finally {
    submitting.value = false
  }
}

function restartTest() {
  if (submitting.value) {
    return
  }

  if (started.value && !finished.value) {
    const confirmed = window.confirm(
      'Restart this test? Your current attempt will be discarded.'
    )

    if (!confirmed) {
      return
    }
  }

  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }

  typedText.value = ''
  started.value = false
  finished.value = false
  submitting.value = false
  error.value = ''
  sessionToken.value = null
  elapsedSeconds.value = 0

  if (test.value) {
    remainingSeconds.value =
      test.value.duration_seconds
  }

  window.setTimeout(() => {
    document
      .getElementById('typing-input')
      ?.focus()
  }, 0)
}

function focusInput() {
  if (!started.value) {
    void startTest()
    return
  }

  document
    .getElementById('typing-input')
    ?.focus()
}

function decreasePassageFontSize() {
  if (passageFontSize.value > 16) {
    passageFontSize.value -= 1
  }
}

function increasePassageFontSize() {
  if (passageFontSize.value < 36) {
    passageFontSize.value += 1
  }
}

function decreaseTypingFontSize() {
  if (typingFontSize.value > 16) {
    typingFontSize.value -= 1
  }
}

function increaseTypingFontSize() {
  if (typingFontSize.value < 36) {
    typingFontSize.value += 1
  }
}

onUnmounted(() => {
  if (timer !== null) {
    window.clearInterval(timer)
  }
})
</script>

<template>
  <main
    class="min-h-[calc(100vh-65px)] bg-white text-slate-900"
  >
    <!-- Loading -->
    <div
      v-if="loading"
      class="flex min-h-[calc(100vh-65px)] items-center justify-center"
    >
      <p class="text-sm text-slate-500">
        Loading typing test...
      </p>
    </div>

    <!-- Error -->
    <div
      v-else-if="error && !test"
      class="flex min-h-[calc(100vh-65px)] items-center justify-center px-4"
    >
      <div class="text-center">
        <p class="text-red-600">
          {{ error }}
        </p>

        <button
          type="button"
          class="mt-4 rounded border border-slate-400 px-4 py-2 text-sm hover:bg-slate-50"
          @click="router.push('/tests')"
        >
          Back to Tests
        </button>
      </div>
    </div>

    <!-- Test -->
    <template v-else-if="test">
      <!-- Black exam bar -->
      <div
        class="flex h-[31px] items-center justify-between bg-black px-6 text-sm font-bold text-white sm:px-10 lg:px-[6.3%]"
      >
        <span>
          {{ test.title }}
        </span>

        <button
          type="button"
          class="hover:underline"
          @click="
            router.push(
              `/test/${test.id}/history`
            )
          "
        >
          History
        </button>
      </div>

      <!-- Main -->
      <div
        class="mx-auto w-[94%] max-w-[1400px] py-8 lg:w-[87.5%]"
      >
        <!-- Language -->
        <div
          class="mb-6 flex h-[63px] items-center justify-between bg-[#303f91] px-5 text-white shadow-md"
        >
          <div class="flex-1 text-center text-xl sm:text-2xl">
            Language:
            {{ test.passage.language }}
          </div>

          <div
            class="flex items-center gap-1 text-sm"
          >
            <button
              type="button"
              class="rounded border border-white/50 px-2 py-1 hover:bg-white/10"
              @click="decreasePassageFontSize"
            >
              A−
            </button>

            <button
              type="button"
              class="rounded border border-white/50 px-2 py-1 hover:bg-white/10"
              @click="increasePassageFontSize"
            >
              A+
            </button>
          </div>
        </div>

        <!-- Passage -->
        <div
          class="overflow-y-auto rounded-lg border-2 border-slate-300 bg-white px-4 py-3 leading-[1.48]"
          style="height: 238px;"
          :style="{
            fontSize: `${passageFontSize}px`,
          }"
        >
          <p
            class="whitespace-pre-wrap"
          >
            {{ test.passage.content }}
          </p>
        </div>

        <!-- Typed Input Label + Font Controls -->
        <div
          class="mt-7 mb-2 flex items-center justify-between"
        >
          <div
            class="text-2xl sm:text-[26px]"
          >
            Your Typed Input
          </div>

          <div
            class="flex items-center gap-1"
          >
            <button
              type="button"
              class="rounded border border-slate-400 bg-white px-2.5 py-1 text-sm hover:bg-slate-100"
              @click="decreaseTypingFontSize"
            >
              A−
            </button>

            <button
              type="button"
              class="rounded border border-slate-400 bg-white px-2.5 py-1 text-sm hover:bg-slate-100"
              @click="increaseTypingFontSize"
            >
              A+
            </button>
          </div>
        </div>

        <!-- Typed Input -->
        <textarea
          id="typing-input"
          v-model="typedText"
          spellcheck="false"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          :disabled="
            finished || submitting
          "
          class="block w-full resize-none rounded-lg border-2 border-slate-300 bg-white px-4 py-3 font-mono leading-[1.48] text-slate-900 outline-none focus:border-slate-500 disabled:bg-slate-50"
          :style="{
            height: '238px',
            fontSize: `${typingFontSize}px`,
          }"
          @input="handleInput"
          @keydown="
            !started &&
              !finished &&
              startTest()
          "
        ></textarea>

        <!-- Controls -->
        <div
          class="my-5 flex flex-wrap items-center gap-2 border-b border-slate-300 pb-7"
        >
          <button
            type="button"
            class="rounded border border-slate-400 bg-white px-4 py-2 text-sm hover:bg-slate-100"
            :disabled="
              finished || submitting
            "
            @click="focusInput"
          >
            Start / Focus
          </button>

          <button
            type="button"
            class="rounded border border-slate-400 bg-white px-4 py-2 text-sm hover:bg-slate-100"
            :disabled="submitting"
            @click="restartTest"
          >
            Restart
          </button>

          <button
            type="button"
            class="rounded border border-slate-400 bg-white px-4 py-2 text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="
              !started ||
              finished ||
              submitting
            "
            @click="confirmSubmit"
          >
            Submit Test
          </button>

          <div
            class="ml-auto text-lg font-bold tabular-nums sm:text-xl"
          >
            Time:
            {{ formattedTime }}
          </div>
        </div>

        <!-- Difference -->
        <div
          class="border-t border-slate-300 pt-4 text-sm"
        >
          <span
            class="mr-1 inline-block h-3 w-3 rounded-full bg-[#b7d7fa]"
          ></span>

          Difference
        </div>

        <!-- Live Stats -->
        <table
          class="mt-4 w-full table-fixed border-collapse text-sm sm:text-base lg:text-lg"
        >
          <tbody>
            <tr>
              <th
                class="border-t border-slate-300 px-3 py-3 text-left font-normal"
              >
                Chars
              </th>

              <th
                class="border-t border-slate-300 px-3 py-3 text-left font-normal"
              >
                Words
              </th>

              <th
                class="border-t border-slate-300 px-3 py-3 text-left font-normal"
              >
                Gross Typing Speed
              </th>
            </tr>

            <tr>
              <td
                class="border-t border-slate-300 px-3 py-3 font-bold"
              >
                {{ typedText.length }}
              </td>

              <td
                class="border-t border-slate-300 px-3 py-3 font-bold"
              >
                {{ wordCount }}
              </td>

              <td
                class="border-t border-slate-300 px-3 py-3 font-bold"
              >
                {{ formattedGrossWpm }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Submission Error -->
        <p
          v-if="error"
          class="mt-4 text-sm text-red-600"
        >
          {{ error }}
        </p>
      </div>
    </template>
  </main>
</template>