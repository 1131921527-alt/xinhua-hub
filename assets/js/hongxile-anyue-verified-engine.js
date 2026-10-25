(function(root){
'use strict';
const round=(v,d=0)=>Math.round((v+Number.EPSILON)*10**d)/10**d;
function calculate(data,input){
 const {sex,age,period,premium,dividendMode}=input;
 if(![0,1].includes(sex)||!Number.isInteger(age)||age<0||age>(sex===0?80:82))throw Error('请填写产品资料范围内的性别及周岁年龄');
 if(![5,6,7,8].includes(period)||!Number.isSafeInteger(premium)||premium<10000||premium%1000)throw Error('期间限5/6/7/8年；保费为1万元起、1000元整数倍');
 if(!['accumulation','paidup'].includes(dividendMode))throw Error('请选择红利方式');
 const base=data.rows.filter(r=>r[0]===sex&&r[1]===age&&r[2]===period).sort((a,b)=>a[3]-b[3]);
 if(base.length!==period||base.some((r,i)=>r[3]!==i+1))throw Error('原表缺少该参数的完整年度，停止生成');
 const shares=premium/data.unitPremium;let cumulativeDividend=0,cumulativeSumAssured=0,previousNet=0;
 const rows=base.map(r=>{
  const year=r[3],cv=round(r[5]*shares,1),maturity=round(r[4]*shares,1),annual=round(r[7]*shares);
  // Source AL/AM/AP: purchase paid-up sum assured, then convert to cash value.
  if(!Number.isFinite(r[8])||r[8]<=0||!Number.isFinite(r[9]))throw Error('缺少已核验的交清增额换算数据');
  const annualPaidup=round((r[7]*shares*10000+cumulativeSumAssured*previousNet*0.01225)/r[8]);
  cumulativeSumAssured+=annualPaidup;previousNet=r[8];
  const paidupCash=round(cumulativeSumAssured*r[9]/10000);
  cumulativeDividend=round(cumulativeDividend*1.025+annual); // Excel BB: annual rounding.
  const attained=age+year-1,coefficient=attained>=61?1.2:attained>=41?1.4:attained>=18?1.6:1;
  const death=attained<18?Math.max(premium*coefficient,cv):premium*coefficient;
  const dividendCash=dividendMode==='paidup'?paidupCash:cumulativeDividend,total=cv+dividendCash;
  const rate=(total-premium)/premium/year; // Excel K: annual simple, not IRR.
  return {year,premium:year===1?premium:0,totalPremium:premium,maturityBenefit:maturity,deathBenefit:round(death,1),
   dividendValue:dividendMode==='paidup'?round(death+paidupCash,1):annual,dividendCashValue:dividendCash,
   annualPaidupSumAssured:annualPaidup,cumulativePaidupSumAssured:cumulativeSumAssured,paidupCashValue:paidupCash,
   guaranteedCashValue:cv,totalBenefit:total,annualSimpleRate:rate>=0?rate:null,rateStatus:rate<0?'negative_hidden_like_excel':'calculated',status:'calculated'};
 });
 return {input:{...input},basicSumAssured:round(base.at(-1)[4]*shares,1),sourceId:data.sourceId,sourceSha256:data.sourceSha256,
  rows,calculationStatus:'excel_verified',accuracyStatus:'pending_verification',accumulationRate:0.025};
}
const api={calculate};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HongxileAnyueEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
