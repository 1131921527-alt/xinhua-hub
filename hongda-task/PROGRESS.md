# 宏达人生接入演算体系 — PROGRESS

## 目标（10行内）
把"新华宏达人生年金保险（分红型）"接入 xinhua-hub 在线演算器，手机可输入方案、看逐年利益、下载长图。优先级：算得对 > 原始资料不受损 > 手机可用 > 美观。

## 顺序
0. 核实现状+备份 ✅ → 1. 读懂 Excel 字段/键值映射+抽JSON ✅ → **1.5 三项补充核验 ✅（见下）** → 2. 仿现有演算器建页面+数据文件 → 3. 12组对账+报告+截图 → 同步公开版。

## 补充核验（开工页面前，2026-08-25，按复核要求）
- [x] 核验1 S34/S341 产品代码：通篇公式 grep 命中 0；AA11=性别_年龄_交费期，查表键无产品代码；S34/S341 共用同一利益表，仅经"是否个养"影响入口规则，不影响利益金额。结论已写入 FIELD-MAPPING 核验1。
- [x] 核验2 投保年龄校验：非个养/个养×男/女×5种交费期 maxAge 已从 投保信息 R8/R16/R17 逐条取数（非单一年龄范围）；个养另受"年龄+交费期≤退休年龄"硬约束；保费规则（非个养1000倍、个养100倍且期交≤12000）已列明。见 FIELD-MAPPING 核验2。
- [x] 核验3 对账逐字段：12组每组须逐行比对 10 个字段（当年保费/累计保费/当年年金/累计年金/满期金/身故金/现金价值/当年红利/累积红利/生存总利益），差异必须为0；覆盖首年/缴费末年/首次年金/105岁末年 + 男女/个养非个养/5交费/高低龄/高低保费/实现率0·100%·中间。见 FIELD-MAPPING 核验3。
- 顺带修正 FIELD-MAPPING 既有3处误差：①年龄显示=投保年龄+t（非 t−1，已实读）；②身故金 K 用**上一年**累计年金（Excel `C11=SIP!I+SIP!G(prev)+SIP!N`，非当年；前版误写为"当年"已订正）；③满期金 col11 积累期=0、末年=所交保费（非全0）。
- 当前结论：任务0/1/1.5 结果可保留，按既定顺序继续；**可以正式开工任务2（页面实现）**。

## 最大风险
a. 利益演示全表 49650 行必须原样迁移且 SHA 校验（已完成，JSON SHA=05629aae...）；b. 个养/非个养、性别、缴费期、年龄/保费合法范围须与 Excel 严格对齐；c. #REF!/失效IRR分支不实现（仅 C13 IRR 分支，网页不计算）。

## 关键事实（任务0已核验）
- 内部母版：`E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub`（10个演算器、.git 完好）
- 公开版：`E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub-public`
- 源 Excel 实际位置（非项目目录）：`C:\Users\admin\AppData\Local\Temp\codex-file-preview-nd1wk1\新华人寿·宏达人生年金保险（分红型）演算器.xlsx`
- 源 Excel SHA-256：`03ea4eed54440cfa9ea0c0dea3141de9c06755b3642f4ad0159ac7974f46e3e6`（8,070,963字节）
- 已另存只读稳定副本：`E:\workbuddyFIle\腾讯龙虾的成品\01_新华Hub项目\备份\hongda-source\新华人寿·宏达人生年金保险（分红型）演算器.xlsx`（SHA 一致）
- 母版备份：`E:\workbuddyFIle\腾讯龙虾的成品\01_新华Hub项目\备份\xinhua-hub-pre-hongda-20260824`（含.git，已 COPY_DONE）
- 工作表：投保信息(34)、SIP(125)、利益演示全表(49654)、利益演示(119,可见) — 结构与任务书一致 ✅
- 查表键格式：`性别(0女/1男)_年龄_交费期(1/3/5/6/10)_保单年度`，共710组合×各年≈49650条
- 表内数值按"每份1000元"归一化，网页用 份数=prem/1000 乘回（与 Excel `VLOOKUP*份数` 一致）

## 任务数据文件（本任务专属，允许新建）
- `hongda-task/FIELD-MAPPING.md` — 字段/列/递归公式映射
- `hongda-task/data_hongda_raw.json` — 全表抽取，rows=49650, keys=710, SHA=05629aae060df4192af9440b3e908cbf0c8db225a130606d7c86abf069867022
- `hongda-task/excel_dump.txt` — Excel 原表公式/结构导出
- `hongda-task/BLOCKED.md` — 阻塞项（当前：无）
- `hongda-task/HONGDA-CALCULATOR-VALIDATION.md` — 待任务3生成

## 完成项
- [x] 任务0：现状核实、源Excel定位与SHA、Excel稳定只读副本、母版备份(含.git)
- [x] 任务1：Excel 字段—单元格—数据源—输出列 映射（FIELD-MAPPING.md）+ 全表抽JSON(SHA校验,49650行)
- [x] **任务2：宏达人生演算器页面+数据文件**（calculator-hongda.html + data_hongda.json；仿现有演算器+calc-common.css；双维度年龄/保费校验；保证/红利分离；免责；下载长图）；并修正身故金口径 bug（改 `cumAnnuityPrev`）
- [x] **任务3：12组对账 + 验证报告**（HONGDA-CALCULATOR-VALIDATION.md）：默认场景 vs Excel 缓存 9 字段全 0 差异；12 组结构/边界/满期金校验全过；reconcile.py 可复跑；静态资源无死链。**待办**：桌面/390×844/下载长图 三视角渲染截图需在浏览器人工确认（本机无 headless 浏览器）
- [ ] 同步公开版（仅HTML/JS/JSON+导航 data.json）— **本轮按硬性要求不 commit/push/发布，待确认后再同步**

## 断线恢复
读此文件，从"完成项"未勾处继续；源 Excel 只读、SHA 已记，勿改公式/工作表。
