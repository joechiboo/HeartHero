<template>
  <div class="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <button
        @click="$emit('close')"
        class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
      >
        ← 返回列表
      </button>
      <button
        @click="$emit('delete', session.id)"
        class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all"
      >
        🗑️ 刪除
      </button>
    </div>

    <!-- 標題 -->
    <div class="text-center mb-8">
      <div class="text-5xl mb-3">{{ sportEmoji }}</div>
      <h2 class="text-2xl font-bold text-gray-800">{{ sportName }}</h2>
      <p class="text-gray-500">{{ formatDate(session.startTime) }}</p>
      <p class="text-4xl font-bold text-emerald-600 mt-4">
        {{ formatDuration(session.duration) }}
      </p>
    </div>

    <!-- 主要統計 -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="bg-gray-50 rounded-2xl p-4 text-center">
        <div class="text-3xl font-bold text-blue-500">{{ summary.avgHR }}</div>
        <div class="text-sm text-gray-500">平均心率</div>
      </div>
      <div class="bg-gray-50 rounded-2xl p-4 text-center">
        <div class="text-3xl font-bold text-red-500">{{ summary.maxHR }}</div>
        <div class="text-sm text-gray-500">最高心率</div>
      </div>
      <div class="bg-gray-50 rounded-2xl p-4 text-center">
        <div class="text-3xl font-bold text-green-500">{{ summary.minHR }}</div>
        <div class="text-sm text-gray-500">最低心率</div>
      </div>
    </div>

    <!-- 上場/休息統計 -->
    <div class="bg-emerald-50 rounded-2xl p-6 mb-6">
      <h3 class="font-bold text-emerald-800 mb-4">🏃 上場統計</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-600">回合數：</span>
          <span class="font-semibold">{{ summary.totalRounds }} 回合</span>
        </div>
        <div>
          <span class="text-gray-600">總時長：</span>
          <span class="font-semibold">{{ formatDuration(summary.activeTime) }} ({{ activePercentage }}%)</span>
        </div>
        <div>
          <span class="text-gray-600">最長連續：</span>
          <span class="font-semibold">{{ formatDuration(summary.longestActive) }}</span>
        </div>
        <div>
          <span class="text-gray-600">平均每回合：</span>
          <span class="font-semibold">{{ formatDuration(summary.avgRoundDuration) }}</span>
        </div>
      </div>
    </div>

    <div class="bg-blue-50 rounded-2xl p-6 mb-6">
      <h3 class="font-bold text-blue-800 mb-4">😮‍💨 休息統計</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-600">休息次數：</span>
          <span class="font-semibold">{{ restRoundCount }} 次</span>
        </div>
        <div>
          <span class="text-gray-600">總時長：</span>
          <span class="font-semibold">{{ formatDuration(summary.restTime) }} ({{ restPercentage }}%)</span>
        </div>
        <div>
          <span class="text-gray-600">恢復力：</span>
          <span class="font-semibold" :class="recoveryRateClass">
            {{ summary.avgRecoveryRate > 0 ? `1分鐘降 ${summary.avgRecoveryRate} BPM` : '--' }}
            {{ recoveryRateIcon }}
          </span>
        </div>
        <div>
          <span class="text-gray-600">估算消耗：</span>
          <span class="font-semibold">{{ summary.calories }} 大卡</span>
        </div>
      </div>
    </div>

    <!-- 心率區間分布 -->
    <div class="bg-gray-50 rounded-2xl p-6 mb-6">
      <h3 class="font-bold text-gray-800 mb-4">📊 心率區間分布</h3>
      <div class="space-y-3">
        <div v-for="(zone, key) in zoneDistribution" :key="key" class="flex items-center gap-3">
          <div class="w-16 text-sm text-gray-600">{{ zone.name }}</div>
          <div class="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="zone.colorClass"
              :style="{ width: `${zone.percentage}%` }"
            ></div>
          </div>
          <div class="w-16 text-sm text-right text-gray-600">{{ zone.percentage }}%</div>
        </div>
      </div>
    </div>

    <!-- 回合詳情 -->
    <div class="bg-gray-50 rounded-2xl p-6">
      <h3 class="font-bold text-gray-800 mb-4">🔄 回合詳情</h3>

      <div v-if="session.rounds.length === 0" class="text-center text-gray-500 py-4">
        無回合記錄
      </div>

      <div v-else class="space-y-2 max-h-64 overflow-y-auto">
        <div
          v-for="(round, index) in session.rounds"
          :key="index"
          class="flex items-center justify-between p-3 rounded-xl"
          :class="round.type === 'active' ? 'bg-green-100' : 'bg-blue-100'"
        >
          <div class="flex items-center gap-3">
            <span class="text-xl">{{ round.type === 'active' ? '🏃' : '😮‍💨' }}</span>
            <div>
              <span class="font-semibold">{{ round.type === 'active' ? '上場' : '休息' }}</span>
              <span class="text-sm text-gray-500 ml-2">{{ formatDuration(round.duration) }}</span>
            </div>
          </div>
          <div class="text-right text-sm">
            <div>
              <span class="text-gray-500">平均</span>
              <span class="font-semibold ml-1">{{ round.avgHR }}</span>
            </div>
            <div>
              <span class="text-gray-500">最高</span>
              <span class="font-semibold ml-1">{{ round.maxHR }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSportSessionStore } from '../stores/sportSession'

