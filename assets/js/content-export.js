(function(){
'use strict';
const scriptURL=new URL(document.currentScript.src),baseURL=new URL('../../',scriptURL),url=f=>new URL(f,baseURL).href;
const registry={
 'about-xinhua.html':{root:'#company-content',title:'新华保险公司介绍',ready:()=>document.querySelector('#module-identity'),scopes:true,company:true,note:'公司介绍保留完整正文与图表；PDF使用可选中文与矢量图形。PPTX为高清视觉型，非逐元素可编辑版本。'},
 'hongli-realization.html':{root:'main',title:'如何看懂分红',ready:()=>document.querySelector('#rate-full table'),scopes:true,exclude:'#official-comparison',note:'整页核心正文不包含其他公司上百条披露明细；如需对比数据，请先在网页筛选产品，再在导出主题中选择“当前其他公司查询结果”。'},
 'intro-yingmanxin.html':{root:'.wrap',title:'盈满鑫两全保险（分红型）产品解读'},
 'card-hongyu.html':{root:'.wrap',title:'宏御世家知识问答卡片',formats:['png']},
 'zengzhi.html':{root:'body',title:'新华尊与新华瑞增值服务',formats:['png'],note:'含原始权益图片，当前仅开放高清PNG；PDF/PPT需进一步完成结构化排版核验。'},
 'insurance-knowledge-card.html':{root:'.wrap',title:'保险知识卡·利率与分红政策图解',formats:['png']},
 'sales-qa.html':{root:'.wrap',title:'常见问题说明',formats:['png']},
 'sales-qa-fenhong.html':{root:'.wrap',title:'分红险常见问题',formats:['png']},
 'sales-qa-yanglao.html':{root:'.wrap',title:'养老规划说明',formats:['png']},
 'sales-qa-chuancheng.html':{root:'.wrap',title:'财富传承说明',formats:['png']},
 'sales-qa-hk.html':{root:'.wrap',title:'香港保险常见问题',formats:['png']},
 'sales-qa-gaoke.html':{root:'.wrap',title:'高客保障常见问题',formats:['png']},
 'sales-qa-yiyi.html':{root:'.wrap',title:'保障意义常见问题',formats:['png']},
 'content-composer.html':{root:'#composer-preview',title:'新华资料模块组合',formats:['png'],ready:()=>document.querySelector('#composer-preview [data-module]'),empty:()=>document.querySelector('#composer-preview .kt-empty')}
};
const config=registry[decodeURIComponent(location.pathname.split('/').pop())];if(!config)return;
if(!document.querySelector('link[rel~="icon"]')){const icon=document.createElement('link');icon.rel='icon';icon.href=url('favicon.ico');document.head.append(icon);}
let active=false,cancelled=false,artifacts=[],frame=null,scopeSelector=null,densitySelector=null,temporaryURLs=[];
let svgFontCSS;
const date=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai'}).format(new Date());
const safe=s=>s.replace(/[\\/:*?"<>|\r\n]/g,'-').slice(0,100),filename=(name,ext)=>safe(config.title+(name?'-'+name:''))+'-'+date()+'.'+ext;
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
const loadScript=async(file,test)=>{if(test())return;await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url(file);s.onload=resolve;s.onerror=()=>reject(Error('导出依赖加载失败：'+file+'。请检查网络后重试。'));document.head.append(s)});if(!test())throw Error('导出组件初始化失败');};
const abort=()=>{if(cancelled)throw Error('已取消，本次未完成的文件不会标记为成功。')};
const deadline=(promise,message,ms=20000)=>new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error(message)),ms);Promise.resolve(promise).then(v=>{clearTimeout(t);resolve(v)},e=>{clearTimeout(t);reject(e)})});
async function waitReady(){const started=Date.now();while(config.ready&&!config.ready()){if(config.empty?.())throw Error('请先选择至少一个正式内容模块，再执行导出');if(Date.now()-started>20000)throw Error('正文尚未完整加载，请等待页面加载完成后重试');await new Promise(r=>setTimeout(r,100));abort()}await deadline(document.fonts.ready,'字体加载超时，请检查网络后重试');}
async function loadImage(img){try{await deadline(img.decode(),'图片加载超时')}catch{throw Error('图片未成功加载，未导出：'+(img.alt||img.src.split('/').pop()))}if(!img.naturalWidth)throw Error('图片为空白，已停止导出');const u=new URL(img.src);if(u.origin!==location.origin&&!['data:','blob:'].includes(u.protocol)){try{const r=await deadline(fetch(img.src,{mode:'cors'}),'跨域图片请求超时');if(!r.ok)throw Error();const value=URL.createObjectURL(await r.blob());temporaryURLs.push(value);img.src=value;await img.decode()}catch{throw Error('跨域图片未允许导出，请先提供同源正式图片')}}}
const exportCSS=`
.hxe-document .hxe-page-body>.kt-kicker{color:#526b8c!important}.hxe-document .hxe-page-body .kt-bar-row{grid-template-columns:200px minmax(0,1fr) 110px!important}.hxe-document .hxe-page-body .kt-bar-row>b{white-space:nowrap!important;overflow-wrap:normal!important;word-break:keep-all!important}
.hxe-document.hxe-mobile-pdf{font-size:28px!important}.hxe-document.hxe-a4-pdf{font-size:20px!important}.hxe-document.hxe-a4-pdf h1{font-size:34px!important}.hxe-document.hxe-a4-pdf h2{font-size:28px!important}.hxe-document.hxe-a4-pdf h3{font-size:24px!important}.hxe-document.hxe-a4-pdf h4{font-size:22px!important}.hxe-document.hxe-a4-pdf :where(.kt-source,.kt-note,.meta,.foot,.footer,.hxe-page-footer){font-size:16px!important}.hxe-document.hxe-a4-pdf table{font-size:20px!important}
.hxe-document .kt-arrow{display:block!important;width:48px!important;height:48px!important;line-height:48px!important;text-align:center!important;margin:0 auto!important;flex:none!important}
.hxe-wide .hxe-page-footer{font-size:18px!important;line-height:1.5!important}
html,body{margin:0!important;padding:0!important;background:#fff!important;height:auto!important;overflow:visible!important;min-height:0!important;width:100%!important}*{box-sizing:border-box!important;animation:none!important;transition:none!important;text-shadow:none!important} .hxe-document{width:750px!important;max-width:none!important;margin:0!important;padding:0!important;background:#fff!important;color:#1e293b!important;font-family:"Microsoft YaHei","PingFang SC",Arial,sans-serif!important;font-size:26px!important;line-height:1.85!important;overflow:visible!important}
.hxe-document :where(div,section,article,p,span,li,strong,b,small,a,td,th,label,summary){font-size:inherit!important;line-height:inherit!important;max-height:none!important;overflow:visible!important;text-overflow:clip!important;white-space:normal!important;word-break:normal!important;overflow-wrap:anywhere!important;letter-spacing:normal!important}.hxe-document h1{font-size:42px!important;line-height:1.45!important;margin:16px 0!important}.hxe-document h2{font-size:35px!important;line-height:1.5!important;margin:18px 0 12px!important}.hxe-document h3{font-size:30px!important;line-height:1.5!important;margin:14px 0 10px!important}.hxe-document h4{font-size:28px!important;line-height:1.6!important}.hxe-document p{padding:4px 0!important;margin:12px 0!important}.hxe-document :where(section,article,.card,.section,.kt-panel,.kyc,.prod-card,.mark){height:auto!important;min-height:0!important;max-width:100%!important;position:static!important;margin:16px 0!important;padding:20px!important;border-radius:12px!important;break-inside:avoid}.hxe-document :where(.kt-grid,.kt-contract,.kt-concepts,.key-grid,.target-grid,.grid,.kt-example-grid,.product-grid){display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:14px!important}.hxe-document .kt-value{font-size:39px!important}.hxe-document .kt-stat small,.hxe-document .kt-date{font-size:23px!important}.hxe-document :where(.kt-chain,.timeline,.kt-timeline){display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:10px!important}.hxe-document .kt-arrow{transform:rotate(90deg)!important;text-align:center!important;align-self:center!important}.hxe-document :where(.kt-hero,.hero,header){height:auto!important;min-height:0!important;padding:22px!important;position:static!important}.hxe-document img{max-width:100%!important;height:auto!important;object-fit:contain!important;display:block!important;margin:14px auto!important}.hxe-document svg{max-width:100%!important;height:auto;overflow:visible!important}.hxe-document :where(.kt-source,.kt-note,.meta,.foot,.footer,.note,.disclaimer){font-size:23px!important;line-height:1.85!important;display:block!important}.hxe-document table{min-width:0!important;width:100%!important;border-collapse:collapse!important;font-size:23px!important;table-layout:fixed!important}.hxe-document th,.hxe-document td{padding:12px 8px!important;height:auto!important;line-height:1.8!important;vertical-align:middle!important;text-align:center!important}.hxe-document .hxe-record{border:1px solid #b9cce4;padding:16px!important;background:#f7faff;break-inside:avoid}.hxe-document .hxe-pair{display:grid;grid-template-columns:36% minmax(0,1fr);gap:12px;border-bottom:1px solid #e0e7f1;padding:8px 0}.hxe-document .hxe-pair:last-child{border:0}.hxe-document .hxe-pair strong{color:#234b8e}.hxe-page{padding:26px 30px;background:white;box-sizing:border-box;overflow:visible}.hxe-page-header{border-bottom:2px solid #2146b5;color:#2146b5;padding-bottom:12px;margin-bottom:14px;font-weight:bold;font-size:28px;line-height:1.6}.hxe-page-footer{border-top:1px solid #ced9ea;color:#5b6e86;padding-top:12px;margin-top:16px;font-size:20px;line-height:1.8;overflow-wrap:anywhere}.hxe-document :where(.toc,.toc-nav,nav,.back,.kt-toolbar,.kt-navigation,.pdf-links,.bottom-bar,.toggle-bar,.search-box,.hxe-launch,[data-no-export],button,script,iframe,noscript,input,select,textarea){display:none!important}.hxe-document .hxe-chunk{margin:12px 0}.hxe-document .kt-bar-row{display:grid!important;grid-template-columns:150px minmax(0,1fr) 70px!important;gap:10px!important}.hxe-document .kt-track{overflow:hidden!important}.hxe-document .kt-track,.hxe-document .kt-fill{height:25px!important}.hxe-document details>summary{font-weight:bold;color:#2146b5}.hxe-document details{display:block!important}.hxe-document .hxe-graphic-note{font-size:23px!important;background:#eff5ff;padding:16px!important}
.hxe-document.hxe-wide{width:1280px!important;font-size:28px!important}.hxe-wide :where(.kt-contract,.kt-grid,.key-grid,.target-grid){grid-template-columns:repeat(2,minmax(0,1fr))!important}.hxe-wide .hxe-page{width:1280px!important;height:720px!important;padding:26px 36px!important}.hxe-wide .hxe-page-header{font-size:32px;line-height:1.4;margin:0 0 10px;padding:0 0 8px}.hxe-wide .hxe-page-footer{font-size:18px;line-height:1.5;margin:10px 0 0;padding:8px 0}.hxe-wide .hxe-page-body{min-height:0}.hxe-wide p{margin:8px 0!important}.hxe-wide :where(section,article,.card,.kt-panel){margin:8px 0!important;padding:14px!important}
`;
const pdfEditorialCSS=`
.hxe-document.hxe-mobile-pdf{line-height:1.65!important}
.hxe-document:is(.hxe-mobile-pdf,.hxe-a4-pdf) :where(details,.kt-archive){font-size:inherit!important}
.hxe-document.hxe-mobile-pdf :where(.kt-grid,.key-grid,.target-grid){grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:14px!important}
.hxe-document.hxe-mobile-pdf .kt-stat{padding:18px!important;font-size:24px!important;background:linear-gradient(145deg,#edf4ff,#f5f8fc)!important;border:1px solid #dde7f5!important}
.hxe-document.hxe-mobile-pdf .kt-stat .kt-value{font-size:34px!important;line-height:1.35!important}
.hxe-document.hxe-mobile-pdf .kt-stat .kt-value small{font-size:19px!important}
.hxe-document.hxe-mobile-pdf .kt-date{font-size:18px!important}
.hxe-document.hxe-mobile-pdf .kt-stat p{margin:8px 0!important}
.hxe-document.hxe-mobile-pdf .kt-hero .kt-stat{background:#294c86!important;border-color:#6d8ab3!important}
.hxe-document.hxe-mobile-pdf .kt-hero .kt-stat :is(.kt-value,b,p,.kt-date){color:#fff!important}
.hxe-document.hxe-mobile-pdf .kt-contract{grid-template-columns:repeat(2,minmax(0,1fr))!important;font-size:24px!important}
.hxe-document.hxe-mobile-pdf .kt-timeline{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;font-size:23px!important;gap:12px!important}
.hxe-document.hxe-a4-pdf :where(.kt-grid,.kt-contract,.key-grid,.target-grid){grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:14px!important}
.hxe-document.hxe-a4-pdf .kt-timeline{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important}
.hxe-document.hxe-a4-pdf .kt-date{font-size:17px!important}
.hxe-document:is(.hxe-mobile-pdf,.hxe-a4-pdf) .hxe-page-footer{border:0!important;margin-top:10px!important;padding:0!important;font-size:15px!important;line-height:1.3!important;text-align:right!important;color:#8b98aa!important}
.hxe-document:is(.hxe-mobile-pdf,.hxe-a4-pdf) .hxe-page-header{font-size:23px!important;padding-bottom:8px!important;margin-bottom:12px!important}
.hxe-document:is(.hxe-mobile-pdf,.hxe-a4-pdf) .hxe-appendix{font-size:16px!important;line-height:1.5!important;color:#66758b!important;padding:14px!important;background:#f7f9fc!important;border:1px solid #e1e7ef!important;border-radius:10px!important}
.hxe-document:is(.hxe-mobile-pdf,.hxe-a4-pdf) .hxe-appendix :is(p,div,span,a,strong){font-size:16px!important;line-height:1.5!important;margin:5px 0!important;padding:0!important}
.hxe-document:is(.hxe-mobile-pdf,.hxe-a4-pdf) .hxe-appendix h2{font-size:24px!important;margin:0 0 12px!important}
`;
function collectPDFNotes(clone,doc){
 const appendix=doc.createElement('section');appendix.className='hxe-appendix';appendix.dataset.hxeAppendix='true';
 const heading=doc.createElement('h2');heading.textContent='资料来源与阅读说明';appendix.append(heading);
 const seen=new Set();
 // Move provenance and ancillary notes, not the substantive warnings/period labels in the cards.
 const candidates=[...clone.querySelectorAll('.kt-source,.kt-note,.foot,.footer,.disclaimer')].filter(n=>!n.parentElement.closest('.kt-source,.kt-note,.foot,.footer,.disclaimer'));
 for(const node of candidates){const text=node.textContent.trim();if(!text){node.remove();continue;}if(seen.has(text)){node.remove();continue;}seen.add(text);const p=doc.createElement('p');const module=node.closest('[data-module],section');const title=module?.querySelector('h2,h3')?.textContent.trim();p.textContent=(title?title+'：':'')+text;appendix.append(p);node.remove();}
 const meta=doc.createElement('p');meta.textContent=`新华Hub · ${config.title} · 导出日期 ${date()}。资料版本、适用渠道和数据时点以正文为准；分红不保证，具体以保险合同及公司正式资料为准。`;appendix.append(meta);
 const link=doc.createElement('p');link.textContent='原网页：'+location.href.split('#')[0];appendix.append(link);clone.append(appendix);
}
function guard(root){
 if(root.matches('[data-status="needs_review"],[data-status="missing_source"],[data-status="calculation_pending"]'))throw Error('该内容尚未核验，不允许公开导出');
 const text=root.innerText||root.textContent||'';
 if(/(^|\D)[1-9]\d{5}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx](?!\d)/.test(text)||/(^|\D)1[3-9]\d{9}(?!\d)/.test(text)||root.querySelector('[data-private],[data-customer-sensitive]'))throw Error('检测到疑似个人敏感信息，已阻止导出，请先脱敏审核');
}
async function stage(mode,selector){
 await waitReady();const source=document.querySelector(selector||config.root);if(!source)throw Error('找不到已审核正文，不导出空白文件');guard(source);
 if(config.company)await loadScript('assets/js/company-export.js',()=>!!window.HubCompanyExport);
 const iframe=el('iframe');iframe.title='专用导出排版';iframe.style.cssText='position:absolute;left:-20000px;top:0;border:0;width:1400px;height:1600px;pointer-events:none';document.body.append(iframe);frame=iframe;
 const doc=iframe.contentDocument;doc.open();doc.write('<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"></head><body></body></html>');doc.close();const base=doc.createElement('base');base.href=location.href;doc.head.append(base);
 const pending=[];document.querySelectorAll('link[rel="stylesheet"],style').forEach(s=>{if(s.tagName==='LINK'){const c=s.cloneNode(true);c.href=s.href;pending.push(new Promise((r,j)=>{c.onload=r;c.onerror=()=>j(Error('页面样式未加载完成，已停止导出'))}));doc.head.append(c)}else doc.head.append(s.cloneNode(true))});await deadline(Promise.all(pending),'导出样式加载超时，请检查网络');
 const css=doc.createElement('style');css.textContent=exportCSS+(mode.includes('pdf')?pdfEditorialCSS:'')+(config.company?window.HubCompanyExport.css:'');doc.head.append(css);
 const root=doc.createElement('div');root.className='hxe-document knowledge '+(mode==='pptx'?'hxe-wide':mode==='mobile-pdf'?'hxe-mobile-pdf':mode==='a4-pdf'?'hxe-a4-pdf':'');doc.body.append(root);
 root.dataset.density=densitySelector?.value||'2';
 const clone=source.cloneNode(true);clone.removeAttribute('hidden');clone.classList.remove('kt-style-compact');if(config.exclude&&(!selector||selector===config.root)){clone.querySelectorAll(config.exclude).forEach(n=>n.replaceWith(el('p','hxe-graphic-note','导出范围说明：其他保险公司的逐产品披露明细不在本次核心正文内。请返回网页筛选产品后，单独导出当前查询结果。')));}clone.querySelectorAll('[hidden],.hxe-launch,.hxe-overlay,[data-no-export],.kt-query,.kt-toolbar,nav,.toc,.toc-nav,.back,form,button,script,iframe,noscript,.toast,[data-status="needs_review"],[data-status="missing_source"],[data-status="calculation_pending"]').forEach(n=>n.remove());
 const sourceCanvas=[...source.querySelectorAll('canvas')],canvasClones=[...clone.querySelectorAll('canvas')];for(let i=0;i<sourceCanvas.length;i++){const c=sourceCanvas[i];if(!c.width||!c.height)throw Error('图表尚未完成渲染');let image;try{image=c.toDataURL('image/png')}catch{throw Error('图表含跨域或受限资源，不能安全导出')};const img=doc.createElement('img');img.src=image;img.alt=c.getAttribute('aria-label')||'原网页图表';img.width=c.width;canvasClones[i]?.replaceWith(img);}
 if(source.matches('.wrap')){const originalHeader=document.querySelector('body>header,body>.header');if(originalHeader&&!source.contains(originalHeader)){guard(originalHeader);const c=originalHeader.cloneNode(true);c.querySelectorAll('.back,button,a').forEach(n=>n.remove());clone.prepend(c);}}
 clone.querySelectorAll('*').forEach(n=>[...n.attributes].forEach(a=>{if(/^on/i.test(a.name))n.removeAttribute(a.name)}));clone.querySelectorAll('details').forEach(d=>d.open=true);clone.querySelectorAll('img').forEach(img=>{img.loading='eager';img.src=new URL(img.getAttribute('src'),location.href).href;});
 clone.querySelectorAll('a[href]').forEach(a=>{a.href=new URL(a.getAttribute('href'),location.href).href;});root.append(clone);
 await deadline(doc.fonts.ready,'导出字体加载超时');await deadline(Promise.all([...root.querySelectorAll('img')].map(loadImage)),'图片未完整加载，已停止导出');
 transformTables(clone,doc);let companyBaseline;if(config.company){root.classList.add('hxe-company');await deadline(Promise.all([doc.fonts.load('25px HubExportSans'),doc.fonts.load('700 25px HubExportSans')]).catch(()=>{throw Error('中文字体加载失败，请检查网络后重试；未生成缺字文件');}),'中文字体加载失败，未生成缺字文件');await deadline(doc.fonts.ready,'中文字体尚未准备完成');companyBaseline=window.HubCompanyExport.prepare(clone,doc);}else if(mode.includes('pdf'))collectPDFNotes(clone,doc);await new Promise(r=>setTimeout(r,80));return {doc,root,clone,companyBaseline};
}
function gridRows(rows){const grid=[];rows.forEach((row,y)=>{grid[y]??=[];let x=0;for(const cell of row.cells){while(grid[y][x])x++;for(let yy=y;yy<y+cell.rowSpan;yy++){grid[yy]??=[];for(let xx=x;xx<x+cell.colSpan;xx++)grid[yy][xx]=cell;}x+=cell.colSpan;}});return grid;}
function transformTables(clone,doc){for(const table of [...clone.querySelectorAll('table')]){
 const headerRows=[...table.querySelectorAll('thead tr')],all=[...table.rows],heads=gridRows(headerRows.length?headerRows:all.slice(0,1));const count=Math.max(0,...heads.map(r=>r.length),...all.map(r=>[...r.cells].reduce((n,c)=>n+c.colSpan,0)));if(count<=4)continue;
 const box=el('div','hxe-table-records');box.append(el('p','hxe-graphic-note','为手机阅读，以下表格按原始行展开；数据及口径与网页一致。'));
 const dataRows=headerRows.length?all.filter(r=>!headerRows.includes(r)):all.slice(1),grid=gridRows(dataRows);
 grid.forEach((row,index)=>{const card=el('article','hxe-record');card.append(el('h3','',`表格记录 ${index+1}`));row.forEach((cell,col)=>{const pair=el('div','hxe-pair'),names=[...new Set(heads.map(h=>h[col]?.textContent.trim()).filter(Boolean))];pair.append(el('strong','',names.join(' / ')||`原表第${col+1}列`));const value=el('div');value.innerHTML=cell.innerHTML;pair.append(value);card.append(pair)});box.append(card)});table.replaceWith(box);
 }}
