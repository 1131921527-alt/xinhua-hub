(function(root){
'use strict';
// Excel keeps 15 significant digits; normalize floating-point half-cent noise before ROUND.
const round=(v,d=0)=>Math.round(Number(v.toPrecision(15))*10**d)/10**d;
function calculate(data,input){
 const {gender,age,term,premium,dividendRate=1,interestRate=0.025}=input;
 if(![0,1].includes(gender)||!Number.isInteger(age)||age<0||![1,3,5,6,10].includes(term)||!Number.isFinite(premium)||premium<=0||!Number.isFinite(dividendRate)||dividendRate<0||dividendRate>2||![0,0.015,0.0175,0.02,0.025].includes(interestRate))throw Error('参数超出本页已核验的计算范围');
 const o=data[`${gender}_${age}_${term}`];if(!o)throw Error('原Excel没有该参数的完整底表');
 const shares=premium/1000,totalPrem=premium*term;let cumulativeDividend=0,previousSurvival=0;
 const rows=[];
 for(let t=1;t<=o.n;t++){
  const i=t-1,terminal=t===o.n,rawCV=round(o.cv[i]*shares,1),annuity=round(o.ann[i]*shares,1),cumAnnuity=round(o.cumAnn[i]*shares,1),maturity=round(o.mat[i]*shares),deathBase=round(o.death[i]*shares,1),divYr=round(o.hl[i]*shares*dividendRate);
  // H16's #REF is only in the inactive t!=1 branch. H17 onward use the previous H cell.
  cumulativeDividend=round(divYr+cumulativeDividend*(1+interestRate));
  const previousAnnuity=t===1?0:round(o.cumAnn[i-1]*shares,1);
  // M/N: previous cumulative annuities + terminal settlement; never add maturity twice.
  const survG=round(rawCV+(terminal?previousAnnuity:cumAnnuity),1),survD=round(survG+cumulativeDividend,1);
  const deathG=round(deathBase+previousAnnuity,1),deathD=round(deathG+cumulativeDividend,1);
  rows.push({t,ageEnd:age+t,premYr:t<=term?premium:0,annuity:terminal?round(annuity+maturity,1):annuity,cumAnnuity,maturity,
   cv:terminal?0:rawCV,deathBase,deathG,deathD,survG,survD,divYr,cumDiv:cumulativeDividend,
   yieldVal:t>term?(survD-previousSurvival)/totalPrem:null}); // Per-year growth, not IRR or annual simple.
  previousSurvival=survD;
 }
 return rows;
}
const api={calculate};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HongdaEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
