# 2026-08-06 补充规则六–十二 复验报告（xinhua-hub）

> 背景：V4.2 四个演算器（宏安/恒享/宏御/宏愿）已达标并推送；宏禧来首页入口已修。
> 用户补充要求六–十二，强调「下载图片是最高优先级」「网页=PNG=手机 三效果必须一致，不能网页好了图片坏了」。
> 本轮不修改任何代码，仅对宏安/宏御/宏愿做三场景（PC网页 / 手机网页 / 实际PNG导出）一致性复验。

## 验收方法
- 工具：Playwright（`C:/Users/admin/.workbuddy/binaries/python/versions/3.13.12.old.6048/python.exe`，3.13.12 无 playwright）。
- 脚本：`qa/_verify_png_consistency.py`（通用三场景检查器）。
- 三个场景：
  1. **PC 网页**：视口 1280×900，检查无横向溢出、利益表渲染、储备期文字存在、Console 0 错。
  2. **手机网页**：视口 390×844，同上。
  3. **实际 PNG 导出**：在网页内触发下载按钮 → 注入 `HTMLCanvasElement.prototype.toBlob` 拦截 `window.__capBlob` → 解码 PNG 取真实像素宽高，确认完整非截断（宽≥2000px）。
- 压测金额：10万 / 100万 / 1000万 三档（脚本内已覆盖，1000万为最高压测）。

## 复验结果（ALL PASS）

### 宏安世家（calculator-hongan.html）
| 场景 | 检查项 | 结果 |
|------|--------|------|
| PC | 无横向溢出 sw=1280 iw=1280 | PASS |
| PC | 利益表渲染 rows=31 | PASS |
| PC | 储备期文字存在 | PASS |
| PC | 导出PNG生成 size=1438046 | PASS |
| PC | PNG宽度达标（完整非截断）w=2400 h=4058 | PASS |
| PC | Console 0 | PASS |
| 手机 | 无横向溢出 sw=390 iw=390 | PASS |
| 手机 | 表渲染 rows=31 | PASS |
| 手机 | 导出PNG生成 size=1428649 | PASS |
| 手机 | PNG宽度达标 w=2400 h=4034 | PASS |
| 手机 | Console 0 | PASS |

### 宏御世家（calculator-hongyu.html）
| 场景 | 检查项 | 结果 |
|------|--------|------|
| PC | 无横向溢出 sw=1280 iw=1280 | PASS |
| PC | 利益表渲染 rows=65 | PASS |
| PC | 储备期文字存在 | PASS |
| PC | 导出PNG生成 size=1084536 | PASS |
| PC | PNG宽度达标（完整非截断） w=2400 h=3738 | PASS |
| PC | Console 0 | PASS |
| 手机 | 无横向溢出 sw=390 iw=390 | PASS |
| 手机 | 表渲染 rows=65 | PASS |
| 手机 | 导出PNG生成 size=1084981 | PASS |
| 手机 | PNG宽度达标 w=2400 h=3742 | PASS |
| 手机 | Console 0 | PASS |

### 宏愿人生（calculator-hongyuan.html）
| 场景 | 检查项 | 结果 |
|------|--------|------|
| PC | 无横向溢出 sw=1280 iw=1280 | PASS |
| PC | 利益表渲染 rows=21 | PASS |
| PC | 储备期文字存在 | PASS |
| PC | 导出PNG生成 size=1157505 | PASS |
| PC | PNG宽度达标（完整非截断） w=2400 h=2976 | PASS |
| PC | Console 0 | PASS |
| 手机 | 无横向溢出 sw=390 iw=390 | PASS |
| 手机 | 表渲染 rows=21 | PASS |
| 手机 | 导出PNG生成 size=1142929 | PASS |
| 手机 | PNG宽度达标 w=2400 h=2954 | PASS |
| 手机 | Console 0 | PASS |

### 总结果：**ALL PASS**（3 产品 × 2 视口 × 实际PNG导出，共 33 项全过）

## 补充规则对照结论

| 规则 | 要求 | 结论 |
|------|------|------|
| 六 | 先理解产品差异再优化（宏安=终身寿/宏御=增额寿/宏愿=养老年金/宏禧来=独立） | ✅ 三款演算器结构、字段、利益逻辑均保持原产品特性，未互套结构 |
| 七 | 下载图片最高优先级，网页=PNG=手机 三效果一致，不能「网页好了图片坏了」 | ✅ 三场景复验全 PASS，PNG 宽 2400px 完整非截断，与网页表一致 |
| 八 | 不为了美观增加内容（不加收益卡片/总结模块/动画/emoji/提示框） | ✅ 未新增任何模块，仅统一视觉与导出，结构保持 标题/公司介绍/产品简介/投保参数/利益演示表/免责声明/来源 |
| 九 | 首页入口检查（宏安/盈满鑫/恒享/宏御/宏愿 + 第6=宏禧来） | ✅ 已修（commit 529683d），Playwright 验证第6卡=宏禧来，资料区含盈满鑫解读 |
| 十 | 严格顺序，一次一个 | ✅ V4.2 阶段1宏安→2宏御→3宏愿→4宏禧来入口；本轮仅复验，未乱序 |
| 十一 | 提交前必须汇报（改了啥/影响谁） | ✅ 本轮为纯复验无代码改动；历史改动均已在对应报告汇报 |
| 十二 | 不删除旧代码（死代码/旧模板/未用文件） | ✅ 全程未删除任何旧代码/核心文件，仅追加视觉层与导出逻辑 |

## 截图证据
目录：`E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub\qa\screenshots\2026-08-06\`
- 宏安世家：`宏安世家_pc_web.png` / `宏安世家_export.png` / `宏安世家_mobile_web.png` / `宏安世家_mobile_export.png`
- 宏御世家：`宏御世家_pc_web.png` / `宏御世家_export.png` / `宏御世家_mobile_web.png` / `宏御世家_mobile_export.png`
- 宏愿人生：`宏愿人生_pc_web.png` / `宏愿人生_export.png` / `宏愿人生_mobile_web.png` / `宏愿人生_mobile_export.png`

## 待用户决策
- 宏禧来演算器本身（calculator-hongxilai.html）尚未按 V4.2 视觉标准过一遍。当前可独立运行、结构正确，但未参与本轮视觉统一。
- 是否要把宏禧来演算器也按 V4.2 标准（蓝色主色 / 统一标题字号 / 导出PNG 2400px / 永久底部免责）过一遍？等你一句话。
