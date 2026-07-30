# 新华Hub 产品知识索引（PRODUCT_KNOWLEDGE_INDEX）

> **目的**：建立新华Hub 产品知识地图，让 AI 无需逐个翻 10 个 HTML 即可回答「某产品为什么这样显示」。
> **数据来源**：各 `calculator-*.html` 的 `<title>`、交费选项、`product-rules.js` 配置、脚本引用（`*_calcdata.js` / `data_*.json`）。**纯整理，未修改任何代码。**
> **生成日期**：2026-07-30。

---

## 0. 速查总表（10 款）

| # | 产品名称 | key | 产品类型 | 交费方式 | 分红 | 展示收益率 | 储备期规则来源 | HTML 文件 | 数据文件 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 盈满鑫 | yingmanxin | 两全保险 | 3年交 / 5年交 | 是 | 是 | product-rules.js · payterm(=交费期) | calculator-yingmanxin.html | 内嵌（data_yingmanxin.json） |
| 2 | 宏御世家 | hongyu | 终身寿险 | 3/5/10年交 / 趸交 | 是 | 是 | product-rules.js · fixed 5 | calculator-hongyu.html | 内嵌（hongyu_data.json） |
| 3 | 宏安世家 | hongan | 理财计划 | 3/5/10年交 / 趸交 | 是 | 是 | product-rules.js · fixed 5 | calculator-hongan.html | 内嵌（data_hongan.json） |
| 4 | 宏泰世家 | hongtai | 世家（分红型） | 3/5/10年交 | 是 | 是 | product-rules.js · fixed 5 | calculator-hongtai.html | 外部（hongtai_full.json / hongtai_calc_data.json，fetch） |
| 5 | 宏愿人生 | hongyuan | 养老年金 | 3/5/10年交 / 趸交 | 是 | 是 | product-rules.js · fixed 5 | calculator-hongyuan.html | 内嵌（data_hongyuan.json） |
| 6 | 宏禧来 | hongxilai | 理财计划 | 趸交 | 是 | 是 | product-rules.js · dynamic(rate<=0) | calculator-hongxilai.html | 内嵌（data_hongxilai.json） |
| 7 | 华彩鎏金 | huacai | 年金保险 | 3/5/10年交 / 趸交 | 是 | **否（显示「-」）** | product-rules.js · fixed 5, showRate=false | calculator-huacai.html | 内嵌 |
| 8 | 宏坤人生 | hongkun | 养老年金保险 | 3/5/10年交 / 趸交 | 否 | **否（显示「-」）** | product-rules.js · fixed 5, showRate=false | calculator-hongkun.html | 外部（hongkun_calcdata.js） |
| 9 | 福盛世家 | fusheng | 终身寿险 | 3/5/10年交 | 否 | 本地逻辑 | **本地逻辑**（calculator 内 reserveYears=5，不进规则层） | calculator-fusheng.html | 外部（fusheng_calcdata.js） |
| 10 | 恒享人生 | hengxiang | 年金保险 | 3/5/10年交 | 否 | **无收益率概念** | **无储备期体系** | calculator-hengxiang.html | 外部（hengxiang_calcdata.js） |

> 图例：「展示收益率」指**储备期结束后页面是否展示收益率数值**：✅ 展示；❌ 展示「-」（showRate=false）；福盛世家为本地逻辑；恒享无此概念。

---

## 1. 逐产品明细

### 1.1 盈满鑫（yingmanxin）
- **类型**：两全保险（分红型）｜**交费**：3年交 / 5年交｜**分红**：是
- **展示收益率**：是（储备期后展示）
- **储备期规则来源**：`product-rules.js` → `reserveType:"payterm"`，储备期 **= 交费期**（3年交→储备3年，5年交→储备5年）
- **数据文件**：HTML 内嵌（源 `data_yingmanxin.json`）
- **为什么这样显示**：储备期年数随交费方式变化，不写死；盈满鑫是规则层中唯一的 payterm 类型。

### 1.2 宏御世家（hongyu）
- **类型**：终身寿险（分红型）｜**交费**：3/5/10年交 / 趸交｜**分红**：是
- **展示收益率**：是（储备期后展示）
- **储备期规则来源**：`product-rules.js` → `reserveType:"fixed", reserveYears:5`
- **数据文件**：HTML 内嵌（源 `hongyu_data.json`，~1MB）
- **为什么这样显示**：前 5 年为储备期（主表合并单元格 rowspan=5）；储备期后展示收益率。注意主表用**内联逻辑**读 `RULE.reserveYears`（与其余 7 款风格略异，非缺陷）。

### 1.3 宏安世家（hongan）
- **类型**：理财计划（分红型）｜**交费**：3/5/10年交 / 趸交｜**分红**：是
- **展示收益率**：是｜**储备期来源**：`product-rules.js` → `fixed 5`
- **数据文件**：内嵌（源 `data_hongan.json`）

