# 首页宏禧来入口调整 · 验收报告

**日期**: 2026-08-06
**范围**: `index.html` 首页"产品在线测算"入口 + `data.json` 产品分类
**背景**: 用户指出首页"产品在线测算"第 6 张卡片错放"盈满鑫解读"（一页通资料页，非计算器），属于分类错误。

---

## 1. 修改文件列表

| 文件 | 状态 | 说明 |
|------|------|------|
| `index.html` | 修改 | 首页产品卡片硬编码段（1152–1186）|
| `data.json` | 修改 | 产品分类：product-calculators / product-intro |

## 2. 修改内容

- **首页第 6 张卡片**：由"盈满鑫解读"（`intro-yingmanxin.html`）改为"宏禧来"（`calculator-hongxilai.html`），标签 `两全险 / 分红型`，按钮"进入测算"。
- **data.json 分类调整**：`盈满鑫解读`（`intro-yingmanxin.html`）从 `product-calculators`（演算器）分类**移至** `product-intro`（产品介绍）分类。它本就是资料/一页通页，不该占演算器入口位。
- `宏禧来` 本就已在 `product-calculators` 演算器分类中（分红型两全险/趸交），未动。
- **未改**任何计算公式 / 产品数据 / 产品展示结构 / 演算器页面。仅调整入口分类与首页卡片链接。

## 3. 是否影响其他页面

- 仅动 `index.html` 与 `data.json`。`data.json` 只影响首页由它驱动的资料库 tabs 归类；宏禧来仍在演算器分类、盈满鑫解读归入产品介绍，两页均正常渲染。
- **宏安 / 宏御 / 宏愿 未改动**（V4.2 已达标，本任务仅首页 + data.json）。
- 验收（Playwright，PC 1280×900 + 手机 390×844）：**全 PASS**
  - 无横向溢出（sw ≤ iw+2）
  - 测算卡片数 = 6，第 6 卡链接 = `calculator-hongxilai.html`、名称 = 宏禧来
  - 资料区带出 `intro-yingmanxin.html`（盈满鑫解读）+ `calculator-hongxilai.html`（宏禧来计算器）
  - Console 错误 = 0
  - 截图：`qa/screenshots/2026-08-06/index_pc.png`、`index_mobile.png`

## 4. Commit / 线上状态

- commit `529683d`，已 push `e44f42e..529683d`
- 线上约 45 秒后生效：https://1131921527-alt.github.io/xinhua-hub/
- ⚠️ 微信内置浏览器拦截 github.io，验收用 Chrome 桌面端
