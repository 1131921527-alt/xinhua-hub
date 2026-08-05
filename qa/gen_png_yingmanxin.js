// 生成盈满鑫三档保费(10万/100万/1000万)导出PNG，验证重排版效果
// 用法: node gen_png_yingmanxin.js  (需本地 http server 提供 xinhua-hub 目录)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://127.0.0.1:8099';
const FILE = 'calculator-yingmanxin.html';
const OUT = path.resolve(__dirname, '..', 'export-png');

const tiers = [
  { label: '10万', premium: 100000 },
  { label: '100万', premium: 1000000 },
  { label: '1000万', premium: 10000000 },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  page.on('console', m => { if (m.type() === 'error') console.log('PAGE-ERR', m.text()); });
  page.on('pageerror', e => console.log('PAGE-EXCEPTION', e.message));

  await page.goto(`${BASE}/${FILE}`, { waitUntil: 'networkidle' });
  // 等 DATA 异步加载完成（loadData 中 fetch 后设 currentParams）
  await page.waitForFunction(() => window.currentParams !== null && window.currentParams !== undefined, { timeout: 20000 });

  // 设定典型客户基准参数（女性/40岁/3年交/10年保）——仅为展示排版，不影响列结构
  await page.evaluate(() => {
    document.getElementById('age').value = 40;
    document.getElementById('payMode').value = 3;
    document.getElementById('period').value = 10;
  });

  for (const t of tiers) {
    const dataUrl = await page.evaluate(async (prem) => {
      try {
        document.getElementById('premium').value = prem;
        generate();                       // 同步重算并写 #exportRoot
        const el = document.getElementById('exportRoot');
        const prev = { left: el.style.left, top: el.style.top, position: el.style.position };
        // 临时移到可见区，避免 left:-9999px 在 html2canvas 下截出空白
        el.style.left = '0px'; el.style.top = '0px'; el.style.position = 'relative';
        const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
        el.style.left = prev.left; el.style.top = prev.top; el.style.position = prev.position;
        return canvas.toDataURL('image/png');
      } catch (e) {
        return 'ERR:' + e.message;
      }
    }, t.premium);

    if (dataUrl.startsWith('ERR:')) {
      console.log('FAILED', t.label, dataUrl);
      continue;
    }
    const b64 = dataUrl.split(',')[1];
    const buf = Buffer.from(b64, 'base64');
    const outName = `盈满鑫_${t.label}_计划书.png`;
    fs.writeFileSync(path.join(OUT, outName), buf);
    console.log('saved', outName, (buf.length / 1024).toFixed(1) + 'KB');
  }
  await browser.close();
  console.log('DONE');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