### 1.4 宏泰世家（hongtai）
- **类型**：世家（分红型）｜**交费**：3/5/10年交｜**分红**：是
- **展示收益率**：是｜**储备期来源**：`product-rules.js` → `fixed 5`
- **数据文件**：外部（运行时 fetch）`hongtai_full.json` / `hongtai_calc_data.json`。注：主目录虽存在 `hongtai_calcdata.js` 但**无任何文件引用**，属孤儿数据文件，勿手改、勿删除（见 DATA_SOURCE_MAP.md / PROJECT_RISK_REPORT.md）。
- **备注**：含 `_legacyDownloadImage()` 死代码（线上不触发，可清理）。

### 1.5 宏愿人生（hongyuan）
- **类型**：养老年金（分红型）｜**交费**：3/5/10年交 / 趸交｜**分红**：是
- **展示收益率**：是｜**储备期来源**：`product-rules.js` → `fixed 5`
- **数据文件**：内嵌（源 `data_hongyuan.json`）

### 1.6 宏禧来（hongxilai）
- **类型**：理财计划（分红型）｜**交费**：趸交｜**分红**：是
- **展示收益率**：是
- **储备期规则来源**：`product-rules.js` → `reserveType:"dynamic", rule:"rate<=0"`，储备期 = **收益率 ≤ 0 的那些年**（动态，非固定 5 年）
- **数据文件**：内嵌（源 `data_hongxilai.json`）
- **为什么这样显示**：储备期年数不固定，按每行收益率逐行判定。

### 1.7 华彩鎏金（huacai）
- **类型**：年金保险（分红型）｜**交费**：3/5/10年交 / 趸交｜**分红**：是
- **展示收益率**：**否**（储备期后显示「-」）
- **储备期规则来源**：`product-rules.js` → `fixed 5, showRate:false`
- **数据文件**：HTML 内嵌
- **为什么这样显示**：前 5 年储备期，但储备期结束后不展示收益率，统一显示「-」。

### 1.8 宏坤人生（hongkun）
- **类型**：养老年金保险｜**交费**：3/5/10年交 / 趸交｜**分红**：否
- **展示收益率**：**否**（显示「-」）
- **储备期规则来源**：`product-rules.js` → `fixed 5, showRate:false`
- **数据文件**：外部 `hongkun_calcdata.js`
- **为什么这样显示**：同华彩，储备期后显示「-」（非分红型，无收益率展示）。

### 1.9 福盛世家（fusheng）
- **类型**：终身寿险（添翼版）｜**交费**：3/5/10年交｜**分红**：否
- **展示收益率**：本地逻辑（主表**无储备期列**，收益率展示见页面，需人工确认）
- **储备期规则来源**：**本地逻辑**（calculator 内 `reserveYears=5`），**不进 `product-rules.js` 规则层**
- **数据文件**：外部 `fusheng_calcdata.js`
- **为什么这样显示**：按用户决策不进统一层，保留本地 `reserveYears=5`；储备期标记仅出现在下载 canvas 手绘（前 5 年），主表无该列。

### 1.10 恒享人生（hengxiang）
- **类型**：年金保险｜**交费**：3/5/10年交｜**分红**：否
- **展示收益率**：**无收益率概念**
- **储备期规则来源**：**无储备期体系**（不参与储备期逻辑）
- **数据文件**：外部 `hengxiang_calcdata.js`
- **为什么这样显示**：按用户决策不参与储备期体系，页面无储备期 / 收益率相关展示。

---

## 2. 规则汇总（便于 AI 快速回答「为什么」）

### 收益率展示规则（showRate）
- `true`（展示收益率）：盈满鑫、宏御、宏安、宏泰、宏愿、宏禧来
- `false`（显示「-」）：华彩、宏坤
- 特殊：福盛世家（本地逻辑，主表无储备期列）、恒享（无此概念）

### 储备期规则来源分类
- **product-rules.js 控制（8 款）**：
  - `payterm`（=交费期）：盈满鑫
  - `fixed 5`：宏御、宏安、宏泰、宏愿、华彩、宏坤
  - `dynamic rate<=0`：宏禧来
- **本地逻辑（不进层）**：福盛世家（`reserveYears=5`）
- **无储备期**：恒享

### 数据内嵌 vs 外部注入
- 外部注入：福盛世家 / 恒享 / 宏坤（`*_calcdata.js` 全局变量）、宏泰（`hongtai_full.json` / `hongtai_calc_data.json` 运行时 fetch）
- HTML 内嵌（由 `data_*.json` 生成）：盈满鑫、宏御、宏安、宏愿、宏禧来、华彩

---

## 3. 关联文档
- `PROJECT_MAP.md`：完整目录结构与文件可改/禁改标注
- `CODE_RULES.md`：禁止修改项（Excel/公式/利益数据/已验证模板）
- `PRODUCT_TEST_CHECKLIST.md`：逐产品验收清单
- `product-rules.js`：8 款产品的 `reserveType` / `reserveYears` / `showRate` 真值来源

---

*本文为纯知识整理，未改动任何业务代码。最后更新：2026-07-30。*
