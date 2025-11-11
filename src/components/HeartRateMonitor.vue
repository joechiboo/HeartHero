<template>
  <div class="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300"
       :class="{ 'ring-4 ring-red-500 animate-pulse': isDanger }">

    <!-- 連接按鈕 -->
    <div class="flex justify-between items-center mb-6 gap-2">
      <button
        @click="handleConnect"
        :disabled="heartRateStore.isConnected"
        class="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="heartRateStore.isConnected
          ? 'bg-green-500 text-white'
          : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'"
      >
        <span v-if="!heartRateStore.isConnected">🔗 連接心率帶</span>
        <span v-else-if="heartRateStore.isSimulationMode">🎮 模擬模式</span>
        <span v-else>✅ 已連接</span>
      </button>

      <button
        v-if="!heartRateStore.isConnected"
        @click="heartRateStore.startSimulation()"
        class="px-6 py-3 rounded-lg font-semibold bg-purple-500 text-white hover:bg-purple-600 active:scale-95 transition-all duration-200"
      >
        🎮 模擬模式
      </button>

      <button
        v-if="heartRateStore.isConnected"
        @click="handleDisconnect"
        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        斷開
      </button>
    </div>

    <!-- 心率顯示區域 -->
    <div v-if="heartRateStore.isConnected" class="space-y-6">

      <!-- 主要心率顯示 -->
      <div class="text-center">
        <div
          class="inline-flex items-baseline justify-center space-x-2 transition-transform"
          :class="{ 'heartbeat-animation': heartRateStore.currentHeartRate > 0 }"
          :style="{ color: heartRateStore.currentZoneInfo.color }"
        >
          <span class="text-8xl font-bold">
            {{ heartRateStore.currentHeartRate }}
          </span>
          <span class="text-3xl font-medium text-gray-500">BPM</span>
        </div>

        <!-- 心率區間標籤 -->
        <div class="mt-4">
          <span
            class="inline-block px-6 py-2 rounded-full text-xl font-semibold text-white"
            :style="{ backgroundColor: heartRateStore.currentZoneInfo.color }"
          >
            {{ heartRateStore.currentZoneInfo.name }}
          </span>
        </div>

        <!-- 心率百分比 -->
        <div class="mt-2 text-sm text-gray-500">
          {{ heartRateStore.heartRatePercentage }}% 最大心率
          (最大值: {{ heartRateStore.maxHeartRate }} BPM)
        </div>
      </div>

      <!-- 心率區間進度條 -->
      <div class="space-y-2">
        <div class="flex justify-between text-xs text-gray-600">
          <span>0</span>
          <span>{{ heartRateStore.maxHeartRate }} BPM</span>
        </div>
        <div class="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <!-- 彩色區間背景 -->
          <div class="absolute inset-0 flex">
            <div
              v-for="(zone, key) in heartRateStore.heartRateZones"
              :key="key"
              class="h-full"
              :style="{
                width: `${((zone.max - zone.min) / heartRateStore.maxHeartRate) * 100}%`,
                backgroundColor: zone.color,
                opacity: 0.3
              }"
            ></div>
          </div>
          <!-- 當前心率指示器 -->
          <div
            class="absolute top-0 bottom-0 w-1 bg-white shadow-lg transition-all duration-300"
            :style="{ left: `${heartRateStore.heartRatePercentage}%` }"
          ></div>
        </div>
        <div class="flex justify-between text-xs text-gray-500">
          <span>休息</span>
          <span>暖身</span>
          <span>燃脂</span>
          <span>有氧</span>
          <span>高強度</span>
        </div>
      </div>

      <!-- 統計資訊 -->
      <div class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-700">
            {{ averageHeartRate }}
          </div>
          <div class="text-xs text-gray-500">平均心率</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-700">
            {{ maxHeartRateRecorded }}
          </div>
          <div class="text-xs text-gray-500">最高心率</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-700">
            {{ duration }}
          </div>
          <div class="text-xs text-gray-500">持續時間</div>
        </div>
      </div>

      <!-- 電池電量 -->
      <div v-if="heartRateStore.batteryLevel !== null" class="text-center text-sm text-gray-500">
        🔋 電池電量: {{ heartRateStore.batteryLevel }}%
      </div>

      <!-- 傳感器接觸狀態 -->
      <div class="text-center text-sm" :class="heartRateStore.isContactDetected ? 'text-green-600' : 'text-orange-600'">
        {{ heartRateStore.isContactDetected ? '✅ 傳感器接觸良好' : '⚠️ 請檢查心率帶佩戴' }}
      </div>

      <!-- 訓練建議 -->
      <div
        class="p-4 rounded-lg text-center font-medium"
        :style="{
          backgroundColor: trainingStatus.color + '20',
          color: trainingStatus.color
        }"
      >
        {{ trainingStatus.message }}
      </div>

      <!-- 功能按鈕 -->
      <div class="flex gap-2 mt-4">
        <button
          @click="heartRateStore.clearHistory()"
          class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          清除記錄
        </button>
        <button
          @click="heartRateStore.toggleDebug()"
          class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          {{ heartRateStore.showDebug ? '隱藏' : '顯示' }} Debug
        </button>
      </div>

      <!-- Debug 日誌 -->
      <div v-if="heartRateStore.showDebug" class="mt-4 p-4 bg-gray-900 text-gray-100 rounded-lg text-xs max-h-64 overflow-y-auto">
        <div v-for="(log, index) in heartRateStore.debugLogs" :key="index" class="mb-1">
          <span class="text-gray-400">{{ log.timestamp }}</span>
          <span
            class="ml-2 px-2 py-0.5 rounded"
            :class="{
              'bg-blue-600': log.type === 'info',
              'bg-green-600': log.type === 'success',
              'bg-red-600': log.type === 'error',
              'bg-yellow-600': log.type === 'warning'
            }"
          >
            {{ log.type }}
          </span>
          <span class="ml-2">{{ log.message }}</span>
        </div>
      </div>
    </div>

    <!-- 未連接時的提示 -->
    <div v-else class="text-center py-12 text-gray-500">
      <div class="text-6xl mb-4">❤️</div>
      <p class="text-lg">請連接心率帶開始監測</p>
      <p class="text-sm mt-2">支援標準 BLE Heart Rate Profile 設備</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useHeartRateStore } from '@/stores/heartRate'

