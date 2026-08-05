// 整体验证盈满鑫三档导出图关键排版指标：行高一致、储备期无白缝、tfoot居中、标题条间距
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8099';
const tiers = [
  { label: '10万', premium: 100000 },
  { label: '100万', premium: 1000000 },
  { label: '1000万', premium: 10000000 },
];

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto(`${BASE}/calculator-yingmanxin.html`, { waitUntil: 'networkidle' });
  await p.waitForFunction(() => window.currentParams !== null, { timeout: 20000 });

  for (const t of tiers) {
    await p.evaluate((prem) => {
      document.getElementById('age').value = 40;
      document.getElementById('payMode').value = 3;
      document.getElementById('period').value = 10;
      document.getElementById('premium').value = prem;
      generate();
    }, t.premium);

    const r = await p.evaluate(() => {
      const root = document.getElementById('exportRoot');
      const main = root.querySelector('.exp-main');
      const dep = root.querySelector('.exp-dep');
      const depBox = document.querySelector('.exp-box.dep-box');
      const depH = depBox.querySelector('.exp-h');
      const mainRows = [...main.querySelectorAll('tbody tr')];
      const rowHeights = mainRows.map(tr => Math.round(tr.getBoundingClientRect().height));
      const reserveCell = main.querySelector('.exp-reserve');
      const span = reserveCell ? parseInt(reserveCell.getAttribute('rowspan'), 10) : 0;
      let startIdx = -1;
      mainRows.forEach((tr, i) => { if (tr.querySelector('.exp-reserve')) startIdx = i; });
      const covered = startIdx >= 0 ? mainRows.slice(startIdx, startIdx + span).reduce((s, tr) => s + Math.round(tr.getBoundingClientRect().height), 0) : 0;
      const reserveH = reserveCell ? Math.round(reserveCell.getBoundingClientRect().height) : 0;
      const boxRect = depBox.getBoundingClientRect();
      const hRect = depH.getBoundingClientRect();
      const tableRect = depBox.querySelector('.exp-dep').getBoundingClientRect();
      return {
        rowHeights,
        rowHeightDiff: Math.max(...rowHeights) - Math.min(...rowHeights),
        reserveSpan: span,
        reserveH, covered, reserveMatch: Math.abs(reserveH - covered) <= 1,
        depTitleGapTop: Math.round(hRect.top - boxRect.top),
        depTitleGapBottom: Math.round(tableRect.top - hRect.bottom),
      };
    });
    console.log(t.label, JSON.stringify(r));
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
