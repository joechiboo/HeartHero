<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          ❤️ HeartHero
        </h1>
        <p class="text-gray-600">即時心率監測平台</p>
      </header>

      <!-- Main Content -->
      <main>
        <HeartRateMonitor />
      </main>

      <!-- Footer -->
      <footer class="mt-12 text-center text-sm text-gray-500">
        <p>基於 Web Bluetooth API | 數據僅存於本地</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import HeartRateMonitor from './components/HeartRateMonitor.vue'
</script>