const props = defineProps({
  session: {
    type: Object,
    required: true
  }
})

defineEmits(['close', 'delete'])

const sportSessionStore = useSportSessionStore()

// 運動類型資訊
const sportEmoji = computed(() => {
  return sportSessionStore.sportTypes[props.session.sport]?.emoji || '💪'
})

const sportName = computed(() => {
  return sportSessionStore.sportTypes[props.session.sport]?.name || '運動'
})

// 統計摘要
const summary = computed(() => {
  return props.session.summary || {
    avgHR: 0,
    maxHR: 0,
    minHR: 0,
    zones: {},
    totalRounds: 0,
    activeTime: 0,
    restTime: 0,
    longestActive: 0,
    avgRoundDuration: 0,
    avgRecoveryRate: 0,
    calories: 0
  }
})

// 上場百分比
const activePercentage = computed(() => {
  const total = summary.value.activeTime + summary.value.restTime
  if (total === 0) return 0
  return Math.round((summary.value.activeTime / total) * 100)
})

// 休息百分比
const restPercentage = computed(() => {
  return 100 - activePercentage.value
})

// 休息回合數
const restRoundCount = computed(() => {
  return props.session.rounds.filter(r => r.type === 'rest').length
})

// 恢復力評級
const recoveryRateClass = computed(() => {
  const rate = summary.value.avgRecoveryRate
  if (rate >= 30) return 'text-green-600'
  if (rate >= 20) return 'text-yellow-600'
  return 'text-orange-600'
})

const recoveryRateIcon = computed(() => {
  const rate = summary.value.avgRecoveryRate
  if (rate >= 30) return '✓✓'
  if (rate >= 20) return '✓'
  if (rate > 0) return ''
  return ''
})

// 心率區間分布
const zoneDistribution = computed(() => {
  const zones = summary.value.zones || {}
  const total = Object.values(zones).reduce((a, b) => a + b, 0)

  const zoneConfig = {
    rest: { name: '休息', colorClass: 'bg-gray-400' },
    warmup: { name: '輕鬆', colorClass: 'bg-blue-400' },
    fatBurn: { name: '適中', colorClass: 'bg-green-400' },
    cardio: { name: '有氧', colorClass: 'bg-yellow-400' },
    peak: { name: '高強度', colorClass: 'bg-orange-400' },
    danger: { name: '極限', colorClass: 'bg-red-500' }
  }

  return Object.entries(zoneConfig).map(([key, config]) => ({
    ...config,
    key,
    seconds: zones[key] || 0,
    percentage: total > 0 ? Math.round(((zones[key] || 0) / total) * 100) : 0
  }))
})

// 格式化函數
function formatDuration(seconds) {
  if (!seconds) return '0:00'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function formatDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
