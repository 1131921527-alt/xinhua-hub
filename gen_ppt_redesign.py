# -*- coding: utf-8 -*-
# -*- coding: utf-8 -*-
"""
将 5 份 PPT/Word 资料「内容理解后重新编排」为高端商务风在线网页。
设计：天蓝 + 白 + 深蓝（≤3 主色），可下载整页图片（html2canvas），含实时时钟与新华元素。
用法：python gen_ppt_redesign.py
"""
import os
from html import escape

ROOT = os.path.dirname(os.path.abspath(__file__))

def esc(s):
    return escape(str(s))

# ========================= 共享样式 =========================
CSS = """
:root{
  --blue-900:#1E3A8A; --blue-800:#1E40AF; --blue-700:#1D4ED8;
  --blue-600:#2563EB; --blue-500:#3B82F6; --blue-300:#93C5FD;
  --blue-100:#DBEAFE; --blue-50:#EFF6FF;
  --ink:#0F172A; --ink-2:#334155; --ink-3:#64748B; --ink-4:#94A3B8;
  --white:#FFFFFF; --line:#E6EDF7; --line-2:#DBE6F5;
  --shadow:0 10px 30px rgba(30,58,138,.10); --shadow-sm:0 4px 14px rgba(30,58,138,.08);
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html{scroll-behavior:smooth;}
body{font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;
  background:#F4F8FE;color:var(--ink);line-height:1.7;word-break:break-word;-webkit-font-smoothing:antialiased;}
a{color:inherit;text-decoration:none;}

/* 顶栏 */
.topbar{position:sticky;top:0;z-index:60;display:flex;align-items:center;gap:10px;
  padding:10px 16px;background:linear-gradient(120deg,var(--blue-900),var(--blue-600));color:#fff;
  box-shadow:0 4px 18px rgba(30,58,138,.25);}
.topbar .back{font-size:13px;opacity:.92;white-space:nowrap;padding:6px 8px;border-radius:8px;}
.topbar .back:active{background:rgba(255,255,255,.15);}
.topbar .t{flex:1;font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.topbar .clock{font-size:12px;font-variant-numeric:tabular-nums;opacity:.95;white-space:nowrap;
  background:rgba(255,255,255,.14);padding:5px 9px;border-radius:20px;}
.topbar .dl{font-size:13px;font-weight:600;white-space:nowrap;background:#fff;color:var(--blue-700);
  padding:7px 13px;border-radius:20px;display:inline-flex;align-items:center;gap:5px;cursor:pointer;border:none;}
.topbar .dl:active{transform:scale(.96);}

/* 子导航 */
.subnav{position:sticky;top:53px;z-index:55;background:rgba(255,255,255,.92);
  backdrop-filter:blur(8px);border-bottom:1px solid var(--line);overflow-x:auto;
  display:flex;gap:6px;padding:8px 12px;-webkit-overflow-scrolling:touch;}
.subnav::-webkit-scrollbar{height:0;}
.subnav a{font-size:12.5px;color:var(--ink-2);white-space:nowrap;padding:6px 11px;border-radius:18px;
  background:var(--blue-50);border:1px solid var(--line);}
.subnav a:active{background:var(--blue-100);}

/* 捕获区 */
#capture{background:#F4F8FE;padding-bottom:10px;}

/* Hero */
.hero{position:relative;overflow:hidden;color:#fff;
  background:linear-gradient(135deg,#1E3A8A 0%,#1D4ED8 55%,#2563EB 100%);
  padding:40px 20px 46px;}
.hero .blob{position:absolute;border-radius:50%;filter:blur(38px);opacity:.45;}
.hero .b1{width:230px;height:230px;background:#60A5FA;top:-70px;right:-50px;}
.hero .b2{width:180px;height:180px;background:#1E40AF;bottom:-70px;left:-40px;}
.hero .inner{position:relative;max-width:1000px;margin:0 auto;}
.hero .tag{display:inline-block;font-size:12px;letter-spacing:1px;background:rgba(255,255,255,.16);
  padding:4px 12px;border-radius:20px;margin-bottom:14px;}
.hero h1{font-size:27px;font-weight:800;line-height:1.3;letter-spacing:.5px;}
.hero .sub{margin-top:10px;font-size:15px;opacity:.92;max-width:680px;}
.hero .badge{margin-top:18px;display:inline-flex;align-items:center;gap:10px;
  background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);
  padding:9px 14px;border-radius:12px;font-size:13px;}
.hero .badge b{font-size:15px;}

/* 通用容器 */
.wrap{max-width:1000px;margin:0 auto;padding:0 16px;}
.sec{padding:30px 0 6px;}
.sec-head{display:flex;align-items:center;gap:11px;margin-bottom:16px;}
.sec-head .ic{width:38px;height:38px;border-radius:11px;background:var(--blue-100);
  color:var(--blue-700);display:flex;align-items:center;justify-content:center;font-size:19px;flex:none;}
.sec-head h2{font-size:20px;font-weight:800;color:var(--ink);}
.sec-head .en{font-size:12px;color:var(--ink-4);font-weight:600;letter-spacing:.5px;}
.lead{color:var(--ink-2);font-size:15px;margin-bottom:16px;}

/* 卡片网格 */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;}
.card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px;
  box-shadow:var(--shadow-sm);transition:transform .15s;}
.card:hover{transform:translateY(-3px);}
.card .ct{font-size:16px;font-weight:800;color:var(--blue-800);margin-bottom:6px;}
.card .cd{font-size:13.5px;color:var(--ink-2);line-height:1.6;}
.card .pill{display:inline-block;margin-top:10px;font-size:12px;color:var(--blue-700);
  background:var(--blue-50);border:1px solid var(--line-2);padding:4px 10px;border-radius:14px;}

/* 数据条 */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin:6px 0 4px;}
.stat{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px 16px;text-align:center;
  box-shadow:var(--shadow-sm);position:relative;overflow:hidden;}
.stat:before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--blue-600),var(--blue-500));}
.stat .num{font-size:26px;font-weight:800;color:var(--blue-700);font-variant-numeric:tabular-nums;line-height:1.2;}
.stat .num small{font-size:14px;font-weight:700;}
.stat .lb{margin-top:6px;font-size:13px;color:var(--ink-2);}
.stat .sb{margin-top:2px;font-size:11.5px;color:var(--ink-4);}

/* 表格 */
.tbl-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:6px 0;border-radius:14px;
  border:1px solid var(--line);box-shadow:var(--shadow-sm);}
table.tbl{border-collapse:collapse;width:100%;min-width:560px;font-size:13.5px;background:#fff;}
table.tbl thead th{background:linear-gradient(120deg,var(--blue-800),var(--blue-600));color:#fff;
  font-weight:700;padding:11px 12px;text-align:left;white-space:nowrap;font-size:13px;}
table.tbl tbody td{padding:10px 12px;border-top:1px solid var(--line);color:var(--ink-2);vertical-align:top;}
table.tbl tbody tr:nth-child(even){background:var(--blue-50);}
table.tbl tbody tr.hl{background:var(--blue-100);}
table.tbl tbody tr.hl td{color:var(--blue-800);font-weight:600;}
table.tbl td.r{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;}
table.tbl th.r{text-align:right;}
.tbl-cap{font-size:12.5px;color:var(--ink-4);margin:8px 2px 0;}

/* 双列键值表 */
table.kv{border-collapse:collapse;width:100%;font-size:14px;background:#fff;border-radius:14px;
  overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow-sm);}
table.kv td{padding:11px 14px;border-top:1px solid var(--line);vertical-align:top;}
table.kv td.k{width:34%;color:var(--blue-800);font-weight:700;background:var(--blue-50);}
table.kv td.v{color:var(--ink-2);}

/* 提示框 */
.callout{border-radius:14px;padding:15px 16px;margin:14px 0;font-size:14px;line-height:1.7;
  display:flex;gap:12px;align-items:flex-start;}
.callout .ci{font-size:18px;flex:none;line-height:1.4;}
.callout.info{background:var(--blue-50);border:1px solid var(--line-2);color:var(--ink-2);}
.callout.key{background:var(--blue-100);border:1px solid var(--blue-300);color:var(--blue-800);font-weight:600;}
.callout.warn{background:#FFF7ED;border:1px solid #FED7AA;color:#9A3412;}

/* 步骤 */
.steps{counter-reset:s;margin:8px 0;}
.steps .st{position:relative;padding:12px 14px 12px 52px;background:#fff;border:1px solid var(--line);
  border-radius:12px;margin-bottom:10px;box-shadow:var(--shadow-sm);}
.steps .st:before{counter-increment:s;content:counter(s);position:absolute;left:12px;top:12px;
  width:28px;height:28px;border-radius:50%;background:var(--blue-600);color:#fff;font-weight:800;
  display:flex;align-items:center;justify-content:center;font-size:14px;}
.steps .st b{color:var(--blue-800);}

/* FAQ */
.faq{margin:8px 0;}
.faq .q{background:#fff;border:1px solid var(--line);border-radius:12px;padding:13px 15px;margin-bottom:10px;
  box-shadow:var(--shadow-sm);}
.faq .q .qt{font-weight:800;color:var(--blue-800);font-size:14.5px;margin-bottom:6px;}
.faq .q .qa{color:var(--ink-2);font-size:13.5px;}

/* 页脚 */
.foot{margin-top:26px;background:linear-gradient(120deg,var(--blue-900),var(--blue-700));
  color:#fff;padding:26px 20px 34px;text-align:center;}
.foot .slogan{font-size:17px;font-weight:800;letter-spacing:1px;}
.foot .slogan small{display:block;font-size:12px;font-weight:500;opacity:.8;margin-top:4px;letter-spacing:0;}
.foot .disc{margin-top:14px;font-size:11.5px;line-height:1.7;opacity:.82;max-width:720px;margin-left:auto;margin-right:auto;}

@media (max-width:560px){
  .hero h1{font-size:22px;}
  .sec-head h2{font-size:18px;}
  .topbar .clock{display:none;}
  table.tbl{min-width:520px;}
}
"""

