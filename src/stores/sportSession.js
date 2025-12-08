import { defineStore } from 'pinia'
import { useHeartRateStore } from './heartRate'

/**
 * Sport Session Store
 * 運動日誌模式 - 背景記錄心率 + 自動回合偵測
 */

// IndexedDB 配置
const DB_NAME = 'hearthero_sport_sessions'
const DB_VERSION = 1
const STORE_NAME = 'sessions'

// 回合偵測閾值
const ACTIVE_THRESHOLD = 120  // HR > 120 判定上場
const REST_THRESHOLD = 100    // HR < 100 判定下場
const ACTIVE_DEBOUNCE = 30    // 持續 30 秒確認上場
const REST_DEBOUNCE = 60      // 持續 60 秒確認下場

// 運動類型
const SPORT_TYPES = {
  basketball: { name: '籃球', emoji: '🏀' },
  cycling: { name: '騎車', emoji: '🚴' },
  swimming: { name: '游泳', emoji: '🏊' },
  hiking: { name: '健行', emoji: '🥾' },
  running: { name: '跑步', emoji: '🏃' },
  other: { name: '其他', emoji: '💪' }
}

// 心率區間定義（與 battle.js 保持一致）
const HR_ZONES = {
  rest: { min: 0, max: 60, name: '休息', color: 'gray' },
  warmup: { min: 60, max: 80, name: '輕鬆', color: 'blue' },
  fatBurn: { min: 80, max: 100, name: '適中', color: 'green' },
  cardio: { min: 100, max: 120, name: '有氧', color: 'yellow' },
  peak: { min: 120, max: 140, name: '高強度', color: 'orange' },
  danger: { min: 140, max: Infinity, name: '極限', color: 'red' }
}

/**
 * 開啟 IndexedDB 連線
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('[SportSession] IndexedDB 開啟失敗:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // 建立 sessions store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('sport', 'sport', { unique: false })
        store.createIndex('startTime', 'startTime', { unique: false })
        console.log('[SportSession] IndexedDB store 已建立')
      }
    }
  })
}

/**
 * 產生 UUID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 計算心率所在區間
 */
function getHeartRateZone(hr) {
  if (hr < 60) return 'rest'
  if (hr < 80) return 'warmup'
  if (hr < 100) return 'fatBurn'
  if (hr < 120) return 'cardio'
  if (hr < 140) return 'peak'
  return 'danger'
}

