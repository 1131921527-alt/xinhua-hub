# 新华保险资料库网站 (xinhua-hub)

> **打包时间**: 2026-07-02 04:16
> **打包来源**: 工作目录 `E:\workbuddyFIle\2026-06-30-15-34-15\xinhua-hub-temp\`
> **用途**: 换号后读取此文件恢复全部上下文，继续开发

---

## 一、项目基本信息

| 项目 | 内容 |
|------|------|
| **网站名称** | 新华保险资料库 (xinhua-hub) |
| **在线地址** | https://1131921527-alt.github.io/xinhua-hub/ （密码0225） |
| **GitHub仓库** | https://github.com/1131921527-alt/xinhua-hub |
| **GitHub用户名** | 1131921527-alt |
| **部署方式** | GitHub Pages（push后1-2分钟自动部署） |
| **本地源码** | 本目录（即 `E:\workbuddyFIle\腾讯龙虾的成品\新华保险资料库设计\`） |

---

## 二、当前完成状态

### 已完成的演算器（4个）

| 文件 | 产品 | 代码 | 状态 | 备注 |
|------|------|------|------|------|
| calculator-hongyu.html | 宏御世家终身寿（分红型） | S11 | ✅ 数据精确验证 | 533组数据38448个数据点零差异 |
| calculator-hongtai.html | 宏泰世家终身寿（分红型） | S03 | ✅ 完整11列 | 按Excel截图完整重写，HT_DATA查表+缩放 |
| calculator-hongyuan.html | 宏愿人生养老年金（分红型） | S24 | ⚠️ 待验证 | 10列数据，第5年标红高亮，需对比Excel验证 |
| calculator-huacai.html | 华彩鎏金年金保险（分红型） | S24 | ⚠️ 占位数据 | 结构完整但数据为占位，需从Excel提取实际数据 |

### 已完成的页面模块

| 文件 | 功能 |
|------|------|
| index.html | 主站首页（一级菜单+二级菜单+滚动位置记忆） |
| data.json | 全站数据配置（分类、条目、链接） |
| preview.html | 通用预览页（PDF/PPT/DOCX/XLS/图片，支持文字/图片切换） |
| huifang.html | 电子回执回访操作流程（新链接+分系统指引） |
| fuxing.html | 复效操作流程（扫码图+链接） |
| zengzhi.html | 增值服务总览（新华尊/新华瑞权益+星级对照表+使用流程） |
| jujia.html | 居家养老护理包（护理包明细↔权益一页通切换） |

### 已完成的优化

- ✅ 性别选择bug修复（宏御+宏泰，currentGender与默认按钮同步）
- ✅ 宏御自检额外修复2个bug（maxAgeMap性别区分+保费1000整数倍验证）
- ✅ 图片清晰度全面提升（流程图1100px/q92，其他1200px/q90）
- ✅ 产品对比表转文字版（HTML表格，6款产品完整数据）
- ✅ 滚动位置记忆（sessionStorage，返回一级菜单保持位置）
- ✅ 产品代码前缀（S11/S03/S24/S12/S06/G24/G23）
- ✅ 分类顺序调整（公司介绍→演算器→操作流程→产品介绍...）
- ✅ 下载图片bug修复（宏泰3个bug+宏御储备期竖排+宏愿canvas降级）
- ✅ 三演算器删除产品简介板块（只保留公司介绍+产品亮点）
- ✅ 宏愿储备期合并居中+表格字体缩小
- ✅ 新华瑞一星修正（1万→10万~50万）
- ✅ 回访流程页重写（新链接+分系统指引+操作步骤）

---

## 三、待完成任务（换号后继续）

### 高优先级

1. **华彩演算器数据替换** ⚠️
   - 当前 `calculator-huacai.html` 是占位骨架数据
   - 需要从Excel `files/演算器/S24华彩鎏金年金保险（分红型）利益演示.xlsx` 提取实际数据
   - 参考 `calculator-hongyuan.html` 的结构和数据处理方式

2. **宏愿演算器数据验证** ⚠️
   - `calculator-hongyuan.html` 数据是手动录入的，需要对比Excel交叉验证
   - Excel文件: `files/演算器/` 目录下找宏愿相关的xlsx
   - 验证方法：选5-10组不同参数（男女/不同年龄/不同缴费方式/不同金额），对比在线输出和Excel原表

3. **其他演算器**（用户说"先做出来再返工"）
   - 可能还需要：宏禧来(S12)、宏坤(S06)、福盛世家添翼版(G24)、恒享人生(G23)
   - 腾讯龙虾的成品目录下已有独立的HTML计算器文件可参考：
     - `恒享人生利益演示计算器.html`
     - `福盛世家添翼版利益演示计算器.html`

### 中优先级

4. **全站逐页检查**
   - 每个页面是否能正常打开
   - 图片是否加载正常
   - 下载功能是否正常
   - 数据是否准确

5. **条款上传**
   - 用户提到"还有很多条款没上传"

---

## 四、关键技术细节

### 演算器架构

**宏御 (calculator-hongyu.html) — 最成熟的模板**
- 数据：CALC_DATA 对象，key格式 `gender_age_term`（如 `"1_40_3"` = 女性_40岁_3年交）
- 533个key，男性259个，女性274个
- 计算：K/L/N递归公式（交清增额），与Excel完全一致
- 储备期：前 paymentYears+2 年显示"储备期"，rowspan合并居中
- Canvas下载：1.5x Retina（防移动端内存溢出），toBlob失败降级toDataURL→图片预览长按保存

**宏泰 (calculator-hongtai.html)**
- 数据：HT_DATA 数组，56行×12列，基准49岁女3年交50万
- 缩放：`scale = 用户保费 / 500000`，`ageOffset = 用户年龄 - 49`
- 11列表头：保单年度/年龄/当年保费/累计保费/客运航空意外身故/保证身价保险金/预期身价保险金/红利现价/现金价值(保证)/生存总利益/当年收益率
- 前几年收益率显示"投资期"（不是"储备期"）
- 公司介绍板块（绿色背景）+ 产品亮点

**宏愿 (calculator-hongyuan.html)**
- 数据：HY_DATA 数组，基准57岁男3年交30万
- 10列：保单年度/年龄/年交保额/累计保额/当年年金/累计年金/身故或全残保险金/现金价值/生存总利益/总收益与年收益率
- 第5年标红高亮
- 储备期合并居中（横排，不再竖排）

**华彩 (calculator-huacai.html) — 占位版**
- 结构完整但数据为占位，需从Excel提取

### 通用技术要点

- **GitHub Pages部署**：push后等1-2分钟，偶尔需空commit触发重新部署
- **SSL问题**：`git config http.sslVerify false` 临时关闭
- **图片处理**：Python PIL，流程图1100px/q92，其他1200px/q90
- **sessionStorage**：滚动位置记忆，从二级菜单返回时恢复
- **Office预览**：Microsoft Office Online Viewer `view.officeapps.live.com/op/embed.aspx?src=URL`
- **PDF预览**：`#view=FitH` 加速 + Google Docs快速预览按钮
- **产品代码体系**：S11宏御/S03宏泰/S24华彩(也是宏愿?)/S12宏禧来/S06宏坤/G24福盛世家添翼版/G23恒享人生

