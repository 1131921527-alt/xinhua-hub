(function(){
'use strict';
const loaded={};function load(file,test){if(test())return Promise.resolve();return loaded[file]||=(new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='assets/vendor/export/'+file;s.onload=()=>test()?resolve():reject(Error('导出组件未能就绪'));s.onerror=()=>reject(Error('导出组件加载失败，请检查网络'));document.head.append(s);}));}
// A4 横向 297×210mm，四周留 5mm；内容区 287×200mm。
// 续表策略：内容超高时减少本页行数另起一页，绝不缩小表格、绝不裁切。
const A4_MARGIN=5,A4_BODY_W=297-2*A4_MARGIN,A4_BODY_H=210-2*A4_MARGIN;
async function generate({mode,plan,title,progress}){
 // 每次导出先清空审计快照：失败或中途取消都不会残留上一次成功导出的值。
 window.modernExportAudit=null;
 plan=plan.cloneNode(true);CalculatorReserve.restore(plan.querySelector('tbody'));
 const cleanImage=mode==='png'&&plan.dataset.clientImage==='true',scale=cleanImage?3:2;
 // 客户版：计划书内自带一行常驻的非保证利益提示（正式资料原文），导出时保留；
 // 折叠区里的完整测算口径不再整段塞进图片，避免把 A4 版面撑爆。
 if(plan.dataset.clientImage==='true'){
  plan.querySelectorAll('p.mc-foot[hidden]').forEach(n=>n.remove());
  if(!cleanImage){const params=document.querySelector('.mc-professional #parameters');if(params)plan.querySelector('h2').after(params.cloneNode(true));}
 }
 const full=$('#display').value==='all',theme=CalculatorTheme.get();const selected=CalculatorColumns.selected(),rows=[...plan.querySelectorAll('tbody tr')];if(!selected.length||!rows.length)throw Error('请先完成测算并至少选择一列。');await document.fonts.ready;
 const maxWidth=mode==='mobile-pdf'?750:mode==='a4-pdf'?1000:mode==='pptx'?1400:2000,limit=maxWidth-48,bands=[];let band=[],used=0;
 selected.forEach((c,index)=>{if(band.length&&used+c.width>limit){bands.push(band);band=[];used=0;}band.push({...c,index});used+=c.width;});if(band.length)bands.push(band);
 // Each column band keeps the same selected-column order. Year/age repeat only if selected.
 for(let i=1;i<bands.length;i++){const repeat=selected.map((c,index)=>({...c,index})).filter(c=>['year','ageEnd'].includes(c.key)&&!bands[i].some(o=>o.key===c.key));while(repeat.reduce((n,c)=>n+c.width,0)+bands[i].reduce((n,c)=>n+c.width,0)>limit&&bands[i].length>1){const c=bands[i].pop();if(!bands[i+1])bands[i+1]=[];bands[i+1].unshift(c);}bands[i]=[...repeat,...bands[i]];}
 const perPage=mode==='pptx'||mode==='a4-pdf'?6:mode==='mobile-pdf'||cleanImage?12:24,files=[];let pdf,ppt;
 if(mode.includes('pdf')){await load('jspdf.umd.min.js',()=>!!window.jspdf?.jsPDF);pdf=new jspdf.jsPDF({orientation:mode==='a4-pdf'?'landscape':'portrait',unit:'mm',format:mode==='a4-pdf'?'a4':[108,192],compress:true});pdf.setProperties({title,subject:'高清图像型，按列分组与年度续表；同一计算结果'});}
 if(mode==='pptx'){await load('pptxgen.bundle.js',()=>!!window.PptxGenJS);ppt=new PptxGenJS();ppt.layout='LAYOUT_WIDE';ppt.title=title;ppt.subject='高清视觉型；同一结果表，非逐元素可编辑';}
 // 按宽度铺满 A4 内容区时，允许的最大像素高度；超过就分页续表。
 const a4MaxHeight=Math.floor(maxWidth*A4_BODY_H/A4_BODY_W);
 let page=0,clone=null;const renderedPages=[],pageHeights=[];
 // 构造一段（一个列组 × 若干行）的真实 DOM，测量其自然高度；不生成画布，便于重试。
 async function buildSegment(cols,bandIndex,start,count){
  const width=mode==='pptx'?1400:mode.includes('pdf')?maxWidth:Math.max(750,cols.reduce((n,c)=>n+c.width,0)+48);
  const c=plan.cloneNode(true);c.removeAttribute('id');c.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
  c.classList.add('mc-capture');if(cleanImage)c.classList.add('mc-client-image');if(mode==='pptx')c.classList.add('mc-ppt');
  if(mode==='a4-pdf'){c.querySelectorAll('.mc-foot').forEach(n=>n.style.setProperty('font-size','12px','important'));c.querySelector('h2').style.fontSize='24px';}
  c.style.setProperty('width',width+'px','important');
  const table=c.querySelector('table'),head=table.querySelector('thead'),body=table.querySelector('tbody');
  table.querySelector('colgroup')?.remove();table.style.minWidth='0';table.style.width='100%';
  head.innerHTML='<tr>'+cols.map(x=>'<th>'+x.label+'</th>').join('')+'</tr>';
  body.replaceChildren(...rows.slice(start,start+count).map(row=>{const tr=row.cloneNode(false);cols.forEach(x=>tr.append(row.children[x.index].cloneNode(true)));return tr;}));
  const colgroup=document.createElement('colgroup');cols.forEach(x=>{const col=document.createElement('col');col.style.width=x.width+'px';colgroup.append(col);});table.prepend(colgroup);CalculatorReserve.merge(body);
  const label=document.createElement('p');label.className='mc-band-note';
  label.textContent=`${full?'完整年度':'重点年度节选'} · 列组 ${bandIndex+1}/${bands.length} · 当前范围行 ${start+1}—${Math.min(rows.length,start+count)} / ${rows.length} · ${theme==='orange'?'商务橙':'经典蓝'}`;
  if(!cleanImage)c.querySelector('.mc-table-scroll').before(label);
  // 客户图只保留常驻提示行；其余参数/口径说明不进客户交付图。
  if(cleanImage)c.querySelectorAll('.mc-params,.mc-foot,.mc-band-note').forEach(n=>n.remove());
  document.body.append(c);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const height=mode==='pptx'?788:c.scrollHeight;
  return {clone:c,width,height,body,dispose(){c.remove();}};
 }
 try{
  for(let b=0;b<bands.length;b++){
   let start=0;
   while(start<rows.length){
    let count=Math.min(perPage,rows.length-start),seg=null;
    // A4 横向续表：超高就减少本页行数重新排版，不缩小字号、不裁切、不放弃导出。
    for(let attempt=0;attempt<8;attempt++){
     const s=await buildSegment(bands[b],b,start,count);
     if(mode!=='a4-pdf'||s.height<=a4MaxHeight||count<=1){seg=s;break;}
     const measured=s.height;s.dispose();
     const next=Math.max(1,Math.min(count-1,Math.floor(count*a4MaxHeight/measured*0.94)));
     if(next>=count)count--;else count=next;
    }
    if(!seg)seg=await buildSegment(bands[b],b,start,count);
    clone=seg.clone;page++;pageHeights.push({rows:count,height:seg.height});progress(`正在生成第 ${page} 页 / 段…`);
    if(clone.scrollWidth>seg.width+1||mode==='pptx'&&clone.scrollHeight>788){seg.dispose();throw Error('当前字号或列配置超过安全版面，请减少单列宽度或使用简洁客户模板；未裁切。');}
    if(seg.width*seg.height*4>16000000){seg.dispose();throw Error('单页超过高清内存上限，已停止；请减少列宽。');}
    // html2canvas中文换行与DOM度量可能有偏差；PNG末尾预留安全画布，不裁掉来源文字。
    const canvasHeight=seg.height+(mode==='png'&&!cleanImage?120:0);
    if(seg.width*canvasHeight*scale*scale>16000000){seg.dispose();throw Error('含安全留白的图片超出内存上限，请减少列宽。');}
    const canvas=await html2canvas(clone,{scale,width:seg.width,height:canvasHeight,windowWidth:2200,scrollX:0,scrollY:0,backgroundColor:'#fff',logging:false});
    CalculatorReserve.paint(canvas,clone);
    if(cleanImage){const box=clone.getBoundingClientRect(),last=seg.body.lastElementChild.getBoundingClientRect();if(last.bottom-box.top>canvasHeight||last.right-box.left>seg.width){canvas.width=canvas.height=1;seg.dispose();throw Error('表格边界超出图片，已停止，未输出裁切图片。');}renderedPages.push({text:clone.innerText,rows:seg.body.rows.length,lastRow:seg.body.lastElementChild.innerText,width:canvas.width,height:canvas.height,lastBottom:last.bottom-box.top});}
    if(pdf){
     if(mode==='a4-pdf'){
      // h 按内容区宽度等比换算；buildSegment 已保证 height 不超 a4MaxHeight，故 h<=210。
      const h=seg.height/seg.width*A4_BODY_W+2*A4_MARGIN;
      if(page>1)pdf.addPage('a4','landscape');
      pdf.addImage(canvas.toDataURL('image/png'),'PNG',A4_MARGIN,A4_MARGIN,A4_BODY_W,Math.min(A4_BODY_H,h-2*A4_MARGIN));
     }else{
      const margin=5,w=108,h=seg.height/seg.width*(w-2*margin)+2*margin;
      if(page===1)pdf.deletePage(1);pdf.addPage([108,Math.max(108,h)],'portrait');
      pdf.addImage(canvas.toDataURL('image/png'),'PNG',margin,margin,w-2*margin,h-2*margin);
     }
    }
    else if(ppt){const slide=ppt.addSlide();slide.addImage({data:canvas.toDataURL('image/png'),x:0,y:0,w:13.333333,h:7.5});slide.addNotes(clone.innerText+'\n高清视觉型，同一测算结果，来源及假设见正文。');}
    else{const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));if(!blob)throw Error('图片编码失败');files.push({blob,extension:'png',part:page});}
    canvas.width=canvas.height=1;seg.dispose();clone=null;
    start+=count;
   }
  }
  if(pdf)files.push({blob:pdf.output('blob'),extension:'pdf',part:mode});
  if(ppt)files.push({blob:await ppt.write({outputType:'blob'}),extension:'pptx',part:'16比9视觉版'});
  window.modernExportAudit={mode,cleanImage,scale,renderedPages,pageHeights,selectedColumns:selected.map(c=>c.key),rows:rows.length,columnBands:bands.length,pages:page,a4MaxHeight:a4MaxHeight,theme,resultSource:plan.querySelector('.mc-foot:last-child')?.textContent};
  return files;
 }finally{clone?.remove();}
}
const $=s=>document.querySelector(s);window.CalculatorResultExport={generate};
})();
