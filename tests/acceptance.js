// 新华Hub V1.0 上线前完整验收
// 覆盖：10 演算器 × 桌面+移动端（iPhone 390x844 + 微信UA）
// 检查项：console 0 错误 / 生成成功 / 下载 PNG 成功 / 移动端横向溢出=0
// 纯读取验证，不修改任何文件、数据、公式。
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PROJ = path.resolve(__dirname, '..');
const PORT = 8911;

const PRODUCTS = [
  { key: 'yingmanxin', url: '/calculator-yingmanxin.html', label: '盈满鑫' },
  { key: 'hongyu',     url: '/calculator-hongyu.html',     label: '宏御世家' },
  { key: 'hongtai',    url: '/calculator-hongtai.html',    label: '宏泰世家' },
  { key: 'hongyuan',   url: '/calculator-hongyuan.html',   label: '宏愿人生' },
  { key: 'hongxilai',  url: '/calculator-hongxilai.html',  label: '宏禧来' },
  { key: 'huacai',     url: '/calculator-huacai.html',     label: '华彩鎏金' },
  { key: 'hongkun',    url: '/calculator-hongkun.html',    label: '宏坤人生' },
  { key: 'hongan',     url: '/calculator-hongan.html',     label: '宏安世家' },
  { key: 'fusheng',    url: '/calculator-fusheng.html',    label: '福盛世家' },
  { key: 'hengxiang',  url: '/calculator-hengxiang.html',  label: '恒享人生' },
];

const WECHAT_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.40(0x1800282c) NetType/WIFI Language/zh_CN';

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      const fp = path.join(PROJ, p);
      fs.readFile(fp, (err, data) => {
        if (err) { res.writeHead(404); res.end('nf'); return; }
        const ext = path.extname(fp);
        const ct = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.css': 'text/css', '.ico': 'image/x-icon' }[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': ct });
        res.end(data);
      });
    });
    server.listen(PORT, () => resolve(server));
  });
}

async function runOne(page, prod, isMobile) {
  const consoleErrors = [];
  page.removeAllListeners('console');
  page.removeAllListeners('pageerror');
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));

  await page.goto('http://localhost:' + PORT + prod.url, { waitUntil: 'load', timeout: 20000 });
  // 移动端：屏蔽 showImagePreview 副作用，统一用 URL.createObjectURL 捕获真实下载产物
  await page.evaluate(() => { window.showImagePreview = () => {}; });

  const overflow = isMobile
    ? await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    : 0;

  // 找生成按钮
  const btnInfo = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const re = /(生成|测算|计算|试算|演算|确定|开始|生成计划书|生成表格|导出)/;
    const b = btns.find(x => re.test(x.textContent || ''));
    if (!b) return null;
    b.click();
    return { text: (b.textContent || '').trim().slice(0, 20) };
  });

  let didGenerate = false;
  try {
    await page.waitForFunction(
      () => document.querySelectorAll('table tr').length > 1,
      { timeout: 12000 }
    );
    didGenerate = true;
  } catch (e) { didGenerate = false; }

  // 触发下载（若尚未自动下载，点一次下载按钮）
  if (didGenerate) {
    await page.evaluate(() => {
      const dl = [...document.querySelectorAll('button,a,[onclick]')].find(el => {
        const t = (el.textContent || '');
        const oc = (el.getAttribute('onclick') || '');
        return /下载|存为图片|保存图片|保存计划书/i.test(t) || /downloadImage|_legacyDownloadImage|showImagePreview/i.test(oc);
      });
      if (dl) dl.click();
    });
    // 等下载产物产生
    try { await page.waitForFunction(() => (window.__blobs || []).length > 0, { timeout: 8000 }); } catch (e) {}
  }

  const dlInfo = await page.evaluate(() => {
    const arr = window.__blobs || [];
    if (!arr.length) return { ok: false, size: 0, type: '' };
    const last = arr[arr.length - 1];
    return { ok: last.size > 1024 && /image\/png/.test(last.type), size: last.size, type: last.type };
  });

  return {
    label: prod.label,
    url: prod.url,
    didGenerate,
    consoleErrors,
    consoleErrorCount: consoleErrors.length,
    horizontalOverflowPx: overflow,
    download: dlInfo,
  };
}

