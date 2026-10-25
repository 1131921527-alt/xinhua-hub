'use strict';
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.argv[2],remote=process.argv[3];if(!out||!path.isAbsolute(out)||out.startsWith(root))throw Error('Output must be outside repository');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{let f;try{f=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));}catch{res.writeHead(400);return res.end();}if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.css':'text/css'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res)});
(async()=>{if(!remote)await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=remote||`http://127.0.0.1:${server.address().port}/`,b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
for(const file of ['calculator-hongda.html','calculator-hongxile.html'])for(const width of [390,430,1440]){
 const p=await b.newPage({viewport:{width,height:900},acceptDownloads:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});await p.addInitScript(()=>{window.showSaveFilePicker=undefined});await p.goto(base+file,{waitUntil:'networkidle'});
 if(file==='calculator-hongda.html'){
  await p.waitForFunction(()=>typeof CALC_DATA!=='undefined'&&CALC_DATA);await p.locator('#age').fill('55');await p.locator('#term').selectOption('1');await p.locator('#premium').fill('1000000');await p.locator('button[onclick="generate()"]').first().click();
  assert.equal(await p.evaluate(()=>allRows.length),50);assert.equal(await p.locator('#resultBody tr').count(),30);assert.equal(await p.evaluate(()=>allRows.at(-1).survG),1806200);assert.equal(await p.evaluate(()=>allRows.at(-1).cv),0);assert.equal(await p.evaluate(()=>allRows.at(-1).annuity),1017500);
  const dl=p.waitForEvent('download',{timeout:90000});await p.locator('button[onclick="downloadImage()"]').click();if(width<768){await p.locator('#ipOpen').click();}const d=await dl;await d.saveAs(path.join(out,'hongda-'+width+'.png'));assert.equal(await d.failure(),null);
  await p.evaluate(()=>{document.querySelectorAll('.image-preview-overlay,#imagePreviewOverlay,#imagePreviewModal').forEach(e=>e.remove())});
 }else{
  await p.waitForFunction(()=>window.currentHongxileResult);for(const mode of ['accumulation','paidup']){
   await p.locator('#dividendMode').selectOption(mode);await p.locator('#generate').click();await p.waitForFunction(()=>window.currentHongxileResult);assert.equal(await p.locator('#rows tr').count(),6);assert((await p.locator('#error').innerText())==='');
   const d=p.waitForEvent('download',{timeout:90000});await p.locator('#download').click();await(await d).saveAs(path.join(out,'hongxile-'+mode+'-'+width+'.png'));
  }await p.locator('#age').fill('99');await p.locator('#generate').click();assert.equal(await p.locator('#rows tr').count(),0);assert(await p.locator('#download').isDisabled());await p.locator('#age').fill('40');await p.locator('#generate').click();
 }
 const scroll=p.locator('.table-scroll').first();await scroll.evaluate(e=>{e.scrollLeft=e.scrollWidth});await p.screenshot({path:path.join(out,file.replace('.html','')+'-'+width+'.png'),fullPage:true});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);console.log('PASS',file,width,'real PNG downloads, rightmost columns, no overflow/errors');await p.close();
}
}finally{await b.close();server.close()}})().catch(e=>{console.error(e);server.close();process.exitCode=1});
