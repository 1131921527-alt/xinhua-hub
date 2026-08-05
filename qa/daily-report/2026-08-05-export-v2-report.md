# V4.0 导出 PNG 视觉优化报告（二）—— 计划书图片排版

**日期**：2026-08-05
**提交**：`65bd1d7`（已 push 至 GitHub Pages）
**改动文件**：`calculator-yingmanxin.html`
**截图目录**：`qa/screenshots/2026-08-05-export-v2/`（15 张真实导出 PNG）

---

## 一、重要前置：发现上一轮验收脚本的路径 Bug

本轮最初复验时，临时脚本的 `BASE` 误指向 `qa/` 目录（脚本自身所在目录），导致 `http.server` 从错误目录起服务，所有页面返回 **404**——上一轮的"导出无 KPI 卡、已居中"结论其实是跑在空页面上的**假通过**。

修正 `BASE = os.path.dirname(os.path.dirname(__file__))`（指向项目根）后，重新对**真实 html2canvas 导出 DOM + 实际导出 blob** 做核验，得到以下可靠结论。

---

## 二、三个问题的处理结论

### 问题 1：删除导出图顶部三收益卡（满期/累计/年化）
- **核验结论**：五款导出图**均已无顶部 KPI 卡**。
  - 盈满鑫：导出用独立模板 `#exportRoot`，其中 `.exp-km` 三卡模块已在上一轮 commit `47b9379` 移除，`#exportRoot` 内已无 `.exp-km` 元素。
  - 宏安/恒享/宏御/宏愿：导出截 `#planArea`，`body.capturing .key-metrics{display:none !important}` 生效，捕获态下三卡 `display:none`，不进入 PNG。
- 本次对 5 款 × 3 档调用**真实 `downloadImage()` 导出 blob** 逐一核验：`kpi_card_in_export` 全部为 `false`。
- 网页在线测算页面的三卡保留（用户要求"只删导出图，不影响在线测算"）。

### 问题 2：盈满鑫「公司介绍 / 产品简介」两栏等高
- **上一轮状态**：原 `display:flex` 布局，DOM 量得两栏 `184px` 等高；但 **html2canvas 对 flex 的 cross-axis stretch 支持不稳**，PNG 中常出现两栏底部不齐。
- **本轮修复**（`calculator-yingmanxin.html`）：
  - `.exp-row2` 由 `display:flex` 改为 `display:table` + `table-layout:fixed`；两栏 `.exp-box` 改为 `display:table-cell; width:50%`。表格单元格在 html2canvas 中**必定等高**，根除不对齐风险。
  - 并在 `buildExport()` 末尾加 **JS 显式等高兜底**：取两栏 `offsetHeight` 最大值，写入两栏 `style.height`，双保险。
- **像素级核验**（1000万档 `yingmanxin_1000w_export.png`，1600×2680）：
  - 中心分隔竖线位于 `x=400`，`y` 区间 `192→269`；
  - 该竖线**止于 y=269**，此处为两栏共有底部边框（横向连续蓝像素 **1474** 个，跨越整宽）；
  - `y+3` 处分隔线蓝像素为 0 → 分隔线正好结束于底部边框 → **两栏底部对齐，等高确认**。

### 问题 3：所有导出表格文字垂直居中
- 五款导出表的表头 / 参数表 / 收益表 / 信息卡均设 `vertical-align:middle`：
  - 盈满鑫：`.exp-info / .exp-main / .exp-dep / .exp-combo` 全部 `vertical-align:middle`
  - 宏安/宏愿：`.info-table th,td` 与 `.main-table th,td`
  - 恒享/宏御：`#resultTable th,td`
- DOM 采样（Range 取单元格文字包围盒，对比单元格中心）结果：**5 款 × 3 档共 15 张导出图，0 个贴底单元格**（`uncentered: []`）。

---

## 三、验收结果（5 款 × 10万/100万/1000万）

| 产品 | 10万 | 100万 | 1000万 | KPI卡 | 贴底 | 等高(盈满鑫) |
|---|---|---|---|---|---|---|
| 盈满鑫 | ✅ | ✅ | ✅ | 无 | 无 | 186/186 ✅ |
| 宏安 | ✅ | ✅ | ✅ | 无 | 无 | — |
| 恒享 | ✅ | ✅ | ✅ | 无 | 无 | — |
| 宏御 | ✅ | ✅ | ✅ | 无 | 无 | — |
| 宏愿 | ✅ | ✅ | ✅ | 无 | 无 | — |

- 全部 15 张为**真实 html2canvas 导出 PNG**（非页面截图），已存 `qa/screenshots/2026-08-05-export-v2/`。
- 导出与网页展示内容一致（导出模板为正式计划书版式，网页在线测算三卡保留）。

---

## 四、交付与提醒
- 线上：https://1131921527-alt.github.io/xinhua-hub/ （⚠️ github.io 微信内被拦截，请用 Chrome 桌面端）
- 本次**未新增功能**，仅做导出图排版修复与复验。
- ⚠️ 模型不支持读图，以上为 DOM + 像素级程序化核验结论；请肉眼 review `2026-08-05-export-v2/` 下 15 张 PNG，重点看：盈满鑫顶部无三绿卡、两栏底部对齐、五款表格文字居中。
