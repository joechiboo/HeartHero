# ❤️ HeartHero

> 基於 Web Bluetooth API 的即時心率監測平台

[![Vue 3](https://img.shields.io/badge/Vue-3.4-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Pinia](https://img.shields.io/badge/Pinia-2.1-FFD859)](https://pinia.vuejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![SDD](https://img.shields.io/badge/Development-Spec%20Driven-blue)](./.specify/memory/specification.md)

## ✨ 特色

- 🔗 **即插即用** - 支援所有標準 BLE 心率帶，無需配對
- 📊 **即時監測** - 毫秒級心率更新，準確的區間判斷
- 🎨 **視覺化** - 彩色區間、動態進度條、心跳動畫
- 🔒 **隱私優先** - 所有數據僅存於本地，不上傳雲端
- 📱 **響應式設計** - 支援桌面、平板、手機
- ⚡ **零依賴** - 純原生 Web Bluetooth API

## 🚀 快速開始

### 前置需求

- **Node.js** 18+ 和 npm
- **瀏覽器**: Chrome 56+ 或 Edge 79+（桌面或 Android）
- **協議**: HTTPS（本地開發使用 `localhost` 即可）
- **硬體**: 支援 BLE Heart Rate Profile 的心率帶
  - ✅ 推薦：Garmin HRM-Dual, Polar H10, Wahoo TICKR
  - ❌ 不支援：小米手環（專屬協議）

### 安裝與運行

```bash
# 1. 克隆專案
git clone https://github.com/yourusername/HeartHero.git
cd HeartHero

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run dev

# 4. 開啟瀏覽器
# 自動開啟 http://localhost:3000
```

### 建置生產版本

```bash
# 建置
npm run build

# 預覽建置結果
npm run preview
```

## 📋 專案狀態

- **開發階段**: MVP 完成 ✅
- **版本**: 0.1.0
- **最後更新**: 2025-11-11

## 💻 技術棧

- **前端框架**: Vue 3 (Composition API)
- **狀態管理**: Pinia
- **建置工具**: Vite
- **樣式框架**: Tailwind CSS
- **核心 API**: Web Bluetooth API
- **開發模式**: Spec-Driven Development (SDD)

## 📖 使用指南

### 1. 連接心率帶

1. 戴上支援 BLE 的心率帶
2. 打開瀏覽器訪問應用
3. 點擊「🔗 連接心率帶」按鈕
4. 在彈出的設備選擇器中選擇你的心率帶
5. 開始監測！

### 2. 查看心率數據

- **大字體顯示**: 當前心率值（BPM）
- **區間標籤**: 休息/暖身/燃脂/有氧/高強度/危險
- **進度條**: 視覺化心率區間
- **統計資訊**: 平均心率、最高心率、持續時間

### 3. 安全提醒

- 心率超過 90% 最大心率時，會顯示紅色警示
- 手機會震動提醒（如支援）
- 建議立即降低運動強度或休息

## ⚙️ 配置說明

### 設定年齡

在 HeartRateMonitor 元件中可以設定年齡，用於計算最大心率：

```javascript
heartRateStore.setUserAge(35) // 設定為 35 歲
// 最大心率 = 220 - 35 = 185 BPM
```

### 自訂心率區間

編輯 `src/stores/heartRate.js` 中的 `heartRateZones` getter：

```javascript
heartRateZones() {
  const maxHR = this.maxHeartRate
  return {
    rest: { min: 0, max: maxHR * 0.5, color: '#6b7280', name: '休息' },
    // 修改百分比或顏色...
  }
}
```

## 🎯 開發指南

### SDD 開發模式

本專案採用 Spec-Driven Development：

1. **規格定義** ✅ 已完成
   - [開發憲章](.specify/memory/constitution.md) - 技術決策和開發原則
   - [產品規格](.specify/memory/specification.md) - 功能需求和使用者故事

2. **MVP 實作** ✅ 當前階段
   - 藍牙連接和心率監測
   - 心率區間分析
   - 基本 UI 元件

3. **下一階段** 🔜
   - 數據可視化（圖表）
   - 歷史記錄頁面
   - 個人化設定
   - 家庭互動模式（語音播報、任務卡）

## 📁 專案結構

```
HeartHero/
├── .specify/                   # SDD 規格目錄
│   └── memory/
│       ├── constitution.md     # 開發憲章（技術決策）
│       └── specification.md    # 產品規格（功能需求）
├── docs/                       # 文檔
│   └── SDD_GUIDE.md           # SDD 完整使用指南
├── src/
│   ├── stores/
│   │   └── heartRate.js       # 核心 Pinia Store（藍牙、心率邏輯）
│   ├── components/
│   │   └── HeartRateMonitor.vue  # 主要心率監測元件
│   ├── views/                 # 頁面元件
│   ├── assets/
│   │   └── style.css          # Tailwind CSS 入口
│   ├── App.vue                # 根組件
│   └── main.js                # 應用入口
├── public/                     # 靜態資源
├── index.html                  # HTML 模板
├── vite.config.js             # Vite 配置
├── tailwind.config.js         # Tailwind 配置
└── package.json               # 依賴管理
```

## 📚 文檔

- [SDD 使用指南](docs/SDD_GUIDE.md) - 完整的 Spec Kit 使用說明
- [開發憲章](.specify/memory/constitution.md) - 專案開發原則
- [產品規格](.specify/memory/specification.md) - 專案功能需求

## 🐛 常見問題

### Q: 找不到我的心率帶？

**A**: 檢查以下項目：
- 心率帶是否已開啟並有電
- 是否已與其他應用斷開連接
- 設備是否支援標準 BLE Heart Rate Profile
- 使用 Chrome 或 Edge 瀏覽器

### Q: iOS Safari 可以使用嗎？

**A**: ❌ 不可以。Apple 尚未在 iOS Safari 實作 Web Bluetooth API。

**替代方案**：
- 使用 Android 設備
- 使用桌面版 Chrome/Edge

### Q: 連接後立即斷開？

**A**: 可能原因：
- 設備超出藍牙範圍（保持在 10 米內）
- 設備電量不足
- 瀏覽器標籤頁進入後台（保持前台運行）

### Q: 數據會上傳到伺服器嗎？

**A**: ❌ 不會。所有數據僅儲存在瀏覽器 LocalStorage，不會上傳到任何伺服器。

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 🔗 相關資源

- [Web Bluetooth API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [Heart Rate Service Specification](https://www.bluetooth.com/specifications/specs/heart-rate-service-1-0/)
- [SDD 開發指南](docs/SDD_GUIDE.md)

## 📝 版本歷史

### 0.1.0 (2025-11-11)

✅ **SDD 規格完成**
- 初始化 SDD 專案結構
- 完整的開發憲章（技術決策）
- 完整的產品規格（6 種使用者場景）
- 家庭互動模式設計（未來功能）

✅ **MVP 完成**
- Vue 3 + Pinia + Tailwind CSS 專案架構
- Web Bluetooth 完整整合
- 即時心率監測和區間分析
- HeartRateMonitor 元件（完整 UI）
- 危險心率警示（震動 + 視覺）
- Debug 日誌系統
- 統計數據顯示

🔜 **下一階段**
- 數據可視化（圖表）
- 歷史記錄頁面
- 語音播報系統

---

**建立日期**: 2025-11-11
**專案類型**: Spec-Driven Development
**授權**: MIT License
