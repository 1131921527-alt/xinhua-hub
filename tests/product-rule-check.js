'use strict';
/**
 * 新华Hub 产品规则层 · 自动验收脚本
 * ------------------------------------------------------------
 * 用法：  node tests/product-rule-check.js
 * 覆盖：  盈满鑫 / 宏御 / 宏安 / 宏泰 / 宏愿 / 宏禧来 / 华彩 / 宏坤 / 福盛世家 / 恒享
 * 校验项：
 *   ① 页面正常生成（表格有数据）
 *   ② 无 console / pageerror 报错（桌面 + 手机）
 *   ③ 下载 PNG 正常（blob 或 download 事件，校验 PNG 签名）
 *   ④ 储备期显示符合规则（fixed / payterm / dynamic / none / local-fixed）
 *   ⑤ HTML 调用与 product-rules.js 配置一致性（key / reserveType / showRate / rule）
 *
 * 全程只读不改：不修改任何 HTML / 配置 / 数据。
 * 退出码：全部通过=0，有失败=1，脚本异常=2。
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');        // xinhua-hub 目录
const PORT = process.env.PORT || 8823;
const BASE = `http://127.0.0.1:${PORT}`;

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json',
  '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml'
};

/** 启动一个仅服务 ROOT 的最小静态服务器（避免 file:// 下 fetch 被拦） */
function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      const fp = path.join(ROOT, p);
      if (!fp.startsWith(ROOT)) { res.writeHead(403); res.end('forbidden'); return; }
      fs.readFile(fp, (err, data) => {
        if (err) { res.writeHead(404); res.end('not found'); return; }
        const ext = path.extname(fp).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

/** 读取 product-rules.js，解析出 PRODUCT_RULES 配置 */
function loadRules() {
  const code = fs.readFileSync(path.join(ROOT, 'product-rules.js'), 'utf8');
  const window = {};
  // 该文件只给 window 赋值，无其它依赖
  new Function('window', code)(window);
  return window.PRODUCT_RULES || {};
}

/** 产品清单：mode 决定储备期校验逻辑；inConfig=false 表示不进统一层 */
const PRODUCTS = [
  { name: '盈满鑫', key: 'yingmanxin', file: 'calculator-yingmanxin.html', mode: 'payterm', showRate: true, payModes: [3, 5], hasRateBtn: true, rate: '0.02' },
  { name: '宏御',   key: 'hongyu',     file: 'calculator-hongyu.html',     mode: 'fixed', reserveYears: 5, showRate: true },
  { name: '宏安',   key: 'hongan',     file: 'calculator-hongan.html',     mode: 'fixed', reserveYears: 5, showRate: true, hasRateBtn: true, rate: '0.02' },
  { name: '宏泰',   key: 'hongtai',    file: 'calculator-hongtai.html',    mode: 'fixed', reserveYears: 5, showRate: true },
  { name: '宏愿',   key: 'hongyuan',   file: 'calculator-hongyuan.html',   mode: 'fixed', reserveYears: 5, showRate: true, hasRateBtn: true, rate: '0.02' },
  { name: '宏禧来', key: 'hongxilai',  file: 'calculator-hongxilai.html',  mode: 'dynamic', rule: 'rate<=0', showRate: true, hasRateBtn: true, rate: '0.02' },
  { name: '华彩',   key: 'huacai',     file: 'calculator-huacai.html',     mode: 'fixed', reserveYears: 5, showRate: false },
  { name: '宏坤',   key: 'hongkun',    file: 'calculator-hongkun.html',    mode: 'fixed', reserveYears: 5, showRate: false },
  { name: '福盛世家', key: null,        file: 'calculator-fusheng.html',    mode: 'local-fixed', reserveYears: 5, inConfig: false, reserveInHtml: false },
  { name: '恒享',   key: null,         file: 'calculator-hengxiang.html',  mode: 'none', inConfig: false }
];

/** 静态检查：配置完整性 + HTML 调用一致性（不发浏览器） */
function staticCheck(p, RULES) {
  const issues = [];
  const html = fs.readFileSync(path.join(ROOT, p.file), 'utf8');
  if (p.key) {
    if (!RULES[p.key]) {
      issues.push(`配置层缺 key: ${p.key}`);
    } else {
      const rule = RULES[p.key];
      const wantType = p.mode === 'payterm' ? 'payterm' : p.mode === 'dynamic' ? 'dynamic' : 'fixed';
      if (rule.reserveType !== wantType) issues.push(`reserveType 不符：配置=${rule.reserveType} 期望=${wantType}`);
      if (p.mode === 'fixed' && rule.reserveYears !== p.reserveYears) issues.push(`reserveYears 不符：配置=${rule.reserveYears} 期望=${p.reserveYears}`);
      if (typeof p.showRate === 'boolean' && rule.showRate !== p.showRate) issues.push(`showRate 不符：配置=${rule.showRate} 期望=${p.showRate}`);
      if (p.mode === 'dynamic' && rule.rule !== p.rule) issues.push(`rule 不符：配置=${rule.rule} 期望=${p.rule}`);
    }
    if (!html.includes('product-rules.js')) issues.push('HTML 未引用 product-rules.js');
    if (!html.includes(`getProductRule('${p.key}')`)) issues.push(`HTML 未调用 getProductRule('${p.key}')`);
  } else if (p.inConfig === false) {
    if (html.includes('product-rules.js')) issues.push(`【需确认】${p.name} 不应引用 product-rules.js 却引用了`);
  }
  return issues;
}

function isPng(buf) {
  return buf.length > 8 && buf[0] === 137 && buf[1] === 80 && buf[2] === 78 && buf[3] === 71 &&
         buf[4] === 13 && buf[5] === 10 && buf[6] === 26 && buf[7] === 10;
}

function rowHasReserve(row) { return row.some(c => c === '储备期' || c.includes('储备期')); }
function firstNonReserveIndex(rows) {
  for (let i = 1; i < rows.length; i++) if (!rowHasReserve(rows[i])) return i;
  return -1;
}

/** 储备期显示校验：基于合并单元格 rowspan（= 储备期年数） */
function validateReserve(reserveRowspan, rows, p, payMode) {
  const issues = [];
  const n = rows.length;
  if (p.mode === 'none') {
    if (n === 0) issues.push('页面未生成表格');
    else if (rows.some(r => rowHasReserve(r))) issues.push('恒享不应出现“储备期”，但检测到了');
    return issues;
  }
  if (n === 0) { issues.push('页面未生成表格'); return issues; }
  if (reserveRowspan <= 0) issues.push('首行未检测到储备期(rowspan)');
  if (reserveRowspan > 0) {
    const after = rows.slice(reserveRowspan);
    if (after.some(r => rowHasReserve(r))) issues.push('储备期结束后又出现“储备期”');
  }
  if (p.mode === 'fixed' || p.mode === 'local-fixed') {
    if (reserveRowspan !== p.reserveYears) issues.push(`储备期年数应为 ${p.reserveYears}（rowspan=${reserveRowspan}）`);
  } else if (p.mode === 'payterm') {
    if (reserveRowspan !== payMode) issues.push(`payterm 储备期应=交费期 ${payMode}（rowspan=${reserveRowspan}）`);
  } else if (p.mode === 'dynamic') {
    if (reserveRowspan < 1) issues.push('dynamic 储备期年数应≥1');
    const after = rows.slice(reserveRowspan);
    if (after.length && !after.some(r => r.some(c => /^[\d.]+%$/.test(c)))) issues.push('dynamic 储备期后未展示收益率(%)');
  }
  if (p.showRate === false) {
    const nonReserveRow = rows[reserveRowspan];
    if (!nonReserveRow || !nonReserveRow.some(c => c === '-' || c.includes('-'))) issues.push('showRate=false 但储备期后未显示 “-”');
  } else if (p.showRate === true && p.mode !== 'dynamic') {
    const nonReserveRow = rows[reserveRowspan];
    if (!nonReserveRow || !nonReserveRow.some(c => /^[\d.]+%$/.test(c))) issues.push('showRate=true 但储备期后未展示收益率(%)');
  }
  return issues;
}

/** 在指定上下文里填表 + 生成 + 截图，返回 {rows, errors} */
async function generateAndCapture(browser, p, payMode, viewport, shotPath) {
  const ctx = await browser.newContext({ viewport, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
  page.on('pageerror', e => errors.push('[pageerror] ' + e.message));
  await page.addInitScript(() => {
    // 强制禁用 showSaveFilePicker：部分 headless Chromium 会定义它且 await 后挂起，
    // 导致永远走不到 <a download> 锚点分支。置 undefined 后代码走 else 锚点下载。
    try { Object.defineProperty(window, 'showSaveFilePicker', { value: undefined, configurable: true }); }
    catch (e) { window.showSaveFilePicker = undefined; }
    window.__dlBlob = null;
    const orig = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.download && this.href && this.href.startsWith('blob:')) window.__dlBlob = this.href;
      return orig.apply(this, arguments);
    };
  });
  await page.goto(`${BASE}/${p.file}`, { waitUntil: 'load' });
  await page.fill('#age', '40').catch(() => {});
  await page.fill('#premium', '100000').catch(() => {});
  if (payMode) {
    await page.selectOption('#payMode', String(payMode)).catch(() => {});
  } else if (await page.$('#term')) {
    const opts = await page.$$eval('#term option', els => els.map(e => e.value)).catch(() => []);
    const pick = opts.includes('5') ? '5' : (opts[0] || '');
    if (pick) await page.selectOption('#term', pick).catch(() => {});
  }
  if (p.hasRateBtn) await page.click(`.rate-btn[data-rate="${p.rate}"]`).catch(() => {});
  await page.click('button[onclick*="generate"]').catch(() => {});
  try { await page.waitForSelector('tbody tr', { timeout: 4000 }); } catch (e) {}
  await page.waitForTimeout(900);
  const data = await page.evaluate(() => {
    const tb = document.querySelector('#resultBody') || document.querySelector('table tbody');
    if (!tb) return { rows: [], reserveRowspan: 0 };
    const trs = Array.from(tb.querySelectorAll('tr')).slice(0, 12);
    const rows = trs.map(tr => Array.from(tr.querySelectorAll('td,th')).map(td => td.innerText.trim()));
    // 合并单元格：只有首行含“储备期”文字，真实储备期年数 = 该单元格的 rowspan
    let reserveRowspan = 0;
    const firstCells = trs[0] ? Array.from(trs[0].querySelectorAll('td,th')) : [];
    for (const td of firstCells) {
      const t = td.innerText.trim();
      if (t === '储备期' || t.includes('储备期')) {
        reserveRowspan = parseInt(td.getAttribute('rowspan') || '1', 10) || 1;
        break;
      }
    }
    return { rows, reserveRowspan };
  });
  await page.screenshot({ path: shotPath, fullPage: false }).catch(() => {});
  await ctx.close();
  return { rows: data.rows, reserveRowspan: data.reserveRowspan, errors };
}

/** 触发下载并校验 PNG（注入锚点 blob 捕获器，兼容 showSaveFilePicker 不可用的 headless） */
async function checkDownload(browser, p) {
  const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    // 强制禁用 showSaveFilePicker：部分 headless Chromium 会定义它且 await 后挂起，
    // 导致永远走不到 <a download> 锚点分支。置 undefined 后代码走 else 锚点下载。
    try { Object.defineProperty(window, 'showSaveFilePicker', { value: undefined, configurable: true }); }
    catch (e) { window.showSaveFilePicker = undefined; }
    window.__dlBlob = null;
    const orig = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.download && this.href && this.href.startsWith('blob:')) window.__dlBlob = this.href;
      return orig.apply(this, arguments);
    };
  });
  let dlOk = false, reason = '';
  try {
    await page.goto(`${BASE}/${p.file}`, { waitUntil: 'load' });
    await page.fill('#age', '40').catch(() => {});
    await page.fill('#premium', '100000').catch(() => {});
    if (p.hasRateBtn) await page.click(`.rate-btn[data-rate="${p.rate}"]`).catch(() => {});
    await page.click('button[onclick*="generate"]').catch(() => {});
    try { await page.waitForSelector('tbody tr', { timeout: 4000 }); } catch (e) {}
    await page.waitForTimeout(1200);
    const dlPromise = page.waitForEvent('download', { timeout: 20000 }).catch(() => null);
    await page.click('button[onclick*="downloadImage"]').catch(() => {});
    const dl = await dlPromise;
    if (dl) {
      const fp = await dl.path();
      if (fp && fs.existsSync(fp)) { const buf = fs.readFileSync(fp); dlOk = isPng(buf); reason = `download事件 size=${buf.length}`; }
    }
  } catch (e) { reason = 'err:' + e.message; }
  if (!dlOk) {
    const blobUrl = await page.evaluate(() => window.__dlBlob).catch(() => null);
    if (blobUrl) {
      const arr = await page.evaluate(async (url) => {
        const r = await fetch(url); const b = new Uint8Array(await r.arrayBuffer());
        return Array.from(b.slice(0, 8));
      }, blobUrl).catch(() => null);
      if (arr && arr[0] === 137 && arr[1] === 80 && arr[2] === 78 && arr[3] === 71) { dlOk = true; reason = 'blob PNG OK'; }
      else reason = reason || 'blob 非 PNG';
    } else { reason = reason || '未捕获下载事件 / blob'; }
  }
  await ctx.close();
  return { dlOk, reason };
}

