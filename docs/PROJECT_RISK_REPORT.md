# 新华Hub 隐藏风险扫描报告（PROJECT_RISK_REPORT）

> **扫描方式**：静态扫描 `calculator-*.html` + 目录结构（2026-07-30）
> **本文只报告，不删除、不移动、不修改任何文件。**

## 1. 失效文件引用

- **结论：未发现真实失效引用。**
- 细节：`calculator-*.html` 引用的本地文件（`ai-planner.js` / `*_calcdata.js` / `html2canvas.min.js` / `product-rules.js` / `index.html`）**均存在**。
- 误报说明：扫描中出现的 `+blobUrl+`（5 次）是 JS 字符串拼接（`'...'+blobUrl+'...'`），并非文件引用，忽略。

## 2. 重复版本文件

- 历史快照目录（建议归档 / 忽略，**勿当作活文件修改**）：
  - `archive/`：`cmb-retired-2026-07-28`、`新华保险资料库`、`演算器手机测试`
  - `backup/`：`2026-07-28-calculator-layout-fix`
  - `dev-archive/`：大量生成 / 验证脚本（`rebuild3.py`、`verify_*.py`、`extract_*.py` 等 20+）
- **风险**：活文件与历史快照混在同一仓库，极易误改旧版。

## 3. 未使用代码 / 孤儿文件

- **`_legacyDownloadImage()`**：出现于 `fusheng` / `hengxiang` / `hongkun` / `hongtai` / `hongyu` / `huacai` 共 6 文件，为 canvas 手绘旧下载逻辑，按钮实际走 `html2canvas`，**纯死代码**（详见 CODE_DUPLICATION_REPORT.md）。
- **`hongtai_calcdata.js`**：主目录存在但**无任何文件引用**（宏泰改用 `hongtai_full.json` / `hongtai_calc_data.json`），疑似孤儿数据文件——**勿手改、勿删除**，待确认后归档。
- **`dividend.json`**：在扫描的 html/js 中未见引用，疑似未使用或仅被未扫描脚本引用，需确认。

## 4. 硬编码数据

- `calculator-fusheng.html:279`：`const reserveYears=5;`（福盛世家本地逻辑，按需求保留，但属硬编码，改动须同步下载图）。
- `calculator-hongyu.html:331`：内联 `RULE.reserveType === 'fixed' ? RULE.reserveYears : ...`，未走统一 `resolveReserveYears`（功能等价，风格差异）。
- 其余 8 款已统一读 `product-rules.js`，**无硬编码储备期数字**。

## 5. 未来维护风险

1. **高 · 重复脆弱**：10 份 HTML 各自 CSS（78~129 行）/ JS（223~839 行）高度重复，改一处样式 / 交互需同步十处，极易遗漏 → 建议抽 `common.css` / `common.js`（见 CODE_DUPLICATION_REPORT.md）。
2. **中 · 数据正确性依赖人工**：收益 / 利益数据由 `xlsx/` 经生成脚本产出，手改易错；必须走「Excel → 生成 → 回归」流程（见 DATA_SOURCE_MAP.md）。
3. **中 · 孤儿文件**：`hongtai_calcdata.js` / `dividend.json` 未引用，易被误以为是数据源而手改。
4. **低 · 宏御特例**：主表内联读配置未走统一函数，后续统一可降维护成本。
5. **低 · 无构建 / 框架**：纯静态多页，无 CI 门禁强制；靠 `tests/product-rule-check.js` 人工跑（见 GIT_WORKFLOW.md 未来升级方向）。

## 声明

- 本报告仅列出风险，**未删除、未移动、未修改任何文件**，符合「只报告不删除」要求。

---

> ⚠️ **本次任务总限制**：仅允许 读取 → 分析 → 输出文档。
> 禁止：删除文件 / 移动文件 / 修改业务代码 / 提交 Git / 合并分支。
