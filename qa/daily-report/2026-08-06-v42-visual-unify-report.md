# V4.2 演算器视觉统一优化验收报告

**日期**: 2026-08-06
**范围**: 4 款主力演算器（宏安/恒享/宏御/宏愿）+ 盈满鑫（参考标准）
**核心目标**: 网页端 = 下载PNG = 手机查看（三场景视觉一致）

---

## 1. 修改文件列表

| 文件 | 状态 | Commit |
|------|------|--------|
| `calculator-hongan.html` (宏安世家) | 修改 | `fde07dd` |
| `calculator-hengxiang.html` (恒享人生) | 修改 | `11643b6` |
| `calculator-hongyu.html` (宏御世家) | 修改 | `4b69155` |
| `calculator-hongyuan.html` (宏愿人生) | 修改 | `dc509f2` |
| `qa/screenshots/*_v42_*.png` (12 张截图) | 新增 | 4 个 commit |

总计：**4 个 HTML + 12 张截图 = 16 文件**，271 行新增，378 行删除。

---

## 2. 每个文件修改内容（统一项）

### 视觉规范
- **标题字体**: title 30→34px / 24→34px / 26→34px（按产品）
- **表格字号**: 17→19px（宏安/宏愿），恒享/宏御 保持 17px
- **信息表**: 14→16px
- **section spacing**: margin-bottom 16→12px，section-head padding 9→8px
- **输入框/按钮**: 13→15px / 15→17px / 16→18px（统一上调）
- **手机端对齐**: title 26→30px, table 15→17px, tip 13→15px

### 导出标准
- **导出宽度**: 1000px → **1200px**（×scale 2 = **2400px PNG**，与盈满鑫一致）
- **新增永久底部免责声明**: `.plan-foot-note` + `.plan-foot-source`（盈满鑫标准）
- **简化 capturing CSS**: 去掉 position:fixed 复杂方案，对齐盈满鑫的 body.capturing 直截方案
- **简化 downloadImage 函数**: 对齐盈满鑫的 try-finally 模式
- **大金额字号自适应兜底**: 19→14px（宏安/宏愿），17→14px（恒享/宏御）

### 手机适配
- 保持 mobile @media 768px 横滑策略（表格内部横滑）
- html/body `overflow-x:hidden` 防止整页溢出
- table-scroll `max-width:100%`

---

## 3. 是否影响其他页面

**无影响**。每个 calculator-*.html 是独立单文件（修改自身内联 CSS + JS）。`theme.css` 和 `calc-common.css` **未修改**。

跨页面回归测试通过：
| 页面 | PC 1280×900 | Mobile 390×844 | Console |
|------|-------------|----------------|---------|
| index.html | ✅ 无溢出 | ✅ 无溢出 | 0 错误 |
| training.html | ✅ 无溢出 | ✅ 无溢出 | 0 错误 |
| sales-qa.html | ✅ 无溢出 | ✅ 无溢出 | 0 错误 |
| calculator-hongan.html | ✅ 无溢出 | ✅ 无溢出 | 0 错误 |
| calculator-hengxiang.html | ✅ 无溢出 | ✅ 无溢出 | 0 错误 |
| calculator-hongyu.html | ✅ 无溢出 | ✅ 无溢出 | 0 错误 |
| calculator-hongyuan.html | ✅ 无溢出 | ✅ 无溢出 | 0 错误 |
| company-intro.html | ✅ 无溢出 | ✅ 无溢出 | 0 错误 |

---

## 4. 手机测试结果（390×844）

| 产品 | 横向溢出 | 按钮可点 | 表格字体 |
|------|---------|---------|---------|
| 宏安世家 | ✅ 无 | ✅ | 17px |
| 恒享人生 | ✅ 无 | ✅ | 15px |
| 宏御世家 | ✅ 无 | ✅ | 15px |
| 宏愿人生 | ✅ 无 | ✅ | 17px |

---

## 5. PNG 测试结果（导出图片）

| 产品 | PNG 尺寸 | scale | 表格行数 | 1000万压测 |
|------|---------|-------|---------|-----------|
| 宏安世家 | 2400×3938px | 2 | 29 | ✅ 2400×4058（字号自动降级后恢复） |
| 恒享人生 | 2400×6246px | 2 | 59 | ✅ 通过 |
| 宏御世家 | 2400×3738px | 2 | 65 | ✅ 通过 |
| 宏愿人生 | 2400×2976px | 2 | 19 | ✅ 通过 |

所有 PNG 与网页一致：标题/双栏介绍/信息表/主表格/底部免责 全部显示，无截断无缺失。

---

## 6. Commit ID

```
dc509f2  V4.2 宏愿人生视觉统一
4b69155  V4.2 宏御世家视觉统一
11643b6  V4.2 恒享人生视觉统一
fde07dd  V4.2 宏安世家视觉统一
```

4 个 commit 已按"完成一个 → 验收 → 截图 → 汇报 → 再进行下一个"流程逐个完成，已 push origin main。

---

## 7. GitHub Pages 状态

✅ **已推送**：
```
a912b63..dc509f2  main -> main
```

约 45 秒后 GitHub Pages 自动构建生效。验收用 Chrome 桌面端访问：
- https://1131921527-alt.github.io/xinhua-hub/calculator-hongan.html
- https://1131921527-alt.github.io/xinhua-hub/calculator-hengxiang.html
- https://1131921527-alt.github.io/xinhua-hub/calculator-hongyu.html
- https://1131921527-alt.github.io/xinhua-hub/calculator-hongyuan.html

⚠️ **微信内置浏览器仍会拦截 github.io**，给客户发的必须是导出的 PNG 图片。

---

## 8. 保留的产品特性（未改动）

- ✅ 计算公式（红线，绝对未改）
- ✅ 产品数据（*.json / *.js 加载）
- ✅ 输入逻辑（年龄/性别/保费/缴费期/红利方式）
- ✅ 收益算法（irr/singleRate/yieldVal）
- ✅ 产品结构：
  - 宏安：10 列表 + 储备期合并 + 终身寿险
  - 恒享：9 列表 + 储备期合并 + 年金险（非分红）
  - 宏御：8 列表 + 储备期合并 + 显示密度切换 + 分红型终身寿险
  - 宏愿：10 列表 + 储备期合并 + 年金起领年龄/方式 + 分红型养老年金
- ✅ 产品特色：宏御的"长期收益/不再缴费"竖排标签保留

---

## 9. 关键验收截图位置

```
E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub\qa\screenshots\
├── hongan_v42_pc.png / mobile.png / export.png / 1000w_export.png / 1000w_v2.png
├── hengxiang_v42_pc.png / mobile.png / export.png
├── hongyu_v42_pc.png / mobile.png / export.png
└── hongyuan_v42_pc.png / mobile.png / export.png
```