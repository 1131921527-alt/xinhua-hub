"""Inspect real downloaded vector PDFs/PNG archives/PPTX, not just generation callbacks."""
from pathlib import Path
from decimal import Decimal,ROUND_HALF_UP
from collections import Counter
import sys,json,re,zipfile,io
import pymupdf as fitz
from PIL import Image,ImageDraw
root=Path(sys.argv[1]);out=root/'inspection';out.mkdir(exist_ok=True)
repo=Path(__file__).resolve().parents[1];data=json.loads((repo/'assets/data/knowledge-modules.json').read_text(encoding='utf-8'));o=data['ownership']
def pct(shares):return str((Decimal(shares)*100/Decimal(o['totalShares'])).quantize(Decimal('.01'),rounding=ROUND_HALF_UP))
assert pct(o['huijin']['shares'])==o['huijin']['directPct']=='31.34'
assert pct(o['huijin']['assetShares'])==o['huijin']['assetPct']=='0.91'
assert pct(o['baowu']['shares'])==o['baowu']['directPct']=='12.09'
assert pct(o['baowu']['subsidiaryShares'])==o['baowu']['subsidiaryPct']=='1.94'
assert pct(o['baowu']['shares']+o['baowu']['subsidiaryShares'])==o['baowu']['combinedPct']=='14.03'
assert o['asOf']=='2026-06-30'
report={'shareholderRules':'passed','files':[]}
norm=lambda s:re.sub(r'\s+','',s)
for file in root.glob('about-xinhua.html-*-pdf.pdf'):
    doc=fitz.open(file);text=norm(''.join(p.get_text() for p in doc));coverage=json.loads(file.with_name(file.stem+'-coverage.json').read_text(encoding='utf-8'))
    missing=[r for r in coverage['expectedTextSegments'] if text.count(r['text'])<r['count']]
    if missing:
        (out/(file.stem+'-missing.json')).write_text(json.dumps(missing,ensure_ascii=False,indent=2),encoding='utf-8')
    assert not missing,(file.name,'PDF text extraction did not recover original segments',missing[:3])
    assert all(token in text for token in ['31.34%','12.09%','1.94%','14.03%','0.91%','227.93','3103.84'])
    assert text.count('资本覆盖：不是收益指标')==1
    assert 'github.io/xinhua-hub' not in text and '导出日期' not in text
    assert sum(len(p.get_images()) for p in doc)==0,'company PDF must not contain whole-page bitmap'
    paths=sum(len(p.get_drawings()) for p in doc);assert paths>50
    used_fonts={r[0] for p in doc for r in p.get_fonts()};embedded=[]
    for x in used_fonts:
        name,ext,kind,content=doc.extract_font(x)
        if content:
            assert '/ToUnicode' in doc.xref_object(x)
            embedded.append((name,len(content)))
    assert len(embedded)>=2,'regular and bold CJK fonts must be embedded'
    assert sum(len(p.get_links()) for p in doc)>=13
    thumbs=[]
    for i,p in enumerate(doc):
        pix=p.get_pixmap(matrix=fitz.Matrix(390/p.rect.width,390/p.rect.width));name=out/f'{file.stem}-p{i+1:02}.png';pix.save(name);im=Image.open(name).convert('RGB');im.thumbnail((260,480));thumbs.append(im)
    rows=(len(thumbs)+3)//4;sheet=Image.new('RGB',(1120,510*rows),'#e5ebf3');draw=ImageDraw.Draw(sheet)
    for i,im in enumerate(thumbs):x=(i%4)*280+10;y=(i//4)*510+10;sheet.paste(im,(x,y));draw.text((x,y+485),f'{i+1}/{len(doc)}',fill='black')
    sheet.save(out/(file.stem+'-all.png'))
    report['files'].append({'file':file.name,'pages':len(doc),'textSegments':'100% recovered','searchable':True,'rasterImages':0,'vectorPaths':paths,'embeddedFonts':embedded,'bytes':file.stat().st_size})
for file in root.glob('about-xinhua*.zip'):
    with zipfile.ZipFile(file) as z:
        assert z.testzip() is None
        for name in z.namelist():
            im=Image.open(io.BytesIO(z.read(name)));assert im.width in (1500,2250);assert im.width*im.height<=9000000
        report['files'].append({'file':file.name,'parts':len(z.namelist()),'pngPixelWidth':im.width,'CRC':'passed','bytes':file.stat().st_size})
for file in root.glob('*.pptx'):
    with zipfile.ZipFile(file) as z:
        assert z.testzip() is None
        imgs=[Image.open(io.BytesIO(z.read(n))).convert('RGB') for n in z.namelist() if n.startswith('ppt/media/') and n.endswith('.png')]
        assert imgs and all(im.size==(2560,1440) for im in imgs)
        sheet=Image.new('RGB',(1280,205*((len(imgs)+3)//4)),'#e5ebf3');draw=ImageDraw.Draw(sheet)
        for i,im in enumerate(imgs):im.thumbnail((310,175));x=i%4*320+5;y=i//4*205+5;sheet.paste(im,(x,y));draw.text((x,y+180),f'{i+1}/{len(imgs)}',fill='black')
        sheet.save(out/(file.stem+'-all-slides.png'))
        report['files'].append({'file':file.name,'slides':len(imgs),'slidePixels':'2560x1440','CRC':'passed','officeApplicationOpen':'not_verified','bytes':file.stat().st_size})
(out/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
