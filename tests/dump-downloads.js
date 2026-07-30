'use strict';
/**
 * 新华Hub · 下载图专项导出脚本（仅用于 Task2 视觉核查，不改任何业务代码）
 * 导出每款产品的真实下载 PNG 到 tests/downloads/，供人工/AI 肉眼检查：
 * 完整度 / 空白 / 截断 / 储备期居中 / 收益率显示 / 清晰度。
 *
 * 用法： node tests/dump-downloads.js   （可选 PORT=8833）
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = process.env.PORT || 8833;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(ROOT, 'tests', 'downloads');

const MIME = { '.html':'text/html', '.js':'application/javascript', '.json':'application/json', '.css':'text/css', '.png':'image/png', '.ico':'image/x-icon' };

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      const fp = path.join(ROOT, p);
      if (!fp.startsWith(ROOT)) { res.writeHead(403); res.end('forbidden'); return; }
      fs.readFile(fp, (err, data) => {
        if (err) { res.writeHead(404); res.end('not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

const PRODUCTS = [
  { name: '盈满鑫', file: 'calculator-yingmanxin.html', payModes: [3, 5], rate: '0.02', hasRateBtn: true },
  { name: '宏御', file: 'calculator-hongyu.html' },
  { name: '宏安', file: 'calculator-hongan.html', rate: '0.02', hasRateBtn: true },
  { name: '宏泰', file: 'calculator-hongtai.html' },
  { name: '宏愿', file: 'calculator-hongyuan.html', rate: '0.02', hasRateBtn: true },
  { name: '宏禧来', file: 'calculator-hongxilai.html', rate: '0.02', hasRateBtn: true },
  { name: '华彩', file: 'calculator-huacai.html' },
  { name: '宏坤', file: 'calculator-hongkun.html' },
  { name: '福盛世家', file: 'calculator-fusheng.html' },
  { name: '恒享', file: 'calculator-hengxiang.html' },
];

function sanitize(s){ return s.replace(/[\\/:*?"<>|]/g, '_'); }

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch();
  const summary = [];
  for (const p of PRODUCTS) {
    const cases = p.payModes ? p.payModes : [null];
    for (const pm of cases) {
      const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
      const page = await ctx.newPage();
      await page.addInitScript(() => {
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
      if (pm) { await page.selectOption('#payMode', String(pm)).catch(() => {}); }
      else if (await page.$('#term')) {
        const opts = await page.$$eval('#term option', els => els.map(e => e.value)).catch(() => []);
        const pick = opts.includes('5') ? '5' : (opts[0] || '');
        if (pick) await page.selectOption('#term', pick).catch(() => {});
      }
      if (p.hasRateBtn) await page.click(`.rate-btn[data-rate="${p.rate}"]`).catch(() => {});
      await page.click('button[onclick*="generate"]').catch(() => {});
      try { await page.waitForSelector('tbody tr', { timeout: 4000 }); } catch (e) {}
      await page.waitForTimeout(1200);
      await page.click('button[onclick*="downloadImage"]').catch(() => {});
      await page.waitForTimeout(2500);
      const blobUrl = await page.evaluate(() => window.__dlBlob).catch(() => null);
      let saved = false;
      if (blobUrl) {
        const b64 = await page.evaluate(async (url) => {
          const r = await fetch(url); const buf = new Uint8Array(await r.arrayBuffer());
          let s = ''; for (let i = 0; i < buf.length; i += 8192) s += String.fromCharCode.apply(null, buf.subarray(i, i + 8192));
          return btoa(s);
        }, blobUrl).catch(() => null);
        if (b64) {
          const ext = pm ? `${p.name}_${pm}年交` : p.name;
          const fp = path.join(OUT, sanitize(ext) + '.png');
          fs.writeFileSync(fp, Buffer.from(b64, 'base64'));
          saved = true;
          summary.push(`${saved ? '✅' : '❌'} ${ext} -> ${path.basename(fp)} (${Math.round(b64.length * 0.75 / 1024)}KB)`);
        }
      }
      if (!saved) summary.push(`❌ ${p.name}${pm ? '(' + pm + '年交)' : ''} 未捕获下载图`);
      await ctx.close();
    }
  }
  await browser.close();
  server.close();
  console.log('下载图导出完成：\n' + summary.join('\n'));
  console.log(`\n输出目录：tests/downloads/  (${OUT})`);
})().catch(e => { console.error(e); process.exit(2); });
