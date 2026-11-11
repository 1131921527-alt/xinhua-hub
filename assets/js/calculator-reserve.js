/* Presentation policy only: never changes a calculator's result or rate formula. */
(function(root){
'use strict';
function end(rows,{year=r=>r.year,benefit=r=>r.survivalTotal,principal,term=0,rate}={}){
 if(!rows.length)return 0;
 if(!Number.isFinite(principal)||principal<=0)throw Error('储备期缺少有效保费口径');
 const recovered=rows.find(r=>Number.isFinite(benefit(r))&&benefit(r)>=principal);
 let last=Math.max(3,term,recovered?year(recovered)-1:year(rows.at(-1)));
 // A previously unavailable rate is not invented merely to shorten the reserve block.
 if(rate){const first=rows.find(r=>year(r)>last&&Number.isFinite(rate(r)));last=first?year(first)-1:Math.max(last,year(rows.at(-1)));}
 return last;
}
function restore(body){for(const c of body.querySelectorAll('[data-reserve-column]')){c.removeAttribute('rowspan');c.hidden=false;c.style.removeProperty('display');c.classList.remove('calc-reserve-merged');c.textContent='储备期';}}
function merge(body){restore(body);const rows=[...body.rows].filter(r=>!r.hidden&&r.style.display!=='none');const keys=new Set([...body.querySelectorAll('[data-reserve-column]')].map(c=>c.dataset.reserveColumn));
 for(const key of keys){let first=null,count=0;for(const row of rows){const c=[...row.cells].find(c=>c.dataset.reserveColumn===key);if(!c){first=null;count=0;continue;}if(!first){first=c;count=1;first.classList.add('calc-reserve-merged');first.innerHTML='<span>储备期</span>';}else{count++;c.style.display='none';}first.rowSpan=count;first.style.verticalAlign='middle';first.style.textAlign='center';} }
}
// html2canvas can repaint later row backgrounds over rowspan text. Repaint only
// the merged reserve cells after rasterization, using their actual DOM bounds.
function paint(canvas,container){const box=container.getBoundingClientRect(),sx=canvas.width/box.width,ctx=canvas.getContext('2d');let count=0;ctx.save();ctx.setTransform(1,0,0,1,0,0);for(const cell of container.querySelectorAll('.calc-reserve-merged')){const r=cell.getBoundingClientRect();if(!r.width||!r.height)continue;const s=getComputedStyle(cell),x=(r.left-box.left)*sx,y=(r.top-box.top)*sx,w=r.width*sx,h=r.height*sx;ctx.fillStyle=s.backgroundColor;ctx.fillRect(x,y,w,h);ctx.strokeStyle=s.borderTopColor;ctx.lineWidth=sx;ctx.strokeRect(x+sx/2,y+sx/2,w-sx,h-sx);ctx.fillStyle=s.color;ctx.font=s.fontWeight+' '+parseFloat(s.fontSize)*sx+'px '+s.fontFamily;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('储备期',x+w/2,y+h/2);count++;}ctx.restore();return count;}
const api={end,merge,restore,paint};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CalculatorReserve=api;
if(typeof document!=='undefined'){const style=document.createElement('style');style.textContent='.calc-reserve-merged{background:var(--calc-soft,#eff6ff)!important;text-align:center!important;vertical-align:middle!important;font-weight:600}.calc-reserve-merged>span{display:block;text-align:center}';document.head.append(style);}
})(typeof globalThis!=='undefined'?globalThis:this);
