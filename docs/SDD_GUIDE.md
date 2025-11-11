# GitHub Spec Kit 使用指南

本文件整理了使用 GitHub Spec Kit 進行規格驅動開發(Spec-Driven Development, SDD)的完整流程和範本。

## 📚 目錄

- [什麼是 Spec Kit](#什麼是-spec-kit)
- [核心概念](#核心概念)
- [專案結構](#專案結構)
- [開發流程](#開發流程)
- [範本](#範本)
- [實際案例](#實際案例)
- [最佳實踐](#最佳實踐)

---

## 什麼是 Spec Kit

GitHub Spec Kit 是一個規格驅動開發工具包,幫助開發者:

- 📝 **規格優先**:先定義「做什麼」和「為什麼」,再考慮「怎麼做」
- 🤖 **AI 協作**:讓 AI 根據規格自動生成程式碼
- 📋 **系統化開發**:使用結構化的方式管理專案需求和實作
- 🔄 **迭代優化**:支援從模糊想法到完整實作的漸進式開發

### 官方資源

- GitHub Repository: https://github.com/github/spec-kit
- 官方文檔: https://github.github.com/spec-kit/
- Spec Kit 網站: https://speckit.org/

---

## 核心概念

### 1. Constitution(憲章)

專案的「開發原則」,定義:
- 技術選擇和限制
- 程式碼品質標準
- 測試和驗證要求
- 整合和部署規範

**用途**:確保整個開發過程遵循一致的原則和標準

### 2. Specification(規格)

專案的「功能需求」,描述:
- 專案願景和目標
- 使用者故事
- 功能需求
- 技術規格
- 成功指標

**用途**:清楚定義專案要做什麼,以及為什麼要做

### 3. 關注點分離

- **Constitution** = 「怎麼做」的規則
- **Specification** = 「做什麼」的需求
- **Implementation** = 實際的程式碼

---

## 專案結構

```
project-name/
├── .specify/
│   └── memory/
│       ├── constitution.md      # 開發憲章
│       └── specification.md     # 產品規格
├── src/                         # 程式碼
├── tests/                       # 測試
└── README.md
```

### 關鍵檔案

- `.specify/memory/constitution.md` - 專案開發原則和技術約束
- `.specify/memory/specification.md` - 完整的產品規格文件

---

## 開發流程

### Step 1: 初始化專案

```bash
# 方法 1: 使用 Spec Kit CLI(需要安裝)
uvx --from git+https://github.com/github/spec-kit.git specify init project-name

# 方法 2: 手動建立結構
mkdir -p project-name/.specify/memory
```

### Step 2: 撰寫 Constitution(開發憲章)

建立 `.specify/memory/constitution.md`,定義開發原則。

**必須包含**:
- 開發原則(Simplicity、Quality、Performance 等)
- 技術限制(技術棧、瀏覽器支援)
- 品質檢查點(測試、審查標準)

### Step 3: 撰寫 Specification(產品規格)

建立 `.specify/memory/specification.md`,定義功能需求。

**必須包含**:
1. 專案概述(願景、目標、非目標)
2. 使用者故事
3. 功能需求
4. 技術規格
5. UI/UX 設計
6. 成功指標
7. 實作階段

### Step 4: 實作開發

根據規格文件進行開發:
- 遵循 Constitution 定義的原則
- 實現 Specification 定義的功能
- 逐步完成各個階段

### Step 5: 驗證與測試

根據 Constitution 的品質檢查點進行驗證:
- 功能測試
- 跨瀏覽器/裝置測試
- 程式碼審查
- 效能測試

---

## 範本

### Constitution 範本

```markdown
# 專案名稱 - 專案開發憲章

## 開發原則

### 1. 簡潔優先
- 使用原生技術,避免過度工程
- 最少依賴原則
- 清晰的程式碼結構

### 2. 程式碼品質標準
- 撰寫乾淨、可讀的程式碼
- 使用有意義的變數和函式名稱
- 遵循一致的程式碼格式
- 維持關注點分離

### 3. 使用者體驗一致性
- 符合現有產品的設計風格
- 響應式設計
- 清楚的視覺回饋

### 4. 測試與驗證
- 手動測試所有使用情境
- 驗證核心邏輯
- 多裝置測試

### 5. 效能要求
- 快速回應時間
- 避免不必要的操作
- 流暢的動畫

### 6. 無障礙設計
- 語意化 HTML
- 鍵盤導航支援
- 良好的色彩對比

## 技術限制

### 必要技術棧
- HTML5
- CSS3
- JavaScript (ES6+)
- [其他技術]

### 瀏覽器支援
- 現代瀏覽器(Chrome、Firefox、Safari、Edge)
- 行動瀏覽器

## 品質檢查點

### 合併前檢查清單
- [ ] 所有功能已測試
- [ ] 響應式設計已驗證
- [ ] 程式碼已審查
- [ ] 無錯誤或警告
- [ ] 效能符合要求
```

### Specification 範本

```markdown
# 專案名稱 - 產品規格文件

## 1. 專案概述

### 願景
[描述專案的整體願景,要解決什麼問題]

### 目標
- [目標 1]
- [目標 2]
- [目標 3]

### 非目標
- [不在此專案範圍內的事項]

## 2. 使用者故事

### [使用場景 1]
**身為 [角色]**,我希望能夠:
- [需求 1]
- [需求 2]
- [需求 3]

### [使用場景 2]
**身為 [角色]**,我希望能夠:
- [需求 1]
- [需求 2]

## 3. 功能需求

### 3.1 [功能模組 1]
- [需求 1]
- [需求 2]
- [需求 3]

### 3.2 [功能模組 2]
- [需求 1]
- [需求 2]

### 3.3 [功能模組 3]
- [需求 1]
- [需求 2]

## 4. 技術規格

### 4.1 架構
```
project/
├── [檔案結構]
```

### 4.2 核心模組
- [模組 1]: [功能描述]
- [模組 2]: [功能描述]

### 4.3 資料結構
```javascript
// [資料結構範例]
```

## 5. UI/UX 設計

### 介面元件
- [元件 1]: [說明]
- [元件 2]: [說明]

### 視覺設計
- [設計原則]
- [配色方案]
- [互動效果]

## 6. 成功指標

### 質化指標
- [指標 1]
- [指標 2]

### 量化指標
- [指標 1]: [目標值]
- [指標 2]: [目標值]

## 7. 實作階段

### 階段 1: [名稱] (MVP)
- [任務 1]
- [任務 2]

### 階段 2: [名稱]
- [任務 1]
- [任務 2]

### 階段 3: [名稱]
- [任務 1]
- [任務 2]

## 8. 待決定的問題

### 待決定事項
- [ ] [問題 1]
- [ ] [問題 2]

### 假設
- [假設 1]
- [假設 2]

## 9. 未來增強功能

- [功能 1]
- [功能 2]
- [功能 3]
```

---

## 實際案例

### 井字遊戲專案

本專案使用 Spec Kit 開發了一個井字遊戲,完整展示了 SDD 流程:

#### 專案結構
```
tictactoe/
├── .specify/
│   └── memory/
│       ├── constitution.md      # 開發原則
│       └── specification.md     # 產品規格
└── index.html                   # 實作(單一檔案)
```

#### Constitution 重點
- **簡潔優先**:使用原生 JavaScript,單一 HTML 檔案
- **AI 設計哲學**:三種難度(簡單、中等、困難)
- **效能要求**:AI 移動在 100ms 內完成
- **技術限制**:純前端,無外部依賴

#### Specification 重點
- **雙模式**:vs AI 和雙人模式
- **AI 實作**:
  - 簡單:隨機移動
  - 中等:阻擋 + 策略
  - 困難:Minimax 演算法
- **分階段實作**:從 MVP 到完整功能

#### 成果
- ✅ 完整的中文規格文件
- ✅ 符合所有開發原則
- ✅ 功能完整且經過測試
- ✅ 程式碼清晰易維護

**檔案位置**:
- Constitution: `tictactoe/.specify/memory/constitution.md`
- Specification: `tictactoe/.specify/memory/specification.md`

---

## 最佳實踐

### 1. Constitution 撰寫技巧

✅ **Do(應該)**:
- 定義具體、可執行的原則
- 包含可驗證的品質標準
- 明確技術選擇的理由
- 提供檢查清單

❌ **Don't(不應該)**:
- 寫得太抽象或模糊
- 只列出工具名稱而不解釋原因
- 忽略品質驗證方式
- 過度限制創新空間

### 2. Specification 撰寫技巧

✅ **Do(應該)**:
- 從使用者角度撰寫故事
- 清楚區分「做什麼」vs「怎麼做」
- 包含具體的成功指標
- 分階段規劃實作

❌ **Don't(不應該)**:
- 過早陷入技術細節
- 混淆需求和實作
- 忽略非功能性需求
- 遺漏使用者場景

### 3. 使用 Spec Kit 的時機

**適合使用**:
- ✅ 新專案啟動
- ✅ 複雜功能開發
- ✅ 需要 AI 協作開發
- ✅ 團隊協作專案
- ✅ 需要清楚文檔的專案

**可以跳過**:
- ⚠️ 簡單的修復或微調
- ⚠️ 一次性腳本
- ⚠️ 實驗性原型(快速驗證想法)

### 4. 與 AI 協作的技巧

**有效的提示**:
```
我想使用 GitHub Spec Kit 來開發 [專案名稱]。
請幫我建立:
1. Constitution(開發憲章) - 包含開發原則和技術限制
2. Specification(產品規格) - 包含功能需求和使用者故事

專案背景:
- 目標:[描述]
- 使用者:[描述]
- 技術棧:[描述]
```

**迭代改進**:
- 先建立基本版本
- 根據討論補充細節
- 逐步完善需求
- 在實作中驗證規格

### 5. 維護規格文件

**定期更新**:
- 新功能加入時更新 Specification
- 技術決策變更時更新 Constitution
- 保持文件與實作同步

**版本控制**:
- 規格文件放入 Git
- 重大變更建立 PR 審查
- 在 Commit 訊息中引用規格

---

## 快速開始檢查清單

- [ ] 建立 `.specify/memory/` 資料夾
- [ ] 撰寫 `constitution.md`(開發原則)
- [ ] 撰寫 `specification.md`(功能需求)
- [ ] 審查規格是否完整
- [ ] 開始實作
- [ ] 根據規格驗證功能
- [ ] 更新規格(如有變更)

---

## 延伸閱讀

### 官方資源
- [Spec Kit GitHub](https://github.com/github/spec-kit)
- [Spec Kit 文檔](https://github.github.com/spec-kit/)
- [Spec-Driven Development 說明](https://github.com/github/spec-kit/blob/main/spec-driven.md)

### 相關概念
- **BDD (Behavior-Driven Development)** - 行為驅動開發
- **TDD (Test-Driven Development)** - 測試驅動開發
- **Documentation-Driven Development** - 文檔驅動開發

---

## 貢獻與回饋

如果你在使用 Spec Kit 時有任何心得或改進建議,歡迎:
- 更新此文件
- 分享你的案例
- 提供範本改進

**最後更新**:2025-11-11
**版本**:1.0
**適用專案**:HeartHero
