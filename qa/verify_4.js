// 验证宏安/宏愿/恒享/宏御 导出相关修复：数据字重是否恢复正常、储备期是否合并
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8099';
const files = ['calculator-hongan.html', 'calculator-hongyuan.html', 'calculator-hengxiang.html', 'calculator-hongyu.html'];

(async () => {
  const b = await chromium.launch();
  for (const f of files) {
    const p = await b.newPage();
    await p.goto(`${BASE}/${f}`, { waitUntil: 'networkidle' });
    await p.evaluate(() => { try { generate(); } catch (e) {} });
    await p.waitForTimeout(800);
    const r = await p.evaluate(() => {
      const tb = document.getElementById('resultBody');
      if (!tb) return { err: 'no resultBody' };
      const rows = [...tb.querySelectorAll('tr')];
      const reserveTds = [...tb.querySelectorAll('td')].filter(td => {
        const t = td.textContent.trim();
        if (t === '储备期') return true;
        const sp = td.querySelector('span');
        return sp && sp.textContent.trim() === '储备期';
      });
      const visible = reserveTds.filter(td => td.style.display !== 'none');
      const firstRow = rows[0];
      let dataTd = null;
      if (firstRow) {
        const tds = [...firstRow.querySelectorAll('td')];
        dataTd = tds.find(td => {
          const t = td.textContent.trim();
          if (t === '储备期') return false;
          const sp = td.querySelector('span');
          return !(sp && sp.textContent.trim() === '储备期');
        }) || tds[0];
      }
      return {
        rowCount: rows.length,
        reserveTdCount: reserveTds.length,
        reserveVisible: visible.length,
        reserveRowspan: reserveTds[0] ? reserveTds[0].getAttribute('rowspan') : null,
        firstDataFontWeight: dataTd ? getComputedStyle(dataTd).fontWeight : null,
      };
    });
    console.log(f, JSON.stringify(r));
    await p.close();
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
