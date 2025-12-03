import { defineStore } from 'pinia'
import { useHeartRateStore } from './heartRate'

// localStorage 鍵名
const STORAGE_KEY = 'hearthero_battle_state'

// 從 localStorage 讀取保存的狀態
function loadSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      return {
        battleHistory: data.battleHistory || [],
        savedBossHealth: data.savedBossHealth || {},
        // 如果有進行中的戰鬥，恢復它
        pendingBattle: data.pendingBattle || null
      }
    }
  } catch (e) {
    console.error('[Battle] 讀取存檔失敗:', e)
  }
  return { battleHistory: [], savedBossHealth: {}, pendingBattle: null }
}

const savedState = loadSavedState()

export const useBattleStore = defineStore('battle', {
  state: () => ({
    // 戰鬥狀態
    isBattleActive: false,
    battleStartTime: null,
    battleDuration: 0,

    // 魔王資訊
    currentBoss: null,
    bossHealth: 100,
    bossMaxHealth: 100,

    // 戰鬥統計
    totalDamage: 0,
    averageHeartRate: 0,
    maxHeartRate: 0,
    battleHistory: savedState.battleHistory,

    // 保留的魔王血量（放棄時保存）
    savedBossHealth: savedState.savedBossHealth,

    // 待恢復的戰鬥（頁面重載時）
    pendingBattle: savedState.pendingBattle,

    // 關卡定義
    bosses: [
      {
        id: 1,
        name: '史萊姆',
        emoji: '🟢',
        health: 100,
        healthMultiplier: 0.5, // 實際血量倍數
        description: '新手魔王，輕鬆擊敗',
        targetTime: 150, // 2.5 分鐘（秒）
        stars: { gold: 120, silver: 150, bronze: 180 }
      },
      {
        id: 2,
        name: '哥布林',
        emoji: '👹',
        health: 100,
        healthMultiplier: 0.75,
        description: '調皮的綠色妖怪',
        targetTime: 225, // 3.75 分鐘
        stars: { gold: 180, silver: 225, bronze: 270 }
      },
      {
        id: 3,
        name: '巨魔',
        emoji: '👺',
        health: 100,
        healthMultiplier: 1.0,
        description: '力量強大的對手',
        targetTime: 300, // 5 分鐘
        stars: { gold: 240, silver: 300, bronze: 360 }
      },
      {
        id: 4,
        name: '火龍',
        emoji: '🐲',
        health: 100,
        healthMultiplier: 1.5,
        description: '會噴火的巨龍',
        targetTime: 450, // 7.5 分鐘
        stars: { gold: 360, silver: 450, bronze: 540 }
      },
      {
        id: 5,
        name: '終極魔王',
        emoji: '👿',
        health: 100,
        healthMultiplier: 2.0,
        description: '最強大的敵人',
        targetTime: 600, // 10 分鐘
        stars: { gold: 480, silver: 600, bronze: 720 }
      }
    ],

    // 傷害倍數設定
    damageMultipliers: {
      rest: 1.0,     // 60-80 bpm
      warmup: 1.5,   // 80-100 bpm
      fatBurn: 2.0,  // 100-120 bpm
      cardio: 3.0,   // 120-140 bpm
      peak: 4.0,     // 140-160 bpm
      danger: 5.0    // 160+ bpm
    },

    // 語音播報設定
    voiceEnabled: true,
    lastVoiceZone: null,
    lastHealthMilestone: 100
  }),

  getters: {
    // 基礎傷害（每秒）- 針對 healthMultiplier = 1.0 的魔王
    baseDamagePerSecond: () => 0.33,

    // 當前傷害倍數
    currentDamageMultiplier() {
      const heartRateStore = useHeartRateStore()
      const zone = heartRateStore.currentZone
      return this.damageMultipliers[zone] || 1.0
    },

    // 每秒實際傷害（考慮魔王血量倍數）
    actualDamagePerSecond() {
      if (!this.currentBoss) return 0
      const baseMultiplier = this.currentBoss.healthMultiplier || 1.0
      return this.baseDamagePerSecond * this.currentDamageMultiplier * baseMultiplier
    },

    // 剩餘血量百分比
    bossHealthPercentage() {
      return (this.bossHealth / this.bossMaxHealth) * 100
    },

    // 戰鬥經過時間（格式化）
    battleTime() {
      const seconds = this.battleDuration
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },

    // 是否擊敗魔王
    isBossDefeated() {
      return this.bossHealth <= 0
    },

    // 獲得星星數量
    earnedStars() {
      if (!this.currentBoss || !this.isBossDefeated) return 0
      const time = this.battleDuration
      const stars = this.currentBoss.stars

      if (time <= stars.gold) return 3
      if (time <= stars.silver) return 2
      if (time <= stars.bronze) return 1
      return 0
    }
  },

  actions: {
    // 開始戰鬥
    startBattle(bossId) {
      const boss = this.bosses.find(b => b.id === bossId)
      if (!boss) {
        console.error('找不到魔王')
        return
      }

      // 重置狀態
      this.currentBoss = boss

      // 檢查是否有保存的血量
      if (this.savedBossHealth[bossId] !== undefined) {
        this.bossHealth = this.savedBossHealth[bossId]
        this.speak(`繼續挑戰 ${boss.name}！剩餘 ${Math.ceil(this.bossHealth)}% 血量！`)
      } else {
        this.bossHealth = boss.health
        this.speak(`開始挑戰 ${boss.name}！加油！`)
      }

      this.bossMaxHealth = boss.health
      this.isBattleActive = true
      this.battleStartTime = Date.now()
      this.battleDuration = 0
      this.totalDamage = 0
      this.averageHeartRate = 0
      this.maxHeartRate = 0
      this.lastVoiceZone = null
      this.lastHealthMilestone = 100

      // 開始戰鬥循環
      this.startBattleLoop()
    },

    // 戰鬥循環（每秒執行）
    startBattleLoop() {
      this.battleInterval = setInterval(() => {
        if (!this.isBattleActive) {
          clearInterval(this.battleInterval)
          return
        }

        // 更新戰鬥時間
        this.battleDuration = Math.floor((Date.now() - this.battleStartTime) / 1000)

        // 計算傷害
        const damage = this.actualDamagePerSecond
        this.bossHealth = Math.max(0, this.bossHealth - damage)
        this.totalDamage += damage

        // 更新統計
        const heartRateStore = useHeartRateStore()
        const currentHR = heartRateStore.currentHeartRate
        if (currentHR > this.maxHeartRate) {
          this.maxHeartRate = currentHR
        }

        // 檢查心率區間變化（語音提示）
        this.checkZoneChange()

        // 檢查血量里程碑（語音提示）
        this.checkHealthMilestone()

        // 檢查是否擊敗
        if (this.isBossDefeated) {
          this.endBattle()
        }

        // 每 10 秒自動保存
        if (this.battleDuration % 10 === 0) {
          this.saveToStorage()
        }
      }, 1000)
    },

    // 檢查心率區間變化
    checkZoneChange() {
      const heartRateStore = useHeartRateStore()
      const currentZone = heartRateStore.currentZone

      if (this.lastVoiceZone !== currentZone) {
        this.lastVoiceZone = currentZone

        const zoneMessages = {
          rest: '休息中，準備好再衝刺！',
          warmup: '進入藍色暖身區，開始攻擊！',
          fatBurn: '進入綠色燃脂區，攻擊加速！',
          cardio: '進入橙色有氧區，攻擊力加倍！',
          peak: '進入紅色高強度區，全力爆發！',
          danger: '衝刺！超高心率，火力全開！'
        }

        if (zoneMessages[currentZone]) {
          this.speak(zoneMessages[currentZone])
        }
      }
    },

    // 檢查血量里程碑
    checkHealthMilestone() {
      const percentage = this.bossHealthPercentage

      // 每 25% 播報一次
      if (percentage <= 75 && this.lastHealthMilestone === 100) {
        this.speak(`${this.currentBoss.name}剩 75% 血量！`)
        this.lastHealthMilestone = 75
      } else if (percentage <= 50 && this.lastHealthMilestone === 75) {
        this.speak(`${this.currentBoss.name}剩 50% 血量，加油！`)
        this.lastHealthMilestone = 50
      } else if (percentage <= 25 && this.lastHealthMilestone === 50) {
        this.speak(`快了！${this.currentBoss.name}只剩 25% 血量！`)
        this.lastHealthMilestone = 25
      } else if (percentage <= 10 && this.lastHealthMilestone === 25) {
        this.speak(`最後衝刺！只剩 10%！`)
        this.lastHealthMilestone = 10
      }
    },

    // 結束戰鬥
    endBattle() {
      this.isBattleActive = false
      clearInterval(this.battleInterval)

      // 計算平均心率
      const heartRateStore = useHeartRateStore()
      const history = heartRateStore.heartRateHistory
      if (history.length > 0) {
        const sum = history.reduce((acc, record) => acc + record.heartRate, 0)
        this.averageHeartRate = Math.round(sum / history.length)
      }

      // 記錄戰鬥歷史
      this.battleHistory.push({
        bossId: this.currentBoss.id,
        bossName: this.currentBoss.name,
        duration: this.battleDuration,
        averageHeartRate: this.averageHeartRate,
        maxHeartRate: this.maxHeartRate,
        stars: this.earnedStars,
        timestamp: Date.now()
      })

      // 擊敗魔王後，清除保存的血量
      delete this.savedBossHealth[this.currentBoss.id]

      // 保存到 localStorage
      this.saveToStorage()

      // 語音播報勝利
      const stars = this.earnedStars
      const starText = '⭐'.repeat(stars)
      this.speak(`太棒了！擊敗${this.currentBoss.name}，用時 ${this.battleTime}，獲得 ${stars} 顆星星！${starText}`)
    },

    // 取消戰鬥（保留血量）
    cancelBattle() {
      if (this.battleInterval) {
        clearInterval(this.battleInterval)
      }

      // 保存當前魔王血量
      if (this.currentBoss && this.bossHealth > 0) {
        this.savedBossHealth[this.currentBoss.id] = this.bossHealth
        this.speak(`已保存${this.currentBoss.name}的血量，剩餘 ${Math.ceil(this.bossHealth)}%`)
      }

      this.isBattleActive = false

      // 保存到 localStorage
      this.saveToStorage()
    },

    // 語音播報
    speak(text) {
      if (!this.voiceEnabled) return

      // 檢查瀏覽器支援
      if (!('speechSynthesis' in window)) {
        console.warn('瀏覽器不支援語音播報')
        return
      }

      // 取消之前的播報
      window.speechSynthesis.cancel()

      // 建立語音
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-TW'
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      // 播報
      window.speechSynthesis.speak(utterance)
    },

    // 切換語音
    toggleVoice() {
      this.voiceEnabled = !this.voiceEnabled
    },

    // 保存狀態到 localStorage
    saveToStorage() {
      try {
        const dataToSave = {
          battleHistory: this.battleHistory,
          savedBossHealth: this.savedBossHealth,
          pendingBattle: null
        }

        // 如果正在戰鬥，保存戰鬥狀態
        if (this.isBattleActive && this.currentBoss) {
          dataToSave.pendingBattle = {
            bossId: this.currentBoss.id,
            bossHealth: this.bossHealth,
            battleDuration: this.battleDuration,
            totalDamage: this.totalDamage,
            maxHeartRate: this.maxHeartRate,
            timestamp: Date.now()
          }
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
        console.log('[Battle] 已保存遊戲狀態')
      } catch (e) {
        console.error('[Battle] 保存失敗:', e)
      }
    },

    // 恢復戰鬥（頁面重載後）
    resumeBattle() {
      if (!this.pendingBattle) return false

      const pending = this.pendingBattle
      const boss = this.bosses.find(b => b.id === pending.bossId)

      if (!boss) {
        this.pendingBattle = null
        return false
      }

      // 檢查是否過期（超過 30 分鐘不恢復）
      const timeSinceStart = Date.now() - pending.timestamp
      if (timeSinceStart > 30 * 60 * 1000) {
        this.addDebugLog('info', '戰鬥記錄已過期，不恢復')
        // 保存血量讓玩家可以繼續
        this.savedBossHealth[pending.bossId] = pending.bossHealth
        this.pendingBattle = null
        this.saveToStorage()
        return false
      }

      // 恢復戰鬥狀態
      this.currentBoss = boss
      this.bossHealth = pending.bossHealth
      this.bossMaxHealth = boss.health
      this.totalDamage = pending.totalDamage
      this.maxHeartRate = pending.maxHeartRate
      this.battleDuration = pending.battleDuration
      this.battleStartTime = Date.now() - (pending.battleDuration * 1000)
      this.isBattleActive = true
      this.lastHealthMilestone = Math.ceil(this.bossHealth / 25) * 25

      this.pendingBattle = null
      this.speak(`歡迎回來！繼續挑戰 ${boss.name}！`)
      this.startBattleLoop()

      return true
    },

    // 檢查是否有待恢復的戰鬥
    hasPendingBattle() {
      return this.pendingBattle !== null
    },

    // 清除待恢復的戰鬥（玩家選擇不恢復）
    clearPendingBattle() {
      if (this.pendingBattle) {
        // 保存血量
        this.savedBossHealth[this.pendingBattle.bossId] = this.pendingBattle.bossHealth
        this.pendingBattle = null
        this.saveToStorage()
      }
    }
  }
})
