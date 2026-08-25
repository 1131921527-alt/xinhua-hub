/**
 * 新华Hub · 利益演示年份显示统一规则
 * ------------------------------------------------------------
 * 目标：所有在线演算器共用同一套显示密度规则，避免不同页面口径混乱。
 *
 * 规则：
 *   SHORT_TERM（短期产品）          → 所有保单年度全部显示
 *   LONG_TERM 且 投保年龄 < 50 岁   → 60 岁以前逐年显示，60 岁及以后每 5 年显示一次
 *   LONG_TERM 且 投保年龄 ≥ 50 岁   → 70 岁以前逐年显示，70 岁及以后每 5 年显示一次
 *   最后一年（保险期间末年）        → 无论是否落在 5 年节点，强制显示
 *
 * 使用方式：
 *   1. 在演算器 <script> 中引入本文件（建议放在 ai-planner.js 之后）
 *   2. 渲染前调用 window.getDefaultDisplayMode(productKey, entryAge, periodYears)
 *      取得默认模式：'all' | '5y60' | '5y70' | '5y75'
 *   3. 将模式设置到 select / toggle 按钮，再调用过滤函数。
 */
(function () {
  'use strict';

  // 产品显示分类。未列出的产品默认归为 LONG_TERM。
  window.DISPLAY_CATEGORIES = {
    // 短期/中期两全险：所有年度全部显示
    yingmanxin: 'SHORT_TERM',
    hongxilai:  'SHORT_TERM',

    // 长期险（至 105 岁或终身）
    hongda:     'LONG_TERM',
    hongan:     'LONG_TERM',
    hongyu:     'LONG_TERM',
    hongyuan:   'LONG_TERM',
    hongtai:    'LONG_TERM',
    hongkun:    'LONG_TERM',
    huacai:     'LONG_TERM',
    fusheng:    'LONG_TERM',
    hengxiang:  'LONG_TERM'
  };

  /**
   * 获取产品显示分类
   * @param {string} productKey  产品短标识，如 'hongda'
   * @param {number} [periodYears]  保险期间年数（短期险可按期间二次确认，目前默认按 productKey）
   * @returns {'SHORT_TERM'|'LONG_TERM'}
   */
  window.getDisplayCategory = function (productKey, periodYears) {
    var fixed = window.DISPLAY_CATEGORIES[productKey];
    if (fixed) return fixed;
    return 'LONG_TERM';
  };

  /**
   * 根据产品和投保年龄，返回推荐的默认显示模式
   * @param {string} productKey
   * @param {number} entryAge    投保年龄（周岁）
   * @param {number} [periodYears]
   * @returns {'all'|'5y60'|'5y70'|'5y75'}
   */
  window.getDefaultDisplayMode = function (productKey, entryAge, periodYears) {
    var cat = window.getDisplayCategory(productKey, periodYears);
    if (cat === 'SHORT_TERM') return 'all';
    // 长期险
    return (entryAge >= 50) ? '5y70' : '5y60';
  };

  /**
   * 对象数组过滤：根据 mode 保留应显示的行，并强制保留最后一年
   * @param {Array<{ageEnd:number}>} rows  完整行数据，每行必须有 ageEnd（年末年龄）
   * @param {string} mode  'all'|'5y60'|'5y70'|'5y75'
   * @returns {Array} 过滤后的新数组
   */
  window.filterDisplayRows = function (rows, mode) {
    if (!rows || rows.length === 0) return [];
    if (mode === 'all' || !mode) return rows.slice();

    var baseAge = 60;
    if (mode === '5y70') baseAge = 70;
    else if (mode === '5y75') baseAge = 75;

    var last = rows[rows.length - 1];
    return rows.filter(function (r) {
      if (r === last) return true;                 // 最后一年强制显示
      var age = r.ageEnd;
      if (age < baseAge) return true;              // 基准年龄前逐年显示
      return ((age - baseAge) % 5 === 0);          // 基准年龄后每 5 年显示
    });
  };

  /**
   * DOM 行过滤：直接操作 #resultBody 里的 <tr>，兼容已有 select 型演算器
   * 会自动识别“年龄/周岁”列，并强制保留 tbody 内最后一行。
   * @param {string} mode
   */
  window.filterRowsByAgeEnsureLast = function (mode) {
    var tbody = document.getElementById('resultBody');
    if (!tbody) return;

    var rows = Array.from(tbody.querySelectorAll('tr'));
    if (!rows.length) return;

    if (mode === 'all' || !mode) {
      rows.forEach(function (row) { row.style.display = ''; });
      return;
    }

    var baseAge = 60;
    if (mode === '5y70') baseAge = 70;
    else if (mode === '5y75') baseAge = 75;

    // 自动识别年龄列
    var thead = document.querySelector('thead tr');
    var ageColIndex = 1;
    if (thead) {
      var headers = Array.from(thead.querySelectorAll('th, td'));
      for (var h = 0; h < headers.length; h++) {
        if (/年龄|周岁/.test(headers[h].textContent || '')) {
          ageColIndex = h;
          break;
        }
      }
    }

    rows.forEach(function (row, idx) {
      var cells = row.querySelectorAll('td');
      if (cells.length <= ageColIndex) {
        row.style.display = '';
        return;
      }
      var isLast = (idx === rows.length - 1);
      var ageText = (cells[ageColIndex].textContent || '').trim().replace(/[^0-9]/g, '');
      var age = parseInt(ageText, 10);
      if (isNaN(age)) {
        row.style.display = '';
        return;
      }
      if (isLast || age < baseAge || ((age - baseAge) % 5 === 0)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  };

  /**
   * 判断某一行是否应在指定模式下显示（用于需要提前知道显示集合的场景）
   * @param {{ageEnd:number}} row
   * @param {string} mode
   * @param {number} totalRows
   * @param {number} index
   * @returns {boolean}
   */
  window.shouldDisplayRow = function (row, mode, totalRows, index) {
    if (mode === 'all' || !mode) return true;
    var baseAge = 60;
    if (mode === '5y70') baseAge = 70;
    else if (mode === '5y75') baseAge = 75;
    if (index === totalRows - 1) return true;
    var age = row.ageEnd;
    if (age < baseAge) return true;
    return ((age - baseAge) % 5 === 0);
  };
})();