(async () => {
  const server = await startServer();
  const browser = await chromium.launch();
  const RULES = loadRules();
  const results = [];

  for (const p of PRODUCTS) {
    const staticIssues = staticCheck(p, RULES);
    const cases = (p.mode === 'payterm') ? p.payModes.map(pm => ({ payMode: pm })) : [{}];
    for (const c of cases) {
      const tag = p.key || p.name;
      const shotBase = path.join(ROOT, 'tests', 'shots', `${tag}_${c.payMode || 'def'}`);
      const desk = await generateAndCapture(browser, p, c.payMode, { width: 1280, height: 900 }, shotBase + '_desktop.png');
      const mob = await generateAndCapture(browser, p, c.payMode, { width: 390, height: 844 }, shotBase + '_mobile.png');
      const dl = await checkDownload(browser, p);

      let reserveIssues = [];
      let manualNote = null;
      if (p.reserveInHtml === false) {
        manualNote = '福盛世家储备期仅在下载 canvas 手绘，HTML 主表无该列，需人工确认截图';
      } else {
        reserveIssues = validateReserve(desk.reserveRowspan, desk.rows, p, c.payMode);
      }
      const generated = desk.rows.length > 0;
      const errs = [...desk.errors, ...mob.errors];
      const pass = staticIssues.length === 0 && generated && errs.length === 0 && reserveIssues.length === 0 && dl.dlOk;

      results.push({
        product: p.name, key: p.key, payMode: c.payMode || null,
        generated, errors: errs, reserveIssues, dlOk: dl.dlOk, dlReason: dl.reason,
        staticIssues, pass, manualNote,
        shots: { desktop: shotBase + '_desktop.png', mobile: shotBase + '_mobile.png' }
      });
      const label = c.payMode ? `${p.name}(${c.payMode}年交)` : p.name;
      const reserveTxt = manualNote ? '人工' : (reserveIssues.length ? 'FAIL' : 'OK');
      console.log(`${pass ? '✅' : '❌'} ${label}  生成=${generated} 报错=${errs.length} 储备期=${reserveTxt} 下载=${dl.dlOk ? 'OK' : 'FAIL'} 配置=${staticIssues.length ? 'FAIL' : 'OK'}`);
      if (staticIssues.length) console.log('   配置问题: ' + staticIssues.join('; '));
      if (reserveIssues.length) console.log('   储备期问题: ' + reserveIssues.join('; '));
      if (manualNote) console.log('   人工确认: ' + manualNote);
      if (errs.length) console.log('   报错: ' + errs.slice(0, 3).join(' | '));
      if (!dl.dlOk) console.log('   下载: ' + dl.reason);
    }
  }

  await browser.close();
  server.close();

  const allPass = results.every(r => r.pass);
  writeReport(results, allPass);
  console.log(`\n==== 总计：${results.filter(r => r.pass).length}/${results.length} 通过 ====`);
  console.log(`报告已写入：tests/last-report.md`);
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });

