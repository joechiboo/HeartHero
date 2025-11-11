# HeartHero - 產品規格文件

## 1. 專案概述

### 願景
HeartHero 是一個基於 Web Bluetooth API 的即時心率監測平台，讓每個人都能輕鬆追蹤運動心率、優化訓練效果。無需安裝 App，只需打開瀏覽器即可使用專業級的心率監測功能。

**核心價值**：
- 讓心率訓練變得簡單且可及
- 幫助使用者科學化訓練，避免過度或不足
- 提供即時回饋，讓運動更安全有效

### 目標
- **即插即用**：支援所有標準 BLE 心率帶，無需配對或設定
- **即時監測**：毫秒級的心率更新，準確的區間判斷
- **科學指導**：基於年齡和訓練強度的智能心率建議
- **數據可視化**：直觀的圖表展示心率變化趨勢
- **隱私優先**：所有數據僅存於本地，不上傳雲端
- **跨平台**：支援桌面和 Android 行動裝置

### 非目標
- ❌ 不支援 iOS 設備（Safari 不支援 Web Bluetooth）
- ❌ 不提供社交分享功能
- ❌ 不整合第三方健身平台（Strava、Garmin Connect 等）
- ❌ 不支援專屬協議設備（如小米手環）
- ❌ 不提供離線模式（需要 HTTPS 連線）
- ❌ 不儲存長期歷史記錄（僅保留當日數據）

---

## 2. 使用者故事

### 主要使用者角色
- **健身愛好者**：定期運動，想要優化訓練效果的人
- **跑步愛好者**：需要監控心率以控制配速和強度
- **減重人士**：想要在燃脂心率區間訓練
- **健身教練**：需要監控學員訓練強度
- **心臟復健患者**：需要監控心率避免過度運動
- **初學者**：剛開始運動，不熟悉自己的身體狀態

### 使用場景 1: 燃脂訓練
**身為減重人士**，我希望能夠：
- 即時查看我的當前心率
- 知道我是否在燃脂心率區間（60-70% 最大心率）
- 看到心率區間的視覺化指示（顏色、進度條）
- 收到心率過高或過低的提醒

**以便**：確保我的訓練保持在最佳燃脂區間，提高減重效率

### 使用場景 2: 高強度間歇訓練（HIIT）
**身為健身愛好者**，我希望能夠：
- 快速連接心率帶，不影響訓練節奏
- 即時看到心率變化（衝刺 vs 休息）
- 查看訓練過程的心率曲線
- 了解我在不同心率區間的時間分布

**以便**：優化 HIIT 訓練效果，確保衝刺時達到目標心率

### 使用場景 3: 安全監控
**身為心臟復健患者**，我希望能夠：
- 設定危險心率閾值
- 心率超標時立即收到警示（震動 + 視覺提醒）
- 查看心率歷史，記錄訓練情況
- 導出數據給醫生查看

**以便**：在運動時保持安全，避免心率過高造成危險

### 使用場景 4: 教練指導
**身為健身教練**，我希望能夠：
- 同時監控學員的心率
- 根據訓練目標調整強度建議
- 查看學員的即時心率狀態
- 了解學員是否達到訓練目標心率

**以便**：提供更精準的訓練指導，確保學員訓練安全有效

### 使用場景 5: 跑步訓練
**身為跑步愛好者**，我希望能夠：
- 手機放在臂套中也能快速查看心率
- 大字體顯示，跑步中也能清楚看見
- 知道當前配速對應的心率區間
- 查看本次跑步的心率統計（平均、最高、最低）

**以便**：控制跑步配速，避免過度疲勞或訓練不足

---

## 3. 功能需求

### 3.1 核心功能

#### 藍牙連接管理
- **設備搜尋與配對**:
  - 支援標準 BLE Heart Rate Profile (Service UUID: 0x180D)
  - 彈出原生藍牙設備選擇器
  - 顯示設備名稱和連接狀態
  - 自動重連機制（設備斷線時）

- **連接狀態監控**:
  - 即時顯示連接/斷開狀態
  - 電池電量顯示（如設備支援）
  - 傳感器接觸檢測（確保心率帶佩戴正確）
  - 連接錯誤提示和故障排除建議

