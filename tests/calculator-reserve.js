const assert=require('assert/strict'),reserve=require('../assets/js/calculator-reserve');
function rows(recovery){return Array.from({length:15},(_,i)=>({year:i+1,survivalTotal:i+1<recovery?80:100+i,annualGrowth:i<3?null:0.03}));}
for(const [recovery,expected]of [[2,3],[3,3],[4,3],[5,4],[8,7]])assert.equal(reserve.end(rows(recovery),{principal:100,rate:r=>r.annualGrowth}),expected);
assert.equal(reserve.end(rows(99),{principal:100}),15,'no recovery must not fabricate a post-reserve rate');
const r=rows(4),copy=JSON.stringify(r);reserve.end(r,{principal:100,term:3,rate:r=>r.annualGrowth});assert.equal(JSON.stringify(r),copy,'presentation policy never mutates results');
assert.throws(()=>reserve.end(r,{principal:NaN}));console.log('PASS minimum 3 years; year4/year5 recovery; no recovery; immutable business results');
