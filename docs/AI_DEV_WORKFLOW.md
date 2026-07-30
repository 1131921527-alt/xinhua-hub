# AI_DEV_WORKFLOW.md

> **文档性质**：架构设计文档（仅设计，不开发）
> **目的**：记录「新华Hub」未来可复制的 AI 软件研发流水线设计，并作为其他项目复用的模板
> **约束**：①只输出架构设计文档 ②不开发自动机器人 ③不修改现有代码 ④不接入任何自动调用 ⑤作为未来其他项目复用模板
> **版本**：v0.2 · 2026-07-30

---

## 0. 概述与适用边界

### 0.1 背景与目标
把"人脑规划 → 机器实现 → 自动验证 → 独立审查 → 自动进入下一题"串成闭环，让一个需求从想法到可交付代码尽量少人工干预，且流程可被**任意项目复用**。

### 0.2 核心链路
```
ChatGPT
   ↓  (需求/架构/验收标准)
Task 任务拆解
   ↓  (context package)
WorkBuddy 执行代码修改
   ↓  (代码 + 交付物)
自动测试 Test
   ↓  (test report)
Codex Review 代码质量
   ↓  (review verdict)
生成下一步 Task
   ↓  (回路)
Task ……
```

### 0.3 本设计「不」做什么（硬约束）
- ❌ 不编写机器人 / 调度器 / 任何运行时代码。
- ❌ 不修改新华Hub 或其他项目现有代码。
- ❌ 不接入 ChatGPT / Codex / 任何服务的自动 API 调用。
- ✅ 只描述**角色、契约、状态、反馈、Git、升级路径**的设计。

---

## 1. 各 AI 角色职责

| 角色 | 定位 | 输入 | 核心职责 | 输出 |
|---|---|---|---|---|
| **ChatGPT** | 产品经理 / 架构师 | 高层意图（一句话或多句需求） | ①拆成有边界、可独立交付/测试的任务 ②为每个任务写**验收标准**（尽量可机器断言）③给出约束（能改 / 禁改项） | `task spec` |
| **Task** | 任务拆解与队列 | `task spec` 列表 | ①维护 backlog 按依赖出队 ②打包 `context package`（任务+约束+相关文件+历史记忆）③接收回退信号重新入队 | `context package` |
| **WorkBuddy** | 实现执行体 | `context package` | ①按约束改代码 / 生成交付物 ②严格不越界（禁改项不动）③自测并产出自测说明 | 代码变更 + 交付物 + 自测说明 |
| **Test** | 自动验证 | 交付物 + 验收标准 | ①逐条核对验收标准（渲染/校验/签名）②产出 PASS/FAIL 报告，失败带定位明细 | `test report` |
| **Codex Review** | 独立审查 | 通过 Test 的代码 | ①查质量/约定/回归/安全/越界 ②给 APPROVE 或 CHANGES（带意见） | `review verdict` |
| **Next Task** | 循环收尾 | APPROVE 完成态 | ①标记完成、双写记忆 ②拉下一题或停止 | 完成态回写 + 下一题触发 |

> 任一角色均可被替换（例如换一个 LLM 做 ChatGPT，或换 CI 做 Test），前提是**守住在第 3 节定义的文件契约**。

---

## 2. 文件交互方式（阶段间契约）

各阶段**不直接共��内存**，靠明确的交接物（artifact）解耦，使任一环节可替换、可重跑。

### 2.1 交接物清单
| 交接 | 产出文件 | 建议格式 | 关键字段 |
|---|---|---|---|
| ChatGPT → Task | `task-spec.md` / `tasks.json` | Markdown / JSON | 目标 / 范围边界 / 禁改项 / 验收标准 / 依赖顺序 |
| Task → WorkBuddy | `context-<id>.md` | Markdown | 单任务描述 + 约束 + 相关文件路径 + 历史记忆摘要 |
| WorkBuddy → Test | 代码 + `self-test.md` | — / Markdown | 入口文件 / 需验证的验收标准编号 |
| Test → Codex | 代码 + `test-report.md` | Markdown | 全绿 / 失败明细（断言·实际值·期望） |
| Codex → Next Task | `review-verdict.md` | Markdown | APPROVE / CHANGES + 修改意见 |
| 任意失败 → 回退 | `failback.md` | Markdown | 阶段来源 / 断言 / 实际值 / 期望 / 复跑建议 |

