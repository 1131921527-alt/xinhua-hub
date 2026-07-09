#!/usr/bin/env python3
"""
Reformat all clause-*.html files — v2
Fixes:
- Explicit table extraction (no more short-line heuristic)
- Remove PDF running headers embedded mid-sentence
- Better paragraph joining (no false splits)
- Commercial CSS
"""
import re, json, os, html as H

BASE = os.path.dirname(os.path.abspath(__file__))
FILES = [
    'clause-huacai.html',
    'clause-hongyuan.html',
    'clause-hongtai.html',
    'clause-hongyu.html',
    'clause-hengxiang.html',
]

# ── Junk detection ─────────────────────────────────────────────

JUNK_PATTERNS = [
    r'^\d{5}$',                       # page numbers "20251"
    r'请扫描以查询验证条款',
    r'^新华保险\[\d+\].*号$',          # doc codes
    r'^个人保险基本条款第三版$',        # running page header
]

def is_junk(line):
    s = line.strip()
    if not s:
        return True
    for pat in JUNK_PATTERNS:
        if re.match(pat, s):
            return True
    return False

def remove_inline_junk(text):
    """Remove PDF running headers that got embedded mid-sentence (page break artifacts).
    Only remove when sandwiched between two Chinese chars (broken word),
    NOT when it's a legitimate reference followed by （."""
    # "责个人保险基本条款第三版任" → "责任" (page break artifact)
    # "和个人保险基本条款第三版（简称" → keep (legitimate reference)
    text = re.sub(
        r'([\u4e00-\u9fff])个人保险基本条款第三版([\u4e00-\u9fff])',
        r'\1\2', text
    )
    return text

# ── Table extraction ───────────────────────────────────────────

def extract_tables(body):
    """Extract table-like content, replace with placeholders."""
    tables = []
    lines = body.split('\n')
    result = []
    i = 0
    while i < len(lines):
        if '交费方式或交费期间' in lines[i]:
            # Collect table lines: this line + subsequent short lines
            table_lines = []
            # Skip junk before table
            while i < len(lines) and is_junk(lines[i]):
                i += 1
            if i < len(lines):
                table_lines.append(lines[i].strip())
                i += 1
            while i < len(lines):
                s = lines[i].strip()
                if not s:
                    i += 1
                    continue
                if is_junk(s):
                    i += 1
                    continue
                if len(s) <= 30 and not s.endswith('。'):
                    table_lines.append(s)
                    i += 1
                else:
                    break
            placeholder = f'\n__TABLE_{len(tables)}__\n'
            tables.append(table_lines)
            result.append(placeholder)
        else:
            result.append(lines[i])
            i += 1
    return '\n'.join(result), tables

# ── Text cleaning ──────────────────────────────────────────────

def clean_spaces(text):
    """Remove unwanted spaces from PDF-extracted Chinese text."""
    text = re.sub(r'([\u4e00-\u9fff])\s+([\u4e00-\u9fff])', r'\1\2', text)
    text = re.sub(r'([\u4e00-\u9fff））】])\s+(\d)', r'\1\2', text)
    text = re.sub(r'(\d)\s+([\u4e00-\u9fff（【])', r'\1\2', text)
    text = re.sub(r'([\u4e00-\u9fff\d）])\s+([%×])', r'\1\2', text)
    text = re.sub(r'([%×（])\s+([\u4e00-\u9fff\d])', r'\1\2', text)
    text = re.sub(r'([\u4e00-\u9fff])\s+([a-zA-Z])', r'\1\2', text)
    text = re.sub(r'([a-zA-Z])\s+([\u4e00-\u9fff])', r'\1\2', text)
    text = text.replace('（1+1.75%）（n-1）', '（1+1.75%）^（n-1）')
    text = re.sub(r'  +', ' ', text)
    return text.strip()

