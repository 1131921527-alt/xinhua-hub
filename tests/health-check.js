'use strict';
/**
 * 新华Hub V1.0 Health Check（静态检测，无需浏览器）
 *
 * 检测项：
 *   A. 文件存在性（calculator HTML / product-rules.js / html2canvas / 数据文件）
 *   B. HTML 引用完整性（product-rules.js ��用 / JS依赖可解析）
 *   C. 产品规则配置（PRODUCT_RULES 含8款 / key/reserveType/showRate 一致性）
 *   D. 测试资产（screenshots 存在 / last-report.md 通过）
 *   E. 文档索引（docs/INDEX.md 存在 / docs/*.md 数量）
 *
 * 输出：V1.0-health-check.json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'V1.0-health-check.json');

const PRODUCTS = [
  { name:'盈满鑫', file:'calculator-yingmanxin.html', key:'yingmanxin', mode:'payterm' },
  { name:'宏御',   file:'calculator-hongyu.html',     key:'hongyu',     mode:'fixed' },
  { name:'宏安',   file:'calculator-hongan.html',     key:'hongan',     mode:'fixed' },
  { name:'宏泰',   file:'calculator-hongtai.html',    key:null,        mode:'external-json' },
  { name:'宏愿',   file:'calculator-hongyuan.html',   key:'hongyuan',   mode:'fixed' },
  { name:'宏禧来', file:'calculator-hongxilai.html',  key:'hongxilai',  mode:'dynamic' },
  { name:'华彩',   file:'calculator-huacai.html',     key:'huacai',     mode:'fixed' },
  { name:'宏坤',   file:'calculator-hongkun.html',    key:'hongkun',    mode:'external-js' },
  { name:'福盛世家',file:'calculator-fusheng.html',   key:null,        mode:'local' },
  { name:'恒享',   file:'calculator-hengxiang.html',  key:null,        mode:'local' }
];

function check(p){
  const fp = path.join(ROOT, p);
  return fs.existsSync(fp);
}

function read(p){ try{ return fs.readFileSync(path.join(ROOT,p),'utf8'); }catch(e){ return ''; } }

// ---- A. 文件存在性 ----
const fileChecks = {};
for(const p of PRODUCTS){
  fileChecks[p.name] = {
    html_exists: check(p.file),
    size_bytes: check(p.file)?fs.statSync(path.join(ROOT,p.file)).size:0
  };
}
const deps = {
  'product-rules.js': check('product-rules.js'),
  'html2canvas.min.js': check('html2canvas.min.js'),
  'data.json': check('data.json'),
  'index.html': check('index.html')
};

// ---- B. HTML 引用完整性 ----
const refChecks = {};
for(const p of PRODUCTS){
  if(!check(p.file)){ refChecks[p.name]={error:'HTML不存在'}; continue; }
  const html = read(p.file);
  const refs = {
    has_product_rules: html.includes('product-rules.js'),
    has_html2canvas: html.includes('html2canvas.min.js'),
    has_doctype: html.includes('<!DOCTYPE'),
    has_viewport: html.includes('viewport'),
    has_generate_btn: html.includes('generate') || html.includes('生成'),
    has_download_fn: html.includes('downloadImage') || html.includes('download')
  };
  // 对进规则层的产品，必须引用 product-rules.js
  if(p.key && !refs.has_product_rules){
    refs.warning = `进规则层产品 ${p.name} 未引用 product-rules.js`;
  }
  refChecks[p.name] = refs;
}

// ---- C. 产品规则配置 ----
let rulesObj = null;
let ruleCheck = { loaded:false, keys:[], issues:[] };
try{
  const code = read('product-rules.js');
  const win = {}; new Function('window',code)(win);
  rulesObj = win.PRODUCT_RULES || null;
  if(rulesObj){
    ruleCheck.loaded = true;
    ruleCheck.keys = Object.keys(rulesObj);
    for(const p of PRODUCTS){
      if(!p.key) continue;
      if(!rulesObj[p.key]) ruleCheck.issues.push(`${p.name}: 配置层缺 key=${p.key}`);
      else{
        const r = rulesObj[p.key];
        if(r.reserveType !== p.mode && !(p.mode==='external-js'||p.mode==='external-json')){
          ruleCheck.issues.push(`${p.name}: reserveType=${r.reserveType} 期望≈${p.mode}`);
        }
      }
    }
  } else { ruleCheck.issues.push('无法解析 PRODUCT_RULES'); }
}catch(e){ ruleCheck.issues.push(e.message); }

// ---- D. 测试资产 ----
const shotsDir = path.join(ROOT,'tests','shots');
const shotsExist = fs.existsSync(shotsDir);
const shotCount = shotsExist ? fs.readdirSync(shotsDir).filter(f=>f.endsWith('.png')).length : 0;
const lastReport = read('tests/last-report.md');
const testAssets = {
  screenshots_dir_exists: shotsExist,
  screenshot_count: shotCount,
  last_report_exists: check('tests/last-report.md'),
  last_report_pass: lastReport.includes('全部通过') || lastReport.includes('11/11 通过'),
  acceptance_checklist_exists: check('docs/PRODUCT_ACCEPTANCE_CHECKLIST.md')
};

// ---- E. 文档索引 ----
const docsDir = path.join(ROOT,'docs');
const docsExist = fs.existsSync(docsDir);
const docFiles = docsExist ? fs.readdirSync(docsDir).filter(f=>f.endsWith('.md')) : [];
const indexExists = docsExist && docFiles.includes('INDEX.md');
const docIndex = {
  docs_dir_exists: docsExist,
  doc_count: docFiles.length,
  index_md_exists: indexExists,
  doc_files: docFiles
};

// ---- 汇总 ----
const allHtmlOk = Object.values(fileChecks).every(f=>f.html_exists);
const allRefsOk = !Object.values(refChecks).some(r=>r.error);
const rulesOk = ruleCheck.issues.length === 0;
const testsOk = testAssets.last_report_pass;
const overall = allHtmlOk && allRefsOk && rulesOk && testsOk;

const result = {
  timestamp: new Date().toISOString(),
  overall_status: overall ? 'PASS' : 'WARN',
  summary: {
    total_products: PRODUCTS.length,
    html_all_exist: allHtmlOk,
    references_ok: allRefsOk,
    rules_loaded: ruleCheck.loaded,
    rules_issues_count: ruleCheck.issues.length,
    test_assets_ok: testsOk,
    screenshot_count: shotCount,
    docs_indexed: indexExists
  },
  details: {
    files: fileChecks,
    dependencies: deps,
    references: refChecks,
    rules: { loaded:ruleCheck.loaded, keys:ruleCheck.keys, issues:ruleCheck.issues },
    test_assets: testAssets,
    docs: docIndex
  }
};

fs.writeFileSync(OUT, JSON.stringify(result, null, 2), 'utf8');
console.log(`Health Check: ${overall ? '✅ PASS' : '⚠️ WARN'} (${result.summary.html_all_exist?'10/10 HTML':'部分缺失'})`);
console.log(`规则层: ${rulesOk?'✅ OK':'❌ '+ruleCheck.issues.length+' issue(s)'}`);
console.log(`验收报告: ${testsOk?'✅ PASS':'❌ FAIL'}`);
console.log(`截图: ${shotCount} 张`);
console.log(`输出: ${path.relative(ROOT, OUT)}`);
process.exit(overall ? 0 : 1);
