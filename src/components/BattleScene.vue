<template>
  <div class="min-h-screen bg-gradient-to-b from-purple-900 via-purple-700 to-purple-900 text-white p-6">

    <!-- 勝利畫面 -->
    <div v-if="showVictory" class="max-w-2xl mx-auto text-center">
      <div class="bg-white bg-opacity-10 rounded-3xl p-12">
        <div class="text-8xl mb-6">🎉</div>
        <h1 class="text-5xl font-bold mb-4">勝利！</h1>
        <p class="text-2xl mb-8">擊敗了 {{ battleStore.currentBoss.name }}！</p>

        <!-- 星星評價 -->
        <div class="text-6xl mb-8">
          {{ '⭐'.repeat(battleStore.earnedStars) }}
        </div>

        <!-- 統計資料 -->
        <div class="bg-black bg-opacity-30 rounded-2xl p-6 mb-8 space-y-4">
          <div class="flex justify-between text-lg">
            <span>完成時間：</span>
            <span class="font-bold">{{ battleStore.battleTime }}</span>
          </div>
          <div class="flex justify-between text-lg">
            <span>平均心率：</span>
            <span class="font-bold">{{ battleStore.averageHeartRate }} BPM</span>
          </div>
          <div class="flex justify-between text-lg">
            <span>最高心率：</span>
            <span class="font-bold">{{ battleStore.maxHeartRate }} BPM</span>
          </div>
        </div>

        <!-- 按鈕 -->
        <div class="flex gap-4 justify-center">
          <button
            @click="handleNextBattle"
            class="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg transition-colors"
          >
            下一關
          </button>
          <button
            @click="handleBackToMenu"
            class="px-8 py-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl font-bold text-lg transition-colors"
          >
            回到選單
          </button>
        </div>
      </div>
    </div>

    <!-- 戰鬥中畫面 -->
    <div v-else-if="battleStore.isBattleActive" class="max-w-4xl mx-auto">

      <!-- 頂部資訊欄 -->
      <div class="flex justify-between items-center mb-6">
        <div class="text-left">
          <div class="text-sm opacity-80">戰鬥時間</div>
          <div class="text-2xl font-bold">{{ battleStore.battleTime }}</div>
        </div>

        <div class="text-center">
          <div class="text-sm opacity-80">當前心率</div>
          <div class="text-3xl font-bold" :style="{ color: heartRateStore.currentZoneInfo.color }">
            {{ heartRateStore.currentHeartRate }} BPM
          </div>
        </div>

        <button
          @click="battleStore.toggleVoice()"
          class="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
        >
          {{ battleStore.voiceEnabled ? '🔊 音效開' : '🔇 音效關' }}
        </button>
      </div>

      <!-- 魔王資訊 -->
      <div class="bg-black bg-opacity-30 rounded-2xl p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-4">
            <div class="text-6xl">{{ battleStore.currentBoss.emoji }}</div>
            <div>
              <h2 class="text-3xl font-bold">{{ battleStore.currentBoss.name }}</h2>
              <p class="text-sm opacity-80">{{ battleStore.currentBoss.description }}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-4xl font-bold">{{ Math.ceil(battleStore.bossHealth) }}%</div>
            <div class="text-sm opacity-80">剩餘血量</div>
          </div>
        </div>

        <!-- 血條 -->
        <div class="relative h-8 bg-gray-800 rounded-full overflow-hidden">
          <div
            class="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
            :style="{ width: `${battleStore.bossHealthPercentage}%` }"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
            {{ Math.ceil(battleStore.bossHealthPercentage) }}%
          </div>
        </div>
      </div>

      <!-- 戰鬥畫面 -->
      <div class="bg-black bg-opacity-20 rounded-2xl p-12 mb-6 relative overflow-hidden">
        <!-- 背景效果 -->
        <div class="absolute inset-0 opacity-20">
          <div class="absolute w-full h-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
        </div>

        <!-- 英雄和魔王 -->
        <div class="relative flex items-center justify-between">
          <!-- 英雄 -->
          <div class="text-center">
            <div
              class="text-8xl mb-4 transition-transform"
              :class="{ 'animate-bounce': heartRateStore.currentHeartRate > 0 }"
            >
              💪
            </div>
            <div class="text-xl font-bold">你</div>
            <div class="text-sm opacity-80">攻擊力 x{{ battleStore.currentDamageMultiplier.toFixed(1) }}</div>
          </div>

          <!-- 攻擊特效 - 根據心率區間顯示不同招式（從左飛向右） -->
          <div class="flex-1 flex items-center justify-center relative overflow-hidden">
            <!-- 休息區間：無攻擊 -->
            <div v-if="heartRateStore.currentZone === 'rest'" class="text-4xl opacity-30">
              💤
            </div>

            <!-- 暖身區間：普通拳擊 -->
            <div v-else-if="heartRateStore.currentZone === 'warmup'"
                 class="text-6xl animate-fly-right"
                 :key="attackKey">
              👊
            </div>

            <!-- 燃脂區間：劍擊 -->
            <div v-else-if="heartRateStore.currentZone === 'fatBurn'"
                 class="text-6xl animate-fly-right-fast"
                 :key="attackKey">
              ⚔️
            </div>

            <!-- 有氧區間：火焰劍 -->
            <div v-else-if="heartRateStore.currentZone === 'cardio'" class="relative">
              <div class="text-6xl animate-fly-right-fast" :key="attackKey">🔥</div>
              <div class="text-4xl absolute top-0 left-0 animate-fly-right-fast animation-delay-200" :key="attackKey + '-sword'">⚔️</div>
            </div>

            <!-- 高強度區間：雷電 -->
            <div v-else-if="heartRateStore.currentZone === 'peak'" class="relative">
              <div class="text-7xl animate-fly-right-ultra" :key="attackKey">⚡</div>
              <div class="text-5xl absolute top-0 left-0 animate-fly-right-ultra animation-delay-100" :key="attackKey + '-bolt'">⚡</div>
            </div>

            <!-- 危險區間：爆炸連擊 -->
            <div v-else-if="heartRateStore.currentZone === 'danger'" class="relative">
              <div class="text-8xl animate-fly-right-ultra" :key="attackKey">💥</div>
              <div class="text-6xl absolute top-2 left-0 animate-fly-right-ultra animation-delay-100" :key="attackKey + '-thunder'">⚡</div>
              <div class="text-6xl absolute top-2 left-0 animate-fly-right-ultra animation-delay-200" :key="attackKey + '-fire'">🔥</div>
            </div>
          </div>

          <!-- 魔王 -->
          <div class="text-center">
            <div
              class="text-8xl mb-4 transition-all"
              :class="{
                'animate-shake': battleStore.bossHealthPercentage < 50,
                'animate-boss-hit': bossHit,
                'opacity-75': bossHit
              }"
            >
              {{ battleStore.currentBoss.emoji }}
            </div>
            <!-- 受傷特效 -->
            <div v-if="bossHit" class="text-4xl absolute animate-fade-up">💥</div>

            <div class="text-xl font-bold">{{ battleStore.currentBoss.name }}</div>
            <div class="text-sm opacity-80">{{ Math.ceil(battleStore.bossHealth) }}% HP</div>
          </div>
        </div>
      </div>

      <!-- 心率區間指示 -->
      <div class="bg-black bg-opacity-30 rounded-2xl p-6">
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm opacity-80">心率區間</div>
          <div class="text-lg font-bold" :style="{ color: heartRateStore.currentZoneInfo.color }">
            {{ heartRateStore.currentZoneInfo.name }}
          </div>
        </div>
        <div class="relative h-4 bg-gray-800 rounded-full overflow-hidden">
          <div class="absolute inset-0 flex">
            <div v-for="(zone, key) in heartRateStore.heartRateZones" :key="key"
              class="h-full"
              :style="{
                width: `${((zone.max - zone.min) / heartRateStore.maxHeartRate) * 100}%`,
                backgroundColor: zone.color,
                opacity: 0.5
              }"
            ></div>
          </div>
          <div
            class="absolute top-0 bottom-0 w-2 bg-white shadow-lg transition-all duration-300"
            :style="{ left: `${heartRateStore.heartRatePercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- 取消按鈕 -->
      <div class="text-center mt-6">
        <button
          @click="showCancelConfirm = true"
          class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
        >
          取消戰鬥
        </button>
      </div>
    </div>

    <!-- 關卡選擇畫面 -->
    <div v-else class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold text-center mb-8">選擇你的對手</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="boss in battleStore.bosses"
          :key="boss.id"
          @click="isBossUnlocked(boss.id) ? handleStartBattle(boss.id) : null"
          class="bg-white bg-opacity-10 rounded-2xl p-6 transition-all relative"
          :class="{
            'hover:bg-opacity-20 cursor-pointer hover:scale-105 active:scale-95': isBossUnlocked(boss.id),
            'opacity-50 cursor-not-allowed': !isBossUnlocked(boss.id)
          }"
        >
          <!-- 鎖定圖示 -->
          <div v-if="!isBossUnlocked(boss.id)" class="absolute top-4 right-4 text-3xl">🔒</div>

          <div class="text-6xl text-center mb-4" :class="{ 'grayscale': !isBossUnlocked(boss.id) }">{{ boss.emoji }}</div>
          <h3 class="text-2xl font-bold text-center mb-2">{{ boss.name }}</h3>
          <p class="text-sm text-center opacity-80 mb-4">{{ boss.description }}</p>

          <div class="space-y-2 text-sm">
            <!-- 剩餘血量（如果有保存） -->
            <div v-if="battleStore.savedBossHealth[boss.id]" class="flex justify-between text-orange-400">
              <span>剩餘血量：</span>
              <span class="font-bold">{{ Math.ceil(battleStore.savedBossHealth[boss.id]) }}%</span>
            </div>
            <div v-else class="flex justify-between">
              <span>血量：</span>
              <span class="font-bold">{{ boss.health }}%</span>
            </div>
            <div class="flex justify-between">
              <span>目標時間：</span>
              <span class="font-bold">{{ formatTime(boss.targetTime) }}</span>
            </div>
          </div>

          <!-- 歷史最佳成績 -->
          <div v-if="getBossRecord(boss.id)" class="mt-4 pt-4 border-t border-white border-opacity-20">
            <div class="text-xs opacity-80 mb-1">最佳紀錄</div>
            <div class="flex justify-between items-center">
              <span class="text-sm">{{ formatTime(getBossRecord(boss.id).duration) }}</span>
              <span class="text-lg">{{ '⭐'.repeat(getBossRecord(boss.id).stars) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 返回按鈕 -->
      <div class="text-center mt-8">
        <button
          @click="$emit('back')"
          class="px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
        >
          ← 返回心率監測
        </button>
      </div>
    </div>

    <!-- 取消確認對話框（覆蓋在所有畫面上方） -->
    <div v-if="showCancelConfirm" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-red-500 animate-scale-in">
        <div class="text-6xl text-center mb-4">⚠️</div>
        <h2 class="text-3xl font-bold text-white text-center mb-4">確定要放棄嗎？</h2>
        <p class="text-gray-300 text-center mb-8">魔王血量會保留，可以繼續挑戰</p>

        <div class="flex gap-4">
          <button
            @click="showCancelConfirm = false"
            class="flex-1 px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95"
          >
            繼續戰鬥
          </button>
          <button
            @click="confirmCancel"
            class="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95"
          >
            確定放棄
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useBattleStore } from '@/stores/battle'
import { useHeartRateStore } from '@/stores/heartRate'

const battleStore = useBattleStore()
const heartRateStore = useHeartRateStore()

const showVictory = ref(false)
const showCancelConfirm = ref(false)
const attackKey = ref(0)
const bossHit = ref(false)

// 攻擊動畫循環（每秒觸發一次攻擊）
let attackInterval = null
watch(() => battleStore.isBattleActive, (active) => {
  if (active) {
    attackInterval = setInterval(() => {
      if (heartRateStore.currentZone !== 'rest') {
        // 觸發攻擊動畫
        attackKey.value++

        // 魔王受傷特效
        bossHit.value = true
        setTimeout(() => {
          bossHit.value = false
        }, 300)
      }
    }, 1000) // 每秒一次攻擊
  } else {
    if (attackInterval) {
      clearInterval(attackInterval)
    }
  }
})

// 監聽戰鬥結束
watch(() => battleStore.isBossDefeated, (defeated) => {
  if (defeated && battleStore.isBattleActive === false) {
    // 延遲顯示勝利畫面
    setTimeout(() => {
      showVictory.value = true
    }, 1000)
  }
})

// 開始戰鬥
const handleStartBattle = (bossId) => {
  showVictory.value = false
  battleStore.startBattle(bossId)
}

// 確認取消戰鬥
const confirmCancel = () => {
  showCancelConfirm.value = false
  battleStore.cancelBattle()
}

// 下一關
const handleNextBattle = () => {
  const currentBossId = battleStore.currentBoss.id
  const nextBossId = currentBossId + 1

  if (nextBossId <= battleStore.bosses.length) {
    handleStartBattle(nextBossId)
  } else {
    // 已經是最後一關
    showVictory.value = false
  }
}

// 回到選單
const handleBackToMenu = () => {
  showVictory.value = false
}

// 格式化時間
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 獲取魔王最佳紀錄
const getBossRecord = (bossId) => {
  const records = battleStore.battleHistory.filter(r => r.bossId === bossId)
  if (records.length === 0) return null

  // 返回時間最短的紀錄
  return records.reduce((best, current) =>
    current.duration < best.duration ? current : best
  )
}

// 判斷關卡是否解鎖
const isBossUnlocked = (bossId) => {
  // 第一關永遠解鎖
  if (bossId === 1) return true

  // 檢查前一關是否打過
  const previousBossId = bossId - 1
  const previousBossRecord = getBossRecord(previousBossId)

  // 如果前一關有紀錄，表示打過了，解鎖當前關卡
  return previousBossRecord !== null
}
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes scale-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}

