# 新华Hub V1.0 产品验收清单

> 生成时间：2026-07-30
> 验收方式：`node tests/product-rule-check.js`（Node + Playwright，内置静态服务器）
> 本次结果：**11/11 通过**（福盛世家标「人工确认」）
> 截图目录：`tests/shots/`（每款 × 桌面 1280×900 / 手机 390×844）
> 自动报告：`tests/last-report.md`

## 判定口径
- **主表**：储备期展示符合 `product-rules.js` 规则（合并单元格 rowspan 年数正确、收益率/「-」展示正确）。
- **PNG**：点击下载能产出有效 PNG（文件头签名校验通过）。
- **移动端**：390×844 视口正常生成、无 console 报错、截图成功。
- **状态**：✅ 通过 / ⚠️ 人工确认（脚本无法 DOM 断言，需人工看截图）。

## 验收明细

| # | 产品名称 | 规则（reserveType / showRate） | 主表 | PNG | 移动端 | 状态 | 备注 |
|---|----------|-------------------------------|------|-----|--------|------|------|
| 1 | 盈满鑫 | payterm（储备期=交费期） | ✅ | ✅ | ✅ | ✅ 通过 | 3年交 / 5年交均验证 |
| 2 | 宏御 | fixed 5 · showRate=true | ✅ | ✅ | ✅ | ✅ 通过 | 主表内联读配置（风格差异，非缺陷） |
| 3 | 宏安 | fixed 5 · showRate=true | ✅ | ✅ | ✅ | ✅ 通过 | |
| 4 | 宏泰 | fixed 5 · showRate=true | ✅ | ✅ | ✅ | ✅ 通过 | 储备期已与缴费期解耦 |
| 5 | 宏愿 | fixed 5 · showRate=true | ✅ | ✅ | ✅ | ✅ 通过 | |
| 6 | 宏禧来 | dynamic `rate<=0` · showRate=true | ✅ | ✅ | ✅ | ✅ 通过 | 收益率≤0 阶段判为储备期 |
| 7 | 华彩 | fixed 5 · showRate=false | ✅ | ✅ | ✅ | ✅ 通过 | 储备期后显示「-」 |
| 8 | 宏坤 | fixed 5 · showRate=false | ✅ | ✅ | ✅ | ✅ 通过 | 储备期后显示「-」 |
| 9 | 福盛世家 | 本地逻辑 reserveYears=5（不进规则层） | ⚠️ 人工 | ✅ | ✅ | ⚠️ 人工确认 | 主表无储备期列，仅下载 canvas 手绘，需人工核截图 |
| 10 | 恒享 | 不参与储备期体系 | ✅ 不适用 | ✅ | ✅ | ✅ 通过 | 无储备期 / 收益率概念 |

> 注：盈满鑫含 3年交 / 5年交两个用例，合计 11 个验收用例。

## 结论
- **8 款规则层产品**（盈满鑫/宏御/宏安/宏泰/宏愿/宏禧来/华彩/宏坤）：主表显示、PNG 下载、移动端渲染、无 console 报错，全部 ✅ 通过。
- **福盛世家**：下载与主表生成正常，但储备期仅存在于下载 canvas，主表无该列，脚本无法 DOM 断言 → 标「人工确认」，需王老板核 `tests/shots/福盛世家_def_desktop.png` 下载图中前 5 年标记是否符合预期。
- **恒享**：按设计不参与储备期体系，验收通过。

## 复跑方法
```bash
cd xinhua-hub
export NODE_PATH="C:/Users/admin/.workbuddy/binaries/node/workspace/node_modules"
PORT=8831 "C:/Users/admin/.workbuddy/binaries/node/versions/22.22.2/node.exe" tests/product-rule-check.js
```
报告写入 `tests/last-report.md`，截图写入 `tests/shots/`。
