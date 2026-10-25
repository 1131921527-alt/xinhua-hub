'use strict';
const assert=require('assert/strict');
const hd=require('../assets/js/hongda-engine'),dd=require('../data_hongda.json'),hdf=require('./fixtures/hongda-excel-F40.json');
const hx=require('../assets/js/hongxile-anyue-verified-engine'),xd=require('../assets/data/hongxile-anyue.json'),hxf=require('./fixtures/hongxile-anyue-excel-F40.json');
let checked=0;
const actual=hd.calculate(dd,hdf.input),map={B:'t',C:'ageEnd',D:'premYr',E:'annuity',F:'cumAnnuity',G:'divYr',H:'cumDiv',I:'cv',J:'deathBase',K:'deathG',L:'deathD',M:'survG',N:'survD'};
for(const row of hdf.rows){const r=actual[row.B-1];for(const[c,k]of Object.entries(map)){if(row.B===actual.length&&['E','I'].includes(c))continue;assert.equal(r[k],row[c],`Hongda ${row.B} ${k}`);checked++;}}
assert.equal(actual.at(-1).cv,0);assert.equal(actual.at(-1).annuity,actual.at(-1).maturity+dd['1_40_1'].ann.at(-1)*100);
for(const mode of ['accumulation','paidup']){const a=hx.calculate(xd,{...hxf.input,dividendMode:mode});for(const row of hxf.rows){const r=a.rows[row.B-1];for(const[c,k]of Object.entries({B:'year',C:'premium',D:'totalPremium',E:'maturityBenefit',F:'deathBenefit',I:'guaranteedCashValue',AL:'annualPaidupSumAssured',AM:'cumulativePaidupSumAssured',AP:'paidupCashValue'})){assert.equal(r[k],row[c],`Hongxile ${mode} ${row.B} ${k}`);checked++;}assert.equal(r.dividendCashValue,row[mode==='accumulation'?'BB':'AP']);}}
console.log('PASS Excel cached assertions',checked);
const photo=require('./fixtures/hongda-miniapp-F55.json'),pa=hd.calculate(dd,photo.input),raw=dd['1_55_1'];let unrounded=0,photoChecked=0,roundingDifferences=0,maxDifference=0;
for(let i=0;i<pa.length;i++){
 unrounded=unrounded*1.025+Math.round(raw.hl[i]*1000);
 const p=photo.rows.find(r=>r.values[0]===i+1);if(!p)continue;const r=pa[i];
 const values=[r.t,r.cv,r.annuity,r.survG,r.divYr,r.cumDiv,r.divYr+r.annuity,r.survD,r.yieldVal===null?null:Number((r.yieldVal*100).toFixed(2))];
 p.values.forEach((expected,j)=>{if([5,7].includes(j)){const alternative=j===5?Math.round(unrounded):r.survG+Math.round(unrounded);assert.equal(alternative,expected,'diagnostic: photo keeps intermediate precision');if(values[j]!==expected){roundingDifferences++;maxDifference=Math.max(maxDifference,Math.abs(values[j]-expected));}}else assert.equal(values[j],expected,`photo ${r.t} ${photo.columns[j]}`);photoChecked++;});assert.equal(r.ageEnd,p.ageEnd);assert.equal(r.premYr,p.premium);photoChecked+=2;
}
console.log('PASS photo diagnostic',photoChecked,'fields;',roundingDifferences,'documented rounding differences, maximum',maxDifference,'yuan; not an exact-match claim');
let cases=0,years=0;for(const gender of [0,1])for(const age of [0,17,40,55,60,70])for(const term of [1,3,5,6,10])for(const premium of [100000,1000000]){if(!dd[`${gender}_${age}_${term}`])continue;const a=hd.calculate(dd,{gender,age,term,premium});for(const r of a){assert(Number.isFinite(r.survD));assert.equal(r.survD,Math.round((r.survG+r.cumDiv)*10)/10);}assert(a.at(-1).cv===0);cases++;years+=a.length;}
console.log('PASS Hongda independent combinations',cases,'years',years);
cases=0;years=0;for(const sex of [0,1])for(const age of [0,17,40,55,60,70,sex?82:80])for(const period of [5,6,7,8])for(const premium of [10000,100000,1000000])for(const dividendMode of ['accumulation','paidup']){const a=hx.calculate(xd,{sex,age,period,premium,dividendMode});for(const r of a.rows){assert.equal(r.totalBenefit,r.guaranteedCashValue+r.dividendCashValue);assert(Number.isFinite(r.totalBenefit));assert(r.dividendCashValue>=0);}cases++;years+=a.rows.length;}
console.log('PASS Hongxile combinations',cases,'years',years,'both branches');
let assertions=0;const refs=require('./fixtures/desktop-independent-reference.json');for(const c of refs.cases){const a=c.product==='hongda'?hd.calculate(dd,c.input):hx.calculate(xd,c.input).rows;assert.equal(a.length,c.rows.length);c.rows.forEach((expected,i)=>Object.entries(expected).forEach(([key,val])=>{assert.equal(a[i][key],val,JSON.stringify(c.input)+' '+i+' '+key);assertions++;}));}console.log('PASS independent Decimal source reconstruction',refs.cases.length,'cases;',assertions,'field comparisons; not native Excel recalculation');
