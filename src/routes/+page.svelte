<script lang="ts">
  import { resolve } from '$app/paths'

  const { data } = $props()
  let scrolled = $state(false)

  $effect(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 20
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  })

  const aiWaveHeights = [3, 5, 8, 4, 7, 9, 6, 4, 7, 5, 3, 6, 8, 5, 4]
  const userWaveHeights = [4, 6, 9, 5, 8, 6, 4, 7, 5, 3, 6, 4]
  const aiFeedbackWaveHeights = [2, 5, 7, 4, 8, 6, 9, 5, 7, 4, 6, 8, 5, 3, 6, 7, 4]
  const avatarGradients = [
    'from-indigo-400 to-indigo-600',
    'from-fuchsia-400 to-fuchsia-600',
    'from-amber-400 to-amber-600',
    'from-indigo-400 to-fuchsia-500',
    'from-fuchsia-400 to-amber-500'
  ]
</script>

<div class="relative min-h-screen bg-linear-to-b from-slate-50 to-white">
  <!-- Background decoration -->
  <div class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-fuchsia-200/50 blur-3xl"></div>
    <div class="absolute top-1/4 -left-40 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl"></div>
    <div class="absolute top-1/3 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-amber-200/40 blur-3xl"></div>
  </div>

  <!-- Navigation -->
  <nav
    class="sticky top-0 z-50 transition-all duration-300 {scrolled
      ? 'border-b border-gray-200/60 bg-white/80 shadow-sm backdrop-blur-md'
      : 'bg-transparent'}"
  >
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <div class="flex items-center gap-2.5">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-fuchsia-500">
          <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <span class="text-lg font-semibold text-gray-900">Sonavera</span>
      </div>

      <div class="hidden items-center gap-8 md:flex">
        <a
          href={resolve('/')}
          class="text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-fuchsia-600"
        >
          Features
        </a>
        <a
          href={resolve('/')}
          class="text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-fuchsia-600"
        >
          How it works
        </a>
        <a
          href={resolve('/')}
          class="text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-fuchsia-600"
        >
          Pricing
        </a>
      </div>

      <div class="flex items-center gap-4">
        {#if data.user}
          <a
            href={resolve('/chat')}
            class="rounded-full bg-linear-to-r from-indigo-600 to-fuchsia-600 px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-fuchsia-500/25"
          >
            Go to chat
          </a>
        {:else}
          <a
            href={resolve('/auth/login')}
            class="hidden text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-fuchsia-600 sm:block"
          >
            Log in
          </a>
          <a
            href={resolve('/auth/register')}
            class="rounded-full bg-linear-to-r from-indigo-600 to-fuchsia-600 px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-fuchsia-500/25"
          >
            Start free
          </a>
        {/if}
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="relative px-4 pt-6 pb-20 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10">
    <div class="relative mx-auto max-w-4xl text-center">
      <!-- Badge -->
      <div
        class="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-fuchsia-50 px-4 py-2 text-sm font-medium text-fuchsia-700"
      >
        <span class="flex h-2 w-2 animate-pulse rounded-full bg-fuchsia-500"></span>
        Next-gen AI assistant
      </div>

      <!-- Headline -->
      <h1 class="mb-6 text-4xl leading-tight font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
        Speak foreign languages
        <span
          class="animate-gradient bg-linear-to-r from-indigo-600 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent"
        >
          confidently
        </span>
      </h1>

      <!-- Subheadline -->
      <p class="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
        Practice conversational English, Spanish, French, and other languages with your personal AI companion. No
        judgment, anytime.
      </p>

      <!-- CTA Buttons -->
      <div class="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <a
          href={resolve(data.user ? '/chat' : '/auth/register')}
          class="group flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-fuchsia-500/30 sm:w-auto"
        >
          {data.user ? 'Go to chat' : 'Start talking'}
          <svg
            class="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
        <a
          href={resolve('/')}
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 sm:w-auto"
        >
          <svg class="h-5 w-5 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Watch demo
        </a>
      </div>

      <!-- Hero Image / Chat Preview -->
      <div class="relative mx-auto max-w-3xl">
        <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/50">
          <!-- Call Header -->
          <div class="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="relative">
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-fuchsia-500"
                >
                  <svg
                    class="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div
                  class="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500"
                ></div>
              </div>
              <div>
                <p class="font-semibold text-gray-900">Emma</p>
                <p class="text-sm text-gray-500">AI Tutor • English</p>
              </div>
            </div>
            <div class="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5">
              <div class="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              <span class="text-sm font-medium text-green-700">2:34</span>
            </div>
          </div>

          <!-- Voice Messages -->
          <div class="space-y-4 p-6">
            <!-- AI Voice Message -->
            <div class="flex gap-3">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-100 to-fuchsia-100"
              >
                <svg
                  class="h-4 w-4 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div class="max-w-sm space-y-1.5">
                <div class="rounded-2xl rounded-tl-none bg-gray-100 px-4 py-3">
                  <div class="mb-2 flex items-center gap-2">
                    <svg class="h-3.5 w-3.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"
                      />
                    </svg>
                    <div class="flex items-center gap-0.5">
                      {#each aiWaveHeights as h, i (i)}
                        <div class="w-0.5 rounded-full bg-gray-300" style="height: {h * 2}px"></div>
                      {/each}
                    </div>
                    <span class="text-xs text-gray-400">0:04</span>
                  </div>
                  <p class="text-sm text-gray-700">
                    Hi! Let's practice ordering food at a restaurant. I'll be the waiter. Ready?
                  </p>
                </div>
              </div>
            </div>

            <!-- User Voice Message -->
            <div class="flex justify-end gap-3">
              <div class="max-w-sm space-y-1.5">
                <div class="rounded-2xl rounded-tr-none bg-linear-to-r from-indigo-600 to-fuchsia-600 px-4 py-3">
                  <div class="mb-2 flex items-center gap-2">
                    <svg class="h-3.5 w-3.5 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"
                      />
                    </svg>
                    <div class="flex items-center gap-0.5">
                      {#each userWaveHeights as h, i (i)}
                        <div class="w-0.5 rounded-full bg-white/50" style="height: {h * 2}px"></div>
                      {/each}
                    </div>
                    <span class="text-xs text-white/70">0:02</span>
                  </div>
                  <p class="text-sm text-white">Yes! I'd like to order, please.</p>
                </div>
              </div>
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-100 to-orange-100"
              >
                <span class="text-sm font-medium text-amber-700">Me</span>
              </div>
            </div>

            <!-- AI Voice Message with feedback -->
            <div class="flex gap-3">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-100 to-fuchsia-100"
              >
                <svg
                  class="h-4 w-4 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div class="max-w-sm space-y-2">
                <div class="rounded-2xl rounded-tl-none bg-gray-100 px-4 py-3">
                  <div class="mb-2 flex items-center gap-2">
                    <svg class="h-3.5 w-3.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"
                      />
                    </svg>
                    <div class="flex items-center gap-0.5">
                      {#each aiFeedbackWaveHeights as h, i (i)}
                        <div class="w-0.5 rounded-full bg-gray-300" style="height: {h * 2}px"></div>
                      {/each}
                    </div>
                    <span class="text-xs text-gray-400">0:05</span>
                  </div>
                  <p class="text-sm text-gray-700">
                    Of course! What would you like to have today? We have some excellent pasta specials.
                  </p>
                </div>
                <div class="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2">
                  <svg
                    class="h-4 w-4 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-sm text-amber-700">Great! Natural and polite response</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Voice Input -->
          <div class="border-t border-gray-100 bg-linear-to-t from-gray-50 to-white px-6 py-5">
            <div class="flex flex-col items-center gap-3">
              <!-- Mic button with pulse -->
              <div class="relative">
                <div class="absolute inset-0 animate-ping rounded-full bg-fuchsia-400 opacity-20"></div>
                <div
                  class="absolute -inset-2 animate-pulse rounded-full bg-linear-to-r from-indigo-500/20 to-fuchsia-500/20 blur-md"
                ></div>
                <button
                  type="button"
                  aria-label="Tap to speak"
                  class="relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-linear-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-fuchsia-500/40"
                >
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>
              </div>
              <p class="text-sm text-gray-500">Tap to speak</p>
            </div>
          </div>
        </div>

        <!-- Floating badges -->
        <div
          class="animate-float absolute top-1/4 -left-4 hidden rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg lg:block"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-100 to-fuchsia-50"
            >
              <svg
                class="h-5 w-5 text-fuchsia-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900">Live conversation</p>
              <p class="text-xs text-gray-500">Speak naturally</p>
            </div>
          </div>
        </div>

        <div
          class="animate-float-delayed absolute top-16 -right-4 hidden rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg lg:block"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-100 to-indigo-50"
            >
              <svg
                class="h-5 w-5 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900">Smart hints</p>
              <p class="text-xs text-gray-500">AI corrects mistakes</p>
            </div>
          </div>
        </div>

        <div
          class="animate-float-delayed-2 absolute -right-4 bottom-1/4 hidden rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg lg:block"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-amber-100 to-amber-50"
            >
              <svg
                class="h-5 w-5 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900">15+ languages</p>
              <p class="text-xs text-gray-500">To choose from</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Social proof -->
      <div class="mt-16 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-12">
        <div class="flex -space-x-2">
          {#each avatarGradients as gradient, i (i)}
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-linear-to-br {gradient} text-xs font-medium text-white"
            >
              {String.fromCharCode(65 + i)}
            </div>
          {/each}
        </div>
        <div class="text-center sm:text-left">
          <div class="flex items-center justify-center gap-1 sm:justify-start">
            {#each [1, 2, 3, 4, 5] as star (star)}
              <svg class="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            {/each}
          </div>
          <p class="mt-1 text-sm text-gray-600">
            <span class="font-semibold text-gray-900">4,000+</span> users already practicing
          </p>
        </div>
      </div>
    </div>
  </section>
</div>
