#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成 calculator-hongtai-edit.html：可编辑版宏泰计算器
- 表头可编辑（contenteditable）
- 导出图的公司介绍、产品特点、标题、副标题、VIP行、表头、页脚等文案均可编辑
- 点击「保存最终版本」可下载不可编辑的 calculator-hongtai.html
"""
import re

src_path = r"E:\workbuddyFIle\腾讯龙虾的成品\新华保险资料库设计\calculator-hongtai.html"
dst_path = r"E:\workbuddyFIle\腾讯龙虾的成品\新华保险资料库设计\calculator-hongtai-edit.html"

with open(src_path, "r", encoding="utf-8") as f:
    html = f.read()

# 1. 加编辑模式CSS
edit_css = """
  /* 编辑模式专用样式 */
  .edit-banner{background:linear-gradient(135deg,#7C3AED,#2563EB);color:#fff;border-radius:12px;padding:14px 18px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;}
  .edit-banner strong{font-size:16px;}
  .edit-banner .btn-save{background:#fff;color:#2563EB;border:none;border-radius:8px;padding:9px 18px;font-weight:700;cursor:pointer;font-size:14px;}
  .edit-banner .btn-save:hover{background:#F3F4F6;}
  [contenteditable="true"]{outline:none;}
  [contenteditable="true"]:hover,[contenteditable="true"]:focus{background:rgba(37,99,235,0.08);box-shadow:0 0 0 2px rgba(37,99,235,0.35);border-radius:4px;}
  th[contenteditable="true"]:hover,th[contenteditable="true"]:focus{background:#475569;}
  .edit-section{background:#fff;border-radius:12px;padding:16px 18px;margin-bottom:14px;box-shadow:0 1px 4px rgba(0,0,0,.06);}
  .edit-section h2{font-size:16px;color:#1E3A5F;margin-bottom:12px;}
  .edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .edit-field{display:flex;flex-direction:column;gap:4px;}
  .edit-field label{font-size:12px;color:#64748B;font-weight:600;}
  .edit-field div{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:8px 10px;font-size:14px;min-height:34px;}
  .edit-field textarea{width:100%;min-height:80px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:8px 10px;font-size:14px;font-family:inherit;resize:vertical;}
"""
# 在 </style> 前插入
html = html.replace("</style>", edit_css + "\n</style>")

# 2. 在 body 开头加编辑提示和导出图文案编辑区
edit_html = """
<!-- 编辑模式：导出图文案区（可折叠，也可直接编辑） -->
<div class="edit-banner">
  <div>
    <strong>📝 编辑模式</strong> &nbsp; 蓝色高亮区域可直接修改文字，改完点「生成利益演示」或「下载理财计划书图片」看效果。
  </div>
  <button class="btn-save" onclick="downloadFinalHtml()">⬇ 保存最终版本</button>
</div>

<div class="edit-section" id="editPanel">
  <h2>导出图文案编辑区</h2>
  <div class="edit-grid">
    <div class="edit-field">
      <label>导出图标题</label>
      <div id="ext-title" contenteditable="true">宏泰世家（分红型）理财计划</div>
    </div>
    <div class="edit-field">
      <label>导出图副标题</label>
      <div id="ext-subtitle" contenteditable="true">新华保险 · 分红型终身寿险（交清增额 · 红利演示）</div>
    </div>
    <div class="edit-field">
      <label>公司介绍标题</label>
      <div id="ext-company-title" contenteditable="true">公司介绍</div>
    </div>
    <div class="edit-field">
      <label>产品特点标题</label>
      <div id="ext-product-title" contenteditable="true">产品特点</div>
    </div>
    <div class="edit-field" style="grid-column:1/3">
      <label>公司介绍内容（每行一句，保持前面的「·」）</label>
      <textarea id="ext-company-bullets">· 成立于1996年9月，人民大会堂签章
· 中央汇金与中农工建4大银行同属大股东
· 全国性大型寿险公司（A+H股上市）
· 全球品牌价值2000强企业</textarea>
    </div>
    <div class="edit-field" style="grid-column:1/3">
      <label>产品特点内容（每行一句，保持前面的「·」）</label>
      <textarea id="ext-product-bullets">· 保险期间：终身
· 投保年龄：男63-73岁 / 女30-57岁
· 交费方式：趸交 / 3年 / 5年交
· 红利领取：交清增额分红
· 身故保障：160%已交保费或现金价值较高者
· 意外身故：额外赔付一倍</textarea>
    </div>
    <div class="edit-field">
      <label>演示表小标题</label>
      <div id="ext-subheader" contenteditable="true">利 益 演 示 表</div>
    </div>
    <div class="edit-field">
      <label>页脚声明</label>
      <div id="ext-footer" contenteditable="true">本演示基于交清增额红利领取方式，利益演示仅供参考，不作为保险合同组成部分，具体以保险合同为准。</div>
    </div>
  </div>
</div>
"""
html = html.replace("<div class=\"wrap\">", "<div class=\"wrap\">\n" + edit_html)

# 3. 表头加 contenteditable
html = html.replace(
    "<th>保单年度</th><th>年龄<br/>（年末）</th><th>当年保费<br/>（年初）</th>\n          <th>保单年度及现金价值<br/>减保金额/保险金</th><th>保证价值<br/>保险金</th>\n          <th>累计红利演示<br/>/保险金</th><th>红利<br/>购买价</th>\n          <th>生存总利益<br/>（年末）保单价值<br/>（退保游分）（保证+红利）</th><th>满年龄<br/>收益率</th>",
    """<th contenteditable="true">保单年度</th><th contenteditable="true">年龄<br/>（年末）</th><th contenteditable="true">当年保费<br/>（年初）</th>
          <th contenteditable="true">保单年度及现金价值<br/>减保金额/保险金</th><th contenteditable="true">保证价值<br/>保险金</th>
          <th contenteditable="true">累计红利演示<br/>/保险金</th><th contenteditable="true">红利<br/>购买价</th>
          <th contenteditable="true">生存总利益<br/>（年末）保单价值<br/>（退保游分）（保证+红利）</th><th contenteditable="true">满年龄<br/>收益率</th>"""
)

# 4. 修改 downloadImage 函数：从 DOM 读取文案
# 4.1 替换标题绘制
html = html.replace(
    "ctx.fillText('宏泰世家（分红型）理财计划', PAD+totalW/2, y+TITLE_H/2-12);",
    "ctx.fillText(document.getElementById('ext-title').textContent.trim(), PAD+totalW/2, y+TITLE_H/2-12);"
)
html = html.replace(
    "ctx.fillText('新华保险 · 分红型终身寿险（交清增额 · 红利演示）', PAD+totalW/2, y+TITLE_H/2+18);",
    "ctx.fillText(document.getElementById('ext-subtitle').textContent.trim(), PAD+totalW/2, y+TITLE_H/2+18);"
)

# 4.2 替换公司介绍/产品特点
html = html.replace(
    "ctx.fillText('公司介绍', PAD+14, infoY+12);",
    "ctx.fillText(document.getElementById('ext-company-title').textContent.trim(), PAD+14, infoY+12);"
)
html = html.replace(
    """  ['· 成立于1996年9月，人民大会堂签章',
   '· 中央汇金与中农工建4大银行同属大股东',
   '· 全国性大型寿险公司（A+H股上市）',
   '· 全球品牌价值2000强企业'].forEach((t,i)=>ctx.fillText(t, PAD+14, infoY+38+i*15));""",
    """  document.getElementById('ext-company-bullets').value.split('\\n').map(s=>s.trim()).filter(Boolean).forEach((t,i)=>ctx.fillText(t, PAD+14, infoY+38+i*15));"""
)
html = html.replace(
    "ctx.fillText('产品特点', midX+14, infoY+12);",
    "ctx.fillText(document.getElementById('ext-product-title').textContent.trim(), midX+14, infoY+12);"
)
html = html.replace(
    """  ['· 保险期间：终身',
   '· 投保年龄：男63-73岁 / 女30-57岁',
   '· 交费方式：趸交 / 3年 / 5年交',
   '· 红利领取：交清增额分红',
   '· 身故保障：160%已交保费或现金价值较高者',
   '· 意外身故：额外赔付一倍'].forEach((t,i)=>ctx.fillText(t, midX+14, infoY+38+i*14));""",
    """  document.getElementById('ext-product-bullets').value.split('\\n').map(s=>s.trim()).filter(Boolean).forEach((t,i)=>ctx.fillText(t, midX+14, infoY+38+i*14));"""
)

# 4.3 替换子标题
html = html.replace(
    "ctx.fillText('利 益 演 示 表', PAD+totalW/2, subY+SUBHDR_H/2);",
    "ctx.fillText(document.getElementById('ext-subheader').textContent.trim(), PAD+totalW/2, subY+SUBHDR_H/2);"
)

# 4.4 替换表头：从 HTML 表格读取
html = html.replace(
    """  const headers=[
    ['保单年度'],
    ['年龄','（年末）'],
    ['当年保费','（年初）'],
    ['保单年度及现金价值','减保金额/保险金'],
    ['保证价值','保险金'],
    ['累计红利演示','/保险金'],
    ['红利','购买价'],
    ['生存总利益','（年末）','保单价值','（退保游分）','（保证+红利）'],
    ['满年龄','收益率']
  ];""",
    """  const headers=Array.from(document.querySelectorAll('#resultTable thead th')).map(th=>{
    return th.innerHTML.split(/<br\\s*\\/?>/i).map(s=>s.replace(/<[^>]+>/g,'').trim()).filter(Boolean);
  });"""
)

# 4.5 替换投资期文字
html = html.replace(
    "ctx.fillText('投资期', colX+colW[8]/2, y0+blockH/2);",
    "ctx.fillText('投资期', colX+colW[8]/2, y0+blockH/2);"
)

# 4.6 替换页脚
html = html.replace(
    """ctx.fillText('本演示基于交清增额红利领取方式，利益演示仅供参考，不作为保险合同组成部分，具体以保险合同为准。',
    PAD+totalW/2, footY);""",
    """ctx.fillText(document.getElementById('ext-footer').textContent.trim(),
    PAD+totalW/2, footY);"""
)

# 5. 添加保存最终版本的函数
save_func = """
// 保存最终版本：移除编辑UI和contenteditable，生成不可编辑的 calculator-hongtai.html
function downloadFinalHtml(){
  const html=document.documentElement.outerHTML;
  // 去掉编辑banner和编辑面板
  let final=html.replace(/<div class=\"edit-banner\"[\\s\\S]*?<\\/div><\\/div>/,'');
  final=final.replace(/<div class=\"edit-section\" id=\"editPanel\"[\\s\\S]*?<\\/div><!-- 编辑模式[^>]*>/,'');
  // 移除 contenteditable 属性
  final=final.replace(/ contenteditable=\"true\"/g,'');
  final=final.replace(/<title>[^<]*<\\/title>/,'<title>宏泰世家（分红型）利益演示计算器<\\/title>');
  const blob=new Blob(['<!DOCTYPE html>\\n'+final],{type:'text/html;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='calculator-hongtai.html';
  document.body.appendChild(a); a.click(); a.remove();
  showToast('最终版本已下载 ✅');
}
"""
html = html.replace("// 初始化\ngenerate();", save_func + "\n// 初始化\ngenerate();")

with open(dst_path, "w", encoding="utf-8") as f:
    f.write(html)

print(f"已生成: {dst_path}")
