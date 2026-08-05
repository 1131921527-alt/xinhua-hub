# 演算器导出计划书 PNG 排版修改报告

> 目标：把演算器导出的 PNG 从「网页表格截图」改成像**正式保险计划书 / Excel 打印版**——列宽协调、表头不空、储备期合并、数字不挤、蓝白商务风，可直接微信转发客户。

## 一、改了哪些文件
1. `calculator-yingmanxin.html`（盈满鑫，独立导出模板，整体重做）
2. `calculator-hongan.html`（宏安，直接截在线页）
3. `calculator-hongyuan.html`（宏愿，直接截在线页）
4. `calculator-hengxiang.html`（恒享，直接截在线页）
5. `calculator-hongyu.html`（宏御，直接截在线页）

## 二、五类问题逐条处理

### 问题1 · 年度利益演示表格列宽
- **盈满鑫**：原 `colgroup` 把「保单年度 / 年龄」各设 4%（偏宽），金额列被压。重设比例为
  `3.5% / 4.5% / 11%×3 / 10% / 11% / 13% / 15% / 10%`。
  实测列宽精准贴合：年度 25px、年龄 32px、保费/身故/满期约 79px、现价红利 107px。
- **宏安 / 宏愿 / 恒享 / 宏御**：用 `table-layout:fixed` 或无 colgroup 的自适应布局，列宽平均/按内容，**不存在**「保单年度列过宽」，故不适用，未改列宽。

### 问题2 · 表头过高、空白多
- **盈满鑫**：表头 padding 6px→4px、字号 14→13、行高 1.25→1.15；实测表头高 73px（双行标题），更紧凑。
- **四款**：导出（`body.capturing`）下表头 padding 由原 10px 降到 **宏安/宏愿 6px、恒享/宏御 8px**，行高 1.25→1.15，标题允许换行。

### 问题3 · 储备期重复显示
- 五款**原本就已正确合并**：盈满鑫/宏安/宏愿/恒享 在生成时只在首行输出 `rowspan` 单元格；宏御在导出前 `applyReserveRowspan()` 合并可见储备期行。
- 客观验证（Playwright）：在线页仅 1 个「储备期」可见单元格、`rowspan=5`、文字居中。无需额外改动。

### 问题4 · 字体全部加粗→视觉拥挤
- **盈满鑫**：普通数据 `td` 由 `font-weight:600` 改 `400`（正常）；表头/标题保持 700；重点收益数字（生存总利益·现金价值、满期金）加粗 700。
- **宏安 / 宏愿**：`.main-table tbody td` 及参数表 `.info-table td` 由 600 改 400（实测 400），保留表头与年金等强调列加粗。
- **恒享 / 宏御**：数据本就正常字重（仅特定列选择性强调，如现金价值/身故列），**不命中**「全加粗」，未改，保留其强调设计。

### 问题5 · 整体视觉（像正式计划书）
- **盈满鑫**：单元间距收小（box 间距 8→6px、单元格 padding 收紧），保留蓝白商务风（深蓝表头、浅蓝储备期/合计带、斑马纹）；1000 万档自动把数据字号降到 11px 防串格。
- **四款**：保持一致蓝白风，导出强制桌面布局不变。

## 三、验证方式（客观测量，非肉眼）
- **盈满鑫**：Playwright 量 `#exportRoot` —— 列宽精准贴合 colgroup；表头 73px；储备期 1 个 rowspan=3（40岁3年交示例）；普通数据 `fontWeight=400`、表头 `700`、重点数字 `700`。
- **四款**：Playwright 量 `#resultBody` —— 宏安/宏愿/恒享 `reserve=1 (rowspan=5)` 且数据字重 400；宏御 `reserve 可见 1 (rowspan=5)`，数据选择性强调保留。

