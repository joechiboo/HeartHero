import { defineStore } from 'pinia'

export const useHeartRateStore = defineStore('heartRate', {
  state: () => ({
    // 藍牙設備相關
    device: null,
    server: null,
    isConnected: false,

    // 心率數據
    currentHeartRate: 0,
    batteryLevel: null,
    isContactDetected: false,
    energyExpended: 0,
    rrIntervals: [],

    // 用戶設定
    userAge: 30,

    // 歷史記錄
    heartRateHistory: [],

    // Debug
    debugLogs: [],
    showDebug: false,

    // 模擬模式
    isSimulationMode: false,
    simulationTimer: null
  }),

  getters: {
    // 計算最大心率（220 - 年齡）
    maxHeartRate: (state) => 220 - state.userAge,

    // 心率區間定義
    heartRateZones() {
      const maxHR = this.maxHeartRate
      return {
        rest: {
          min: 0,
          max: maxHR * 0.5,
          color: '#6b7280',
          bgColor: 'bg-hr-rest',
          name: '休息'
        },
        warmup: {
          min: maxHR * 0.5,
          max: maxHR * 0.6,
          color: '#3b82f6',
          bgColor: 'bg-hr-warmup',
          name: '暖身'
        },
        fatBurn: {
          min: maxHR * 0.6,
          max: maxHR * 0.7,
          color: '#10b981',
          bgColor: 'bg-hr-fatburn',
          name: '燃脂'
        },
        cardio: {
          min: maxHR * 0.7,
          max: maxHR * 0.8,
          color: '#f59e0b',
          bgColor: 'bg-hr-cardio',
          name: '有氧'
        },
        peak: {
          min: maxHR * 0.8,
          max: maxHR * 0.9,
          color: '#ef4444',
          bgColor: 'bg-hr-peak',
          name: '高強度'
        },
        danger: {
          min: maxHR * 0.9,
          max: maxHR * 1.1,
          color: '#dc2626',
          bgColor: 'bg-hr-danger',
          name: '危險'
        }
      }
    },

    // 當前心率區間
    currentZone() {
      const hr = this.currentHeartRate
      const zones = this.heartRateZones

      for (const [key, zone] of Object.entries(zones)) {
        if (hr >= zone.min && hr < zone.max) {
          return key
        }
      }
      return 'rest'
    },

    // 當前區間的顯示資訊
    currentZoneInfo() {
      const zone = this.currentZone
      return this.heartRateZones[zone]
    },

    // 當前區間名稱
    currentZoneName() {
      return this.currentZoneInfo.name
    },

    // 心率百分比（相對於最大心率）
    heartRatePercentage() {
      return Math.min(Math.round((this.currentHeartRate / this.maxHeartRate) * 100), 100)
    }
  },

  actions: {
    // 連接藍牙心率帶
    async connect() {
      try {
        this.addDebugLog('info', '開始搜尋藍牙設備...')

        // 檢查瀏覽器支援
        if (!navigator.bluetooth) {
          throw new Error('此瀏覽器不支援 Web Bluetooth API')
        }

        // 請求設備
        this.device = await navigator.bluetooth.requestDevice({
          filters: [{ services: ['heart_rate'] }],
          optionalServices: ['battery_service']
        })

        this.addDebugLog('success', `已選擇設備: ${this.device.name}`)

        // 監聽斷開事件
        this.device.addEventListener('gattserverdisconnected', this.handleDisconnect)

        // 連接 GATT Server
        this.server = await this.device.gatt.connect()
        this.addDebugLog('success', '已連接 GATT Server')

        // 獲取 Heart Rate Service
        const service = await this.server.getPrimaryService('heart_rate')
        this.addDebugLog('success', '已獲取 Heart Rate Service')

        // 獲取 Heart Rate Measurement Characteristic
        const characteristic = await service.getCharacteristic('heart_rate_measurement')

        // 啟動通知
        await characteristic.startNotifications()
        this.addDebugLog('success', '已啟動心率通知')

        // 監聽心率變化
        characteristic.addEventListener('characteristicvaluechanged', this.handleHeartRateChange)

        this.isConnected = true
        this.addDebugLog('success', '✅ 連接成功！')

        // 嘗試獲取電池電量（可選）
        this.getBatteryLevel()

      } catch (error) {
        this.addDebugLog('error', `連接失敗: ${error.message}`)
        throw error
      }
    },

    // 斷開連接
    disconnect() {
      if (this.device && this.device.gatt.connected) {
        this.device.gatt.disconnect()
      }
      this.isConnected = false
      this.currentHeartRate = 0
      this.addDebugLog('info', '已斷開連接')
    },

    // 處理斷開事件
    handleDisconnect() {
      this.isConnected = false
      this.currentHeartRate = 0
      this.addDebugLog('warning', '設備已斷開')
    },

    // 處理心率數據變化
    handleHeartRateChange(event) {
      const value = event.target.value
      const flags = value.getUint8(0)

      // 解析心率值格式
      const is16Bit = flags & 0x01
      const heartRate = is16Bit
        ? value.getUint16(1, true)  // Little Endian
        : value.getUint8(1)

      // 更新當前心率
      this.currentHeartRate = heartRate

      // 解析傳感器接觸狀態
      this.isContactDetected = (flags & 0x06) !== 0

      // 解析能量消耗（如存在）
      let offset = is16Bit ? 3 : 2
      if (flags & 0x08) {
        this.energyExpended = value.getUint16(offset, true)
        offset += 2
      }

      // 解析 RR 間隔（如存在）
      if (flags & 0x10) {
        const intervals = []
        while (offset < value.byteLength) {
          const rr = value.getUint16(offset, true)
          intervals.push(rr / 1024) // 轉換為秒
          offset += 2
        }
        this.rrIntervals = intervals
      }

      // 記錄歷史
      this.addToHistory(heartRate)

      // Debug log
      if (this.showDebug) {
        this.addDebugLog('info', `心率: ${heartRate} BPM | 區間: ${this.currentZoneName}`)
      }
    },

    // 添加到歷史記錄
    addToHistory(heartRate) {
      const now = Date.now()
      const lastRecord = this.heartRateHistory[this.heartRateHistory.length - 1]

      // 每 3 秒記錄一次（避免數據過多）
      if (!lastRecord || now - lastRecord.timestamp > 3000) {
        this.heartRateHistory.push({
          timestamp: now,
          heartRate: heartRate,
          zone: this.currentZone
        })

        // 限制歷史記錄數量（最多 1000 條）
        if (this.heartRateHistory.length > 1000) {
          this.heartRateHistory.shift()
        }
      }
    },

    // 獲取電池電量
    async getBatteryLevel() {
      try {
        const service = await this.server.getPrimaryService('battery_service')
        const characteristic = await service.getCharacteristic('battery_level')
        const value = await characteristic.readValue()
        this.batteryLevel = value.getUint8(0)
        this.addDebugLog('success', `電池電量: ${this.batteryLevel}%`)
      } catch (error) {
        // 設備不支援電池服務（忽略錯誤）
        this.addDebugLog('info', '設備不支援電池電量顯示')
      }
    },

    // 設定用戶年齡
    setUserAge(age) {
      if (age >= 10 && age <= 100) {
        this.userAge = age
        this.addDebugLog('info', `已設定年齡: ${age} 歲，最大心率: ${this.maxHeartRate} BPM`)
      }
    },

    // 清除歷史記錄
    clearHistory() {
      this.heartRateHistory = []
      this.addDebugLog('info', '已清除歷史記錄')
    },

    // 根據訓練強度評估心率狀態
    getHeartRateStatus(trainingIntensity = 'medium') {
      const targetZones = {
        low: ['rest', 'warmup'],
        medium: ['fatBurn', 'cardio'],
        high: ['cardio', 'peak'],
        extreme: ['peak']
      }

      const targetZoneKeys = targetZones[trainingIntensity] || ['fatBurn', 'cardio']
      const currentZone = this.currentZone

      if (currentZone === 'danger') {
        return {
          status: 'danger',
          message: '⚠️ 心率過高，請立即休息',
          color: '#dc2626'
        }
      }

      if (targetZoneKeys.includes(currentZone)) {
        return {
          status: 'good',
          message: `✅ ${this.currentZoneName}區間，很好`,
          color: '#10b981'
        }
      }

      if (currentZone === 'rest') {
        return {
          status: 'low',
          message: '💤 心率偏低，可以加強運動強度',
          color: '#6b7280'
        }
      }

      return {
        status: 'warning',
        message: '⚡ 請調整運動強度',
        color: '#f59e0b'
      }
    },

    // 添加 Debug 日誌
    addDebugLog(type, message) {
      const log = {
        timestamp: new Date().toLocaleTimeString('zh-TW'),
        type: type, // 'info' | 'success' | 'error' | 'warning'
        message: message
      }
      this.debugLogs.push(log)

      // 限制日誌數量
      if (this.debugLogs.length > 100) {
        this.debugLogs.shift()
      }
    },

    // 切換 Debug 模式
    toggleDebug() {
      this.showDebug = !this.showDebug
    },

    // 啟動模擬模式
    startSimulation() {
      this.isSimulationMode = true
      this.isConnected = true
      this.isContactDetected = true
      this.batteryLevel = 85
      this.addDebugLog('success', '✅ 已啟動模擬模式')

      // 模擬心率變化（每秒更新一次）
      let baseHeartRate = 70
      let trend = 1 // 1: 上升, -1: 下降

      this.simulationTimer = setInterval(() => {
        // 隨機波動 ±5
        const randomChange = Math.floor(Math.random() * 11) - 5
        baseHeartRate += randomChange * 0.5

        // 趨勢變化
        baseHeartRate += trend

        // 限制範圍（60-180）
        if (baseHeartRate > 180) {
          baseHeartRate = 180
          trend = -1
        } else if (baseHeartRate < 60) {
          baseHeartRate = 60
          trend = 1
        }

        // 隨機改變趨勢
        if (Math.random() < 0.1) {
          trend = Math.random() < 0.5 ? 1 : -1
        }

        // 更新心率
        this.currentHeartRate = Math.round(baseHeartRate)

        // 記錄歷史
        this.addToHistory(this.currentHeartRate)

        // Debug log
        if (this.showDebug) {
          this.addDebugLog('info', `模擬心率: ${this.currentHeartRate} BPM | 區間: ${this.currentZoneName}`)
        }
      }, 1000)
    },

    // 停止模擬模式
    stopSimulation() {
      if (this.simulationTimer) {
        clearInterval(this.simulationTimer)
        this.simulationTimer = null
      }
      this.isSimulationMode = false
      this.isConnected = false
      this.currentHeartRate = 0
      this.addDebugLog('info', '已停止模擬模式')
    }
  }
})
