'use strict';
// Audit the published git snapshot, not unrelated drafts in the working directory.
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..');
const git=(...args)=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024});
const tracked=new Set(git('ls-files','-z').split('\0').filter(Boolean));
const working=process.argv.includes('--working'),issues=[],warnings=[];
const cache=new Map();const read=f=>{if(!cache.has(f))cache.set(f,working?fs.readFileSync(path.join(root,f),'utf8'):git('show','HEAD:'+f));return cache.get(f);};
function check(from,value){
 let url=value.replace(/&amp;/g,'&').trim();if(!url||/^(?:https?:|mailto:|tel:|javascript:|data:|blob:|\/\/)/i.test(url)||/[${}<>]|\+\s*['"]/.test(url))return;
 let hash='';const hi=url.indexOf('#');if(hi!==-1){hash=url.slice(hi+1);url=url.slice(0,hi);}url=url.split('?')[0];try{url=decodeURIComponent(url);hash=decodeURIComponent(hash);}catch{return;}
 let target=url?(url.startsWith('/')?url.replace(/^\/(?:xinhua-hub\/)?/,''):path.posix.normalize(path.posix.join(path.posix.dirname(from),url))):from;
 if(url.endsWith('/')||target==='.'||target==='./'||target==='')target=path.posix.join(target,'index.html');
 if(!tracked.has(target)){issues.push({from,link:value,target,kind:fs.existsSync(path.join(root,target))?'unpublished_target':'missing_target'});return;}
 if(hash&&hash.toLowerCase()!=='top'&&/\.html?$/.test(target)){const body=read(target);const ids=new Set([...body.matchAll(/\b(?:id|name)\s*=\s*["']([^"']+)["']/g)].map(x=>x[1]));if(target==='about-xinhua.html'){const data=JSON.parse(read('assets/data/knowledge-modules.json'));data.modules.forEach(m=>ids.add('module-'+m.id));const runtime=read('assets/js/knowledge-topics.js');for(const id of ['profile','ownership','operation','investment','dividend','performance'])if(runtime.includes("'"+id+"'")&&runtime.includes('kt-anchor'))ids.add(id);}if(!ids.has(hash))warnings.push({from,link:value,target,kind:'anchor_requires_runtime_check'});}
}
const pages=[...tracked].filter(f=>/\.html?$/.test(f));for(const f of pages){const raw=read(f),text=raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/&lt;[\s\S]*?&gt;/g,'');for(const m of text.matchAll(/\b(?:href|src)\s*=\s*(["'])([^"']+)\1/g))check(f,m[2]);for(const m of raw.matchAll(/<script\b[^>]*\bsrc\s*=\s*(["'])([^"']+)\1/gi))check(f,m[2]);}
for(const name of ['data.json','products.json']){if(!tracked.has(name))continue;const data=JSON.parse(read(name));const visit=x=>{if(!x||typeof x!=='object')return;if(typeof x.url==='string')check('index.html',x.url);for(const v of Object.values(x))if(v&&typeof v==='object')Array.isArray(v)?v.forEach(visit):visit(v);};visit(data);}
const report={mode:working?'working tree':'HEAD published snapshot',pages:pages.length,issues,warnings};console.log(JSON.stringify(report,null,2));process.exitCode=issues.length?1:0;
