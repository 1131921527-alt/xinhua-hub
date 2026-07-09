#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Batch generate editable versions for 5 calculators (except hongyu)."""
import re

BASE = r"E:\workbuddyFIle\腾讯龙虾的成品\新华保险资料库设计"

EDIT_CSS = """
  .edit-banner{background:linear-gradient(135deg,#7C3AED,#2563EB);color:#fff;border-radius:12px;padding:14px 18px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;}
  .edit-banner strong{font-size:16px;}
  .edit-banner .btn-save{background:#fff;color:#2563EB;border:none;border-radius:8px;padding:9px 18px;font-weight:700;cursor:pointer;font-size:14px;}
  .edit-banner .btn-save:hover{background:#F3F4F6;}
  [contenteditable="true"]{outline:none;}
  [contenteditable="true"]:hover,[contenteditable="true"]:focus{background:rgba(37,99,235,0.08);box-shadow:0 0 0 2px rgba(37,99,235,0.35);border-radius:4px;}
  th[contenteditable="true"]:hover,th[contenteditable="true"]:focus{outline:2px solid #2563EB;outline-offset:-2px;}
  .edit-section{background:#fff;border-radius:12px;padding:16px 18px;margin-bottom:14px;box-shadow:0 1px 4px rgba(0,0,0,.06);}
  .edit-section h2{font-size:16px;color:#1E3A5F;margin-bottom:12px;}
  .edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .edit-field{display:flex;flex-direction:column;gap:4px;}
  .edit-field label{font-size:12px;color:#64748B;font-weight:600;}
  .edit-field div[contenteditable]{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:8px 10px;font-size:14px;min-height:34px;}
  .edit-field textarea{width:100%;min-height:80px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:8px 10px;font-size:14px;font-family:inherit;resize:vertical;}
"""

DR = {
    'title': "document.getElementById('ext-title').textContent.trim()",
    'subtitle': "document.getElementById('ext-subtitle').textContent.trim()",
    'ctitle': "document.getElementById('ext-company-title').textContent.trim()",
    'ptitle': "document.getElementById('ext-product-title').textContent.trim()",
    'subhdr': "document.getElementById('ext-subheader').textContent.trim()",
    'footer1': "document.getElementById('ext-footer1').textContent.trim()",
    'footer2': "document.getElementById('ext-footer2').textContent.trim()",
    'cbullets': "document.getElementById('ext-company-bullets').value.split('\\n').map(s=>s.trim()).filter(Boolean)",
    'pbullets': "document.getElementById('ext-product-bullets').value.split('\\n').map(s=>s.trim()).filter(Boolean)",
    'headers': "Array.from(document.querySelectorAll('#resultTable thead th')).map(th=>th.innerHTML.replace(/<br\\s*\\/?>/gi,'\\n').replace(/<[^>]+>/g,'').trim())",
}

def make_panel(c):
    f = []
    f.append(f'    <div class="edit-field"><label>导出图标题</label><div id="ext-title" contenteditable="true">{c["title"]}</div></div>')
    if c.get('subtitle'):
        f.append(f'    <div class="edit-field"><label>导出图副标题</label><div id="ext-subtitle" contenteditable="true">{c["subtitle"]}</div></div>')
    else:
        f.append('    <div class="edit-field"><label>副标题（动态）</label><div style="color:#94A3B8;font-style:italic;">由参数自动生成</div></div>')
    f.append(f'    <div class="edit-field"><label>公司背景标题</label><div id="ext-company-title" contenteditable="true">{c["ctitle"]}</div></div>')
    f.append(f'    <div class="edit-field"><label>产品特点标题</label><div id="ext-product-title" contenteditable="true">{c["ptitle"]}</div></div>')
    f.append(f'    <div class="edit-field" style="grid-column:1/3"><label>公司背景内容（每行一句）</label><textarea id="ext-company-bullets">{c["clines"]}</textarea></div>')
    f.append(f'    <div class="edit-field" style="grid-column:1/3"><label>产品特点内容（每行一句）</label><textarea id="ext-product-bullets">{c["plines"]}</textarea></div>')
    f.append(f'    <div class="edit-field"><label>演示表小标题</label><div id="ext-subheader" contenteditable="true">{c["subhdr"]}</div></div>')
    f.append(f'    <div class="edit-field" style="grid-column:1/3"><label>页脚声明</label><textarea id="ext-footer1">{c["footer1"]}</textarea></div>')
    if c.get('footer2'):
        f.append(f'    <div class="edit-field" style="grid-column:1/3"><label>页脚声明（第二行）</label><textarea id="ext-footer2">{c["footer2"]}</textarea></div>')
    return '<!-- EDIT_START -->\n<div class="edit-banner"><div><strong>\U0001f4dd 编辑模式</strong> &nbsp; 修改下方文案后，点「生成利益演示」或「下载计划书图片」看效果。</div><button class="btn-save" onclick="downloadFinalHtml()">\u2b07 保存最终版本</button></div>\n<div class="edit-section" id="editPanel"><h2>导出图文案编辑区</h2><div class="edit-grid">\n' + '\n'.join(f) + '\n  </div>\n</div>\n<!-- EDIT_END -->'


