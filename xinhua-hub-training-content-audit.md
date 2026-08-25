# 新华 Hub 培训资料内容审计报告

> 审计日期：2026-08-24
> 审计范围：xinhua-hub 全站 46 个 HTML 页面、files/ 全部 PPT/PDF 资料、archive/ 历史资料、项目外培训课程目录（03_保险业务资料/新华课程-202608）
> 审计原则：只读取与新增，不删除旧页面，不修改任何演算器公式、产品数据、收益计算方式与保险责任内容

---

## 一、扫描情况

### 扫描方法
- 全量遍历项目目录（1485 个文件、118 个目录）
- 使用 pymupdf 提取全部 PDF 文本、python-pptx 提取全部 PPT/PPTX 文本（含讲师备注），实际阅读文件内容后判断资料类型
- 对已有 HTML 页面做正文抽取（去样式去标签），与源资料逐份比对覆盖度
- 提取中间文件保存于 `.workbuddy/tmp/extract-20260824/`

### 扫描到的培训/说明类资料（PPT/PDF，共 12 份 + 2 段课程录音）

| # | 资料 | 位置 | 类型 | 页数 |
|---|---|---|---|---|
| 1 | 2604新华在售产品培训.pptx | files/公司介绍 | 产品培训 | 34 |
| 2 | 新华保险投资实力介绍（新华资管）.pptx | files/公司介绍 | 公司实力 | 7 |
| 3 | 公司分红投资介绍.pdf | files/公司介绍 | 公司实力+分红 | 7 |
| 4 | 新华公司介绍2026.pdf | files/公司介绍 | 公司介绍 | 4 |
| 5 | 盈满鑫_交3保6累计生息+定存.pdf | files/产品介绍 | 产品单页 | 1 |
| 6 | 盈满鑫_交3保8累计生息+定存.pdf | files/产品介绍 | 产品单页 | 1 |
| 7 | 招行在架产品对比分析.pptx | files/产品对比 | 产品对比 | 12 |
| 8 | 荣尊世家减保规则.pptx | files/产品规则 | 产品规则 | 10 |
| 9 | 新华保险分红专题汇报fts.pdf | files/分红资料 | 分红专题 | 3 |
| 10 | main-training.pptx（行外吸金与保险营销双轮驱动） | 项目外·新华课程-202608 | 营销方法培训 | 35 |
| 11 | dividend-rate.pptx（分红专题） | 项目外·新华课程-202608 | 分红培训 | 27 |
| 12 | 新华费率表-6月版v2.pptx / 新华费用表蓝色版.pptx | archive/新华保险资料库 | 渠道费用政策 | 各1 |
| 附 | audio-part1/2.m4a 课程录音（已转录为 text） | 项目外·新华课程-202608 | 课程录音 | — |

---

## 二、资料处理清单（逐份结论）