def clean_body(body):
    """Clean PDF artifacts and split into structured paragraphs."""
    # Step 1: extract tables
    body, tables = extract_tables(body)

    # Step 2: split into lines, remove junk
    lines = body.split('\n')
    cleaned = []
    for line in lines:
        s = line.strip()
        if not s:
            continue
        if s.startswith('__TABLE_'):
            cleaned.append(s)  # placeholder
            continue
        if is_junk(s):
            continue
        cleaned.append(s)

    # Step 3: build paragraphs
    paragraphs = []
    current = ''
    prev_was_subheading = False

    for line in cleaned:
        # Table placeholder — flush current, add placeholder
        if line.startswith('__TABLE_'):
            if current:
                paragraphs.append(clean_spaces(remove_inline_junk(current)))
                current = ''
            paragraphs.append(line)
            prev_was_subheading = False
            continue

        starts_new = False
        is_subheading = False

        m = re.match(r'^(\d+)\.(.+)', line)
        if m:
            content_after = m.group(2)
            if len(content_after) < 25 and not line.endswith(('。', '；', '：')):
                is_subheading = True
            starts_new = True
        elif re.match(r'^（\d+）', line):
            starts_new = True
        elif re.match(r'^[①②③④⑤⑥⑦⑧⑨⑩]', line):
            starts_new = True
        elif line.startswith('若') and current and current.rstrip().endswith(('：', '；')):
            starts_new = True
        elif line.startswith('发生上述') and current:
            starts_new = True
        elif prev_was_subheading:
            starts_new = True

        # Previous ended with 。or ：→ new paragraph
        if not starts_new and current:
            if current.endswith(('。', '：')) and not line.startswith(
                ('（', '①', '②', '③', '④', '⑤', '若', '发生')
            ):
                starts_new = True

        # ALSO: if previous ended with ；→ check if next is a new condition
        if not starts_new and current:
            if current.endswith('；') and line.startswith('若'):
                starts_new = True

        if starts_new and current:
            paragraphs.append(clean_spaces(remove_inline_junk(current)))
            current = line
        else:
            current = (current + line) if current else line

        prev_was_subheading = is_subheading

    if current:
        paragraphs.append(clean_spaces(remove_inline_junk(current)))

    return [p for p in paragraphs if p], tables

# ── HTML rendering ─────────────────────────────────────────────

def format_table(rows):
    """Format table rows as HTML table."""
    if len(rows) >= 4:
        parts = ['<table class="clause-table"><thead><tr>'
                 f'<th>{H.escape(rows[0])}</th><th>{H.escape(rows[1])}</th>'
                 '</tr></thead><tbody>']
        k = 2
        while k + 1 < len(rows):
            parts.append(f'<tr><td>{H.escape(rows[k])}</td>'
                         f'<td>{H.escape(rows[k+1])}</td></tr>')
            k += 2
        if k < len(rows):
            parts.append(f'<tr><td colspan="2">{H.escape(rows[k])}</td></tr>')
        parts.append('</tbody></table>')
        return '\n      '.join(parts)
    return '<br>'.join(H.escape(r) for r in rows)

def paragraphs_to_html(paragraphs, tables):
    """Convert structured paragraphs to commercial HTML."""
    parts = []
    for p in paragraphs:
        # Table placeholder
        if p.startswith('__TABLE_'):
            idx = int(re.search(r'__TABLE_(\d+)__', p).group(1))
            if idx < len(tables):
                parts.append(format_table(tables[idx]))
            continue

        pe = H.escape(p)

        if re.match(r'^\d+\.', p):
            content_after = re.sub(r'^\d+\.', '', p)
            if len(content_after) < 25 and not p.endswith(('。', '；', '：')):
                parts.append(f'<div class="sub-head">{pe}</div>')
            else:
                parts.append(f'<p class="indent">{pe}</p>')
        elif re.match(r'^（\d+）', p):
            parts.append(f'<p class="item-2">{pe}</p>')
        elif re.match(r'^[①②③④⑤⑥⑦⑧⑨⑩]', p):
            parts.append(f'<p class="item-3">{pe}</p>')
        elif (p.startswith('若') or p.startswith('发生上述')) and len(p) > 15:
            parts.append(f'<p class="item-cond">{pe}</p>')
        elif len(p) < 12 and not p.endswith(('。', '；', '，')) and not p.startswith(('（', '①', '②')):
            parts.append(f'<div class="sub-head">{pe}</div>')
        else:
            parts.append(f'<p class="indent">{pe}</p>')

    return '\n      '.join(parts)

# ── Build full HTML ────────────────────────────────────────────