def make_save_func(c):
    return (
        "\nfunction downloadFinalHtml(){\n"
        "  const html=document.documentElement.outerHTML;\n"
        "  let final=html.replace(/<!-- EDIT_START -->[\\s\\S]*?<!-- EDIT_END -->/,'');\n"
        "  final=final.replace(/ contenteditable=\"true\"/g,'');\n"
        f"  final=final.replace(/<title>[^<]*<\\/title>/,'<title>{c['page_title']}<\\/title>');\n"
        "  const blob=new Blob(['<!DOCTYPE html>\\n'+final],{type:'text/html;charset=utf-8'});\n"
        "  const a=document.createElement('a');\n"
        "  a.href=URL.createObjectURL(blob);\n"
        f"  a.download='{c['dl_name']}';\n"
        "  document.body.appendChild(a); a.click(); a.remove();\n"
        "  showToast('\u6700\u7ec8\u7248\u672c\u5df2\u4e0b\u8f7d \u2705');\n"
        "}\n"
    )


CONFIGS = [
    # 1. hongyuan (宏愿人生)
    {
        'name': 'hongyuan',
        'src': f'{BASE}\\calculator-hongyuan.html',
        'dst': f'{BASE}\\calculator-hongyuan-edit.html',
        'insert_after': '<div class="container">',
        'page_title': 'S02 宏愿人生养老年金保险（分红型）· 利益演示计算器',
        'dl_name': 'calculator-hongyuan.html',
        'title': 'S02 宏愿人生养老年金保险（分红型）',
        'subtitle': None,
        'ctitle': '公司背景',
        'clines': '成立1996年9月人民大会堂\n中央汇金(中农工建4行同属大股东)\n全国性大型寿险公司 全球2000强\nA+H股同步上市\n惠誉A级 穆迪A2级',
        'ptitle': '产品特点',
        'plines': '投保年龄 30天-69岁\n交费线 18-64岁 5万起\n领取线 18-59周岁 3年交2万7起\n养老年金 60周岁起领终身\n分红≥70%盈余 累积生息\n可减保 可贷现价80%',
        'subhdr': '利 益 演 示 表',
        'footer1': '本计划书数据源自官方演算表，仅供参考。具体利益以保险合同条款和正式计划书为准。',
        'footer2': '红利演示为基于公司经营假设的预期值，实际红利可能高于或低于演示值。',
        'hdr_var': 'COLS',
        'has_annHdr': False,
    },
    # 2. huacai (华彩鎏金)
    {
        'name': 'huacai',
        'src': f'{BASE}\\calculator-huacai.html',
        'dst': f'{BASE}\\calculator-huacai-edit.html',
        'insert_after': '<div class="container">',
        'page_title': 'S24 华彩鎏金年金保险（分红型）· 利益演示计算器',
        'dl_name': 'calculator-huacai.html',
        'title': '华彩鎏金年金保险（分红型） 利益演示',
        'subtitle': '利益演示计划书 · 数据源自官方演算表',
        'ctitle': '公司背景',
        'clines': '成立1996年9月\n中央汇金(中农工建4行同属大股东)\n接近1.9万亿总资产 偿付能力210%\nA+H股上市 全球最具价值保险品牌100强\n国内主流大型险企老六家之一\n连续九年获惠誉A级 穆迪A2级',
        'ptitle': '产品特点',
        'plines': '年金保险 第5年关爱金第6年起年金\n满期返保费 至105周岁\n身故保障 现金价值较大者\n分红累积生息 共享经营成果\n保单贷款80% 减保取现 灵活规划',
        'subhdr': '利 益 演 示 表',
        'footer1': '本计划书数据源自官方演算表，仅供参考，具体利益以保险合同条款和正式计划书为准。',
        'footer2': None,  # footer2 has dynamic ${dividendMode}, skip
        'hdr_var': 'hdrs',
        'has_annHdr': False,
    },
    # 3. fusheng (福盛世家)
    {
        'name': 'fusheng',
        'src': f'{BASE}\\calculator-fusheng.html',
        'dst': f'{BASE}\\calculator-fusheng-edit.html',
        'insert_after': '<div class="wrap">',
        'page_title': '福盛世家（添翼版）终身寿险 · 利益演示计算器',
        'dl_name': 'calculator-fusheng.html',
        'title': '福盛世家（添翼版）终身寿险 · 利益演示计划书',
        'subtitle': '新华保险 · 终身寿险（非分红型）· 固定收益保证利益',
        'ctitle': '★ 公司背景',
        'clines': '新华保险成立于1996年9月人民大会堂\n国有控股上市险企 A+H股同步上市\n惠誉国际评级A级\n服务网络覆盖全国1700余家机构',
        'ptitle': '★ 产品特点',
        'plines': '福盛世家添翼版 终身寿险(非分红型)\n固定收益保证利益\n现金价值写入合同逐年增长\n身故保障:现金价值较大者\n可减保可贷现价80%',
        'subhdr': '利 益 演 示 表',
        'footer1': '本计划书基于保证利益（非分红型）演算，现金价值写入合同逐年增长，仅供产品利益参考，具体以保险合同为准',
        'footer2': None,
        'hdr_var': 'hdrs',
        'has_annHdr': False,
    },
    # 4. hengxiang (恒享人生)
    {
        'name': 'hengxiang',
        'src': f'{BASE}\\calculator-hengxiang.html',
        'dst': f'{BASE}\\calculator-hengxiang-edit.html',
        'insert_after': '<div class="wrap">',
        'page_title': '恒享人生年金保险 · 利益演示计算器',
        'dl_name': 'calculator-hengxiang.html',
        'title': 'G23 恒享人生保险利益演示',
        'subtitle': '新华保险 · 年金保险（非分红型）· 保障至105周岁',
        'ctitle': '公司背景',
        'clines': '· 成立于1996年9月（人民大会堂）\n· 中央汇金控股（中农工建4行同属大股东）\n· 全国性大型寿险公司\n· 2024上市 全球品牌价值2000强',
        'ptitle': '产品特点',
        'plines': '· 投保年龄：30天-80周岁\n· 交费：18-64岁 5万起；领取18-59周岁\n· 关爱金：第5年起每年基本保额10%×5年\n· 年金：交清后每年固定给付\n· 非分红型·保证利益写入合同·保障至105周岁',
        'subhdr': '利 益 演 示 表',
        'footer1': '本演示基于保证利益（非分红型），生存总利益=关爱金/年金+满期保险金+现金价值，仅供产品利益参考，具体以保险合同为准',
        'footer2': None,
        'hdr_var': 'headers',
        'has_annHdr': False,
    },
    # 5. hongkun (宏坤人生)
    {
        'name': 'hongkun',
        'src': f'{BASE}\\calculator-hongkun.html',
        'dst': f'{BASE}\\calculator-hongkun-edit.html',
        'insert_after': '<div class="wrap">',
        'page_title': '宏坤人生养老年金保险 · 利益演示计算器',
        'dl_name': 'calculator-hongkun.html',
        'title': 'S06 宏坤人生养老年金保险（分红型） 利益演示',
        'subtitle': '新华保险 · 养老年金（分红型） · 综合值能力285% · 年化总投报收益率6.3%',
        'ctitle': '公司背景',
        'clines': '成立1996年9月人民大会堂\n中央汇金（中农工建4行同属大股东）\n全国性大型寿险公司\n2024上市 总规模178亿份\n综合值能力285%',
        'ptitle': '产品特点',
        'plines': '投保年龄：30天-75周岁\n交费线18-64岁5万起\n领取线18-59周岁趸交2万起\n养老年金：基本保额100%（可年领/月领）\n分红：累积生息 假设收益率6.3%\n保障期间：至105周岁后首个保单周年日',
        'subhdr': '利 益 演 示 表',
        'footer1': '本演示红利为基于公司经营假设的预期值，实际红利可能高于或低于演示值；生存总利益=养老年金祝寿金+满期保险金+现金价值+累积红利。具体以保险合同为准。',
        'footer2': None,
        'hdr_var': 'headers',
        'has_annHdr': True,
    },
]