export const useSportSessionStore = defineStore('sportSession', {
  state: () => ({
    // 當前 session
    currentSession: null,
    isRecording: false,
    recordingStartTime: null,
    elapsedSeconds: 0, // 響應式的經過秒數

    // 回合偵測狀態機
    roundState: 'idle', // 'idle' | 'maybe_active' | 'active' | 'maybe_rest' | 'rest'
    stateStartTime: null,
    stateCounter: 0,  // 用於 debounce 計數

    // 當前回合
    currentRound: null,
    currentRoundStartTime: null,
    currentRoundSamples: [],

    // 歷史記錄（快取）
    sessionHistory: [],
    historyLoaded: false,

    // 記錄間隔 ID
    recordingInterval: null,

    // 運動類型選項
    sportTypes: SPORT_TYPES,
    hrZones: HR_ZONES
  }),

  getters: {
    // 當前記錄時長（秒）- 使用響應式的 elapsedSeconds
    recordingDuration() {
      return this.elapsedSeconds
    },

    // 格式化記錄時長
    formattedDuration() {
      const seconds = this.elapsedSeconds
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    },

    // 當前 session 的取樣數量
    sampleCount() {
      return this.currentSession?.samples?.length || 0
    },

    // 當前 session 的回合數量
    roundCount() {
      return this.currentSession?.rounds?.length || 0
    },

    // 回合狀態顯示文字
    roundStateText() {
      const stateMap = {
        idle: '待機',
        maybe_active: '偵測中（上場？）',
        active: '🏃 上場中',
        maybe_rest: '偵測中（休息？）',
        rest: '😮‍💨 休息中'
      }
      return stateMap[this.roundState] || '未知'
    },

    // 回合狀態顏色
    roundStateColor() {
      const colorMap = {
        idle: 'gray',
        maybe_active: 'yellow',
        active: 'green',
        maybe_rest: 'yellow',
        rest: 'blue'
      }
      return colorMap[this.roundState] || 'gray'
    }
  },

  actions: {
    /**
     * 開始記錄運動
     */
    async startRecording(sportType = 'basketball') {
      if (this.isRecording) {
        console.warn('[SportSession] 已在記錄中')
        return false
      }

      const now = Date.now()

      // 建立新 session
      this.currentSession = {
        id: generateUUID(),
        sport: sportType,
        startTime: new Date(now).toISOString(),
        endTime: null,
        duration: 0,
        samples: [],
        rounds: [],
        summary: null
      }

      this.isRecording = true
      this.recordingStartTime = now
      this.roundState = 'idle'
      this.stateStartTime = now
      this.stateCounter = 0
      this.currentRound = null
      this.currentRoundStartTime = null
      this.currentRoundSamples = []

      console.log(`[SportSession] 開始記錄 ${SPORT_TYPES[sportType].name}`)

      // 開始每秒取樣
      this.recordingInterval = setInterval(() => {
        this.recordSample()
      }, 1000)

      return true
    },

    /**
     * 記錄一筆心率取樣
     */
    recordSample() {
      if (!this.isRecording || !this.currentSession) return

      // 更新經過秒數（響應式）
      if (this.recordingStartTime) {
        this.elapsedSeconds = Math.floor((Date.now() - this.recordingStartTime) / 1000)
      }

      const heartRateStore = useHeartRateStore()
      const hr = heartRateStore.currentHeartRate

      if (hr <= 0) return // 無效心率，跳過

      const now = Date.now()
      const sample = {
        timestamp: now,
        hr: hr
      }

      // 加入取樣
      this.currentSession.samples.push(sample)

      // 更新回合偵測狀態機
      this.updateRoundState(hr, now)
    },

    /**
     * 回合偵測狀態機
     */
    updateRoundState(hr, timestamp) {
      const prevState = this.roundState

      switch (this.roundState) {
        case 'idle':
          // 等待開始
          if (hr > ACTIVE_THRESHOLD) {
            this.roundState = 'maybe_active'
            this.stateStartTime = timestamp
            this.stateCounter = 1
          }
          break

        case 'maybe_active':
          // 可能上場，等待確認
          if (hr > ACTIVE_THRESHOLD) {
            this.stateCounter++
            if (this.stateCounter >= ACTIVE_DEBOUNCE) {
              // 確認上場
              this.roundState = 'active'
              this.startNewRound('active', this.stateStartTime)
            }
          } else {
            // 跌回 idle
            this.roundState = 'idle'
            this.stateCounter = 0
          }
          break

        case 'active':
          // 上場中
          this.currentRoundSamples.push({ timestamp, hr })

          if (hr < REST_THRESHOLD) {
            this.roundState = 'maybe_rest'
            this.stateStartTime = timestamp
            this.stateCounter = 1
          }
          break

        case 'maybe_rest':
          // 可能下場，等待確認
          this.currentRoundSamples.push({ timestamp, hr })

          if (hr < REST_THRESHOLD) {
            this.stateCounter++
            if (this.stateCounter >= REST_DEBOUNCE) {
              // 確認下場，結束當前上場回合
              this.endCurrentRound(this.stateStartTime)
              // 開始休息回合
              this.roundState = 'rest'
              this.startNewRound('rest', this.stateStartTime)
            }
          } else if (hr > ACTIVE_THRESHOLD) {
            // 回到上場
            this.roundState = 'active'
            this.stateCounter = 0
          }
          break

        case 'rest':
          // 休息中
          this.currentRoundSamples.push({ timestamp, hr })

          if (hr > ACTIVE_THRESHOLD) {
            this.roundState = 'maybe_active'
            this.stateStartTime = timestamp
            this.stateCounter = 1
            // 結束休息回合
            this.endCurrentRound(timestamp)
          }
          break
      }

      // 狀態變化 log
      if (prevState !== this.roundState) {
        console.log(`[SportSession] 狀態變化: ${prevState} → ${this.roundState}`)
      }
    },

    /**
     * 開始新回合
     */
    startNewRound(type, startTime) {
      this.currentRound = {
        type: type,
        startTime: startTime,
        endTime: null,
        duration: 0,
        avgHR: 0,
        maxHR: 0,
        minHR: Infinity,
        recoveryRate: null // 僅用於 rest 回合
      }
      this.currentRoundStartTime = startTime
      this.currentRoundSamples = []

      console.log(`[SportSession] 開始 ${type === 'active' ? '上場' : '休息'} 回合`)
    },

    /**
     * 結束當前回合
     */
    endCurrentRound(endTime) {
      if (!this.currentRound) return

      this.currentRound.endTime = endTime
      this.currentRound.duration = Math.floor((endTime - this.currentRound.startTime) / 1000)

      // 計算統計
      if (this.currentRoundSamples.length > 0) {
        const hrs = this.currentRoundSamples.map(s => s.hr)
        this.currentRound.avgHR = Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length)
        this.currentRound.maxHR = Math.max(...hrs)
        this.currentRound.minHR = Math.min(...hrs)

        // 計算恢復力（僅用於休息回合）
        if (this.currentRound.type === 'rest' && this.currentRoundSamples.length >= 60) {
          const firstMinuteHR = this.currentRoundSamples.slice(0, 60).map(s => s.hr)
          const startHR = firstMinuteHR[0]
          const endHR = firstMinuteHR[firstMinuteHR.length - 1]
          this.currentRound.recoveryRate = startHR - endHR
        }
      }

      // 加入回合列表
      this.currentSession.rounds.push({ ...this.currentRound })

      console.log(`[SportSession] 結束 ${this.currentRound.type === 'active' ? '上場' : '休息'} 回合，時長 ${this.currentRound.duration} 秒`)

      this.currentRound = null
      this.currentRoundSamples = []
    },

    /**
     * 停止記錄並計算摘要
     */
    async stopRecording() {
      if (!this.isRecording || !this.currentSession) {
        console.warn('[SportSession] 沒有進行中的記錄')
        return null
      }

      // 停止計時器
      if (this.recordingInterval) {
        clearInterval(this.recordingInterval)
        this.recordingInterval = null
      }

      const now = Date.now()

      // 結束當前回合（如果有）
      if (this.currentRound) {
        this.endCurrentRound(now)
      }

      // 完成 session
      this.currentSession.endTime = new Date(now).toISOString()
      this.currentSession.duration = Math.floor((now - this.recordingStartTime) / 1000)

      // 計算摘要
      this.currentSession.summary = this.calculateSummary()

      // 儲存到 IndexedDB
      await this.saveSession(this.currentSession)

      // 加入歷史快取
      this.sessionHistory.unshift({ ...this.currentSession })

      const completedSession = { ...this.currentSession }

      // 重置狀態
      this.isRecording = false
      this.recordingStartTime = null
      this.elapsedSeconds = 0
      this.roundState = 'idle'
      this.currentSession = null

      console.log('[SportSession] 記錄完成，已儲存')

      return completedSession
    },

    /**
     * 計算統計摘要
     */
    calculateSummary() {
      const samples = this.currentSession.samples
      const rounds = this.currentSession.rounds

      if (samples.length === 0) {
        return {
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
      }

      const hrs = samples.map(s => s.hr)

      // 基本統計
      const avgHR = Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length)
      const maxHR = Math.max(...hrs)
      const minHR = Math.min(...hrs)

      // 區間分布（秒數）
      const zones = {
        rest: 0,
        warmup: 0,
        fatBurn: 0,
        cardio: 0,
        peak: 0,
        danger: 0
      }

      samples.forEach(s => {
        const zone = getHeartRateZone(s.hr)
        zones[zone]++
      })

      // 回合統計
      const activeRounds = rounds.filter(r => r.type === 'active')
      const restRounds = rounds.filter(r => r.type === 'rest')

      const activeTime = activeRounds.reduce((sum, r) => sum + r.duration, 0)
      const restTime = restRounds.reduce((sum, r) => sum + r.duration, 0)
      const longestActive = activeRounds.length > 0
        ? Math.max(...activeRounds.map(r => r.duration))
        : 0
      const avgRoundDuration = activeRounds.length > 0
        ? Math.round(activeTime / activeRounds.length)
        : 0

      // 平均恢復力
      const recoveryRates = restRounds
        .filter(r => r.recoveryRate !== null && r.recoveryRate > 0)
        .map(r => r.recoveryRate)
      const avgRecoveryRate = recoveryRates.length > 0
        ? Math.round(recoveryRates.reduce((a, b) => a + b, 0) / recoveryRates.length)
        : 0

      // 估算卡路里（簡化公式：基於心率和時間）
      // 公式：calories = duration(min) * (0.6309 * avgHR - 30.4) / 4.184
      const durationMin = this.currentSession.duration / 60
      const calories = Math.round(durationMin * (0.6309 * avgHR - 30.4) / 4.184)

      return {
        avgHR,
        maxHR,
        minHR,
        zones,
        totalRounds: activeRounds.length,
        activeTime,
        restTime,
        longestActive,
        avgRoundDuration,
        avgRecoveryRate,
        calories: Math.max(0, calories)
      }
    },

    /**
     * 儲存 session 到 IndexedDB
     */
    async saveSession(session) {
      try {
        const db = await openDatabase()
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)

        return new Promise((resolve, reject) => {
          const request = store.put(session)

          request.onsuccess = () => {
            console.log('[SportSession] 已儲存到 IndexedDB')
            resolve(true)
          }

          request.onerror = () => {
            console.error('[SportSession] 儲存失敗:', request.error)
            reject(request.error)
          }
        })
      } catch (error) {
        console.error('[SportSession] 資料庫錯誤:', error)
        throw error
      }
    },

    /**
     * 載入歷史記錄
     */
    async loadHistory() {
      if (this.historyLoaded) return this.sessionHistory

      try {
        const db = await openDatabase()
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const index = store.index('startTime')

        return new Promise((resolve, reject) => {
          const request = index.openCursor(null, 'prev') // 最新的在前面
          const sessions = []

          request.onsuccess = (event) => {
            const cursor = event.target.result
            if (cursor) {
              sessions.push(cursor.value)
              cursor.continue()
            } else {
              this.sessionHistory = sessions
              this.historyLoaded = true
              console.log(`[SportSession] 已載入 ${sessions.length} 筆歷史記錄`)
              resolve(sessions)
            }
          }

          request.onerror = () => {
            console.error('[SportSession] 載入歷史失敗:', request.error)
            reject(request.error)
          }
        })
      } catch (error) {
        console.error('[SportSession] 資料庫錯誤:', error)
        return []
      }
    },

    /**
     * 取得單一 session
     */
    async getSession(sessionId) {
      try {
        const db = await openDatabase()
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)

        return new Promise((resolve, reject) => {
          const request = store.get(sessionId)

          request.onsuccess = () => {
            resolve(request.result || null)
          }

          request.onerror = () => {
            reject(request.error)
          }
        })
      } catch (error) {
        console.error('[SportSession] 取得 session 失敗:', error)
        return null
      }
    },

    /**
     * 刪除 session
     */
    async deleteSession(sessionId) {
      try {
        const db = await openDatabase()
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)

        return new Promise((resolve, reject) => {
          const request = store.delete(sessionId)

          request.onsuccess = () => {
            // 從快取中移除
            this.sessionHistory = this.sessionHistory.filter(s => s.id !== sessionId)
            console.log('[SportSession] 已刪除 session:', sessionId)
            resolve(true)
          }

          request.onerror = () => {
            reject(request.error)
          }
        })
      } catch (error) {
        console.error('[SportSession] 刪除失敗:', error)
        return false
      }
    },

    /**
     * 清除所有記錄（謹慎使用）
     */
    async clearAllSessions() {
      try {
        const db = await openDatabase()
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)

        return new Promise((resolve, reject) => {
          const request = store.clear()

          request.onsuccess = () => {
            this.sessionHistory = []
            console.log('[SportSession] 已清除所有記錄')
            resolve(true)
          }

          request.onerror = () => {
            reject(request.error)
          }
        })
      } catch (error) {
        console.error('[SportSession] 清除失敗:', error)
        return false
      }
    },

    /**
     * 取消記錄（不儲存）
     */
    cancelRecording() {
      if (this.recordingInterval) {
        clearInterval(this.recordingInterval)
        this.recordingInterval = null
      }

      this.isRecording = false
      this.recordingStartTime = null
      this.elapsedSeconds = 0
      this.roundState = 'idle'
      this.currentSession = null
      this.currentRound = null
      this.currentRoundSamples = []

      console.log('[SportSession] 記錄已取消')
    },

    /**
     * 格式化秒數為時間字串
     */
    formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    },

    /**
     * 格式化日期
     */
    formatDate(isoString) {
      const date = new Date(isoString)
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
})
