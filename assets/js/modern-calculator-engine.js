(function(root){
'use strict';
const round=(x,n=0)=>Math.round(Number(x.toPrecision(15))*10**n)/10**n;
function calculate(book,input){
 const {gender,age,term,premium,mode='accumulation',pension=false,accumulationRate=0.0175}=input,m=book.meta,rule=m.rules[term];
 if(![0.0175,0.025].includes(accumulationRate))throw Error('累积生息演示利率仅支持原Excel1.75%或公告演示2.5%。');
 if(![0,1].includes(gender)||!Number.isInteger(age)||!rule||!Number.isFinite(premium)||premium<rule.minimum||premium%1000!==0)throw Error('请按原Excel的交费方式和最低保费输入，保费须为1000元整数倍。');
 const max=rule[(pension?'pension':'')+(pension?(gender?'Female':'Male'):(gender?'female':'male'))];
 if(age<0||age>max)throw Error('该性别和交费方式最高投保年龄为'+max+'周岁。');
 const ann=m.productId==='hongda-jintai';if(!['accumulation','paidup'].includes(mode)||ann&&mode!=='accumulation')throw Error('当前该红利领取方式尚未核验，暂不提供在线测算。');
 const data=book.data[`${gender}_${age}_${term}`];if(!data||data.length!==105-age)throw Error('原Excel缺少此组合的完整底表，暂不提供测算。');
 const shares=premium/1000,rows=[];let cumDiv=0,cumGuaranteed=0,cumulativePaidup=0,account=0;
 for(let i=0;i<data.length;i++){
  const t=i+1,beginAge=age+i,a=data[i],priorAccount=account;let r={year:t,ageBegin:beginAge,ageEnd:beginAge+1,premium:round(a[1]*shares),totalPremium:round(a[2]*shares)};
  if(ann){
   const annuity=round(a[3]*shares,1),cumulativeAnnuity=round(a[4]*shares,1),maturity=round(a[5]*shares),death=round(a[6]*shares,1),cv=round(a[7]*shares,1),guaranteedAnnual=round(a[8]*shares),annualDividend=round(a[9]*shares);
   cumDiv=round(annualDividend+cumDiv*(1+accumulationRate));cumGuaranteed=round(guaranteedAnnual+cumGuaranteed*(1+accumulationRate));
   // 小程序2.5%账户保留内部精度，展示到元；原Excel1.75%模式保留其逐年取整。
   if(accumulationRate===0.025){account=annualDividend+account*(1+accumulationRate);cumDiv=round(account);}
   const priorAnnuity=i?round(data[i-1][4]*shares,1):0,survivalBase=cv+(t<data.length?cumulativeAnnuity:priorAnnuity);
   Object.assign(r,{annuity,cumulativeAnnuity,maturity,death,cv,guaranteedAnnual,cumulativeGuaranteed:cumGuaranteed,annualDividend,cumulativeDividend:cumDiv,survivalGuaranteed:round(survivalBase+cumGuaranteed,2),survivalTotal:round(survivalBase+cumDiv,2),deathGuaranteed:round(death+priorAnnuity+cumGuaranteed,1),deathTotal:round(death+priorAnnuity+cumDiv,1)});
   // 原表J在满期行列示当期给付；小程序将其移到年金/满期给付列，给付后现价为0。
   // 保留cv/annuity原字段供Excel核验，不重复计入生存总利益。
   r.displayCV=t===data.length?0:cv;r.annuityPayout=round(annuity+maturity,1);
   // 原S/T辅助列储备期与基数不统一，不直接映射；下面用完整年度利益核验年增长率。
  }else{
   const cv=round(a[3]*shares),basic=round(a[0]*shares,1),ratio=beginAge<41?1.6:beginAge<61?1.4:1.2;
   const death=beginAge<18?Math.max(r.totalPremium,cv):t<=term?(m.productId==='hongan-anyue'?Math.max(cv,r.totalPremium*ratio):r.totalPremium*ratio):Math.max(r.totalPremium*ratio,round(a[0]*shares*1.0175**i),cv);
   Object.assign(r,{cv,basic,death});
   if(mode==='paidup'){
    // Original annual paid-up sum insured (宏安K / 宏御J); prior net premium coefficient O.
    const annualPaidup=round((a[5]*shares*10000+(i?cumulativePaidup*data[i-1][6]*0.01225:0))/a[6]);cumulativePaidup+=annualPaidup;
    const paidupCV=round(cumulativePaidup*a[7]/10000),paidupDeath=beginAge<18||t<=term?paidupCV:Math.max(paidupCV,round(cumulativePaidup*1.0175**i));
    Object.assign(r,{annualPaidup,cumulativePaidup,paidupDeath,dividendValue:paidupCV,survivalGuaranteed:cv,deathGuaranteed:death,survivalTotal:cv+paidupCV,deathTotal:death+paidupDeath});
   }else{
    const guaranteedAnnual=round(a[4]*shares),annualDividend=round(a[5]*shares);cumDiv=round(annualDividend+cumDiv*(1+accumulationRate));cumGuaranteed=round(guaranteedAnnual+cumGuaranteed*(1+accumulationRate));
    if(accumulationRate===0.025){account=annualDividend+account*(1+accumulationRate);cumDiv=round(account);}
    Object.assign(r,{guaranteedAnnual,cumulativeGuaranteed:cumGuaranteed,annualDividend,cumulativeDividend:cumDiv,dividendValue:cumDiv,survivalGuaranteed:cv+cumGuaranteed,deathGuaranteed:death+cumGuaranteed,survivalTotal:cv+cumDiv,deathTotal:death+cumDiv});
   }
  }
  // 当年总利益增量 / 计划总保费（原Excel差额口径，并以本轮真实图逐年核验）。
  // 不是以上一年现价为分母的复合增长率，更不是IRR。
  const principal=premium*term,prior=rows.at(-1);
  r.annualGrowth=t<=term?null:(r.survivalTotal-prior.survivalTotal)/principal;
  if(t>term&&mode==='accumulation'&&accumulationRate===0.025)r.annualGrowth=(r.survivalTotal-cumDiv+account-prior.survivalTotal+prior.cumulativeDividend-priorAccount)/principal;
  // 趸交/等额期交的年初保费占用时间加权；仅用于无中途领取的终身寿险。
  // 年金存在分期领取现金流，未经核清不得套用同一分母。
  const premiumYears=premium*Array.from({length:Math.min(t,term)},(_,j)=>t-j).reduce((a,b)=>a+b,0);
  r.simpleAnnual=ann||r.survivalTotal<r.totalPremium?null:(r.survivalTotal-r.totalPremium)/premiumYears;
  for(const[k,v]of Object.entries(r))if(v!==null&&!Number.isFinite(v))throw Error('原始计算链出现未确定结果：'+k+'；已停止，不用零代替。');rows.push(r);
 }
 return {rows,basic:round(data[0][0]*shares,1),input:{...input,mode},source:m};
}
const api={calculate,round};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ModernCalculatorEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
