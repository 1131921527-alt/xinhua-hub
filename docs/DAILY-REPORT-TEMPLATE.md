# 新华 Hub 日报 · 模板

> 自动化工期每日生成：`qa/daily-report/YYYY-MM-DD-report.md`
> 命名固定、字段固定，便于长期追踪与月度汇总。

```
# 新华 Hub 日报 · YYYY-MM-DD

## 日期
YYYY-MM-DD

## 完成（今日 1～3 个优化点）
1. [任务ID] 做了什么（文件 / 改动 / 验证）
2. ...

## 发现问题
- 已修复：...
- 待审核（红线，仅记录未改）：...

## 下一步
- 明日计划抽取的任务池条目
- 需人工复核的红线项

## 测试结论
- PC(1280×900)：PASS/FAIL
- 手机(390×844)：PASS/FAIL
- Console：0 错 / N 错
- 是否影响已验收页：否 / 是（说明）

## Git Commit
xxxxxxx（已 push origin main）
```

---

## 填写要求
- 每次只报 1～3 个真实完成的优化点，不凑数。
- 红线问题必须出现在「待审核」且同步写入 `docs/optimization-pending-review.md`，不得出现在「完成」里。
- 测试必须真跑（PC+手机+Console），未通过不提交。