| 资料 | 主要内容 | 是否已有网页 | 重复情况 | 处理结论 | 建议分类 |
|---|---|---|---|---|---|
| 2604新华在售产品培训.pptx | 5款在售产品全要素表、利益演示、同业对比、鸿鹄基金、举牌、分红5步 | ✅ files/公司介绍/2604新华在售产品培训.html（15496字正文，覆盖完整） | 无 | 不新建 | 产品说明 |
| 新华保险投资实力介绍（新华资管）.pptx | 1.6万亿规模、8.5%收益、2024操作亮点、鸿鹄、多元布局 | ✅ 同名.html 页面 | 无 | 不新建 | 公司实力 |
| 荣尊世家减保规则.pptx | 减保规则、两次顶额减保演示、现价表 | ✅ files/产品规则/荣尊世家减保规则.html | 无 | 不新建 | 产品规则 |
| 新华公司介绍2026.pdf | 公司概况、股东、评级 | ✅ company-intro.html 完整对应 | 无 | 不新建 | 公司介绍 |
| 盈满鑫 2份PDF | 产品要素 + 定存对比演示 | ✅ intro-yingmanxin.html 完整覆盖（含演示时间线、定存对比） | 两份PDF仅保险期间不同 | 不新建 | 产品说明 |
| 招行在架产品对比分析.pptx | 18款产品全维度对比、偿付能力梯队、综合评分 | ❌ 无对应页面 | 无 | **新建页面** | 产品对比 |
| main-training.pptx | 存款产能公式、KYC四步、客户价值矩阵、12类客户筛选、保单架构图谱、三大出单平台 | ❌ 无对应页面 | 无 | **新建页面** | 营销方法 |
| 公司分红投资介绍.pdf | 中投汇金背景、新华资管业绩、A股同业对比、维梧九期/黑石/双边基金等标杆项目 | ⚠️ about-xinhua.html 部分覆盖，但独有内容多（A股同业对比表、132.6%/156.1%实现率、114倍回报案例等） | 部分重叠 | **新建页面**（不与 about-xinhua 合并：阅读目的不同——本页聚焦「分红的投资来源」，about 聚焦「公司全景」） | 公司实力 |
| 新华保险分红专题汇报fts.pdf | 三份监管文件、逐产品五年实现率、9家同业五年对比大表、投资配置结构 | ⚠️ 监管制度部分被 insurance-knowledge-card.html 覆盖，但独有内容多（逐年逐产品数据表、同业大表） | 部分重叠 | **新建页面** | 分红解读 |
| dividend-rate.pptx | 分红原理、果园案例、128%/82%/233%数学、宏御世家累计红利表 | ⚠️ 已被 dividend-2025-interpretation.html + hongli-realization.html 两页深度覆盖（果园案例、实现率数学、累计红利表、经营投资风控全有） | 高度重复+无新增事实 | **不新建**。理由：内容高度重复、无新增价值、阅读目的相同（分红原理与实现率），符合合并/不重复建页条件。原有两页已完整承接 | 分红解读 |
| 新华费率表/费用表 pptx | 渠道手续费政策（6.1-6.30 时效） | 无 | — | **不网页化**。渠道费用政策属内部敏感内容且有明确时效，不适合在资料库公开页面展示 | （不入库） |
| audio 录音 + 转录文本 | 与两份 PPT 配套的讲师口播 | — | 与 PPT 内容重叠 | 转录文本已用于辅助理解 PPT；录音文件保留在原目录不搬入 | — |

---

## 三、新增网页清单（本轮 4 个）

| 新页面 | 源资料 | 注册位置 |
|---|---|---|
| files/产品对比/training-zhaohang-18-products-comparison.html | 招行在架产品对比分析.pptx（12页） | training.json · 产品对比 · id: zhaohang-compare |
| files/培训课程/training-marketing-dual-drive.html | main-training.pptx（35页+讲师备注） | training.json · 营销方法 · id: marketing-dual-drive |
| files/公司介绍/training-dividend-investment-intro.html | 公司分红投资介绍.pdf（7页） | training.json · 公司实力 · id: div-inv-intro |
| files/分红资料/training-dividend-report-fts.html | 新华保险分红专题汇报fts.pdf（3页） | training.json · 分红解读 · id: div-report-fts |

配套动作：
- main-training.pptx 复制入库至 files/培训课程/（原文件在项目外目录，页面需要可下载的原始文件）
- training.json 新增 2 个分类：**产品对比**、**营销方法**（页面由数据驱动渲染，无需改 training.html 代码）
- 4 个页面全部沿用现有视觉体系（topbar/subnav/hero/card/table/callout/steps/foot、手机端优先、html2canvas 下载图片、时钟组件）

---

## 四、内容修正记录

**本轮未对任何源资料数据做修改。** 原因：12 份资料中未发现需要修正的常识性错误；所有数据忠实搬运，仅做结构重组（PPT 翻页结构 → 网页阅读结构）。

新增页面中的解释性文字（如「这张表怎么用」「怎么跟客户讲」）为原创组织内容，均基于源材料事实，未发明任何产品优势、数据或案例，未改动任何保险责任表述。