# ========================= 共享脚本 =========================
JS = """
(function(){
  // 实时时钟
  var clk=document.getElementById('clockText');
  function tick(){
    var n=new Date(),p=function(x){return (x<10?'0':'')+x;};
    if(clk) clk.textContent=n.getFullYear()+'年'+(n.getMonth()+1)+'月'+n.getDate()+'日 '+n.getHours()+'点'+p(n.getMinutes())+'分'+p(n.getSeconds())+'秒';
    setTimeout(tick,1000);
  }
  tick();
  // 下载图片
  window.downloadImage=function(){
    var el=document.getElementById('capture');
    var btn=document.getElementById('dlBtn');
    if(!window.html2canvas){alert('图片组件未加载，请联网后重试');return;}
    if(btn){btn.textContent='生成中…';btn.disabled=true;}
    html2canvas(el,{scale:2,backgroundColor:'#F4F8FE',useCORS:true,logging:false}).then(function(c){
      var a=document.createElement('a');
      a.download=(document.getElementById('pageName')?document.getElementById('pageName').value:'xinhua')+'.png';
      a.href=c.toDataURL('image/png');a.click();
      if(btn){btn.textContent='⬇ 下载图片';btn.disabled=false;}
    }).catch(function(e){alert('生成失败：'+(e&&e.message?e.message:e));if(btn){btn.textContent='⬇ 下载图片';btn.disabled=false;}});
  };
})();
"""

# ========================= 组件 =========================
def sec(sid, icon, title, en, inner):
    return f'<section class="sec" id="{sid}"><div class="wrap"><div class="sec-head"><div class="ic">{icon}</div><div><h2>{esc(title)}</h2><div class="en">{esc(en)}</div></div></div>{inner}</div></section>'

def lead(t): return f'<p class="lead">{esc(t)}</p>'

def cards(items):
    h='<div class="grid">'
    for it in items:
        pill=f'<span class="pill">{esc(it["pill"])}</span>' if it.get("pill") else ''
        h+=f'<div class="card"><div class="ct">{esc(it["t"])}</div><div class="cd">{esc(it["d"])}</div>{pill}</div>'
    return h+'</div>'

