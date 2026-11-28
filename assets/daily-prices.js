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
 const val=document.createElement('div');val.className='rate-value';val.textContent='PKR '+i.low.toLocaleString('en-PK')+(i.high===i.low?'':'–'+i.high.toLocaleString('en-PK'));
 const unit=document.createElement('span');unit.className='rate-unit';unit.textContent=(i.unit==='kg'?'per kg / فی کلو':'per 50 kg bag / فی بوری')+' · '+i.date;
 const a=document.createElement('a');a.href=i.url;a.textContent=i.source;a.rel='noopener noreferrer';el.append(name,val,unit,a);grid.append(el);
 }
 const missing=document.createElement('p');const dates=Array.from({length:7},(_,i)=>{const d=new Date(start+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+i);return iso(d)});missing.textContent='No dated observations: '+(dates.filter(d=>!seen.has(d)).join(', ')||'none')+'. FF Steel brand-specific price: see the listed observations or request confirmation.';
 snapshot().replaceChildren(p,grid,missing);
}
let cached=null;async function refresh(){try{const r=await fetch('assets/daily-prices.json',{cache:'no-store'});if(!r.ok)throw Error('fetch');cached=await r.json();}catch{cached=null;}paint(cached);}
window.ZSCWeeklyPrices={previousWeek,valid};refresh();setInterval(()=>paint(cached),60000);
})();
