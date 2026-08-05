const { chromium } = require('playwright');
const file = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  const url = 'file:///E:/workbuddyFIle/%E8%85%BE%E8%AE%AF%E9%BE%99%E8%99%BE%E7%9A%84%E6%88%90%E5%93%81/xinhua-hub/' + file;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const before = await page.evaluate(() => {
    const pa = document.getElementById('planArea');
    return {
      hasPlanIntro: !!document.querySelector('.plan-intro'),
      hasIntroRow: !!document.querySelector('.intro-row'),
      planAreaLen: pa ? pa.innerHTML.length : -1,
      planAreaSnippet: pa ? pa.innerHTML.slice(0, 200) : 'NO planArea'
    };
  });
  console.log('BEFORE generate:', JSON.stringify(before, null, 2));
  try { await page.evaluate(() => { if (typeof generate === 'function') generate(); }); } catch (e) { console.log('generate error:', e.message); }
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => {
    const pa = document.getElementById('planArea');
    const intro = document.querySelector('.plan-intro');
    return {
      hasPlanIntro: !!document.querySelector('.plan-intro'),
      hasIntroRow: !!document.querySelector('.intro-row'),
      introSnippet: intro ? intro.outerHTML.slice(0, 260) : 'NO .plan-intro in DOM'
    };
  });
  console.log('AFTER generate:', JSON.stringify(after, null, 2));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