---

## 五、未确认 / 需核验内容

以下内容在**不同源材料中存在口径差异**，新页面中已用「⚠️ 核验提示」标注，引用前建议统一确认：

| # | 内容 | 口径A | 口径B | 标注位置 |
|---|---|---|---|---|
| 1 | 中国银联股权投资回报 | 2.67倍、IRR 17.10%（公司分红投资介绍 / 分红专题汇报） | 2.52倍、年化14.27%（投资实力介绍PPT） | 两个新页面均标注 |
| 2 | 中石油管道项目收益率 | 全周期6.86%（分红专题汇报） | 年化6.6%（投资实力介绍PPT） | 两个新页面均标注 |
| 3 | 管理资产规模时点 | 1.6万亿（2024）/ 1.7万亿（2025H1）/ 1.84万亿（2025年底） | — | 新页面已注明时点 |
| 4 | 招行对比材料偿付能力数据 | 标注「2025年最新」，但偿付能力按季披露 | — | 对比页已提示按最新季报核验 |
| 5 | 9家同业实现率对比 | 来自第三方「13精」统计，各家演示利率假设不同，横向对比仅供参考 | — | 分红汇报页已标注来源 |
| 6 | 招行对比材料中 18 款产品的在架状态 | 2026年5月口径，渠道在架随时调整 | — | 对比页已提示 |

---

## 六、分类结构树（建议稿）

现状问题：页面分散在根目录 38 个 + files/ 各子目录 8 个，存在多处归属混乱（详见第八节）。建议全站按以下 8 个一级分类归位（仅建议，未做移动）：

```
新华Hub
├── 1. 演算器与计划书（11页）
│   ├── calculator-hongtai / hongyu / hongyuan / hongan / hongkun / hongxilai / huacai / fusheng / hengxiang / yingmanxin
│   └── preview.html（文件预览工具）
├── 2. 条款文字版（5页）
│   └── clause-hongtai / hongyu / hongyuan / hengxiang / huacai
├── 3. 产品说明与对比（6页）
│   ├── intro-yingmanxin.html（盈满鑫解读）
│   ├── card-hongyu.html（宏御世家知识问答卡片）
│   ├── files/公司介绍/2604新华在售产品培训.html（在售产品总览）
│   ├── files/产品对比/training-zhaohang-18-products-comparison.html（18款横评）★新增
│   └── files/产品介绍/新华宏御世家_知识问答卡片 (6).html（旧版卡片，建议降级，见第八节）
├── 4. 分红专题（5页）
│   ├── dividend.html（官方查询台入口）
│   ├── dividend-2025-interpretation.html（2025实现率深度解读）
│   ├── hongli-realization.html（红利实现率确定性答案）
│   ├── insurance-knowledge-card.html（利率与分红政策图解）
│   └── files/分红资料/training-dividend-report-fts.html（制度+五年数据）★新增
├── 5. 公司与投资（4页）
│   ├── about-xinhua.html（公司全景）
│   ├── company-intro.html（公司介绍2026）
│   ├── files/公司介绍/新华保险投资实力介绍（新华资管）.html
│   └── files/公司介绍/training-dividend-investment-intro.html（分红与投资）★新增
├── 6. 营销方法与培训（8页）
│   ├── files/培训课程/training-marketing-dual-drive.html ★新增
│   ├── sales-qa.html（FAQ 总入口）+ sales-qa-yiyi / fenhong / yanglao / chuancheng / gaoke / hk（6个子题）
│   └── files/产品规则/荣尊世家减保规则.html（产品规则学习）
├── 7. 服务与操作（4页）
│   ├── zengzhi.html（新华尊/新华瑞增值服务）
│   ├── jujia.html（居家养老权益）
│   ├── fuxing.html（保单复效流程）
│   └── huifang.html（电子回执回访流程）
└── 8. 系统与入口（3页）
    ├── index.html（首页）
    ├── training.html（知识资料库）
    └── icon-system-2026.html（图标系统，开发用）
```