const heartRateStore = useHeartRateStore()

// 危險心率檢測
const isDanger = computed(() => heartRateStore.currentZone === 'danger')

// 訓練狀態
const trainingStatus = computed(() => {
  return heartRateStore.getHeartRateStatus('medium')
})

// 統計數據
const averageHeartRate = computed(() => {
  const history = heartRateStore.heartRateHistory
  if (history.length === 0) return 0
  const sum = history.reduce((acc, record) => acc + record.heartRate, 0)
  return Math.round(sum / history.length)
})

const maxHeartRateRecorded = computed(() => {
  const history = heartRateStore.heartRateHistory
  if (history.length === 0) return 0
  return Math.max(...history.map(record => record.heartRate))
})

const duration = computed(() => {
  const history = heartRateStore.heartRateHistory
  if (history.length < 2) return '0:00'
  const first = history[0].timestamp
  const last = history[history.length - 1].timestamp
  const seconds = Math.floor((last - first) / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
})

// 連接處理
const handleConnect = async () => {
  try {
    await heartRateStore.connect()
  } catch (error) {
    alert(`連接失敗: ${error.message}`)
  }
}

// 斷開處理
const handleDisconnect = () => {
  if (heartRateStore.isSimulationMode) {
    heartRateStore.stopSimulation()
  } else {
    heartRateStore.disconnect()
  }
}

// 危險心率震動提醒
watch(isDanger, (newValue) => {
  if (newValue && 'vibrate' in navigator) {
    // 震動模式: [震動時長, 暫停, 震動時長, 暫停, ...]
    navigator.vibrate([200, 100, 200, 100, 200])
  }
})
</script>

<style scoped>
.heartbeat-animation {
  animation: heartbeat 1s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
