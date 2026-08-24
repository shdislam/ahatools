const UNITS={
  length:{m:1,km:1000,cm:.01,mm:.001,mile:1609.344,foot:.3048,inch:.0254,yard:.9144},
  weight:{kg:1,g:.001,lb:.45359237,oz:.028349523,t:1000}
};
function fillUnits(){
  const t=document.getElementById('ucType').value,u=Object.keys(UNITS[t]),f=document.getElementById('ucFrom'),to=document.getElementById('ucTo');
  f.innerHTML=u.map(x=>`<option>${x}</option>`).join('');
  to.innerHTML=u.map((x,i)=>`<option ${i===1?'selected':''}>${x}</option>`).join('');
  document.getElementById('ucResult').style.display='none';
}
function convertUnits(){
  const t=UNITS[document.getElementById('ucType').value],v=parseFloat(document.getElementById('ucVal').value);
  const f=document.getElementById('ucFrom').value,to=document.getElementById('ucTo').value,r=document.getElementById('ucResult');
  if(isNaN(v)){r.style.display='none';return}
  r.innerHTML=`<b>${v} ${f}</b> = <b>${(v*t[f]/t[to]).toLocaleString(undefined,{maximumFractionDigits:6})} ${to}</b>`;
  r.style.display='block';
}
function calcAge(){
  const d=new Date(document.getElementById('dob').value),r=document.getElementById('ageResult');
  if(!d.getTime()){r.style.display='none';return}
  if(d>new Date()){r.innerHTML='🚼 That date is in the future!';r.style.display='block';return}
  const n=new Date();let y=n.getFullYear()-d.getFullYear(),m=n.getMonth()-d.getMonth(),day=n.getDate()-d.getDate();
  if(day<0){m--;day+=new Date(n.getFullYear(),n.getMonth(),0).getDate()}
  if(m<0){y--;m+=12}
  r.innerHTML=`You are <b>${y}</b> years, <b>${m}</b> months and <b>${day}</b> days old 🎉<br><small>That's about ${(Math.floor((n-d)/31557600000*10)/10)} years total.</small>`;
  r.style.display='block';
}
function calcBmi(){
  const h=parseFloat(document.getElementById('bmiH').value)/100,w=parseFloat(document.getElementById('bmiW').value),r=document.getElementById('bmiResult');
  if(!h||!w||h<=0||w<=0){alert('Enter valid height and weight');return}
  const bmi=w/(h*h);
  let c=bmi<18.5?'Underweight':bmi<25?'Normal ✅':bmi<30?'Overweight':'Obese';
  r.innerHTML=`Your BMI is <b>${bmi.toFixed(1)}</b> — <b>${c}</b><br><small>Healthy range for your height: ${(18.5*h*h).toFixed(1)}–${(24.9*h*h).toFixed(1)} kg</small>`;
  r.style.display='block';
}
function calcEmi(){
  const P=parseFloat(document.getElementById('loanP').value),R=parseFloat(document.getElementById('loanR').value)/1200,Y=parseFloat(document.getElementById('loanY').value),r=document.getElementById('emiResult');
  if(isNaN(P)||isNaN(R)||isNaN(Y)||P<=0||Y<=0){alert('Fill all fields');return}
  const n=Y*12;
  const emi=R>0?P*R*Math.pow(1+R,n)/(Math.pow(1+R,n)-1):P/n;
  const total=emi*n;
  r.innerHTML=`Monthly payment: <b>${emi.toLocaleString(undefined,{maximumFractionDigits:0})}</b><br><small>Total repayment: <b>${total.toLocaleString(undefined,{maximumFractionDigits:0})}</b> · Total interest: <b>${(total-P).toLocaleString(undefined,{maximumFractionDigits:0})}</b> over ${n} months</small>`;
  r.style.display='block';
}
function calcDisc(){
  const p=parseFloat(document.getElementById('discPrice').value),d=parseFloat(document.getElementById('discPct').value),r=document.getElementById('discResult');
  if(isNaN(p)||isNaN(d)||p<=0||d<0||d>100){alert('Enter a valid price and discount between 0 and 100');return}
  const save=p*d/100;
  r.innerHTML=`You pay: <b>${(p-save).toLocaleString(undefined,{maximumFractionDigits:2})}</b><br><small>You save <b>${save.toLocaleString(undefined,{maximumFractionDigits:2})}</b> (${d}% off)</small>`;
  r.style.display='block';
}
function pct(){
  const g=id=>parseFloat(document.getElementById(id).value);
  const s=(id,v)=>{const e=document.getElementById(id);e.innerHTML=v;e.style.display='block'};
  let a=g('p1a'),b=g('p1b');if(!isNaN(a)&&!isNaN(b))s('p1r',`Answer: <b>${(a*b/100).toLocaleString()}</b>`);
  a=g('p2a');b=g('p2b');if(!isNaN(a)&&!isNaN(b)&&b!==0)s('p2r',`Answer: <b>${(a/b*100).toFixed(2)}%</b>`);
  a=g('p3a');b=g('p3b');if(!isNaN(a)&&!isNaN(b)&&a!==0)s('p3r',`Change: <b>${(((b-a)/Math.abs(a))*100).toFixed(2)}%</b> ${b>=a?'📈 increase':'📉 decrease'}`);
}
['p1a','p1b','p2a','p2b','p3a','p3b'].forEach(id=>document.getElementById(id).addEventListener('input',pct));
function addGpaRow(){
  const c=document.querySelector('.gpaRow').cloneNode(true);
  document.getElementById('gpaRows').appendChild(c);
}
function calcGpa(){
  let pts=0,cr=0;
  document.querySelectorAll('.gpaRow').forEach(row=>{
    const g=parseFloat(row.querySelector('.gpaGrade').value);
    const c=parseFloat(row.querySelector('.gpaCredit').value);
    if(!isNaN(g)&&c>0){pts+=g*c;cr+=c}
  });
  const r=document.getElementById('gpaResult');
  if(cr===0){alert('Add at least one course with credits');return}
  r.innerHTML=`Your GPA is <b>${(pts/cr).toFixed(2)}</b><br><small>Calculated from ${cr} total credits</small>`;
  r.style.display='block';
}
function countWords(){
  const t=document.getElementById('wcInput').value;
  document.getElementById('stWords').textContent=t.trim()?t.trim().split(/\s+/).length:0;
  document.getElementById('stChars').textContent=t.length;
  document.getElementById('stSent').textContent=(t.match(/[.!?]+/g)||[]).length;
  document.getElementById('stRead').textContent=Math.max(t.trim()?1:0,Math.ceil(t.split(/\s+/).filter(Boolean).length/200))+' min';
}
function convertCase(mode){
  const el=document.getElementById('caseInput'),t=el.value;
  if(mode==='upper')el.value=t.toUpperCase();
  else if(mode==='lower')el.value=t.toLowerCase();
  else if(mode==='title')el.value=t.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
  else el.value=t.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g,c=>c.toUpperCase());
}
function copyCase(){
  const b=document.getElementById('caseCopy');
  navigator.clipboard.writeText(document.getElementById('caseInput').value).then(()=>{b.textContent='✅ Copied!';setTimeout(()=>b.textContent='📋 Copy result',1500)});
}
function compressImg(){
  const f=document.getElementById('imgFile').files[0],q=document.getElementById('imgQ').value/100,r=document.getElementById('imgResult');
  if(!f){alert('Choose an image first');return}
  const img=new Image(),url=URL.createObjectURL(f);
  img.onload=()=>{
    const c=document.createElement('canvas'),max=1600;
    let w=img.width,h=img.height;
    if(w>max||h>max){const k=Math.min(max/w,max/h);w*=k;h*=k}
    c.width=w;c.height=h;
    c.getContext('2d').drawImage(img,0,0,w,h);
    c.toBlob(b=>{
      const a=document.createElement('a');
      a.href=URL.createObjectURL(b);a.download=f.name.replace(/\.\w+$/,'')+'-compressed.jpg';a.click();
      r.innerHTML=`Done ✅ <b>${(f.size/1024).toFixed(0)} KB</b> → <b>${(b.size/1024).toFixed(0)} KB</b> (${Math.round((1-b.size/f.size)*100)}% smaller)`;
      r.style.display='block';
      URL.revokeObjectURL(url);
    },'image/jpeg',q);
  };
  img.src=url;
}
function genPass(){
  const len=+document.getElementById('pwLen').value;
  let chars='abcdefghijklmnopqrstuvwxyz';
  if(document.getElementById('pwUpp').checked)chars+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if(document.getElementById('pwNum').checked)chars+='0123456789';
  if(document.getElementById('pwSym').checked)chars+='!@#$%^&*()-_=+[]{};:,.?';
  const arr=new Uint32Array(len);
  crypto.getRandomValues(arr);
  document.getElementById('pwOut').textContent=[...arr].map(x=>chars[x%chars.length]).join('');
}
function copyPw(){
  const t=document.getElementById('pwOut').textContent;
  if(t==='Click generate ↓')return;
  navigator.clipboard.writeText(t).then(()=>{document.getElementById('pwOut').textContent='Copied ✅';setTimeout(genPass,800)});
}
function diffDates(){
  const a=new Date(document.getElementById('dFrom').value),b=new Date(document.getElementById('dTo').value),r=document.getElementById('diffResult');
  if(!a.getTime()||!b.getTime()){alert('Pick both dates');return}
  const [s,e]=a<=b?[a,b]:[b,a];
  const days=Math.round((e-s)/86400000);
  let y=e.getFullYear()-s.getFullYear(),m=e.getMonth()-s.getMonth(),d=e.getDate()-s.getDate();
  if(d<0){m--;d+=new Date(e.getFullYear(),e.getMonth(),0).getDate()}
  if(m<0){y--;m+=12}
  r.innerHTML=`<b>${days.toLocaleString()}</b> days total<br><small>= ${y} year(s), ${m} month(s), ${d} day(s) · about ${(days/7).toFixed(1)} weeks</small>`;
  r.style.display='block';
}
function setTip(v){
  document.getElementById('tipPct').value=v;
  document.getElementById('tipVal').textContent=v;
}
function calcTip(){
  const bill=parseFloat(document.getElementById('tipBill').value),ppl=Math.max(1,parseInt(document.getElementById('tipPeople').value)||1),t=+document.getElementById('tipPct').value,r=document.getElementById('tipResult');
  if(isNaN(bill)||bill<=0){alert('Enter a valid bill amount');return}
  const tip=bill*t/100,total=bill+tip;
  r.innerHTML=`Per person: <b>${(total/ppl).toLocaleString(undefined,{maximumFractionDigits:2})}</b><br><small>Tip: ${tip.toLocaleString(undefined,{maximumFractionDigits:2})} · Total: ${total.toLocaleString(undefined,{maximumFractionDigits:2})} · Split between ${ppl}</small>`;
  r.style.display='block';
}