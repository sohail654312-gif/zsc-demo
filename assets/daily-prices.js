(() => {
  'use strict';
  const units={steel40:'kg',steel60:'kg',cementOpc:'bag',cementSrc:'bag'};
  const localDate=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  function valid(data){
    if(!data||data.schemaVersion!==1||data.currency!=='PKR'||data.status!=='approved'||typeof data.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(data.date)||data.date>localDate()||!Array.isArray(data.items)||!data.items.length||data.items.length>40)return false;
    const keys=new Set(),names=new Set();
    return data.items.every(i=>{
      if(!i||typeof i.name!=='string'||!i.name.trim()||i.name.length>100||names.has(i.name.trim().toLowerCase())||!['kg','bag'].includes(i.unit)||typeof i.price!=='number'||!Number.isFinite(i.price)||i.price<=0||i.price>1000000)return false;
      names.add(i.name.trim().toLowerCase());
      if(i.calculatorKey==null)return true;
      if(!Object.hasOwn(units,i.calculatorKey)||units[i.calculatorKey]!==i.unit||keys.has(i.calculatorKey))return false;
      keys.add(i.calculatorKey);return true;
    });
  }
  function paint(data){
    const status=document.getElementById('public-rates-status'),snapshot=document.getElementById('public-rates-snapshot');
    if(!status||!snapshot)return;
    if(!valid(data)){status.textContent='No verified live prices available. Confirm with ZSC. / آج کے تصدیق شدہ نرخ دستیاب نہیں۔';return;}
    const current=data.date===localDate();
    status.textContent=current?'Owner-approved rates for '+data.date+' (Pakistan time). Confirm stock and final quote. / آج کے منظور شدہ نرخ۔':'Last approved rates: '+data.date+' — NOT today’s rates. / پرانے نرخ؛ آج کی قیمت کی تصدیق کریں۔';
    const board=document.createElement('div');board.className='rate-board';
    for(const i of data.items){
      const el=document.createElement('div');el.className='rate-item';
      const name=document.createElement('span');name.className='rate-name';name.textContent=i.name;
      const value=document.createElement('div');value.className='rate-value';value.textContent='PKR '+new Intl.NumberFormat('en-PK',{maximumFractionDigits:2}).format(i.price);
      const unit=document.createElement('span');unit.className='rate-unit';unit.textContent=i.unit==='kg'?'per kg / فی کلو':'per 50 kg bag / فی بوری';
      el.append(name,value,unit);board.append(el);
    }
    snapshot.replaceChildren(board);
  }
  const ready=fetch('assets/daily-prices.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('fetch');return r.json();}).then(d=>valid(d)?d:null).catch(()=>null).then(d=>{paint(d);return d;});
  window.ZSCDailyPrices={ready,localDate,valid,paint};
  // Re-evaluate the date when a long-open tab crosses midnight.
  setInterval(()=>ready.then(paint),60000);
})();