### data.json 结构

```json
{
  "categories": [
    {
      "name": "分类名称",
      "icon": "emoji",
      "items": [
        { "name": "条目名", "type": "calculator|pdf|image|ppt|excel|link", "description": "描述", "url": "文件路径或链接" }
      ]
    }
  ]
}
```

### 分类顺序
公司介绍 → 演算器 → 操作流程 → 产品介绍 → 产品对比 → 产品规则 → 手工单模板 → 合同模板 → 分红资料 → 养老社区 → 增值服务

---

## 五、文件结构

```
新华保险资料库设计/
├── index.html              # 主站首页
├── data.json               # 全站数据配置
├── preview.html            # 通用预览页
├── calculator-hongyu.html  # S11 宏御演算器 ✅
├── calculator-hongtai.html # S03 宏泰演算器 ✅
├── calculator-hongyuan.html# S24 宏愿演算器 ⚠️待验证
├── calculator-huacai.html  # S24 华彩演算器 ⚠️占位
├── huifang.html            # 回访流程页
├── fuxing.html             # 复效流程页
├── zengzhi.html            # 增值服务总览
├── jujia.html              # 居家养老护理包
├── hongtai_data.js         # 宏泰数据文件
├── hongtai_full.json       # 宏泰完整数据
├── hongtai_calc_data.json  # 宏泰计算数据
├── hongyu_data.json        # 宏御数据文件
├── files/                  # 所有附件文件
│   ├── 产品介绍/
│   ├── 产品对比/
│   ├── 产品规则/
│   ├── 公司介绍/
│   ├── 养老社区/
│   ├── 分红资料/
│   ├── 合同模板/
│   ├── 增值服务/
│   ├── 手工单模板/
│   ├── 操作流程/
│   └── 演算器/             # Excel原文件
├── 工作日志/               # 开发日志（3天）
│   ├── 2026-06-30.md
│   ├── 2026-07-01.md
│   └── 2026-07-02.md
├── .git/                   # Git仓库（含完整提交历史）
└── README.md               # 本文件
```