### 2.2 推荐目录结构（仓库内，仅约定，不创建）
```
ai-dev/
  specs/        # ChatGPT 产出的 task spec
  tasks/        # Task 拆解后的 context package + 状态
  reports/      # test-report / review-verdict / failback
  state/        # task-state.json 任务状态机
```
> 该目录仅为**未来开发时的约定参考**，本设计不创建、不写入任何文件。

### 2.3 契约原则
- 每个 artifact **自带足够上下文**，接收方无需追问即可行动。
- 失败必须「可复现 + 可定位」，不允许只写"不行"。
- 文件命名带 `<id>`（任务序号/短名），便于回溯与人工查阅。

---

## 3. 任务状态流转方式（状态机）

### 3.1 状态定义
| 状态 | 含义 |
|---|---|
| `BACKLOG` | 已在 spec 中，未派发 |
| `DISPATCHED` | 已生成 context package，等待 WorkBuddy 认领 |
| `IN_PROGRESS` | WorkBuddy 正在实现 |
| `TESTING` | 已交付，Test 运行中 |
| `REVIEWING` | Test 通过，Codex Review 中 |
| `DONE` | Review APPROVE，已收尾/合并 |
| `BLOCKED` | 超限或不确定，挂起升级给人 |

### 3.2 流转图
```
BACKLOG ──▶ DISPATCHED ──▶ IN_PROGRESS ──▶ TESTING ──▶ REVIEWING ──▶ DONE
                                  ▲            │  FAIL       │ CHANGES     │
                                  │            ▼            ▼            │
                                  └──── IN_PROGRESS ← IN_PROGRESS ←──────┘
                                        (带 failback / review 意见，限次)
       任意环节超限 ─────────────────────────────────────────▶ BLOCKED（报警给人）
```

### 3.3 状态载体（约定，不实现）
- `ai-dev/state/task-state.json`：任务数组，每项含 `id / status / retries / lastReport`。
- 状态变更必须**落文件**，便于跨会话/跨账号接续，不依赖内存。
- **限次熔断**：单任务回退上限（建议 3 次），超限 → `BLOCKED` 并通知人，避免死循环。

---

## 4. 测试反馈机制

### 4.1 验收标准从哪来
由 **ChatGPT** 在 `task spec` 中定义，尽量可机器断言，例如：
- 「页面无 console 报错」
- 「下载产出 PNG 且文件头签名正确（89 50 4E 47）」
- 「储备期显示符合规则（前 N 年标记）」

### 4.2 Test 如何跑（参考范例）
新华Hub 已有可参考的自动化验收脚本 `tests/product-rule-check.js`（Playwright 渲染 + Node 校验 + PNG 签名校验），代表「Test 阶段」的理想形态——但本流水线**尚未搭建**，该脚本仅作范例。

### 4.3 反馈闭环
1. Test 逐条核对验收标准 → 生成 `test-report.md`（每条 PASS/FAIL）。
2. **FAIL**：把失败明细写入 `failback.md`，状态回退 `TESTING → IN_PROGRESS`，WorkBuddy 带明细复跑（限次）。
3. **PASS**：流转 `REVIEWING`，进入 Codex Review。
4. 人工兜底：断言无法自动判定的（如"截图视觉效果是否符合预期"），标 `需人工确认`，不阻塞流水线，但需在报告中显式列出。

---

## 5. Git 分支管理建议

> 以下为**建议规范**，供未来接入版本控制时遵循；本设计不执行任何 git 操作。