@keyframes spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 2s linear infinite;
}

/* 攻擊飛行動畫 - 從左飛到右 */
@keyframes fly-right {
  0% {
    transform: translateX(-100px) scale(0.5);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translateX(200px) scale(1.2);
    opacity: 0;
  }
}

@keyframes fly-right-fast {
  0% {
    transform: translateX(-100px) scale(0.5);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translateX(250px) scale(1.3);
    opacity: 0;
  }
}

@keyframes fly-right-ultra {
  0% {
    transform: translateX(-100px) scale(0.5);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    transform: translateX(300px) scale(1.5);
    opacity: 0;
  }
}

.animate-fly-right {
  animation: fly-right 1.5s ease-out;
}

.animate-fly-right-fast {
  animation: fly-right-fast 1s ease-out;
}

.animate-fly-right-ultra {
  animation: fly-right-ultra 0.7s ease-out;
}

/* 延遲動畫 */
.animation-delay-100 {
  animation-delay: 0.1s;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

/* 魔王受傷動畫 */
@keyframes boss-hit {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(15px); }
  75% { transform: translateX(-15px); }
}

.animate-boss-hit {
  animation: boss-hit 0.3s ease-in-out;
}

/* 受傷特效淡出上升 */
@keyframes fade-up {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-50px);
    opacity: 0;
  }
}

.animate-fade-up {
  animation: fade-up 0.5s ease-out;
}

/* 灰階濾鏡 */
.grayscale {
  filter: grayscale(100%);
}
</style>