#### 即時心率監測
- **數據解析與顯示**:
  - 即時解析 Heart Rate Measurement 特徵值
  - 大字體顯示當前心率（BPM）
  - 心跳動畫效果（視覺回饋）
  - 支援 UINT8 和 UINT16 心率格式

- **心率區間分析**:
  - 基於年齡計算最大心率（220 - 年齡）
  - 六個心率區間分級：
    - 休息（0-50%）
    - 暖身（50-60%）
    - 燃脂（60-70%）
    - 有氧（70-80%）
    - 高強度（80-90%）
    - 危險（90%+）
  - 區間顏色編碼（灰/藍/綠/橙/紅/深紅）
  - 百分比進度條顯示

#### 智能提醒系統
- **危險心率警示**:
  - 心率超過 90% 最大心率時觸發
  - 視覺提醒（紅色邊框、閃爍動畫）
  - 觸覺提醒（手機震動）
  - 語音提示（可選）

- **訓練建議**:
  - 根據訓練強度評估心率是否適當
  - 四種訓練強度模式（低/中/高/極限）
  - 即時狀態回饋（過低/適當/過高/危險）

#### 歷史數據記錄
- **數據儲存**:
  - 記錄每次心率更新（時間戳 + 心率 + 區間）
  - 本地儲存（LocalStorage）
  - 每日零點自動清除（可選）
  - 最多保留 1000 條記錄

- **統計分析**:
  - 平均心率計算
  - 最高/最低心率
  - 各區間時間分布
  - RR 間隔數據（心率變異性）

### 3.2 次要功能

#### 數據可視化
- **心率曲線圖**:
  - SVG 折線圖即時繪製
  - 心率區間背景色標注
  - 數據點顏色編碼（按區間）
  - 時間軸和心率軸標籤
  - 觸控縮放（手機端）

- **區間分布圖**:
  - 各心率區間停留時間統計
  - 圓餅圖或長條圖展示
  - 百分比顯示

#### 個人化設定
- **用戶資料**:
  - 年齡設定（影響最大心率計算）
  - 性別設定（未來支援 Gulati 公式）
  - 訓練目標設定
  - 危險心率閾值自訂

- **介面設定**:
  - 深色/淺色模式切換
  - 字體大小調整
  - 單位切換（BPM/HRV）
  - 語言選擇（中/英）

#### 數據導出
- **支援格式**:
  - JSON（完整數據）
  - CSV（Excel 相容）
  - GPX（運動追蹤軟體相容）

- **導出內容**:
  - 時間戳
  - 心率值
  - 心率區間
  - 訓練強度標記

### 3.3 輔助功能

#### Debug 模式
- **開發者工具**:
  - 即時 log 顯示
  - 藍牙連接詳細訊息
  - 原始數據檢視（Flags, Byte 內容）
  - 效能監控（更新頻率）

#### 使用者指南
- **教學功能**:
  - 首次使用引導
  - 心率區間說明
  - 設備連接教學
  - 常見問題解答

#### 離線支援（未來）
- **PWA 功能**:
  - Service Worker 快取
  - 離線查看歷史數據
  - 安裝到主畫面
  - 推播通知

---

## 4. 技術規格

### 4.1 系統架構

```
HeartHero/
├── src/
│   ├── stores/
│   │   └── heartRate.js           # Pinia Store（核心狀態管理）
│   ├── components/
│   │   ├── HeartRateMonitor.vue   # 緊凑型心率卡片
│   │   ├── HeartRateChart.vue     # 心率歷史圖表
│   │   └── HeartRateSettings.vue  # 設定面板
│   ├── views/
│   │   ├── HeartRatePage.vue      # 主頁面（全螢幕監測）
│   │   └── HistoryPage.vue        # 歷史數據頁面
│   ├── utils/
│   │   ├── bluetooth.js           # Web Bluetooth 工具函式
│   │   └── heartRateCalculator.js # 心率計算工具
│   └── assets/
│       ├── styles/                # 全局樣式
│       └── icons/                 # SVG 圖標
├── public/
│   └── favicon.ico
├── docs/
│   ├── SDD_GUIDE.md              # SDD 使用指南
│   └── BLUETOOTH_INTEGRATION.md   # 藍牙整合文檔
├── .specify/
│   └── memory/
│       ├── constitution.md
│       └── specification.md
├── package.json
├── vite.config.js
└── tailwind.config.js
```

