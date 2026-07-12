/* ============================================================
 * ai-planner.js — AI 计划书助手（规则引擎版）
 * 作用：在现有「在线测算」页读取已生成的利益演示数据，
 *       一键生成【客户方案 / 销售话术 / 客户版图片】。
 * 原则：
 *   - 不修改任何原有演算公式（generate / downloadImage 原样保留）
 *   - 不编造任何收益数字（所有数字来自页面真实演示数据）
 *   - 所有产品信息来自现有产品资料库（data.json / 页面标题）
 *   - 预留 OpenAI / 图片生成 API 接口，未来填 key 即可切换
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- 0. 预留配置（未来接入真 AI） ---------- */
  var AI_CONFIG = {
    USE_OPENAI_API: false,          // 改为 true 并填 key 即可换真大模型
    OPENAI_API_KEY: '',
    OPENAI_MODEL: 'gpt-4o-mini',
    IMAGE_API: false,               // 预留：将来接图片生成 API
    DISCLAIMER: '本方案基于页面利益演示数据自动生成，仅供内部保险从业人员展业参考，具体以保险合同条款为准。'
  };

  /* ---------- 1. 产品资料库（内容取自现有 data.json 产品清单） ---------- */
  var PRODUCT_DB = {
    'calculator-hongyu.html':   { code: 'S11', name: '宏御世家终身寿险（分红型）', type: '分红', form: '终身寿', short: '增额终身寿险' },
    'calculator-hongtai.html':  { code: 'S03', name: '宏泰世家终身寿险（分红型）', type: '分红', form: '终身寿', short: '终身寿险' },
    'calculator-hongyuan.html': { code: 'S02', name: '宏愿人生养老年金（分红型）', type: '分红', form: '年金', short: '养老年金' },
    'calculator-huacai.html':   { code: 'S24', name: '华彩鎏金年金保险（分红型）', type: '分红', form: '年金', short: '年金' },
    'calculator-hongkun.html':  { code: 'S06', name: '宏坤人生养老年金（分红型）', type: '分红', form: '年金', short: '养老年金' },
    'calculator-hengxiang.html':{ code: 'G23', name: '恒享人生年金保险', type: '分红', form: '年金', short: '年金' },
    'calculator-fusheng.html':  { code: 'G24', name: '福盛世家（添翼版）终身寿险', type: '非分红', form: '终身寿', short: '固收终身寿险' }
  };
  var TERM_LABEL = { 1: '一次交清', 3: '3年交', 5: '5年交', 10: '10年交' };
  var GOLD = '#C9A227', BLUE = '#1E3A5F', BLUE2 = '#2563EB', BLUE3 = '#1E40AF';

  /* ---------- 2. 工具 ---------- */
  function $(s, el) { return (el || document).querySelector(s); }
  function num(t) { if (t == null) return NaN; var s = ('' + t).replace(/[^\d.\-]/g, ''); var n = parseFloat(s); return isNaN(n) ? NaN : n; }
  function fmt(n) { if (isNaN(n)) return '-'; return Math.round(n).toLocaleString('zh-CN'); }
  function fmtWan(n) {
    if (isNaN(n)) return '-';
    if (n >= 1e8) return (n / 1e8).toFixed(2) + '亿';
    if (n >= 1e4) return (n / 1e4).toFixed(1) + '万';
    return Math.round(n).toLocaleString('zh-CN');
  }

  /* ---------- 3. 读取「当前页面已生成的数据」 ---------- */
  function collect() {
    var age = num($('#age').value);
    var term = num($('#term').value);
    var premium = num($('#premium').value);
    var gender = (typeof currentGender !== 'undefined' && currentGender != null) ? currentGender
      : (($('.gender-btn.active') && +$('.gender-btn.active').dataset.value) || 1);
    var genderLabel = gender === 0 ? '男' : '女';
    var titleH1 = ($('.title-bar h1') || {}).textContent || '';
    var file = (location.pathname.split('/').pop() || '');
    var pdb = PRODUCT_DB[file] || { code: '', name: titleH1.replace(' · 利益演示计算器', ''), type: '分红', form: '终身寿', short: '' };

    var table = $('#resultTable');
    var parsed = table ? parseTable(table) : { cols: 0, header: [], idx: {}, rows: [] };
    var figs = deriveFigures(parsed, premium, term);

    // 基本保额（合同定义值，非收益；读取现有数据，不编造）
    var sumAssured = null;
    try {
      var key = gender + '_' + age + '_' + term;
      var src = (typeof CALC_DATA_INLINE !== 'undefined') ? CALC_DATA_INLINE
        : (typeof CALC_DATA !== 'undefined') ? CALC_DATA : null;
      if (src && src[key]) sumAssured = Math.round(src[key].E * premium / 1000);
    } catch (e) { /* 取不到不影响主流程 */ }

    return {
      age: age, term: term, premium: premium, gender: gender, genderLabel: genderLabel,
      titleH1: titleH1, pdb: pdb, parsed: parsed, figs: figs, sumAssured: sumAssured
    };
  }

  /* 把带 rowspan/colspan 的表格拍平为 grid[r][c]=文本
   * 注意：r 必须按 <tr> 顺序自增，不能用 grid.length（rowspan 会撑出幽灵行导致行号错位） */
  function tableToGrid(table) {
    var grid = [], occ = [], maxCol = 0;
    var rows = table.rows;
    var r = 0;
    for (var ri = 0; ri < rows.length; ri++) {
      var tr = rows[ri];
      grid[r] = grid[r] || []; occ[r] = occ[r] || [];
      var c = 0;
      var cells = tr.children;
      for (var ci = 0; ci < cells.length; ci++) {
        var cell = cells[ci];
        while (occ[r][c]) c++;
        var cs = cell.colSpan || 1, rs = cell.rowSpan || 1;
        var txt = (cell.innerText || '').replace(/\s+/g, ' ').trim();
        for (var i = 0; i < rs; i++) {
          var rr = r + i; grid[rr] = grid[rr] || []; occ[rr] = occ[rr] || [];
          for (var j = 0; j < cs; j++) { grid[rr][c + j] = txt; occ[rr][c + j] = true; }
        }
        c += cs; if (c > maxCol) maxCol = c;
      }
      r++;
    }
    return grid;
  }

  function parseTable(table) {
    var thead = table.querySelector('thead');
    var tbody = table.querySelector('tbody');
    var headGrid = thead ? tableToGrid(thead) : [[], []];
    var cols = Math.max((headGrid[0] || []).length, (headGrid[1] || []).length);
    var header = [];
    for (var j = 0; j < cols; j++) {
      var a = (headGrid[0] && headGrid[0][j]) || '';
      var b = (headGrid[1] && headGrid[1][j]) || '';
      header[j] = (a + ' ' + b).replace(/\s+/g, ' ').trim();
    }
    var idx = {};
    header.forEach(function (h, k) {
      if (/现金价值/.test(h)) idx.cash = k;
      else if (/累计保费/.test(h)) idx.cum = k;
      else if (/保单年度/.test(h)) idx.year = k;
      else if (/年龄/.test(h) && idx.age == null) idx.age = k;
      else if (/红利/.test(h)) idx.bonus = k;
      else if (/(身故|全残|保障)/.test(h) && idx.death == null) idx.death = k;
    });
    var rows = [];
    if (tbody) {
      var bodyGrid = tableToGrid(tbody);
      bodyGrid.forEach(function (r) {
        var row = {};
        if (idx.year != null) row.year = num(r[idx.year]);
        if (idx.age != null) row.age = num(r[idx.age]);
        if (idx.cum != null) row.cum = num(r[idx.cum]);
        if (idx.cash != null) row.cash = num(r[idx.cash]);
        if (idx.bonus != null) row.bonus = num(r[idx.bonus]);
        if (idx.death != null) row.death = num(r[idx.death]);
        if (!isNaN(row.year) || (idx.cash != null && !isNaN(row.cash))) rows.push(row);
      });
    }
    return { cols: cols, header: header, idx: idx, rows: rows };
  }

  function deriveFigures(parsed, premium, term) {
    var rows = parsed.rows || [];
    var totalPremium = premium * (term === 1 ? 1 : term);
    var f = { totalPremium: totalPremium, hasData: rows.length > 0 };
    if (rows.length) {
      f.firstCash = rows[0].cash;
      var r5 = rows.filter(function (r) { return r.year === 5; })[0];
      f.cashY5 = r5 ? r5.cash : undefined;
      var payYr = (term === 1 ? 1 : term);
      var be = rows.filter(function (r) { return !isNaN(r.cash) && r.cash >= totalPremium && r.year >= payYr; })[0];
      f.breakEvenYear = be ? be.year : undefined;
      f.breakEvenCash = be ? be.cash : undefined;
      var r20 = rows.filter(function (r) { return r.year === 20; })[0] || rows[Math.min(19, rows.length - 1)];
      f.cashY20 = r20 ? r20.cash : undefined;
      var last = rows[rows.length - 1];
      f.lastYear = last.year; f.lastCash = last.cash;
      f.maxCash = rows.reduce(function (m, r) { return (!isNaN(r.cash) && r.cash > m) ? r.cash : m; }, 0);
    }
    return f;
  }

  /* ---------- 4. 文案生成（规则引擎，数字全部来自真实演示） ---------- */
  function positionText(p, d, f) {
    var t = p.type === '非分红' ? '固定收益保证利益（非分红）型' : '分红型';
    if (p.form === '年金') {
      return p.name + '是新华保险' + t + '养老年金保险，提供与生命等长的稳定现金流，有效抵御长寿风险；'
        + (p.type === '非分红' ? '所有领取金额写入合同、确定给付' : '在固定领取基础上分享公司分红，领取随公司盈余增长')
        + '。适合做养老品质补充与跨周期现金流规划。';
    }
    return p.name + '是新华保险' + t + '终身寿险，现金价值写入合同、终身确定增值，兼顾高额身价保障与资产稳健增值；'
      + (p.type === '非分红' ? '收益不受资本市场波动影响，安全确定' : '在锁定确定保额增长的同时分享保险公司经营红利')
      + '。适合做家庭保障基石、子女传承与灵活用款规划。';
  }

  function sellingPoints(p, d, f) {
    var pts = [];
    var s1 = '现金价值写入合同、确定增值：第5个保单年度现价约 ' + fmt(f.cashY5) + ' 元';
    if (f.breakEvenYear) s1 += '，第 ' + f.breakEvenYear + ' 年现金价值首次超过累计保费（回本），达 ' + fmt(f.breakEvenCash) + ' 元';
    s1 += '；终身持有至第 ' + f.lastYear + ' 年现价约 ' + fmt(f.lastCash) + ' 元。';
    pts.push(s1);
    if (p.type === '非分红') pts.push('收益100%确定、写入合同，不受利率下行与市场波动影响，所见即所得。');
    else pts.push('固定利益+年度分红双轮驱动：保底部分写进合同确定给付，分红来源于死差/费差/利差，历史红利实现率可在新华官网公开查询。');
    if (p.form === '年金') pts.push('固定领取对抗长寿风险，与生命等长的现金流，养老品质不打折扣。');
    else pts.push('保障+灵活兼得：可减保领取、保单贷款最高可达现金价值80%，急需用钱不被动。');
    return pts;
  }

  function wealthText(d, f) {
    if (!f.hasData) return '（请先点击页面「生成利益演示」生成数据后再生成方案）';
    var s = '客户年缴 ' + fmt(d.premium) + ' 元、' + (TERM_LABEL[d.term] || d.term + '年交') + '，合计投入 ' + fmt(f.totalPremium) + ' 元。';
    s += '保单前5年为储备期，第5年现金价值约 ' + fmt(f.cashY5) + ' 元；';
    if (f.breakEvenYear) s += '第 ' + f.breakEvenYear + ' 年现金价值首次超过累计保费，实现回本（约 ' + fmt(f.breakEvenCash) + ' 元）；';
    if (f.cashY20) s += '第20年现金价值约 ' + fmt(f.cashY20) + ' 元；';
    s += '终身持有至第 ' + f.lastYear + ' 年，现金价值约 ' + fmt(f.lastCash) + ' 元。';
    s += '整体呈现「前期稳健储备、中期回本增值、长期复利放大」的财富路径，可作子女教育/婚嫁储备、养老补充或财富定向传承。';
    return s;
  }

  function wechatText(d, p, f) {
    var be = f.breakEvenYear ? ('第 ' + f.breakEvenYear + ' 年回本') : '中期回本';
    return d.genderLabel + '士好，按您 ' + d.age + ' 岁、年缴 ' + fmt(d.premium) + ' 元、' + (TERM_LABEL[d.term] || d.term + '年交')
      + ' 的需求，我为您定制了《' + p.name + '》专属方案：锁定确定增值，' + be + '，终身现价可达约 ' + fmt(f.lastCash)
      + ' 元，还能灵活减保、保单贷款用款。完整计划书已备好，方便时发您📄';
  }

  function scriptObj(d, p, f) {
    var open;
    if (d.age < 40) open = d.genderLabel + '士，看您这么早就开始做家庭和资产的长期规划，很有远见。今天想跟您汇报一个既能锁定确定收益、又能灵活用款的工具——新华《' + p.name + '》。';
    else if (d.age < 55) open = d.genderLabel + '士，您现在正是家庭责任最重、也最适合做资产压舱石的阶段。跟您汇报一个进可攻退可守的工具——新华《' + p.name + '》，它把确定增值和灵活用款都做到了。';
    else open = d.genderLabel + '士，到了这个阶段，资产的安全确定和定向传承最重要。新华《' + p.name + '》正好解决这个问题：收益写进合同、终身增值，还能精准传给想传的人。';
    var intro = positionText(p, d, f) + ' 以您的情况为例：' + wealthText(d, f);
    var obj = [
      ['收益是不是不确定/有风险？', p.type === '非分红'
        ? '这款是固定收益保证利益型，所有利益100%写入合同、确定给付，不受资本市场波动影响，确定性是合同给的。'
        : '它有保底部分写进合同、确定给付，分红是额外红利来源，且新华历史红利实现率可在官网公开查询，下有保底、上有可期。'],
      ['钱锁死了、不灵活？', '完全可以灵活用款：支持减保领取，急需用钱时还能保单贷款，最高可贷现金价值的80%，不影响保障继续有效。'],
      ['和银行理财比哪个好？', '性质不同：理财是收益浮动、到期再投；这是保险合同约定利益，多一层身故保障与定向传承功能，是家庭资产的「安全垫+压舱石」，建议组合配置而非二选一。'],
      ['周期这么长，划算吗？', '正是时间换确定增值。越早规划，复利放大越可观；而且前几年是储备期、之后一路写进合同增长，持有越久越划算。']
    ];
    return { open: open, intro: intro, obj: obj };
  }

  /* ---------- 5. 渲染为 HTML / 纯文本 ---------- */
  function secHTML(t, b) { return '<div class="ai-sec"><div class="ai-sec-h">' + t + '</div><div class="ai-sec-b">' + b + '</div></div>'; }
  function secText(t, b) { return '【' + t + '】\n' + b + '\n'; }
  function ulHTML(arr) { return '<ul class="ai-ul">' + arr.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'; }
  function ulText(arr) { return arr.map(function (x) { return '• ' + x; }).join('\n'); }

  function renderProposal(d) {
    var p = d.pdb, f = d.figs;
    var html = '', text = '';
    // 客户画像
    var ageGroup = d.age < 35 ? '青年阶段（初建家庭/事业起步）' : d.age < 50 ? '家庭责任与事业黄金期' : d.age < 60 ? '事业高峰与临近退休规划期' : '养老与财富传承规划期';
    var tier = d.premium < 500000 ? '稳健规划型' : d.premium <= 3000000 ? '品质规划型' : '高净值尊享型';
    var termTxt = TERM_LABEL[d.term] || (d.term + '年交');
    var role = d.gender === 0
      ? (d.age < 50 ? '家庭主要经济支柱' : '家庭资产守护与传承者')
      : (d.age < 50 ? '家庭财务规划核心' : '家庭保障与财富管理者');
    var profileB = '• 客户标签：' + d.age + '岁' + d.genderLabel + '士 / ' + ageGroup + '\n• 投入规模：年缴' + fmt(d.premium) + '元（' + tier + '）\n• 缴费方式：' + termTxt + '\n• 家庭角色：' + role;
    var profileH = '年龄 ' + d.age + '岁 · ' + d.genderLabel + '士 · 年缴' + fmt(d.premium) + '元 · ' + termTxt;
    html += secHTML('一、客户画像', '<p class="ai-p">' + profileH + '</p><pre class="ai-pre">' + profileB + '</pre>');
    text += secText('一、客户画像', profileH + '\n' + profileB);
    // 产品定位
    html += secHTML('二、产品定位', '<p class="ai-p">' + positionText(p, d, f) + (d.sumAssured ? ' 基本保额约 ' + fmt(d.sumAssured) + ' 元。' : '') + '</p>');
    text += secText('二、产品定位', positionText(p, d, f) + (d.sumAssured ? ' 基本保额约 ' + fmt(d.sumAssured) + ' 元。' : ''));
    // 三核心卖点
    var sp = sellingPoints(p, d, f);
    html += secHTML('三、三个核心卖点', ulHTML(sp));
    text += secText('三、三个核心卖点', ulText(sp));
    // 财富规划说明
    html += secHTML('四、财富规划说明', '<p class="ai-p">' + wealthText(d, f) + '</p>');
    text += secText('四、财富规划说明', wealthText(d, f));
    // 微信话术
    html += secHTML('五、微信发送话术', '<div class="ai-quote">' + wechatText(d, p, f) + '</div>');
    text += secText('五、微信发送话术', wechatText(d, p, f));
    html += '<p class="ai-disc">' + AI_CONFIG.DISCLAIMER + '</p>';
    text += '\n' + AI_CONFIG.DISCLAIMER;
    return { html: html, text: text };
  }

  function renderScript(d) {
    var p = d.pdb, f = d.figs, s = scriptObj(d, p, f);
    var html = '', text = '';
    html += secHTML('开场白', '<div class="ai-quote">' + s.open + '</div>');
    text += secText('开场白', s.open);
    html += secHTML('产品介绍', '<p class="ai-p">' + s.intro + '</p>');
    text += secText('产品介绍', s.intro);
    var objH = s.obj.map(function (o) { return '<div class="ai-qa"><div class="ai-q">客户：' + o[0] + '</div><div class="ai-a">经理：' + o[1] + '</div></div>'; }).join('');
    var objT = s.obj.map(function (o) { return '客户：' + o[0] + '\n经理：' + o[1]; }).join('\n\n');
    html += secHTML('异议处理', objH);
    text += secText('异议处理', objT);
    html += '<p class="ai-disc">' + AI_CONFIG.DISCLAIMER + '</p>';
    text += '\n' + AI_CONFIG.DISCLAIMER;
    return { html: html, text: text };
  }

  /* ---------- 6. 客户版图片（9:16 蓝金风，canvas 生成） ---------- */
  function drawClientImage(d) {
    var p = d.pdb, f = d.figs;
    var W = 1080, H = 1920, M = 64, dpr = 2;
    var canvas = document.createElement('canvas');
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    // 背景
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);
    // 顶部蓝色渐变带
    var g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, BLUE2); g.addColorStop(0.5, BLUE3); g.addColorStop(1, BLUE);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 330);
    // 金色装饰线
    ctx.fillStyle = GOLD; ctx.fillRect(M, 300, W - 2 * M, 5);
    // 标题
    ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 46px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(d.genderLabel + '士专属保险规划方案', W / 2, 130);
    ctx.font = '24px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(p.name + ' · ' + (TERM_LABEL[d.term] || d.term + '年交'), W / 2, 195);
    ctx.font = '20px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = GOLD;
    ctx.fillText('新华保险 · 智能规划助手', W / 2, 255);

    // 信息四宫格
    var infoY = 380, cardH = 150, gap = 24;
    var cw = (W - 2 * M - gap) / 2;
    var infos = [
      ['被保人年龄', d.age + ' 周岁'],
      ['性别', d.genderLabel + '士'],
      ['规划金额', fmtWan(f.totalPremium)],
      ['保障目标', p.form === '年金' ? '养老现金流' : '终身增值+传承']
    ];
    infos.forEach(function (it, i) {
      var x = M + (i % 2) * (cw + gap);
      var y = infoY + Math.floor(i / 2) * (cardH + gap);
      roundRect(ctx, x, y, cw, cardH, 14); ctx.fillStyle = '#EFF6FF'; ctx.fill();
      ctx.strokeStyle = 'rgba(30,58,95,0.15)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#64748B'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.font = '22px "PingFang SC",sans-serif';
      ctx.fillText(it[0], x + 26, y + 46);
      ctx.fillStyle = BLUE; ctx.font = 'bold 40px "PingFang SC",sans-serif';
      ctx.fillText(it[1], x + 26, y + 100);
    });

    // 财富增长路径
    var chartTitleY = infoY + 2 * (cardH + gap) + 30;
    ctx.fillStyle = BLUE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 30px "PingFang SC",sans-serif';
    ctx.fillText('财富增长路径', W / 2, chartTitleY);
    var cx = M, cy = chartTitleY + 30, cw2 = W - 2 * M, ch = 560;
    // 坐标轴
    ctx.strokeStyle = '#CBD5E1'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + ch); ctx.lineTo(cx + cw2, cy + ch); ctx.stroke();
    if (f.hasData && f.rows && f.rows.length > 1) {
      var rows = f.rows;
      var minY = rows[0].year, maxY = f.lastYear;
      var maxC = f.maxCash || 1;
      function px(year) { return cx + (year - minY) / Math.max(1, (maxY - minY)) * cw2; }
      function py(cash) { return cy + ch - (cash / maxC) * (ch - 40); }
      // 网格
      ctx.strokeStyle = '#EEF2F7'; ctx.lineWidth = 1;
      for (var gi = 1; gi <= 4; gi++) {
        var gy = cy + ch - gi * (ch - 40) / 4;
        ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(cx + cw2, gy); ctx.stroke();
        ctx.fillStyle = '#94A3B8'; ctx.font = '16px "PingFang SC",sans-serif'; ctx.textAlign = 'right';
        ctx.fillText(fmtWan(maxC * gi / 4), cx - 8, gy);
      }
      // 面积
      ctx.beginPath(); ctx.moveTo(px(rows[0].year), cy + ch);
      rows.forEach(function (r) { ctx.lineTo(px(r.year), py(r.cash)); });
      ctx.lineTo(px(maxY), cy + ch); ctx.closePath();
      var ag = ctx.createLinearGradient(0, cy, 0, cy + ch);
      ag.addColorStop(0, 'rgba(37,99,235,0.28)'); ag.addColorStop(1, 'rgba(37,99,235,0.02)');
      ctx.fillStyle = ag; ctx.fill();
      // 折线（金色）
      ctx.beginPath();
      rows.forEach(function (r, i) { if (i === 0) ctx.moveTo(px(r.year), py(r.cash)); else ctx.lineTo(px(r.year), py(r.cash)); });
      ctx.strokeStyle = GOLD; ctx.lineWidth = 4; ctx.stroke();
      // 关键点：回本 + 末年度
      function mark(year, cash, label) {
        var x = px(year), y = py(cash);
        ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fillStyle = BLUE2; ctx.fill();
        ctx.strokeStyle = '#FFF'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = BLUE; ctx.font = 'bold 20px "PingFang SC",sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(label, x, y - 22);
        ctx.fillStyle = '#1E293B'; ctx.font = '17px "PingFang SC",sans-serif';
        ctx.fillText(fmtWan(cash), x, y + 26);
      }
      if (f.breakEvenYear) mark(f.breakEvenYear, f.breakEvenCash, '第' + f.breakEvenYear + '年回本');
      mark(maxY, f.lastCash, '第' + maxY + '年');
    } else {
      ctx.fillStyle = '#94A3B8'; ctx.font = '20px "PingFang SC",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('（请先生成利益演示数据）', cx + cw2 / 2, cy + ch / 2);
    }

    // 底部蓝色带
    var by = H - 150;
    var g2 = ctx.createLinearGradient(0, by, W, by);
    g2.addColorStop(0, BLUE); g2.addColorStop(1, BLUE3);
    ctx.fillStyle = g2; ctx.fillRect(0, by, W, 150);
    ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 28px "PingFang SC",sans-serif';
    ctx.fillText('新华保险 · 智能规划助手', W / 2, by + 55);
    ctx.font = '16px "PingFang SC",sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('利益演示仅供参考，具体以保险合同条款为准', W / 2, by + 100);
    return canvas;
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  /* ---------- 7. 注入 UI ---------- */
  function injectUI() {
    // 样式
    var style = document.createElement('style');
    style.textContent = [
      '.ai-card{margin-top:14px;}',
      '.ai-card-title{font-size:18px;font-weight:700;color:#1E3A5F;margin-bottom:4px;}',
      '.ai-tip{font-size:13px;color:#64748B;margin-bottom:12px;line-height:1.6;}',
      '.ai-btns{display:flex;flex-wrap:wrap;gap:12px;}',
      '.ai-btn{padding:12px 20px;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;background:#2563EB;color:#fff;}',
      '.ai-btn:hover{background:#1D4ED8;}',
      '.ai-btn-gold{background:linear-gradient(135deg,#C9A227,#E0B73A);color:#1E293B;}',
      '.ai-btn-gold:hover{filter:brightness(1.05);}',
      '.ai-overlay{display:none;position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:200;align-items:flex-start;justify-content:center;padding:24px 12px;overflow:auto;}',
      '.ai-overlay.show{display:flex;}',
      '.ai-modal{background:#fff;border-radius:16px;max-width:680px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden;}',
      '.ai-modal-head{display:flex;justify-content:space-between;align-items:center;padding:16px 22px;background:linear-gradient(135deg,#1E3A5F,#2563EB);color:#fff;}',
      '.ai-modal-head span{font-size:18px;font-weight:700;}',
      '.ai-close{background:rgba(255,255,255,.2);border:none;color:#fff;width:32px;height:32px;border-radius:50%;font-size:18px;cursor:pointer;}',
      '.ai-modal-body{padding:18px 22px;max-height:64vh;overflow:auto;}',
      '.ai-modal-foot{padding:14px 22px;border-top:1px solid #E2E8F0;display:flex;gap:12px;justify-content:flex-end;}',
      '.ai-foot-btn{padding:10px 20px;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;}',
      '.ai-foot-copy{background:#E2E8F0;color:#1E293B;}',
      '.ai-foot-dl{background:#059669;color:#fff;}',
      '.ai-sec{margin-bottom:18px;}',
      '.ai-sec-h{font-size:16px;font-weight:700;color:#1E40AF;border-left:4px solid #C9A227;padding-left:10px;margin-bottom:8px;}',
      '.ai-p{font-size:15px;line-height:1.8;color:#334155;margin:0;}',
      '.ai-pre{font-size:14px;line-height:1.7;color:#334155;white-space:pre-wrap;background:#F8FAFC;padding:12px 14px;border-radius:8px;margin:0;}',
      '.ai-ul{margin:0;padding-left:20px;}',
      '.ai-ul li{font-size:15px;line-height:1.8;color:#334155;margin-bottom:6px;}',
      '.ai-quote{font-size:15px;line-height:1.8;color:#334155;background:#F0F9FF;border-left:4px solid #2563EB;padding:12px 14px;border-radius:8px;}',
      '.ai-qa{margin-bottom:12px;}',
      '.ai-q{font-size:15px;font-weight:700;color:#B91C1C;}',
      '.ai-a{font-size:15px;line-height:1.8;color:#334155;}',
      '.ai-disc{font-size:12px;color:#94A3B8;line-height:1.6;margin-top:14px;border-top:1px dashed #E2E8F0;padding-top:10px;}',
      '.ai-canvas-wrap{text-align:center;}',
      '.ai-canvas-wrap canvas{max-width:100%;height:auto;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.12);}'
    ].join('');
    document.head.appendChild(style);

    // 卡片
    var tableCard = $('#resultTable') ? $('#resultTable').closest('.card') : null;
    var card = document.createElement('div');
    card.className = 'card ai-card';
    card.innerHTML =
      '<div class="ai-card-title">🤖 AI 计划书助手</div>' +
      '<p class="ai-tip">读取当前已生成的利益演示数据，一键生成展业素材。所有数字来自真实演示，不修改任何演算公式。</p>' +
      '<div class="ai-btns">' +
      '<button class="ai-btn" id="aiBtnProposal">① AI生成客户方案</button>' +
      '<button class="ai-btn" id="aiBtnScript">② AI生成销售话术</button>' +
      '<button class="ai-btn ai-btn-gold" id="aiBtnImage">③ AI生成客户版图片</button>' +
      '</div>';
    if (tableCard && tableCard.parentNode) tableCard.parentNode.insertBefore(card, tableCard.nextSibling);
    else document.querySelector('.wrap').appendChild(card);

    // 弹窗
    var overlay = document.createElement('div');
    overlay.className = 'ai-overlay'; overlay.id = 'aiOverlay';
    overlay.innerHTML =
      '<div class="ai-modal">' +
      '<div class="ai-modal-head"><span id="aiModalTitle">AI 生成结果</span><button class="ai-close" id="aiClose">✕</button></div>' +
      '<div class="ai-modal-body" id="aiModalBody"></div>' +
      '<div class="ai-modal-foot" id="aiModalFoot"></div>' +
      '</div>';
    document.body.appendChild(overlay);

    // 事件
    function openModal(title, bodyHTML, footHTML) {
      $('#aiModalTitle').textContent = title;
      $('#aiModalBody').innerHTML = bodyHTML;
      $('#aiModalFoot').innerHTML = footHTML;
      overlay.classList.add('show');
    }
    function closeModal() { overlay.classList.remove('show'); }
    $('#aiClose').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });

    function ensureData() {
      var d = collect();
      if (!d.figs.hasData) { alert('请先点击页面「生成利益演示」按钮，生成表格数据后再使用 AI 助手。'); return null; }
      return d;
    }
    function copyBtn(text) {
      var b = document.createElement('button'); b.className = 'ai-foot-btn ai-foot-copy'; b.textContent = '复制文本';
      b.addEventListener('click', function () {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { b.textContent = '已复制✓'; }, function () { fallbackCopy(text); });
        else fallbackCopy(text);
        setTimeout(function () { b.textContent = '复制文本'; }, 1500);
      });
      return b;
    }
    function fallbackCopy(text) {
      var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) { } ta.remove();
    }

    $('#aiBtnProposal').addEventListener('click', function () {
      var d = ensureData(); if (!d) return;
      var r = renderProposal(d);
      openModal('① 客户方案', r.html, '');
      var foot = $('#aiModalFoot'); foot.innerHTML = '';
      var cb = copyBtn(r.text); foot.appendChild(cb);
    });
    $('#aiBtnScript').addEventListener('click', function () {
      var d = ensureData(); if (!d) return;
      var r = renderScript(d);
      openModal('② 销售话术', r.html, '');
      var foot = $('#aiModalFoot'); foot.innerHTML = '';
      var cb = copyBtn(r.text); foot.appendChild(cb);
    });
    $('#aiBtnImage').addEventListener('click', function () {
      var d = ensureData(); if (!d) return;
      var canvas = drawClientImage(d);
      var body = $('#aiModalBody'); body.innerHTML = '';
      var wrap = document.createElement('div'); wrap.className = 'ai-canvas-wrap';
      wrap.appendChild(canvas); body.appendChild(wrap);
      var foot = $('#aiModalFoot'); foot.innerHTML = '';
      var dl = document.createElement('button'); dl.className = 'ai-foot-btn ai-foot-dl'; dl.textContent = '下载图片';
      dl.addEventListener('click', function () {
        var a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = (d.genderLabel + '士专属保险规划方案_' + d.pdb.name + '.png');
        document.body.appendChild(a); a.click(); a.remove();
      });
      foot.appendChild(dl);
      $('#aiModalTitle').textContent = '③ 客户版图片';
      $('#aiOverlay').classList.add('show');
    });
  }

  /* ---------- 8. 启动 ---------- */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectUI);
  else injectUI();

})();
