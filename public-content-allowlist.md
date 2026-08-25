# 新华 Hub 公开版内容白名单（public-content-allowlist）

生成日期：2026-08-24
依据：xinhua-hub-training-content-audit.md、publication-safety-audit-20260824.md、本轮全站逐文件扫描
用途：决定哪些内容可以进入新建的 `xinhua-hub-public`（公开安全版）。母版 `xinhua-hub` 不动。

标记含义：
- ✅ 公开：直接进入公开版
- ⚠️ 脱敏后公开：进入，但公开版必须做正文/注释脱敏
- 🔒 内部：留在母版，不进入公开版
- ❌ 禁止：渠道/版权/内部资料，绝不进入

---

## 一、根目录 HTML 页面（39 个）

### ✅ 公开（34 个，直接进入）
about-xinhua.html、calculator-fusheng.html、calculator-hongan.html、calculator-hongxilai.html、calculator-hongyuan.html、calculator-yingmanxin.html、card-hongyu.html、clause-hengxiang.html、clause-hongtai.html、clause-hongyu.html、clause-hongyuan.html、clause-huacai.html、company-intro.html、dividend-2025-interpretation.html、dividend.html、hongli-realization.html、index.html、insurance-knowledge-card.html、intro-yingmanxin.html、jujia.html、sales-qa-chuancheng.html、sales-qa-hk.html、sales-qa-yanglao.html、sales-qa-yiyi.html、training.html、zengzhi.html、calculator-hengxiang.html、calculator-hongkun.html、calculator-hongtai.html、calculator-hongyu.html、calculator-huacai.html、sales-qa-fenhong.html、sales-qa-gaoke.html、sales-qa.html

### ⚠️ 脱敏后公开（进入，必须改）
- calculator-fusheng / hengxiang / hongkun / hongtai / hongyu / huacai（6 个）：页内含用户可见"仅供内部保险从业人员学习、交流使用"声明 + 代码注释引用"中行/宏安/招行规范"。脱敏：声明改为公开口径；删除渠道注释里的银行名（不改任何计算公式/数据）。
- sales-qa.html / sales-qa-fenhong.html / sales-qa-gaoke.html（3 个）：HTML 注释含"宏愿人生（中行主力）""宏安世家（中行主力，优先）"等渠道定位标注。脱敏：删除注释中的中行渠道定位词（可见正文"工行农行中行建行"属通用银保背景，保留）。

### 🔒 内部 / 开发工具（不进入公开版）
- icon-system-2026.html（图标系统，开发参考，非用户内容）
- preview.html（文件预览页，开发工具）
- huifang.html（电子回执回访操作流程，渠道作业流程）
- fuxing.html（保单复效操作流程，渠道作业流程）

---

## 二、files/ 下的 HTML 页面

### ✅ 公开（5 个，进入）
- files/公司介绍/2604新华在售产品培训.html
- files/公司介绍/training-dividend-investment-intro.html
- files/公司介绍/新华保险投资实力介绍（新华资管）.html
- files/分红资料/training-dividend-report-fts.html
- files/产品规则/荣尊世家减保规则.html

### ❌ 禁止进入
- files/产品对比/training-zhaohang-18-products-comparison.html（招行在架产品对比，渠道武器）
- files/产品介绍/新华宏御世家_知识问答卡片 (6).html（旧版重复，正式入口用根目录 card-hongyu.html）

### 🔒 内部（不进入）
- files/培训课程/training-marketing-dual-drive.html（内部营销培训全文）
- files/培训课程/main-training.pptx（含第三方模板版权声明）
- 所有 .pptx / .pdf / .xlsx / .xls / .m4a 原件

---

## 三、二进制与渠道资料（默认不进入）

全部默认排除，不复制进公开版：
- 招行在架产品对比分析.pptx / .xlsx（files/产品对比）
- 中行资料/ 整目录（清单、投保指引、segments 切图 28 张、suitability 图）
- 培训课程/ 整目录（main-training.pptx + 营销双轮驱动页）
- 合同模板/（合同 PDF）
- 手工单模板/（手工单 PDF + 图片）
- 演算器/（利益演示 xlsx/xls）
- 养老社区/（价格汇总表 xls + 一页通 pdf）
- 操作流程/（招行手机银行投保常见问题.pdf + 出单流程图，渠道作业）
- 产品介绍/ 盈满鑫 PDF（2 个）、旧版宏御卡 html
- 公司介绍/ 全部 PDF（公司分红投资介绍.pdf、新华公司介绍2026.pdf、2604.pptx、新华资管.pptx）
- 分红资料/ 全部 PDF（分红专题汇报fts.pdf）
- 增值服务/ 全部 PDF 与 xlsx（新华尊服务项目介绍.pdf、居家养老权益一页通.pdf、瑞慈体检套餐.xlsx）
- 项目外音频/转录/费率费用表（本就不在仓库）