def process(c):
    with open(c['src'], 'r', encoding='utf-8') as f:
        html = f.read()

    warnings = []

    # 1. Add edit CSS before </style>
    html = html.replace('</style>', EDIT_CSS + '\n</style>')

    # 2. Insert edit panel after main container
    panel = make_panel(c)
    html = html.replace(c['insert_after'], c['insert_after'] + '\n' + panel, 1)

    # 3. Add contenteditable to th elements
    html = re.sub(r'<th(>)', r'<th contenteditable="true"\1', html)
    html = re.sub(r'<th(\s)', r'<th contenteditable="true"\1', html)

    # 4. Replace title in downloadImage
    old_t = f"ctx.fillText('{c['title']}',"
    if old_t in html:
        html = html.replace(old_t, f"ctx.fillText({DR['title']},")
    else:
        warnings.append(f"  WARN: title not found")

    # 5. Replace subtitle (if static)
    if c.get('subtitle'):
        old_s = f"ctx.fillText('{c['subtitle']}',"
        if old_s in html:
            html = html.replace(old_s, f"ctx.fillText({DR['subtitle']},")
        else:
            warnings.append(f"  WARN: subtitle not found")

    # 6. Replace company title
    html = re.sub(r"ctx\.fillText\('(\u2605 )?\u516c\u53f8\u80cc\u666f',", f"ctx.fillText({DR['ctitle']},", html)

    # 7. Replace product title
    html = re.sub(r"ctx\.fillText\('(\u2605 )?\u4ea7\u54c1\u7279\u70b9',", f"ctx.fillText({DR['ptitle']},", html)

    # 8. Replace company lines array (use lambda to avoid escape issues)
    html = re.sub(r"const (compLines|leftLines)\s*=\s*\[[\s\S]*?\];", lambda m: f"const {m.group(1)} = {DR['cbullets']};", html)

    # 9. Replace product lines array
    html = re.sub(r"const (prodLines|rightLines)\s*=\s*\[[\s\S]*?\];", lambda m: f"const {m.group(1)} = {DR['pbullets']};", html)

    # 10. Replace subheader
    html = html.replace("ctx.fillText('\u5229 \u76ca \u6f14 \u793a \u8868',", f"ctx.fillText({DR['subhdr']},")

    # 11. Replace footer1
    old_f1 = f"ctx.fillText('{c['footer1']}',"
    if old_f1 in html:
        html = html.replace(old_f1, f"ctx.fillText({DR['footer1']},")

    # 12. Replace footer2 (if exists and static)
    if c.get('footer2'):
        old_f2 = f"ctx.fillText('{c['footer2']}',"
        if old_f2 in html:
            html = html.replace(old_f2, f"ctx.fillText({DR['footer2']},")

    # 13. Replace headers array (use lambda to avoid escape issues)
    hv = c['hdr_var']
    html = re.sub(rf"const {hv}\s*=\s*\[[\s\S]*?\];", lambda m: f"const {hv}={DR['headers']};", html)

    # 14. Remove annHdr line (hongkun only)
    if c.get('has_annHdr'):
        html = re.sub(r"  const annHdr\s*=\s*drawMode===[^\n]*\n", "", html)

    # 15. Add downloadFinalHtml before last </script>
    save_func = make_save_func(c)
    idx = html.rfind('</script>')
    html = html[:idx] + save_func + html[idx:]

    with open(c['dst'], 'w', encoding='utf-8') as f:
        f.write(html)

    sz = len(html)
    print(f"OK: {c['name']} -> {c['dst']} ({sz} bytes)")
    for w in warnings:
        print(w)


if __name__ == '__main__':
    for c in CONFIGS:
        process(c)
    print("\nDone! 5 edit versions generated.")
