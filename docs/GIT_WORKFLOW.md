# 新华Hub Git 分支策略（GIT_WORKFLOW）

> **目的**：设计新华Hub 未来开发流程，明确分支模型与 AI 角色配合方式。
> **核心原则**：**不要直接修改 `main`**。
> **生成日期**：2026-07-30。本文只写方案，**不执行任何 Git 操作**。

---

## 0. 核心原则

- `main` 永远受保护，只接收经审核、测试通过的代码。
- 任何修改都从分支发起，禁止在 `main` 上直接 commit。
- 每次合并须经「测试 + diff 审核」两道门禁（见 `CODE_RULES.md`）。

---

## 1. 分支模型

```
main            (受保护 · 生产基线，仅经 PR 合入)
 │
 └── release/*  (预发 / 验收分支，从 main 拉，合回 main 须 PR + 审核)
       │
       └── feature/*  (功能 / 修复分支，从 release 或 main 拉，合回 release)
```

| 分支 | 来源 | 去向 | 用途 |
|---|---|---|---|
| `main` | — | 仅合入 `release` | 线上生产基线 |
| `release/<版本>` | `main` | 合入 `main`（PR） | 集成多 feature、跑全量验收 |
| `feature/<任务>` | `release` 或 `main` | 合入 `release`（PR） | 单任务开发 / 修复 |

> 连字符分支命名（如 `feature/yingmanxin-reserve-rule`），与历史约定一致（验收任务即用连字符测试分支）。

---

## 2. 标准工作流（每次修改）

```
创建分支
   ↓  git checkout -b feature/<任务>  (从 release 或 main)
修改
   ↓  WorkBuddy 在分支上实现（遵守 CODE_RULES 红线）
测试
   ↓  重跑 node tests/product-rule-check.js，须 11/11 通过
diff 审核
   ↓  Codex / 人工 review  diff，确认未碰禁改项、逻辑正确
合并
   ↓  PR → release → (验收后) → main，禁止直推 main
```

### 步骤门禁

| 步骤 | 门禁条件 | 不通过后果 |
|---|---|---|
| 创建分支 | 分支名规范、基于正确上游 | 退回重开 |
| 修改 | 仅动允许区域（CODE_RULES §1） | 触碰红线立即回退 |
| 测试 | `tests/last-report.md` 全绿 | 禁止合并，回修改 |
| diff 审核 | 无禁改项、逻辑清晰 | 打回修改 |
| 合并 | PR 审批通过 | 不得直推 main |

---

## 3. 与 AI 角色配合

| 角色 | 在流程中的位置 | 职责 |
|---|---|---|
| **ChatGPT** | 起点 | 拆解需求 → 写验收标准（task spec）→ 决定是否建 `feature/*` 分支 |
| **WorkBuddy** | 修改阶段 | 在 `feature/*` 分支实现代码；严格遵守 `CODE_RULES.md` 红线；产出 diff |
| **Codex** | diff 审核阶段 | 独立 review diff：确认未碰禁改项、逻辑正确、无副作用 |
| **Test（自动）** | 测试门禁 | 运行 `product-rule-check.js`，全绿才放行（参考 `PRODUCT_TEST_CHECKLIST.md`） |
| **人类** | 合并审批 | 最终审批 PR 合入 `release` / `main` |

> 完整流水线设计见 `AI_DEV_WORKFLOW.md`：`ChatGPT → Task → WorkBuddy → Test → Codex Review → Next Task`。

---

## 4. 提交 / PR 规范

- 提交信息：`类型: 简述`（如 `feat: 新增宏坤进规则层` / `fix: 修复盈满鑫5年交储备期`）。
- PR 描述须含：改动范围、是否触碰禁改项（CODE_RULES §1）、测试结果链接（last-report.md）。
- 合并方式：Squash Merge 保持 `main` 历史整洁。
- 回滚：出问题从 `main` 上一可用 tag 重建 `release`。

---

## 5. 关联文档

- `CODE_RULES.md`：改什么、怎么改（本文「修改 / diff 审核」阶段的依据）
- `AI_DEV_WORKFLOW.md`：自动研发流水线总设计
- `PROJECT_MAP.md`：文件可改 / 禁改 / 数据源标注
- `PRODUCT_TEST_CHECKLIST.md`：逐产品验收标准（本文「测试」阶段明细）

---

*本文为纯方案文档，未执行任何 Git 操作（未建分支、未提交、未合并）。最后更新：2026-07-30。*
