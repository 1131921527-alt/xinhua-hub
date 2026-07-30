# 新华Hub 产品规则层重构 · 全项目规则扫描报告

- 扫描日期：2026-07-30
- 扫描范围：`xinhua-hub/` 根目录全部 `calculator-*.html` **活文件**（共 10 个）
- 排除目录：`archive/`、`backup/` 为历史快照，不计入本轮验收
- 扫描目标：① 是否还有储备期数字硬编码 ② 是否还有收益率显示规则硬编码 ③ 已读 `product-rules.js` 的产品是否仍残留旧逻辑
- 本轮性质：**仅架构验收，不修改任何业务逻辑 / Excel / 数据 / 样式**

---

## 一、结论总览

| 分类 | 数量 | 产品 |
|---|---|---|
| 进入统一规则层（读 `product-rules.js`） | 8 | 盈满鑫、宏御、宏安、宏泰、宏愿、宏禧来、华彩、宏坤 |
| 不进入统一层（保留本地逻辑） | 1 | 福盛世家 |
| 不参与储备期体系 | 1 | 恒享 |

**硬性结论：活文件中已无"既读配置又残留旧硬编码"的矛盾态；进入规则层的 8 款全部 100% 读配置，零硬编码残留。**

---

## 二、逐文件扫描明细

| 文件 | 引 product-rules.js | 储备期来源 | 收益率显示 | 主表/下载是否一致 | 硬编码残留 |
|---|---|---|---|---|---|
| calculator-yingmanxin.html（盈满鑫） | ✅ L9 | `getProductRule('yingmanxin')` → resolveReserveYears(RULE, **payTerm**)（L395-396） | showRate=true | 主表读配置；下载 html2canvas 截主表自动同步 | 0 |
| calculator-hongyu.html（宏御） | ✅ L108 | `getProductRule('hongyu')` → 内联 RULE.reserveYears（L330-333） | showRate=true（L333） | 主表读配置；下载 html2canvas 截主表自动同步 | 0 |
| calculator-hongan.html（宏安） | ✅ L9 | `getProductRule('hongan')` → resolveReserveYears(RULE,0)（L391-392） | showRate=RULE.showRate（L393） | 主表读配置；下载 html2canvas 截主表自动同步 | 0 |
| calculator-hongtai.html（宏泰） | ✅ L91 | `getProductRule('hongtai')` → resolveReserveYears（主表 L273-274 / 下载 L357-358） | showRate=true | 主表 + canvas 下载**两处均读配置**（原三处打架已统一） | 0 |
| calculator-hongyuan.html（宏愿） | ✅ L9 | `getProductRule('hongyuan')` → resolveReserveYears(RULE,0)（L384-385） | showRate=true | 主表读配置；下载 html2canvas 截主表自动同步 | 0 |
| calculator-hongxilai.html（宏禧来） | ✅ L9 | `getProductRule('hongxilai')` → `evalReserveRule(RULE,r)`（L334-337，dynamic `rate<=0`） | showRate=true | 主表读配置；下载 html2canvas 截主表自动同步 | 0 |
| calculator-huacai.html（华彩） | ✅ L104 | `getProductRule('huacai')` → resolveReserveYears（主表 L405-406 / 下载 L621-622） | showRate=**false**（储备期后显示 `-`） | 主表 + canvas 下载两处均读配置 | 0 |
| calculator-hongkun.html（宏坤） | ✅ L84 | `getProductRule('hongkun')` → resolveReserveYears（主表 L259-260 / 下载 L322-323） | showRate=**false**（储备期后显示 `-`） | 主表 + canvas 下载两处均读配置 | 0 |
| calculator-fusheng.html（福盛世家） | ❌ 不引 | 本地 `const reserveYears=5`（L279，L295 `reserve:yr<=reserveYears`） | 本地逻辑 | 主表 + canvas 下载均用本地值 | 仅 L279 `=5`（**预期内**，不进统一层） |
| calculator-hengxiang.html（恒享） | ❌ 不引 | 无储备期概念（`is5y=yr>=5` 仅作每 5 年行高亮，非储备期） | 无收益率储备规则 | 主表 + 下载无储备期逻辑 | 0 |

---

## 三、配置层完整性检查（product-rules.js）

配置层定义 8 条规则，与 8 个 HTML 的 `getProductRule('key')` 调用**逐一对应、零偏差**：

| key | reserveType | reserveYears | showRate | HTML 调用 | 一致性 |
|---|---|---|---|---|---|
| yingmanxin | payterm | — | true | L395 | ✅ |
| hongyu | fixed | 5 | true | L330 | ✅ |
| hongan | fixed | 5 | true | L391 | ✅ |
| hongtai | fixed | 5 | true | L273 / L357 | ✅ |
| hongyuan | fixed | 5 | true | L384 | ✅ |
| hongxilai | dynamic | — | true | L334 | ✅ |
| huacai | fixed | 5 | false | L405 / L621 | ✅ |
| hongkun | fixed | 5 | false | L259 / L322 | ✅ |

- 辅助函数：`getProductRule` / `resolveReserveYears` / `evalReserveRule` 三个入口均在 `product-rules.js` 中定义，8 款产品调用路径一致。
- **无拼写错误、无产品名不一致、无缺配置。**
- 福盛世家（fusheng）已从配置层移除（按"不进统一层"要求），恒享（hengxiang）从未进入配置层。

---

## 四、残留硬编码清单（活文件）

| 位置 | 代码 | 性质 | 处理 |
|---|---|---|---|
| calculator-fusheng.html:279 | `const reserveYears=5;` | 福胜本地逻辑（不进统一层） | **保留，符合预期** |
| 其余 8 款活文件 | — | — | **零命中** |

> 注：`archive/`、`backup/` 下存在历史版本的 `reserveYears=5` / `yr<=5` / `r.rate<=0` 等硬编码，均为重构前快照，非线上文件，忽略。

---

## 五、风险与需人工确认项

1. **【低·风格不一致】宏御（hongyu）主表**用内联逻辑 `RULE.reserveType === 'fixed' ? RULE.reserveYears : ...` 解析储备期（L331-332），未调用通用辅助函数 `window.resolveReserveYears`。功能等价，但与其余 7 款风格不统一，后续建议统一为辅助函数（非缺陷，不影响正确性）。
2. **【信息·死代码】** `hongtai` / `hongkun` / `huacai` / `fusheng` 存在 `_legacyDownloadImage()`（canvas 手绘）函数，但页面下载按钮实际调用的是 `downloadImage()`（html2canvas 截 `#planArea`）。该死代码已同步改为读配置，线上不触发，可后续清理以减体积。
3. **【待你确认·业务】** 福盛世家前 5 年"储备期"标记是否应**完全去除**（按你要求已不进统一层、保留本地逻辑）。若连这列都不该显示，告知我摘除。
4. **【待你确认·业务】** 盈满鑫 `payterm` 规则以"交费期"为储备期（3 年交→前 3 年、5 年交→前 5 年），与页面缴费期选择联动，符合展示约定。

---

## 六、下一步建议

1. 运行自动回归：`node tests/product-rule-check.js`，对 10 款产品跑 ①页面生成 ②无 console 报错 ③下载 PNG ④下载与页面一致 ⑤储备期显示符合规则。
2. 验收通过后，**建立独立连字符测试分支**提交（不碰 main），再 push。
3. 后续新增产品：只需在 `product-rules.js` 增一条 `PRODUCT_RULES.xxx`，无需改任何 HTML；并重跑 `node tests/product-rule-check.js` 确认。
