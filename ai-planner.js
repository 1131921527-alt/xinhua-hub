/* ===== 智能计划书快捷生成 + 测算器URL参数 + 微信文案 + 浏览器打开提示 ===== */
(function(){
  'use strict';

  // ─── 产品映射表 ───
  // params: 该测算器需要从输入中识别的参数
  //   term      交费期限（趸交/N年交）→ 对应 id=term 的 select
  //   period    保险期间（N年/保N年） → 对应 id=period 的 select
  //   payMode   交费方式（N年交）      → 对应 id=payMode 的 select
  //   annuityAge 年金起领年龄（N岁起领）→ 对应 id=annuityAge 的 select
  var PRODUCTS = [
    { names: ['宏安','宏安世家','s10'], file: 'calculator-hongan.html', label: '宏安世家', category: '分红型终身寿险', params: ['term'] },
    { names: ['宏御','宏御世家','s11'], file: 'calculator-hongyu.html', label: '宏御世家', category: '分红型终身寿险', params: ['term'] },
    { names: ['宏泰','宏泰世家','s03'], file: 'calculator-hongtai.html', label: '宏泰世家', category: '分红型终身寿险', params: ['term'] },
    { names: ['宏愿','宏愿人生','s02'], file: 'calculator-hongyuan.html', label: '宏愿人生', category: '分红型养老年金', params: ['term','annuityAge','annuityMode'] },
    { names: ['宏禧来','s12','hongxilai'], file: 'calculator-hongxilai.html', label: '宏禧来', category: '分红型两全', params: ['period'] },
    { names: ['盈满鑫','yingmanxin'], file: 'calculator-yingmanxin.html', label: '盈满鑫', category: '分红型两全', params: ['payMode','period'] },
    { names: ['华彩','华彩鎏金','s24'], file: 'calculator-huacai.html', label: '华彩鎏金', category: '分红型年金', params: ['term'] },
    { names: ['宏坤','宏坤人生','s06'], file: 'calculator-hongkun.html', label: '宏坤人生', category: '分红型养老年金', params: ['term'] },
    { names: ['恒享','恒享人生','g23'], file: 'calculator-hengxiang.html', label: '恒享人生', category: '非分红型年金', params: ['term'] },
    { names: ['福盛','福盛世家','添翼版','g14'], file: 'calculator-fusheng.html', label: '福盛世家', category: '非分红型终身寿险', params: ['term'] }
  ];

  // ─── 页面检测 ───
  var pagePath = window.location.pathname.toLowerCase();
  var isIndex = (pagePath === '/' || pagePath === '/index.html' || pagePath.endsWith('/index.html') || pagePath === '/xinhua-hub/' || pagePath.endsWith('/xinhua-hub/'));
  var isCalculator = /\bcalculator-/.test(pagePath);

  // ══════════════════════════════════════════
  // PART 1: 智能计划书快捷生成 (仅首页)
  // ══════════════════════════════════════════
  if (isIndex) {
    setupPlanner();
  }

  // ══════════════════════════════════════════
  // PART 2: 测算器URL参数读取 + 微信按钮
  // ══════════════════════════════════════════
  if (isCalculator) {
    setupCalculatorParams();
    injectWeChatButton();
    setupBrowserPrompt();  // 浏览器打开提示
  }

  // ========== Part 1: 智能计划书快捷生成 ==========
  function setupPlanner() {
    var inputEl, examplesEl, btnEl, modalEl;

    // DOM ready后绑定
    function init() {
      inputEl = document.getElementById('aiPlannerInput');
      examplesEl = document.getElementById('aiPlannerExamples');
      btnEl = document.getElementById('aiPlannerBtn');
      modalEl = document.getElementById('aiPlannerModal');
      if (!inputEl || !btnEl) return;

      btnEl.addEventListener('click', handleGenerate);
      inputEl.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') handleGenerate();
      });

      // 示例点击
      if (examplesEl) {
        examplesEl.querySelectorAll('.ap-example').forEach(function(el) {
          el.addEventListener('click', function() {
            inputEl.value = el.textContent.trim();
            handleGenerate();
          });
        });
      }

      // 弹窗按钮
      document.getElementById('apConfirmBtn').addEventListener('click', function(){ confirmAndGo(true); });
      document.getElementById('apBackBtn').addEventListener('click', function(){ confirmAndGo(false); });
      // 点击遮罩关闭
      modalEl.addEventListener('click', function(e) {
        if (e.target === modalEl) confirmAndGo(false);
      });
    }

    function handleGenerate() {
      var raw = (inputEl.value || '').trim();
      if (!raw) {
        shakeInput();
        return;
      }
      var result = parseInput(raw);
      if (!result.product) {
        showPlannerError('无法识别产品名称，请使用：宏安/宏御/宏泰/宏愿/华彩/宏坤/恒享/福盛');
        shakeInput();
        return;
      }
      if (!result.age) {
        showPlannerError('请提供客户年龄（如：30岁）');
        shakeInput();
        return;
      }
      if (!result.genderLabel) {
        showPlannerError('请提供客户性别（如：男/女）');
        shakeInput();
        return;
      }
      if (!result.premium) {
        showPlannerError('请提供年交保费（如：20万、100万、200000）');
        shakeInput();
        return;
      }

      // 按产品参数检查必填项
      var params = result.product.params || ['term'];
      var missing = params.filter(function(p) {
        if (p === 'term') return !result.termVal;
        return result[p] === null || result[p] === undefined;
      });
      if (missing.length > 0) {
        var hints = { term: '缴费期限（如：3年交、5年交、趸交）', period: '保险期间（如：8年期、保8年）', payMode: '交费方式（如：3年交、5年交）', annuityAge: '年金起领年龄（如：60岁起领）', annuityMode: '领取方式（如：月领、年领）' };
        showPlannerError('请提供' + (hints[missing[0]] || missing[0]));
        shakeInput();
        return;
      }

      // 显示确认弹窗
      showConfirmModal(result);
    }

    function shakeInput() {
      if (!inputEl) return;
      inputEl.style.borderColor = '#EF4444';
      inputEl.style.animation = 'none';
      inputEl.offsetHeight;
      inputEl.style.animation = 'ap-shake 0.4s';
      setTimeout(function(){ inputEl.style.borderColor = ''; inputEl.style.animation = ''; }, 500);
    }

    function showPlannerError(msg) {
      var errEl = document.getElementById('apError');
      if (errEl) {
        errEl.textContent = msg;
        errEl.style.display = 'block';
        setTimeout(function(){ errEl.style.display = 'none'; }, 4000);
      }
    }

    function showConfirmModal(result) {
      if (!modalEl) return;
      document.getElementById('apProdName').textContent = result.product.label;
      document.getElementById('apAge').textContent = result.age + '岁';
      document.getElementById('apGender').textContent = result.genderLabel;
      document.getElementById('apPremium').textContent = result.premiumDisplay;

      // 根据产品参数拼装展示文本
      var displayParts = [];
      var params = result.product.params || ['term'];
      if (params.indexOf('term') !== -1 && result.termDisplay) displayParts.push(result.termDisplay);
      if (params.indexOf('payMode') !== -1 && result.payMode) displayParts.push(result.payMode + '年交');
      if (params.indexOf('period') !== -1 && result.period) displayParts.push(result.period + '年期');
      if (params.indexOf('annuityAge') !== -1 && result.annuityAge) displayParts.push(result.annuityAge + '岁起领');
      if (params.indexOf('annuityMode') !== -1 && result.annuityMode) displayParts.push(result.annuityMode === 'month' ? '月领' : '年领');
      document.getElementById('apTerm').textContent = displayParts.join(' / ') || '-';

      modalEl.style.display = 'flex';
      // 存储结果供确认使用
      modalEl._result = result;
    }

    function confirmAndGo(confirmed) {
      if (!modalEl) return;
      modalEl.style.display = 'none';
      if (!confirmed || !modalEl._result) return;

      var r = modalEl._result;
      var params = r.product.params || ['term'];
      var url = r.product.file + '?age=' + r.age + '&gender=' + r.gender + '&premium=' + r.premium;
      params.forEach(function(p) {
        var val = r[p];
        if (p === 'term') val = r.termVal; // 兼容旧字段名
        if (val !== null && val !== undefined) {
          url += '&' + p + '=' + val;
        }
      });
      url += '&auto=1';
      window.location.href = url;
    }

    setTimeout(init, 200);
  }

  // ─── 输入解析引擎 ───
  function parseInput(raw) {
    var s = raw.replace(/\s+/g, ' ').trim();
    var result = {
      product: null, age: null, gender: null, genderLabel: null,
      premium: null, premiumDisplay: null, term: null, termVal: null, termDisplay: null,
      period: null, payMode: null, annuityAge: null
    };

    // 1. 识别产品
    var sLower = s.toLowerCase();
    // 按匹配长度降序，优先匹配长名称
    var sortedProds = PRODUCTS.slice().sort(function(a, b) { return b.names[0].length - a.names[0].length; });
    for (var i = 0; i < sortedProds.length; i++) {
      var p = sortedProds[i];
      for (var j = 0; j < p.names.length; j++) {
        var idx = sLower.indexOf(p.names[j]);
        if (idx !== -1) {
          result.product = p;
          // 移除产品名以便后续解析
          s = s.substring(0, idx) + ' ' + s.substring(idx + p.names[j].length);
          break;
        }
      }
      if (result.product) break;
    }

    // 2. 识别性别
    if (/女[ 性士人]?/.test(s)) {
      result.gender = 1; result.genderLabel = '女';
      s = s.replace(/女[ 性士人]?/, ' ');
    } else if (/先[ 生]|男[ 性人士]?/.test(s)) {
      result.gender = 0; result.genderLabel = '男';
      s = s.replace(/(先[ 生]|男[ 性人士]?)/, ' ');
    }

    // 3. 识别年龄 - 去掉金额干扰后再找
    // 先找个位数年份（XX岁格式）
    var ageMatch = s.match(/(\d{1,3})\s*岁/);
    if (ageMatch) {
      var a = parseInt(ageMatch[1]);
      if (a >= 0 && a <= 75) {
        result.age = a;
        s = s.replace(ageMatch[0], ' ');
      }
    }
    // 如果没找到"岁"关键字，但有独立的较小的数字（年龄在前）
    if (!result.age) {
      var ageMatch2 = s.match(/(?:^|\s)年龄?\s*(\d{1,2})(?:\s|$)/);
      if (ageMatch2) {
        var a2 = parseInt(ageMatch2[1]);
        if (a2 >= 18 && a2 <= 75) {
          result.age = a2;
          s = s.replace(ageMatch2[0], ' ');
        }
      }
    }

    // 4. 识别缴费方式。先处理"NN×MM"、"NNxMM"、"NN*MM"格式
    var termPatterns = [
      /(\d+\.?\d*)\s*[×xX\*]\s*(\d+)/,
      /(\d+\.?\d*)\s*万?\s*[×xX\*]\s*(\d+)/,
    ];
    var termMatch = null;
    for (var ti = 0; ti < termPatterns.length; ti++) {
      termMatch = s.match(termPatterns[ti]);
      if (termMatch) break;
    }
    if (termMatch) {
      var premiumVal = parseFloat(termMatch[1]);
      var termVal = parseInt(termMatch[2]);
      // 判断是否是"金额×期数"模式
      if (premiumVal < 100 || s.indexOf('万') !== -1) {
        // 金额×期数 模式：如 "20×3" = 年交20万×3年
        var premiumNum = premiumVal;
        if (/万/.test(termMatch[0]) || premiumVal < 100) {
          premiumNum = premiumVal * 10000;
        }
        result.premium = premiumNum;
        result.premiumDisplay = fmtMoney(premiumNum);
        if (termVal >= 1 && termVal <= 30) {
          result.term = termVal + '年交';
          result.termVal = termVal;
          result.termDisplay = termVal + '年交';
        }
      }
      s = s.replace(termMatch[0], ' ');
    }

    // 5. 识别缴费方式（文字格式：趸交、N年交等）
    if (!result.termVal) {
      if (/趸[交缴]|一次[性]?[交缴]清|1\s*年\s*[交缴]/.test(s)) {
        result.term = '趸交'; result.termVal = 1; result.termDisplay = '趸交';
      } else {
        var tMatch = s.match(/(\d+)\s*年\s*[交缴]/);
        if (tMatch) {
          var tv = parseInt(tMatch[1]);
          result.term = tv + '年交'; result.termVal = tv; result.termDisplay = tv + '年交';
        }
      }
    }

    // 6. 识别金额（如果还没从term中识别到）
    if (!result.premium) {
      // "100万" 格式
      var wanMatch = s.match(/(\d+\.?\d*)\s*万/);
      if (wanMatch) {
        result.premium = Math.round(parseFloat(wanMatch[1]) * 10000);
        result.premiumDisplay = fmtMoney(result.premium);
      } else {
        // 纯数字格式（>=5000以上才当金额，避免把年龄当金额）
        var numMatch = s.match(/\b(\d+)\b/);
        if (numMatch) {
          var numVal = parseInt(numMatch[1]);
          if (numVal >= 5000) {
            result.premium = numVal;
            result.premiumDisplay = fmtMoney(numVal);
          } else if (numVal >= 1000 && !result.age) {
            // 如果还没识别年龄且数字在1000以下，可能是年龄
            if (numVal <= 75) {
              result.age = numVal;
            }
          }
        }
      }
    }

    return parseExtraParams(result, s);
  }

  function parseExtraParams(result, s) {
    if (!result.product) return result;
    var params = result.product.params || ['term'];

    // period: 保险期间，如 8年、8年期、保8年（避免与"N年交"冲突）
    if (params.indexOf('period') !== -1 && result.period === null) {
      var periodMatch = s.match(/(?:保|保险期间)?\s*(\d+)\s*年[期]?/);
      if (periodMatch) {
        var pv = parseInt(periodMatch[1]);
        if (pv >= 1 && pv <= 50) result.period = pv;
      }
    }

    // payMode: 交费方式（N年交），若未识别到则尝试
    if (params.indexOf('payMode') !== -1 && result.payMode === null) {
      if (result.termVal) {
        result.payMode = result.termVal;
      } else {
        var pmMatch = s.match(/(\d+)\s*年\s*[交缴]/);
        if (pmMatch) result.payMode = parseInt(pmMatch[1]);
      }
    }

    // annuityAge: 年金起领年龄
    if (params.indexOf('annuityAge') !== -1 && result.annuityAge === null) {
      var annuityMatch = s.match(/(?:起领|开始领|领取)?\s*(\d+)\s*岁\s*(?:起领|开始领|领取)?/);
      if (annuityMatch) {
        var av = parseInt(annuityMatch[1]);
        if (av >= 50 && av <= 75) result.annuityAge = av;
      }
    }

    // annuityMode: 领取方式（月领/年领），默认月领
    if (params.indexOf('annuityMode') !== -1) {
      if (/年领/.test(s)) {
        result.annuityMode = 'year';
      } else {
        result.annuityMode = 'month';
      }
    }

    return result;
  }

  function fmtMoney(n) {
    if (n >= 10000) {
      return (n / 10000).toFixed(0) + '万元（' + n.toLocaleString('zh-CN') + '元）';
    }
    return n.toLocaleString('zh-CN') + '元';
  }

  // ========== Part 2: 测算器URL参数读取 ==========
  function setupCalculatorParams() {
    var params = new URLSearchParams(window.location.search);
    var auto = params.get('auto');
    if (auto !== '1') return;  // 没有auto=1，不处理

    var age = parseInt(params.get('age'));
    var gender = parseInt(params.get('gender'));
    var premium = parseInt(params.get('premium'));
    var term = parseInt(params.get('term'));
    var period = parseInt(params.get('period'));
    var payMode = parseInt(params.get('payMode'));
    var annuityAge = parseInt(params.get('annuityAge'));
    var annuityMode = params.get('annuityMode');

    // 延迟执行，等页面生成函数定义好
    setTimeout(function() {
      try {
        // 设置性别
        if (gender === 0 || gender === 1) {
          if (typeof currentGender !== 'undefined') {
            currentGender = gender;
          }
          var btns = document.querySelectorAll('.gender-btn');
          btns.forEach(function(b) {
            b.classList.toggle('active', parseInt(b.dataset.value) === gender);
          });
        }

        // 设置年龄
        if (!isNaN(age) && age > 0) {
          var ageEl = document.getElementById('age');
          if (ageEl) ageEl.value = age;
        }

        // 设置保费
        if (!isNaN(premium) && premium > 0) {
          var premEl = document.getElementById('premium');
          if (premEl) premEl.value = premium;
        }

        // 设置各下拉参数（交费期限、保险期间、交费方式、年金起领年龄）
        setSelectValue('term', term);
        setSelectValue('period', period);
        setSelectValue('payMode', payMode);
        setSelectValue('annuityAge', annuityAge);

        // 设置领取方式（月领/年领）
        if (annuityMode) {
          var modeEl = document.getElementById('annuityMode');
          if (modeEl) modeEl.value = annuityMode;
        }

        // 自动生成
        if (typeof generate === 'function') {
          generate();
        }
      } catch(e) {
        console.error('ai-planner: 参数设置失败', e);
      }
    }, 300);
  }

  function setSelectValue(id, val) {
    if (isNaN(val) || val <= 0) return;
    var el = document.getElementById(id);
    if (!el) return;
    var found = false;
    for (var i = 0; i < el.options.length; i++) {
      if (parseInt(el.options[i].value) === val) {
        el.value = val;
        found = true;
        break;
      }
    }
    if (!found) {
      showPageError('参数' + id + '=' + val + '不在可选范围内，已使用默认值');
    }
  }

  function showPageError(msg) {
    var errEl = document.getElementById('errorMsg');
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.add('show');
      setTimeout(function(){ errEl.classList.remove('show'); }, 6000);
    }
  }

  // ========== Part 3: 微信发送文案复制按钮 ==========
  function injectWeChatButton() {
    setTimeout(function() {
      // 检查是否已添加
      if (document.getElementById('btnWeChatCopy')) return;

      // 找到下载按钮的父容器，然后添加微信按钮
      var dlBtn = document.querySelector('button[onclick*="downloadImage"]');
      if (!dlBtn) return;
      var dlBar = dlBtn.parentElement;
      if (!dlBar) return;

      var productName = getProductName();
      var btn = document.createElement('button');
      btn.id = 'btnWeChatCopy';
      btn.className = 'btn btn-dl-secondary';
      btn.textContent = '复制微信发送文案';
      btn.style.cssText = 'background:#07C160;margin-left:10px;';
      btn.onmouseover = function(){ this.style.background = '#06AD56'; };
      btn.onmouseout = function(){ this.style.background = '#07C160'; };
      btn.onclick = function() { copyWeChatText(productName); };

      dlBar.appendChild(btn);
    }, 500);
  }

  function getProductName() {
    var path = window.location.pathname.toLowerCase();
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (path.indexOf(PRODUCTS[i].file.toLowerCase().replace('.html','')) !== -1) {
        return PRODUCTS[i];
      }
    }
    return { label: '新华保险产品', category: '保险产品' };
  }

  function copyWeChatText(product) {
    // 读取页面当前填入的参数
    var age = document.getElementById('age');
    var premium = document.getElementById('premium');
    var term = document.getElementById('term');

    var ageVal = age ? parseInt(age.value) : '';
    var premiumVal = premium ? parseInt(premium.value) : 0;
    var termEl = term;
    var termText = '';
    var termNum = 0;
    if (termEl) {
      var opt = termEl.options[termEl.selectedIndex];
      termText = opt ? opt.text : '';
      termNum = parseInt(termEl.value) || 0;
    }

    var genderLabel = '';
    if (typeof currentGender !== 'undefined') {
      genderLabel = currentGender === 0 ? '男' : '女';
    } else {
      var activeGb = document.querySelector('.gender-btn.active');
      if (activeGb) genderLabel = parseInt(activeGb.dataset.value) === 0 ? '男' : '女';
    }

    var totalPremium = premiumVal * termNum;
    var premiumWan = (premiumVal / 10000).toFixed(0);

    // 尝试读取生成结果中的总利益
    var finalSurvival = '';
    var resultBody = document.getElementById('resultBody');
    if (resultBody) {
      var rows = resultBody.querySelectorAll('tr');
      if (rows.length > 0) {
        var lastRow = rows[rows.length - 1];
        var cells = lastRow.querySelectorAll('td');
        // 总利益通常在倒数第3或第4列
        if (cells.length >= 8) {
          for (var ci = cells.length - 1; ci >= 2; ci--) {
            var ct = (cells[ci].textContent || '').trim();
            if (/^\d[\d,]*$/.test(ct.replace(/,/g,'').replace(/[^0-9]/g,''))) {
              var val = parseInt(ct.replace(/,/g,''));
              if (val > totalPremium) {
                finalSurvival = ct;
                break;
              }
            }
          }
        }
      }
    }

    var now = new Date();
    var dateStr = now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日';

    var text = '【' + product.label + ' · 理财计划书】\n\n' +
      '客户信息：' + ageVal + '岁' + genderLabel + '性\n' +
      '产品名称：新华保险「' + product.label + '」' + product.category + '\n' +
      '年交保费：' + premiumWan + '万元（' + premiumVal.toLocaleString('zh-CN') + '元）\n' +
      '缴费期限：' + termText + '\n' +
      '总投入：' + (totalPremium / 10000).toFixed(0) + '万元（' + totalPremium.toLocaleString('zh-CN') + '元）\n';

    if (finalSurvival) {
      text += '预期总利益（演示）：约' + finalSurvival + '元\n';
    }

    text += '\n📊 详细利益演示请查看计划书图片\n\n' +
      '⚠ 红利利益为非保证利益\n' +
      '⚠ 具体以保险合同、产品条款及正式利益演示为准\n' +
      '\n📅 生成日期：' + dateStr;

    copyToClipboard(text);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showPageToast('微信文案已复制，可直接粘贴发送');
      }).catch(function() {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, 99999);
    try {
      document.execCommand('copy');
      showPageToast('微信文案已复制，可直接粘贴发送');
    } catch(e) {
      showPageToast('复制失败，请手动复制');
    }
    document.body.removeChild(ta);
  }

  function showPageToast(msg) {
    var t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1E293B;color:#fff;padding:12px 22px;border-radius:24px;opacity:0;transition:.3s;font-size:14px;z-index:99;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    setTimeout(function(){ t.style.opacity = '0'; }, 2500);
  }

  // ========== Part 4: 下载后"在浏览器中打开"提示弹窗 ==========
  // 全局暴露，供各测算器页面的 downloadImage() 调用
  var _pendingDataUrl = '';
  var _pendingFileName = '';

  function setupBrowserPrompt() {
    // 创建弹窗DOM（只创建一次）
    if (document.getElementById('browserPromptOverlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'browserPromptOverlay';
    overlay.style.cssText =
      'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.75);z-index:99999;display:none;flex-direction:column;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';
    overlay.innerHTML =
      '<div style="background:#fff;border-radius:16px;max-width:380px;width:100%;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.4);">' +
        // 标题栏
        '<div style="background:linear-gradient(135deg,#1D4ED8,#2563EB);padding:18px 20px;text-align:center;">' +
          '<div style="font-size:17px;font-weight:700;color:#fff;letter-spacing:0.5px;">计划书图片已生成</div>' +
          '<div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px;">可在浏览器中打开此网页来下载文件</div>' +
        '</div>' +
        // 图片预览区
        '<div style="padding:16px;text-align:center;background:#f8fafc;overflow:auto;max-height:45vh;">' +
          '<img id="browserPromptImg" src="" alt="计划书预览" style="max-width:100%;max-height:40vh;border-radius:8px;border:1px solid #e2e8f0;" />' +
        '</div>' +
        // 提示文字
        '<div style="padding:12px 20px 4px;">' +
          '<div style="font-size:13px;color:#475569;line-height:1.6;text-align:center;">' +
            '📱 手机用户：长按上方图片可保存到相册<br/>' +
            '🌐 如无法保存，请在浏览器中打开本页下载' +
          '</div>' +
        '</div>' +
        // 按钮区
        '<div style="padding:12px 20px 20px;display:flex;gap:10px;">' +
          '<button id="browserPromptClose" style="flex:1;padding:13px 0;border-radius:10px;border:1px solid #cbd5e1;background:#fff;color:#64748B;font-size:15px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent;">关闭</button>' +
          '<button id="browserPromptOpenBrowser" style="flex:1.2;padding:13px 0;border-radius:10px;border:none;background:linear-gradient(135deg,#2563EB,#1D4ED8);color:#fff;font-size:15px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent;">在浏览器中打开</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    // 绑定事件
    overlay.querySelector('#browserPromptClose').addEventListener('click', hideBrowserPrompt);
    overlay.querySelector('#browserPromptOpenBrowser').addEventListener('click', doOpenInBrowser);
    // 点击遮罩关闭
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) hideBrowserPrompt();
    });
  }

  /**
   * 显示"浏览器打开提示"弹窗
   * @param {string} dataUrl - canvas.toDataURL 生成的 base64 图片数据
   * @param {string} filename - 文件名（用于显示和下载）
   */
  window.showBrowserOpenPrompt = function(dataUrl, filename) {
    _pendingDataUrl = dataUrl;
    _pendingFileName = filename || '理财计划书.png';

    setupBrowserPrompt();

    var overlay = document.getElementById('browserPromptOverlay');
    var imgEl = document.getElementById('browserPromptImg');

    if (imgEl && dataUrl) {
      imgEl.src = dataUrl;
    }
    if (overlay) {
      overlay.style.display = 'flex';
    }
  };

  function hideBrowserPrompt() {
    var overlay = document.getElementById('browserPromptOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  function doOpenInBrowser() {
    if (!_pendingDataUrl) return;

    try {
      // 方法1：创建一个新窗口，写入带图片的HTML页面
      // 在微信内置浏览器中，这通常会触发系统级"选择浏览器打开"提示
      var newWin = window.open('', '_blank');
      if (newWin) {
        newWin.document.write(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
          '<title>计划书图片 - ' + _pendingFileName + '</title>' +
          '<style>*{margin:0;padding:0;}body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f2f5;}img{max-width:95vw;max-height:95vh;object-fit:contain;border-radius:8px;box-shadow:0 4px 24px rgba(0,0,0,0.15);}' +
          '.tip{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);color:#fff;padding:10px 20px;border-radius:20px;font-size:14px;font-family:-apple-system,sans-serif;}</style></head>' +
          '<body><img src="' + _pendingDataUrl + '" alt="plan"/>' +
          '<div class="tip">📥 长按图片保存到手机 · 或点击菜单保存</div></body></html>'
        );
        newWin.document.close();
      } else {
        // 弹窗被拦截，回退到复制链接提示
        copyPageLinkAndTip();
      }
    } catch(e) {
      console.warn('openInBrowser failed:', e);
      copyPageLinkAndTip();
    }

    hideBrowserPrompt();
  }

  function copyPageLinkAndTip() {
    var pageUrl = location.href.split('?')[0];
    // 尝试复制当前URL到剪贴板
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pageUrl).then(function() {
        showPageToast('已复制页面链接 ✅ 请粘贴到浏览器地址栏打开');
      }).catch(function() {
        showPageToast('请在浏览器中打开本页：' + pageUrl.slice(0, 40) + '...');
      });
    } else {
      showPageToast('请复制地址栏链接，在外部浏览器中打开');
    }
  }

  // ========== Part 5: 60岁后显示频率过滤 ==========
  window.filterRowsByAge = function(mode) {
    var tbody = document.getElementById('resultBody');
    if (!tbody) return;

    var rows = tbody.querySelectorAll('tr');
    var ageColIndex = 1;

    // 自动检测年龄列
    var thead = document.querySelector('thead tr');
    var headers = [];
    if (thead) {
      headers = Array.from(thead.querySelectorAll('th, td'));
      for (var h = 0; h < headers.length; h++) {
        if (/年龄|周岁/.test(headers[h].textContent || '')) {
          ageColIndex = h;
          break;
        }
      }
    }

    rows.forEach(function(row) {
      var cells = row.querySelectorAll('td');
      if (cells.length <= ageColIndex) return;

      var ageText = (cells[ageColIndex].textContent || '').trim().replace(/[^0-9]/g, '');
      var age = parseInt(ageText);
      if (isNaN(age)) return;

      if (age < 60) {
        row.style.display = '';
        return;
      }

      if (mode === 'all') {
        row.style.display = '';
      } else if (mode === '2y') {
        row.style.display = ((age - 60) % 2 === 0) ? '' : 'none';
      } else if (mode === '5y') {
        row.style.display = ((age - 60) % 5 === 0) ? '' : 'none';
      }
    });
  };

  window.getDisplayMode = function() {
    var sel = document.getElementById('displayMode');
    return sel ? sel.value : 'all';
  };

  window.setDownloadFilter = function() {
    var origMode = window.getDisplayMode();
    window.filterRowsByAge('5y');
    return function() {
      window.filterRowsByAge(origMode);
    };
  };
})();
