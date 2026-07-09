# -*- coding: utf-8 -*-
"""
条款 PDF -> 微信文字版翻页 HTML 生成器
用法: python gen_clause.py <pdf路径> <产品码> <产品名> <输出html>
生成蓝白配色、移动端上下翻页、章节跳转、字号可调的文字版条款页(内嵌JSON, 无CORS依赖)
"""
import sys, re, json, datetime
import fitz

TEMPLATE = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>__NAME__ · 条款文字版</title>
<style>
:root{
  --blue:#1D4ED8; --blue2:#2563EB; --blue3:#1E40AF;
  --bg:#F1F5F9; --card:#FFFFFF; --ink:#1E293B; --sub:#64748B;
  --line:#E2E8F0; --accent:#EFF6FF;
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;padding:0}
body{background:var(--bg);color:var(--ink);font-family:"PingFang SC","Microsoft YaHei",sans-serif;
  font-size:17px;line-height:1.9;-webkit-font-smoothing:antialiased}
.topbar{position:sticky;top:0;z-index:30;background:linear-gradient(135deg,var(--blue),var(--blue2));
  color:#fff;padding:12px 16px;display:flex;align-items:center;gap:10px;box-shadow:0 2px 8px rgba(29,78,216,.25)}
.topbar .ttl{font-weight:700;font-size:16px;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.progress{height:3px;background:rgba(255,255,255,.3);position:sticky;top:0;z-index:31}
.progress>i{display:block;height:100%;width:0;background:#fff;transition:width .15s}
.wrap{max-width:680px;margin:0 auto;padding:14px 14px 90px}
.sec{background:var(--card);border-radius:14px;padding:18px 16px;margin:12px 0;
  box-shadow:0 1px 4px rgba(15,23,42,.06);border:1px solid var(--line)}
.sec h2{margin:0 0 10px;font-size:18px;color:var(--blue3);display:flex;align-items:center;gap:8px}
.sec h2 .badge{background:var(--accent);color:var(--blue3);font-size:13px;padding:2px 10px;border-radius:20px;font-weight:700;white-space:nowrap}
.sec .body{white-space:pre-wrap;word-break:break-word;color:var(--ink)}
.cover .body{color:var(--sub);font-size:15px;text-align:center;padding:8px 0}
.tip{background:var(--accent);border:1px solid #BFDBFE;color:#1E40AF;border-radius:12px;
  padding:10px 14px;font-size:13px;margin:12px 0;line-height:1.7}
.fab{position:fixed;right:16px;bottom:18px;z-index:40;display:flex;flex-direction:column;gap:10px}
.fab button{width:48px;height:48px;border:none;border-radius:50%;background:var(--blue);color:#fff;
  font-size:18px;box-shadow:0 4px 14px rgba(29,78,216,.4);display:flex;align-items:center;justify-content:center}
.fab button:active{transform:scale(.92)}
.drawer{position:fixed;inset:0;z-index:50;background:rgba(15,23,42,.45);display:none}
.drawer.open{display:block}
.drawer .panel{position:absolute;right:0;top:0;bottom:0;width:78%;max-width:320px;background:#fff;
  padding:18px 14px;overflow:auto}
.drawer .panel h3{margin:4px 0 14px;color:var(--blue3);font-size:16px}
.drawer .toc{display:flex;flex-direction:column;gap:2px}
.drawer .toc a{display:block;padding:11px 12px;border-radius:10px;color:var(--ink);text-decoration:none;
  font-size:15px;border:1px solid transparent}
.drawer .toc a:active{background:var(--accent);border-color:#BFDBFE}
.drawer .close{position:absolute;left:12px;top:14px;background:none;border:none;font-size:22px;color:var(--sub)}
</style>
</head>
<body>
<div class="topbar">
  <span class="ico">📜</span>
  <span class="ttl" id="barTtl">__NAME__ · 条款文字版</span>
  <button id="tocBtn" style="background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:8px;padding:6px 10px;font-size:13px">目录</button>
</div>
<div class="progress"><i id="prog"></i></div>
<div class="wrap" id="wrap"></div>
<div class="fab">
  <button id="fsUp" title="A-">A-</button>
  <button id="fsDn" title="A+">A+</button>
  <button id="top" title="顶部">↑</button>
</div>
<div class="drawer" id="drawer">
  <div class="panel">
    <button class="close" id="closeDrawer">×</button>
    <h3>条款目录</h3>
    <div class="toc" id="toc"></div>
  </div>
</div>
<script>
const CLAUSE = /*__DATA__*/;
const wrap=document.getElementById('wrap');
const toc=document.getElementById('toc');
document.getElementById('barTtl').textContent=CLAUSE.name+' · 条款文字版';
document.title=CLAUSE.name+' · 条款文字版';
const tip=document.createElement('div');
tip.className='tip';
tip.innerHTML='本文字版由官方条款 PDF（《'+CLAUSE.source+'》）自动提取生成，仅供微信端快速预览查阅；如与官方纸质/PDF条款不一致，以官方条款为准。生成日期：'+CLAUSE.generated+'。';
wrap.appendChild(tip);
CLAUSE.sections.forEach((s,i)=>{
  const d=document.createElement('div');
  d.className='sec'+(s.no==='封面'?' cover':'');
  d.id='sec'+i;
  const h=document.createElement('h2');
  if(s.no && s.no!=='封面'){ const b=document.createElement('span'); b.className='badge'; b.textContent=s.no; h.appendChild(b); }
  h.appendChild(document.createTextNode(s.title||''));
  const body=document.createElement('div'); body.className='body'; body.textContent=s.body||'';
  d.appendChild(h); d.appendChild(body); wrap.appendChild(d);
  const a=document.createElement('a'); a.href='#sec'+i; a.textContent=(s.no&&s.no!=='封面'?s.no+' ':'')+s.title;
  a.onclick=()=>document.getElementById('drawer').classList.remove('open');
  toc.appendChild(a);
});
const prog=document.getElementById('prog');
window.addEventListener('scroll',()=>{
  const h=document.documentElement; const p=h.scrollTop/(h.scrollHeight-h.clientHeight||1);
  prog.style.width=(p*100)+'%';
});
let fs=17;
document.getElementById('fsUp').onclick=()=>{fs=Math.max(14,fs-1);document.body.style.fontSize=fs+'px';};
document.getElementById('fsDn').onclick=()=>{fs=Math.min(22,fs+1);document.body.style.fontSize=fs+'px';};
document.getElementById('top').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
const drawer=document.getElementById('drawer');
document.getElementById('tocBtn').onclick=()=>drawer.classList.add('open');
document.getElementById('closeDrawer').onclick=()=>drawer.classList.remove('open');
drawer.onclick=(e)=>{ if(e.target===drawer) drawer.classList.remove('open'); };
</script>
</body>
</html>'''

def main():
    PDF, CODE, NAME, OUT = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    doc = fitz.open(PDF)
    merged = []
    for p in doc:
        for ln in p.get_text().split("\n"):
            ln = ln.strip()
            if ln:
                merged.append(ln)
    heading_re = re.compile(r'^(第[一二三四五六七八九十百零]+条)\s*([^\n]*)')
    sections = []
    cur = None
    buf = []
    for ln in merged:
        m = heading_re.match(ln)
        if m:
            if cur:
                cur['body'] = "\n".join(buf).strip()
                sections.append(cur)
            cur = {'no': m.group(1), 'title': m.group(2).strip(), 'body': ''}
            buf = []
        else:
            if ln.startswith('释义') and (cur is None or cur.get('no') != '释义'):
                if cur:
                    cur['body'] = "\n".join(buf).strip(); sections.append(cur)
                cur = {'no': '释义', 'title': '释义', 'body': ''}; buf = []; continue
            if cur is None:
                if not sections or sections[0].get('no') != '__cover':
                    cur = {'no': '__cover', 'title': NAME, 'body': ''}; buf = []
                buf.append(ln)
            else:
                buf.append(ln)
    if cur:
        cur['body'] = "\n".join(buf).strip()
        sections.append(cur)

    clean = []
    for s in sections:
        body = re.sub(r'^\s*\d{4,6}\s*$', '', s['body'], flags=re.M)
        body = re.sub(r'第\d+ 页', '', body)
        if s['no'] == '__cover':
            clean.append({'no': '封面', 'title': NAME, 'body': body.strip()})
        else:
            clean.append({'no': s['no'], 'title': s['title'], 'body': body.strip()})

    data = {
        'code': CODE, 'name': NAME,
        'source': PDF.split('/')[-1],
        'generated': datetime.date.today().isoformat(),
        'sections': clean,
    }
    html = (TEMPLATE.replace('__NAME__', NAME)
            .replace('/*__DATA__*/', json.dumps(data, ensure_ascii=False)))
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(html)
    print('OK ->', OUT, '| sections:', len(clean))

if __name__ == '__main__':
    main()
