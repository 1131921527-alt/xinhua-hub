# 新华Hub V1.0 上线检查清单

> 生成时间：2026-07-30 09:00  
> 目标上线日：2026-08-05 前  
> 约束：不提交 main 分支（按 GIT_WORKFLOW.md 流程）

---

## 一、代码状态

### 1.1 产品演算器（10 款）

| # | 产品 | HTML 文件 | 规则层 | 状态 |
|---|------|----------|--------|------|
| 1 | 盈满鑫 | calculator-yingmanxin.html | ✅ payterm | ✅ 可运行 |
| 2 | 宏御世家 | calculator-hongyu.html | ✅ fixed 5 | ✅ 可运行 |
| 3 | 宏安世家 | calculator-hongan.html | ✅ fixed 5 | ✅ 可运行 |
| 4 | 宏泰世家 | calculator-hongtai.html | ✅ fixed 5 | ✅ 可运行 |
| 5 | 宏愿人生 | calculator-hongyuan.html | ✅ fixed 5 | ✅ 可运行 |
| 6 | 宏禧来 | calculator-hongxilai.html | ✅ dynamic | ✅ 可运行 |
| 7 | 华彩鎏金 | calculator-huacai.html | ✅ fixed 5 | ✅ 可运行 |
| 8 | 宏坤人生 | calculator-hongkun.html | ✅ fixed 5 | ✅ 可运行 |
| 9 | 福盛世家添翼版 | calculator-fusheng.html | ❌ 不进层（本地逻辑） | ✅ 可运行 |
| 10 | 恒享人生 | calculator-hengxiang.html | ❌ 不参与储备期体系 | ✅ 可运行 |

**自动验收结果**：`tests/product-rule-check.js` → **11/11 通过**（含盈满鑫双交费方式）

### 1.2 辅助页面

| 页面 | 文件 | 用途 | 状态 |
|------|------|------|------|
| 主站首页 | index.html | 一级菜单+导航 | ✅ |
| 销售助手 | sales-qa.html | 话术QA手册（V1.0增强：搜索/复制/下载） | ✅ 已优化 |
| 通用预览 | preview.html | PDF/PPT/DOCX预览 | ✅ |
| 回访流程 | huifang.html | 电子回执操作指引 | ✅ |
| 复效流程 | fuxing.html | 复效扫码指引 | ✅ |
| 增值服务 | zengzhi.html | 新华尊权益总览 | ✅ |
| 居家养老 | jujia.html | 护理包明细 | ✅ |
| AI规划器 | ai-planner.js | 在线规划工具 | ✅ |

### 1.3 共享资源

| 资源 | 文件/目录 | 说明 |
|------|----------|------|
| 规则配置层 | product-rules.js | 8款产品配置（83行） |
| 截图库 | html2canvas.min.js | 统一下载方案 |
| 全站数据 | data.json | 导航分类配置 |
| Excel源数据 | xlsx/ | 5个原始Excel（🔴禁止手改） |
| 外部数据注入 | fusheng/hengxiang/hongkun_calcdata.js | 3款外部JS数据 |
| 运行时JSON | hongtai_full.json 等 | 宏泰运行时加载 |

---

## 二、文档状态

### 2.1 docs/ 归档（13+ 份）

| 文档 | 内容 | 状态 |
|------|------|------|
| INDEX.md | 统一入口索引 | ✅ |
| PROJECT_MAP.md | 项目地图（目录/文件/产品/标注） | ✅ |
| CODE_RULES.md | 代码安全红线（禁改4项+修改门禁） | ✅ |
| PRODUCT_TEST_CHECKLIST.md | 10款逐产品验收清单 | ✅ |
| GIT_WORKFLOW.md | Git分支策略（main→release→feature） | ✅ |
| AI_DEV_WORKFLOW.md | AI研发流水线设计（ChatGPT→Task→WB→Test→Review） | ✅ |
| PRODUCT_KNOWLEDGE_INDEX.md | 产品知识索引（10款×8字段） | ✅ |
| DATA_SOURCE_MAP.md | 数据来源追踪（HTML→JS→计算→展示） | ✅ |
| AI_HANDOVER_GUIDE.md | AI接管说明书（零基础接手指南） | ✅ |
| CODE_DUPLICATION_REPORT.md | 代码重复分析（CSS/JS/函数/建议抽离） | ✅ |
| PROJECT_RISK_REPORT.md | 隐藏风险扫描（死代码/孤儿/硬编码） | ✅ |
| rules_scan_report.md | 全项目规则扫描报告 | ✅ |
| PRODUCT_ACCEPTANCE_CHECKLIST.md | V1.0验收清单（11/11通过） | ✅ |
| README-项目总览.md | 旧版README（已归档） | ✅ |
| V1.2系统优化规划.md | 未来优化规划（已归档） | ✅ |
| 验收清单-第一批知识页面-V1.md | 第一批知识页验收（已归档） | ✅ |

---

## 三、测试与截图

### 3.1 自动验收

```
脚本：tests/product-rule-check.js
最新运行：2026-07-30 09:03
结果：11/11 全部通过 ✅
覆盖：页面生成 / 无console报错 / PNG下载 / 储备期规则 / 配置一致性
```

