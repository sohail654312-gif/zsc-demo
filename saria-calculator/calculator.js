(function(){
'use strict';
function calculate(diameter,length,unit,count,rate,rateUnit){
 if(![diameter,length,count].every(Number.isFinite)||diameter<=0||length<=0||length>1000||!Number.isInteger(count)||count<1||count>100000||!['ft','m'].includes(unit)||!['kg','maund'].includes(rateUnit))throw Error('براہِ کرم درست لمبائی اور مکمل تعداد درج کریں۔');
 if(rate!==null&&(!Number.isFinite(rate)||rate<=0||rate>10000000))throw Error('درست مثبت ریٹ درج کریں یا ریٹ کا خانہ خالی چھوڑ دیں۔');
 const metres=length*(unit==='ft'?0.3048:1),single=diameter*diameter/162*metres,kg=single*count;
 return {single,kg,maunds:kg/40,tonnes:kg/1000,cost:rate===null?null:kg*rate/(rateUnit==='maund'?40:1)};
}
if(typeof module!=='undefined')module.exports={calculate};
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id),num=(n,d=2)=>new Intl.NumberFormat('en-PK',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
function update(){
 try{
 const r=calculate(Number($('diameter').value),Number($('length').value),$('length-unit').value,Number($('count').value),$('rate').value.trim()===''?null:Number($('rate').value),$('rate-unit').value);
 $('error').textContent='';$('weight').textContent=num(r.kg);$('single').textContent=num(r.single);$('maunds').textContent=num(r.maunds,3);$('tonnes').textContent=num(r.tonnes,3);$('cost').textContent=r.cost===null?'ریٹ درج کریں':'PKR '+num(r.cost);$('rate-note').textContent=r.cost===null?'آج کا اصل ریٹ ZSC سے معلوم کریں۔':'یہ آپ کے درج کردہ ریٹ پر تخمینہ ہے، دکان کا حتمی کوٹیشن نہیں۔';
 const msg='السلام علیکم ZSC، سریے کا کوٹیشن چاہیے۔\nقطر: '+$('diameter').value+' mm\nلمبائی فی سریا: '+$('length').value+' '+$('length-unit').value+'\nتعداد: '+$('count').value+'\nتخمینی وزن: '+num(r.kg)+' kg\nبراہ کرم آج کے نرخ، دستیابی اور ترسیل کی تصدیق کریں۔';
 $('whatsapp').href='https://wa.me/923119556822?text='+encodeURIComponent(msg);
 }catch(e){$('error').textContent=e.message;for(const id of ['weight','single','maunds','tonnes'])$(id).textContent='—';$('cost').textContent='—';$('rate-note').textContent='درست مقدار درج کریں۔';$('whatsapp').href='https://wa.me/923119556822';}
}
$('calculator').addEventListener('submit',e=>{e.preventDefault();update();});$('calculator').addEventListener('input',update);$('calculator').addEventListener('change',update);$('calculator').addEventListener('reset',()=>setTimeout(update,0));update();
})();