---

## 六、换号后如何继续

1. **恢复上下文**：读取本 README.md + 工作日志/ 下的3个md文件
2. **继续开发**：在本目录下直接修改文件
3. **推送部署**：
   ```bash
   cd "E:/workbuddyFIle/腾讯龙虾的成品/新华保险资料库设计"
   git add -A
   git commit -m "描述"
   git push origin main
   ```
4. **验证**：等1-2分钟后访问 https://1131921527-alt.github.io/xinhua-hub/
5. **如果push失败**（SSL）：`git config http.sslVerify false`
6. **如果Pages没更新**：空commit触发 `git commit --allow-empty -m "redeploy" && git push`

---

## 七、Git提交历史（最近20条）

```
7b30e2e fix: 宏愿演算器储备期合并居中+表格字体缩小
8cedc77 fix: 修复三个演算器下载图片问题
344cbf7 fix: 新华瑞一星改10万~50万 + 回访流程页重写
0f4ad08 feat: 新增华彩鎏金在线演算器 + data.json更新
624fba5 feat: 宏愿演算器+宏泰公司介绍+产品对比文字版+图片清晰度提升+性别bug修复
b1c9b1b fix: 修复宏御演算器性别选择不同步bug
b2f7ddc feat: 宏泰演算器完整11列 + 星级表改总保费
d2b7565 feat: 6大优化 + S03宏泰在线演算器
890a42c feat: 合并回访流程图+链接为huifang.html单页
9566457 feat: 新增新华保险投资实力介绍PPT
40f3ed0 feat: 批量优化 #2-#8
06f16b4 fix: 生存总利益计算改用K/L/N递归公式与Excel完全一致
aeaaa00 修复下载bug+文字版出单流程+预览页优化
7f84558 蓝白主题修复+数据验证+图片优化+流程图替换
12696de feat: 计划书式蓝色大字抬头+公司背景+产品特点
b7967ff fix: 宏御默认40岁女性100万3年交; 字体放大; 互换出单流程图
a8de6ed feat: 新增产品介绍分类、补充missing文件
7aa9a9d docs: 新增华彩鎏金条款 + 招行手机银行投保指南
d823147 fix: 在线演算器数据格式修正
```

---

## 八、用户偏好提醒

- 演算器页面结构：**公司介绍 + 产品亮点**（不要产品简介板块）
- 储备期：合并居中显示1个（不要竖排重复4个）
- 表格字体：不要太大，10列以上要缩小避免拥挤
- 图片清晰度：宁可慢一点也要清楚（流程图1100px/q92）
- 配色：宏御蓝风格（蓝白主题，不要红色）
- 下载图片：必须兼容微信浏览器（toBlob失败要有降级方案）
- 产品代码前缀：所有条目都要带（S11/S03/S24等）
- 滚动位置：返回一级菜单要记住位置
- 性别默认：女（currentGender=1）
- 保费默认：100万
- 缴费默认：3年交

---

## 九、V1.0 上线说明（2026-07-30 补充）

> 本节为 V1.0 稳定性整理补充，覆盖 10 款产品统一规则层与上线前检查。

### 1. V1.0 范围
- **10 款在线演算器全部就绪**：盈满鑫、宏御、宏安、宏泰、宏愿、宏禧来、华彩、宏坤、福盛世家、恒享。
- **统一规则层 `product-rules.js`**：8 款（盈满鑫/宏御/宏安/宏泰/宏愿/宏禧来/华彩/宏坤）的储备期与收益率展示逻辑已抽离到配置，新增产品只需加一条 `PRODUCT_RULES.xxx`，无需改 HTML。
- 福盛世家、恒享保持原有本地逻辑（不进统一层）。

### 2. 规则层关键字段
| 字段 | 含义 |
|------|------|
| `reserveType` | `fixed`(固定年限) / `payterm`(=交费期，盈满鑫) / `dynamic`(按 `rule` 动态，宏禧来 `rate<=0`) |
| `reserveYears` | fixed 模式储备期年数（多为 5） |
| `showRate` | 储备期后是否展示收益率（华彩/宏坤=false → 显示「-」） |

### 3. 自动化验收
- 验收脚本：`tests/product-rule-check.js`（Node + Playwright）
- 运行：`node tests/product-rule-check.js`（可选 `PORT=8831` 指定端口）
- 覆盖：页面生成 / 无 console 报错 / PNG 下载 / 储备期符合规则；报告输出 `tests/last-report.md`，截图 `tests/shots/`。