function normalize(root){root.querySelectorAll('p').forEach(p=>{if(p.textContent.length>450&&!p.querySelector('img,svg,table')){const chars=[...p.textContent],fragment=p.ownerDocument.createDocumentFragment();for(let i=0;i<chars.length;i+=220){const part=p.cloneNode(false);part.textContent=chars.slice(i,i+220).join('');fragment.append(part)}p.replaceWith(fragment)}});}
function atoms(stage,limit){
 normalize(stage.clone);const result=[];let context=config.title;
 function visit(node){if(node.nodeType===3){if(!node.textContent.trim())return;const p=stage.doc.createElement('p');p.textContent=node.textContent;result.push({node:p,context});return}if(node.nodeType!==1||getComputedStyleSafe(node).display==='none')return;
  const heading=node.matches('h1,h2,h3,summary')?node.textContent.trim():node.querySelector(':scope > h2,:scope > h3,:scope > summary,:scope > section > h2')?.textContent.trim();if(heading)context=heading;
  const h=node.getBoundingClientRect().height;if(h<=limit||node.matches('[data-hxe-appendix]')){result.push({node:node.cloneNode(true),context});return;}
  if(stage.root.classList.contains('hxe-mobile-pdf')&&node.matches('.kt-grid,.key-grid,.target-grid')&&node.children.length>2){for(let i=0;i<node.children.length;i+=2){const row=node.cloneNode(false);row.append(...[...node.children].slice(i,i+2).map(n=>n.cloneNode(true)));result.push({node:row,context});}return;}
  if(node.matches('img,svg'))throw Error('一个图表或原始图片超过当前版式单页容量。请选择PNG，或先拆解该图表；不会缩小或截断它。');
  if(node.tagName==='TABLE'){const rows=[...node.querySelectorAll('tbody tr')];if(!rows.length)throw Error('表格过长且无法识别完整行');for(const[index,row]of rows.entries()){const t=node.cloneNode(false);const head=node.querySelector('thead');if(head){const h=head.cloneNode(true);if(index)h.dataset.hxeRepeated='true';t.append(h);}const body=stage.doc.createElement('tbody');body.append(row.cloneNode(true));t.append(body);result.push({node:t,context});}return;}
  const kids=[...node.childNodes];if(!kids.length)throw Error('内容块过高，无法安全分页');for(const child of kids)visit(child);
 }
 [...stage.clone.childNodes].forEach(visit);if(!result.length)throw Error('正文为空，未生成导出文件');return result;
}
function getComputedStyleSafe(e){return e.ownerDocument.defaultView.getComputedStyle(e)}
function footer(doc,index,mode){const f=doc.createElement('div');f.className='hxe-page-footer';if(config.company||mode.includes('pdf')||mode==='print'){f.hidden=true;return f;}f.textContent=mode==='pptx'?`新华Hub · ${date()} · 第${index}页 / 段 · 版本、渠道及来源见正文，分红不保证。`:`新华Hub · 导出日期 ${date()} · 第${index}页 / 段\n${location.href.split('#')[0]}\n资料版本、适用渠道及来源见正文；分红不保证，具体以保险合同及公司正式资料为准。`;return f;}
function paginate(stage,mode){
 if(config.company)return window.HubCompanyExport.paginate(stage,mode);
 const norm=s=>s.replace(/\s+/g,'');const expectedText=norm(stage.clone.innerText);
 const max=mode==='pptx'?720:mode==='mobile-pdf'?1334:mode==='a4-pdf'?1060:1600;
 const limit=mode==='pptx'?470:mode.includes('pdf')?max-150:max-270,items=atoms(stage,limit),pages=[];stage.clone.remove();let page,body,head,foot;
 function fresh(context){page=stage.doc.createElement('section');page.className='hxe-page';head=el('div','hxe-page-header',context||config.title);body=el('div','hxe-page-body');foot=footer(stage.doc,pages.length+1,mode);page.append(head,body,foot);stage.root.append(page);pages.push(page);}
 const overflows=()=>mode==='pptx'?foot.getBoundingClientRect().bottom-page.getBoundingClientRect().top>650:page.scrollHeight>max;
 const queue=[...items];while(queue.length){const item=queue.shift();abort();if(!page)fresh(item.context);else if(item.node.nodeType===1&&item.node.matches('[data-hxe-appendix]')&&body.children.length)fresh('资料来源与阅读说明');else if(mode==='pptx'&&head.textContent!==item.context&&body.children.length){const headingOnly=[...body.children].every(n=>n.matches('h1,h2,h3,h4,summary,.kt-kicker'));if(headingOnly)head.textContent=item.context;else fresh(item.context);}body.append(item.node);
  if(mode.includes('pdf')){const first=body.firstElementChild;const title=first?.matches('h1,h2,h3')?first:first?.querySelector('h1,h2,h3');head.hidden=!!title&&title.textContent.trim()===head.textContent.trim();}
  if(item.node.nodeType===1&&item.node.matches('h1,h2,h3,h4,summary,.kt-kicker')&&body.children.length>1&&queue[0]){const probe=queue[0].node.cloneNode(true);body.append(probe);const bad=overflows();probe.remove();if(bad){item.node.remove();fresh(item.context);body.append(item.node);}}
  if(overflows()){item.node.remove();const headingOnly=mode.includes('pdf')&&[...body.children].every(n=>n.matches('h1,h2,h3,h4,summary,.kt-kicker'));if(body.children.length&&!headingOnly){fresh(item.context);body.append(item.node);}else body.append(item.node);
   if(overflows()){item.node.remove();const n=item.node;let parts=[];
    if(n.nodeType===1&&n.matches('img,svg'))throw Error('单个图表超过此格式容量，已停止；可改用PNG，不会裁切图表。');
    if(n.nodeType===1&&n.tagName==='TABLE'){const rows=[...n.querySelectorAll('tbody tr')];if(rows.length<2)throw Error('单个表格行超过单页容量，请改用PNG');parts=rows.map((row,index)=>{const t=n.cloneNode(false),h=n.querySelector('thead'),b=stage.doc.createElement('tbody');if(h){const repeat=h.cloneNode(true);if(index)repeat.dataset.hxeRepeated='true';t.append(repeat);}b.append(row.cloneNode(true));t.append(b);return t;});}
    else if(n.nodeType===1&&n.matches('p,li')&&n.textContent.length>100&&!n.querySelector('img,svg')){const chars=[...n.textContent];for(let i=0;i<chars.length;i+=100){const p=stage.doc.createElement('p');p.textContent=chars.slice(i,i+100).join('');parts.push(p);}}
    else parts=[...n.childNodes].filter(c=>c.nodeType===1||c.textContent.trim()).map(c=>{if(c.nodeType===3){const p=stage.doc.createElement('p');p.textContent=c.textContent;return p}return c.cloneNode(true)});
    if(!parts.length||(parts.length===1&&parts[0].textContent===n.textContent&&n.childNodes.length===0))throw Error('内容不能安全分页，已停止而未裁切');queue.unshift(...parts.map(node=>({node,context:item.context})));
   }
  }
 }
 for(const p of [...pages]){const content=p.querySelector('.hxe-page-body');if(!content.innerText.trim()&&!content.querySelector('img,svg,canvas')){p.remove();pages.splice(pages.indexOf(p),1);}}
 if(pages.length>80)throw Error('当前内容超过80页/段。请先选择单一主题或缩小查询范围后导出。');
 for(let i=0;i<pages.length;i++){pages[i].querySelector('.hxe-page-footer').textContent=footer(stage.doc,i+1,mode).textContent.replace(`第${i+1}页 / 段`,`第${i+1}/${pages.length}页 / 段`);}
 const repeats=pages.flatMap(p=>[...p.querySelectorAll('[data-hxe-repeated]')]);repeats.forEach(h=>h.style.setProperty('display','none','important'));const actualText=norm(pages.map(p=>p.querySelector('.hxe-page-body').innerText).join(''));repeats.forEach(h=>h.style.removeProperty('display'));if(expectedText!==actualText){let first=0;while(expectedText[first]===actualText[first]&&first<expectedText.length)first++;window.HubContentExport.lastIntegrity={expected:expectedText.length,actual:actualText.length,first};throw Error('内容完整性核对失败：分页前后文字不一致，已停止生成，未发布残缺文件。');}
 if(mode.includes('pdf'))window.HubContentExport.lastPDFLayout={pages:pages.map(p=>({footer:p.querySelector('.hxe-page-footer').textContent,appendix:!!p.querySelector('[data-hxe-appendix]'),inlineNotes:p.querySelectorAll('.hxe-page-body .kt-source,.hxe-page-body .kt-note').length,grids:p.querySelectorAll('.hxe-page-body .kt-grid,.hxe-page-body .kt-contract').length})),heroStats:[...stage.root.querySelectorAll('.kt-hero .kt-stat')].map(n=>({background:getComputedStyleSafe(n).backgroundColor,color:getComputedStyleSafe(n.querySelector('.kt-value')).color}))};
 return pages;
}
async function rasterCompanySVG(page,scale){
 if(!config.company)return;
 const svgs=[...page.querySelectorAll('svg')];if(!svgs.length)return;
 svgFontCSS??=Promise.all(['Regular','Bold'].map(async(style,i)=>{const r=await fetch(url('assets/vendor/export/HubExportSans-'+style+'.ttf'));if(!r.ok)throw Error('关系图字体未完整加载');const bytes=new Uint8Array(await r.arrayBuffer());let text='';for(let j=0;j<bytes.length;j+=32768)text+=String.fromCharCode(...bytes.subarray(j,j+32768));return `@font-face{font-family:HubExportSans;font-weight:${i?700:400};src:url(data:font/ttf;base64,${btoa(text)})}`;})).then(a=>a.join(''));
 for(const svg of svgs){const rect=svg.getBoundingClientRect(),copy=svg.cloneNode(true),vb=svg.viewBox.baseVal;copy.removeAttribute('class');copy.removeAttribute('style');copy.setAttribute('xmlns','http://www.w3.org/2000/svg');copy.setAttribute('width',String(Math.ceil(vb.width*scale)));copy.setAttribute('height',String(Math.ceil(vb.height*scale)));const style=svg.ownerDocument.createElementNS('http://www.w3.org/2000/svg','style');style.textContent=await svgFontCSS;copy.prepend(style);const blob=new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml;charset=utf-8'}),src=URL.createObjectURL(blob);temporaryURLs.push(src);const img=svg.ownerDocument.createElement('img');img.src=src;img.alt=svg.getAttribute('aria-label')||'完整股东关系图';img.className=svg.getAttribute('class')||'';img.style.cssText=`display:block!important;width:${rect.width}px!important;height:${rect.height}px!important;margin:0 auto!important`;await img.decode();svg.replaceWith(img);}
}
async function render(page,mode){abort();const width=mode==='pptx'?1280:750,height=mode==='pptx'?720:Math.ceil(Math.max(page.scrollHeight,page.getBoundingClientRect().height));if(mode==='pptx'&&page.scrollHeight>720)throw Error('幻灯片内容超出版式，已停止，未拉伸或裁切');const scale=mode==='png'?Number(densitySelector?.value||2):mode==='pptx'?2:1.5;if(width*height*scale*scale>9000000)throw Error('该段超出高清画布安全上限，请选择2倍高清或缩小导出范围；未降低倍率冒充高清。');await rasterCompanySVG(page,scale);const canvas=await html2canvas(page,{scale,backgroundColor:'#fff',logging:false,useCORS:true,allowTaint:false,width,height,windowWidth:1400,scrollX:0,scrollY:0});if(!canvas.width||!canvas.height)throw Error('画布为空，未生成文件');return canvas;}
async function blobOf(canvas,type='image/png'){const b=await new Promise(r=>canvas.toBlob(r,type,type==='image/jpeg'?0.94:undefined));if(!b||b.size<100)throw Error('图片编码失败，未生成文件');return b;}
function clearArtifacts(){for(const a of artifacts)if(a.url)URL.revokeObjectURL(a.url);artifacts=[];}
async function generate(mode){
 if(active)return;active=true;cancelled=false;clearArtifacts();result.replaceChildren();error.textContent='';setBusy(true);try{
  progress.textContent='正在载入字体、正文和图表…';await loadScript('html2canvas.min.js',()=>typeof window.html2canvas==='function');
  if(mode.includes('pdf'))await loadScript('assets/vendor/export/jspdf.umd.min.js',()=>!!window.jspdf?.jsPDF);
  if(mode==='pptx')await loadScript('assets/vendor/export/pptxgen.bundle.js',()=>typeof window.PptxGenJS==='function');
  const st=await stage(mode,scopeSelector?.value||config.root),pages=paginate(st,mode);let pdf,ppt,vectorAudit;
  if(mode.includes('pdf')){if(config.company){await loadScript('assets/vendor/export/svg2pdf.umd.min.js',()=>!!window.jspdf.jsPDF.API.svg);await loadScript('assets/js/vector-pdf.js',()=>!!window.HubVectorPDF);}const mobile=mode==='mobile-pdf';pdf=new jspdf.jsPDF({orientation:'portrait',unit:'mm',format:mobile?[108,192]:'a4',compress:true});pdf.setProperties({title:config.title,subject:config.company?'可选中文文本与矢量图形':'高清图像版；可选文字版本请使用打印预览',creator:'新华Hub统一内容导出'});if(config.company)vectorAudit=await HubVectorPDF.setup(pdf);}
  if(mode==='pptx'){ppt=new PptxGenJS();ppt.layout='LAYOUT_WIDE';ppt.author='新华Hub';ppt.subject='视觉型演示文稿，正文为高清图像，非逐元素可编辑版';ppt.title=config.title;ppt.lang='zh-CN';}
  for(let i=0;i<pages.length;i++){abort();progress.textContent=`正在生成 ${i+1}/${pages.length} ${mode==='pptx'?'张幻灯片':'页 / 段'}…`;
   if(vectorAudit){const margin=mode==='mobile-pdf'?4:6,h=Math.ceil(pages[i].scrollHeight);if(mode==='mobile-pdf'){const height=Math.max(108,h/750*100+8);if(!i)pdf.deletePage(1);pdf.addPage([108,height],'portrait');}else if(i)pdf.addPage();await HubVectorPDF.page(pdf,pages[i],margin,vectorAudit);continue;}
   const pageText=pages[i].innerText,canvas=await render(pages[i],mode);
   if(mode==='png')artifacts.push({name:filename(pages.length>1?String(i+1).padStart(2,'0'):null,'png'),blob:await blobOf(canvas),width:canvas.width,height:canvas.height});
   else if(pdf){if(i)pdf.addPage();const margin=mode==='mobile-pdf'?4:6,w=pdf.internal.pageSize.getWidth(),h=canvas.height/canvas.width*(w-margin*2);if(h>pdf.internal.pageSize.getHeight()-margin*2+0.02)throw Error('PDF排版超出页面，已停止，未缩小文字');pdf.addImage(canvas.toDataURL('image/jpeg',0.94),'JPEG',margin,margin,w-margin*2,h,undefined,'FAST');}
   else{const slide=ppt.addSlide();slide.background={color:'FFFFFF'};slide.addImage({data:canvas.toDataURL('image/png'),x:0,y:0,w:13.333333,h:7.5});slide.addNotes(pageText+'\n来源页面：'+location.href.split('#')[0]+'\n视觉型PPTX：正文图像，不是逐元素可编辑版本。');}
   canvas.width=1;canvas.height=1;
  }
  if(pdf)artifacts.push({name:filename((mode==='mobile-pdf'?'手机阅读版':'A4正式版')+(config.company?'-可搜索矢量':'-图像型'),'pdf'),blob:pdf.output('blob')});
  if(ppt)artifacts.push({name:filename('16比9视觉型','pptx'),blob:await ppt.write({outputType:'blob'})});
  abort();progress.textContent=`已生成 ${artifacts.length} 个文件。请点击下载/查看；浏览器没有确认前，不表示已保存到相册或磁盘。`;showArtifacts();
 }catch(e){clearArtifacts();result.replaceChildren();error.textContent=e.message||'导出失败，未生成可用文件';progress.textContent='本次未完成，未标记为保存成功。';}
 finally{frame?.remove();frame=null;temporaryURLs.forEach(u=>URL.revokeObjectURL(u));temporaryURLs=[];active=false;setBusy(false);}
}
function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0;}
async function zipFiles(files){
 const chunks=[],central=[];let offset=0;
 const [year,month,day]=date().split('-').map(Number),dosDate=((year-1980)<<9)|(month<<5)|day;
 for(const f of files){
  const bytes=new Uint8Array(await f.blob.arrayBuffer()),name=new TextEncoder().encode(f.name),crc=crc32(bytes);
  const local=new Uint8Array(30+name.length),v=new DataView(local.buffer);
  v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);
  v.setUint16(12,dosDate,true);v.setUint32(14,crc,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,name.length,true);local.set(name,30);chunks.push(local,bytes);
  const record=new Uint8Array(46+name.length),d=new DataView(record.buffer);
  d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x800,true);
  d.setUint16(14,dosDate,true);d.setUint32(16,crc,true);d.setUint32(20,bytes.length,true);d.setUint32(24,bytes.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);record.set(name,46);central.push(record);offset+=local.length+bytes.length;
 }
 const size=central.reduce((n,c)=>n+c.length,0),end=new Uint8Array(22),e=new DataView(end.buffer);
 e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,size,true);e.setUint32(16,offset,true);
 return new Blob([...chunks,...central,end],{type:'application/zip'});
}
function showArtifacts(){
 if(artifacts.length>1){const all=el('button','','下载全部连续图片（ZIP）');all.onclick=async()=>{all.disabled=true;try{const blob=await zipFiles(artifacts),a=el('a','hxe-link','点击保存完整ZIP');a.href=URL.createObjectURL(blob);a.download=filename('连续高清图片','zip');artifacts.push({name:a.download,blob,url:a.href,archive:true});all.replaceWith(a)}catch(e){error.textContent='打包失败：'+e.message}finally{all.disabled=false}};result.append(all);}
 artifacts.forEach((a,i)=>{a.url=URL.createObjectURL(a.blob);const card=el('div','hxe-artifact');card.append(el('strong','',a.name),el('p','hxe-help',`${(a.blob.size/1024/1024).toFixed(2)} MB${a.width?' · '+a.width+'×'+a.height:''}`));const download=el('a','hxe-link','下载文件');download.href=a.url;download.download=a.name;card.append(download);const open=el('a','hxe-link',a.name.endsWith('.png')?'查看高清图 / 长按保存':'新窗口查看');open.href=a.url;open.target='_blank';open.rel='noopener';card.append(open);
  if(a.name.endsWith('.png')){const img=el('img');img.alt=`第${i+1}段高清导出预览`;img.loading='lazy';img.decoding='async';if(i<2){img.src=a.url;card.append(img);}else{const details=el('details'),summary=el('summary','','展开本段预览（按需加载，节省手机内存）');details.append(summary,img);details.ontoggle=()=>{if(details.open)img.src=a.url;else img.removeAttribute('src')};card.append(details);}}
  const file=new File([a.blob],a.name,{type:a.blob.type});if(navigator.canShare?.({files:[file]})){const share=el('button','','系统分享');share.onclick=async()=>{try{await navigator.share({files:[file],title:config.title})}catch(e){if(e.name!=='AbortError')error.textContent='系统分享不可用，请使用查看或下载按钮'}};card.append(share);}result.append(card);});
}
function setBusy(on){options.querySelectorAll('button').forEach(b=>b.disabled=on);print.disabled=on;scopeSelector&&(scopeSelector.disabled=on);densitySelector&&(densitySelector.disabled=on);cancel.hidden=!on;}
async function printPreview(){
 if(active)return;const popup=window.open('about:blank','_blank');if(!popup){error.textContent='打印窗口被拦截，请允许弹出窗口后重试';return;}active=true;cancelled=false;setBusy(true);popup.document.body.textContent='正在生成可选文字打印版…';
 try{const st=await stage('a4-pdf',scopeSelector?.value||config.root);normalize(st.clone);st.root.append(footer(st.doc,1,'print'));const d=popup.document;d.open();d.write('<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"></head><body></body></html>');d.close();d.title=filename('可选文字打印版','pdf');
  [...st.doc.head.querySelectorAll('style,link,base')].forEach(n=>d.head.append(n.cloneNode(true)));const css=d.createElement('style');css.textContent='@page{size:A4 portrait;margin:16mm} .hxe-document{width:100%!important}.hxe-document.hxe-a4-pdf{font-size:12pt!important} .hxe-document.hxe-a4-pdf h1{font-size:22pt!important}.hxe-document.hxe-a4-pdf h2{font-size:18pt!important}.hxe-document.hxe-a4-pdf h3{font-size:15pt!important}.hxe-document section{break-inside:auto!important}.hxe-document :where(article,tr,.hxe-record,svg,img){break-inside:avoid!important}.hxe-document.hxe-a4-pdf table{font-size:11pt!important}@media print{#hxe-print-control{display:none!important}}';d.head.append(css);
  const button=d.createElement('button');button.id='hxe-print-control';button.textContent='打印 / 另存为PDF（可选择文字）';button.style.cssText='padding:14px;margin:16px;font-size:16px';button.onclick=()=>popup.print();d.body.append(button,st.root.cloneNode(true));await deadline(d.fonts.ready,'打印字体加载超时');await deadline(Promise.all([...d.images].map(i=>i.decode())),'打印图片未完整加载');popup.focus();
 }catch(e){popup.document.body.textContent='打印版准备失败：'+e.message;error.textContent=e.message}finally{frame?.remove();frame=null;temporaryURLs.forEach(u=>URL.revokeObjectURL(u));temporaryURLs=[];active=false;setBusy(false);}
}
const launch=el('div','hxe-launch'),button=el('button','','下载 / 导出');button.type='button';launch.append(el('span','hxe-toolbar-title','保存整篇或选择模块'),button);
const overlay=el('div','hxe-overlay');overlay.hidden=true;const modal=el('section','hxe-modal');modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','导出与分享');const close=el('button','hxe-close','×');close.setAttribute('aria-label','关闭导出菜单');close.onclick=()=>{if(active){cancelled=true;return}overlay.hidden=true;button.focus()};modal.append(close,el('h2','','导出 / 分享'));
modal.append(el('p','hxe-help',config.company?'保留完整正文、图表和来源。中文PDF可选择、搜索，关系图与柱状图保留矢量；PNG按所选像素密度安全分段。':'使用专用排版，保留正文、风险提示和来源。PNG默认2倍高清并按段编号。此页PDF仍为高清图像型，需要选择正文文字时请使用下方打印版。'));
if(config.note)modal.append(el('p','hxe-help',config.note));
if(config.scopes){scopeSelector=el('select');scopeSelector.setAttribute('aria-label','导出主题');modal.append(scopeSelector);}
const options=el('div','hxe-options');const formats=config.formats||['png','mobile-pdf','a4-pdf','pptx'];const labels={png:['高清长图 PNG','超长内容按段编号，可打包下载'],'mobile-pdf':['手机阅读版 PDF','竖屏单列 · 高清图像型'],'a4-pdf':['A4 正式 PDF','统一边距 · 高清图像型'],pptx:['16:9 演示版 PPTX','视觉型试用 · PowerPoint/WPS实机待验收']};for(const mode of formats){const b=el('button','',labels[mode][0]);b.dataset.format=mode;b.append(el('small','',labels[mode][1]));b.onclick=()=>generate(mode);options.append(b)}modal.append(options);
if(config.company)for(const mode of ['mobile-pdf','a4-pdf']){const b=options.querySelector(`[data-format="${mode}"]`);b.firstChild.textContent=mode==='mobile-pdf'?'手机阅读版 PDF':'A4 正式 PDF';b.querySelector('small').textContent='可选中文与矢量图形 · 完整正文';}
densitySelector=el('select');densitySelector.setAttribute('aria-label','PNG清晰度');for(const[value,label]of [['2','2倍高清（默认，兼顾体积与内存）'],...(config.company?[['3','3倍超清（更大文件，自动安全分段）']]:[])]){const option=el('option','',label);option.value=value;densitySelector.append(option);}const densityLabel=el('label','hxe-density','PNG清晰度');densityLabel.append(densitySelector);modal.insertBefore(densityLabel,options);
const print=el('button','','可选文字打印版 / 另存PDF');print.onclick=printPreview;if(formats.includes('a4-pdf'))modal.append(print);
const progress=el('p','hxe-progress');progress.setAttribute('role','status');const error=el('p','hxe-error');error.setAttribute('role','alert');const cancel=el('button','hxe-cancel','取消本次生成');cancel.hidden=true;cancel.onclick=()=>{cancelled=true};const result=el('div','hxe-results');modal.append(progress,error,cancel,result,el('p','hxe-help',/MicroMessenger/i.test(navigator.userAgent)?'微信内置浏览器可能限制下载：请查看高清图后长按保存，或在浏览器中打开。系统分享仅在浏览器实际支持时显示。':'若手机没有弹出保存窗口，请点击查看，使用浏览器保存/分享。系统分享仅在实际支持时显示。'));overlay.append(modal);
function init(){const target=document.querySelector(config.root);if(!target)return;document.body.prepend(launch);document.body.append(overlay);button.onclick=()=>{overlay.hidden=false;error.textContent='';if(scopeSelector){scopeSelector.replaceChildren();const all=el('option','','整页核心正文');all.value=config.root;scopeSelector.append(all);document.querySelectorAll('#company-content [data-module],main > section[id],#official-results').forEach(n=>{const name=n.querySelector('h2,h3')?.textContent;if(!name)return;const o=el('option','',n.id==='official-results'?'当前其他公司查询结果':name);o.value='#'+n.id;scopeSelector.append(o)})}close.focus()};overlay.addEventListener('keydown',e=>{if(e.key==='Escape')close.click();if(e.key==='Tab'){const f=[...modal.querySelectorAll('button,a,select')].filter(n=>!n.disabled&&!n.hidden&&n.getClientRects().length);if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f.at(-1)?.focus()}else if(!e.shiftKey&&document.activeElement===f.at(-1)){e.preventDefault();f[0]?.focus()}}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
if(config.company)document.addEventListener('click',e=>{if(e.target.closest?.('#download-company')){e.preventDefault();e.stopImmediatePropagation();button.click();generate('png');}},true);
window.HubContentExport={version:'1.2.0',registry,generate,printPreview};
})();
