"""Independent Decimal reconciliation against transcribed official 2025 annual-report cells."""
import json
from pathlib import Path
from decimal import Decimal,ROUND_HALF_UP
root=Path(__file__).resolve().parents[1]
d=json.loads((root/'assets/data/company-2025.json').read_text(encoding='utf-8'))
base=json.loads((root/'assets/data/knowledge-modules.json').read_text(encoding='utf-8'))
q=lambda n,places: n.quantize(Decimal(places),rounding=ROUND_HALF_UP)
assert base['metrics'][0]['value']=='1.9581','2026 source retained, not silently overwritten'
assert d['edition']=='2025' and d['annualEdition']
expected={'assets':('1.8995',1899484,1692297),'premium':('1958.71',195871,170511),'profit':('362.84',36284,26229),'embedded':('2878.40',287840,258448),'invested':('1.8412',1841227,1629361),'nbv':('98.42',9842,6253),'solvency':('210.47',None,None),'coreSolvency':('135.11',None,None),'totalReturn':('6.6',None,None),'comprehensiveReturn':('5.0',None,None)}
for m in d['metrics']:
    value,current,previous=expected[m['id']]
    assert m['value']==value and m['source']=='FY-2025' and '2025' in m['period']
    if current:
        c=m['comparison'];assert (c['currentMillions'],c['previousMillions'])==(current,previous)
        assert q((Decimal(current)/Decimal(previous)-1)*100,'.1')==Decimal(c['growthPct'])
        assert q(Decimal(current)/(1000000 if m['unit']=='万亿元' else 100),'.0001' if m['unit']=='万亿元' else '.01')==Decimal(value)
o=d['ownership'];a=o['aggregate'];total=Decimal(3119546600)
assert o['asOf']=='2025-12-31' and o['totalShares']==total
parts=[977530534,28249200,377162581,60503300]
assert [o['huijin']['shares'],o['huijin']['assetShares'],o['baowu']['shares'],o['baowu']['subsidiaryShares']]==parts
assert a['combinedShares']==sum(parts)==1443445615
assert q(Decimal(sum(parts))/total*100,'.01')==Decimal(a['combinedPct'])==Decimal('46.27')
assert q(Decimal(parts[0]+parts[1])/total*100,'.01')==Decimal(a['huijinPct'])==Decimal('32.24')
assert q(Decimal(parts[2]+parts[3])/total*100,'.01')==Decimal(a['baowuPct'])==Decimal('14.03')
assert q(Decimal(parts[0]+parts[2])/total*100,'.01')==Decimal(a['directPct'])==Decimal('43.43')
assert sum(d['allocation']['amounts'])==1841227
assert sum(Decimal(str(x[1])) for x in d['allocation']['items'])==100
for (_,pct),amount in zip(d['allocation']['items'],d['allocation']['amounts']):
    # The annual report's published category percentages are rounded independently.
    assert abs(Decimal(str(pct))-Decimal(amount)*100/Decimal(1841227))<=Decimal('.051')
assert len(d['allocation']['items'])==12
print('PASS 2025 annual cells, six growth rates, unit conversions, four shareholders, 46.27% total, twelve allocation categories; 2026 source preserved')
