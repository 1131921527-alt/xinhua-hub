(function(){
'use strict';
// Faithful company brochure: reuse the live approved DOM, never summarize or recalculate it.
const css=`
@font-face{font-family:HubExportSans;src:url('assets/vendor/export/HubExportSans-Regular.ttf') format('truetype');font-weight:400;font-display:block}
@font-face{font-family:HubExportSans;src:url('assets/vendor/export/HubExportSans-Bold.ttf') format('truetype');font-weight:700;font-display:block}
.hxe-document.hxe-company{font-size:25px!important;line-height:1.65!important;color:#20334d!important}
.hxe-document.hxe-company{font-family:HubExportSans,"Microsoft YaHei",sans-serif!important}
.hxe-company .kt-equity-figure{margin:16px 0!important;padding:14px!important;background:#f7faff!important}
.hxe-company .kt-equity-svg{width:100%!important;height:auto!important}
.hxe-company .kt-equity-figure figcaption{font-size:18px!important;line-height:1.5!important;color:#61758e!important}
.hxe-company .hxe-page{padding:24px 28px!important;margin:0!important;border:0!important;border-radius:0!important;background:#fff!important}
.hxe-company .hxe-page-body{display:flow-root!important}
.hxe-company :where(.kt-panel,.kt-hero){margin:0 0 18px!important;padding:22px!important;box-shadow:none!important}
.hxe-company .kt-panel{border:1px solid #d9e4f0!important;border-radius:14px!important}
.hxe-company :where(h1,h2,h3,h4){color:#2149a4!important;line-height:1.4!important}
.hxe-company h1{font-size:40px!important;margin:4px 0 14px!important}
.hxe-company h2{font-size:32px!important;margin:4px 0 16px!important}
.hxe-company h3{font-size:27px!important;margin:16px 0 12px!important}
.hxe-company p{margin:10px 0!important;padding:0!important}
.hxe-company .kt-intro{font-size:25px!important;line-height:1.65!important;color:#53657e!important;max-width:none!important}
.hxe-company :where(.kt-grid,.kt-contract){display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:14px!important}
.hxe-company .kt-grid{margin:14px 0!important}
.hxe-company .kt-stat{background:#eff5fc!important;border:1px solid #dce7f4!important;border-radius:12px!important;padding:18px!important;font-size:23px!important;margin:0!important;min-width:0!important}
.hxe-company .kt-stat .kt-value{font-size:35px!important;line-height:1.3!important;color:#234aa8!important;white-space:nowrap!important;overflow-wrap:normal!important}
.hxe-company .kt-stat .kt-value small{font-size:18px!important}
.hxe-company .kt-stat b{font-size:23px!important;margin:8px 0!important;line-height:1.4!important}
.hxe-company .kt-stat p{font-size:22px!important;line-height:1.55!important;color:#526780!important}
.hxe-company .kt-date{font-size:18px!important;color:#6f8198!important;margin-top:10px!important}
.hxe-company .kt-hero{background:linear-gradient(125deg,#173467,#2859a8)!important;color:white!important;border-radius:15px!important}
.hxe-company .kt-hero :is(h1,p,.kt-kicker){color:white!important}
.hxe-company .kt-hero .kt-stat{background:#2c528c!important;border:1px solid #7391ba!important}
.hxe-company .kt-hero .kt-stat :is(.kt-value,b,p,.kt-date){color:white!important}
.hxe-company .kt-kicker{font-size:17px!important;line-height:1.5!important;color:#71839c!important;margin-bottom:8px!important}
.hxe-company .kt-contract>div{border:1px solid #d5e2f1!important;border-radius:10px!important;padding:16px!important;font-size:22px!important;line-height:1.55!important;background:#fff!important}
.hxe-company .kt-contract strong{color:#264d96!important}
.hxe-company .kt-contract p{margin:8px 0 0!important}
.hxe-company .kt-timeline{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important;margin:20px 0!important;font-size:22px!important}
.hxe-company .kt-event{padding:14px 8px!important;border-top:3px solid #9ab7dc!important}
.hxe-company .kt-event strong{font-size:30px!important;line-height:1.3!important}
.hxe-company .kt-chain{display:flex!important;flex-direction:column!important;gap:8px!important;margin:18px 0!important}
.hxe-company .kt-node{padding:17px!important;background:#edf4fd!important;border:1px solid #c7d9ef!important;font-size:22px!important;border-radius:10px!important}
.hxe-company .kt-node b{font-size:25px!important;line-height:1.45!important}
.hxe-company .kt-node span{line-height:1.55!important}
.hxe-company .kt-arrow{display:block!important;width:28px!important;height:26px!important;line-height:26px!important;margin:0 auto!important;transform:rotate(90deg)!important;font-size:25px!important}
.hxe-company .kt-bars{margin:16px 0!important}
.hxe-company .kt-bar-row{display:grid!important;grid-template-columns:194px minmax(0,1fr) 95px!important;gap:12px!important;align-items:center!important;font-size:22px!important;line-height:1.45!important;margin:14px 0!important}
.hxe-company .kt-track,.hxe-company .kt-fill{height:23px!important;border-radius:4px!important}
.hxe-company .kt-bar-row>b{white-space:nowrap!important}
.hxe-company .kt-warning{font-size:22px!important;line-height:1.6!important;padding:16px!important;margin:16px 0!important;border-left:4px solid #bf8b38!important;background:#fff7e9!important;color:#7a5726!important}
.hxe-company .kt-note{font-size:19px!important;line-height:1.6!important;color:#65768c!important;margin:12px 0!important}
.hxe-company .kt-source{font-size:16px!important;line-height:1.5!important;color:#718096!important;margin:5px 0!important}
.hxe-company details{font-size:inherit!important;padding-top:12px!important}
.hxe-company summary{display:block!important;list-style:none!important;font-size:22px!important;line-height:1.5!important;margin:12px 0!important}
.hxe-company table{font-size:21px!important;table-layout:fixed!important}
.hxe-company th,.hxe-company td{font-size:21px!important;padding:12px 9px!important;line-height:1.5!important}
.hxe-company th{background:#eaf1fb!important;color:#244c92!important}
.hxe-company .hxe-company-sources{font-size:16px!important;line-height:1.5!important;background:#f7f9fc!important;padding:16px!important;border-radius:10px!important;margin-top:16px!important}
.hxe-company .hxe-company-sources h3{font-size:22px!important;margin:0 0 8px!important}
.hxe-company .hxe-company-sources :is(p,a,span){font-size:16px!important;line-height:1.5!important}
.hxe-company.hxe-a4-pdf{font-size:22px!important;line-height:1.6!important}
.hxe-company.hxe-a4-pdf .kt-intro{font-size:22px!important}
.hxe-company.hxe-a4-pdf .kt-contract>div{font-size:20px!important}
.hxe-company.hxe-a4-pdf .kt-stat{padding:12px!important}
.hxe-company.hxe-a4-pdf .kt-stat .kt-value{font-size:32px!important}
.hxe-company.hxe-a4-pdf .kt-stat b{font-size:21px!important;margin:6px 0!important}
.hxe-company.hxe-a4-pdf .kt-stat p{font-size:19px!important;line-height:1.5!important}
.hxe-company.hxe-a4-pdf .kt-date{font-size:15px!important;margin-top:6px!important}
.hxe-company.hxe-a4-pdf .hxe-company-sources{padding:12px!important}
.hxe-company.hxe-a4-pdf .hxe-company-sources :is(p,a,span){font-size:15px!important;line-height:1.4!important}
.hxe-company.hxe-wide{font-size:26px!important;width:1280px!important}
.hxe-company.hxe-wide .hxe-page{width:1280px!important;height:720px!important;padding:30px 38px!important}
.hxe-company.hxe-wide .kt-panel{padding:18px!important;margin-bottom:12px!important}
.hxe-company.hxe-wide :where(.kt-grid,.kt-contract){grid-template-columns:repeat(2,minmax(0,1fr))!important}
.hxe-company.hxe-wide .kt-hero .kt-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
.hxe-company.hxe-wide .kt-stat{padding:14px!important}
.hxe-company.hxe-wide .kt-chain{flex-direction:row!important;align-items:center!important;gap:12px!important}
.hxe-company.hxe-wide .kt-node{flex:1!important;min-height:130px!important}
.hxe-company.hxe-wide .kt-arrow{transform:none!important;flex:none!important}
.hxe-company.hxe-wide .kt-bar-row{margin:7px 0!important;font-size:19px!important;line-height:1.4!important}
.hxe-company.hxe-wide .kt-track,.hxe-company.hxe-wide .kt-fill{height:18px!important}
.hxe-company.hxe-wide .kt-contract>div{font-size:20px!important;padding:12px!important;line-height:1.45!important}
.hxe-company.hxe-wide .kt-note{font-size:17px!important;line-height:1.5!important}
.hxe-company.hxe-wide .hxe-page{position:relative!important}
.hxe-company.hxe-wide .hxe-page-body{display:flex!important;flex-direction:column!important;justify-content:center!important;min-height:660px!important}
.hxe-company.hxe-wide .hxe-continuation{position:absolute!important;top:4px!important;left:38px!important;font-size:16px!important;line-height:1.3!important;color:#6f819a!important}
.hxe-company.hxe-wide [data-module="rates"]{display:grid!important;grid-template-columns:2fr 1fr!important;gap:10px 20px!important}
.hxe-company.hxe-wide [data-module="rates"]>:is(.kt-kicker,h2,.kt-intro){grid-column:1/-1!important;margin:0!important}
.hxe-company.hxe-wide [data-module="rates"]>.kt-table-wrap{grid-column:1!important;grid-row:4/span 2!important}
.hxe-company.hxe-wide [data-module="rates"]>:is(.kt-warning,.kt-note){grid-column:2!important;margin:0!important;align-self:start!important}
.hxe-company.hxe-wide [data-module="rates"] .kt-warning{font-size:20px!important;padding:12px!important;line-height:1.5!important}
.hxe-company.hxe-wide [data-module="rates"] :is(th,td){font-size:18px!important;line-height:1.35!important;padding:8px!important}
.hxe-company.hxe-wide .kt-hero{padding:34px!important;min-height:600px!important;display:flex!important;flex-direction:column!important;justify-content:center!important}
.hxe-company.hxe-wide .kt-hero h1{font-size:50px!important}
.hxe-company.hxe-wide .kt-hero .kt-value{font-size:46px!important}
.hxe-company.hxe-wide .kt-hero .kt-stat{padding:24px!important}
.hxe-company.hxe-wide .hxe-capital .kt-stat{min-height:350px!important;padding:30px!important}
.hxe-company.hxe-wide .hxe-capital .kt-value{font-size:48px!important}
.hxe-company.hxe-wide .hxe-capital .kt-stat p{font-size:25px!important}
.hxe-company.hxe-wide .hxe-case-grid>div{min-height:230px!important;padding:22px!important;font-size:24px!important}
.hxe-company.hxe-wide .kt-professional>.kt-contract:not(.hxe-case-grid)>div{min-height:150px!important;padding:20px!important}
.hxe-company.hxe-wide details>.kt-contract:first-of-type strong{font-size:38px!important}
.hxe-company.hxe-wide .hxe-company-sources{columns:2!important;column-gap:28px!important;padding:22px!important}
.hxe-company.hxe-wide .hxe-company-sources h3{column-span:all!important;font-size:30px!important}
.hxe-company.hxe-wide .hxe-company-sources :is(p,a){font-size:23px!important;line-height:1.5!important;break-inside:avoid!important}
.hxe-company.hxe-wide .kt-equity-svg{height:380px!important;width:564px!important;max-width:100%!important;margin:auto!important}
.hxe-company.hxe-wide .kt-equity-figure figcaption{font-size:17px!important}
.hxe-company.hxe-wide [data-module="ownership"]>.kt-intro{font-size:22px!important;line-height:1.45!important}
`;
const norm=s=>s.replace(/\s+/g,'');
function texts(root){const map={};const walk=root.ownerDocument.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=walk.nextNode()){if(n.parentElement.closest('[data-hxe-added]'))continue;const t=norm(n.textContent);if(t)map[t]=(map[t]||0)+1;}return map;}
function same(a,b){return JSON.stringify(Object.entries(a).sort())===JSON.stringify(Object.entries(b).sort());}
function graphs(root){return {chains:root.querySelectorAll('.kt-chain').length,timelines:root.querySelectorAll('.kt-timeline').length,tables:root.querySelectorAll('table').length,bars:[...root.querySelectorAll('.kt-bar-row')].map(n=>({label:n.querySelector('span')?.textContent,value:n.querySelector('b')?.textContent,width:n.querySelector('.kt-fill')?.style.width})),images:root.querySelectorAll('img,svg').length,links:[...root.querySelectorAll('a[href]')].map(n=>({text:n.textContent,href:n.href})).sort((a,b)=>(a.href+a.text).localeCompare(b.href+b.text))};}
function prepare(clone,doc){
 const blocks=[...clone.children].filter(n=>n.textContent.trim()||n.querySelector('img,svg'));const modules=blocks.map((n,i)=>{const id=n.dataset.module||n.id||('company-'+i);n.dataset.hxeOrigin=id;return{id,title:n.querySelector('h1,h2')?.textContent.trim()||'公司介绍',text:texts(n)};});
 const baseline={text:texts(clone),graphs:graphs(clone),modules};
 const sources=doc.createElement('div');sources.className='hxe-company-sources';sources.dataset.hxeSources='true';
 const h=doc.createElement('h3');h.textContent='数据来源';h.dataset.hxeAdded='true';sources.append(h);
 // Retain every original source and its hyperlink, attached to its original module for QA.
 for(const n of [...clone.querySelectorAll('.kt-source')]){n.dataset.hxeOrigin=n.closest('[data-hxe-origin]')?.dataset.hxeOrigin||'';sources.append(n);}
 if(sources.children.length>1)clone.append(sources);
 // Keep explanatory text and the visual it qualifies in the same pagination unit.
 for(const bars of [...clone.querySelectorAll('.kt-bars')]){const note=bars.previousElementSibling,heading=note?.previousElementSibling,after=bars.nextElementSibling;const group=doc.createElement('div');group.className='hxe-figure';bars.before(group);if(heading?.matches('h3'))group.append(heading);if(note?.matches('.kt-note'))group.append(note);group.append(bars);if(after?.matches('.kt-contract'))group.append(after);}
 const capital=[...clone.querySelectorAll('#module-operation h3')].find(n=>n.textContent.includes('资本覆盖'));if(capital){const grid=capital.nextElementSibling,note=grid?.nextElementSibling,group=doc.createElement('div');group.className='hxe-figure hxe-capital';capital.before(group);group.append(capital);if(grid)group.append(grid);if(note?.matches('.kt-note'))group.append(note);}
 for(const h of clone.querySelectorAll('h3'))if(h.textContent.includes('代表项目')&&h.nextElementSibling?.matches('.kt-contract'))h.nextElementSibling.classList.add('hxe-case-grid');
 return baseline;
}
function paginate(stage,mode){
 const {doc,root,clone,companyBaseline:baseline}=stage;root.classList.add('hxe-company');
 const density=Number(root.dataset.density)||2,max=mode==='pptx'?720:mode==='mobile-pdf'?1334:mode==='a4-pdf'?1060:Math.min(1600,Math.floor(8800000/(750*density*density)));
 const pages=[];let page,body;
 const make=()=>{page=doc.createElement('section');page.className='hxe-page';body=doc.createElement('div');body.className='hxe-page-body';page.append(body);root.append(page);pages.push(page);};
 const fits=()=>Math.max(page.scrollHeight,body.getBoundingClientRect().bottom-page.getBoundingClientRect().top+24)<=max;
 const minimum=(n)=>n.nodeType===3?!!n.textContent.trim():!!n.textContent.trim()||!!n.querySelector('img,svg');
 const origin=n=>n.closest?.('[data-hxe-origin]')?.dataset.hxeOrigin;
 function wrapper(n){const w=n.cloneNode(false);w.removeAttribute('id');return w;}
 function appendBlock(block){
  if(!minimum(block))return;
  if(!page)make();body.append(block);
  if(fits())return;
  block.remove();
  // Preserve atomic visual structures; never break a chart, relationship or timeline into text.
  if(body.childNodes.length){make();body.append(block);if(fits())return;block.remove();}
  if(block.matches?.('.kt-chain,.kt-bars,.kt-timeline,img,svg,tr'))throw Error('完整图表超过此格式的单页容量，已停止，未裁切图表。');
  const children=[...block.childNodes].filter(minimum);
  if(block.matches?.('.kt-grid,.kt-contract')){
   const count=2;for(let i=0;i<children.length;i+=count){const row=wrapper(block);row.append(...children.slice(i,i+count));body.append(row);if(fits())continue;row.remove();if(body.childNodes.length)make();body.append(row);if(!fits())throw Error('同组对照卡过高，已停止而不拆散含义。');}return;
  }
  if(!children.length||block.matches?.('p,li,.kt-stat,.kt-node'))throw Error('完整内容块超过单页容量，请选择更适合的格式；未删减正文。');
  // Preserve parent classes and section context on every continuation fragment.
  let fragment=wrapper(block);body.append(fragment);
  for(let i=0;i<children.length;i++){
   let child=children[i];fragment.append(child);
   const isHeading=child.nodeType===1&&child.matches('h1,h2,h3,h4,summary,.kt-kicker');
   let probe;if(isHeading&&children[i+1]){probe=children[i+1].cloneNode(true);fragment.append(probe);}
   const good=fits();probe?.remove();if(good)continue;
   child.remove();if(!fragment.childNodes.length){fragment.remove();if(child.nodeType===1&&!child.dataset.hxeOrigin)child.dataset.hxeOrigin=block.dataset.hxeOrigin||'';appendBlock(child);fragment=wrapper(block);body.append(fragment);continue;}
   // Carry a trailing heading forward rather than leaving a title on its own.
   const carry=[];while(fragment.lastElementChild?.matches('h1,h2,h3,h4,summary,.kt-kicker'))carry.unshift(fragment.removeChild(fragment.lastElementChild));
   if(!fragment.childNodes.length)fragment.remove();if(body.childNodes.length)make();fragment=wrapper(block);fragment.append(...carry.filter(Boolean),child);body.append(fragment);
   if(!fits()){
    child.remove();if(!fragment.childNodes.length)fragment.remove();
    // The recursive item retains the original provenance even when an outer panel is split.
    if(child.nodeType===1&&!child.dataset.hxeOrigin)child.dataset.hxeOrigin=block.dataset.hxeOrigin||origin(block)||'';
    appendBlock(child);fragment=wrapper(block);body.append(fragment);
   }
  }
  if(!fragment.childNodes.length)fragment.remove();
 }
 const blocks=[...clone.children].filter(minimum);clone.remove();
 for(const block of blocks){
  if(mode==='pptx'&&body?.textContent.trim()&&block.matches('.kt-hero,[data-module]'))make();
  appendBlock(block);
 }
 for(const p of [...pages])if(!p.textContent.trim()&&!p.querySelector('img,svg')){p.remove();pages.splice(pages.indexOf(p),1);}
 if(mode==='pptx'&&pages.some(p=>!p.querySelector('[data-hxe-sources],h1,h2,h3,.kt-stat,table,.kt-chain,.kt-timeline,.kt-contract,.kt-bars')&&p.querySelector('.kt-note,.kt-warning')))throw Error('检测到仅剩备注的幻灯片，已停止，请调整主题组合。');
 if(mode==='pptx')for(const p of pages){if(!p.querySelector('h1,h2')&&!p.querySelector('[data-hxe-sources]')){const id=p.querySelector('[data-hxe-origin]')?.dataset.hxeOrigin;const title=baseline.modules.find(m=>m.id===id)?.title;if(title){const label=doc.createElement('span');label.className='hxe-continuation';label.dataset.hxeAdded='true';label.textContent=title+' · 续';p.prepend(label);}}}
 if(pages.length>80)throw Error('内容过长，请选择单个主题导出。');
 const actual=texts(root);if(!same(baseline.text,actual))throw Error('公司介绍正文逐项核对失败，未生成缺失内容的文件。');
 const actualGraphs=graphs(root);if(JSON.stringify(baseline.graphs)!==JSON.stringify(actualGraphs))throw Error('公司介绍图表核对失败，未生成缺图文件。');
 const modules=baseline.modules.map(m=>{const found={};for(const part of root.querySelectorAll('[data-hxe-origin]'))if(part.dataset.hxeOrigin===m.id&&!part.parentElement.closest(`[data-hxe-origin="${m.id}"]`)){for(const[k,v]of Object.entries(texts(part)))found[k]=(found[k]||0)+v;}return{id:m.id,title:m.title,passed:same(m.text,found),textNodes:Object.keys(m.text).length,pages:pages.map((p,i)=>p.querySelector(`[data-hxe-origin="${m.id}"]`)?i+1:null).filter(Boolean)};});
 if(modules.some(m=>!m.passed))throw Error('公司介绍模块对照失败，已停止导出。');
 for(const p of pages){const r=p.getBoundingClientRect();for(const node of p.querySelectorAll('*')){const n=node.getBoundingClientRect();if(n.width&&n.height&&(n.left<r.left-1||n.right>r.right+1||n.bottom>r.top+max+1))throw Error('公司介绍版面边界检查失败，已停止，未生成裁切文件。');}}
 const audit={company:true,mode,passed:true,modules,graphs:actualGraphs,expectedTextSegments:Object.entries(baseline.text).map(([text,count])=>({text,count})),bodyTextNodes:Object.values(actual).reduce((a,b)=>a+b,0),headings:[...root.querySelectorAll('h1,h2,h3')].filter(n=>!n.dataset.hxeAdded).map(n=>n.textContent.trim()),pageCount:pages.length,footers:root.querySelectorAll('.hxe-page-footer').length,pages:pages.map(p=>({footer:'',appendix:!!p.querySelector('[data-hxe-sources]'),height:p.scrollHeight,contentHeight:p.querySelector('.hxe-page-body').getBoundingClientRect().height,grids:p.querySelectorAll('.kt-grid,.kt-contract').length}))};
 window.HubContentExport.lastCompanyAudit=audit;
 if(mode.includes('pdf'))window.HubContentExport.lastPDFLayout=audit;
 return pages;
}
window.HubCompanyExport={css,prepare,paginate};
})();