### 4.2 核心模組

#### HeartRate Store (Pinia)
- **功能**: 藍牙連接管理、心率數據處理、狀態管理
- **主要 API**:
  - `connect()`: 連接藍牙心率帶
  - `disconnect()`: 斷開連接
  - `parseHeartRateData(value)`: 解析 BLE 心率數據
  - `getHeartRateStatus(intensity)`: 根據訓練強度評估心率
  - `setUserAge(age)`: 設定用戶年齡
  - `clearHistory()`: 清除歷史記錄
  - `addDebugLog(type, message)`: 添加 Debug 日誌
- **狀態**:
  - `isConnected`: 連接狀態
  - `currentHeartRate`: 當前心率值
  - `batteryLevel`: 電池電量
  - `heartRateHistory`: 歷史記錄陣列
  - `userAge`: 用戶年齡
- **計算屬性**:
  - `maxHeartRate`: 最大心率（220 - 年齡）
  - `currentZone`: 當前心率區間
  - `heartRatePercentage`: 心率百分比
- **資料流**:
  1. 用戶點擊連接 → `connect()`
  2. Web Bluetooth API 搜尋設備
  3. GATT 連接 → 獲取 Heart Rate Service
  4. 監聽 `characteristicvaluechanged` 事件
  5. `handleHeartRateChange()` 解析數據
  6. 更新 `currentHeartRate` 狀態
  7. UI 自動響應更新

#### Web Bluetooth 整合
- **功能**: 標準 BLE Heart Rate Profile 實作
- **Service UUID**: `0x180D` (Heart Rate Service)
- **Characteristic UUID**: `0x2A37` (Heart Rate Measurement)
- **可選服務**:
  - `0x180F`: Battery Service
  - `0x180A`: Device Information
- **數據格式解析**:
  ```javascript
  Byte 0: Flags
    - Bit 0: Heart Rate Value Format (0=UINT8, 1=UINT16)
    - Bit 1-2: Sensor Contact Status
    - Bit 3: Energy Expended Present
    - Bit 4: RR-Interval Present
  Byte 1 (或 1-2): Heart Rate Value (BPM)
  Byte N+: Energy Expended (可選)
  Byte N+: RR-Intervals (可選，心率變異性)
  ```

#### UI 元件系統
- **HeartRateMonitor.vue**:
  - 緊湊型心率顯示卡片
  - 連接/斷開按鈕
  - 電池電量指示
  - 心率區間進度條
  - 危險心率警示動畫

- **HeartRateChart.vue**:
  - SVG 折線圖組件
  - 即時繪製心率曲線
  - 心率區間背景色標註
  - 統計資訊顯示

- **HeartRatePage.vue**:
  - 全螢幕主頁面
  - 大字體心率顯示
  - 浮動操作按鈕（FAB）
  - Modal 彈窗（設定、圖表、說明）

### 4.3 資料結構

```javascript
// Pinia Store 狀態結構
const heartRateStore = {
  // 設備相關
  device: BluetoothDevice | null,
  server: BluetoothRemoteGATTServer | null,
  isConnected: boolean,

  // 心率數據
  currentHeartRate: number,      // 當前心率值 (BPM)
  batteryLevel: number | null,   // 電池電量 (0-100)
  isContactDetected: boolean,    // 傳感器接觸狀態
  energyExpended: number,        // 能量消耗 (kJ)
  rrIntervals: number[],         // RR 間隔陣列 (ms)

  // 用戶設定
  userAge: number,               // 用戶年齡

  // 歷史記錄
  heartRateHistory: [
    {
      timestamp: number,         // Unix timestamp
      heartRate: number,         // 心率值
      zone: string              // 心率區間 ('rest'|'warmup'|...)
    }
  ],

  // Debug
  debugLogs: [
    {
      timestamp: string,         // 時間字串
      type: string,             // 'info'|'success'|'error'|'warning'
      message: string           // 日誌訊息
    }
  ],
  showDebug: boolean
}

// 心率區間定義
const heartRateZones = {
  rest: { min: 0, max: maxHR * 0.5, color: '#6b7280', name: '休息' },
  warmup: { min: maxHR * 0.5, max: maxHR * 0.6, color: '#3b82f6', name: '暖身' },
  fatBurn: { min: maxHR * 0.6, max: maxHR * 0.7, color: '#10b981', name: '燃脂' },
  cardio: { min: maxHR * 0.7, max: maxHR * 0.8, color: '#f59e0b', name: '有氧' },
  peak: { min: maxHR * 0.8, max: maxHR * 0.9, color: '#ef4444', name: '高強度' },
  danger: { min: maxHR * 0.9, max: maxHR * 1.1, color: '#dc2626', name: '危險' }
}
```

