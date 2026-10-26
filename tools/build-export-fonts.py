"""Build licensed static CJK subsets from Google's OFL Noto Sans SC source.
Usage: python tools/build-export-fonts.py /absolute/path/NotoSansSC-variable.ttf
Only the public company content/renderers are used as the character inventory.
"""
from pathlib import Path
import sys,json,hashlib
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset
root=Path(__file__).resolve().parents[1]
paths=['assets/js/knowledge-topics.js','assets/js/company-export.js','assets/js/content-export.js','assets/data/knowledge-modules.json','about-xinhua.html']
text=''.join((root/p).read_text(encoding='utf-8') for p in paths)
needed=set(range(32,127))|{ord(c) for c in text if ord(c)>=160}
source=Path(sys.argv[1]);dest=root/'assets/vendor/export';dest.mkdir(exist_ok=True)
font=TTFont(source);available=set(font.getBestCmap());codes=sorted(needed&available)
for weight,style in [(400,'Regular'),(700,'Bold')]:
    static=instantiateVariableFont(TTFont(source),{'wght':weight},inplace=False)
    options=subset.Options();options.recalc_timestamp=False;options.layout_features=[]
    job=subset.Subsetter(options=options);job.populate(unicodes=codes);job.subset(static)
    for record in static['name'].names:
        if record.nameID in (1,2,3,4,6):
            value={1:'HubExportSans',2:style,3:'HubExportSans-'+style,4:'HubExportSans '+style,6:'HubExportSans-'+style}[record.nameID]
            record.string=value.encode(record.getEncoding(),errors='replace')
    path=dest/f'HubExportSans-{style}.ttf';static.save(path);print(path.name,path.stat().st_size)
manifest={'family':'HubExportSans','license':'SIL OFL 1.1; see font-OFL.txt','source':'https://github.com/google/fonts/tree/main/ofl/notosanssc','sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'codepoints':codes,'inputs':paths}
(dest/'font-coverage.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