(async () => {
  const server = await startServer();
  const browser = await chromium.launch();
  const results = [];

  try {
    for (const prod of PRODUCTS) {
      // 桌面
      const ctxD = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const pgD = await ctxD.newPage();
      await pgD.addInitScript(() => {
        window.__blobs = [];
        const orig = URL.createObjectURL.bind(URL);
        URL.createObjectURL = (b) => { try { window.__blobs.push({ size: b.size, type: b.type }); } catch (e) {} return orig(b); };
        try { window.showSaveFilePicker = undefined; } catch (e) {}
      });
      const d = await runOne(pgD, prod, false);
      await ctxD.close();

      // 移动
      const ctxM = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: WECHAT_UA });
      const pgM = await ctxM.newPage();
      await pgM.addInitScript(() => {
        window.__blobs = [];
        const orig = URL.createObjectURL.bind(URL);
        URL.createObjectURL = (b) => { try { window.__blobs.push({ size: b.size, type: b.type }); } catch (e) {} return orig(b); };
        try { window.showSaveFilePicker = undefined; } catch (e) {}
      });
      const m = await runOne(pgM, prod, true);
      await ctxM.close();

      results.push({
        label: prod.label,
        url: prod.url,
        desktop: { didGenerate: d.didGenerate, consoleErrorCount: d.consoleErrorCount, downloadOk: d.download.ok, downloadSize: d.download.size },
        mobile: { didGenerate: m.didGenerate, consoleErrorCount: m.consoleErrorCount, horizontalOverflowPx: m.horizontalOverflowPx, downloadOk: m.download.ok, downloadSize: m.download.size },
        consoleErrors: [...d.consoleErrors, ...m.consoleErrors],
      });
      console.log(`✓ ${prod.label.padEnd(5)} 桌面:生成=${d.didGenerate} 下载=${d.download.ok}(${d.download.size}B) err=${d.consoleErrorCount} | 移动:溢出=${m.horizontalOverflowPx}px 生成=${m.didGenerate} 下载=${m.download.ok} err=${m.consoleErrorCount}`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  const failGen = results.filter(r => !r.desktop.didGenerate || !r.mobile.didGenerate);
  const failDl = results.filter(r => !r.desktop.downloadOk || !r.mobile.downloadOk);
  const failConsole = results.filter(r => r.consoleErrors.length > 0);
  const failOverflow = results.filter(r => r.mobile.horizontalOverflowPx > 0);

  const summary = {
    totalProducts: results.length,
    allGenerateOk: failGen.length === 0,
    allDownloadOk: failDl.length === 0,
    allConsoleClean: failConsole.length === 0,
    allMobileNoOverflow: failOverflow.length === 0,
    fails: {
      generate: failGen.map(r => r.label),
      download: failDl.map(r => r.label),
      console: failConsole.map(r => ({ label: r.label, errors: r.consoleErrors })),
      overflow: failOverflow.map(r => ({ label: r.label, px: r.mobile.horizontalOverflowPx })),
    },
  };

  const out = { generatedAt: new Date().toISOString(), summary, products: results };
  fs.writeFileSync(path.join(__dirname, 'acceptance-report.json'), JSON.stringify(out, null, 2), 'utf8');

  console.log('\n===== 验收汇总 =====');
  console.log('10演算器生成: ', summary.allGenerateOk ? 'PASS' : 'FAIL ' + JSON.stringify(summary.fails.generate));
  console.log('下载图片:      ', summary.allDownloadOk ? 'PASS' : 'FAIL ' + JSON.stringify(summary.fails.download));
  console.log('console 0错误:', summary.allConsoleClean ? 'PASS' : 'FAIL ' + summary.fails.console.length + ' 个产品');
  console.log('移动端无溢出:  ', summary.allMobileNoOverflow ? 'PASS' : 'FAIL ' + JSON.stringify(summary.fails.overflow));
  console.log('\n报告已写: tests/acceptance-report.json');
})();