CSS = """:root{
  --primary:#1a365d; --primary2:#2c5282; --accent:#3182ce;
  --bg:#f7f8fa; --card:#FFFFFF; --ink:#2d3748; --sub:#718096;
  --line:#e2e8f0; --accent-bg:#ebf8ff;
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;padding:0}
body{background:var(--bg);color:var(--ink);
  font-family:"PingFang SC","Microsoft YaHei","Helvetica Neue",sans-serif;
  font-size:16px;line-height:1.85;-webkit-font-smoothing:antialiased}
.topbar{position:sticky;top:0;z-index:30;
  background:linear-gradient(135deg,var(--primary),var(--primary2));
  color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px;
  box-shadow:0 2px 12px rgba(26,54,93,.3)}
.topbar .ico{font-size:18px}
.topbar .ttl{font-weight:600;font-size:15px;flex:1;overflow:hidden;
  white-space:nowrap;text-overflow:ellipsis}
.topbar button{background:rgba(255,255,255,.18);border:none;color:#fff;
  border-radius:8px;padding:6px 14px;font-size:13px;font-weight:500;cursor:pointer}
.progress{height:2px;background:rgba(255,255,255,.2);position:sticky;top:49px;z-index:31}
.progress>i{display:block;height:100%;width:0;background:#fff;transition:width .15s}
.wrap{max-width:720px;margin:0 auto;padding:16px 14px 80px}
.tip{background:var(--accent-bg);border-left:3px solid var(--accent);color:#2c5282;
  border-radius:0 8px 8px 0;padding:12px 16px;font-size:13px;margin:0 0 16px;line-height:1.7}
.sec{background:var(--card);border-radius:10px;padding:24px 22px;margin:14px 0;
  box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid var(--line)}
.sec h2{margin:0 0 18px;font-size:16px;color:var(--primary);font-weight:700;
  padding-bottom:12px;border-bottom:1px solid var(--line);
  display:flex;align-items:center;gap:8px}
.sec h2 .badge{display:inline-block;background:var(--primary);color:#fff;font-size:12px;
  padding:3px 10px;border-radius:4px;font-weight:600;white-space:nowrap;letter-spacing:.5px}
.sec p{margin:0 0 12px;text-align:justify;color:var(--ink);line-height:1.85}
.sec p.indent{text-indent:2em}
.sec p.item-2{padding-left:2.2em;margin:8px 0;text-indent:0}
.sec p.item-3{padding-left:4.2em;margin:6px 0;text-indent:0;color:var(--sub);font-size:15px}
.sec p.item-cond{padding-left:2.2em;margin:6px 0;text-indent:0}
.sec .sub-head{margin:16px 0 8px;font-weight:600;color:var(--primary2);font-size:15px;
  padding:6px 12px;background:var(--accent-bg);border-radius:6px;display:inline-block}
.sec .sub-head::before{content:'';display:inline-block;width:3px;height:14px;
  background:var(--accent);border-radius:2px;margin-right:8px;vertical-align:-2px}
.clause-table{width:100%;border-collapse:collapse;margin:12px 0;font-size:14px}
.clause-table th{background:var(--primary);color:#fff;padding:8px 12px;font-weight:600;
  text-align:center;font-size:13px}
.clause-table td{padding:8px 12px;border:1px solid var(--line);text-align:center}
.clause-table tbody tr:nth-child(even){background:var(--accent-bg)}
.cover{text-align:center;padding:36px 22px}
.cover .cover-body{color:var(--sub);font-size:14px;line-height:2.2}
.cover .cover-body strong{display:block;font-size:17px;color:var(--primary);
  font-weight:700;margin:8px 0}
.fab{position:fixed;right:16px;bottom:18px;z-index:40;display:flex;flex-direction:column;gap:8px}
.fab button{width:44px;height:44px;border:none;border-radius:50%;background:var(--primary);
  color:#fff;font-size:16px;box-shadow:0 3px 10px rgba(26,54,93,.3);
  display:flex;align-items:center;justify-content:center;cursor:pointer}
.fab button:active{transform:scale(.92)}
.drawer{position:fixed;inset:0;z-index:50;background:rgba(15,23,42,.45);display:none}
.drawer.open{display:block}
.drawer .panel{position:absolute;right:0;top:0;bottom:0;width:78%;max-width:320px;
  background:#fff;padding:20px 14px;overflow:auto}
.drawer .panel h3{margin:4px 0 16px;color:var(--primary);font-size:16px;font-weight:700}
.drawer .toc{display:flex;flex-direction:column;gap:1px}
.drawer .toc a{display:block;padding:12px 14px;border-radius:8px;color:var(--ink);
  text-decoration:none;font-size:14px;border:1px solid transparent;transition:all .15s}
.drawer .toc a:active{background:var(--accent-bg);border-color:var(--line)}
.drawer .close{position:absolute;left:12px;top:14px;background:none;border:none;
  font-size:22px;color:var(--sub);cursor:pointer}"""

