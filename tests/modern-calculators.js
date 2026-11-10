'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),engine=require('../assets/js/modern-calculator-engine');let checked=0;
for(const id of ['hongan-anyue','hongyu-anyue','hongda-jintai']){
 const b=require('../assets/data/'+id+'.json'),f=process.argv[2]?JSON.parse(fs.readFileSync(path.join(process.argv[2],id+'-native.json'),'utf8').replace(/^\uFEFF/,'')):require('./fixtures/'+id+'-excel.json');
 for(const c of f.cases){const a=engine.calculate(b,{...c.input,mode:c.mode}).rows;
  const base={B:'year',C:'ageBegin',D:'premium',E:'totalPremium',F:'death',G:'cv'};
  const map=id==='hongda-jintai'?{B:'year',C:'ageBegin',D:'premium',E:'totalPremium',F:'annuity',G:'cumulativeAnnuity',H:'maturity',I:'death',J:'cv',K:'guaranteedAnnual',L:'cumulativeGuaranteed',M:'annualDividend',N:'cumulativeDividend',O:'survivalGuaranteed',P:'survivalTotal',Q:'deathGuaranteed',R:'deathTotal'}:c.mode==='accumulation'?{...base,H:'guaranteedAnnual',I:'cumulativeGuaranteed',J:'survivalGuaranteed',K:'deathGuaranteed',L:'annualDividend',M:'cumulativeDividend',N:'survivalTotal',O:'deathTotal'}:id==='hongan-anyue'?{...base,I:'survivalGuaranteed',J:'deathGuaranteed',K:'annualPaidup',L:'cumulativePaidup',M:'paidupDeath',N:'dividendValue',O:'survivalTotal',P:'deathTotal'}:{...base,H:'survivalGuaranteed',I:'deathGuaranteed',J:'annualPaidup',K:'cumulativePaidup',L:'paidupDeath',M:'dividendValue',N:'deathTotal',O:'survivalTotal'};
  assert.equal(a.length,c.rows.length);for(const expected of c.rows){const r=a[expected.B-1];for(const[col,key]of Object.entries(map)){if(expected[col]===undefined)continue;assert.equal(r[key],expected[col],`${id} ${c.mode} year${r.year} ${col}/${key}`);checked++;}}
  if(!process.argv[2])console.log('PASS original Excel cache',id,c.mode,a.length,'years');
 }
 let combos=0,years=0;for(const key of Object.keys(b.data)){const[gender,age,term]=key.split('_').map(Number);for(const mode of id==='hongda-jintai'?['accumulation']:['accumulation','paidup']){const a=engine.calculate(b,{gender,age,term,premium:b.meta.rules[term].minimum,mode}).rows;assert.equal(a.length,105-age);a.forEach(r=>{assert(r.survivalTotal>=r.survivalGuaranteed);assert(r.deathTotal>=r.deathGuaranteed);});combos++;years+=a.length;}}
 console.log('PASS full primary-table coverage',id,combos,'combinations',years,'rows (integrity, not extra Excel scenarios)');
 assert.throws(()=>engine.calculate(b,{gender:1,age:99,term:3,premium:100000}));assert.throws(()=>engine.calculate(b,{gender:0,age:40,term:3,premium:1}));
}
console.log('PASS',checked,process.argv[2]?'native Excel recalculated field comparisons':'cached field comparisons','; original files not altered');
