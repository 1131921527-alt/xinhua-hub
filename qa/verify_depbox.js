// 验证定存收益明细区块标题条与 box 边框/表格之间的间距
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8099';

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto(`${BASE}/calculator-yingmanxin.html`, { waitUntil: 'networkidle' });
  await p.waitForFunction(() => window.currentParams !== null, { timeout: 20000 });
  await p.evaluate(() => {
    document.getElementById('age').value = 40;
    document.getElementById('payMode').value = 3;
    document.getElementById('period').value = 10;
    document.getElementById('premium').value = 1000000;
    generate();
  });

  const r = await p.evaluate(() => {
    const depBox = document.querySelector('.exp-box.dep-box');
    const depH = depBox.querySelector('.exp-h');
    const depTable = depBox.querySelector('.exp-dep');
    const boxRect = depBox.getBoundingClientRect();
    const hRect = depH.getBoundingClientRect();
    const tableRect = depTable.getBoundingClientRect();
    return {
      boxTop: Math.round(boxRect.top),
      boxBorderTop: Math.round(boxRect.top), // 外边框顶部
      titleTop: Math.round(hRect.top),
      titleBottom: Math.round(hRect.bottom),
      tableTop: Math.round(tableRect.top),
      gapBorderToTitle: Math.round(hRect.top - boxRect.top), // 边框到标题条顶部的距离
      gapTitleToTable: Math.round(tableRect.top - hRect.bottom), // 标题条底部到表格顶部的距离
      titleHasRadius: window.getComputedStyle(depH).borderRadius,
    };
  });

  console.log(JSON.stringify(r, null, 2));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
