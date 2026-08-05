// 验证本次三个细节修复是否生效：
// 1) 主表第1行与后续行高度一致（不被储备期 rowspan 撑高）
// 2) 定存收益明细 tfoot 文字垂直居中
// 3) 储备期合并单元格高度 = 跨行总高度，无底部白缝
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
    const dep = root.querySelector('.exp-dep');
    const mainRows = [...main.querySelectorAll('tbody tr')];
    const depFootRow = dep.querySelector('tfoot tr');

    // 1. 主表各行高度
    const rowHeights = mainRows.map(tr => Math.round(tr.getBoundingClientRect().height));

    // 2. 储备期合并单元格
    const reserveCell = main.querySelector('.exp-reserve');
    const reserveSpan = reserveCell ? parseInt(reserveCell.getAttribute('rowspan'), 10) : 0;
    const reserveH = reserveCell ? Math.round(reserveCell.getBoundingClientRect().height) : 0;
    // 找到储备期合并格起始行索引
    let reserveStartIdx = -1;
    mainRows.forEach((tr, idx) => {
      if (tr.querySelector('.exp-reserve')) reserveStartIdx = idx;
    });
    const coveredH = reserveStartIdx >= 0
      ? mainRows.slice(reserveStartIdx, reserveStartIdx + reserveSpan).reduce((s, tr) => s + Math.round(tr.getBoundingClientRect().height), 0)
      : 0;

    // 3. 定存收益明细 tfoot 垂直居中情况：测量单元格高度与 line-height
    const footTds = depFootRow ? [...depFootRow.querySelectorAll('td')] : [];
    const footInfo = footTds.map(td => ({
      text: td.textContent.trim().slice(0, 8),
      height: Math.round(td.getBoundingClientRect().height),
      lineHeight: td.style.lineHeight,
      paddingTop: td.style.paddingTop,
      paddingBottom: td.style.paddingBottom,
      verticalAlign: td.style.verticalAlign,
    }));

    // 4. 储备期单元格的 padding / line-height
    const reserveStyle = reserveCell ? {
      height: Math.round(reserveCell.getBoundingClientRect().height),
      lineHeight: reserveCell.style.lineHeight,
      paddingTop: reserveCell.style.paddingTop,
      paddingBottom: reserveCell.style.paddingBottom,
    } : null;

    return {
      rowHeights,
      firstEqualsSecond: rowHeights[0] === rowHeights[1],
      maxRowHeightDiff: Math.max(...rowHeights) - Math.min(...rowHeights),
      reserve: { span: reserveSpan, cellHeight: reserveH, coveredHeight: coveredH, match: Math.abs(reserveH - coveredH) <= 1, style: reserveStyle },
      depFoot: footInfo,
    };
  });

  console.log(JSON.stringify(r, null, 2));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
