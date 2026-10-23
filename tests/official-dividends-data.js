'use strict';
const assert=require('assert/strict');const d=require('../assets/data/official-dividends-2025.json');
assert.equal(d.companies.length,9);assert.equal(d.year,2025);
const keys=new Set();for(const r of d.records){assert(d.companies.some(c=>c.id===r.company));assert.equal(r.year,2025);assert(r.product&&r.kind&&r.scope);assert(Number.isFinite(r.rate)&&r.rate>=0);const key=[r.company,r.product,r.year,r.kind,r.scope].join('|');assert(!keys.has(key),'duplicate scope '+key);keys.add(key);}
for(const[id,product,kind,rate]of [['xinhua','宏泰世家终身寿险（分红型）','现金红利实现率',118],['chinalife','国寿鑫益传家终身寿险（分红型）','当期红利实现率（官网未另列红利类别）',114],['aia','友邦常青树终身寿险（分红型）','现金红利实现率',44],['aia','友邦常青树终身寿险（分红型）','增额红利实现率',46],['cpic','东方红·少年智年金保险（分红型）','现金红利实现率',40]])assert(d.records.some(r=>r.company===id&&r.product===product&&r.kind===kind&&r.rate===rate));
for(const id of ['pingan','taiping']){assert.equal(d.records.filter(r=>r.company===id).length,0);assert(d.companies.find(c=>c.id===id).note);}
assert(d.records.some(r=>r.company==='aia'&&r.scope.includes('保单生效年度：')));
console.log(`PASS ${d.records.length} official disclosure records; 9 official sources; product/year/type/scope preserved`);
