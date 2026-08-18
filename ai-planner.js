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
    const _initCalc = () => {
      setupCalculatorParams();
      injectWeChatButton();
      setupBrowserPrompt();  // 浏览器打开提示
    };
    // 兼容 head 内同步加载（此时 document.body 可能为 null）
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _initCalc);
    else _initCalc();
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

    // 弹窗内 select 填充
    function fillSelect(el, options, selectedValue) {
      if (!el) return;
      el.innerHTML = '';
      options.forEach(function(opt) {
        var option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        if (opt.value == selectedValue) option.selected = true;
        el.appendChild(option);
      });
    }

    function getProductOptions(product) {
      var termOptions = [
        {value:1, label:'趸交'}, {value:3, label:'3年交'}, {value:5, label:'5年交'},
        {value:10, label:'10年交'}, {value:15, label:'15年交'}, {value:20, label:'20年交'}, {value:30, label:'30年交'}
      ];
      var payModeOptions = [
        {value:1, label:'趸交'}, {value:3, label:'3年交'}, {value:5, label:'5年交'},
        {value:8, label:'8年交'}, {value:10, label:'10年交'}, {value:15, label:'15年交'}, {value:20, label:'20年交'}
      ];
      var periodOptions = [
        {value:8, label:'8年期'}, {value:10, label:'10年期'}, {value:15, label:'15年期'},
        {value:20, label:'20年期'}, {value:30, label:'30年期'}
      ];
      var annuityAgeOptions = [
        {value:50, label:'50岁起领'}, {value:55, label:'55岁起领'}, {value:60, label:'60岁起领'},
        {value:65, label:'65岁起领'}, {value:70, label:'70岁起领'}
      ];
      var options = {};
      var params = product.params || ['term'];
      if (params.indexOf('term') !== -1) options.term = termOptions;
      if (params.indexOf('payMode') !== -1) options.payMode = payModeOptions;
      if (params.indexOf('period') !== -1) options.period = periodOptions;
      if (params.indexOf('annuityAge') !== -1) options.annuityAge = annuityAgeOptions;
      return options;
    }

    function updateModalRows(product) {
      var params = product.params || ['term'];
      document.getElementById('apTermRow').style.display = params.indexOf('term') !== -1 ? 'flex' : 'none';
      document.getElementById('apPayModeRow').style.display = params.indexOf('payMode') !== -1 ? 'flex' : 'none';
      document.getElementById('apPeriodRow').style.display = params.indexOf('period') !== -1 ? 'flex' : 'none';
      document.getElementById('apAnnuityAgeRow').style.display = params.indexOf('annuityAge') !== -1 ? 'flex' : 'none';
      document.getElementById('apAnnuityModeRow').style.display = params.indexOf('annuityMode') !== -1 ? 'flex' : 'none';
    }

    function showConfirmModal(result) {
      if (!modalEl) return;

      // 产品下拉
      var prodSelect = document.getElementById('apProdSelect');
      prodSelect.innerHTML = '';
      PRODUCTS.forEach(function(p) {
        var opt = document.createElement('option');
        opt.value = p.file;
        opt.textContent = p.label;
        if (p.file === result.product.file) opt.selected = true;
        prodSelect.appendChild(opt);
      });

      // 年龄下拉
      var ageSelect = document.getElementById('apAgeSelect');
      ageSelect.innerHTML = '';
      for (var a = 18; a <= 75; a++) {
        var opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a + '岁';
        if (a === result.age) opt.selected = true;
        ageSelect.appendChild(opt);
      }

      // 性别
      document.getElementById('apGenderSelect').value = (result.gender === 0 || result.gender === '0') ? '0' : '1';

      // 保费（万元）
      var premiumWan = result.premium ? (result.premium / 10000) : '';
      document.getElementById('apPremiumInput').value = premiumWan;

      // 产品相关下拉
      var opts = getProductOptions(result.product);
      if (opts.term) fillSelect(document.getElementById('apTermSelect'), opts.term, result.termVal || 3);
      if (opts.payMode) fillSelect(document.getElementById('apPayModeSelect'), opts.payMode, result.payMode || 3);
      if (opts.period) fillSelect(document.getElementById('apPeriodSelect'), opts.period, result.period || 8);
      if (opts.annuityAge) fillSelect(document.getElementById('apAnnuityAgeSelect'), opts.annuityAge, result.annuityAge || 60);

      // 年金领取方式
      if ((result.product.params || []).indexOf('annuityMode') !== -1) {
        document.getElementById('apAnnuityModeSelect').value = result.annuityMode || 'month';
      }

      updateModalRows(result.product);

      // 切换产品时更新关联字段
      prodSelect.onchange = function() {
        var newProduct = null;
        for (var i = 0; i < PRODUCTS.length; i++) {
          if (PRODUCTS[i].file === prodSelect.value) { newProduct = PRODUCTS[i]; break; }
        }
        updateModalRows(newProduct);
        var newOpts = getProductOptions(newProduct);
        if (newOpts.term) fillSelect(document.getElementById('apTermSelect'), newOpts.term, 3);
        if (newOpts.payMode) fillSelect(document.getElementById('apPayModeSelect'), newOpts.payMode, 3);
        if (newOpts.period) fillSelect(document.getElementById('apPeriodSelect'), newOpts.period, 8);
        if (newOpts.annuityAge) fillSelect(document.getElementById('apAnnuityAgeSelect'), newOpts.annuityAge, 60);
        if ((newProduct.params || []).indexOf('annuityMode') !== -1) {
          document.getElementById('apAnnuityModeSelect').value = 'month';
        }
      };

      modalEl.style.display = 'flex';
      modalEl._result = result;
    }

    function confirmAndGo(confirmed) {
      if (!modalEl) return;
      modalEl.style.display = 'none';
      if (!confirmed) return;

      var productFile = document.getElementById('apProdSelect').value;
      var product = null;
      for (var i = 0; i < PRODUCTS.length; i++) {
        if (PRODUCTS[i].file === productFile) { product = PRODUCTS[i]; break; }
      }
      var age = parseInt(document.getElementById('apAgeSelect').value);
      var gender = parseInt(document.getElementById('apGenderSelect').value);
      var premiumWan = parseFloat(document.getElementById('apPremiumInput').value);
      var premium = Math.round(premiumWan * 10000);

      var url = product.file + '?age=' + age + '&gender=' + gender + '&premium=' + premium;
      var params = product.params || ['term'];
      params.forEach(function(p) {
        var val;
        if (p === 'term') {
          val = parseInt(document.getElementById('apTermSelect').value);
        } else if (p === 'payMode') {
          val = parseInt(document.getElementById('apPayModeSelect').value);
        } else if (p === 'period') {
          val = parseInt(document.getElementById('apPeriodSelect').value);
        } else if (p === 'annuityAge') {
          val = parseInt(document.getElementById('apAnnuityAgeSelect').value);
        } else if (p === 'annuityMode') {
          val = document.getElementById('apAnnuityModeSelect').value;
        }
        if (val !== null && val !== undefined && val !== '') {
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
      btn.textContent = '复制微信发送短信文案';
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
    // 宏安世家：使用固定短信文案
    if (product.label === '宏安世家') {
      var text = '【宏安世家】央企出品 固收 + 分红终身寿险\n✅ 保底年复利 1.75%，利益写入合同，终身锁定，不受利率波动影响\n✅ 年度盈余分红，演示利率 1.22%，可现金领取、可复利滚存增值\n✅ 终身身故保障 1.4-1.6 倍，额外赔付 1 倍特定公共交通意外身故金\n中央汇金、中国宝武钢铁双央企控股，3 笔投入、R2 低风险，长期资产稳健压舱石';
      copyToClipboard(text);
      return;
    }
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
      '🏢 出品方：新华保险｜央企控股，中央汇金、中国宝武钢铁双央企股东背景\n' +
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
          '<div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px;">长按图片即可保存图片</div>' +
        '</div>' +
    // 图片预览区（放大，方便微信查看）
    '<div style="padding:12px;text-align:center;background:#f8fafc;overflow:auto;max-height:60vh;">' +
      '<img id="browserPromptImg" src="" alt="计划书预览" style="max-width:100%;max-height:55vh;border-radius:8px;border:1px solid #e2e8f0;" />' +
    '</div>' +
    // 提示文字
    '<div style="padding:10px 20px 2px;">' +
      '<div style="font-size:13px;color:#475569;line-height:1.6;text-align:center;">' +
        '📤 点「保存图片」→ 选「文件传输助手」<br/>' +
        '💾 在聊天里长按图片即可保存图片' +
      '</div>' +
    '</div>' +
        // 按钮区
        '<div style="padding:12px 20px 20px;display:flex;flex-direction:column;gap:10px;">' +
          '<button id="browserPromptSave" style="width:100%;padding:14px 0;border-radius:10px;border:none;background:linear-gradient(135deg,#2563EB,#1D4ED8);color:#fff;font-size:16px;font-weight:700;cursor:pointer;-webkit-tap-highlight-color:transparent;">📤 保存图片</button>' +
          '<div style="display:flex;gap:10px;">' +
            '<button id="browserPromptCopy" style="flex:1;padding:13px 0;border-radius:10px;border:1.5px solid #2563EB;background:#fff;color:#2563EB;font-size:15px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent;">📋 复制链接</button>' +
            '<button id="browserPromptClose" style="flex:1;padding:13px 0;border-radius:10px;border:1px solid #cbd5e1;background:#fff;color:#64748B;font-size:15px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent;">关闭</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    // 绑定事件
    overlay.querySelector('#browserPromptClose').addEventListener('click', hideBrowserPrompt);
    overlay.querySelector('#browserPromptCopy').addEventListener('click', copyPageLinkAndTip);
    overlay.querySelector('#browserPromptSave').addEventListener('click', saveViaShare);
    // 点击遮罩关闭
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) hideBrowserPrompt();
    });
  }

  /**
   * 将 base64 dataURL 转为 Blob 对象
   */
  function dataUrlToBlob(dataUrl) {
    var parts = dataUrl.split(',');
    var mimeMatch = parts[0].match(/:(.*?);/);
    var mime = mimeMatch ? mimeMatch[1] : 'image/png';
    var byteString = atob(parts[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: mime });
  }

  /**
   * 将 base64 dataURL 转为 Blob URL（避免微信 WebView 截断/无法识别）
   */
  function dataUrlToBlobUrl(dataUrl) {
    return URL.createObjectURL(dataUrlToBlob(dataUrl));
  }

  /**
   * 将 dataUrl 图片按比例缩小，返回新的 base64 dataUrl
   */
  function compressDataUrl(dataUrl, maxWidth) {
    return new Promise(function(resolve, reject) {
      var img = new Image();
      img.onload = function() {
        var w = img.width, h = img.height;
        if (w <= maxWidth) { resolve(dataUrl); return; }
        var scale = maxWidth / w;
        var newW = Math.floor(w * scale), newH = Math.floor(h * scale);
        var canvas = document.createElement('canvas');
        canvas.width = newW; canvas.height = newH;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, newW, newH);
        ctx.drawImage(img, 0, 0, newW, newH);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  /**
   * 压缩并将图片转为 Blob URL，便于微信长按保存
   */
  function compressToBlobUrl(dataUrl, maxWidth) {
    return compressDataUrl(dataUrl, maxWidth).then(function(smallUrl) {
      return dataUrlToBlobUrl(smallUrl);
    });
  }

  /**
   * 通过系统分享 API 保存图片
   * - 微信内：直接调起转发（不检测 canShare，微信会唤起转发面板，选「文件传输助手」后聊天里长按图片即可保存）
   * - 非微信：优先 navigator.share，降级 blob 下载
   */
  function saveViaShare() {
    if (!_pendingDataUrl) {
      showPageToast('图片尚未准备好，请稍后重试');
      return;
    }
    var isWechat = /MicroMessenger/i.test(navigator.userAgent);
    var fileName = _pendingFileName || '理财计划书.png';

    var file = null;
    try {
      file = new File([dataUrlToBlob(_pendingDataUrl)], fileName, { type: 'image/png' });
    } catch (e) {
      showPageToast('图片生成失败，请重试');
      return;
    }

    // 微信环境：直接调起系统分享（转发图片到微信好友 / 文件传输助手）
    if (isWechat) {
      if (navigator.share) {
        navigator.share({ files: [file], title: '新华保险理财计划书', text: '新华保险理财计划书' })
          .then(function() {
            showPageToast('图片已生成，请按系统提示保存');
          })
          .catch(function(e) {
            console.warn('wechat share failed:', e);
            fallbackWechatSave();
          });
      } else {
        fallbackWechatSave();
      }
      return;
    }

    // 非微信：优先 share，降级 blob 下载
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: '新华保险理财计划书', text: '新华保险理财计划书' })
        .catch(function(e) {
          console.warn('share canceled/failed:', e);
          trySaveByAnchor(_pendingDataUrl, fileName);
        });
    } else {
      trySaveByAnchor(_pendingDataUrl, fileName);
    }
  }

  /**
   * 微信里分享不可用时降级：复制页面链接，引导在系统浏览器打开后保存
   */
  function fallbackWechatSave() {
    copyPageLinkAndTip();
  }

  function trySaveByAnchor(dataUrl, fileName) {
    try {
      var blobUrl = dataUrlToBlobUrl(dataUrl);
      var a = document.createElement('a');
      a.href = blobUrl; a.download = fileName;
      a.style.display = 'none'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function() { URL.revokeObjectURL(blobUrl); }, 1000);
    } catch (e) {
      console.warn('trySaveByAnchor failed:', e);
      showPageToast('自动下载失败，请长按图片保存');
    }
  }

  window.showBrowserOpenPrompt = function(dataUrl, filename) {
    _pendingDataUrl = dataUrl;
    _pendingFileName = filename || '理财计划书.png';

    setupBrowserPrompt();

    var overlay = document.getElementById('browserPromptOverlay');
    var imgEl = document.getElementById('browserPromptImg');
    var saveBtn = document.getElementById('browserPromptSave');

    var isWechat = /MicroMessenger/i.test(navigator.userAgent);

    if (imgEl && dataUrl) {
      if (isWechat) {
        // 微信里压缩到 600px 并转成 Blob URL，图片更小、长按保存更稳
        compressToBlobUrl(dataUrl, 600).then(function(blobUrl) {
          imgEl.src = blobUrl;
        }).catch(function() {
          imgEl.src = dataUrl;
        });
      } else {
        imgEl.src = dataUrl;
      }
    }

    // 微信里按钮文案改为「保存图片」；非微信保持「保存图片」
    if (saveBtn) {
      saveBtn.style.display = 'block';
      saveBtn.textContent = isWechat ? '📤 保存图片' : '📥 保存图片';
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

    var isWechat = /MicroMessenger/i.test(navigator.userAgent);

    try {
      // 微信里先压缩，避免生成的图片页太大无法保存；再统一用 Blob URL
      var doOpen = function(srcUrl) {
        var newWin = window.open('', '_blank');
        if (newWin) {
          newWin.document.write(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1.0,user-scalable=no">' +
            '<title>计划书图片 - ' + _pendingFileName + '</title>' +
            '<style>*{margin:0;padding:0;-webkit-tap-highlight-color:transparent;}body{display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100vh;background:#000;padding:10px;box-sizing:border-box;}img{max-width:100vw;max-height:88vh;object-fit:contain;border-radius:8px;background:#fff;}' +
            '.tip{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.75);color:#fff;padding:10px 20px;border-radius:20px;font-size:14px;font-family:-apple-system,sans-serif;white-space:nowrap;}' +
            '.tip2{position:fixed;top:12px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.95);color:#1E40AF;padding:8px 16px;border-radius:20px;font-size:13px;font-family:-apple-system,sans-serif;font-weight:700;white-space:nowrap;}</style></head>' +
            '<body><div class="tip2">📥 长按图片保存图片</div><img src="' + srcUrl + '" alt="plan"/>' +
            '<div class="tip">若长按无效，点右上角「在浏览器中打开」</div></body></html>'
          );
          newWin.document.close();
        } else {
          copyPageLinkAndTip();
        }
      };

      if (isWechat) {
        compressToBlobUrl(_pendingDataUrl, 600).then(doOpen).catch(function() {
          doOpen(dataUrlToBlobUrl(_pendingDataUrl));
        });
      } else {
        doOpen(dataUrlToBlobUrl(_pendingDataUrl));
      }
    } catch(e) {
      console.warn('openInBrowser failed:', e);
      copyPageLinkAndTip();
    }

    hideBrowserPrompt();
  }

  function copyPageLinkAndTip() {
    // 保留 URL 中的版本号参数（?v=xxx），避免微信缓存旧页面
    var pageUrl = location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pageUrl).then(function() {
        showPageToast('已复制页面链接 ✅ 请粘贴到浏览器打开后保存图片');
      }).catch(function() {
        showPageToast('请复制地址栏链接，在外部浏览器中打开');
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

    if (mode === 'all') {
      rows.forEach(function(row) { row.style.display = ''; });
      return;
    }

    var baseAge = 60;
    if (mode === '5y70') baseAge = 70;
    else if (mode === '5y75') baseAge = 75;
    else if (mode === '5y') baseAge = 60; // legacy fallback

    rows.forEach(function(row) {
      var cells = row.querySelectorAll('td');
      if (cells.length <= ageColIndex) return;

      var ageText = (cells[ageColIndex].textContent || '').trim().replace(/[^0-9]/g, '');
      var age = parseInt(ageText);
      if (isNaN(age)) return;

      if (age < baseAge) {
        row.style.display = '';
      } else {
        row.style.display = ((age - baseAge) % 5 === 0) ? '' : 'none';
      }
    });
  };

  window.getDisplayMode = function() {
    var sel = document.getElementById('displayMode');
    return sel ? sel.value : 'all';
  };

  window.setDownloadFilter = function() {
    var origMode = window.getDisplayMode();
    window.filterRowsByAge('5y60');
    return function() {
      window.filterRowsByAge(origMode);
    };
  };
})();