def stats(items):
    h='<div class="stats">'
    for it in items:
        sb=f'<div class="sb">{esc(it["sb"])}</div>' if it.get("sb") else ''
        h+=f'<div class="stat"><div class="num">{esc(it["num"])}</div><div class="lb">{esc(it["lb"])}</div>{sb}</div>'
    return h+'</div>'

def tbl(headers, rows, hl_rows=None, cap=None, right=None):
    hl_rows=hl_rows or []
    right=right or set()
    th=''.join(f'<th class="{"r" if i in right else ""}">{esc(x)}</th>' for i,x in enumerate(headers))
    tr=''
    for ri,r in enumerate(rows):
        cls=' class="hl"' if ri in hl_rows else ''
        td=''.join(f'<td class="{"r" if i in right else ""}">{esc(x)}</td>' for i,x in enumerate(r))
        tr+=f'<tr{cls}>{td}</tr>'
    caph=f'<div class="tbl-cap">{esc(cap)}</div>' if cap else ''
    return f'<div class="tbl-scroll"><table class="tbl"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div>{caph}'

def kv(rows):
    h='<table class="kv">'
    for k,v in rows:
        h+=f'<tr><td class="k">{esc(k)}</td><td class="v">{v}</td></tr>'
    return h+'</table>'

def callout(text, tone='info', ci='💡'):
    return f'<div class="callout {tone}"><span class="ci">{ci}</span><div>{text}</div></div>'

def steps(items):
    h='<div class="steps">'
    for it in items:
        h+=f'<div class="st">{it}</div>'
    return h+'</div>'

def faq(items):
    h='<div class="faq">'
    for q,a in items:
        h+=f'<div class="q"><div class="qt">Q：{esc(q)}</div><div class="qa">{a}</div></div>'
    return h+'</div>'

# ========================= 页面骨架 =========================
def page(name, nav, hero_inner, sections, slogan=True):
    nav_html='<nav class="subnav"><div class="wrap" style="display:flex;gap:6px;padding:0;">'+''.join(
        f'<a href="#{n[0]}">{esc(n[1])}</a>' for n in nav)+'</div></nav>'
    foot=''
    if slogan:
        foot=('<div class="foot"><div class="slogan">新华保险 保得长久 保得美好'
              '<small>NCI 新华保险 · A+H 上市 ·  Fortune 世界500强</small></div>'
              '<div class="disc">本资料为内部培训与学习交流使用，内容依据公开培训材料整理重构，'
              '仅供理解参考，不构成任何投资建议或收益承诺；具体保险责任、利益演示及减保规则等均以产品条款、'
              '保险合同及监管披露为准。分红型产品红利为非保证收益。</div></div>')
    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>{esc(name)} · 新华保险资料库</title>
<style>{CSS}</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
</head>
<body>
<input type="hidden" id="pageName" value="{esc(name)}">
<div class="topbar">
  <a class="back" href="../../index.html">← 返回</a>
  <div class="t">{esc(name)}</div>
  <div class="clock"><span id="clockText">--</span></div>
  <button class="dl" id="dlBtn" onclick="downloadImage()">⬇ 下载图片</button>
</div>
{nav_html}
<div id="capture">
  <header class="hero"><span class="blob b1"></span><span class="blob b2"></span>
    <div class="inner">{hero_inner}</div>
  </header>
  {sections}
  {foot}