### 4.4 Web Bluetooth API 流程

#### 連接流程
```javascript
// 1. 請求設備
const device = await navigator.bluetooth.requestDevice({
  filters: [{ services: ['heart_rate'] }],
  optionalServices: ['battery_service']
})

// 2. 連接 GATT 伺服器
const server = await device.gatt.connect()

// 3. 獲取 Heart Rate Service
const service = await server.getPrimaryService('heart_rate')

// 4. 獲取 Heart Rate Measurement Characteristic
const characteristic = await service.getCharacteristic('heart_rate_measurement')

// 5. 啟動通知
await characteristic.startNotifications()

// 6. 監聽數據變化
characteristic.addEventListener('characteristicvaluechanged', handleChange)
```

#### 數據解析流程
```javascript
function parseHeartRateData(dataView) {
  const flags = dataView.getUint8(0)
  const is16Bit = flags & 0x01

  // 解析心率值
  const heartRate = is16Bit
    ? dataView.getUint16(1, true)  // Little Endian
    : dataView.getUint8(1)

  // 解析傳感器接觸狀態
  const contactDetected = (flags & 0x06) !== 0

  // 解析能量消耗（如存在）
  let energyExpended = null
  if (flags & 0x08) {
    energyExpended = dataView.getUint16(offset, true)
  }

  // 解析 RR 間隔（如存在）
  const rrIntervals = []
  if (flags & 0x10) {
    while (offset < dataView.byteLength) {
      rrIntervals.push(dataView.getUint16(offset, true) / 1024)
      offset += 2
    }
  }

  return { heartRate, contactDetected, energyExpended, rrIntervals }
}
```

---

## 5. UI/UX 設計

### 5.1 介面元件

#### 主要元件
- **[元件 1]**: [功能說明]
- **[元件 2]**: [功能說明]
- **[元件 3]**: [功能說明]

#### 互動元件
- **[元件 1]**: [互動說明]
- **[元件 2]**: [互動說明]

### 5.2 視覺設計

#### 設計原則
- [原則 1]
- [原則 2]
- [原則 3]

#### 配色方案
- **主色**: [待定]
- **輔助色**: [待定]
- **強調色**: [待定]
- **背景色**: [待定]
- **文字色**: [待定]

#### 字體
- **主要字體**: [待定]
- **標題字體**: [待定]
- **程式碼字體**: [待定]

### 5.3 互動效果
- **動畫時長**: 200-300ms
- **緩動函數**: ease-in-out
- **回饋方式**: [視覺/聽覺/觸覺]

### 5.4 響應式設計

#### 斷點
- **手機**: < 768px
- **平板**: 768px - 1023px
- **桌面**: ≥ 1024px

#### 適配策略
- [手機端策略]
- [平板端策略]
- [桌面端策略]

---

## 6. 成功指標

### 質化指標
- **使用者滿意度**: [如何衡量]
- **易用性**: [如何衡量]
- **穩定性**: [如何衡量]

### 量化指標
- **載入時間**: < [X]秒
- **互動響應**: < [X]ms
- **錯誤率**: < [X]%
- **使用者留存**: > [X]%

---

## 7. 實作階段

### 階段 1: MVP (最小可行產品) ⭐ 優先實作
**目標**: 建立可運作的心率監測核心功能

