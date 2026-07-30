# 新华Hub 项目地图（PROJECT_MAP）

> **文档性质**：纯结构梳理文档，供未来 AI / 人工维护时快速定位。
> **生成日期**：2026-07-30
> **适用项目**：`E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub\`（新华保险资料库站点，GitHub Pages 部署）
> **约束**：本文只描述现状，**不修改任何业务代码、不接入自动调用**。

图例：
- 🟢 **可修改** —— AI 维护时可安全编辑
- 🔴 **禁止修改（数据源）** —— 改错会导致演算数值错误，须经"Excel → 生成脚本 → 校验"流程
- 🟡 **谨慎修改** —— 可改但需回归测试
- 📦 **历史快照** —— 只读归档，不参与维护

---

## 1. 项目目录结构

```
xinhua-hub/
├── 活文件（线上/维护对象）
│   ├── index.html                  # 站点首页（导航入口）
│   ├── preview.html                # 首页预览版
│   ├── calculator-*.html           # 10 个产品演算器（核心业务）
│   ├── clause-*.html               # 产品条款解读页（5 款）
│   ├── card-*.html / intro-*.html  # 产品卡片 / 简介页
│   ├── boc-*.html                  # 中国银行渠道专用页
│   ├── dividend*.html / dividend*.json   # 红利实现率相关
│   ├── sales-qa.html / product-qa-handbook.html / insurance-knowledge-card.html  # 销售话术/知识卡
│   ├── company-intro.html / fuxing.html / jujia.html / zengzhi.html / huifang.html  # 公司/增值/养老等专题
│   ├── ai-planner.js               # 公共 AI 规划器（被所有 calculator 引用）
│   ├── html2canvas.min.js          # 公共截图库（下载 PNG 用）
│   ├── product-rules.js            # ★ 收益率/储备期规则配置层
│   ├── data.json / 新华在售产品_中国银行版.xlsx   # 站点/产品基础数据
│   ├── *_calcdata.js / data_*.json / hongyu_data.json  # ★ 产品利益演示数据源
│   ├── favicon.ico
│   ├── package.json / package-lock.json / .gitignore
│   ├── tests/                      # 自动验收（见 §2.6）
│   ├── rules_scan_report.md / 验收清单-第一批知识页面-V1.md  # 验收文档
│   └── README.md / README-项目总览.md / V1.2系统优化规划.md / AI_DEV_WORKFLOW.md  # 项目文档
│
├── 历史快照（📦 只读，维护时忽略）
│   ├── archive/                    # 退役/旧版归档（含 cmb-retired、演算器手机测试等）
│   ├── backup/                     # 按日期的功能备份（如 2026-07-28-calculator-layout-fix）
│   └── dev-archive/                # 开发期脚本/数据草稿
│
├── 资源素材
│   ├── images/                     # 图片模板/素材（company-intro、ppt-2604、hongyu-card-overview.jpeg）
│   ├── files/                      # 资料库素材（产品介绍/对比/规则/养老/分红/合同/增值/演算器…）
│   ├── xlsx/                       # 5 个产品 Excel 源文件（人工维护的数据源头）
│   └── 审计素材/                    # 站点审计截图 + audit_sites.py
│
├── 工具脚本（*.py 多数为一次性生成器，非线上运行）
│   ├── gen_*.py / regen_*.py / read_*.py / reformat_clauses.py
│   └── tools/                      # 中行演算器Excel生成 / 保险通用工具 / 演算器Excel生成脚本
│
└── .workbuddy/                     # 工作区记忆与历史验证脚本（verify-*.js、*验收报告*.md）
```

---

## 2. 核心文件作用

### 2.1 演算器 `calculator-*.html`（10 个活文件）

| 文件 | 产品 | 数据来源 | 进规则层 | 备注 |
|---|---|---|---|---|
| `calculator-yingmanxin.html` | 盈满鑫 | 内嵌（源 `data_yingmanxin.json`） | ✅ | 储备期=交费期（payterm） |
| `calculator-hongyu.html` | 宏御世家 | 内嵌（源 `hongyu_data.json`，~1MB） | ✅ | 主表用内联读配置（风格差异，非缺陷） |
| `calculator-hongan.html` | 宏安世家 | 内嵌（源 `data_hongan.json`） | ✅ | |
| `calculator-hongtai.html` | 宏泰世家 | 外部（fetch）`hongtai_full.json` / `hongtai_calc_data.json` | ✅ | 含 `_legacyDownloadImage` 死代码 |
| `calculator-hongyuan.html` | 宏愿人生 | 内嵌（源 `data_hongyuan.json`） | ✅ | |
| `calculator-hongxilai.html` | 宏禧来 | 内嵌（源 `data_hongxilai.json`） | ✅ | 储备期=dynamic `rate<=0` |
| `calculator-huacai.html` | 华彩鎏金 | 内嵌 | ✅ | 储备期后不显示收益率（showRate=false） |
| `calculator-hongkun.html` | 宏坤人生 | 外部 `hongkun_calcdata.js` | ✅ | 储备期后不显示收益率 |
| `calculator-fusheng.html` | 福盛世家 | 外部 `fusheng_calcdata.js` | ❌ | 不进规则层，本地 `reserveYears=5`；主表无储备期列，仅下载图标记 |
| `calculator-hengxiang.html` | 恒享人生 | 外部 `hengxiang_calcdata.js` | ❌ | 不参与储备期体系 |

> **进规则层** = 读取 `product-rules.js` 统一配置；**不进** = 保留本地逻辑（按用户 2026-07 决策）。

### 2.2 数据文件（★ 数据源，🔴 禁止直接手改）

| 文件 | 类型 | 对应产品 | 说明 |
|---|---|---|---|
| `fusheng_calcdata.js` | 全局变量注入 | 福盛世家 | 生成自 Excel，🔴 禁止手改 |
| `hengxiang_calcdata.js` | 全局变量注入 | 恒享 | 🔴 禁止手改 |
| `hongkun_calcdata.js` | 全局变量注入 | 宏坤 | 🔴 禁止手改 |
| `hongtai_calcdata.js` | 全局变量注入（⚠️ 未引用孤儿文件） | 宏泰 | 🔴 禁止手改 / 待归档 |
| `data_yingmanxin.json` | JSON 源（→内嵌） | 盈满鑫 | 生成源，🔴 禁止手改 |
| `data_hongan.json` | JSON 源（→内嵌） | 宏安 | 🔴 禁止手改 |
| `data_hongxilai.json` | JSON 源（→内嵌） | 宏禧来 | 🔴 禁止手改 |
| `data_hongyuan.json` | JSON 源（→内嵌） | 宏愿 | 🔴 禁止手改 |
| `hongyu_data.json` | JSON 源（→内嵌） | 宏御 | 🔴 禁止手改 |
| `xlsx/盈满鑫两全保险（分红型）理财计划.xlsx` 等 5 个 | Excel 源头 | 盈满鑫/宏安/宏愿/宏禧来/恒享 | 🔴 人工维护的真实数据源 |
| `新华在售产品_中国银行版.xlsx` | Excel 源头 | 全量在售 | 🔴 渠道产品清单 |

> 内嵌型产品：数据在构建时由 `data_*.json` / `gen_*.py` 注入 HTML；线上 HTML 即数据源镜像。

### 2.3 `product-rules.js` ★ 规则配置层（🟢 可修改 / 🟡 谨慎）

- 统一承载 8 款产品的 `reserveType` / `reserveYears` / `rule` / `showRate`。
- 暴露 `window.PRODUCT_RULES` / `getProductRule(key)` / `resolveReserveYears(rule, payYears)` / `evalReserveRule(rule, row)`。
- **新增产品只改这里**（加一条 `PRODUCT_RULES.xxx`），无需动 HTML。
- 改后必须重跑 `tests/product-rule-check.js` 回归。

### 2.4 公共脚本（🟡 谨慎）

| 文件 | 作用 | 被谁引用 |
|---|---|---|
| `ai-planner.js` | AI 规划器（方案推荐/参数联动） | 全部 calculator |
| `html2canvas.min.js` | 页面截图→PNG 下载 | 全部 calculator（下载按钮） |

### 2.5 图片 / 模板（🟢 可增补素材，🟡 改图需同步页面）

- `images/`：站点图片模板（company-intro、ppt-2604 套图、hongyu-card-overview.jpeg）。
- `files/`：资料库素材库（产品介绍/对比/规则/养老社区/分红/合同模板/增值服务/手工单/操作流程/演算器）。
- `审计素材/`：站点审计截图与 `audit_sites.py`。

### 2.6 测试脚本（🟢 可修改扩充）

| 文件 | 作用 |
|---|---|
| `tests/product-rule-check.js` | ★ 自动验收脚本：对 10 款跑 5 项（生成/无报错/下载PNG/数据一致/储备期符合规则），输出 `tests/last-report.md` |
| `tests/shots/*.png` | 验收截图（桌面+手机，22 张） |
| `tests/last-report.md` | 最近一次验收报告（当前 11/11 通过） |
| `.workbuddy/verify-*.js` | 历史验证脚本（verify-all5 / verify-calculator-screenshots / verify-hongan-reserve） |

### 2.7 配置文件（🟡 谨慎）

| 文件 | 作用 |
|---|---|
| `package.json` / `package-lock.json` | Node 依赖（playwright 等，供测试脚本） |
| `.gitignore` | Git 忽略规则 |
| `data.json` | 站点/产品基础数据 |
| `favicon.ico` | 站点图标 |

### 2.8 项目文档

`README.md`（项目总览）、`README-项目总览.md`、`V1.2系统优化规划.md`、`rules_scan_report.md`、`验收清单-第一批知识页面-V1.md`、`AI_DEV_WORKFLOW.md`（自动研发流程设计）、`工作日志/`（按日期记录）。

---

## 3. 当前产品列表（10 款）

| # | 产品 | key | 储备期规则（reserveType） | showRate | 进规则层 | 数据源类型 |
|---|---|---|---|---|---|---|
| 1 | 盈满鑫 | yingmanxin | payterm（=交费期 3/5 年） | true | ✅ | 内嵌（data_yingmanxin.json） |
| 2 | 宏御世家 | hongyu | fixed 5 年 | true | ✅ | 内嵌（hongyu_data.json） |
| 3 | 宏安世家 | hongan | fixed 5 年 | true | ✅ | 内嵌（data_hongan.json） |
| 4 | 宏泰世家 | hongtai | fixed 5 年 | true | ✅ | 外部（hongtai_full.json / hongtai_calc_data.json） |
| 5 | 宏愿人生 | hongyuan | fixed 5 年 | true | ✅ | 内嵌（data_hongyuan.json） |
| 6 | 宏禧来 | hongxilai | dynamic `rate<=0` | true | ✅ | 内嵌（data_hongxilai.json） |
| 7 | 华彩鎏金 | huacai | fixed 5 年 | **false** | ✅ | 内嵌 |
| 8 | 宏坤人生 | hongkun | fixed 5 年 | **false** | ✅ | 外部（hongkun_calcdata.js） |
| 9 | 福盛世家 | fusheng | 本地 fixed 5 年（不进层） | — | ❌ | 外部（fusheng_calcdata.js） |
| 10 | 恒享人生 | hengxiang | 无储备期体系 | — | ❌ | 外部（hengxiang_calcdata.js） |

> 储备期 ≠ 回本期，仅为展示约定；配置层重构不改任何数值。

---

## 4. 文件标注（可修改 / 禁止修改 / 数据源）

### ✅ 可修改（AI 维护安全区）
- `product-rules.js`：新增/调整产品规则（改后跑回归）。
- `calculator-*.html` 的**样式与交互逻辑**（不影响收益率公式/演示数据）。
- `tests/product-rule-check.js` 及 `tests/` 下新增用例。
- `images/`、`files/` 增补素材；`*.md` 文档更新。
- `index.html` / `preview.html` 导航与展示。

### 🟡 谨慎修改（需回归测试）
- `ai-planner.js`、`html2canvas.min.js`：公共依赖，改动影响所有演算器。
- `data.json`、各 `clause-*.html` / `boc-*.html` 业务页。
- 任何 calculator 的**收益率公式 / 利益演示渲染逻辑**（即使想改，也必须先确认不触及数据源数值）。

### 🔴 禁止修改（数据源 / 历史）
- 全部 `*_calcdata.js`、`data_*.json`、`hongyu_data.json`、`hongtai_full.json` / `hongtai_calc_data.json`：**演算数值源头**，手改即错。
- `xlsx/*.xlsx`、`新华在售产品_中国银行版.xlsx`：人工维护的真实源，改前需业务确认。
- 收益率公式、Excel 原始数据、产品利益演示数据：**硬禁止**（见验收任务约束）。
- `archive/` `backup/` `dev-archive/`：📦 历史快照，只读。

> **数据源修改正确流程**：Excel 源 → 跑 `gen_*.py` / `regen_*.py` 重新生成 `*_calcdata.js` 或内嵌 JSON → 重跑 `tests/product-rule-check.js` 校验数值一致 → 人工核对下载图。

---

## 5. 未来 AI 维护提示

1. **新增产品**：①在 `product-rules.js` 加一条 `PRODUCT_RULES.xxx`；②新建/改 `calculator-*.html`；③重跑 `node tests/product-rule-check.js`；④更新本文 §3 产品列表。
2. **规则调整**：只动 `product-rules.js`，绝不在 HTML 写死储备期/收益率逻辑（已重构消除）。
3. **记忆约定**：维护过程按双写记忆规则（工作区 `.workbuddy/memory/` + `腾讯龙虾的成品/memory/`）。
4. **流程参考**：自动研发流水线设计见 `AI_DEV_WORKFLOW.md`（ChatGPT→Task→WorkBuddy→Test→Codex Review→Next Task）。
5. **验收基线**：当前 10 款 11 用例 11/11 通过（`tests/last-report.md`）；任何改动后须保持全绿。

---
*本文件为纯文档，未改动任何业务代码。最后更新：2026-07-30。*