原则：页面可以公开 ≠ 原始文件可以公开。公开版只保留整理后的 HTML 页面。

---

## 四、图片白名单（✅ 可进入）

- assets/preview/*.jpg（5 张：hengxiang / hongan / hongyu / hongyuan / yingmanxin 产品预览图）
- images/hongyu-card-overview.jpeg（根目录，card-hongyu.html 引用）
- files/增值服务/*.jpg（5 张：新华尊权益一览/新华瑞权益一览/居家养老护理包/新华尊使用流程/新华尊小程序二维码）
- files/originals/增值服务/居家养老3000分护理包.png
- files/产品对比/在售产品投保年龄及起售金额.jpg（公开产品信息图）
- files/产品规则/交清增额释义.png（公开产品规则图）

### 图片黑名单（不进入）
- files/中行资料/*（全部）
- files/操作流程/*.jpg（出单流程图，渠道作业）
- files/手工单模板/*.jpg（内部作业）
- files/originals/手工单模板/*、files/originals/操作流程/*（内部作业）
- images/ppt-2604/、images/company-intro/（如未被公开页引用则不复制；当前公开页仅引用 images/hongyu-card-overview.jpeg）

---

## 五、样式与数据

- assets/css/（theme.css、calc-common.css 等）：✅ 进入，已扫无敏感词
- assets/data/training.json：⚠️ 进入但公开版重新生成（见下）
- assets/preview/：✅ 进入

### 公开版 training.json 保留课程（7 门）
1. prod-train-2604（产品说明）→ files/公司介绍/2604新华在售产品培训.html
2. inv-strength（公司实力）→ files/公司介绍/新华保险投资实力介绍（新华资管）.html
3. div-inv-intro（公司实力）→ files/公司介绍/training-dividend-investment-intro.html
4. hongli-2025（分红解读）→ dividend-2025-interpretation.html
5. div-report-fts（分红解读）→ files/分红资料/training-dividend-report-fts.html
6. sales-qa（表达参考，单一入口，合并原 prod-qa-handbook）→ sales-qa.html
7. ins-knowledge（知识卡）→ insurance-knowledge-card.html

### 公开版 training.json 移除课程
- zhaohang-compare（产品对比）→ 招行渠道资料，❌
- marketing-dual-drive（营销方法）→ 内部营销培训+版权，❌
- prod-qa-handbook → 与 sales-qa 同页，仅保留一个入口

公开版分类：产品说明 / 分红解读 / 表达参考 / 公司实力 / 知识卡（移除无课程的"产品对比""营销方法"）。

---

## 六、结构问题处理（仅公开版）

1. QA 重复入口：prod-qa-handbook 与 sales-qa 同页，公开版只留 sales-qa 一个入口。
2. 宏御知识卡：正式入口 card-hongyu.html；旧版 files/产品介绍/新华宏御世家_知识问答卡片(6).html 不进入公开版。
3. dividend.html：保留官方查询入口，增加"2025 红利实现率解读"（dividend-2025-interpretation.html）与"红利实现率专题"（hongli-realization.html）两个入口。
4. sales-qa 系列：统一增加返回培训中心/知识资料库入口。

---

## 七、链接与敏感扫描（进入后执行）

- 删除 index.html 中指向旧仓库 `https://1131921527-alt.github.io` 的 preconnect/dns-prefetch（保留自引用结构）。
- 修复 index.html 死链 `files/公司介绍/2604新华在售产品说明.html` → 改为 `files/公司介绍/2604新华在售产品培训.html`。
- 删除 about-xinhua.html、intro-yingmanxin.html 中指向盈满鑫 PDF、公司分红投资介绍 PDF 的下载链接（PDF 不进公开版）。
- 全站扫描 href/src/fetch/iframe/import/JSON/图片/下载：修正指向内部母版、招行/中行资料、PPT/XLSX/内部 PDF、E:\ 绝对路径、.workbuddy 的引用。
- 敏感词扫描：招行/中行/在架/仅供内部/请勿传播/侵权必究/我行/支行/网点/客户名单/AUM/中收/手机号/微信/身份证/讲师姓名，逐条判读上下文。
