(function(root){
'use strict';
// Source: 新华人寿 宏泰世家（分红型）.xlsx,
// 宏泰世家终身寿险未发生减保利益演示: F/L/M/N/O/P/Q columns.
// Raw paidup_cv is the conversion cash-value factor per 10,000, NOT dividend cash value.
function calculate(data,{gender,age,term,premium}){
 if(![0,1].includes(gender)||!Number.isInteger(age)||!Number.isInteger(term)||!Number.isSafeInteger(premium)||premium<=0)throw Error('演算参数无效');
 let accumulatedSA=0,previousNet=0,previousTotal=null;const rows=[];const shares=premium/1000;
 for(let yr=1;;yr++){
  const d=data[`${gender}_${age}_${term}_${yr}`];if(!d)break;
  if(!(d.paidup_net>0)||!Number.isFinite(d.paidup_cv)||!Number.isFinite(d.div_annual))throw Error('原始交清增额数据不完整，停止演算');
  const addedSA=Math.round((d.div_annual*shares*10000+(yr===1?0:accumulatedSA*previousNet*0.01225))/d.paidup_net);
  accumulatedSA+=addedSA;
  const paidupCash=Math.round(accumulatedSA*d.paidup_cv/10000);
  const cv=Math.round(d.cv*shares),cumPremium=Math.round(d.cum_prem*shares),attainedAge=age+yr-1;
  const coefficient=attainedAge<18?1:attainedAge<=40?1.6:attainedAge<=60?1.4:1.2;
  const guaranteedDeath=attainedAge<18?Math.max(cumPremium,cv):yr<=term?cumPremium*coefficient:Math.max(cumPremium*coefficient,cv,Math.round(d.base_sa*shares*1.0175**(yr-1)));
  const paidupDeath=attainedAge<18||yr<=term?paidupCash:Math.max(paidupCash,Math.round(accumulatedSA*1.0175**(yr-1)));
  const total=cv+paidupCash;
  // Total-benefit year-on-year increase / cumulative premiums after payment.
  // This is NOT annualized simple interest, IRR or XIRR. Year 1/payment years are not shown as returns.
  const growth=yr>term&&previousTotal!==null&&cumPremium>0?(total-previousTotal)/cumPremium:null;
  rows.push({yr,age:age+yr,prem:Math.round(d.prem*shares),exempt:Math.min(Math.round(d.exempt_accident*shares*10)/10,20000000),guar_amt:Math.round(guaranteedDeath),exp_amt:Math.round(guaranteedDeath+paidupDeath),div_pv:paidupCash,cv_guar:cv,cv_total:total,rate_raw:growth});
  previousNet=d.paidup_net;previousTotal=total;
 }
 if(!rows.length)throw Error('该产品版本暂无此参数组合的正式演示数据');
 return rows;
}
const api={calculate};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.HongtaiEngine=api;
})(typeof window!=='undefined'?window:globalThis);