### 4. ⚠️ Git 提交规范（重要）
- **禁止直接 `git push origin main`**。请按 `docs/GIT_WORKFLOW.md`：从 `main` 拉 `feature/*` 分支 → 修改 → 测试 → diff 审核 → PR 合并（由人工审批）。
- 本地源码真实路径：`E:\workbuddyFIle\腾讯龙虾的成品\xinhua-hub\`（本文档旧版写的 `新华保险资料库设计` 为历史路径，已失效）。

### 5. 本地独立运行
- 演算器为纯静态页面，但部分产品（如宏泰）运行时 `fetch` 本地 JSON，需经 HTTP 服务而非 `file://` 直接打开：
  ```bash
  cd xinhua-hub
  python -m http.server 8000
  # 浏览器访问 http://localhost:8000/index.html
  ```
- 验收脚本内置最小静态服务器，已验证 10 款产品均可在 HTTP 下正常生成、下载、移动端渲染。

### 6. 配套文档索引
- 设计/规范/分析文档已归集至 `docs/`（见 `docs/INDEX.md`）：项目地图、代码安全规则、产品测试清单、Git 流程、AI 研发流水线、产品知识索引、数据来源追踪、AI 接管说明、重复代码报告、风险扫描、规则扫描报告。

### 7. V1.0 能力清单
- **在线测算**：10 款演算器（盈满鑫/宏御/宏安/宏泰/宏愿/宏禧来/华彩/宏坤/福盛世家/恒享），输入年龄、性别、保费、交费期，一键生成现金价值、红利、储备期明细表。
- **产品资料库**：`docs/` 下 16 份设计/规范/分析文档 + 知识库页面 + 红利实现率/投保指引等专题页。
- **销售助手**：`sales-qa.html` 话术 QA 手册，支持搜索、产品示例按钮、复制话术、整页下载 PNG（纯前端，无后台）。
- **图片生成**：每个演算器内置 `html2canvas` 导出 PNG，微信内走长按保存、桌面走文件下载，已验证无截断/空白。
- **手机适配**：`viewport` + 响应式布局，移动端表格、按钮、下载均通过 Playwright 实机验证。

### 8. 如何运行
- **本地静态托管**：
  ```bash
  cd xinhua-hub
  python -m http.server 8000
  # 浏览器访问 http://localhost:8000/index.html
  ```
  > 部分产品（如宏泰）运行时 `fetch` 本地 JSON，必须经 HTTP 服务访问，不能直接 `file://` 打开。
- **自动化验收**：
  ```bash
  node tests/product-rule-check.js      # 10 款 Playwright 生成/下载/储备期校验
  node tests/health-check.js            # 静态检测，输出 V1.0-health-check.json
  node tests/dump-downloads.js          # 重跑导出 10 款下载 PNG 到 tests/downloads/
  ```
- **GitHub Pages**：已部署 `https://1131921527-alt.github.io/xinhua-hub/`（访问密码 0225）。

### 9. 如何新增一款产品
- **可配置产品**：在 `product-rules.js` 的 `PRODUCT_RULES` 中新增一条，例如：
  ```js
  PRODUCT_RULES.xxx = { reserveType: 'fixed', reserveYears: 5, showRate: true }
  // reserveType: 'fixed'(固定年限) | 'payterm'(=交费期) | 'dynamic'(按 rule 动态)
  ```
  演算器 HTML 通过 `resolveReserveYears()` 读取，**无需改动 HTML 结构**。
- **特殊逻辑产品**：如福盛世家、恒享，保持本地逻辑自行实现，不强制接入统一层。
- **验收**：新增后跑 `node tests/product-rule-check.js`，确认生成/下载/储备期检查全部通过。

### 10. 文件结构
```
xinhua-hub/
├── index.html              # 总入口/产品导航
├── product-rules.js        # 8 款产品统一规则层（储备期+收益率展示）
├── sales-qa.html           # 销售助手话术手册（搜索/复制/下载）
├── calculator-*.html       # 10 款在线演算器
├── html2canvas.min.js      # 图片导出库
├── docs/                   # 16 份设计/规范/分析文档
├── tests/                  # health-check.js / product-rule-check.js / dump-downloads.js + shots/ + downloads/
├── archive/                # 临时/历史文件（仅归档，不删除）
├── dev-archive/            # 开发期草稿
├── xlsx/                   # Excel 原始数据（⚠️红线：禁止修改）
├── backup/                 # 发布前备份
└── 新华在售产品_中国银行版.xlsx  # 原始数据（⚠️红线：禁止修改）
```
