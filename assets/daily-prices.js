(() => {
'use strict';
const iso=d=>d.toISOString().slice(0,10);
function previousWeek(now=new Date()){
 const day=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const d=new Date(day+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7)-7);const start=iso(d);d.setUTCDate(d.getUTCDate()+6);return [start,iso(d)];
}
function valid(d,now=new Date()){
 const [start,end]=previousWeek(now);
 if(!d||d.schemaVersion!==2||d.currency!=='PKR'||d.weekStart!==start||d.weekEnd!==end||!Array.isArray(d.items)||d.items.length>100)return false;
 return d.items.every(i=>i&&typeof i.name==='string'&&i.name.trim()&&i.name.length<=120&&['kg','bag'].includes(i.unit)&&Number.isFinite(i.low)&&Number.isFinite(i.high)&&i.low>0&&i.high>=i.low&&i.high<=1000000&&typeof i.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(i.date)&&i.date>=start&&i.date<=end&&typeof i.source==='string'&&i.source.trim()&&typeof i.url==='string'&&/^https:\/\//.test(i.url));
}
function displayPrice(i){
 const maund=i.unit==='kg'&&/\bgrade\s*[-–]?\s*40\b/i.test(i.name);
 const factor=maund?40:1;
 const format=n=>(Math.round(n*factor*100)/100).toLocaleString('en-PK',{maximumFractionDigits:2});
 return {value:'PKR '+format(i.low)+(i.high===i.low?'':'–'+format(i.high)),unit:maund?'per maund (40 kg) / فی من':i.unit==='kg'?'per kg / فی کلو':'per 50 kg bag / فی بوری'};
}
function localEstimates(d){
 const e=d?.localEstimates;
 if(!e||!Array.isArray(e.items)||e.items.length>40)return [];
 return e.items.filter(i=>i&&typeof i.name==='string'&&i.name.trim()&&i.name.length<=120&&['maund','kg','bag'].includes(i.unit)&&Number.isFinite(i.low)&&Number.isFinite(i.high)&&i.low>0&&i.high>=i.low&&i.high<=1000000);
}
function localSection(d){
 const items=localEstimates(d);if(!items.length)return null;
 const section=document.createElement('div');section.id='local-estimates';
 const title=document.createElement('h4');title.textContent='Lower Dir indicative price ranges / دیر لوئر کے تخمینی نرخ';
 const note=document.createElement('p');note.textContent='Locally adjusted planning estimates for this reference report; not observed historical rates or current ZSC selling prices. / یہ مقامی اندازے ہیں، تصدیق شدہ نرخ نہیں۔';
 const board=document.createElement('div');board.className='rate-board';
 for(const i of items){
 const el=document.createElement('div');el.className='rate-item';
 const name=document.createElement('span');name.className='rate-name';name.textContent=i.name;
 const value=document.createElement('div');value.className='rate-value';value.textContent='PKR '+i.low.toLocaleString('en-PK')+'–'+i.high.toLocaleString('en-PK');
 const unit=document.createElement('span');unit.className='rate-unit';unit.textContent=i.unit==='maund'?'per maund (40 kg) / فی من':i.unit==='kg'?'per kg / فی کلو':'per 50 kg bag / فی بوری';
 el.append(name,value,unit);board.append(el);
 }
 section.append(title,note,board);return section;
}
const status=()=>document.getElementById('public-rates-status');
const snapshot=()=>document.getElementById('public-rates-snapshot');
function paint(d){
 const [start,end]=previousWeek();
 if(!status()||!snapshot())return;
 status().textContent='Previous completed week: '+start+' — '+end+' · Historical market references only. Today’s rates: request a quotation. / آج کے نرخ کے لیے رابطہ کریں۔';
 if(!valid(d)||!d.items.length){snapshot().textContent='No verified observations for this week yet. / گزشتہ ہفتے کی تصدیق شدہ قیمتیں ابھی دستیاب نہیں۔';return;}
 const p=document.createElement('p');const seen=new Set(d.items.map(i=>i.date));p.textContent='Dated observations: '+seen.size+'/7 days. Unreported days are not estimated. These are not ZSC selling prices.';
 const grid=document.createElement('div');grid.className='rate-board';
 for(const i of d.items){
 const el=document.createElement('div');el.className='rate-item';
 const name=document.createElement('span');name.className='rate-name';name.textContent=i.name;
 const val=document.createElement('div');val.className='rate-value';const display=displayPrice(i);val.textContent=display.value;
 const unit=document.createElement('span');unit.className='rate-unit';unit.textContent=display.unit+' · '+i.date;
 const a=document.createElement('a');a.href=i.url;a.textContent=i.source;a.rel='noopener noreferrer';el.append(name,val,unit,a);grid.append(el);
 }
 const missing=document.createElement('p');const dates=Array.from({length:7},(_,i)=>{const d=new Date(start+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+i);return iso(d)});missing.textContent='No dated observations: '+(dates.filter(d=>!seen.has(d)).join(', ')||'none')+'. FF Steel brand-specific price: see the listed observations or request confirmation.';
 const local=localSection(d);
 if(local){const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Original regional/national source observations (unadjusted)';details.append(summary,p,grid,missing);snapshot().replaceChildren(local,details);}
 else snapshot().replaceChildren(p,grid,missing);
}
let cached=null;async function refresh(){try{const r=await fetch('assets/daily-prices.json',{cache:'no-store'});if(!r.ok)throw Error('fetch');cached=await r.json();}catch{cached=null;}paint(cached);}
window.ZSCWeeklyPrices={previousWeek,valid,displayPrice,localEstimates};refresh();setInterval(()=>paint(cached),60000);
})();