JS = """let fs=16;
document.getElementById('fsUp').onclick=function(){fs=Math.max(13,fs-1);document.body.style.fontSize=fs+'px';};
document.getElementById('fsDn').onclick=function(){fs=Math.min(22,fs+1);document.body.style.fontSize=fs+'px';};
document.getElementById('top').onclick=function(){window.scrollTo({top:0,behavior:'smooth'});};
var prog=document.getElementById('prog');
window.addEventListener('scroll',function(){
  var h=document.documentElement;var p=h.scrollTop/((h.scrollHeight-h.clientHeight)||1);
  prog.style.width=(p*100)+'%';
});
var drawer=document.getElementById('drawer');
document.getElementById('tocBtn').onclick=function(){drawer.classList.add('open');};
document.getElementById('closeDrawer').onclick=function(){drawer.classList.remove('open');};
drawer.onclick=function(e){if(e.target===drawer)drawer.classList.remove('open');};"""

def build_html(clause):
    name = clause['name']
    source = clause.get('source', '')
    generated = clause.get('generated', '')

    sections_html = []
    toc_items = []

    for i, s in enumerate(clause['sections']):
        no = s.get('no', '')
        title = s.get('title', '')
        body = s.get('body', '')
        is_cover = (no == '封面')

        if is_cover:
            cover_lines = [l.strip() for l in body.split('\n')
                          if l.strip() and not is_junk(l)]
            cover_html = ''
            for cl in cover_lines:
                cl = clean_spaces(cl)
                if '利益条款' in cl:
                    cover_html += f'<strong>{H.escape(cl)}</strong>'
                else:
                    cover_html += H.escape(cl) + '<br>'
            sections_html.append(
                f'<div class="sec cover" id="sec{i}">\n'
                f'      <div class="cover-body">{cover_html}</div>\n'
                f'    </div>'
            )
        else:
            paras, tables = clean_body(body)
            body_html = paragraphs_to_html(paras, tables)
            badge = H.escape(no) if no else ''
            sections_html.append(
                f'<div class="sec" id="sec{i}">\n'
                f'      <h2><span class="badge">{badge}</span>{H.escape(title)}</h2>\n'
                f'      {body_html}\n'
                f'    </div>'
            )

        toc_label = f'{no} {title}' if no and no != '封面' else title
        toc_items.append(f'<a href="#sec{i}">{H.escape(toc_label)}</a>')

    sections_str = '\n    '.join(sections_html)
    toc_str = '\n        '.join(toc_items)

    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>{H.escape(name)} · 条款文字版</title>
<style>
{CSS}
</style>
</head>
<body>
<div class="topbar">
  <span class="ico">📜</span>
  <span class="ttl" id="barTtl">{H.escape(name)} · 条款文字版</span>
  <button id="tocBtn">目录</button>
</div>
<div class="progress"><i id="prog"></i></div>
<div class="wrap" id="wrap">
  <div class="tip">本文字版由官方条款 PDF（《{H.escape(source)}》）自动提取生成，仅供快速预览查阅；如与官方纸质/PDF条款不一致，以官方条款为准。生成日期：{generated}。</div>
    {sections_str}
</div>
<div class="fab">
  <button id="fsUp" title="缩小字体">A-</button>
  <button id="fsDn" title="放大字体">A+</button>
  <button id="top" title="回到顶部">↑</button>
</div>
<div class="drawer" id="drawer">
  <div class="panel">
    <button class="close" id="closeDrawer">×</button>
    <h3>条款目录</h3>
    <div class="toc" id="toc">
        {toc_str}
    </div>
  </div>
</div>
<script>
{JS}
</script>
</body>
</html>'''

# ── Main ───────────────────────────────────────────────────────

def process_file(filename):
    filepath = os.path.join(BASE, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.search(r'const CLAUSE\s*=\s*', content)
    if not match:
        print(f'  ERROR: Could not find CLAUSE in {filename}')
        return False

    start = match.end()
    decoder = json.JSONDecoder()
    clause_data, _ = decoder.raw_decode(content[start:])

    new_html = build_html(clause_data)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_html)

    print(f'  OK {filename} ({len(new_html):,} bytes)')
    return True

if __name__ == '__main__':
    print('Reformatting clause files (v2)...')
    for f in FILES:
        print(f'  Processing {f}...')
        process_file(f)
    print('Done!')
