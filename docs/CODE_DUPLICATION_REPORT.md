# 新华Hub 代码重复检测报告（CODE_DUPLICATION_REPORT）

> **扫描对象**：`calculator-*.html`（10 个活文件）
> **扫描方式**：静态统计函数定义频次 + `<style>`/`<script>` 行数（2026-07-30）
> **本文只输出优化建议，不实际重构任何代码。**

## 1. 重复 CSS

- 10 个文件各自含独立 `<style>` 块，行数 **78 ~ 129 行/个**（合计约 1000+ 行样式高度雷同，如容器/按钮/结果表格/卡片等基础样式）。
- 典型重复：`.container` / `.btn` / `.result-table` / `.card` 等在每个文件重写。
- **建议**：抽离 `common.css`（基础布局 + 通用组件），各 calculator 仅保留产品特有样式；或用 CSS 变量统一主题色与间距。

## 2. 重复 JS 函数（按出现文件数统计）

| 函数 | 出现文件数 | 说明 |
|------|-----------|------|
| showImagePreview | 12 | 图片预览，全量重复 |
| generate | 10 | 核心生成，全量重复 |
| fmt | 10 | 数字格式化，全量重复 |
| downloadImage | 10 | 下载截图，全量重复 |
| selectGender | 10 | 性别选择，全量重复 |
| showToast / showLoading / showError | 各 6 | 提示 / 加载 / 错误，重复 |
| loadData | 5 | 数据载入（内嵌产品各自自带） |
| dataUrlToBlobUrl | 5 | blob 转换，重复 |
| toggleViewMode | 4 | 视图切换，重复 |
| selectRate | 4 | 费率选择，重复 |
| _legacyDownloadImage | 6 | ⚠️ 死代码（见 PROJECT_RISK_REPORT） |

- **建议**：抽 `common.js`，把 `fmt` / `showToast` / `showLoading` / `showError` / `showImagePreview` / `downloadImage` / `dataUrlToBlobUrl` / `loadData` / `toggleViewMode` / `selectGender` / `selectRate` 收进去，各 calculator 用 `<script src="common.js">` 复用。

## 3. 重复计算逻辑

- **储备期计算**：虽已建 `product-rules.js` 的 `resolveReserveYears` / `evalReserveRule`，但 8 个文件各自内联调用；宏御（hongyu）仍用内联 `RULE.reserveType==='fixed' ? RULE.reserveYears : ...` 未走统一函数（功能等价，风格差异）。
- **收益率渲染 / 利益演示表格生成**：各文件独立实现，结构高度相似。
- **建议**：把「储备期年数计算」「收益率单元格渲染」「表格行生成」抽为 `product-rules.js` 或 `common.js` 的导出函数，HTML 仅传参调用，消除宏御特例。

## 4. 可抽离公共模块（按优先级）

1. **common.css（高）**：消除 ~1000 行重复样式，改一处即全量生效。
2. **common.js（高）**：消除 10 份文件重复的 10+ 工具函数。
3. **储备期 / 收益率渲染函数（中）**：统一走 product-rules.js，消除宏御内联特例。
4. **下载逻辑（中）**：统一 `downloadImage`，移除 `_legacyDownloadImage` 死代码。

## 收益预估

- 单文件体积预计下降 **40% ~ 60%**，10 个文件合计可减少 **3000+ 行**重复代码。
- 改样式 / 交互从「改十处」变为「改一处」，大幅降低遗漏风险。

## 声明

- 本报告仅作优化建议，**未实际重构任何代码**，符合「只输出文档、不修改业务代码」要求。
- 重构若实施，须遵守 CODE_RULES.md 的修改门禁（修改前截图 → diff → 自动测试 → 修改后截图）与 GIT_WORKFLOW.md 的分支流程。

---

> ⚠️ **本次任务总限制**：仅允许 读取 → 分析 → 输出文档。
> 禁止：删除文件 / 移动文件 / 修改业务代码 / 提交 Git / 合并分支。
