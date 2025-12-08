<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="flex items-center justify-between mb-8">
        <button
          @click="$emit('back')"
          class="px-4 py-2 bg-white hover:bg-gray-100 rounded-xl shadow-md transition-all"
        >
          ← 返回
        </button>
        <h1 class="text-2xl font-bold text-gray-800">📊 運動日誌</h1>
        <div class="w-20"></div>
      </header>

      <!-- 記錄中狀態 -->
      <div v-if="sportSessionStore.isRecording" class="mb-8">
        <div class="bg-white rounded-3xl shadow-2xl p-8">
          <!-- 運動類型與時間 -->
          <div class="text-center mb-6">
            <div class="text-6xl mb-4">
              {{ sportSessionStore.sportTypes[sportSessionStore.currentSession?.sport]?.emoji || '💪' }}
            </div>
            <h2 class="text-xl font-semibold text-gray-700">
              {{ sportSessionStore.sportTypes[sportSessionStore.currentSession?.sport]?.name || '運動' }}記錄中
            </h2>
            <div class="text-5xl font-bold text-emerald-600 mt-4 font-mono">
              {{ sportSessionStore.formattedDuration }}
            </div>
          </div>

          <!-- 心率顯示 -->
          <div class="flex justify-center items-center gap-8 mb-6">
            <div class="text-center">
              <div class="text-4xl font-bold" :class="heartRateColor">
                {{ heartRateStore.currentHeartRate || '--' }}
              </div>
              <div class="text-sm text-gray-500">目前心率</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-semibold text-gray-700">
                {{ sportSessionStore.sampleCount }}
              </div>
              <div class="text-sm text-gray-500">取樣數</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-semibold text-gray-700">
                {{ sportSessionStore.roundCount }}
              </div>
              <div class="text-sm text-gray-500">回合數</div>
            </div>
          </div>

          <!-- 回合狀態 -->
          <div class="text-center mb-8">
            <span
              class="px-6 py-3 rounded-full text-lg font-semibold"
              :class="roundStateClass"
            >
              {{ sportSessionStore.roundStateText }}
            </span>
          </div>

          <!-- 提示文字 -->
          <div class="text-center text-gray-500 text-sm mb-8">
            <p>📱 你可以將手機放入包包</p>
            <p>系統會自動記錄心率並偵測上場/休息回合</p>
          </div>

          <!-- 控制按鈕 -->
          <div class="flex gap-4 justify-center">
            <button
              @click="stopRecording"
              class="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-all"
            >
              ⏹️ 完成運動
            </button>
            <button
              @click="cancelRecording"
              class="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl font-semibold transition-all"
            >
              取消
            </button>
          </div>
        </div>
      </div>

      <!-- 開始記錄界面 -->
      <div v-else-if="!showReport" class="mb-8">
        <!-- 未連線提示 -->
        <div v-if="!heartRateStore.isConnected" class="bg-yellow-100 border border-yellow-400 rounded-2xl p-6 mb-6">
          <div class="flex items-center gap-3">
            <span class="text-3xl">⚠️</span>
            <div>
              <p class="font-semibold text-yellow-800">尚未連接心率帶</p>
              <p class="text-yellow-700 text-sm">請先返回主頁連接心率帶或啟用模擬模式</p>
            </div>
          </div>
        </div>

        <!-- 開始新運動 -->
        <div class="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">開始新運動</h2>

          <!-- 運動類型選擇 -->
          <div class="grid grid-cols-3 gap-4 mb-8">
            <button
              v-for="(sport, key) in sportSessionStore.sportTypes"
              :key="key"
              @click="selectedSport = key"
              class="p-4 rounded-2xl border-2 transition-all"
              :class="selectedSport === key
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-emerald-300'"
            >
              <div class="text-4xl mb-2">{{ sport.emoji }}</div>
              <div class="font-semibold text-gray-700">{{ sport.name }}</div>
            </button>
          </div>

          <!-- 開始按鈕 -->
          <button
            @click="startRecording"
            :disabled="!heartRateStore.isConnected"
            class="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold text-xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎬 開始記錄
          </button>
        </div>

        <!-- 歷史記錄 -->
        <div class="bg-white rounded-3xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">📜 歷史記錄</h3>

          <div v-if="sportSessionStore.sessionHistory.length === 0" class="text-center text-gray-500 py-8">
            <div class="text-4xl mb-2">📭</div>
            <p>尚無運動記錄</p>
            <p class="text-sm">開始你的第一次運動吧！</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="session in sportSessionStore.sessionHistory.slice(0, 10)"
              :key="session.id"
              @click="viewReport(session)"
              class="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-all"
            >
              <div class="flex items-center gap-4">
                <span class="text-3xl">
                  {{ sportSessionStore.sportTypes[session.sport]?.emoji || '💪' }}
                </span>
                <div>
                  <div class="font-semibold text-gray-800">
                    {{ sportSessionStore.sportTypes[session.sport]?.name || '運動' }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ sportSessionStore.formatDate(session.startTime) }}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-semibold text-emerald-600">
                  {{ sportSessionStore.formatDuration(session.duration) }}
                </div>
                <div class="text-sm text-gray-500">
                  平均 {{ session.summary?.avgHR || '--' }} BPM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 報告視圖 -->
      <SessionReport
        v-if="showReport && reportSession"
        :session="reportSession"
        @close="closeReport"
        @delete="deleteSession"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSportSessionStore } from '../stores/sportSession'
import { useHeartRateStore } from '../stores/heartRate'
import SessionReport from './SessionReport.vue'

const emit = defineEmits(['back'])

const sportSessionStore = useSportSessionStore()
const heartRateStore = useHeartRateStore()

const selectedSport = ref('basketball')
const showReport = ref(false)
const reportSession = ref(null)

// 心率顏色
const heartRateColor = computed(() => {
  const hr = heartRateStore.currentHeartRate
  if (hr < 60) return 'text-gray-400'
  if (hr < 80) return 'text-blue-500'
  if (hr < 100) return 'text-green-500'
  if (hr < 120) return 'text-yellow-500'
  if (hr < 140) return 'text-orange-500'
  return 'text-red-500'
})

// 回合狀態樣式
const roundStateClass = computed(() => {
  const state = sportSessionStore.roundState
  const classMap = {
    idle: 'bg-gray-100 text-gray-600',
    maybe_active: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    maybe_rest: 'bg-yellow-100 text-yellow-700',
    rest: 'bg-blue-100 text-blue-700'
  }
  return classMap[state] || 'bg-gray-100 text-gray-600'
})

// 開始記錄
async function startRecording() {
  await sportSessionStore.startRecording(selectedSport.value)
}

// 停止記錄
async function stopRecording() {
  const session = await sportSessionStore.stopRecording()
  if (session) {
    reportSession.value = session
    showReport.value = true
  }
}

// 取消記錄
function cancelRecording() {
  if (confirm('確定要取消記錄嗎？此次運動資料將不會保存。')) {
    sportSessionStore.cancelRecording()
  }
}

// 查看報告
function viewReport(session) {
  reportSession.value = session
  showReport.value = true
}

// 關閉報告
function closeReport() {
  showReport.value = false
  reportSession.value = null
}

// 刪除紀錄
async function deleteSession(sessionId) {
  if (confirm('確定要刪除此運動紀錄嗎？')) {
    await sportSessionStore.deleteSession(sessionId)
    closeReport()
  }
}

// 載入歷史記錄
onMounted(async () => {
  await sportSessionStore.loadHistory()
})
</script>
