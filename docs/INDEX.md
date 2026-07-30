# 新华Hub 文档索引（docs/）

> V1.0 配套文档，按「是什么 → 怎么管 → 怎么测 → 怎么接」组织。
> 所有文档均为设计/规范/分析类，不含业务代码；业务代码改动受 `CODE_RULES.md` 红线约束。

## 一、项目地图与产品知识
- [PROJECT_MAP.md](PROJECT_MAP.md) — 项目目录结构、核心文件作用、可改/禁改/数据源标注
- [PRODUCT_KNOWLEDGE_INDEX.md](PRODUCT_KNOWLEDGE_INDEX.md) — 10 款产品知识索引（含「为什么这样显示」）
- [DATA_SOURCE_MAP.md](DATA_SOURCE_MAP.md) — 数据来源追踪（HTML → 数据文件 → 计算逻辑 → 展示规则）

## 二、开发安全与测试验收
- [CODE_RULES.md](CODE_RULES.md) — 代码安全红线（禁改公式 / Excel / 已验证模板）+ 修改门禁
- [PRODUCT_TEST_CHECKLIST.md](PRODUCT_TEST_CHECKLIST.md) — 每款产品验收清单（10 项通用）
- [rules_scan_report.md](rules_scan_report.md) — 规则层重构全项目扫描报告

## 三、流程与自动化
- [GIT_WORKFLOW.md](GIT_WORKFLOW.md) — Git 分支策略（main → release → feature）
- [AI_DEV_WORKFLOW.md](AI_DEV_WORKFLOW.md) — 未来 AI 自动研发流水线设计

## 四、维护接管与风险
- [AI_HANDOVER_GUIDE.md](AI_HANDOVER_GUIDE.md) — 新 AI 工程师接管说明书
- [CODE_DUPLICATION_REPORT.md](CODE_DUPLICATION_REPORT.md) — 重复代码检测与优化建议（只建议不重构）
- [PROJECT_RISK_REPORT.md](PROJECT_RISK_REPORT.md) — 隐藏风险扫描（只报告不删）

## 五、配套验收脚本
- `../tests/product-rule-check.js` — 自动验收（Node + Playwright），输出 `../tests/last-report.md` 与 `../tests/shots/`
