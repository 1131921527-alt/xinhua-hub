const { chromium } = require('playwright');
const file = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  const url = 'file:///E:/workbuddyFIle/%E8%85%BE%E8%AE%AF%E9%BE%99%E8%99%BE%E7%9A%84%E6%88%90%E5%93%81/xinhua-hub/' + file;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  try { await page.evaluate(() => { if (typeof generate === 'function') generate(); }); } catch (e) {}
  await page.waitForTimeout(500);
  const data = await page.evaluate(() => {
    const intro = document.querySelector('.plan-intro');
    if (!intro) return { error: 'no .plan-intro' };
    const kids = Array.from(intro.children).filter(c => c.tagName === 'DIV');
    const rect = el => { const r = el.getBoundingClientRect(); return { top: Math.round(r.top), height: Math.round(r.height), bottom: Math.round(r.bottom) }; };
    const cs = getComputedStyle(intro);
    return { introBorder: cs.borderTopWidth + ' ' + cs.borderTopStyle, kids: kids.map(k => ({ ...rect(k) })) };
  });
  const ks = data.kids || [];
  const aligned = ks.length === 2 && ks[0].top === ks[1].top && ks[0].height === ks[1].height && ks[0].bottom === ks[1].bottom;
  console.log(JSON.stringify(data));
  console.log('ALIGNED=' + aligned);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