1. **main 受保护**：禁止直推 main；所有改动经分支 + 评审后合并。
2. **每任务一分支**：命名 `类型/短描述-<id>`（如 `feature/reserve-config-014`、`fix/shot-retry-021`），连字符分隔，便于追踪。
3. **提交即验证**：分支内完成「自测 + Test + Review」三关后再提合并请求（PR/MR）。
4. **合并由人审批**：Codex Review 的 APPROVE 是**建议**，最终合并动作由人确认（符合"不接入自动调用"约束）。
5. **提交信息规范**：`类型: 任务<id> 简述`（如 `feat: #014 储备期配置化`）。
6. **回滚策略**：合并后发现问题，用 `revert` 生成反向提交，不强制改写历史；BLOCKED 任务分支保留待人工处理。
7. **记忆双写**：每次实质完成，工作区 `.workbuddy/memory/YYYY-MM-DD.md` 与主仓库 `memory/YYYY-MM-DD.md` **同步写入同一份内容**，保证切号/跨账号可读当天上下文。

---

## 6. 未来自动化升级方向

当前状态：**全人工触发**，文档即全部产物。升级路径按"风险从低到高"排列，每一步都可独立评估、单独开启：

| 级别 | 升级项 | 说明 | 风险 |
|---|---|---|---|
| L0（当前） | 纯文档 | 仅本设计稿，人手动串起各角色 | 无 |
| L1 | 结构化 spec | ChatGPT 输出机器可读 `tasks.json`，减少人工转写 | 低 |
| L2 | Task 分发器脚本 | 本地脚本按 `task-state.json` 出队、打包 context（仍由人触发） | 低 |
| L3 | CI 接入自动 Test | 推送分支后自动跑 Test harness，回报 `test-report.md` | 中 |
| L4 | Codex 自动 Review | 调用 Codex 产出 `review-verdict.md`（APPROVE/CHANGES） | 中 |
| L5 | 闭环调度 | 全自动串起 L1~L4，BLOCKED 才升级给人 | 高（需评估） |

**升级原则**：
- 每个级别设**开关**，可单独启用/停用。
- 任何"自动合并 / 自动推送 main"动作**默认关闭**，必须人工确认（守住所列硬约束）。
- 升级前先固化第 2、3 节的契约与状态机，避免自动化后各角色失联。

---

## 7. 复用为其他项目模板

本设计**去新华Hub 专属**即可复用：
1. 替换「核心链路」中的项目名与示例（如把演算器例子换成你的业务）。
2. 保留第 1~6 节框架（角色 / 契约 / 状态机 / 测试反馈 / Git / 升级路径）。
3. 验收标准模板化：把"无 console 报错 / PNG 签名正确"等替换为本项目可断言项。
4. 目录 `ai-dev/`、状态文件 `task-state.json` 为通用约定，可直接照搬。

**复用清单**：
- [ ] 角色职责表（第 1 节）— 按项目填角色
- [ ] 交接物 schema（第 2 节）— 可原样用
- [ ] 状态机（第 3 节）— 可原样用
- [ ] 测试反馈闭环（第 4 节）— 替换验证手段
- [ ] Git 规范（第 5 节）— 可原样用
- [ ] 升级路线（第 6 节）— 可原样用

---

## 8. 未开发声明（重申约束）

> 本文档**仅描述架构设计**，未编写任何自动化脚本、调度器、机器人，也未接入 ChatGPT / Codex 的任何自动调用；**未修改任何现有代码**。
> 文中 `task spec` / `context package` / `test report` / `review verdict` / `task-state.json` 均为**待实现的契约与载体**，后续开发时再定义具体字段与存储方式。
> 已存在的 `tests/product-rule-check.js` 仅作为「Test 阶段」的**参考范例**，不代表本流水线已搭建。

---

*（设计稿 v0.2，待评审。若要进入开发，建议下一步：先在第 2 节固化 `task spec` 与 `context package` 的字段 schema，再从 L1/L2 起步实现最小可用分发器。）*
