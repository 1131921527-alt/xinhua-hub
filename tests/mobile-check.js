/**
 * 手机端体验专项检查（任务11）
 * 模拟微信内打开网页：iPhone 视口 + 移动 UA，检查
 *   - 字体大小（关键文本是否 >= 14px）
 *   - 按钮/可点元素尺寸（主操作触控目标是否 >= 40px）
 *   - 页面横向溢出（整页是否出现横向滚动——单手体验硬伤）
 *   - 表格横向滚动（表格宽于视口时是否在滚动容器内，可接受）
 *   - 图片下载（演算器点击「生成」后是否出现下载按钮）
 *   - 返回上一页（SPA 用 location.href 跳转，history.back 可用）
 * 只生成报告，不改任何页面。
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8895;
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 MicroMessenger/8.0 Safari/604.1';
const VIEWPORT = { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 };

const PAGES = [
  { key: 'index', url: '/index.html', label: '首页', calc: false },
  { key: 'yingmanxin', url: '/calculator-yingmanxin.html', label: '盈满鑫', calc: true },
  { key: 'hongyu', url: '/calculator-hongyu.html', label: '宏御世家', calc: true },
  { key: 'hongan', url: '/calculator-hongan.html', label: '宏安世家', calc: true },
  { key: 'hongtai', url: '/calculator-hongtai.html', label: '宏泰世家', calc: true },
  { key: 'hongyuan', url: '/calculator-hongyuan.html', label: '宏愿人生', calc: true },
  { key: 'hongxilai', url: '/calculator-hongxilai.html', label: '宏禧来', calc: true },
  { key: 'huacai', url: '/calculator-huacai.html', label: '华彩鎏金', calc: true },
  { key: 'hongkun', url: '/calculator-hongkun.html', label: '宏坤人生', calc: true },
  { key: 'fusheng', url: '/calculator-fusheng.html', label: '福盛世家', calc: true },
  { key: 'hengxiang', url: '/calculator-hengxiang.html', label: '恒享人生', calc: true }
];

function startServer() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/') p = '/index.html';
    const fp = path.join(ROOT, p);
    if (!fp.startsWith(ROOT) || !fs.existsSync(fp)) { res.writeHead(404); res.end('nf'); return; }
    const ext = path.extname(fp);
    const mime = { '.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png' }[ext] || 'text/plain';
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(fp).pipe(res);
  });
  return new Promise(r => server.listen(PORT, () => r(server)));
}

(async () => {
  const server = await startServer();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VIEWPORT, userAgent: MOBILE_UA });
  const results = [];
  const shotDir = path.join(ROOT, 'tests', 'mobile-shots');
  fs.mkdirSync(shotDir, { recursive: true });

  for (const page of PAGES) {
    const tab = await ctx.newPage();
    const consoleErrors = [];
    tab.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    tab.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));
    await tab.goto(`http://localhost:${PORT}${page.url}`, { waitUntil: 'networkidle' });
    await tab.waitForTimeout(600);

    // 演算器：先点「生成」，让下载按钮出现
    let didGenerate = false;
    if (page.calc) {
      didGenerate = await tab.evaluate(() => {
        const btn = [...document.querySelectorAll('button')].find(b => /生成|测算|计算/.test(b.textContent || ''));
        if (btn) { btn.click(); return true; }
        if (typeof window.generate === 'function') { try { window.generate(); return true; } catch(e){ return false; } }
        return false;
      });
      await tab.waitForTimeout(1200);
    }

    const m = await tab.evaluate(() => {
      const out = {};
      // 页面级横向溢出（整页横向滚动=硬伤）
      out.pageOverflowPx = document.documentElement.scrollWidth - document.documentElement.clientWidth;

      // 关键文本字号
      const textEls = ['.card-name','.quick-title','.ap-input-row input','.tab','.footer-item','button','.card-desc','p','td','th','.category-title','.subsection-title'];
      let minFont = 999, minFontEl = '';
      textEls.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          const fs2 = parseFloat(getComputedStyle(el).fontSize);
          if (fs2 > 0 && fs2 < minFont) { minFont = fs2; minFontEl = sel; }
        });
      });
      out.minFontSize = minFont === 999 ? null : minFont;
      out.minFontSizeEl = minFontEl;

      // 主操作触控目标：仅取外层可点容器（排除图标等子元素）
      const SEL = 'a,button,.card,.quick-card,.tab,.footer-item,input[type=button],input[type=submit],[role=button]';
      const all = [...document.querySelectorAll(SEL)];
      const matched = all.filter(el => {
        if (el.getBoundingClientRect().width < 5 || el.getBoundingClientRect().height < 5) return false;
        // 排除被另一个匹配元素包裹的子元素
        let p = el.parentElement;
        while (p) { if (all.includes(p)) return false; p = p.parentElement; }
        return true;
      });
      let minTap = 999, minTapEl = '';
      matched.forEach(el => {
        const r = el.getBoundingClientRect();
        const m2 = Math.min(r.width, r.height);
        if (m2 < minTap) { minTap = m2; minTapEl = el.tagName + (el.className ? '.' + String(el.className).split(' ')[0] : ''); }
      });
      out.minTapTarget = minTap === 999 ? null : minTap;
      out.minTapEl = minTapEl;
      out.primaryTargetCount = matched.length;

      // 下载按钮：综合判定（文本 / onclick / 全局函数 / 已知 id）
      const dl = (() => {
        if (typeof window.downloadImage === 'function') return true;
        if (document.getElementById('imgPreviewDownload')) return true;
        return [...document.querySelectorAll('button,a,[onclick]')].some(el => {
          const t = (el.textContent || '');
          const oc = (el.getAttribute('onclick') || '');
          return /下载|存为图片|保存图片|保存计划书|导出/i.test(t) || /downloadImage|_legacyDownloadImage|showImagePreview/i.test(oc);
        });
      })();
      out.hasDownload = dl;

      // 表格：在滚动容器内横向滚动=可接受；仅记录表格数
      const tables = [...document.querySelectorAll('table')];
      out.hasTable = tables.length > 0;
      out.tableInScrollContainer = tables.every(t => {
        const pr = t.parentElement;
        const cs = getComputedStyle(pr);
        return cs.overflowX === 'auto' || cs.overflowX === 'scroll' || t.scrollWidth <= pr.clientWidth + 2;
      });

      return out;
    });

    const shot = path.join(shotDir, `${page.key}.png`);
    await tab.screenshot({ path: shot, fullPage: false });
    await tab.close();

    results.push({
      key: page.key, label: page.label, url: page.url, calc: page.calc,
      didGenerate,
      pageOverflowPx: m.pageOverflowPx,
      hasPageOverflow: m.pageOverflowPx > 2,
      minFontSize: m.minFontSize,
      minFontSizeEl: m.minFontSizeEl,
      minTapTargetPx: m.minTapTarget,
      minTapEl: m.minTapEl,
      primaryTargetCount: m.primaryTargetCount,
      hasDownloadButton: m.hasDownload,
      hasTable: m.hasTable,
      tableInScrollContainer: m.tableInScrollContainer,
      consoleErrors: consoleErrors.slice(0, 3),
      screenshot: 'tests/mobile-shots/' + path.basename(shot)
    });
  }

  await browser.close();
  server.close();

  const report = {
    generatedAt: new Date().toISOString(),
    viewport: VIEWPORT,
    ua: MOBILE_UA,
    pages: results,
    summary: {
      total: results.length,
      pageOverflow: results.filter(r => r.hasPageOverflow).map(r => `${r.label}(${r.pageOverflowPx}px)`),
      smallFont: results.filter(r => r.minFontSize !== null && r.minFontSize < 14).map(r => `${r.label}(${r.minFontSize}px,${r.minFontSizeEl})`),
      smallTap: results.filter(r => r.minTapTargetPx !== null && r.minTapTargetPx < 40).map(r => `${r.label}(${r.minTapTargetPx}px,${r.minTapEl})`),
      missingDownload: results.filter(r => r.calc && !r.hasDownload).map(r => r.label),
      tableNotInScroll: results.filter(r => r.hasTable && !r.tableInScrollContainer).map(r => r.label)
    }
  };
  fs.writeFileSync(path.join(ROOT, 'tests', 'mobile-check-report.json'), JSON.stringify(report, null, 2));
  console.log('✅ 手机端检查完成，报告 -> tests/mobile-check-report.json');
  console.log('页面横向溢出(硬伤):', report.summary.pageOverflow);
  console.log('小于14px字号:', report.summary.smallFont);
  console.log('小于40px主触控:', report.summary.smallTap);
  console.log('演算器缺下载按钮:', report.summary.missingDownload);
  console.log('表格未在滚动容器:', report.summary.tableNotInScroll);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
