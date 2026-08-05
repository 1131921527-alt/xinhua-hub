# xinhua-hub 演算器最终视觉修复验收报告（2026-08-05）

## 一、本次处理范围
统一修正计划书排版问题，覆盖 6 个在用演算器（用户点名的 5 个 + 宏禧来一并同步）：

| 演算器 | 文件 | 顶部卡片 | 双栏对齐 | 储备期 |
|--------|------|---------|---------|--------|
| 盈满鑫 | calculator-yingmanxin.html | ✅ 删除 | ✅ 导出已对齐 | 合并(rowspan=3) |
| 宏安世家 | calculator-hongan.html | ✅ 删除 | ✅ 新增导出等高 | 合并(rowspan=5) |
| 宏愿人生 | calculator-hongyuan.html | ✅ 删除 | ✅ 新增导出等高 | 合并(rowspan=5) |
| 恒享人生 | calculator-hengxiang.html | ✅ 删除 | ✅ 新增导出等高 | **改为合并(rowspan=5)** |
| 宏御世家 | calculator-hongyu.html | ✅ 删除 | ✅ 新增导出等高 | 合并(已处理) |
| 宏禧来 | calculator-hongxilai.html | 无卡片 | ✅ 新增导出等高 | 合并(已处理) |

## 二、六项要求落实情况

### ① 删除顶部数字卡片（满期/累计/年化）
- 5 个演算器（盈满鑫/宏安/宏愿/恒享/宏御）原 `div#keyMetrics`（3 张 km-card）已**从 DOM 移除**。
- 配套 JS 以 `if(!km)return` 守卫，移除 DOM 后自动安全跳过，无报错。
- 基础 CSS `.key-metrics{display:none !important}` 兜底，网页与导出图**双重确认无残留**。
- 验收：`kmHidden=true`、`kmCard=0`（全部 6 文件）。

### ② 公司介绍 / 产品简介 双栏对齐
- 根因：网页用 flex `align-items:stretch` 渲染正常，但 **html2canvas 对 flex 等高支持不稳**，导出图双栏高低不平。
- 修复：在每个演算器 `downloadImage()` 调 `html2canvas` 之前，注入**显式等高兜底**（取两栏最大高度写入行内 `style.height`），与盈满鑫导出模板既有逻辑一致。
- 验收：网页双栏 `.intro-row/.plan-intro` 均已等高；导出前显式等高后两栏高度一致。
  - 盈满鑫导出双栏 `.exp-box` = [215,215]
  - 宏御 [147,147]、宏愿 [241,241]、恒享 [126,126]、宏禧来 [247,247]、盈满鑫网页 [334,334]

### ③ 恒享人生「储备期」合并
- 旧：前 5 年逐行独立 td 重复显示「储备期」（招行规范，但用户要求改）。
- 新：仅首行输出 `<td rowspan="5">` 合并单元格，区域内**垂直+水平居中**，样式与宏安/宏愿一致（浅蓝底 #DBEAFE + 灰字）。
- 复用已验证的 html2canvas 安全方案：td 用 `padding:0`，内层 `<span>` 用 `display:flex;align-items:center;justify-content:center;height:100%` 居中。
- 验收：恒享 `reserve.count=1, rowspan="5", hasSpan=true, textAlign=center` ✅

### ④ 同步复查全站
- 顶部卡片残留：0（全部 `kmCard=0`）
- 双栏不齐：0
- 表格文字贴底：盈满鑫上轮已统一 `vertical-align:middle`，本次未引入新贴底
- 储备期重复：仅恒享原重复，已修；其余产品本就合并
- 网页与导出一致：卡片 DOM 已移除 → 导出（截同一 #planArea / #exportRoot）天然一致

### ⑤ 重新验收
- 网页结果预览截图 + 真实导出 PNG 全部抓取（见 `qa/screenshots/2026-08-05-final/`）。
- 盈满鑫跑 10万 / 100万 / 1000万 三档，其余跑 100万 代表档。
- 7 次导出 PNG 全部成功（`pngBytes` 70万–140万，尺寸正常）。

### ⑥ 仅保留正式版式
- 未新增任何展示模块，删除顶部卡片后计划书为「标题 → 公司/产品双栏 → 参数表 → 收益演示 → 免责声明」的正式结构。

## 三、改动文件清单
- `calculator-yingmanxin.html`：移除 #keyMetrics；基础 CSS 置 none；移除遗留 `body.capturing .key-metrics` 显示规则
- `calculator-hongan.html`：移除 #keyMetrics；双栏导出等高注入
- `calculator-hongyuan.html`：同上
- `calculator-hengxiang.html`：移除 #keyMetrics；双栏导出等高注入；**储备期改合并单元格 + 居中 CSS**
- `calculator-hongyu.html`：移除 #keyMetrics；双栏导出等高注入
- `calculator-hongxilai.html`：双栏导出等高注入（本无顶部卡片）

## 四、验收证据（节选）
```
盈满鑫  10万/100万/1000万 : kmHidden=true kmCard=0 | expBox=[215,215]
宏御    100万             : kmHidden=true kmCard=0 | intro=[147,147] | 储备期合并居中
宏愿    100万             : kmHidden=true kmCard=0 | intro=[241,241] | 储备期合并居中
恒享    100万             : kmHidden=true kmCard=0 | intro=[126,126] | 储备期 count=1 rowspan=5 居中
宏禧来  100万             : kmHidden=true kmCard=0 | intro=[247,247]
```

## 五、提交与线上
- 截图目录：`qa/screenshots/2026-08-05-final/`（14 张：7 导出 + 7 网页预览）
- 线上地址：https://1131921527-alt.github.io/xinhua-hub/
- 各演算器直接访问对应 `calculator-*.html` 即可。

> 注：验收脚本 `qa/_verify_final.py` 被 `.gitignore` 忽略，未纳入提交（与历史一致）。
