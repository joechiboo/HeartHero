# HeartHero

基於 Spec-Driven Development (SDD) 開發的專案。

## 📋 專案狀態

- **開發階段**: 規格定義中
- **SDD 版本**: 1.0
- **最後更新**: 2025-11-11

## 🚀 快速開始

### 1. 了解 SDD 開發模式

請先閱讀 [SDD 使用指南](docs/SDD_GUIDE.md) 了解規格驅動開發的概念和流程。

### 2. 完善專案規格

#### Constitution (開發憲章)
定義「怎麼做」的原則:
- 檔案位置: `.specify/memory/constitution.md`
- 待完成:
  - [ ] 確定前端框架選擇
  - [ ] 決定是否需要後端
  - [ ] 選擇資料儲存方案
  - [ ] 補充具體的技術決策

#### Specification (產品規格)
定義「做什麼」的需求:
- 檔案位置: `.specify/memory/specification.md`
- 待完成:
  - [ ] 填寫專案願景和目標
  - [ ] 定義使用者故事
  - [ ] 詳細描述功能需求
  - [ ] 設計 UI/UX 規格
  - [ ] 設定成功指標

### 3. 開始實作

完成規格定義後,根據 Specification 開始實作開發。

## 📁 專案結構

```
HeartHero/
├── .specify/                   # SDD 規格目錄
│   └── memory/
│       ├── constitution.md     # 開發憲章
│       └── specification.md    # 產品規格
├── docs/                       # 文檔目錄
│   └── SDD_GUIDE.md           # SDD 使用指南
├── src/                        # 原始碼 (待建立)
├── tests/                      # 測試 (待建立)
└── README.md                   # 本檔案
```

## 📚 文檔

- [SDD 使用指南](docs/SDD_GUIDE.md) - 完整的 Spec Kit 使用說明
- [開發憲章](.specify/memory/constitution.md) - 專案開發原則
- [產品規格](.specify/memory/specification.md) - 專案功能需求

## 🔄 開發流程

1. **規格定義** ← 目前階段
   - 完善 Constitution
   - 完善 Specification

2. **實作開發**
   - 建立專案結構
   - 實現核心功能
   - 撰寫測試

3. **驗證與優化**
   - 功能測試
   - 效能優化
   - 程式碼審查

4. **部署與維護**
   - 準備部署
   - 持續改進

## 🎯 下一步

1. 閱讀 `docs/SDD_GUIDE.md` 了解 SDD 開發模式
2. 填寫 `.specify/memory/specification.md` 定義專案需求
3. 完善 `.specify/memory/constitution.md` 確定技術選擇
4. 開始第一階段 MVP 開發

## 📝 版本歷史

### 0.1.0 (2025-11-11)
- 初始化 SDD 專案結構
- 建立開發憲章和產品規格框架
- 撰寫 SDD 使用指南

---

**建立日期**: 2025-11-11
**專案類型**: Spec-Driven Development
