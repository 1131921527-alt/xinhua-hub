// 客观测量盈满鑫导出模板(#exportRoot)关键指标，验证重排版是否生效
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
    const root = document.getElementById('exportRoot');
    const main = root.querySelector('.exp-main');
    const thead = main.querySelector('thead');
    const firstRow = main.querySelector('tbody tr');
    const tds = [...firstRow.querySelectorAll('td')];
    const colWidths = tds.map(td => Math.round(td.getBoundingClientRect().width));
    const reserveCells = [...root.querySelectorAll('.exp-reserve')];
    const reserveInfo = reserveCells.map(c => ({ rowspan: c.getAttribute('rowspan'), text: c.textContent.trim() }));
    const normalTd = tds[2];                       // 当年保费（普通数据）
    const csTd = getComputedStyle(normalTd);
    const csTh = getComputedStyle(main.querySelector('thead th'));
    const totalCell = root.querySelector('.exp-total');
    const csTotal = getComputedStyle(totalCell);
    const keyCell = root.querySelector('.exp-key');
    const csKey = getComputedStyle(keyCell);
    return {
      theadHeight: Math.round(thead.getBoundingClientRect().height),
      colWidths,
      reserveCount: reserveCells.length,
      reserveInfo,
      normalTd_fontWeight: csTd.fontWeight,
      th_fontWeight: csTh.fontWeight,
      total_fontWeight: csTotal.fontWeight,
      key_fontWeight: csKey.fontWeight,
      tableWidth: Math.round(main.getBoundingClientRect().width),
    };
  });
  console.log(JSON.stringify(r, null, 2));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
