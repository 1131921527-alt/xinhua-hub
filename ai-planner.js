/* ===== 智能计划书快捷生成 + 测算器URL参数 + 微信文案 ===== */
(function(){
  'use strict';

  // ─── 产品映射表 ───
  var PRODUCTS = [
    { names: ['宏御','宏御世家','s11'], file: 'calculator-hongyu.html', label: '宏御世家', category: '分红型终身寿险' },
    { names: ['宏泰','宏泰世家','s03'], file: 'calculator-hongtai.html', label: '宏泰世家', category: '分红型终身寿险' },
    { names: ['宏愿','宏愿人生','s02'], file: 'calculator-hongyuan.html', label: '宏愿人生', category: '分红型养老年金' },
    { names: ['华彩','华彩鎏金','s24'], file: 'calculator-huacai.html', label: '华彩鎏金', category: '分红型年金' },
    { names: ['宏坤','宏坤人生','s06'], file: 'calculator-hongkun.html', label: '宏坤人生', category: '分红型养老年金' },
    { names: ['恒享','恒享人生','g23'], file: 'calculator-hengxiang.html', label: '恒享人生', category: '非分红型年金' },
    { names: ['福盛','福盛世家','添翼版','g24'], file: 'calculator-fusheng.html', label: '福盛世家', category: '非分红型终身寿险' }
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
        showPlannerError('无法识别产品名称，请使用：宏御/宏泰/宏愿/华彩/宏坤/恒享/福盛');
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
      if (!result.term) {
        showPlannerError('请提供缴费期限（如：3年交、5年交、趸交、20×3）');
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
      document.getElementById('apTerm').textContent = result.termDisplay;
      modalEl.style.display = 'flex';
      // 存储结果供确认使用
      modalEl._result = result;
    }

    function confirmAndGo(confirmed) {
      if (!modalEl) return;
      modalEl.style.display = 'none';
      if (!confirmed || !modalEl._result) return;

      var r = modalEl._result;
      var url = r.product.file + '?age=' + r.age + '&gender=' + r.gender + '&premium=' + r.premium + '&term=' + r.termVal + '&auto=1';
      window.location.href = url;
    }

    setTimeout(init, 200);
  }

  // ─── 输入解析引擎 ───
  function parseInput(raw) {
    var s = raw.replace(/\s+/g, ' ').trim();
    var result = {
      product: null, age: null, gender: null, genderLabel: null,
      premium: null, premiumDisplay: null, term: null, termVal: null, termDisplay: null
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

        // 设置缴费期限
        if (!isNaN(term) && term > 0) {
          var termEl = document.getElementById('term');
          if (termEl) {
            var found = false;
            for (var i = 0; i < termEl.options.length; i++) {
              if (parseInt(termEl.options[i].value) === term) {
                termEl.value = term;
                found = true;
                break;
              }
            }
            if (!found) {
              // 如果期限不在选项里，用最接近的
              showPageError('缴费期限' + term + '年不在该产品可选范围内，已使用默认值');
            }
          }
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
})();