function writeReport(results, allPass) {
  const lines = [];
  lines.push('# 产品规则层自动验收报告');
  lines.push('');
  lines.push(`- 时间：${new Date().toLocaleString('zh-CN')}`);
  lines.push(`- 结果：**${allPass ? '全部通过 ✅' : '存在失败 ❌'}** （${results.filter(r => r.pass).length}/${results.length}）`);
  lines.push('');
  lines.push('| 产品 | 交费期 | 生成 | 报错 | 储备期 | 下载PNG | 配置一致 | 结论 |');
  lines.push('|---|---|---|---|---|---|---|---|');
  for (const r of results) {
    const c = x => x ? '✅' : '❌';
    const concl = r.pass ? 'PASS' : 'FAIL';
    const reserveCell = r.manualNote ? '人工' : (r.reserveIssues.length ? '❌' : '✅');
    lines.push(`| ${r.product} | ${r.payMode || '-'} | ${c(r.generated)} | ${r.errors.length ? '❌' + r.errors.length : '✅'} | ${reserveCell} | ${c(r.dlOk)} | ${r.staticIssues.length ? '❌' : '✅'} | **${concl}** |`);
  }
  const manuals = results.filter(r => r.manualNote);
  if (manuals.length) {
    lines.push('');
    lines.push('## 需人工确认（脚本无法自动断言）');
    for (const r of manuals) lines.push(`- **${r.product}**：${r.manualNote}`);
  }
  lines.push('');
  lines.push('## 失败明细');
  const fails = results.filter(r => !r.pass);
  if (fails.length === 0) lines.push('无');
  for (const r of fails) {
    lines.push(`- **${r.product}${r.payMode ? '(' + r.payMode + '年交)' : ''}**`);
    if (r.staticIssues.length) lines.push('  - 配置：' + r.staticIssues.join('；'));
    if (!r.generated) lines.push('  - 页面未生成表格');
    if (r.reserveIssues.length) lines.push('  - 储备期：' + r.reserveIssues.join('；'));
    if (r.errors.length) lines.push('  - 报错：' + r.errors.slice(0, 5).join(' | '));
    if (!r.dlOk) lines.push('  - 下载：' + r.dlReason);
  }
  lines.push('');
  lines.push('## 需人工确认');
  lines.push('- 宏御（hongyu）主表使用内联逻辑读取 `RULE.reserveYears`，未调用通用 `window.resolveReserveYears` 辅助函数（功能等价，风格建议统一）。');
  lines.push('- `hongtai / hongkun / huacai / fusheng` 存在 `_legacyDownloadImage()` 死代码（按钮实际调用 html2canvas 方案），已同步读配置，线上不触发。');
  lines.push('- 福盛世家、恒享不参与统一规则层（按业务要求保留/无储备期概念）。');
  fs.writeFileSync(path.join(ROOT, 'tests', 'last-report.md'), lines.join('\n'), 'utf8');
}
