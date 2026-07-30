# 新华Hub 数据来源追踪表（DATA_SOURCE_MAP）

> **目的**：记录每个产品「这个数字到底哪里来的」，让未来维护不再像考古。
> 本文档由对 `calculator-*.html` 与目录结构的真实代码扫描得出（2026-07-30），非臆测。
> 配套文档：PROJECT_MAP.md（地图）、PRODUCT_KNOWLEDGE_INDEX.md（产品知识）、CODE_RULES.md（安全红线）。

## 通用数据流向

```
calculator-xxx.html   （展示页面 / 用户看到的演算结果）
   ├─ 数据源  →  xxx_calcdata.js（<script src> 全局变量）  或  xxx.json（运行时 fetch）
   │           或  HTML 内嵌（由 data_*.json 生成脚本产出）
   ├─ 计算逻辑 →  内联 <script> 计算收益率 / 储备期 / 利益演示
   └─ 展示规则 →  product-rules.js（8 款）  或  本地逻辑（福盛世家 / 恒享）
```

## 标记图例

- 📥 **Excel 导入数据**：人工在 `xlsx/` 维护、经生成脚本产出的真源（最权威，禁止手改）
- ⚙️ **代码计算**：HTML 内联 JS 计算的收益率 / 储备期 / 利益演示数值
- 🎨 **页面展示规则**：`product-rules.js` 或本地逻辑控制「显示什么、怎么显示」

## 逐产品数据来源追踪

| # | 产品 | HTML 文件 | 数据文件（真源） | 加载方式 | 计算逻辑位置 | 展示规则来源 | 性质 |
|---|------|-----------|------------------|----------|--------------|--------------|------|
| 1 | 盈满鑫 | calculator-yingmanxin.html | data_yingmanxin.json（源） | 内嵌（由 json 生成） | 内联 | product-rules.js · payterm | 📥⚙️🎨 |
| 2 | 宏御 | calculator-hongyu.html | hongyu_data.json（源） | 内嵌 | 内联（含内联读配置） | product-rules.js · fixed 5 | 📥⚙️🎨 |
| 3 | 宏安 | calculator-hongan.html | data_hongan.json（源） | 内嵌 | 内联 | product-rules.js · fixed 5 | 📥⚙️🎨 |
| 4 | 宏泰 | calculator-hongtai.html | hongtai_full.json / hongtai_calc_data.json | 运行时 fetch | 内联 | product-rules.js · fixed 5 | 📥⚙️🎨 |
| 5 | 宏愿 | calculator-hongyuan.html | data_hongyuan.json（源） | 内嵌 | 内联 | product-rules.js · fixed 5 | 📥⚙️🎨 |
| 6 | 宏禧来 | calculator-hongxilai.html | data_hongxilai.json（源） | 内嵌 | 内联 | product-rules.js · dynamic（rate<=0） | 📥⚙️🎨 |
| 7 | 华彩 | calculator-huacai.html | 内嵌（主目录未见独立源 json） | 内嵌 | 内联 | product-rules.js · fixed 5 / showRate=false | 📥⚙️🎨 |
| 8 | 宏坤 | calculator-hongkun.html | hongkun_calcdata.js | `<script src>` 全局变量 | 内联 | product-rules.js · fixed 5 / showRate=false | 📥⚙️🎨 |
| 9 | 福盛世家 | calculator-fusheng.html | fusheng_calcdata.js | `<script src>` 全局变量 | 内联（本地 reserveYears=5） | 本地逻辑（不进规则层） | 📥⚙️🎨 |
| 10 | 恒享 | calculator-hengxiang.html | hengxiang_calcdata.js | `<script src>` 全局变量 | 内联（无储备期） | 本地逻辑（无储备期概念） | 📥⚙️ |

> ⚠️ **宏泰更正**：此前索引文档写的「外部 hongtai_calcdata.js」有误。真实情况是——主目录虽存在 `hongtai_calcdata.js`，但**无任何文件引用它**；宏泰实际通过运行时 `fetch('hongtai_full.json')` 加载数据（参见 calculator-hongtai.html:229 注释）。请以本表为准，并见 PROJECT_RISK_REPORT.md。

## 共享 / 公共数据文件

| 文件 | 作用 | 引用方 | 性质 |
|------|------|--------|------|
| product-rules.js | 8 款产品规则配置（key/reserveType/showRate + 工具函数） | 8 个 calculator | 🎨 配置（可改） |
| ai-planner.js | 产品路由 / URL 参数 / 微信文案 | index.html | ⚙️ 共享工具（谨慎） |
| html2canvas.min.js | 页面截图库 | 10 个 calculator | ⚙️ 第三方库（勿改） |
| data.json | 首页产品列表数据 | index.html（fetch） | 📥 数据 |
| dividend.json | 分红率表（扫描未见引用） | 待确认 | ⚠️ 疑似孤儿 |
| hongtai_calcdata.js | 宏泰数据（扫描未见任何引用） | 无 | ⚠️ 孤儿文件 |

## 禁止修改区 & 正确修改流程

- 🔴 **禁止手改**：所有 `*_calcdata.js`、各 `data_*.json`、`xlsx/*.xlsx`、收益率公式、利益演示数值、已验证页面模板。
- ✅ **改数据正确流程**：在 `xlsx/` 改 Excel → 跑生成脚本 → 跑 `node tests/product-rule-check.js` 回归 → 人工核对 `tests/shots/` 截图。

## 风险附注

- `hongtai_calcdata.js` 存在于主目录但无任何引用（宏泰改用 JSON），属孤儿数据文件——**勿手改、勿删除**，待确认后归档（见 PROJECT_RISK_REPORT.md）。
- `dividend.json` 在本次扫描的 html/js 中未见引用，需确认是否仍在使用。

---

> ⚠️ **本次任务总限制**：仅允许 读取 → 分析 → 输出文档。
> 禁止：删除文件 / 移动文件 / 修改业务代码 / 提交 Git / 合并分支。
