/**
 * 新华Hub 产品收益率展示规则配置层
 * ------------------------------------------------------------
 * 所有演算器统一读取本配置，不再在各自 HTML 里写死储备期 / 收益率显示逻辑。
 *
 * 字段说明：
 *   reserveType : "fixed"   固定年限储备期（用 reserveYears）
 *              | "payterm" 储备期 = 交费期（盈满鑫规则）
 *              | "dynamic" 动态判定（用 rule，如 "rate<=0"）
 *   reserveYears : fixed 模式下的储备期年数
 *   rule        : dynamic 模式下的判定表达式（字符串，代码内解析）
 *   showRate    : 储备期结束后是否展示收益率（false 时显示 "-"）
 *
 * 新增产品：只需在此增加一条 PRODUCT_RULES.xxx，无需改动任何 HTML。
 */
window.PRODUCT_RULES = {
  // 盈满鑫：按原 Excel 计划书展示口径，储备期 = 交费期 + 1 年
  yingmanxin: { reserveType: "paytermPlusOne", showRate: true },

  // 宏御世家：前 5 年储备期，展示收益率
  hongyu:     { reserveType: "fixed", reserveYears: 5, showRate: true },

  // 宏安世家：前 5 年储备期，展示收益率
  hongan:     { reserveType: "fixed", reserveYears: 5, showRate: true },

  // 宏泰世家：前 5 年储备期，展示收益率（内部逻辑须统一为本配置）
  hongtai:    { reserveType: "fixed", reserveYears: 5, showRate: true },

  // 宏愿人生：前 5 年储备期，展示收益率
  hongyuan:   { reserveType: "fixed", reserveYears: 5, showRate: true },

  // 宏禧来：收益率 ≤ 0 阶段为储备期，展示收益率
  hongxilai:  { reserveType: "dynamic", rule: "rate<=0", showRate: true },

  // 华彩鎏金：前 5 年储备期，储备期后不展示收益率（显示 "-"）
  huacai:     { reserveType: "fixed", reserveYears: 5, showRate: false },

  // 宏坤人生：前 5 年储备期，储备期后不展示收益率（显示 "-"）
  hongkun:    { reserveType: "fixed", reserveYears: 5, showRate: false }
};

/** 按产品 key 取规则；取不到时回退到 fixed=5 的安全默认，避免页面崩。 */
window.getProductRule = function (key) {
  return window.PRODUCT_RULES[key] || { reserveType: "fixed", reserveYears: 5, showRate: true };
};

/**
 * 解析某产品的储备期年数（统一入口，消除各 HTML 内散落的判断分支）。
 * @param {object} rule        产品规则对象（window.getProductRule 的返回值）
 * @param {number} paymentYears 缴费期年数（仅 payterm 模式需要，如盈满鑫）
 * @returns {number} 储备期年数
 *   - fixed   : 返回 rule.reserveYears（如 5）
 *   - payterm : 返回 paymentYears（缴费期=储备期）
 *   - dynamic : 返回 0（动态判定由调用方按 rule.rule 逐行判断，如宏禧来 rate<=0）
 */
window.resolveReserveYears = function (rule, paymentYears) {
  if (!rule) return 5;
  if (rule.reserveType === "payterm") return paymentYears;
  if (rule.reserveType === "paytermPlusOne") return paymentYears + 1;
  if (rule.reserveType === "dynamic") return 0;
  return (typeof rule.reserveYears === "number") ? rule.reserveYears : 5;
};

/**
 * 解析 dynamic 模式的储备期判定（仅 dynamic 类型生效）。
 * 支持规则字符串形如："rate<=0" / "rate<0" / "rate>=0" / "rate>0"
 *   - rate : 对应行的收益率数值（百分比数值，如 2.5 表示 2.5%）
 * 规则字符串统一维护在 product-rules.js，本函数不写死任何数字。
 * @returns {boolean} 该行是否处于储备期
 */
window.evalReserveRule = function (rule, row) {
  if (!rule || rule.reserveType !== "dynamic" || !rule.rule) return false;
  const m = /^rate\s*(<=|<|>=|>)\s*(-?\d+(?:\.\d+)?)$/.exec(String(rule.rule).trim());
  if (!m) return false;
  const op = m[1];
  const val = parseFloat(m[2]);
  const v = row && typeof row.rate === "number" ? row.rate : null;
  if (v === null) return false;
  if (op === "<=") return v <= val;
  if (op === "<")  return v < val;
  if (op === ">=") return v >= val;
  if (op === ">")  return v > val;
  return false;
};