---

## 七、每分类网页归属（training.json 视角）

培训中心（training.html）现共 10 门课程、7 个分类：

| 分类 | 课程 |
|---|---|
| 产品说明 | prod-train-2604（新华在售产品说明） |
| 产品对比 | zhaohang-compare（招行在架产品对比分析）★新增 |
| 分红解读 | hongli-2025（2025红利实现率深度解读）、div-report-fts（分红专题汇报）★新增 |
| 营销方法 | marketing-dual-drive（行外吸金与保险营销双轮驱动）★新增 |
| 表达参考 | sales-qa（表达参考QA手册）、prod-qa-handbook（常见问题说明） |
| 公司实力 | inv-strength（投资实力介绍）、div-inv-intro（公司分红与投资介绍）★新增 |
| 知识卡 | ins-knowledge（保险知识卡） |

---

## 八、重复 / 冲突 / 旧页面处理建议（只提建议，未做任何删除）

### A. 重复内容（3处）
1. **宏御世家知识问答卡片有两个版本**：根目录 card-hongyu.html 与 files/产品介绍/新华宏御世家_知识问答卡片 (6).html 内容高度重复。建议：以 card-hongyu.html 为正式入口（导航已有），旧版保留文件但从任何导航/列表中移除链接。
2. **training.json 中 prod-qa-handbook 与 sales-qa 指向同一页面**（sales-qa.html）。两条课程记录、一个目标页。建议：二选一保留（或给 prod-qa-handbook 换成独立的产品答疑页面）。
3. **dividend-rate.pptx 的内容已被两页分红解读深度覆盖**（见第二节），不建议再建第三个同类页面。

### B. 冲突 / 归属混乱（4处）
1. **2604新华在售产品培训.html 放在 files/公司介绍/ 目录**，但内容是产品培训，归入「产品说明」更准确。建议：保留文件不动，在分类树中按「产品说明」归类（本次已按此归类）。
2. **calculator-hongan / hongkun / hongxilai（宏安/宏坤/宏禧来）暂无对应的条款页与培训页**，与 clause 系列五款产品不对称。不是错误，是内容缺口，后续有资料可补。
3. **dividend.html 内容极薄**（约1000字，纯查询入口），与两个深度解读页并存。建议：保留其「官方查询台」定位，但页面内补一条指向两个深度页的引导链接（需另行修改，本轮未动）。
4. **sales-qa 系列 7 个页面均无返回 training.html 的交叉入口**（仅有返回首页）。建议后续统一补齐。

### C. 旧页面 / 工具页面（2处）
1. **icon-system-2026.html**：开发用图标系统页，不属于业务资料。建议：不放入任何导航入口，保留文件即可。
2. **preview.html**：文件预览工具。同上处理。

---

## 九、修改文件清单（本轮全部动作）

| 动作 | 文件 |
|---|---|
| 新增 | files/产品对比/training-zhaohang-18-products-comparison.html（26028字符） |
| 新增 | files/培训课程/training-marketing-dual-drive.html（29147字符） |
| 新增 | files/公司介绍/training-dividend-investment-intro.html（22317字符） |
| 新增 | files/分红资料/training-dividend-report-fts.html（23162字符） |
| 新增 | files/培训课程/main-training.pptx（自项目外目录复制入库） |
| 新增 | files/培训课程/（新目录） |
| 修改 | assets/data/training.json（课程 6→10，分类 5→7，版本 1.0→1.1） |
| 新增 | xinhua-hub-training-content-audit.md（本报告） |
| 新增 | .workbuddy/tmp/extract-20260824/（30个文本提取中间文件，供复核） |

**未改动**：全部 11 个演算器页面、5 个条款页面、index.html、training.html、所有旧解读页面、所有产品数据文件、files/originals/、E:\workbuddyFIle\腾讯龙虾的成品\ 永久保护目录。

---

*报告完 · 2026-08-24*