**功能範圍**:
- ✅ 建立專案基礎架構（Vite + Vue 3 + Pinia）
- ✅ 實作 `heartRate.js` Pinia Store
- ✅ 實作 `HeartRateMonitor.vue` 緊湊型元件
- ✅ 藍牙連接功能（搜尋、配對、連接）
- ✅ 即時心率顯示（大字體 + 區間顏色）
- ✅ 心率區間計算與顯示
- ✅ 基本錯誤處理和用戶提示

**預期成果**:
- 用戶可以連接心率帶
- 即時查看心率和區間
- 基本的視覺回饋

**必要檔案**:
1. `src/stores/heartRate.js` - 核心 Store
2. `src/components/HeartRateMonitor.vue` - 主元件
3. `src/main.js` - Vue 應用入口
4. `package.json` - 依賴管理
5. `vite.config.js` - 建置配置
6. `tailwind.config.js` - 樣式配置

**時程**: 1-2 天

---

### 階段 2: 數據可視化與歷史記錄
**目標**: 添加圖表和數據追蹤功能

**功能範圍**:
- 實作 `HeartRateChart.vue` 圖表元件
- 心率歷史記錄功能
- 統計數據顯示（平均/最高/最低）
- 數據導出功能（JSON/CSV）
- LocalStorage 持久化

**預期成果**:
- 用戶可查看心率趨勢
- 導出數據供分析使用
- 數據自動保存和恢復

**時程**: 1-2 天

---

### 階段 3: 進階功能與優化
**目標**: 完善用戶體驗，添加進階功能

**功能範圍**:
- 危險心率警示（震動 + 視覺）
- 個人化設定（年齡、訓練目標）
- Debug 模式和日誌面板
- 電池電量顯示
- 響應式設計優化

**預期成果**:
- 完整的安全監控機制
- 個人化訓練體驗
- 開發者友好的 Debug 工具

**時程**: 2-3 天

---

### 階段 4: 打磨與部署
**目標**: 產品化準備

**功能範圍**:
- 首次使用引導（Onboarding）
- 錯誤處理完善
- 效能優化（減少渲染頻率）
- 跨瀏覽器測試
- 部署到 GitHub Pages/Vercel
- 完善文檔和使用說明

**預期成果**:
- 生產環境就緒
- 完整的用戶文檔
- 自動化部署流程

**時程**: 1-2 天

---

### 總時程估計: 5-9 天
### 建議開發順序: MVP → 數據可視化 → 進階功能 → 部署

---

## 8. 待決定的問題

### 技術決策
- [ ] 前端框架選擇(React/Vue/Vanilla JS)
- [ ] 狀態管理方案
- [ ] CSS 方案(CSS Modules/Tailwind/Styled Components)
- [ ] 是否需要後端支援
- [ ] 資料持久化方案

### 功能細節
- [ ] [待確認的功能點 1]
- [ ] [待確認的功能點 2]
- [ ] [待確認的功能點 3]

### 設計細節
- [ ] 確切的視覺風格
- [ ] 互動模式
- [ ] 動畫效果細節

### 假設
- 使用者有穩定的網路連線
- 使用者使用現代瀏覽器
- [其他假設]

---

## 9. 風險與挑戰

### 技術風險
- [風險 1]: [描述與應對策略]
- [風險 2]: [描述與應對策略]

### 使用者體驗風險
- [風險 1]: [描述與應對策略]
- [風險 2]: [描述與應對策略]

---

## 10. 未來增強功能

### 短期(1-3 個月)
- [功能 1]
- [功能 2]

### 中期(3-6 個月)
- [功能 1]
- [功能 2]

### 長期(6 個月以上)
- [功能 1]
- [功能 2]

---

## 11. 參考資料

### 競品分析
- [競品 1]: [特點]
- [競品 2]: [特點]

### 技術文檔
- [相關技術文檔連結]

### 設計靈感
- [設計參考連結]

---

## 附錄

### A. 詞彙表
- **[術語 1]**: [定義]
- **[術語 2]**: [定義]

### B. 常見問題
- **Q**: [問題]
  **A**: [答案]

---

**建立日期**: 2025-11-11
**最後更新**: 2025-11-11
**版本**: 0.1.0
**狀態**: 草稿 - 待完善

## 更新日誌

### 0.1.0 (2025-11-11)
- 初始版本建立
- 建立基本框架
- 待填寫具體內容
