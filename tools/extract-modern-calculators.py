"""Extract original primary actuarial tables; never export customer/input worksheets.
Usage: python tools/extract-modern-calculators.py hongan-anyue|hongyu-anyue|hongda-jintai ORIGINAL.xlsx
Original files remain private. No Excel formulas or originals are modified.
"""
from pathlib import Path
import zipfile,xml.etree.ElementTree as E,json,hashlib,sys,re
root=Path(__file__).resolve().parents[1];kind,path=sys.argv[1],Path(sys.argv[2]);z=zipfile.ZipFile(path)
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'};q=lambda s:'{'+ns['s']+'}'+s
strings=[]
for _,e in E.iterparse(z.open('xl/sharedStrings.xml'),events=['end']):
 if e.tag==q('si'):strings.append(''.join(e.itertext()));e.clear()
wb=E.fromstring(z.read('xl/workbook.xml'));rels={r.attrib['Id']:r.attrib['Target'] for r in E.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
def target(s):
 t=rels[s.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']];return t.lstrip('/') if t.startswith('/') else 'xl/'+t
def rows(s):
 for _,e in E.iterparse(z.open(target(s)),events=['end']):
  if e.tag!=q('row'):continue
  d={}
  for c in e.findall(q('c')):
   v=c.find(q('v'));v=v.text if v is not None else None
   if c.attrib.get('t')=='s' and v is not None:v=strings[int(v)]
   elif c.attrib.get('t')=='inlineStr':v=''.join(c.find(q('is')).itertext())
   elif v is not None and c.attrib.get('t') not in ('e','str'):
    v=float(v);v=int(v) if v.is_integer() else v
   d[re.sub(r'\d','',c.attrib['r'])]=v
  yield int(e.attrib['r']),d
  e.clear()
sheets=wb.findall('s:sheets/s:sheet',ns);is_ann=kind=='hongda-jintai';data_sheet=next(s for s in sheets if '相关利益演示数据' in s.attrib['name'] or s.attrib['name']=='利益演示全表')
columns=['E','G','H','I','J','K','L','M','N','Q'] if is_ann else ['E','G','H','J','K','M','O','P']
groups={}
for number,r in rows(data_sheet):
 if number<5:continue
 sex,age,term,t=(r[c] for c in ['B','C','D','F']);key=f'{sex}_{age}_{term}';group=groups.setdefault(key,[])
 assert t==len(group)+1,(key,t)
 vals=[r[c] for c in columns];assert all(isinstance(v,(int,float)) for v in vals),(number,vals)
 group.append(vals)
input_sheet=next(s for s in sheets if s.attrib['name']=='投保信息');inputs={str(n):r for n,r in rows(input_sheet)}
if is_ann:
 rules={str(inputs[str(n)]['AB']):{'male':inputs[str(n)]['AC'],'female':inputs[str(n)]['AD'],'pensionMale':inputs[str(n)]['AE'],'pensionFemale':inputs[str(n)]['AF'],'minimum':inputs[str(n)]['AG']} for n in range(17,22)}
 default={'gender':0 if inputs['7']['I']=='男' else 1,'age':inputs['7']['M'],'term':inputs['11']['AB'],'premium':inputs['11']['J']}
else:
 rules={str(inputs[str(n)]['AG']):{'male':inputs[str(n)]['AH'],'female':inputs[str(n)]['AI'],'minimum':inputs[str(n)]['AJ']} for n in [18,20,22,24,26]}
 default={'gender':0 if inputs['7']['L']=='男' else 1,'age':inputs['7']['S'],'term':inputs['11']['AG'],'premium':inputs['11']['M']}
meta={'productId':kind,'sourceId':'SRC-20261109-'+{'hongan-anyue':'001','hongyu-anyue':'002','hongda-jintai':'003'}[kind],'file':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'sheet':data_sheet.attrib['name'],'primaryColumns':columns,'date':'2026-11-09','scope':'产品通用规则，非银行渠道准入','accuracy':'pending_verification','interestRate':0.0175,'rules':rules,'combinations':len(groups),'rows':sum(map(len,groups.values()))}
out=root/'assets/data'/f'{kind}.json';out.write_text(json.dumps({'meta':meta,'data':groups},ensure_ascii=False,separators=(',',':')),encoding='utf-8')
fixtures=[]
for s in sheets:
 name=s.attrib['name']
 if not ('未发生减保利益演示' in name or is_ann and name.endswith('利益演示')):continue
 columns_cached=list('BCDEFGHIJKLMNOP') if kind=='hongan-anyue' else list('BCDEFGHIJKLMNO') if kind=='hongyu-anyue' and '交清增额' in name else list('BCDEFGHIJKLMNO') if not is_ann else list('BCDEFGHIJKLMNOPQR')
 values=[]
 for n,r in rows(s):
  if n<(8 if is_ann else 9) or not isinstance(r.get('B'),int):continue
  values.append({c:r.get(c) for c in columns_cached if isinstance(r.get(c),(int,float))})
 fixtures.append({'mode':'accumulation' if is_ann or '累积生息' in name else 'paidup','input':default,'rows':values,'sheet':name})
fixture=root/'tests/fixtures'/f'{kind}-excel.json';fixture.write_text(json.dumps({'productId':kind,'sourceId':meta['sourceId'],'cases':fixtures},ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(kind,meta['rules'],meta['combinations'],meta['rows'],out.stat().st_size,'fixtures',[(c['mode'],len(c['rows'])) for c in fixtures],flush=True)
