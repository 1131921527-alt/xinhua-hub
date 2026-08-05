# 盈满鑫导出 PNG 热修复报告

## 问题来源
用户肉眼验收导出图时发现：
1. **储备期合并单元格未显示"储备期"文字**（右列空白），尤其在按年龄过滤后更明显；
2. **产品简介区域排版未调整**，文字密集、段落不分。

## 根因分析
1. `buildExport()` 中储备期单元格使用 `rowspan="${reserveYears}"`，但 `viewMode` 过滤后实际储备期行数可能小于 `reserveYears`，导致 `rowspan` 不匹配、单元格文字被 html2canvas 丢弃；
2. 之前的 canvas 手写"储备期"兜底在 `rowSpan <= 1` 时不会触发，过滤后仅显示 1 行储备期时文字完全丢失；
3. 产品简介使用 `<br>` 硬换行，未形成段落，行距和段落间距无法有效控制。

## 修改内容
**文件：`calculator-yingmanxin.html`**

### 1. 修复储备期合并单元格
- `generate()` 与 `buildExport()` 统一按 **实际显示行数** 计算 `reserveDisplayCount`：
  ```js
  const reserveDisplayCount = displayRows.filter(r => r.yr <= reserveYears).length;
  ```
- 合并条件由 `r.yr === 1` 改为 `idx === 0 && reserveDisplayCount > 0`，避免 viewMode 过滤后首条储备期行不是 `yr=1` 时漏渲染；
- `rowspan` 改为 `${reserveDisplayCount}`，确保与实际行数一致；
- 单元格内直接写入"储备期"文字，不再依赖 canvas 手写兜底；
- 移除 `downloadImage()` 中复杂的 `reserveLabelBox` 与 canvas `fillText` 逻辑，简化代码。

### 2. 优化公司介绍/产品简介排版
- 将 `<br>` 换行改为 `<p>` 段落，每段一个信息点；
- 增加 `.exp-b p { margin: 0 0 8px; }` 段落间距；
- `.exp-b` line-height 由 1.75 提升至 **1.8**；
- `.exp-row2 > .exp-box` padding 由 8px 10px 增至 **10px 12px**；
- `.exp-h` 负边距同步调整，标题栏与内容区对齐。

### 3. 70岁及以上客户自动显示全部年度（解决"高低"问题）
- 新增 `syncViewModeByAge(age)`：当投保年龄 `>= 70` 岁时，自动把显示模式切换为 `"全部显示"`；
- 在 `generate()` 校验通过后调用，确保高龄客户（70 岁及以上）的计划书不再被 "60/70/75 岁后每5年" 模式压缩成稀疏几行；
- 低龄客户默认仍保持 `"60岁后每5年"`，兼顾计划书长度与阅读效率；
- 用户仍可手动点击按钮切换压缩/全部模式。

## 验收结果

| 场景 | 显示模式 | 表格行数 | 储备期文字 | rowspan | 垂直居中 | 溢出 | 双栏等高 | 段落数 |
|------|---------|---------|-----------|---------|----------|------|----------|--------|
| 10万 / 40岁 | 60岁后每5年 | 8 | 储备期 | 3 | ✅ | 0 | [274,274] | 3/4 |
| 100万 / 40岁 | 60岁后每5年 | 8 | 储备期 | 3 | ✅ | 0 | [274,274] | 3/4 |
| 1000万 / 40岁 | 60岁后每5年 | 8 | 储备期 | 3 | ✅ | 0 | [274,274] | 3/4 |
| 100万 / 73岁 | **自动切换为全部显示** | **8** | 储备期 | 3 | ✅ | 0 | [274,274] | 3/4 |

**重点验证**：用户截图同款参数（73岁、100万、3年交、8年期）现在默认自动切换为"全部显示"，8 个保单年度完整呈现，表格不再被压成 3 行，整体"高低"落差消失。

## 产出文件
- `calculator-yingmanxin.html`
- `qa/screenshots/2026-08-05-ymx-hotfix/`
  - `yingmanxin_100000_export.png`
  - `yingmanxin_1000000_export.png`
  - `yingmanxin_10000000_export.png`
  - `yingmanxin_73yo_100w_8yr_autoall_export.png`
  - `mobile_73yo_100w_8yr_autoall.png`

## 提交
- commit: `072bb7c`
- 线上地址：https://1131921527-alt.github.io/xinhua-hub/calculator-yingmanxin.html
