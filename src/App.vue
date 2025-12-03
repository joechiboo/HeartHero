<template>
  <!-- 戰鬥模式 -->
  <BattleScene v-if="currentView === 'battle'" @back="currentView = 'monitor'" />

  <!-- 心率監測模式 -->
  <div v-else class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-12">
        <h1 class="text-5xl font-bold text-gray-800 mb-3">
          ❤️ HeartHero
        </h1>
        <p class="text-xl text-gray-600">心率冒險遊戲</p>
      </header>

      <!-- Main Content -->
      <main>
        <!-- 連接心率帶提示 -->
        <div v-if="!heartRateStore.isConnected" class="text-center mb-12">
          <div class="bg-white rounded-3xl shadow-2xl p-12 mb-8">
            <div class="text-8xl mb-6">⚡</div>
            <h2 class="text-3xl font-bold text-gray-800 mb-4">準備好了嗎？</h2>
            <p class="text-gray-600 mb-8">連接心率帶，開始你的冒險旅程！</p>

            <div class="flex flex-col gap-4 max-w-md mx-auto">
              <!-- 重連中提示 -->
              <div v-if="heartRateStore.isReconnecting" class="bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-xl p-4 mb-4">
                <div class="flex items-center gap-3">
                  <div class="animate-spin text-2xl">⏳</div>
                  <div>
                    <p class="font-bold">正在重新連接...</p>
                    <p class="text-sm">第 {{ heartRateStore.reconnectAttempts }} 次嘗試</p>
                  </div>
                </div>
              </div>

              <button
                @click="handleConnect"
                :disabled="heartRateStore.isReconnecting"
                class="px-10 py-5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔗 連接心率帶
              </button>

              <button
                @click="heartRateStore.startSimulation()"
                :disabled="heartRateStore.isReconnecting"
                class="px-10 py-5 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎮 模擬模式（測試用）
              </button>

              <!-- Debug 按鈕 -->
              <button
                @click="heartRateStore.toggleDebug()"
                class="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-sm transition-all"
              >
                {{ heartRateStore.showDebug ? '🙈 隱藏' : '🐛 顯示' }} Debug
              </button>
            </div>
          </div>

          <!-- Debug 面板 -->
          <div v-if="heartRateStore.showDebug" class="mt-4 space-y-4">
            <!-- 連線狀態資訊 -->
            <div class="bg-white rounded-xl shadow-lg p-4 text-xs">
              <div class="font-bold text-gray-700 mb-2">🔗 連線狀態</div>
              <div class="grid grid-cols-2 gap-2 text-gray-600">
                <div>連線狀態: <span class="font-semibold" :class="heartRateStore.isConnected ? 'text-green-600' : 'text-red-600'">{{ heartRateStore.isConnected ? '已連線' : '未連線' }}</span></div>
                <div>模式: <span class="font-semibold">{{ heartRateStore.isSimulationMode ? '模擬' : '實體設備' }}</span></div>
                <div v-if="heartRateStore.device">設備名稱: <span class="font-semibold">{{ heartRateStore.device.name || '未命名' }}</span></div>
                <div v-if="heartRateStore.device">設備 ID: <span class="font-semibold text-xs">{{ heartRateStore.device.id }}</span></div>
                <div>傳感器: <span class="font-semibold" :class="heartRateStore.isContactDetected ? 'text-green-600' : 'text-orange-600'">{{ heartRateStore.isContactDetected ? '接觸良好' : '未接觸' }}</span></div>
                <div v-if="heartRateStore.batteryLevel">電量: <span class="font-semibold">{{ heartRateStore.batteryLevel }}%</span></div>
              </div>
            </div>

            <!-- Debug 控制台 -->
            <div class="bg-gray-900 text-gray-100 rounded-xl shadow-lg p-4 text-xs max-h-64 overflow-y-auto font-mono">
              <div class="font-bold mb-2 text-green-400">&gt; Debug Console</div>
              <div v-if="heartRateStore.debugLogs.length === 0" class="text-gray-500">等待操作日誌...</div>
              <div v-for="(log, index) in heartRateStore.debugLogs" :key="index" class="mb-1">
                <span class="text-gray-500">{{ log.timestamp }}</span>
                <span
                  class="ml-2 px-1 py-0.5 rounded text-xs"
                  :class="{
                    'bg-blue-600': log.type === 'info',
                    'bg-green-600': log.type === 'success',
                    'bg-red-600': log.type === 'error',
                    'bg-yellow-600': log.type === 'warning'
                  }"
                >
                  {{ log.type.toUpperCase() }}
                </span>
                <span class="ml-2">{{ log.message }}</span>
              </div>
            </div>
          </div>

          <!-- 說明 -->
          <div class="text-center text-gray-500 text-sm mt-4">
            <p>支援標準 BLE Heart Rate Profile 設備</p>
            <p class="mt-2">模擬模式：無需心率帶，自動生成心率數據</p>
          </div>
        </div>

        <!-- 已連接：顯示進入遊戲按鈕 -->
        <div v-else class="text-center">
          <!-- 大型進入遊戲按鈕 -->
          <div class="bg-white rounded-3xl shadow-2xl p-12 mb-8">
            <div class="text-8xl mb-6">🎮</div>
            <h2 class="text-3xl font-bold text-gray-800 mb-4">開始冒險！</h2>
            <p class="text-gray-600 mb-8">你的心率是最強武器</p>

            <button
              @click="currentView = 'battle'"
              class="px-16 py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl font-bold text-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 active:scale-95"
            >
              ⚔️ 進入打怪模式
            </button>
          </div>

          <!-- 心率監測卡片（縮小版） -->
          <details class="bg-white rounded-2xl shadow-lg p-6">
            <summary class="cursor-pointer font-semibold text-gray-700 text-lg hover:text-gray-900">
              📊 查看心率監測詳情
            </summary>
            <div class="mt-4">
              <HeartRateMonitor />
            </div>
          </details>
        </div>
      </main>

      <!-- Footer -->
      <footer class="mt-12 text-center text-sm text-gray-500">
        <p>基於 Web Bluetooth API | 數據僅存於本地</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HeartRateMonitor from './components/HeartRateMonitor.vue'
import BattleScene from './components/BattleScene.vue'
import { useHeartRateStore } from './stores/heartRate'

const currentView = ref('monitor') // 'monitor' | 'battle'
const heartRateStore = useHeartRateStore()

// 處理連接
const handleConnect = async () => {
  try {
    await heartRateStore.connect()
  } catch (error) {
    alert(`連接失敗: ${error.message}`)
  }
}
</script>