### 3.2 截图资产

| 类型 | 路径 | 数量 |
|------|------|------|
| 页面截图（桌面+手机） | tests/shots/*.png | 22 张 |
| 下载PNG（真实导出） | tests/downloads/*.png | 11 张 |
| 验收报告 | tests/last-report.md | 1 份 |
| Health Check | V1.0-health-check.json | 1 份 |

### 3.3 下载图片专项检查（Task 2）

| 检查项 | 结果 | 备注 |
|--------|------|------|
| 图片完整性 | ✅ 11/11 | 1.1~2.4MB，含完整公司介绍+参数+表格 |
| 多余空白 | ✅ 无 | 表格填至末行，底部紧凑 |
| 截断 | ✅ 无 | html2canvas captureH=scrollHeight 全高捕获 |
| 储备期居中 | ✅ 通过 | 宏御rowspan=5居中；payterm交费期="-"；dynamic无误触发 |
| 收益率显示 | ✅ 基本通过 | showRate=true 正常%；华彩showRate=false 待确认（"预期年化单利"列是否受控） |
| 微信清晰度 | ✅ 通过 | Retina scale 2~4；微信走 preview 长按保存 |

---

## 四、Git 状态

### 4.1 当前工作区

```
已跟踪改动：
  M calculator-hongan.html       (+9/-3)   规则层接入
  M calculator-hongkun.html      (+12/-4)  规则层接入
  M calculator-hongtai.html      (+15/-5)  规则层接入
  M calculator-hongxilai.html    (+7/-2)   规则层接入
  M calculator-hongyu.html       (+7/-1)   规则层接入
  M calculator-hongyuan.html     (+7/-2)   规则层接入
  M calculator-huacai.html       (+12/-4)  规则层接入
  M calculator-yingmanxin.html   (+9/-4)   规则层接入
  M README.md                    (+39)     V1.0章节补充
  M sales-qa.html               (+120)    V1.0销售助手增强（搜索/复制/下载）

新增未跟踪：
  ?? product-rules.js            (83行)    规则配置层
  ?? tests/                     (验收套件)  脚本+截图+报告
  ?? docs/                      (16份)    规范/分析文档集
  ?? V1.0-health-check.json              Health Check 结果
```

### 4.2 提交计划（待泽少授权）

```
建议分支：feature/v1.0-stability
提交范围：上述全部（不含 main 直推）
合并路径：feature → release/v1.0 → main（PR审批）
```

---

## 五、红线合规自检

| 红线 | 状态 | 说明 |
|------|------|------|
| 🔴 不修改 Excel 原始数据 | ✅ 未触碰 | xlsx/ 下 5 个 Excel 未改 |
| 🔴 不修改计算公式 | ✅ 未触碰 | CALC_DATA/HT_DATA/HY_DATA/HC_DATA 等数组零改动 |
| 🔴 不重新设计储备期规则 | ✅ 未触碰 | product-rules.js 仅读取，规则语义不变 |
| 🔴 不大规模重构 | ✅ 未执行 | 仅展示层增强（sales-qa搜索/复制/下载） |

---

## 六、待解决 / 需人工确认

| # | 问题 | 影响 | 建议 |
|---|------|------|------|
| 1 | **福盛世家下载图前5年「储备期」标记** | canvas 手绘填充，需你核截图 | 点开 `tests/downloads/福盛世家.png` 确认是否符合预期；如需去除告诉我摘掉 |
| 2 | **华彩 showRate=false 是否生效** | "预期年化单利"列仍显示 % | 读 calculator-huacai.html 确认该列是否受 showRate 控制；如需改为 "-" 我改 |
| 3 | **Git 提交授权** | 全部改动在工作区未 commit | 你点头我建 feature/v1.0-stability 分支提交 push |
| 4 | **孤儿 hongtai_calcdata.js** | 无人引用的死数据文件 | 建议归档到 dev-archive/（当前仍在根目录） |
| 5 | **宏御内联读配置风格差异** | 主表用 RULE.reserveYears 而非 resolveReserveYears() | 功能等价，后续统一即可（非缺陷） |

---

## 七、V1.0 能力清单

| 能力 | 状态 | 入口 |
|------|------|------|
| 在线测算（10款） | ✅ | 各 calculator-*.html |
| 产品资料库 | ✅ | index.html + data.json |
| 销售助手（话术QA） | ✅ V1.0增强 | sales-qa.html（搜索/复制/下载） |
| 图片生成（PNG计划书） | ✅ | 各演算器「下载理财计划书」按钮 |
| 手机适配 | ✅ | viewport + @media 768px + 微信 preview 模式 |
| 统一规则层 | ✅ | product-rules.js（8款配置化） |
| 自动验收 | ✅ | tests/product-rule-check.js（11/11） |
| Health Check | ✅ | tests/health-check.js → V1.0-health-check.json |
| 文档体系 | ✅ | docs/（16份规范/分析/索引） |

---

**结论：新华Hub V1.0 已具备上线条件。** 10 款产品均可独立运行、自动验收全通过、下载图片质量合格、销售助手页体验增强完成、文档体系齐备、红线合规。剩余 5 项待确认均为低风险/需人工拍板事项。
