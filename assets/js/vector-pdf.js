(function(){
'use strict';
let resources;
const base=new URL('../../',document.currentScript.src);
const binary=async name=>{const r=await fetch(new URL('assets/vendor/export/'+name,base));if(!r.ok)throw Error('中文字体资源未完整加载，已停止生成PDF');return new Uint8Array(await r.arrayBuffer());};
const b64=bytes=>{let s='';for(let i=0;i<bytes.length;i+=32768)s+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(s);};
async function setup(pdf){
 resources??=Promise.all([binary('HubExportSans-Regular.ttf'),binary('HubExportSans-Bold.ttf'),fetch(new URL('assets/vendor/export/font-coverage.json',base)).then(r=>{if(!r.ok)throw Error('字体映射未加载');return r.json();})]);
 const [regular,bold,coverage]=await resources;pdf.addFileToVFS('HubExportSans-Regular.ttf',b64(regular));pdf.addFont('HubExportSans-Regular.ttf','HubExportSans','normal');pdf.addFileToVFS('HubExportSans-Bold.ttf',b64(bold));pdf.addFont('HubExportSans-Bold.ttf','HubExportSans','bold');
 return {codes:new Set(coverage.codepoints),ascent:coverage.ascentRatio||1.16,textCharacters:0,shapes:0,svgs:0,sourceImages:0};
}
const color=s=>{const n=(s||'').match(/[\d.]+/g)?.map(Number);return n&&n.length>=3?{rgb:n.slice(0,3),alpha:n.length>3?n[3]:1}:{rgb:[255,255,255],alpha:0};};
function fill(pdf,c,opacity=1){pdf.setFillColor(...c.rgb.map(v=>Math.round(v*c.alpha*opacity+255*(1-c.alpha*opacity))));}
async function page(pdf,node,margin,audit){
 const box=node.getBoundingClientRect(),unit=(pdf.internal.pageSize.getWidth()-margin*2)/box.width,win=node.ownerDocument.defaultView;
 const rect=n=>{const r=n.getBoundingClientRect();return{x:margin+(r.left-box.left)*unit,y:margin+(r.top-box.top)*unit,w:r.width*unit,h:r.height*unit,r};};
 const pt=px=>px*unit*72/25.4;
 async function paint(e){const s=win.getComputedStyle(e),p=rect(e);if(!p.w||!p.h||s.display==='none'||s.visibility==='hidden')return;
  if(e.tagName.toLowerCase()==='svg'){await pdf.svg(e,{x:p.x,y:p.y,width:p.w,height:p.h});audit.svgs++;return;}
  const c=color(s.backgroundColor),radius=Math.min(parseFloat(s.borderRadius)||0,p.r.width/2,p.r.height/2)*unit;
  if(c.alpha>0){fill(pdf,c,parseFloat(s.opacity));pdf.roundedRect(p.x,p.y,p.w,p.h,radius,radius,'F');audit.shapes++;}
  if(s.backgroundImage.startsWith('linear-gradient')){const colors=s.backgroundImage.match(/rgba?\([^)]+\)/g)?.map(color);if(colors?.length>1){const a=colors[0],b=colors.at(-1);pdf.setFillColor(...a.rgb.map((v,k)=>Math.round((v+b.rgb[k])/2)));pdf.roundedRect(p.x,p.y,p.w,p.h,radius,radius,'F');audit.shapes++;}}
  for(const edge of ['Top','Right','Bottom','Left']){const width=parseFloat(s['border'+edge+'Width']),style=s['border'+edge+'Style'],c=color(s['border'+edge+'Color']);if(!width||style==='none'||!c.alpha)continue;pdf.setDrawColor(...c.rgb);pdf.setLineWidth(width*unit);const coords=edge==='Top'?[p.x,p.y,p.x+p.w,p.y]:edge==='Right'?[p.x+p.w,p.y,p.x+p.w,p.y+p.h]:edge==='Bottom'?[p.x,p.y+p.h,p.x+p.w,p.y+p.h]:[p.x,p.y,p.x,p.y+p.h];pdf.line(...coords);audit.shapes++;}
  if(e.matches('.kt-event')){const before=win.getComputedStyle(e,'::before'),size=parseFloat(before.width),top=parseFloat(before.top),left=parseFloat(before.left),c=color(before.backgroundColor);if(size&&c.alpha){fill(pdf,c);pdf.circle(p.x+(left+size/2)*unit,p.y+(top+size/2)*unit,size/2*unit,'F');audit.shapes++;}}
  if(e.matches('.kt-arrow')){pdf.setDrawColor(98,134,183);pdf.setFillColor(98,134,183);pdf.setLineWidth(unit*2);const x=p.x+p.w/2,y=p.y+p.h/2;pdf.line(x,y-7*unit,x,y+4*unit);pdf.triangle(x-4*unit,y+2*unit,x+4*unit,y+2*unit,x,y+8*unit,'F');audit.shapes+=2;return;}
  if(e.tagName==='IMG'){pdf.addImage(e,'PNG',p.x,p.y,p.w,p.h);audit.sourceImages++;return;}
  for(const child of e.children)await paint(child);
 }
 await paint(node);
 const walker=node.ownerDocument.createTreeWalker(node,NodeFilter.SHOW_TEXT);let text;
 while(text=walker.nextNode()){
  const parent=text.parentElement;if(parent.closest('svg,.kt-arrow,script,style,[hidden]'))continue;
  const s=win.getComputedStyle(parent);if(s.display==='none'||s.visibility==='hidden')continue;const size=parseFloat(s.fontSize),weight=parseInt(s.fontWeight)||400,c=color(s.color);if(!c.alpha)continue;
  pdf.setFont('HubExportSans',weight>=600?'bold':'normal');pdf.setFontSize(pt(size));pdf.setTextColor(...c.rgb);
  const range=node.ownerDocument.createRange();let offset=0,line='',start=null,last=null;
  const flush=()=>{if(!line||!start)return;pdf.text(line,margin+(start.left-box.left)*unit,margin+(start.top-box.top+size*audit.ascent)*unit,{baseline:'alphabetic'});if(s.textDecorationLine.includes('underline')){pdf.setDrawColor(...c.rgb);pdf.setLineWidth(unit);pdf.line(margin+(start.left-box.left)*unit,margin+(start.top-box.top+size*audit.ascent+2)*unit,margin+(last.right-box.left)*unit,margin+(start.top-box.top+size*audit.ascent+2)*unit);}audit.textCharacters+=[...line].length;line='';start=null;last=null;};
  for(const char of text.textContent){const len=char.length;range.setStart(text,offset);range.setEnd(text,offset+len);offset+=len;const r=range.getBoundingClientRect();if(!r.width||!r.height||/[\r\n\t]/.test(char))continue;if(!audit.codes.has(char.codePointAt(0)))throw Error('PDF中文字体缺少字形“'+char+'”，已停止；请更新正式字体映射。');if(start&&(Math.abs(r.top-start.top)>0.8||r.left<last.left-0.5)){flush();}if(!start)start=r;line+=char;last=r;}
  flush();
 }
 for(const a of node.querySelectorAll('a[href]'))if(/^https?:/.test(a.href))for(const r of a.getClientRects())if(r.width&&r.height)pdf.link(margin+(r.left-box.left)*unit,margin+(r.top-box.top)*unit,r.width*unit,r.height*unit,{url:a.href});
 window.HubContentExport.lastVectorPDF={textCharacters:audit.textCharacters,vectorShapes:audit.shapes,svgs:audit.svgs,sourceImages:audit.sourceImages,wholePageRaster:false};
}
window.HubVectorPDF={setup,page};
})();
