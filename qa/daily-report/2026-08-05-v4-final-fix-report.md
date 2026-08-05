# V4.0 视觉优化验收 · 修改报告（盈满鑫专题 + 全站排查）

> 日期：2026-08-05　|　执行：自动验收（用户授权直接执行，未询问确认）
> 关联：上一轮 `2026-08-05-v4-final-report.md`（V4.0 最终视觉验收，已提交）
> 本次 commit：`47b9379`（已 push 至 GitHub Pages）

## 一、用户指令摘要
1. 删除盈满鑫导出 PNG 顶部三个绿色收益卡片（满期收益/累计收益/年化单利）——该模块数据与正式利益演示表不完全一致，会误导使用者；恢复正式计划书结构；不影响网页在线测算。
2. 修复盈满鑫导出图片表格文字垂直居中（th/td 垂直居中、水平居中保持、不动导出尺寸）。
3. 全站五款同类问题排查（盈满鑫/宏安世家/恒享人生/宏御世家/宏愿人生）：导出是否含多余临时模块、表格文字是否贴底、单元格是否真正居中、是否出现多余/异常边框。

## 二、发现的问题与修复

### 问题 1 · 盈满鑫导出顶部三收益卡片（用户指定删除）
- **根因**：盈满鑫使用**独立隐藏导出模板** `#exportRoot`（800px，非 html2canvas 截网页）。模板内 `.exp-km` 块（含三个 `.km-card`）由 `buildExport()` 注入，与网页 `.key-metrics` 是两套独立结构。
- **修复**：
  - 删除 `buildExport()` 中的 `.exp-km` 区块（原 712–716 行）。
  - 删除对应 CSS（`.exp-km` / `.exp-km .km-card` / `.exp-km .km-label` / `.exp-km .km-val`）。
  - **网页在线测算的 `.key-metrics` 保留**（用户要求"不影响网页在线测算功能"）。
- **验证**：DOM 确认 `#exportRoot .exp-km` 已不存在；导出高度由约 3426px 降至 2798/2738/2680px（10万/100万/1000万），印证卡片已移除。

### 问题 2 · 盈满鑫导出表格文字贴底 → 垂直居中
- **根因**：导出模板中 `.exp-info` / `.exp-combo` / `.exp-dep tfoot` 的 th/td 未声明 `vertical-align`（默认 `baseline`），文字贴近底边；`.exp-main` 虽已居中，其余表未统一。
- **修复**：为 `.exp-info th,td`、`.exp-combo td`、`.exp-dep tfoot td` 增加 `vertical-align:middle`；网页 `.info-table` 同步增加（零风险一致性）。仅调整垂直对齐，**未改 padding / line-height / 字号，导出尺寸不变**。
- **验证**：导出四表实测 `topGap≈botGap`（差异 ≤1px），`vertical-align=middle`，居中 OK。

### 问题 3 · 全站五款排查结果

#### (a) 导出 PNG 多余临时模块
- 盈满鑫：已删除（见问题1）。
- 宏安/恒享/宏御/宏愿：四款导出 = html2canvas 截 `#planArea`，其顶部 `.key-metrics` 三卡片与盈满鑫同属"临时收益摘要"，依"不要只修改盈满鑫"要求**统一从五款导出中移除**。
  - 实现：将四款 `body.capturing .key-metrics{display:flex !important;…}` 改为 `display:none !important`（仅在抓取导出时隐藏，**网页端仍正常显示**，在线测算不受影响）。
- **额外发现并修复（本轮新增 bug）**：宏安世家、宏愿人生的网页指标卡此前因**指标卡填充 IIFE 被置于 `generate()` 函数体外**（引用函数内 `rows`/`lastSurvival`/`totalPrem` 等块级变量），运行时抛 `ReferenceError`，卡片始终显示"—"——与恒享此前同类 bug 一致。已将 IIFE 移入 `generate()` 体内修复。现网页卡片正常填充（宏安 `16,468,249`、宏愿 `9,433,691`；恒享 `9,339,300`、宏御 `17,940,798` 本就正常）。

#### (b) 表格文字贴底
- 五款导出/结果表全部缺 `vertical-align` 或仅部分表有。已统一为 `vertical-align:middle`：
  - 盈满鑫：`.exp-info/.exp-combo/.exp-dep tfoot` + 网页 `.info-table`。
  - 宏安：`.info-table`。
  - 恒享：`#resultTable`。
  - 宏御：`#resultTable`。
  - 宏愿：`.info-table`。
  - （盈满鑫/宏安/宏愿网页 `.main-table` 此前已有，本轮补齐缺口。）

#### (c) 单元格真正居中
- 全五款实测 `vertical-align=middle` 且文字上下间隙差 ≤1px，水平居中（`text-align:center`）保持，确认真正居中。

#### (d) 多余 / 异常边框
- 上一轮 V4 验收已将恒享/宏御结果表边框统一为 `1px solid #1E40AF`；本轮五款导出实测边框均为统一深蓝网格（`1px solid rgb(30,64,175)`），**无多余或异常线条**。
- 备注：宏安/宏愿网页主表（`.main-table`）沿用既有 `1px solid #fff` 白边 + 隔行底色分隔，属既有设计风格（非异常线条），本轮未改动。

## 三、重新验收结果（10万 / 100万 / 1000万 三档）

| 项目 | 结果 |
|---|---|
| 截图产出 | 41 张 / 31.6MB，目录 `qa/screenshots/2026-08-05-v4-final/` |
| 6 页面（首页/培训中心/销售问答 × PC/手机）横向滚动 | 全 OK（无溢出） |
| 5 款 × 3 档导出 PNG | **全部 0 网页溢出 / 0 导出溢出** |
| 盈满鑫导出尺寸 | 1600px 宽；高度 2798/2738/2680px（已无顶部三卡） |
| 其余四款导出尺寸 | 2000px 宽；高度随产品不同 |
| 微信模拟图 | 每款 1000万档 `_1000w_wechat.png` 已生成 |
| 自动报告 | `qa/screenshots/2026-08-05-v4-final/_v4final_report.txt` |

## 四、提交与线上
- commit `47b9379` → push 成功（`18c1df3..47b9379`）。
- 线上：https://1131921527-alt.github.io/xinhua-hub/ （⚠️ github.io 微信内被拦截，请用 Chrome 桌面端打开）

## 五、交付物地址（蓝色链接可点）
- 修改报告：`E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub\qa\daily-report\2026-08-05-v4-final-fix-report.md`
- 截图文件夹（41 张）：`E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub\qa\screenshots\2026-08-05-v4-final\`
- 自动验收报告：`E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub\qa\screenshots\2026-08-05-v4-final\_v4final_report.txt`

## 六、提醒
⚠️ 模型不支持读图：41 张截图请**肉眼 review**。重点核对：
1. 盈满鑫导出图顶部已无三个绿色卡片，正式计划书结构完整；
2. 五款导出图表格文字均位于单元格中央、不再贴底；
3. 五款导出图均不再含顶部临时收益摘要卡（网页端仍保留，方便在线查看）；
4. 宏安/宏愿网页端指标卡现已正常显示数字（此前为"—"）。
本轮**未新增功能**，仅做发现问题→修复。