</div>
<script>{JS}</script>
</body>
</html>'''

# ========================= 各页内容 =========================
def build_training():
    name='新华在售产品培训'
    nav=[('overview','产品总览'),('hongtai','宏泰'),('hongyu','宏御'),('fusheng','福盛世家'),
         ('hongyuan','宏愿'),('hengxiang','恒享'),('honghu','鸿鹄基金'),('rate','分红实力')]
    hero=(f'<span class="tag">内部培训 · 2026年4月</span>'
          f'<h1>新华保险 · 2026 在售产品培训</h1>'
          f'<div class="sub">五大主力产品解读 · 鸿鹄基金长期资金布局 · 分红实现率与投资收益全景</div>'
          f'<div class="badge">📌 <b>5 款主力</b>&nbsp; 分红 / 固定 / 养老年金 &nbsp;·&nbsp; 现价稳健 · 央企背书</div>')
    s=[]
    # 总览
    ov=cards([
        {'t':'宏泰世家 S03','d':'分红型增额终身寿。三年交 5 年覆盖总保费，1.2% 分红稳健靠谱，同档类型产品现价靠前。','pill':'分红增额 · 现价靠前'},
        {'t':'宏御世家 S11','d':'分红型增额终身寿。现价超高、老七家前三，3 年交 4 年回本，1.2% 分红稳健。','pill':'老七家现价前三 · 4年回本'},
        {'t':'福盛世家添翼版 G14','d':'2.0% 固定增额终身寿。利益确定写入合同，3 年交 4 年回本，含特定公共交通意外险。','pill':'固定2% · 确定给付'},
        {'t':'宏愿人生 S02','d':'分红型养老年金。面向 50 岁以上客户，70 岁起领年金，3 年交 5 年超所交保费。','pill':'分红养老 · 50岁+利好'},
        {'t':'恒享人生 G23','d':'固定年金险。现价覆盖总保费，年金为总保费的 2%，利益简单明了（固收型）。','pill':'固定年金 · 利益简单'},
    ])
    ov+=tbl(['产品','代码','男最高投保年龄(趸/3/5/10年)','女最高投保年龄','3年交起售','产品形态与特点'],
        [['宏泰世家（分红增额终身寿）','S03','64/63/62/60','67/67/66/64','3万','三年交5年覆盖总保费；1.2%分红稳健；同档现价靠前'],
         ['宏御世家（分红增额终身寿）','S11','65/65/64/61','69/69/68/64','2万','现价超高老七家前三；3年交4年回本；1.2%分红'],
         ['福盛世家添翼版（2.0%固定增额）','G14','68/68/67/65','72/72/70/65','2万','固定2%增额；3年交4年回本；含特定公共交通意外险'],
         ['恒享人生年金（固定年金）','G23','80/77/75/70','—','2万','现价覆盖总保费；年金=总保费2%；利益简单(固收)'],
         ['宏愿人生养老年金（分红）','S02','最高69（70岁领年金）','最高69','3万','分红养老年金；50岁以上利好；3年交5年超保费']],
        cap='线上投保年龄统一：趸交 64 周岁，期缴 59 周岁。')
    s.append(sec('overview','📊','产品总览','PRODUCT OVERVIEW',lead('2026 年在售五大主力产品，覆盖分红增额、固定增额与养老年金三大形态，满足不同客户的长期资金规划需求。')+ov))
    # 宏泰
    s.append(sec('hongtai','🛡️','宏泰世家（分红型）','S03 · 分红增额终身寿',
        lead('案例：宏先生，40 周岁，公司职员，希望做长期、稳定的资金规划，投保宏泰世家终身寿险（分红型）。')+
        kv([('交费方式','3 年交'),('年交保费','10 万元'),('基本保险金额','263,700 元'),('保险期间','终身'),
            ('产品定位','分红型增额终身寿，现价增长稳健，同档类型产品现价靠前')])+
        callout('三年交 5 年覆盖总保费，1.2% 分红演示水平稳健靠谱、容易达成；适合看重「确定性 + 长期复利」的中产客户做资产压舱石。','key')))
    # 宏御
    hy=lead('案例：40 岁男性，年交 50 万、3 年交，累计保费 150 万。下表为红利利益演示下的「生存总利益」（保证现价 + 红利部分）。')
    hy+=tbl(['保单年度','年龄','累计保费','生存总利益(红利演示)','较累计保费'],
        [['1','40','150.0万','14.89万','—'],
         ['3','42','150.0万','123.19万','—'],
         ['4','43','150.0万','150.84万','+0.84万 ✅'],
         ['5','44','150.0万','155.18万','+5.18万'],
         ['10','49','150.0万','178.75万','+28.75万'],
         ['20','59','150.0万','244.21万','+94.21万'],
         ['30','69','150.0万','327.41万','+177.41万'],
         ['65','104','150.0万','887.10万','+737.10万']],
        hl_rows=[2], right={0,2,3,4},
        cap='第 4 个保单年度末生存总利益 150.84 万，已略超累计保费 150 万，即「4 年回本」（红利演示，非保证）。')
    hy+=callout('现价超高：老七家同业前列；3 年交 4 年回本；1.2% 分红演示水平稳健靠谱、容易达成。','key','⭐')
    s.append(sec('hongyu','💎','宏御世家（分红型）','S11 · 分红增额终身寿',hy))
    # 福盛世家
    fs=lead('案例：福先生，50 周岁，3 年交、年交 10 万，基本保险金额 273,900 元。固定 2.0% 增额，利益确定写入合同。')
    fs+=tbl(['保单年度','年龄','累计保费','现金价值(年末)','特定公共交通意外身故金'],
        [['1','50','30.0万','4.50万','27.39万'],
         ['3','52','30.0万','25.35万','27.39万'],
         ['4','53','30.0万','29.59万','27.39万'],
         ['5','54','30.0万','30.11万','27.39万'],
         ['10','59','30.0万','32.86万','27.39万'],
         ['20','69','30.0万','39.90万','27.39万'],
         ['30','79','30.0万','48.64万','27.39万'],
         ['50','99','30.0万','72.28万','27.39万']],
        right={0,2,3,4}, cap='固定 2% 增额，3 年交约 4 年回本；额外含特定公共交通工具意外身故/全残保障 27.39 万（固定）。')
    s.append(sec('fusheng','🌿','福盛世家添翼版（固定增额）','G14 · 2.0% 固定增额终身寿',fs))
    # 宏愿
    s.append(sec('hongyuan','🌟','宏愿人生养老年金（分红型）','S02 · 分红养老年金',
        lead('面向 50 周岁以上客户的分红型养老年金，70 岁起开始领取年金，兼顾身价保障与养老现金流。')+
        kv([('投保年龄','最高 69 周岁（70 岁起领年金）'),('交费方式','趸交 / 3年 / 5年 / 10年交'),
            ('起售金额','趸交5万 / 3年交3万 / 5年交1万 / 10年交1万'),('产品定位','分红养老年金，3 年交 5 年超所交保费')])+
        callout('分红养老年金定位清晰：用「分红」对冲通胀、用「固定领取」锁定养老现金流，特别适合 50 岁以上、希望把一笔资金转化为终身年金的中高客。','key')))
    # 恒享
    hx=lead('案例：40 岁，年交 10 万、3 年交，总保费 30 万。关爱金/年金自第 6 个保单周年日起领取，之后每年年金 = 总保费 2% = 6,000 元。')
    hx+=tbl(['保单年度','年龄','累计保费','关爱金/年金','生存总利益(年末)'],
        [['5','44','30.0万','—','30.38万'],
         ['10','49','30.0万','0.60万','33.39万'],
         ['20','59','30.0万','0.60万','39.39万'],
         ['30','69','30.0万','0.60万','45.39万'],
         ['50','89','30.0万','0.60万','57.39万'],
         ['65','104','30.0万','0.60万','66.39万']],
        right={0,2,3,4}, cap='固收型年金：利益简单明了，年金为总保费的 2%（6,000 元/年），现价持续覆盖总保费。')
    s.append(sec('hengxiang','💠','恒享人生年金（固定）','G23 · 固定年金险',hx))
    # 鸿鹄基金
    hh=lead('鸿鹄基金由中国人寿与新华保险共同发起，是长期资金入市试点的私募证券投资基金；首支规模 500 亿元，三期累计规模超 1,100 亿元，其中新华保险一、二、三期计划出资共 462.5 亿元。')
    hh+=tbl(['上市公司','持股机构','持股数量(万股)','持股市值(万元)'],
        [['中国电信','鸿鹄基金一期','76,174.22','507,320'],
         ['伊利股份','鸿鹄基金一期','15,276.40','416,740'],
         ['陕西煤业','鸿鹄基金一期','11,633.89','232,678'],
         ['中国石化','鸿鹄基金三期1号','30,495.86','161,323'],
         ['大秦铁路','鸿鹄基金三期1号','29,848.71','175,809'],
         ['泸州老窖','鸿鹄基金三期1号','1,887.20','248,959'],
         ['中国石油','鸿鹄基金二期','21,721.36','175,074'],
         ['中国神华','鸿鹄基金二期','5,220.61','200,994'],
         ['国投电力','鸿鹄基金一期','9,343.80','122,030'],
         ['国投电力','鸿鹄基金三期2号','6,184.55','80,770']],
        right={2,3}, cap='代表性持仓（部分），合计持股市值约 191 亿元；底层资产以高股息、低估值的蓝筹央企为主。')
    hh+=stats([{'num':'1,100<small>亿+</small>','lb':'鸿鹄基金三期总规模','sb':'长期资金入市试点'},
               {'num':'462.5<small>亿</small>','lb':'新华保险出资','sb':'央企险资合力'},
               {'num':'170.44<small>%</small>','lb':'中石油管道项目回报','sb':'另类投资标杆'},
               {'num':'2.52<small>X</small>','lb':'中国银联投资回报','sb':'14.27% 内部收益'}])
    hh+=callout('举牌标的包括杭州银行（持股 5.84%）、上海医药、国药股份、北京控股等，体现险资「长期、价值、稳健」的配置偏好。','info')
    s.append(sec('honghu','🚀','鸿鹄基金 · 千亿级险资私募','HONGHU FUND',hh))
    # 分红实力
    rt=lead('新华保险分红业务经营稳健，红利实现率长期位居行业前列；投资端穿越周期，取得领先同业的综合收益。')
    rt+=stats([{'num':'156.1<small>%</small>','lb':'近 5 年分红实现率均值','sb':'行业第一'},
               {'num':'79<small>%</small>','lb':'2024 年产品实现率≥100%','sb':'分红达标产品占比'},
               {'num':'8.6<small>%</small>','lb':'2025年1-9月总投资收益率','sb':'领先主要同业'},
               {'num':'11.6<small>%</small>','lb':'股票投资占比','sb':'权益弹性充足'}])
    rt+=tbl(['公司','A股近一年涨跌幅','H股近一年涨跌幅','总投资收益率(25年1-9月)','股票配置比例'],
        [['新华保险','+93.84%','+242.08%','8.6%','11.6%'],
         ['中国平安','+43.01%','+79.73%','3.1%(上半年)','10.5%'],
         ['中国太保','+46.71%','+87.99%','5.2%','9.7%'],
         ['中国人寿','+28.53%','+158.69%','6.4%','8.7%'],
         ['中国人保','+42.46%','+99.70%','5.4%','5.4%']],
        hl_rows=[0], right={1,2,3,4}, cap='新华保险 A/H 股近一年涨幅与总投资收益率均显著领先主要同业（数据截至 2026-01-16 前后）。')
    s.append(sec('rate','📈','分红实现率与投资实力','DIVIDEND & RETURN',rt))
    return page(name,nav,hero,''.join(s))

def build_invest():
    name='新华保险投资实力'
    nav=[('core','核心数据'),('cycle','穿越周期'),('op24','2024操作'),('fund','鸿鹄基金'),('alt','硬科技与另类')]
    hero=(f'<span class="tag">新华资管 · 投资实力</span>'
          f'<h1>新华保险 · 投资实力介绍</h1>'
          f'<div class="sub">穿越周期 · 稳健增值 · 长期主义 —— 新华资产管理公司</div>'
          f'<div class="badge">🏦 <b>管理资产 1.6 万亿</b>&nbsp; · &nbsp; 2024 总投资收益率 5.8% · 综合收益率 8.5%</div>')
    s=[]
    s.append(sec('core','🔢','核心数据','KEY FIGURES',
        stats([{'num':'1.6<small>万亿</small>','lb':'受托管理资产规模','sb':'稳健增长'},
               {'num':'5.8<small>%</small>','lb':'2024 年总投资收益率','sb':'同比提升 4 个百分点'},
               {'num':'8.5<small>%</small>','lb':'2024 年综合投资收益率','sb':'居行业前列'},
               {'num':'+30<small>%</small>','lb':'固收+策略超额收益','sb':'跑赢同类公募'},
               {'num':'10<small>倍+</small>','lb':'港股持仓代表（泡泡玛特）','sb':'持仓约 50 亿元'}])))
    s.append(sec('cycle','📊','穿越周期的投资业绩','ALL-WEATHER PERFORMANCE',
        lead('新华资管以「固收为基、权益增强、多元配置」的策略穿越市场周期，在债市、港股与另类资产上均取得亮眼成绩。')+
        cards([{'t':'固收+ 稳健领跑','d':'固收+策略取得约 30% 超额收益，显著跑赢同类公募基金，构筑组合压舱石。','pill':'固收打底'},
               {'t':'港股挖掘十倍股','d':'前瞻布局港股优质标的，泡泡玛特持仓约 50 亿元，区间涨幅超 10 倍。','pill':'权益增强'},
               {'t':'2024 综合收益率 8.5%','d':'在利率下行与波动加剧的环境中，全年综合投资收益率达 8.5%。','pill':'收益领先'},
               {'t':'管理资产 1.6 万亿','d':'受托管理资产规模约 1.6 万亿元，长期资金属性鲜明。','pill':'规模雄厚'}])))
    s.append(sec('op24','🎯','2024 年关键操作','2024 TACTICS',
        lead('把握市场节奏，在波动中优化仓位与结构。')+
        steps(['<b>债券波段操作</b>：通过久期与品种轮动，增厚固收组合收益。',
               '<b>低位加仓权益</b>：在沪指约 2,700 点附近主动加仓，布局估值修复机会。',
               '<b>红利与成长均衡</b>：高股息提供安全垫，优质成长贡献弹性。'])))
    s.append(sec('fund','🚀','鸿鹄基金 · 长期资金入市','HONGHU FUND',
        lead('鸿鹄基金由国寿与新华共同发起，是长期资金入市试点私募基金；首支规模 500 亿元，三期累计规模超 1,100 亿元，新华保险计划出资共 462.5 亿元，投向高股息蓝筹与战略性新兴产业。')+
        callout('长期、价值、稳健 —— 鸿鹄基金体现险资「做时间的朋友」的配置理念，为产品分红提供坚实的底层资产支撑。','key')))
    s.append(sec('alt','🔬','硬科技与另类投资','TECH & ALTERNATIVES',
        lead('在一级市场与另类资产上前瞻卡位，获取穿越周期的超额回报。')+
        cards([{'t':'硬科技布局','d':'通过智集芯、中科创星等平台布局半导体与硬科技赛道，分享科创红利。','pill':'科创赛道'},
               {'t':'中石油管道','d':'入股中石油管道等基础设施资产，项目回报达 170.44%。','pill':'基础设施'},
               {'t':'中国银联','d':'投资中国银联，实现 2.52 倍回报（内部收益率 14.27%）。','pill':'金融科技'}])))
    return page(name,nav,hero,''.join(s))

def build_compare():
    name='招行在架产品对比'
    nav=[('over','产品概览'),('cv','现金价值'),('long','中长期'),('strength','公司实力'),('service','增值服务'),('score','宏御评分'),('others','其他亮点')]
    hero=(f'<span class="tag">招行渠道 · 横向对比</span>'
          f'<h1>招行在架产品对比分析</h1>'
          f'<div class="sub">主流增额分红终身寿横向对比 · 新华宏御世家综合表现</div>'
          f'<div class="badge">🏆 <b>宏御世家</b>&nbsp; 4 年回本 · 20%/年减保不限次 · 16 城康养</div>')
    s=[]
    s.append(sec('over','📋','产品概览','PRODUCT OVERVIEW',
        lead('招行渠道在架主力增额分红终身寿对比（含新华宏御世家）。宏御世家以低起购、快回本、灵活减保脱颖而出。')+
        tbl(['公司','产品','起购门槛','保额递增','回本','减保限制'],
            [['新华人寿','宏御世家（分红型）','趸交5万/期缴2万','1.75%+分红','4年','20%/年不限次'],
             ['中信保诚','隽享承金B款','1万起','2%+1.4%分红','5年','20%/年'],
             ['中意人寿','一生挚爱（盛世版）','1万起','2%+1.4%分红','5年','20%/年'],
             ['大都会人寿','都会盛世（尊享版）','趸交50万/期交20万','1.75%+分红','4年','20%/年不限次'],
             ['友邦保险','盛世经典众享版','1万起','1.75%+分红','6年','领取不受限'],
             ['平安人寿','盈尊优享A款','3年交5万','1.75%+1.225%分红','5年','20%/年'],
             ['泰康人寿','步步高E款','趸交10万/期交1万','1.75%+分红','6年','20%/年'],
             ['太平洋人寿','鑫福相伴（恒享25A）','期交3年5万','1.75%+分红','5年','20%/年不限次'],
             ['中国人寿','鸿耀金生（分红型）','期交1万','1.75%+分红','5年','20%/年不限次'],
             ['中国人保','臻传世家（分红型）','3年交2万','2.0%+分红','5年','20%/年'],
             ['中英人寿','鑫悦未来2号','趸交5万/3年交3万','2%+分红','6年','20%/年'],
             ['阳光人寿','臻盈倍致庆典版','趸交1万/期交5千','1.75%+1.4%分红','5年','20%/年']],
            hl_rows=[0], right={2,3,4,5}, cap='演示案例：40 岁女性、3 年交、年缴 100 万（新华宏御世家）。')))
    s.append(sec('cv','💰','现金价值对比 · 回本速度','CASH VALUE · BREAK-EVEN',
        lead('第 5 个保单年末现金价值对比（年缴 100 万、3 年交）。宏御世家 311.0 万、超保费 3.7%，位列前五。')+
        tbl(['排名','产品','现金价值','超保费'],
            [['1','中意一生挚爱（盛世版）','308.2万','2.7%'],
             ['2','中信保诚隽享承金B款','307.3万','2.4%'],
             ['3','大都会都会盛世（尊享版）','315.1万','5.0%'],
             ['4','华泰鸿利满满（尊享版）','314.0万','4.7%'],
             ['5','新华宏御世家','311.0万','3.7%']],
            hl_rows=[4], right={1,2,3}, cap='宏御世家第 4 年即回本（约 302.2 万），回本速度居 18 款产品前 4。')))
    s.append(sec('long','📈','中长期增长趋势','LONG-TERM GROWTH',
        lead('各产品现金价值（红利演示）在不同年限的表现（单位：万元）。宏御世家短期回本快、长期稳健。')+
        tbl(['年度','新华宏御世家','中信保诚B款','中意盛世版','大都会尊享','平安盈尊优享','友邦盛世经典'],
            [['第5年末','311.0','307.3','308.2','315.1','300.2','301.9'],
             ['第10年末','359.4','362.6','374.2','369.2','346.9','350.2'],
             ['第20年末','479.7','505.1','520.8','506.7','463.4','490.5'],
             ['第30年末','643.0','705.6','726.9','697.8','621.1','668.7'],
             ['第50年末','1,155.7','1,377.0','1,401.2','1,324.2','1,116.4','1,236.0']],
            hl_rows=[0], right={0,1,2,3,4,5,6})))
    s.append(sec('strength','🏛️','公司实力梯队与偿付能力','SOLVENCY',
        lead('保险公司安全性是长期产品的底层保障。新华保险综合偿付能力 217.55%（2024 年末）、核心 181%、风险评级 AA。')+
        tbl(['公司','综合偿付能力','核心偿付能力','风险评级'],
            [['新华保险','217.55%','181%','AA'],
             ['中国人寿','207.76%','153.34%','AAA'],
             ['中国平安','236%','181%','A'],
             ['太平洋人寿','215%','136%','AAA'],
             ['友邦保险','413.48%','280.16%','AAA'],
             ['中信保诚','256%','112.5%','BBB'],
             ['泰康人寿','321.20%','224.38%','AA']],
            hl_rows=[0], right={1,2,3})))
    s.append(sec('service','🏥','增值服务与康养布局','VAS & CARE',
        lead('除产品本身外，保险公司的健康管理与养老布局日益成为高客选择的关键。新华「瑞中 + 新华尊」双体系、16 城康养全国领先。')+
        tbl(['公司','健康管理','高客权益','养老布局','其他特色'],
            [['新华保险','医疗绿通+红圈所律师、视频问诊+专家会诊','瑞中5级+新华尊3级（新钻/蓝钻/黑钻）','16城21社区、10城11旅居、自有康复医院','央企控股、1700+分支机构'],
             ['中国平安','三私一检（私人医生/教练/营养师）','金钻/黑钻私享服务','8城高端康养、居家三位一体管家','综合金融集团、全球品牌价值第一'],
             ['泰康人寿','重疾绿通+海外二诊、MR肿瘤筛查','保费门槛低、1万起享绿通','37城46项目、24城27社区、行业最大网络','连续6年500强、管理资产4.5万亿'],
             ['太平洋','健享家7级会员','3000万以上5家人共享全球医疗','太保家园13城15项目','500强第251位、三地上市'],
             ['中国人寿','5级VIP体系','1500万总保费重疾管理版服务','—','500强第54位、副部级央企'],
             ['太平人寿','美年大健康体检、一站式医疗','多级会员体系','25省56市70家、行业最大之一','95年历史、四大保险央企']],
            hl_rows=[0])))
    s.append(sec('score','⭐','新华宏御世家 · 综合评分','SCORECARD',
        lead('从品牌、回本、现价、减保、服务、安全等维度对宏御世家进行综合评估。')+
        tbl(['评估维度','评分','说明'],
            [['品牌实力','★★★★★','老六家，央企控股，A+H 上市，全国 1700+ 分支机构'],
             ['回本速度','★★★★☆','4 年回本，位列 18 款产品前 4 名'],
             ['现金价值（短期）','★★★★☆','第5年 311 万，排名前五'],
             ['现金价值（长期）','★★★☆☆','中等水平，稳健不激进'],
             ['减保灵活性','★★★★☆','20%/年不限次 + 红利灵活支取'],
             ['增值服务','★★★★★','瑞中+新华尊双体系，16 城康养全国领先'],
             ['起购门槛','★★★★★','趸交5万/期缴2万，同级别最低'],
             ['公司安全性','★★★★★','央企控股，偿付能力 217.55%，AA 评级']],
            hl_rows=[0], right={1})))
    s.append(sec('others','🔎','其他产品亮点 · 客观评价','OTHERS',
        lead('客观呈现同业产品的核心优势与注意事项，便于一线精准匹配客户需求。')+
        tbl(['产品','核心优势','适合人群','注意事项'],
            [['华泰鸿利满满','3年最快回本、贷款利率4.2%','追求极致回本速度','公司规模较小、品牌知名度有限'],
             ['中信保诚B款','长期现价极高、第50年1377万','长期财富传承','偿付能力核心112.5%、风险评级BBB'],
             ['中意一生挚爱','投资收益率行业第一、长期收益最高','追求极致长期收益','贷款利率4.8%偏高'],
             ['友邦盛世经典','偿付能力413%第一、AAA评级、减保不受限','追求最高安全性','保额递增1.75%、回本需6年'],
             ['平安盈尊优享','综合金融生态、居家养老三位一体','看重综合金融+养老','长期现价表现偏弱'],
             ['泰康步步高','泰康之家37城、最大养老社区网络','养老社区需求明确','回本需6年、贷款利率5%偏高'],
             ['阳光臻盈倍致','贷款利率最低、大单可至4.0%','预算有限需保单贷款','公司品牌力一般']],
            right={})))
    return page(name,nav,hero,''.join(s))

def build_rongzun():
    name='荣尊世家减保规则'
    nav=[('rule','减保规则'),('demo','投保示例'),('cv','现金价值'),('calc','顶额减保计算')]
    hero=(f'<span class="tag">产品规则 · 荣尊世家</span>'
          f'<h1>荣尊世家 · 减保规则</h1>'
          f'<div class="sub">减保 = 减少基本保险金额 → 领取对应现金价值</div>'
          f'<div class="badge">📐 <b>每年最多可领</b>&nbsp; 当年度现金价值的 20%</div>')
    s=[]
    rule_html = lead('减保（部分退保）是在不退保的前提下，申请减少基本保险金额，按减少的比例领取对应的现金价值，从而降低后续保费与保障，但保障继续有效。')
    rule_html += steps(['<b>减少基本保额</b>：客户申请降低基本保险金额，合同继续有效。',
               '<b>领取对应现价</b>：按减少的保额比例，领取对应的现金价值（即「减保领取金」）。',
               '<b>年度上限</b>：每年累计减保领取金额 ≤ 当年度现金价值的 20%。',
               '<b>保障延续</b>：减保后保额、保费按比例降低，身故/全残保障与剩余现金价值继续有效。'])
    rule_html += callout('高频营销话术：把「减保」理解为「每年最多从保单里取出当年现价的 20%」，剩余部分继续复利增值、保障不停。','key')
    s.append(sec('rule','📐','减保是什么','RULE', rule_html))
    s.append(sec('demo','📋','投保示例','CASE',
        kv([('产品名称','荣尊世家终身寿险'),('交费方式','5 年交'),('保险期间','至被保险人终身'),
            ('首年保费','10 万元'),('基本保险金额','44.07 万元')])))
    s.append(sec('cv','💰','现金价值演示','CASH VALUE',
        lead('5 年交、年交 10 万（累计 50 万）的现金价值（年末）。现价随年度稳健增长，是减保领取的计算基础。')+
        tbl(['保单年度','年龄','累计保费','现金价值(年末)','特定公共交通意外身故金'],
            [['1','—','10.0万','5.91万','0'],
             ['2','—','20.0万','15.24万','0'],
             ['3','—','30.0万','25.73万','0'],
             ['4','—','40.0万','37.52万','0'],
             ['5','—','50.0万','50.60万','0'],
             ['6','—','50.0万','52.37万','0'],
             ['10','—','50.0万','60.09万','0'],
             ['15','—','50.0万','71.37万','0'],
             ['20','—','50.0万','84.76万','50.0万'],
             ['25','—','50.0万','100.66万','50.0万'],
             ['30','—','50.0万','119.55万','50.0万'],
             ['35','—','50.0万','141.98万','50.0万']],
            right={0,2,3,4}, cap='第 5 年末现金价值 50.60 万，已超累计保费 50 万（回本）。')))
    s.append(sec('calc','🧮','顶额减保测算','MAX WITHDRAWAL',
        lead('按「每年最多领取当年度现价 20%」测算（以容先生为 35 岁女儿投保的同一产品为例）：')+
        stats([{'num':'16.95<small>万</small>','lb':'第 20 年可顶额减保','sb':'84.76万 × 20%'},
               {'num':'28.40<small>万</small>','lb':'第 35 年可顶额减保','sb':'141.98万 × 20%'},
               {'num':'20<small>%</small>','lb':'每年减保领取上限','sb':'占当年度现金价值'}])+
        callout('第 20 个保单年度：现金价值 84.76 万，当年最多可减保领取 84.76 × 20% = 16.952 万；第 35 年：141.98 × 20% = 28.396 万。减保后剩余现价继续复利增值。','info','📌')))
    return page(name,nav,hero,''.join(s))

def build_hongyu_qa():
    name='宏御世家知识问答'
    nav=[('elem','产品要素'),('demo','投保示例'),('angles','五大角标解读'),('concl','核心结论'),('qa','常见问答')]
    hero=(f'<span class="tag">分红型增额终身寿 · 知识问答</span>'
          f'<h1>宏御世家 · 知识问答卡片</h1>'
          f'<div class="sub">一图读懂利益演示表：客户最终拿到的是哪几列？</div>'
          f'<div class="badge">📖 <b>客户最终拿到</b>&nbsp; = ①保证现价 + ④红利现价</div>')
    s=[]
    s.append(sec('elem','📑','产品要素速览','PRODUCT FACTS',
        kv([('产品名称','新华人寿 · 宏御世家（分红型增额终身寿险）'),
            ('投保示例','40 周岁男性，年交保费 10 万元，交费期 3 年，基本保险金额 271,200 元'),
            ('保证部分','固定保底利率 1.75%（写入合同）'),
            ('分红部分','以预定利率 3.5% 演示，分红收益 ≈ 1.225%（3.5%−1.75%，再按 70% 分红比例）'),
            ('红利领取方式','交清增额（以红利趸缴购买增额保险，保额逐年递增）')])))
    s.append(sec('demo','🧾','投保示例','EXAMPLE',
        lead('以下解读均基于该示例：40 岁男性、年交 10 万、3 年交，基本保险金额 271,200 元。利益演示表分为「保证利益」与「红利利益」两大板块。')))
    s.append(sec('angles','🔍','五大角标解读','THE 5 MARKERS',
        cards([
            {'t':'① 保证现金价值','d':'基本保险金额对应的现金价值，写入合同、确定给付。第1年2.93万，第10年32.1万，第65年82.32万。退保首先看这列。','pill':'保证 · 确定'},
            {'t':'② 年度交清增额保额','d':'每年红利折算成一次性保费买下的新增保额。第1年987元，第3年3,372元，第65年6,954元，每年不同。','pill':'过程数据'},
            {'t':'③ 累积交清增额保额','d':'历年②的累加。第10年3.12万，第65年31.33万，已超过基本保额27.12万。','pill':'过程数据'},
            {'t':'④ 红利对应现金价值','d':'所有交清增额保单各自独立增长的现价之和。第65年达95.10万，退保时与①相加即客户总现价。','pill':'客户实得'},
            {'t':'⑤ 保证利益演示（全0）','d':'因采用「交清增额」方式，保证利益板块无额外增额，故演示为0；红利为非保证收益，监管须分开展示。','pill':'监管合规'}])+
        callout('②③⑤ 是「过程性数据」，帮助理解红利如何转化为保额增长；客户最终拿到的是 ① + ④。','info')))
    s.append(sec('concl','✅','核心结论','CONCLUSION',
        lead('客户最终拿到的钱 = ① 基本保险金额现金价值 + ④ 交清增额保险对应的现金价值。')+
        stats([{'num':'82.32<small>万</small>','lb':'① 保证现金价值（第65年）','sb':'写入合同'},
               {'num':'95.10<small>万</small>','lb':'④ 红利对应现金价值（第65年）','sb':'非保证'},
               {'num':'177.42<small>万</small>','lb':'客户总利益（第65年）','sb':'① + ④'}])+
        callout('退保：总现金价值 = ① + ④ = 82.32万 + 95.10万 = 177.42万；身故/全残理赔同理，总保险金 = ① + ④。','key','💡')))
    s.append(sec('qa','❓','常见问答','FAQ',
        faq([('客户最终拿到的钱是哪几部分？',
              '客户最终拿到的钱 = ① + ④。<b>退保</b>时：总现金价值 = ①基本保险金额现金价值 + ④交清增额保险对应的现金价值；以第65年为例：823,200 + 950,990 = <b>1,774,190 元</b>。<b>身故/全残理赔</b>时：总保险金 = ①身故/全残保险金 + ④交清增额对应的身故/全残保险金，第65年约为 1,774,192 元。②③⑤ 为辅助理解数据，不直接构成客户最终收益。'),
             ('为什么红利保证部分可以是 0？',
              '分红型产品的「保证利益」与「红利利益」分开演示。本产品采用「交清增额」红利领取方式，红利全部在红利利益板块展示，保证利益板块自然为 0。根据监管规定，利益演示须分开展示并明确标注红利为非保证收益；特定年份分红可能为 0，但不影响合同保证部分的现金价值与保障责任。')])+
        callout('表中的红利利益数据仅为演示，实际分红取决于保险公司分红保险业务的实际经营状况，不构成对未来的承诺。','warn','⚠️')))
    return page(name,nav,hero,''.join(s))

# ========================= 主程序 =========================
TARGETS = [
    ("files/公司介绍/2604新华在售产品培训.html", build_training),
    ("files/公司介绍/新华保险投资实力介绍（新华资管）.html", build_invest),
    ("files/产品对比/招行在架产品对比分析.html", build_compare),
    ("files/产品规则/荣尊世家减保规则.html", build_rongzun),
    ("files/产品介绍/新华宏御世家_知识问答卡片 (6).html", build_hongyu_qa),
]

def main():
    for rel, fn in TARGETS:
        out = os.path.join(ROOT, rel)
        html = fn()
        with open(out, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'[OK] {rel}  ({len(html)//1024} KB)')

if __name__ == '__main__':
    main()
