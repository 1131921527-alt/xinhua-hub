# 新华Hub AI 接管说明书（AI_HANDOVER_GUIDE）

> **假设**：下一位维护者（人或 AI）完全不了解本项目。读完本文应能安全接手、不踩红线。
> **配套文档**（建议按顺序读）：PROJECT_MAP.md（地图）→ CODE_RULES.md（安全红线）→ PRODUCT_TEST_CHECKLIST.md（验收清单）→ GIT_WORKFLOW.md（分支流程）→ AI_DEV_WORKFLOW.md（研发流水线）→ PRODUCT_KNOWLEDGE_INDEX.md（产品知识）→ DATA_SOURCE_MAP.md（数据来源）→ CODE_DUPLICATION_REPORT.md（重复分析）→ PROJECT_RISK_REPORT.md（风险）。

## 1. 项目是什么

- **新华Hub** = 新华保险资料库网站，核心是一组保险**利益演示演算器**（`calculator-*.html` 共 10 款产品）。
- 形态：纯静态多页站点（无构建框架），GitHub Pages 部署（访问需密码，部署于 `xinhua-hub` 仓库）。
- 使用者：新华保险银保业务员（泽少 / 王老板），自用 + 给客户演示。
- 不是 SPA / 不是后端应用，是多页静态 HTML + 共享 JS 配置。

## 2. 核心架构

```
index.html              （门户，由 ai-planner.js 驱动产品路由 / URL 参数 / 微信文案）
 └─ calculator-xxx.html ×10   （各产品演算器）
      ├─ 数据源 : xxx_calcdata.js / xxx.json / 内嵌（由 data_*.json 生成）
      ├─ 计算   : 内联 <script>（收益率 / 储备期 / 表格）
      ├─ 展示规则: product-rules.js（8 款） 或 本地逻辑（福盛世家 / 恒享）
      └─ 下载   : html2canvas.min.js 截图
tests/product-rule-check.js   （Playwright 自动验收，当前 11/11 通过）
```

- **规则层**：`product-rules.js` 定义 8 款产品的 `key` / `reserveType` / `showRate` + 4 个工具函数（`getProductRule` / `resolveReserveYears` / `evalReserveRule` / 安全回退）。
- **路由层**：`ai-planner.js` 含 `PRODUCTS` 映射（产品别名 → 文件），驱动智能计划书与 URL 参数识别。

## 3. 修改代码注意事项

- ✅ **可改**：页面样式、交互、文案、`product-rules.js` 配置、`tests/`、各类文档。
- ⚠️ **谨慎**：`ai-planner.js`（路由错会影响全站跳转）、`html2canvas.min.js`（第三方库勿改）。
- ➕ **新增产品**：在 `product-rules.js` 加一条 `PRODUCT_RULES.xxx` 即可，无需改 HTML；重跑验收脚本回归。

## 4. 禁止事项（红线）

- 🔴 禁止修改：Excel 导入数据、收益计算公式、产品利益演示数据、已验证页面模板（详见 CODE_RULES.md）。
- 🔴 禁止直推 `main`；所有改动走 feature 分支（详见 GIT_WORKFLOW.md）。
- 🔴 禁止手改 `*_calcdata.js` / `data_*.json` / `xlsx/*.xlsx`（数据源，见 DATA_SOURCE_MAP.md）。

## 5. 测试流程

- **自动**：`node tests/product-rule-check.js` → 校验 10 款（11 用例）的生成 / 无 console 报错 / 下载 PNG / 储备期符合规则。
- **截图**：`tests/shots/` 含桌面（1280×900）+ 手机（390×844）共 22 张，可作视觉回归基线。
- **人工**：福盛世家储备期仅在下载 canvas 手绘，主表无该列，需人工核对截图。

## 6. 常见问题（FAQ）

- **Q：宏御为什么这样显示？**
  A：终身寿险分红型，前 5 年储备期（主表 `rowspan=5`），之后显示收益率；读 `product-rules.js` 的 fixed 5，主表用内联读 `RULE.reserveYears`（与其余 7 款风格略异，非缺陷）。详见 PRODUCT_KNOWLEDGE_INDEX.md。

- **Q：华彩 / 宏坤为什么收益率显示「-」？**
  A：`showRate=false`，储备期后不显示收益率（设计 / 合规选择）。

- **Q：福盛世家怎么没有储备期列？**
  A：按需求不进统一规则层，储备期仅在下载图手绘，主表无该列。

- **Q：恒享怎么没有储备期？**
  A：恒享为非分红型年金，不参与储备期体系，符合设计。

- **Q：宏泰的数据文件到底是哪个？**
  A：实际用 `hongtai_full.json` / `hongtai_calc_data.json`（运行时 fetch）；`hongtai_calcdata.js` 是**未引用的孤儿文件，勿动**（见 DATA_SOURCE_MAP.md / PROJECT_RISK_REPORT.md）。

- **Q：改了数据怎么验证？**
  A：走「Excel → 生成脚本 → `node tests/product-rule-check.js` → 人工核对截图」流程（见 DATA_SOURCE_MAP.md）。

- **Q：改样式要不要跑测试？**
  A：要。任何改动走 CODE_RULES.md 门禁（修改前截图 → diff → 自动测试 → 修改后截图），并在 feature 分支上做。

## 声明

- 本文为接管说明，**未执行任何代码修改或 Git 操作**，符合「只输出文档」要求。

---

> ⚠️ **本次任务总限制**：仅允许 读取 → 分析 → 输出文档。
> 禁止：删除文件 / 移动文件 / 修改业务代码 / 提交 Git / 合并分支。
