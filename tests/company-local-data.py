"""Reconcile the scoped company overlay with independently retrieved official pages."""
import json,re,sys,html,subprocess,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
d=json.loads((root/'assets/data/company-background-dividends.json').read_text(encoding='utf-8'))
assert not ({'metrics','allocation','rates','investmentStrategy'} & d.keys()),'company overlay must not replace common business data'
for name in ('knowledge-modules.json','company-2025.json'):
    before=subprocess.check_output(['git','show','aada4a4:assets/data/'+name],cwd=root)
    assert json.loads(before)==json.loads((root/'assets/data'/name).read_text(encoding='utf-8'))
rows=d['companyRates']['rows'];assert len(rows)==10
assert len({(r['product'],r['year'],r['kind']) for r in rows})==10
expected=[('宏盈来两全保险（分红型）',2024,121),('宏耀世家终身寿险（分红型）',2024,114),('新华尊悦终身年金保险（分红型）',2024,117),('宏图世家终身寿险（分红型）',2025,114),('宏御世家终身寿险（分红型）',2025,118),('盛世荣耀庆典版终身寿险（分红型）',2025,118),('宏泰世家终身寿险（分红型）',2025,118),('宏禧来两全保险（分红型）',2025,118),('盛世恒盈年金保险（分红型）',2025,118),('财富恒盈年金保险（分红型）',2025,118)]
assert [(r['product'],r['year'],r['rate']) for r in rows]==expected
assert all(r['kind']=='现金红利实现率' and r['status']=='confirmed' and r['source'] in d['sources'] for r in rows)
assert sum(not r['secondary'] and r['year']==2024 for r in rows)==3
assert sum(not r['secondary'] and r['year']==2025 for r in rows)==5
assert d['ownershipPatch']['asOf']=='2026-06-30'
assert '2007年9月29日' in d['ownershipPatch']['cic']['description']
assert '2003年12月16日' in d['ownershipPatch']['huijinDescription']
assert '特别国债' in d['ownershipPatch']['capitalHistory']['text']
assert '81' not in json.dumps(d,ensure_ascii=False) and '82.3' not in json.dumps(d,ensure_ascii=False),'unverified aggregate statistics excluded'
assert hashlib.sha256((root/'files/公司介绍/新华保险2026年半年度报告.pdf').read_bytes()).hexdigest()=='7adf89e1281573651a73de198828d0b3db9e1e3f95f6e22d040f41156849e972'
if len(sys.argv)>1:
    evidence=Path(sys.argv[1])
    for r in rows:
        source=evidence/(r['product']+'.html' if r['source']!='R-CURRENT' else 'confirmed-2025.html')
        raw=source.read_text(encoding='utf-8');tables=re.findall(r'<table\b.*?</table>',raw,re.S)
        table=next(t for t in tables if r['product'] in t)
        text=re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',table)))
        assert '现金红利实现率' in text
        if r['source']=='R-CURRENT':assert f"{r['year']} {r['product']} {r['rate']}%" in text
        else:assert f"{r['year']} {r['rate']}%" in text
    print('PASS ten official product-year-cash rows independently read from downloaded HTML tables')
print('PASS company-only overlay, unchanged operating/investment data, H1 ownership source, 3/5 representative rows plus two retained annuities, no unverified company totals')
