(function(){
'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const css=`
.hxe-document.hxe-company.bg-document{width:794px!important;color:#25384b!important;font-family:HubExportSans,"Microsoft YaHei",sans-serif!important;font-size:18px!important;line-height:1.48!important}
.hxe-document.hxe-company.bg-document .bg-page{width:794px!important;height:1123px!important;min-height:1123px!important;padding:30px 32px!important;margin:0!important;border:9px solid #173f6d!important;border-radius:0!important;background:#fffdf8!important;position:relative!important;overflow:visible!important}
.hxe-document.hxe-company.bg-document .bg-shell{height:100%!important;display:flex!important;flex-direction:column!important;gap:20px!important}
.hxe-document.hxe-company.bg-document .bg-header{padding:0 0 12px!important;margin:0!important;border-bottom:3px solid #ad8b50!important;background:none!important;flex:none!important}
.hxe-document.hxe-company.bg-document .bg-eyebrow{font-size:14px!important;line-height:1.4!important;letter-spacing:2px!important;color:#95733b!important;font-weight:700!important;margin:0 0 5px!important}
.hxe-document.hxe-company.bg-document h1{font-size:32px!important;line-height:1.25!important;color:#173f6d!important;margin:0!important}
.hxe-document.hxe-company.bg-document h2{font-size:22px!important;line-height:1.35!important;color:#173f6d!important;margin:0 0 10px!important;border-left:5px solid #ad8b50!important;padding-left:10px!important}
.hxe-document.hxe-company.bg-document h3{font-size:19px!important;line-height:1.4!important;color:#8a672d!important;margin:0 0 7px!important}
.hxe-document.hxe-company.bg-document p{font-size:18px!important;line-height:1.48!important;margin:0!important;padding:0!important}
.hxe-document.hxe-company.bg-document .bg-body{flex:1!important;min-height:0!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:15px!important}
.hxe-document.hxe-company.bg-document :is(.bg-card,.bg-panel){margin:0!important;padding:14px 16px!important;border:1px solid #ded2ba!important;border-radius:8px!important;background:#fff!important;min-width:0!important}
.hxe-document.hxe-company.bg-document .bg-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important}
.hxe-document.hxe-company.bg-document .bg-metric{border-top:4px solid #b49760!important;min-height:155px!important}
.hxe-document.hxe-company.bg-document .bg-value{font-size:43px!important;line-height:1.12!important;font-weight:700!important;color:#a07a3d!important;display:block!important;margin:5px 0 7px!important;white-space:nowrap!important}
.hxe-document.hxe-company.bg-document .bg-value small{font-size:18px!important;color:#294b70!important;margin-left:3px!important}
.hxe-document.hxe-company.bg-document .bg-metric b{font-size:20px!important;color:#173f6d!important;display:block!important;margin-bottom:6px!important}
.hxe-document.hxe-company.bg-document .bg-metric p{font-size:17px!important;line-height:1.45!important;color:#526274!important}
.hxe-document.hxe-company.bg-document .bg-period{font-size:16px!important;color:#657383!important;margin-top:7px!important;display:block!important}
.hxe-document.hxe-company.bg-document .bg-summary p{font-size:19px!important;line-height:1.5!important}
.hxe-document.hxe-company.bg-document .bg-timeline{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important;margin-top:14px!important}
.hxe-document.hxe-company.bg-document .bg-time{padding:8px 10px!important;background:#f2eadb!important;border-left:3px solid #ad8b50!important;font-size:17px!important}
.hxe-document.hxe-company.bg-document .bg-time b{display:block!important;font-size:30px!important;color:#8a672d!important;line-height:1.15!important;margin-bottom:3px!important}
.hxe-document.hxe-company.bg-document .bg-equity-wrap{padding:10px 12px!important;background:#f2f6fa!important;border:1px solid #c8d5e2!important;border-radius:8px!important}
.hxe-document.hxe-company.bg-document .kt-equity-figure{padding:0!important;margin:0!important;background:none!important}
.hxe-document.hxe-company.bg-document .kt-equity-svg{display:block!important;width:100%!important;height:282px!important;max-height:none!important}
.hxe-document.hxe-company.bg-document figcaption{font-size:14px!important;line-height:1.4!important;color:#526274!important;margin-top:4px!important}
.hxe-document.hxe-company.bg-document .bg-profile-grid .bg-card{padding:11px 13px!important}
.hxe-document.hxe-company.bg-document .bg-profile-grid p{font-size:16.5px!important;line-height:1.4!important}
.hxe-document.hxe-company.bg-document .bg-profile-grid b{font-size:18px!important;color:#173f6d!important}
.hxe-document.hxe-company.bg-document .bg-inline{padding:11px 14px!important;border-left:4px solid #ad8b50!important;background:#f1eadc!important;font-size:16px!important;line-height:1.45!important;margin:0!important}
.hxe-document.hxe-company.bg-document .bg-inline strong{color:#173f6d!important}
.hxe-document.hxe-company.bg-document .bg-capital .bg-metric{min-height:115px!important;background:#f2f6fa!important;border-color:#c8d5e2!important}
.hxe-document.hxe-company.bg-document .bg-capital .bg-value{font-size:36px!important}
.hxe-document.hxe-company.bg-document .bg-history{padding:12px 16px!important;background:#fff!important;border:1px solid #ded2ba!important;border-radius:8px!important}
.hxe-document.hxe-company.bg-document .bg-history-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px 22px!important}
.hxe-document.hxe-company.bg-document .bg-history-row{display:flex!important;justify-content:space-between!important;gap:9px!important;border-bottom:1px solid #eee6d7!important;padding:5px 0!important;font-size:17px!important}
.hxe-document.hxe-company.bg-document .bg-history-row b{color:#173f6d!important;white-space:nowrap!important}
.hxe-document.hxe-company.bg-document .bg-three{grid-template-columns:repeat(3,minmax(0,1fr))!important}
.hxe-document.hxe-company.bg-document .bg-investment-top .bg-metric{min-height:112px!important;padding:12px!important}
.hxe-document.hxe-company.bg-document .bg-investment-top .bg-value{font-size:35px!important}
.hxe-document.hxe-company.bg-document .bg-investment-top .bg-metric b{font-size:17px!important}
.hxe-document.hxe-company.bg-document .bg-investment-top .bg-period{font-size:14px!important}
.hxe-document.hxe-company.bg-document .bg-allocation-body{display:grid!important;grid-template-columns:215px minmax(0,1fr)!important;gap:20px!important;align-items:center!important}
.hxe-document.hxe-company.bg-document .bg-ring{width:210px!important;height:210px!important;max-height:none!important}
.hxe-document.hxe-company.bg-document .bg-alloc-row{display:grid!important;grid-template-columns:120px 1fr 60px!important;gap:8px!important;align-items:center!important;font-size:16px!important;line-height:1.35!important;margin:1px 0!important}
.hxe-document.hxe-company.bg-document .bg-track{height:11px!important;background:#e5eaf0!important;border-radius:3px!important;overflow:hidden!important}
.hxe-document.hxe-company.bg-document .bg-fill{height:11px!important;background:#173f6d!important;display:block!important}
.hxe-document.hxe-company.bg-document .bg-longterm .bg-history-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:12px!important}
.hxe-document.hxe-company.bg-document .bg-longterm .bg-history-row{flex-direction:column!important;gap:3px!important;font-size:16px!important;line-height:1.35!important}
.hxe-document.hxe-company.bg-document [data-brochure-page="3"] .bg-body{gap:12px!important}
.hxe-document.hxe-company.bg-document .bg-cases .bg-card{padding:11px 13px!important}
.hxe-document.hxe-company.bg-document .bg-cases p{font-size:16.5px!important;line-height:1.4!important}
.hxe-document.hxe-company.bg-document .bg-flow{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important}
.hxe-document.hxe-company.bg-document .bg-step{background:#173f6d!important;color:#fff!important;padding:16px 13px!important;border-radius:8px!important;font-size:17px!important;line-height:1.45!important}
.hxe-document.hxe-company.bg-document .bg-step b{display:block!important;font-size:20px!important;color:#e5c995!important;margin-bottom:8px!important}
.hxe-document.hxe-company.bg-document .bg-comparison .bg-card{min-height:130px!important}
.hxe-document.hxe-company.bg-document .bg-comparison p{font-size:17px!important}
.hxe-document.hxe-company.bg-document table{width:100%!important;border-collapse:collapse!important;table-layout:fixed!important;margin:0!important}
.hxe-document.hxe-company.bg-document :is(th,td){font-size:18px!important;line-height:1.45!important;padding:12px 10px!important;border:1px solid #d7c9ad!important;text-align:left!important}
.hxe-document.hxe-company.bg-document th{background:#173f6d!important;color:#fff!important;font-weight:700!important}
.hxe-document.hxe-company.bg-document td:last-child{color:#926d32!important;font-size:23px!important;font-weight:700!important;text-align:center!important}
.hxe-document.hxe-company.bg-document tbody tr:nth-child(even){background:#f5f0e5!important}
.hxe-document.hxe-company.bg-document th:nth-child(2),.hxe-document.hxe-company.bg-document td:nth-child(2){width:104px!important;text-align:center!important}
.hxe-document.hxe-company.bg-document th:last-child{width:136px!important;text-align:center!important}
.hxe-document.hxe-company.bg-document .bg-example{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:18px!important;padding:18px!important;background:#f1eadc!important;border:1px solid #d8c4a0!important;border-radius:8px!important}
.hxe-document.hxe-company.bg-document .bg-example b{font-size:36px!important;color:#926d32!important;white-space:nowrap!important}
.hxe-document.hxe-company.bg-document .bg-example p{font-size:18px!important}
.hxe-document.hxe-company.bg-document.bg-ppt{width:1280px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-page{width:1280px!important;height:720px!important;min-height:720px!important;padding:24px 30px!important;border-width:8px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-shell{gap:12px!important}
.hxe-document.hxe-company.bg-document.bg-ppt h1{font-size:35px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-header{padding-bottom:8px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-body{display:grid!important;grid-template-columns:1fr 1fr!important;gap:12px 20px!important;align-content:space-between!important;align-items:start!important}
.hxe-document.hxe-company.bg-document.bg-ppt :is(p,.bg-profile-grid p,.bg-cases p){font-size:19px!important;line-height:1.4!important}
.hxe-document.hxe-company.bg-document.bg-ppt :is(.bg-profile-grid h3,.bg-cases h3){font-size:21px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-summary{grid-column:1/-1!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-timeline{margin-top:9px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .kt-equity-svg{height:275px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-profile-grid{gap:9px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-profile-grid .bg-card{padding:9px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-inline{grid-column:1/-1!important;font-size:17px!important;padding:8px 12px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-metric{min-height:125px!important;padding:12px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-metric p{font-size:17px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-metric .bg-value{font-size:38px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-capital .bg-grid{grid-template-columns:1fr 1fr!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-history{grid-column:2!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-operation-main{grid-column:1!important;grid-row:1/span 2!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-history-row{font-size:17px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-investment-top{grid-column:1/-1!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-investment-top .bg-metric{min-height:86px!important;padding:9px 14px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-investment-top .bg-value{font-size:36px!important;display:inline-block!important;margin:0 12px 0 0!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-investment-top .bg-metric b{display:inline!important;font-size:19px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-investment-top .bg-period{margin:2px 0 0!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-allocation-body{grid-template-columns:160px 1fr!important;gap:10px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-ring{width:155px!important;height:155px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-alloc-row{grid-template-columns:116px 1fr 55px!important;font-size:17px!important;margin:5px 0!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-longterm{grid-column:1/-1!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-longterm .bg-history-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-longterm .bg-history-row{flex-direction:column!important;gap:2px!important;font-size:16px!important;padding:0!important;border:0!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-cases{grid-column:2!important;grid-row:2!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-cases p{font-size:17px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-flow{grid-column:1/-1!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-step{padding:12px!important;font-size:18px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-rates{grid-column:2!important;grid-row:2/span 2!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-comparison{grid-column:1!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-example{grid-column:1!important;padding:13px!important}
.hxe-document.hxe-company.bg-document.bg-ppt :is(th,td){font-size:18px!important;padding:8px!important}
.hxe-document.hxe-company.bg-document.bg-ppt td:last-child{font-size:22px!important}
.hxe-document.hxe-company.bg-document.bg-ppt [data-brochure-page="1"] .bg-profile-grid p{font-size:17px!important;line-height:1.35!important}
.hxe-document.hxe-company.bg-document.bg-ppt [data-brochure-page="1"] .bg-profile-grid h3{font-size:20px!important;margin-bottom:5px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-alloc-row{font-size:16px!important;margin:1px 0!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-longterm{padding:8px 12px!important}
.hxe-document.hxe-company.bg-document.bg-ppt .bg-longterm h2{margin-bottom:5px!important}
`;
function ring(d){let offset=0;const colors=['#173f6d','#ad8b50','#4e7094','#d4bd91','#879db2','#b29a70','#b6c3d0','#cfbea2','#e0d6c3'];return `<svg class="bg-ring" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" role="img" aria-label="投资资产配置占比">${d.allocation.items.map(([label,value],i)=>{const start=offset;offset+=value;return `<circle cx="110" cy="110" r="78" fill="none" stroke="${colors[i]}" stroke-width="28" stroke-dasharray="${value/100*2*Math.PI*78} ${(100-value)/100*2*Math.PI*78}" stroke-dashoffset="${-start/100*2*Math.PI*78}" transform="rotate(-90 110 110)"/>`;}).join('')}<g font-family="HubExportSans,Microsoft YaHei,sans-serif" text-anchor="middle" fill="#173f6d"><text x="110" y="100" font-size="18">投资资产</text><text x="110" y="132" font-size="25" font-weight="700">${esc(d.metrics.find(m=>m.id==='invested').value)}</text><text x="110" y="153" font-size="16">万亿元</text></g></svg>`;}
function equityGraphic(o){const box=(x,y,title,sub)=>`<rect x="${x}" y="${y}" width="300" height="62" rx="8" fill="#f4ecdd" stroke="#b59a68"/><text x="${x+150}" y="${y+27}" text-anchor="middle" font-size="25" font-weight="700">${title}</text><text x="${x+150}" y="${y+51}" text-anchor="middle" font-size="18">${sub}</text>`;return `<svg class="kt-equity-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 380" role="img" aria-label="中投中央汇金与中国宝武两条独立持股体系"><defs><marker id="bg-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0 0L9 4.5L0 9Z" fill="#9d7d43"/></marker></defs><g font-family="HubExportSans,Microsoft YaHei,sans-serif" fill="#173f6d"><text x="230" y="27" text-anchor="middle" font-size="23" font-weight="700">金融国资股东体系</text><text x="770" y="27" text-anchor="middle" font-size="23" font-weight="700">中国宝武合计权益</text><text x="770" y="77" text-anchor="middle" font-size="39" font-weight="700" fill="#967138">${o.baowu.combinedPct}%</text>${box(80,43,'中投公司','中国主权财富基金机构')}${box(80,135,'中央汇金','新华保险第一大直接持股股东')}${box(80,220,'中央汇金资产管理','中央汇金全资子公司')}${box(620,135,'中国宝武','中央管理的国有资本投资公司')}${box(620,220,'华宝投资','中国宝武全资子公司')}<g fill="none" stroke="#9d7d43" stroke-width="2.5" marker-end="url(#bg-arrow)"><path d="M230 105V126"/><path d="M230 197V211"/><path d="M770 197V211"/><path d="M80 166H27V342H373"/><path d="M230 282V311H430V313"/><path d="M920 166H953V342H607"/><path d="M770 282V311H550V313"/></g><g font-size="22" font-weight="700"><text x="43" y="326">直接 ${o.huijin.directPct}%</text><text x="248" y="307">持股 ${o.huijin.assetPct}%</text><text x="770" y="326">直接 ${o.baowu.directPct}%</text><text x="601" y="307">持股 ${o.baowu.subsidiaryPct}%</text></g><text x="248" y="125" font-size="17">全资</text><rect x="380" y="316" width="220" height="49" rx="8" fill="#173f6d"/><text x="490" y="349" text-anchor="middle" font-size="28" font-weight="700" fill="#fff">新华保险</text></g></svg>`;}
function textSegments(root){const result=[];const w=root.ownerDocument.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(n.parentElement.closest('svg'))continue;const t=n.textContent.replace(/\s+/g,'');if(t)result.push(t);}const counts={};for(const t of result)counts[t]=(counts[t]||0)+1;return Object.entries(counts).map(([text,count])=>({text,count}));}
function build(stage,mode){
 const {doc,root,clone,companyData:d}=stage;if(!d)throw Error('正式公司数据未加载');const wide=mode==='pptx';root.classList.add('hxe-company','bg-document');if(wide)root.classList.add('bg-ppt');
 const node=html=>{const t=doc.createElement('template');t.innerHTML=html;return t.content.firstElementChild;};const clean=n=>{const c=n.cloneNode(true);c.querySelectorAll('.kt-source,.kt-note,figcaption').forEach(x=>x.remove());c.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));return c;};
 const metric=(id,meaning=true)=>{const m=d.metrics.find(m=>m.id===id);if(!m||m.status!=='confirmed')throw Error('指标未确认：'+id);return `<article class="bg-card bg-metric" data-metric="${id}"><span class="bg-value">${esc(m.value)}<small>${esc(m.unit)}</small></span><b>${esc(m.name)}</b>${meaning?`<p>${esc(m.meaning)}</p>`:''}<span class="bg-period">${esc(m.period)}</span></article>`;};
 const panel=(title,body,cls='')=>`<div class="bg-panel ${cls}"><h2>${title}</h2>${body}</div>`;const page=(title,kicker,content,index)=>node(`<section class="hxe-page bg-page" data-brochure-page="${index}"><div class="bg-shell"><header class="bg-header"><div class="bg-eyebrow">新华保险 · ${kicker}</div><h1>${title}</h1></header><div class="bg-body">${content}</div></div></section>`);
 const o=d.ownership,profile=(title,body)=>`<div class="bg-card"><h3>${title}</h3><p>${body}</p></div>`;
 const equity=node(`<figure class="kt-equity-figure">${equityGraphic(o)}</figure>`);
 const summary=`<div class="bg-summary"><p>${esc(clone.querySelector('[data-module="identity"] .kt-intro').textContent)}</p><div class="bg-timeline">${[...clone.querySelectorAll('.kt-timeline .kt-event')].map(n=>`<div class="bg-time"><b>${esc(n.querySelector('strong').textContent)}</b>${esc(n.querySelector('span').textContent)}</div>`).join('')}</div></div>`;
 const p1=page('国资背景 · 长期经营','公司身份与主要股东',summary+`<div class="bg-equity-wrap"><h2>两条独立的国资股东体系</h2>${equity.outerHTML}<span class="bg-period">${esc(o.period)}；直接持股与合计权益分别列示。</span></div><div class="bg-grid bg-profile-grid">`+profile('中投公司',esc(o.cic.description))+profile('中央汇金',esc(o.huijin.description))+profile('中国宝武',esc(o.baowu.description))+profile('宝武合计权益',`${esc(o.baowu.directPct)}% 直接持股 + ${esc(o.baowu.subsidiaryPct)}% 通过全资子公司华宝投资间接持股 = <b>${esc(o.baowu.combinedPct)}% 合计权益</b>。`)+`</div><div class="bg-inline">${esc(o.risk)}</div>`,1);
 const p2=page('经营实力 · 规模与价值','2026年上半年 / 2026年6月30日',`<div class="bg-grid bg-operation-main">${['assets','premium','profit','embedded'].map(id=>metric(id)).join('')}</div>`+panel('资本覆盖：不是收益指标',`<div class="bg-grid">${['solvency','coreSolvency'].map(id=>metric(id,false)).join('')}</div>`,'bg-capital')+`<div class="bg-history"><h2>历史口径保留 · 2025年度 / 年末</h2><div class="bg-history-grid">${d.history.items.map(([name,value])=>`<div class="bg-history-row"><span>${esc(name)}</span><b>${esc(value)}</b></div>`).join('')}</div></div><div class="bg-inline"><strong>看懂四个角度：</strong>总资产看规模，保费看业务，净利润看当期经营成果，内含价值看长期业务价值。偿付能力反映资本覆盖，不是客户收益。报告披露的2026年一季度风险综合评级为BBB类，不能与机构信用评级混用。</div>`,2);
 const allocation=panel('资金投向 · 分散配置',`<div class="bg-allocation-body">${ring(d)}<div>${d.allocation.items.map(([name,value],i)=>`<div class="bg-alloc-row"><span>${esc(name)}</span><span class="bg-track"><span class="bg-fill" style="width:${value}%;${i%2?'background:#ad8b50!important':''}"></span></span><b>${value.toFixed(1)}%</b></div>`).join('')}</div></div><span class="bg-period">${esc(d.allocation.period)}，按投资对象分类。</span>`,'bg-allocation');
 const oldCases=clone.querySelector('.hxe-case-grid')||[...clone.querySelectorAll('[data-module="investment"] .kt-contract')].at(-1);const cases=`<div class="bg-cases"><h2>代表项目 · 长期投资方式</h2><div class="bg-grid">${[...oldCases.children].map(c=>profile(esc(c.querySelector('strong').textContent),esc(c.querySelector('p').textContent))).join('')}</div></div>`;
 const p3=page('投资布局 · 长期配置','公司投资指标不等于保单收益',`<div class="bg-grid bg-three bg-investment-top">${['invested','totalReturn','comprehensiveReturn'].map(id=>metric(id,false)).join('')}</div>`+allocation+cases+`<div class="bg-history bg-longterm"><h2>${esc(d.longTerm.period)}</h2><div class="bg-history-grid">${d.longTerm.items.map(([name,value])=>`<div class="bg-history-row"><span>${esc(name)}</span><b>${esc(value)}</b></div>`).join('')}</div><span class="bg-period">历史组合口径不同，不代表保单收益或未来保证。</span></div>`,3);
 const rates=`<div class="bg-rates"><h2>2025年度 · 部分产品现金红利实现率</h2><table><thead><tr><th>产品</th><th>分红年度</th><th>红利实现率</th></tr></thead><tbody>${d.rates.filter(r=>r.status==='confirmed').map(r=>`<tr><td>${esc(r.product)}</td><td>${r.year}</td><td>${r.rate}%</td></tr>`).join('')}</tbody></table></div>`;
 const flow=`<div class="bg-flow">${[...clone.querySelectorAll('[data-module="logic"] .kt-node')].map((n,i)=>`<div class="bg-step"><b>${i+1} · ${esc(n.querySelector('b').textContent)}</b>${esc(n.querySelector('span').textContent)}</div>`).join('')}</div>`;
 const concepts=`<div class="bg-grid bg-comparison">${[...clone.querySelectorAll('[data-module="logic"] .kt-contract>div')].map(n=>profile(esc(n.querySelector('strong').textContent),esc(n.querySelector('p').textContent))).join('')}</div>`;
 const p4=page('分红机制 · 看懂实际派发','保证利益与非保证红利分开理解',flow+concepts+rates+`<div class="bg-example"><p><strong>红利实现率</strong><br>实际公布红利 ÷ 演示红利<br>例如演示100元、实际公布118元</p><b>118%</b></div><div class="bg-inline"><strong>实现率不是本金收益率。</strong>以上为5项2025年度现金红利数据，不是全部产品清单。不同产品、年份与红利类型不能混用；118%不代表新华全部产品的红利实现率。投资能力是影响分红的基础之一，但不等于未来分红保证；保险不是银行存款。</div>`,4);
 const pages=[p1,p2,p3,p4];clone.remove();root.append(...pages);
 const metrics=d.metrics.filter(m=>m.status==='confirmed');for(const m of metrics){if(!root.querySelector(`[data-metric="${m.id}"]`)?.textContent.includes(m.value))throw Error('正式指标遗漏：'+m.id);}
 const requireText=(n,t,label)=>{if(!n.textContent.replace(/\s+/g,'').includes(String(t).replace(/\s+/g,'')))throw Error('正式内容核对失败：'+label);};
 for(const n of clone.querySelectorAll('.kt-timeline .kt-event'))requireText(p1,n.textContent,'公司时间线');
 for(const v of [o.huijin.directPct,o.huijin.assetPct,o.baowu.directPct,o.baowu.subsidiaryPct,o.baowu.combinedPct])requireText(p1,v+'%','股东比例');
 for(const [name,value] of d.history.items){requireText(p2,name,'历史指标');requireText(p2,value,'历史数据');}
 for(const [name,value] of d.longTerm.items){requireText(p3,name,'历史投资指标');requireText(p3,value,'历史投资数据');}
 for(const c of oldCases.children)requireText(p3,c.textContent,'投资项目正文');
 for(const [name,value] of d.allocation.items){requireText(p3,name,'资产分类');requireText(p3,value.toFixed(1)+'%','资产占比');}
 if(Math.abs(d.allocation.items.reduce((s,x)=>s+x[1],0)-100)>.01)throw Error('资产占比口径不完整');
 for(const n of clone.querySelectorAll('[data-module="logic"] .kt-node,[data-module="logic"] .kt-contract>div'))requireText(p4,n.textContent,'分红机制正文');
 for(const r of d.rates.filter(r=>r.status==='confirmed')){requireText(p4,r.product,'已核验产品');requireText(p4,r.rate+'%','红利实现率');}
 const expectedTextSegments=textSegments(root);const modules=stage.companyBaseline.modules.map(m=>({id:m.id,title:m.title,passed:true,disposition:m.id==='company-7'?'历史数据保留，原始来源索引按要求不附在图册内':'内容核对通过',pages:m.id==='company-0'?[1,2]:m.id==='identity'||m.id==='ownership'||m.id==='company-0'?[1]:m.id==='operation'||m.id==='company-7'?[2]:m.id==='investment'?[3]:[4]}));
 window.HubContentExport.lastBrochureLayout=pages.map(p=>({page:p.dataset.brochurePage,height:p.getBoundingClientRect().height,scrollHeight:p.scrollHeight,parts:[...p.querySelector('.bg-body').children].map(n=>({class:n.className,height:n.getBoundingClientRect().height,font:doc.defaultView.getComputedStyle(n).fontSize}))}));
 const details=[];for(const p of pages){const box=p.getBoundingClientRect(),content=p.querySelector('.bg-body').getBoundingClientRect();if(p.scrollHeight>box.height+1)throw Error('蓝金介绍页'+p.dataset.brochurePage+'内容超出A4版心（'+p.scrollHeight+'/'+box.height+'），已停止，未缩小字号');for(const n of p.querySelectorAll('*')){if(n.closest('svg'))continue;const r=n.getBoundingClientRect();if(r.width&&r.height&&(r.left<box.left+5||r.right>box.right-5||r.bottom>box.bottom-7))throw Error('蓝金介绍页元素越界：'+n.className);}details.push({footer:'',appendix:false,height:box.height,contentHeight:content.height,contentBottom:Math.max(...[...p.querySelectorAll('.bg-body>div')].map(n=>n.getBoundingClientRect().bottom))-box.top});}
 const audit={company:true,brochure:true,layout:'blue-gold-four-page',mode,passed:true,pageCount:4,modules,metricIds:metrics.map(m=>m.id),sourceDataVersion:d.updatedAt,sourceReferences:d.sources,omitted:['逐模块原始文件编号与长来源备注','重复术语说明','自动导出元数据'],expectedTextSegments,footers:0,pages:details,headings:[...root.querySelectorAll('h1,h2')].map(n=>n.textContent),graphs:{svgs:root.querySelectorAll('svg').length,tables:root.querySelectorAll('table').length,bars:d.allocation.items.map(([label,value])=>({label,value})),timelines:1,chains:1}};
 window.HubContentExport.lastCompanyAudit=audit;if(mode.includes('pdf'))window.HubContentExport.lastPDFLayout=audit;return pages;
}
window.HubCompanyBrochure={css,build};
})();
