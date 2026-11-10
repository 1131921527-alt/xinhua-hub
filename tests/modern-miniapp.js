'use strict';
const assert=require('assert/strict'),e=require('../assets/js/modern-calculator-engine'),f=require('./fixtures/modern-miniapp-20261110.json');let n=0;
for(const c of f.cases){const r=e.calculate(require('../assets/data/'+c.productId+'.json'),c.input).rows;for(const values of c.rows){const row=r[values[0]-1];c.fields.forEach((key,i)=>{const mapped=c.productId==='hongda-jintai'?({cv:'displayCV',annuity:'annuityPayout'}[key]||key):key;const actual=['annualGrowth','simpleAnnual'].includes(key)?row[key]===null?null:Number((row[key]*100).toFixed(2)):row[mapped];assert.equal(actual,values[i],`${c.testId} year ${row.year} ${key}`);n++;});}console.log('PASS',c.testId,c.rows.length,'visible rows; unavailable fields not counted');}
console.log('PASS',n,'sample field comparisons');
