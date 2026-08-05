# 盈满鑫导出 PNG 视觉优化 v3 验收报告（2026-08-05）

## 任务来源
用户肉眼验收下载后的盈满鑫计划书图片，提出 6 项排版优化，要求只改导出模板、不影响网页，直接执行。

## 修改清单（仅 `calculator-yingmanxin.html` 的 `.exp-*` 导出模板 + `buildExport`/`fitExportTable`）

| # | 要求 | 修改 | 结果 |
|---|------|------|------|
| 1 | 全部导出表格文字垂直居中 | 新增全局 `vertical-align:middle !important`（覆盖 exp-info/exp-main/exp-dep/exp-combo 全部 th/td）；`fitExportTable` 内联兜底 `verticalAlign='middle'`；padding 上调（参数表 5→7px、收益/定存表 4→6px、组合表 4→6px、定存脚注 5→7px），数字不再贴底/贴边 | ✅ |
| 2 | 收益表头密度 | 修复 `fitExportTable` 旧逻辑把表头也当成数据缩放（导致表头被放大、字段拥挤）；改为**表头固定 14px / 子标题 12px**，数据单元格 16px 起步、最低 12px 动态缩放 | ✅ |
| 3 | 标题缩小 | `.exp-title` 32px→**28px**，margin 16→12px | ✅ |
| 4 | 公司介绍/产品简介阅读体验 | `.exp-b` line-height 1.45→**1.75**，段前加 2px；双栏等高已稳定（table-cell + JS 兜底） | ✅ |
| 5 | 底部免责声明间距 | `.exp-foot` margin-top 12→**8px**、padding-top 10→8px、字号 17→15px；`.exp-foot2` 8→6px、17→14px，整体压缩约 20% | ✅ |
| 6 | 「演示分红实现率100%」样式 | 由胶囊按钮（蓝底圆角）改为**普通信息提示栏**：浅灰底 `#F8FAFC` + 左侧 3px 主色竖线，13.5px 常规字重，多段用「｜」分隔，不再抢视觉 | ✅ |

## 验收结果（Playwright 真实 html2canvas 抓取，BASE 路径已修正为项目根目录）

| 档位 | 垂直居中 | 溢出单元格 | 标题字号 | 统计栏形态 | 免责间距 | 双栏等高 |
|------|---------|-----------|---------|-----------|---------|---------|
| 10万 | ✅ true | 0 | 28px | block/浅灰 | 8px | 215/215 |
| 100万 | ✅ true | 0 | 28px | block/浅灰 | 8px | 215/215 |
| 1000万 | ✅ true | 0 | 28px | block/浅灰 | 8px | 215/215 |

- 1000万档原先有 6 个单元格溢出 3px（"16,000,000"），因缩放下限误设为 13px；已恢复数据缩放下限 12px，复测溢出归零。
- 抓取的真实导出 PNG 已存于 `qa/screenshots/2026-08-05-export-v3/`：
  - `yingmanxin_100000_export.png`
  - `yingmanxin_1000000_export.png`
  - `yingmanxin_10000000_export.png`

## 网页一致性
仅改动导出模板（`.exp-*` 类）与 `buildExport` JS；网页 `.main-table`/`.info-table` 垂直居中不受影响，导出图与网页数据、结构保持一致。

## 文件与提交
- 修改：`calculator-yingmanxin.html`
- 截图：`qa/screenshots/2026-08-05-export-v3/*.png`
- 脚本：`qa/_verify_ymx_v3.py`
- 线上：https://1131921527-alt.github.io/xinhua-hub/calculator-yingmanxin.html