## 四、交付物（已重新生成，改动后版本）
- 文件：`E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub\export-png\盈满鑫_10万_计划书.png`
- 文件：`E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub\export-png\盈满鑫_100万_计划书.png`
- 文件：`E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub\export-png\盈满鑫_1000万_计划书.png`
- 文件夹：`E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub\export-png\`

## 五、备注
- 宏安/宏愿/恒享/宏御 按需求「检查并同步修复」已完成（代码 + 验证），但**未逐一重新生成它们的导出 PNG**（你原需求只要求盈满鑫三档）。如需四款也各出一张对比图，可马上补生成。
- 改动仅影响「导出 PNG」视觉（四款的修改集中在 `body.capturing` 导出样式或盈满鑫独立模板），不影响在线页面正常浏览。

## 六、第二轮细节修复（基于截图反馈，2026-08-05 19:00）

针对你截图里圈出的三个点，已再次调整 `calculator-yingmanxin.html` 并重新生成三档 PNG。

### 修复点
1. **红色框 · 定存收益明细文字偏下**  
   原因：`fitExportTable` 只处理了 `tbody`，没处理 `tfoot`；`tfoot` 仍保持 `line-height:1.4` 和默认 padding，html2canvas 下 vertical-align 不居中。  
   处理：把 `tbody` / `tfoot` / 无 tbody 的顶层 `tr` 都纳入统一垂直居中逻辑，强制 `line-height = 格高`、`padding = 0`。

2. **黄色框 · 第1保单年度行高比后续高**  
   原因：储备期单元格跨行 `rowspan=3`，其自身高度把首行撑大了。  
   处理：先取「不含 rowspan 的行」的普通单元格最大高度作为统一行高，强制所有普通单元格等高；再把 rowspan 合并单元格高度设为 `统一行高 × 跨行数`，从而不再撑高首行。

3. **绿色框 · 储备期下方白色印子/缝隙**  
   原因：合并单元格没有精确等于跨行总高度，底部露出背景色形成白缝。  
   处理：同上，合并单元格强制高度 = 跨行总高度，并把 `.exp-reserve` 的 padding 由 `4px 2px` 改为 `0`。

### 客观验证（Playwright，100万档）
- 主表 10 行高度全部为 **32px**，差值 0（首行与后续一致）。
- 储备期合并单元格高度 **96px** = 3 行 × 32px，匹配。
- 定存收益合计行单元格 `line-height≈35px`、`padding=0`、`vertical-align=middle`。

### 重新生成的交付物
- `E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub\export-png\盈满鑫_10万_计划书.png`
- `E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub\export-png\盈满鑫_100万_计划书.png`
- `E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub\export-png\盈满鑫_1000万_计划书.png`

## 七、第三轮细节修复（定存收益明细标题条与蓝框重叠，2026-08-05 19:00+）

### 修复点
**绿色方框 · 定存收益明细标题条与蓝色边框/表头重叠**  
原因：`.exp-h` 标题条（深蓝）紧贴 `.exp-box` 的蓝色边框，且下方紧接着同样是深蓝的表格表头，三块蓝色贴在一起，视觉上像蓝线+色块重叠。  
处理：仅给「定存收益明细」区块加 `.dep-box` 类，单独调整：
- `.exp-box.dep-box` 上内边距提到 `10px`；
- 标题条 `margin-top` 由 `-10px` 改为 `-6px`，使其与 `.exp-box` 上边框之间留出约 **4px 白色间隙**；
- 标题条 `margin-bottom` 提到 `14px`，与下方表格表头之间留白 `14px`；
- 标题条加 `border-radius:4px`，让边角柔和，不再像硬边框。

### 客观验证（Playwright，100万档）
- `.exp-box` 上边框外沿到标题条顶部距离 **6px**（含 2px 边框 + 4px 可见白间隙）。
- 标题条底部到 `.exp-dep` 表格顶部距离 **14px**。
- 标题条 `border-radius=4px`。

### 重新生成的交付物
- `E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub\export-png\盈满鑫_10万_计划书.png`
- `E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub\export-png\盈满鑫_100万_计划书.png`
- `E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub\export-png\盈满鑫_1000万_计划书.png`
