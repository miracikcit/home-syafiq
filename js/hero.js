/* hero.js (28 Nov 2026): Hero Points Maliq. Jalan ke phone (7 bintang RM10, 3 perisai, phone), misi mingguan, kad ibu bapa.
 * Data:
 *   well/pts-maliq       ibu bapa tulis, tablet baca: {start, cap, cfg:{target,ctarget,rules,missions,minus,bonus}, log:[{id,t,v,n,w,k,ref,wt}], given:{key:t}, cuti:{wk:1}}
 *   well/pts-maliq-plan  ibu bapa sahaja (tablet tak boleh baca, lihat kidRead dalam Code.gs): {start, end}
 *   well/p-maliq.hp      tablet tulis: {tk:[{id,m,n,p,v,t}] tick misi, food:{wk:k} treat dipilih, cl:{key:t} claim}
 * Kunci jadual: hero tak boleh lebih dari `cap` (dikira oleh phone ibu bapa dari plan). Phone hanya bila tarikh akhir sampai.
 */
const HPK='maliq',HP_GOAL=4500,HP_LEAD=300;
const HP={f:{tab:'plus',lvl:'M',pts:5,n:'',c:'Chores',fr:'1',v:true},cn:'',cv:'',synced:0};
const HP_CP=[
  {k:'b',n:'Bintang 1',r:'RM10',at:400},{k:'b',n:'Bintang 2',r:'RM10',at:800},
  {k:'t',n:'Perisai Gangsa',r:'RM30',at:1250,f:'#D9873E',l:'RM30'},
  {k:'b',n:'Bintang 3',r:'RM10',at:1650},{k:'b',n:'Bintang 4',r:'RM10',at:2050},
  {k:'t',n:'Perisai Perak',r:'RM50',at:2500,f:'#BFC8D6',l:'RM50'},
  {k:'b',n:'Bintang 5',r:'RM10',at:2900},{k:'b',n:'Bintang 6',r:'RM10',at:3300},
  {k:'t',n:'Perisai Emas',r:'Hadiah Maliq pilih · bajet RM150',at:3750,f:'#FFC928',l:'gift'},
  {k:'b',n:'Bintang 7',r:'RM10',at:4150},
  {k:'g',n:'Grand Reward',r:'Phone',at:HP_GOAL}];
const HP_LV={L:{s:2,min:1,max:3,d:'1–3 · rutin bawah 5 minit'},M:{s:5,min:4,max:7,d:'4–7 · 15–30 minit, perlu usaha'},H:{s:10,min:8,max:15,d:'8–15 · lebih 30 min / seminggu sekali'}};
const HP_LVM={L:{s:2,d:'salah kecil, lupa'},M:{s:5,d:'melawan, tak dengar kata'},H:{s:10,d:'tipu, bergaduh, kasar'}};
const HP_LN={L:'Low',M:'Mid',H:'High'};
const HP_FOOD={burger:'Burger',pizza:'Pizza',froyo:'Frozen yogurt',boba:'Tealive'};
const HP_FREQ=[[7,'Setiap hari'],[5,'Hari sekolah (5×)'],[4,'4× seminggu'],[3,'3× seminggu'],[2,'2× seminggu'],[1,'Sekali seminggu']];

/* ---------- data ---------- */
const hpDoc=()=>WL()['pts-'+HPK]||null;
const hpPlan=()=>WL()['pts-'+HPK+'-plan']||null;
const hpHp=()=>{const P=WL()['p-'+HPK]||{},h=P.hp||{};return{tk:h.tk||[],food:h.food||{},cl:h.cl||{}}};
const hpHpW=()=>{const P=kwP(HPK);P.hp=P.hp||{};const h=P.hp;h.tk=h.tk||[];h.food=h.food||{};h.cl=h.cl||{};return h};
const hpSaveD=()=>wsave('pts-'+HPK),hpSaveP=()=>wsave('p-'+HPK);
const hpWho=()=>{const w=wme();return w==='syafiq'?'Papa':w==='mira'?'Mama':''};
const hpMe=()=>wkid()&&wme()===HPK;
const hpT0=s=>new Date(s+'T00:00').getTime();
function hpWk(t){const d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime()}
const hpWkKey=t=>iso(new Date(hpWk(t)));
const hpDead=t=>hpWk(t)+6*864e5+21*36e5;             // Ahad 9 malam minggu tick tu
const hpClamp=p=>Math.max(0,Math.min(15,+p||0));
function hpDefaults(){const m=(n,c,f,p,v)=>({id:newId(),n,c,f,p,v,by:'Mama'}),q=(n,p)=>({id:newId(),n,p,by:'Mama'});
  return{start:'2026-12-01',cap:HP_LEAD,given:{},cuti:{},log:[],cfg:{target:100,ctarget:70,rules:{auto:1,cap:20,tebus:50,streak:30},
    missions:[m('Kemas katil','Chores',7,2,false),m('Baju kotor dalam bakul','Chores',7,1,false),m('Basuh pinggan lepas makan','Chores',4,3,true),m('Lipat & simpan baju','Chores',1,8,true),m('Kemas bilik main (Sabtu)','Chores',1,10,true),
      m('Ulang kaji 20 minit','Ulang kaji',5,5,true),m('Latihan Matematik 1 muka surat','Ulang kaji',3,5,true),m('Latihan BM / English','Ulang kaji',3,5,true),m('Baca buku 15 minit','Ulang kaji',4,3,true),m('Siap homework tanpa diingatkan','Ulang kaji',5,5,true)],
    minus:[q('Tak kemas lepas main',-2),q('Melawan cakap',-5),q('Tipu',-10),q('Bergaduh dengan adik',-10)],
    bonus:[q('Tolong adik',5),q('Jujur mengaku salah',5),q('Cikgu puji',10)]}}}
/* siling jalan ikut tarikh: phone (HP_GOAL) hanya bila tarikh akhir sampai */
function hpCap(P){const s=hpT0(P.start),e=hpT0(P.end),n=Date.now();if(n>=e)return HP_GOAL;return Math.min(HP_GOAL-10,Math.round(HP_GOAL*Math.max(0,(n-s)/(e-s)))+HP_LEAD)}

function hpModel(){const D=hpDoc();if(!D||!D.cfg)return null;const H=hpHp(),R=D.cfg.rules||{},st=hpT0(D.start||'2026-12-01'),now=Date.now(),dec={},ev=[],pend=[];
  (D.log||[]).forEach(e=>{if(e.ref)dec[e.ref]=e});
  (D.log||[]).forEach(e=>{if(e.k==='x')return;const t=e.wt||e.t;if(t<st)return;ev.push({t,at:e.t,v:+e.v||0,n:e.n,w:e.w,k:e.k,id:e.id})});
  H.tk.forEach(k=>{if(dec[k.id]||k.t<st)return;const p=hpClamp(k.p);
    if(!k.v||(R.auto!==0&&now>hpDead(k.t)))ev.push({t:k.t,at:k.t,v:p,n:k.n,w:'',k:'tk',id:k.id});else pend.push(k)});
  const wk={};ev.forEach(e=>{const w=hpWkKey(e.t);wk[w]=(wk[w]||0)+e.v});
  const tgt=w=>(D.cuti||{})[w]?(+D.cfg.ctarget||70):(+D.cfg.target||100),cw=hpWkKey(now);
  let streak=0,bonus=0;
  for(let t=hpWk(st);t<hpWk(now);t+=7*864e5){const w=hpWkKey(t+36e5);if((wk[w]||0)>=tgt(w)){streak++;if(R.streak&&streak%3===0)bonus+=+R.streak}else streak=0}
  const earned=Math.max(0,ev.reduce((s,e)=>s+e.v,0)+bonus),cap=D.cap==null?HP_LEAD:+D.cap;
  return{D,H,R,ev,pend,wk,tgt,cw,wkPts:wk[cw]||0,streak,bonus,earned,cap,pos:Math.min(earned,cap),st,dec,started:now>=st}}
/* misi tebus: dari tolakan 7 hari lepas yang belum ditebus */
function hpRedeem(M){const R=M.R;if(!R.tebus)return[];const lim=Date.now()-7*864e5,done=new Set(M.H.tk.map(k=>k.m));
  return(M.D.log||[]).filter(e=>e.k==='q'&&e.v<0&&e.t>=lim&&!done.has('r:'+e.id)).map(e=>({id:'r:'+e.id,n:'Tebus: '+e.n,p:Math.max(1,Math.ceil(-e.v*R.tebus/100)),v:true,f:1,c:'Tebus'}))}
const hpWeekTk=(M,mid)=>M.H.tk.filter(k=>k.m===mid&&hpWkKey(k.t)===M.cw&&!(M.dec[k.id]&&M.dec[k.id].k==='x'));
function hpCanTick(M,m){const l=hpWeekTk(M,m.id);if(l.length>=(+m.f||1))return false;if((+m.f||1)>=5&&l.some(k=>iso(new Date(k.t))===TODAY))return false;return true}
const hpState=(M,k)=>{const d=M.dec[k.id];if(d)return d.k==='x'?'x':'ok';return!k.v||M.ev.some(e=>e.id===k.id)?'ok':'wait'};

/* ibu bapa: kira siling, salin tarikh mula, selesaikan tick lama (lebih 14 hari) ke dalam log */
function hpSync(){if(wkid()||!S.ready)return;let D=hpDoc(),P=hpPlan(),chD=false,chP=false;
  if(!P){P=WL()['pts-'+HPK+'-plan']={start:'2026-12-01',end:'2027-12-31'};setTimeout(()=>wsave('pts-'+HPK+'-plan'),0)}
  if(!D){D=WL()['pts-'+HPK]=hpDefaults();chD=true}
  const cap=hpCap(P);if(D.cap!==cap){D.cap=cap;chD=true}if(D.start!==P.start){D.start=P.start;chD=true}
  if(Date.now()-HP.synced>36e5){HP.synced=Date.now();const M=hpModel(),old=Date.now()-14*864e5,H=WL()['p-'+HPK]&&WL()['p-'+HPK].hp;
    if(M&&H&&(H.tk||[]).some(k=>k.t<old)){D.log=D.log||[];
      H.tk.forEach(k=>{if(k.t>=old||M.dec[k.id])return;if(M.ev.some(e=>e.id===k.id))D.log.push({id:newId(),t:Date.now(),v:hpClamp(k.p),n:k.n,w:'',k:'auto',ref:k.id,wt:k.t})});
      const ref=new Set(D.log.filter(e=>e.ref).map(e=>e.ref));H.tk=H.tk.filter(k=>k.t>=old||!ref.has(k.id));chD=true;chP=true}}
  if(chD)setTimeout(hpSaveD,0);if(chP)setTimeout(hpSaveP,0)}

/* ---------- gambar ---------- */
const HPDEFS=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<pattern id="hp-dots" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.3" fill="#1B1B1F" opacity=".18"/></pattern>
<pattern id="hp-dotsW" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.4" fill="#FFFFFF" opacity=".35"/></pattern>
<pattern id="hp-stripe" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(90)"><rect width="12" height="12" fill="#fff"/><rect width="6" height="12" fill="#F6A6C1"/></pattern>
<path id="hp-shield" d="M0 -30 L26 -22 V2 C26 18 14 28 0 34 C-14 28 -26 18 -26 2 V-22 Z"/>
<path id="hp-star" d="M0 -16 L4.7 -5 L16 -4.9 L7.4 2.6 L10 14 L0 8 L-10 14 L-7.4 2.6 L-16 -4.9 L-4.7 -5 Z"/>
<path id="hp-bolt" d="M4 -16 L-8 2 H0 L-4 16 L9 -3 H1 Z"/>
<g id="hp-gift" stroke="#1B1B1F" stroke-width="2.5" stroke-linejoin="round"><rect x="-12" y="-4" width="24" height="16" fill="#E8443A"/><rect x="-14" y="-10" width="28" height="7" fill="#E8443A"/><path d="M0 -10 V12" stroke="#FFD23F" stroke-width="4"/><path d="M0 -10 Q-10 -20 -8 -10 M0 -10 Q10 -20 8 -10" fill="none"/></g>
</defs></svg>`;
const HPSK='stroke="#1B1B1F" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"';
const HP_FSVG={
  burger:`<g ${HPSK}><path d="M22 76 Q60 92 98 76 L94 90 Q60 102 26 90 Z" fill="#F4A340"/><path d="M18 66 H102 Q104 76 96 76 H24 Q16 76 18 66 Z" fill="#7A3B1E"/><path d="M26 66 L40 58 L52 70 L64 58 L76 70 L90 58 L98 66 Z" fill="#FFD23F"/><path d="M16 60 Q22 52 28 60 Q34 52 40 60 Q46 52 52 60 Q58 52 64 60 Q70 52 76 60 Q82 52 88 60 Q94 52 104 60 L100 64 H20 Z" fill="#3FB56B"/><path d="M18 54 Q18 22 60 22 Q102 22 102 54 Z" fill="#F4A340"/><path d="M18 54 Q18 22 60 22 Q102 22 102 54 Z" fill="url(#hp-dotsW)" stroke="none"/><g fill="#FFF6D6" stroke-width="2"><ellipse cx="44" cy="34" rx="3.5" ry="2"/><ellipse cx="62" cy="30" rx="3.5" ry="2"/><ellipse cx="78" cy="37" rx="3.5" ry="2"/><ellipse cx="54" cy="43" rx="3.5" ry="2"/></g></g>`,
  pizza:`<g ${HPSK}><path d="M20 30 Q60 10 100 30 L60 104 Z" fill="#FFD23F"/><path d="M20 30 Q60 10 100 30 L95 40 Q60 22 25 40 Z" fill="#D9873E"/><g fill="#E8443A"><circle cx="48" cy="50" r="7"/><circle cx="72" cy="52" r="6.5"/><circle cx="60" cy="74" r="6"/></g><path d="M38 62 Q44 66 40 72 M80 44 Q84 48 80 52" fill="none" stroke="#3FB56B" stroke-width="3"/></g>`,
  froyo:`<g ${HPSK}><path d="M30 62 H90 L82 108 H38 Z" fill="url(#hp-stripe)"/><path d="M26 56 H94 V64 H26 Z" fill="#E8443A"/><path d="M34 56 Q30 44 44 42 Q40 30 56 30 Q54 18 62 14 Q66 22 74 28 Q88 30 82 42 Q94 44 88 56 Z" fill="#FFFFFF"/><path d="M40 48 Q60 54 80 46 M48 38 Q62 42 72 36" fill="none" stroke-width="2.5"/><g stroke-width="2"><rect x="44" y="40" width="7" height="3" rx="1.5" fill="#3FB56B" transform="rotate(-20 47 41)"/><rect x="70" y="44" width="7" height="3" rx="1.5" fill="#2F6BD8" transform="rotate(25 73 45)"/><rect x="58" y="24" width="7" height="3" rx="1.5" fill="#FFD23F" transform="rotate(10 61 25)"/><circle cx="76" cy="34" r="4" fill="#E8443A"/></g></g>`,
  boba:`<g ${HPSK}><path d="M70 6 L62 40" stroke-width="9"/><path d="M70 6 L62 40" stroke-width="4" stroke="#E8443A"/><path d="M32 40 Q60 22 88 40 Z" fill="#E6F0FF"/><path d="M28 40 H92 V48 H28 Z" fill="#FFFFFF"/><path d="M32 48 H88 L80 110 H40 Z" fill="#C89B6D"/><path d="M33 49 H87 L86 62 H34 Z" fill="#E8D2B4" stroke="none"/><path d="M33 62 H87" fill="none" stroke-width="2"/><g fill="#1B1B1F" stroke="none"><circle cx="48" cy="100" r="5"/><circle cx="60" cy="102" r="5"/><circle cx="72" cy="100" r="5"/><circle cx="54" cy="92" r="5"/><circle cx="66" cy="92" r="5"/></g><path d="M40 54 L42 82" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/></g>`};
function hpBurst(cx,cy,r1,r2,n){const p=[];for(let i=0;i<n*2;i++){const a=Math.PI*i/n-Math.PI/2,r=i%2?r2:r1;p.push((cx+r*Math.cos(a)).toFixed(1)+','+(cy+r*Math.sin(a)).toFixed(1))}return p.join(' ')}
const hpFood=(k,cls)=>`<svg class="${cls||''}" viewBox="0 0 120 120" aria-hidden="true"><polygon points="${hpBurst(60,60,58,44,14)}" fill="#FFD23F" stroke="#1B1B1F" stroke-width="3"/>${HP_FSVG[k]||HP_FSVG.burger}</svg>`;
const hpIcon=c=>c.k==='b'?`<svg viewBox="-20 -20 40 40" aria-hidden="true"><use href="#hp-star" fill="#FFD23F" stroke="#1B1B1F" stroke-width="2.5"/></svg>`:c.k==='t'?`<svg viewBox="-32 -34 64 70" aria-hidden="true"><use href="#hp-shield" fill="${c.f}" stroke="#1B1B1F" stroke-width="4"/></svg>`:`<svg viewBox="-20 -24 40 48" aria-hidden="true"><rect x="-12" y="-20" width="24" height="40" rx="5" fill="#1B1B1F"/><rect x="-9" y="-15" width="18" height="30" rx="2" fill="#2F6BD8"/><use href="#hp-bolt" transform="scale(.7)" fill="#FFD23F"/></svg>`;

/* jalan zigzag: geometri dikira terus (tiada DOM) */
const HPS=(()=>{const R=55,P=Math.PI/2,L=(a,b)=>({len:Math.hypot(b[0]-a[0],b[1]-a[1]),pt:f=>[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]}),
  A=(cx,cy,a0,a1)=>({len:Math.abs(a1-a0)*R,pt:f=>{const a=a0+(a1-a0)*f;return[cx+R*Math.cos(a),cy+R*Math.sin(a)]}}),
  C=(p0,p1,p2,p3)=>{const pt=f=>{const u=1-f;return[0,1].map(i=>u*u*u*p0[i]+3*u*u*f*p1[i]+3*u*f*f*p2[i]+f*f*f*p3[i])};let len=0,pr=p0;for(let i=1;i<=48;i++){const q=pt(i/48);len+=Math.hypot(q[0]-pr[0],q[1]-pr[1]);pr=q}return{len,pt}};
  const seg=[L([60,60],[300,60]),A(300,115,-P,P),L([300,170],[60,170]),A(60,225,3*P,P),L([60,280],[300,280]),A(300,335,-P,P),L([300,390],[60,390]),C([60,390],[10,390],[0,500],[180,500])],c=[0];
  seg.forEach(s=>c.push(c[c.length-1]+s.len));const tot=c[c.length-1];
  const node=[c[0]+120,c[1],c[2],c[2]+120,c[3],c[4],c[4]+120,c[5],c[6],c[6]+120];
  return{seg,c,tot,node,pos:[[180,60],[300,60],[300,170],[180,170],[60,170],[60,280],[180,280],[300,280],[300,390],[180,390]]}})();
function hpPt(l){l=Math.max(0,Math.min(HPS.tot,l));for(let i=0;i<HPS.seg.length;i++){if(l<=HPS.c[i+1]||i===HPS.seg.length-1)return HPS.seg[i].pt(Math.min(1,(l-HPS.c[i])/HPS.seg[i].len))}}
function hpLen(pts){const L=[0].concat(HPS.node,[HPS.tot]),A=[0].concat(HP_CP.map(c=>c.at));pts=Math.max(0,Math.min(HP_GOAL,pts));
  for(let i=1;i<A.length;i++)if(pts<=A[i])return L[i-1]+(pts-A[i-1])/(A[i]-A[i-1])*(L[i]-L[i-1]);return HPS.tot}
const HPD='M60 60 H300 A55 55 0 0 1 300 170 H60 A55 55 0 0 0 60 280 H300 A55 55 0 0 1 300 390 H60 C10 390 0 500 180 500';
function hpRoadSvg(pos){const lp=hpLen(pos),[hx,hy]=hpPt(lp),T=(x,y,s,sz,f,ex)=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="${sz}" fill="${f}" letter-spacing="1" ${ex||''}>${s}</text>`,open=pos>=HP_GOAL;
  let s=`<svg class="hproad" viewBox="0 0 360 760" role="img" aria-label="Jalan ke phone: ${pos} points">`;
  s+=`<path d="${HPD}" fill="none" stroke="#1B1B1F" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/><path d="${HPD}" fill="none" stroke="#5A5A66" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(lp>1)s+=`<path d="${HPD}" fill="none" stroke="#E8443A" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${lp.toFixed(1)} ${HPS.tot.toFixed(0)}"/>`;
  s+=`<path d="${HPD}" fill="none" stroke="#FFD23F" stroke-width="3" stroke-dasharray="10 12" stroke-linecap="round" opacity=".9"/>`;
  s+=`<g transform="translate(60 60)"><rect x="-30" y="-15" width="60" height="30" rx="6" fill="#fff" stroke="#1B1B1F" stroke-width="3"/>${T(0,7,'MULA',18,'#1B1B1F')}</g>`;
  // phone
  s+=`<g${open?'':' class="hpdim2"'}><polygon points="${hpBurst(180,620,128,96,18)}" fill="#FFD23F" stroke="#1B1B1F" stroke-width="3.5"/><polygon points="${hpBurst(180,620,98,80,18)}" fill="#E8443A" stroke="#1B1B1F" stroke-width="3" transform="rotate(10 180 620)"/>
   <g transform="rotate(-7 180 620)"><rect x="130" y="520" width="100" height="200" rx="20" fill="#1B1B1F"/><rect x="138" y="536" width="84" height="168" rx="10" fill="#2F6BD8"/><rect x="138" y="536" width="84" height="168" rx="10" fill="url(#hp-dotsW)"/><rect x="166" y="524" width="28" height="6" rx="3" fill="#4B4B55"/>
   <use href="#hp-bolt" transform="translate(180 606) scale(3)" fill="#FFD23F" stroke="#1B1B1F" stroke-width="1" stroke-linejoin="round"/><path d="M146 548 Q150 540 160 540" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
   ${open?'':`<path d="M166 668 V658 Q166 646 180 646 Q194 646 194 658 V668" fill="none" stroke="#FFD23F" stroke-width="5"/><rect x="160" y="666" width="40" height="28" rx="5" fill="#FFD23F" stroke="#1B1B1F" stroke-width="3"/><circle cx="180" cy="678" r="4" fill="#1B1B1F"/>`}</g>
   ${[[66,560],[296,580],[84,700],[288,700]].map(p=>`<use href="#hp-star" transform="translate(${p[0]} ${p[1]}) scale(.8)" fill="#fff" stroke="#1B1B1F" stroke-width="2.5"/>`).join('')}
   <path d="M108 718 H252 L242 734 L252 750 H108 L118 734 Z" fill="#E8443A" stroke="#1B1B1F" stroke-width="3" stroke-linejoin="round"/>${T(180,742,'GRAND REWARD',20,'#fff','stroke="#1B1B1F" stroke-width=".8"')}</g>`;
  HPS.pos.forEach((p,i)=>{const c=HP_CP[i],on=pos>=c.at;s+=`<g transform="translate(${p[0]} ${p[1]})"${on?'':' class="hpdim"'}>`;
    if(c.k==='t')s+=`<use href="#hp-shield" fill="${c.f}" stroke="#1B1B1F" stroke-width="3.5" stroke-linejoin="round" transform="scale(1.15)"/><use href="#hp-shield" fill="url(#hp-dots)" transform="scale(1.15)"/>`+(c.l==='gift'?`<use href="#hp-gift" transform="translate(0 2) scale(1.1)"/>`:T(0,9,c.l,17,'#1B1B1F'));
    else s+=`<use href="#hp-star" fill="#FFD23F" stroke="#1B1B1F" stroke-width="2.6" stroke-linejoin="round" transform="scale(1.5)"/><g transform="translate(0 32)"><rect x="-19" y="-10" width="38" height="16" rx="5" fill="#fff" stroke="#1B1B1F" stroke-width="2"/>${T(0,3,'RM10',12,'#1B1B1F')}</g>`;
    s+='</g>'});
  s+=`<g transform="translate(${hx.toFixed(1)} ${hy.toFixed(1)})"><circle r="17" fill="#FFD23F" stroke="#1B1B1F" stroke-width="3.5"/><path d="M-13 -3 Q-7 -9 0 -4 Q7 -9 13 -3 Q12 5 4 4 Q0 1 -4 4 Q-12 5 -13 -3 Z" fill="#E8443A" stroke="#1B1B1F" stroke-width="2.5" stroke-linejoin="round"/><circle cx="-6" cy="-1" r="2.2" fill="#fff"/><circle cx="6" cy="-1" r="2.2" fill="#fff"/><path d="M-6 8 Q0 12 6 8" fill="none" stroke="#1B1B1F" stroke-width="2.5" stroke-linecap="round"/><g transform="translate(0 -30)"><rect x="-26" y="-10" width="52" height="18" rx="5" fill="#1B1B1F"/>${T(0,4,'MALIQ',13,'#FFD23F')}</g></g>`;
  return s+'</svg>'}

/* ---------- pop komik ---------- */
function hpPop(t,neg){let e=document.getElementById('hppop');if(!e){e=document.createElement('div');e.id='hppop';e.className='hppop';e.setAttribute('aria-hidden','true');document.body.appendChild(e)}
  e.textContent=t;e.classList.toggle('neg',!!neg);e.classList.remove('on');void e.offsetWidth;e.classList.add('on');clearTimeout(hpPop.t);hpPop.t=setTimeout(()=>e.classList.remove('on'),900)}

/* ---------- tab Maliq ---------- */
const hpWhoTxt=w=>w==='Mama'||w==='Papa'?w:w==='auto'?'auto':'';
function hpKid(id){if(id==='musa')return hpMusa();if(id!==HPK||!S.ready)return'';const M=hpModel();
  if(!M)return`<div class="card hpwait">${HPDEFS}<h2>Hero Points</h2><p class="note">${wkid()?'Hero Points akan dibuka tak lama lagi.':'Buka tab sendiri (Mira atau Syafiq) untuk mulakan Hero Points.'}</p></div>`;
  const me=hpMe(),pos=M.pos,nx=HP_CP.find(c=>pos<c.at),stored=M.earned-pos;
  if(me){try{const sn=+localStorage.getItem('hpSeen')||0,got=HP_CP.filter(c=>pos>=c.at).length;if(got>sn){const c=HP_CP[got-1];setTimeout(()=>hpPop(c.k==='b'?'BINTANG! RM10':c.k==='g'?'PHONE!!!':c.n.toUpperCase()+'!'),400);localStorage.setItem('hpSeen',got)}}catch(_){}}
  let h=HPDEFS+`<div class="hpb"><div class="hpb-top"><div><div class="hpb-l">Hero Points</div><div class="hpbig">${pos.toLocaleString('en')}</div></div><div class="hpnext">${nx?`<b>${esc(nx.n.toUpperCase())}</b>${esc(nx.r)} · lagi ${nx.at-pos}`:'<b>PHONE DIBUKA!</b>Claim di bawah'}</div></div>`+
    (stored>0?`<p class="hpchg">⚡ Kuasa simpanan ${stored} · masuk ke jalan sedikit demi sedikit</p>`:'')+hpRoadSvg(pos)+`</div>`;
  h+=hpWeekCard(M,me)+hpRewards(M,me)+hpFeed(M);
  return h}
function hpWeekCard(M,me){const D=M.D,cw=M.cw,tg=M.tgt(cw),wp=M.wkPts,food=M.H.food[cw]||'burger',cl=M.H.cl['w'+cw],gv=(D.given||{})['w'+cw],cuti=!!(D.cuti||{})[cw];
  if(!M.started)return`<div class="card hpw"><h2>Misi minggu ni</h2><p class="note">Hero Points mula Selasa, 1 Disember. Misi boleh ditick mula hari tu.</p></div>`;
  let h=`<div class="card hpw"><div class="hpwh">${hpFood(food,'hpwf')}<div class="hpwt"><div class="hpwr"><h2>Misi minggu ni</h2><span class="tot">${wp} / ${tg}</span></div><div class="hpbar"><i style="width:${Math.min(100,wp/tg*100).toFixed(1)}%"></i><span>${wp>=tg?'CAPAI! Claim '+esc(HP_FOOD[food]):'Lagi '+(tg-wp)+' untuk '+esc(HP_FOOD[food])+'!'}</span></div></div></div>`;
  const s=M.R.streak?[0,1,2].map(i=>`<i class="${i<M.streak%3?'on':''}"></i>`).join(''):'';
  h+=`<div class="hpwr2">${M.R.streak?`<span class="hpstk">Streak ${s}${M.streak%3===2?' satu minggu lagi = +'+M.R.streak:''}</span>`:''}${cuti?'<span class="hpcuti">Minggu cuti</span>':''}</div>`;
  if(wp>=tg)h+=gv?`<p class="hpok">✓ ${esc(HP_FOOD[food])} dah dapat minggu ni</p>`:cl?`<p class="hpok">Claim dihantar. Tunggu Mama / Papa.</p>`:me?`<button class="hpclaim" data-hp="claim|w${cw}">CLAIM ${esc(HP_FOOD[food].toUpperCase())}</button>`:'';
  if(me&&!cl)h+=`<div class="hpfoods">${Object.keys(HP_FOOD).map(k=>`<button class="hpf" data-hp="food|${k}" aria-pressed="${food===k}">${hpFood(k)}<span>${HP_FOOD[k]}</span></button>`).join('')}</div>`;
  const ms=(D.cfg.missions||[]),red=hpRedeem(M);let g='';
  h+=`<div class="hptasks">`;
  red.forEach(r=>{h+=hpRow(M,r,me,'redeem')});
  ms.slice().sort((a,b)=>String(a.c).localeCompare(String(b.c))).forEach(m=>{if(m.c!==g){g=m.c;h+=`<p class="hpgrp">${esc(g)}${cuti&&g==='Ulang kaji'?' · pilihan minggu cuti':''}</p>`}h+=hpRow(M,m,me)});
  return h+`</div>${me?'':'<p class="note">Maliq tick dari tablet dia. Sahkan di tab Mira / Syafiq.</p>'}</div>`}
function hpRow(M,m,me,cls){const l=hpWeekTk(M,m.id),f=+m.f||1,can=me&&hpCanTick(M,m),st=l.map(k=>hpState(M,k)),wait=st.filter(x=>x==='wait').length,
  tdy=l.filter(k=>iso(new Date(k.t))===TODAY),full=l.length>=f||(f>=5&&tdy.length&&tdy.every(k=>hpState(M,k)==='ok')),
  last=l[l.length-1],undo=me&&last&&hpState(M,last)==='wait'&&iso(new Date(last.t))===TODAY;
  const sub=cls==='redeem'?'misi tebus · dapat balik sebahagian':(f>=5?(tdy.length?'siap hari ni · ':'sehari sekali · '):'')+l.length+' / '+f+' minggu ni'+(wait?' · '+wait+' tunggu Mama / Papa':'')+(!m.v?' · terus masuk':'');
  return`<div class="hpm ${cls||''} ${full?'full':''} ${wait?'wait':''}"><button class="hpmb" ${can?`data-hp="tick|${m.id}"`:'disabled'}><span class="hpck">${full?'✓':wait?'…':''}</span><span class="hpnm">${esc(m.n)}<small>${sub}</small></span><span class="hppv">+${m.p}</span></button>${undo?`<button class="hpundo" data-hp="undo|${last.id}" aria-label="Batal tick ${esc(m.n)}">↶</button>`:''}</div>`}
function hpRewards(M,me){const pos=M.pos,D=M.D;
  return`<div class="card hprw"><h2>Ganjaran</h2>`+HP_CP.map((c,i)=>{const on=pos>=c.at,k='c'+i,cl=M.H.cl[k],gv=(D.given||{})[k];
    const act=!on?(HP_CP.find(x=>pos<x.at)===c?`<span class="hpleft">lagi ${c.at-pos}</span>`:''):gv?'<span class="hpgot">✓ Dah dapat</span>':cl?'<span class="hpleft">Tunggu Mama / Papa</span>':me?`<button class="hpclaim sm" data-hp="claim|${k}">CLAIM</button>`:'<span class="hpleft">Belum claim</span>';
    return`<div class="hpcp ${on?'on':''} ${c.k==='g'?'g':''}">${hpIcon(c)}<span class="hpnm">${esc(c.n)}<small>${esc(c.r)}</small></span>${act}</div>`}).join('')+`</div>`}
function hpFeed(M){const ev=M.ev.filter(e=>e.v).sort((a,b)=>b.at-a.at).slice(0,8);if(!ev.length)return'';
  return`<div class="card"><h2>Rekod</h2><div class="hpfeed">${ev.map(e=>`<div><b class="${e.v>0?'p':'m'}">${e.v>0?'+':''}${e.v}</b><span>${esc(e.n)}</span><small>${hpWhoTxt(e.w)?hpWhoTxt(e.w)+' · ':''}${dm(new Date(e.at))}</small></div>`).join('')}</div></div>`}
function hpMusa(){return`<div class="card hpmusa"><h2>Hero Points Musa</h2><p class="note">Akan datang. Mama sediakan misi dan hadiah Musa dulu.</p><div class="hpms">${['Treat mingguan','Bintang & perisai','Grand reward'].map((t,i)=>`<div><span style="background:${['#FCD9BF','#D3E6FA','#E7DBF8'][i]}">?</span>${t}</div>`).join('')}</div></div>`}

/* ---------- tab Mira / Syafiq ---------- */
function hpParent(){if(wkid()||!S.ready)return'';hpSync();const M=hpModel();if(!M)return'';const D=M.D,P=hpPlan()||{},R=M.R,cw=M.cw,tg=M.tgt(cw),now=Date.now();
  const s=hpT0(P.start||D.start),e=hpT0(P.end||'2027-12-31'),wTot=Math.max(1,Math.round((e-s)/(7*864e5))),wNow=Math.max(0,Math.min(wTot,Math.ceil((now-s)/(7*864e5)))),left=Math.max(0,HP_GOAL-M.earned),need=Math.ceil(left/Math.max(1,wTot-wNow));
  const lastW=hpWkKey(now-7*864e5),lw=M.wk[lastW]||0,ltg=M.tgt(lastW);
  let st;if(!M.started)st=['ok','Mula Selasa 1 Dis. Tablet Maliq boleh tick mula hari tu.'];else if(!left&&now<e)st=['ok','Points dah cukup. Phone tetap dikunci sampai '+fmtD(P.end)+'.'];else if(need>100)st=['warn','Lambat: Maliq perlu '+need+' points seminggu untuk sampai '+fmtD(P.end)+'. Tambah misi bonus atau naikkan points misi.'];else st=['ok','Ikut jadual. Phone '+fmtD(P.end)+', tak boleh lebih awal.'];
  let h=HPDEFS+`<div class="card hpp"><div class="head"><h2>Hero Points Maliq</h2><span class="tot">${M.pos.toLocaleString('en')}</span></div>
   <div class="hpgrid3"><div><b>${M.wkPts}<small> / ${tg}</small></b><span>Minggu ni</span></div><div><b>${lw}<small> / ${ltg}</small></b><span>Minggu lepas</span></div><div><b>${M.streak}</b><span>Streak minggu</span></div></div>
   <p class="hpst ${st[0]}">${esc(st[1])}</p>
   <details class="hpdet"><summary>Jadual phone (ibu bapa sahaja)</summary><div class="hpgrid3"><div><b>${wNow}<small> / ${wTot}</small></b><span>Minggu</span></div><div><b>${M.cap.toLocaleString('en')}</b><span>Siling jalan</span></div><div><b>${M.earned.toLocaleString('en')}</b><span>Points sebenar</span></div></div>
    <p class="note">Hero Maliq tak boleh lepas siling. Lebihan jadi kuasa simpanan dan masuk sendiri setiap minggu. Phone hanya terbuka pada tarikh ni:</p>
    <label class="fl">Tarikh phone<input class="txt" type="date" id="hp-end" value="${esc(P.end||'')}" min="${TODAY}"></label></details>
   <div class="hprow2"><button class="btn ghost" data-hp="cuti|${cw}" aria-pressed="${!!(D.cuti||{})[cw]}">Minggu cuti (target ${+D.cfg.ctarget||70})</button></div></div>`;
  // pengesahan + claim
  const pend=M.pend.slice().sort((a,b)=>a.t-b.t),cls=Object.keys(M.H.cl).filter(k=>!(D.given||{})[k]);
  h+=`<div class="card"><div class="head"><h2>Tunggu pengesahan</h2>${pend.length>1?`<button class="sedit" data-hp="okall">✓ Semua</button>`:''}</div>`+
   (pend.length?pend.map(k=>`<div class="row"><span class="nm">${esc(k.n)} <b>+${hpClamp(k.p)}</b><small>${DAYS[new Date(k.t).getDay()]} ${dm(new Date(k.t))}${R.auto!==0?' · masuk sendiri Ahad 9 malam':''}</small></span><button class="mini hpyes" data-hp="ok|${k.id}">✓ Sah</button><button class="mini" data-hp="no|${k.id}" aria-label="Tolak">✗</button></div>`).join(''):'<p class="note">Tiada tick menunggu.</p>')+
   (cls.length?`<p class="hpsub">Claim menunggu</p>`+cls.map(k=>`<div class="row"><span class="nm">${esc(hpClaimName(k,M))}<small>Maliq claim ${dm(new Date(M.H.cl[k]))}</small></span><button class="mini hpyes" data-hp="give|${k}">Dah beri</button></div>`).join(''):'')+`</div>`;
  // tambah / tolak cepat
  const t0=new Date();t0.setHours(0,0,0,0);const used=-(D.log||[]).filter(x=>x.v<0&&x.t>=t0.getTime()).reduce((a,x)=>a+x.v,0);
  h+=`<div class="card"><div class="head"><h2>Tambah / tolak</h2>${R.cap?`<span class="tot">−${used} / ${R.cap}</span>`:''}</div><div class="hpq">`+
   (D.cfg.bonus||[]).map(x=>`<button class="hpqb hpplus" data-hp="q|b|${x.id}"><span>${esc(x.n)}</span><b>+${x.p}</b></button>`).join('')+
   (D.cfg.minus||[]).map(x=>`<button class="hpqb hpminus" data-hp="q|m|${x.id}"><span>${esc(x.n)}</span><b>${x.p}</b></button>`).join('')+
   `</div><div class="hpcus"><input class="txt" id="hp-cn" placeholder="Sebab lain" maxlength="40" autocomplete="off" value="${esc(HP.cn)}"><input class="txt hpnum" id="hp-cv" inputmode="numeric" placeholder="10" maxlength="3" autocomplete="off" value="${esc(HP.cv)}" aria-label="Points"><button class="mini hpyes" data-hp="cus|1">+</button><button class="mini hpno" data-hp="cus|-1">−</button></div>
   <p class="note">Direkod sebagai ${hpWho()}. Maliq nampak sebab dalam Rekod.${R.tebus?' Setiap tolakan beri Maliq misi tebus.':''}</p></div>`;
  h+=hpEditor(M)+hpRules(M)+hpLog(M);
  return h}
function hpClaimName(k,M){if(k[0]==='c'){const c=HP_CP[+k.slice(1)];return c?c.n+' · '+c.r:k}const w=k.slice(1);return'Treat minggu '+dm(new Date(w+'T00:00'))+': '+(HP_FOOD[M.H.food[w]]||'Burger')}
function hpEditor(M){const D=M.D,F=HP.f,open=!!S.open.hped,tab=F.tab,neg=tab==='minus',list=tab==='plus'?D.cfg.missions||[]:neg?D.cfg.minus||[]:D.cfg.bonus||[];
  let h=`<div class="card"><div class="head"><h2>Editor misi</h2><button class="sedit" data-open="hped">${open?'Tutup':'Buka'}</button></div>`;
  if(!open)return h+`<p class="note">${(D.cfg.missions||[]).length} misi · ${(D.cfg.bonus||[]).length} bonus · ${(D.cfg.minus||[]).length} sebab tolak</p></div>`;
  h+=`<div class="hpseg">${[['plus','Misi'],['bonus','Bonus'],['minus','Tolak']].map(t=>`<button class="btn ghost" data-hp="tab|${t[0]}" aria-pressed="${tab===t[0]}">${t[1]}</button>`).join('')}</div>`;
  h+=list.map(m=>`<div class="row"><span class="nm">${esc(m.n)}<small>${tab==='plus'?esc(m.c)+' · '+((HP_FREQ.find(x=>x[0]===+m.f)||[,m.f+'×'])[1])+(m.v?'':' · terus masuk')+' · ':''}oleh ${esc(m.by||'')}</small></span><span class="tot ${m.p<0?'hpneg':''}">${m.p>0?'+':''}${m.p}</span><button class="del" data-hp="rm|${tab}|${m.id}" aria-label="Buang ${esc(m.n)}">×</button></div>`).join('')||'<p class="note">Kosong.</p>';
  if(tab==='plus'){const mx=(D.cfg.missions||[]).reduce((a,m)=>a+(+m.f||1)*(+m.p||0),0),tg=+D.cfg.target||100,r=mx?tg/mx:9,ok=r>=.6&&r<=.8;
    h+=`<p class="hpst ${ok?'ok':'warn'}">Maks seminggu ${mx} · target ${tg} (${Math.round(r*100)}%). ${ok?'Seimbang.':r>.8?'Terlalu susah, tambah misi atau naikkan points.':'Terlalu senang, buang misi atau naikkan target.'} Sasaran 60–80%.</p>`}
  const src=neg?HP_LVM:HP_LV,sg=neg?'−':'+',o=HP_LV[F.lvl];
  let hint='',al=false;if(!neg&&(F.pts<o.min||F.pts>o.max)){hint='Luar julat '+HP_LN[F.lvl]+' ('+o.min+'–'+o.max+')';al=true}
  if(tab==='plus'){const add=(+F.fr||1)*F.pts,mx=(D.cfg.missions||[]).reduce((a,m)=>a+(+m.f||1)*(+m.p||0),0)+add;hint+=(hint?' · ':'')+'+'+add+' seminggu';if((+D.cfg.target||100)/mx<.6){hint+=' · misi ni buat target terlalu senang';al=true}}
  h+=`<div class="hpform"><input class="txt" id="hp-n" maxlength="40" autocomplete="off" placeholder="${tab==='plus'?'Misi baru, contoh: Siram pokok':neg?'Sebab tolak, contoh: Main phone waktu makan':'Bonus, contoh: Tolong jiran'}" value="${esc(F.n)}">`+
   (tab==='plus'?`<div class="two"><select class="txt" id="hp-c">${['Chores','Ulang kaji','Sikap'].map(c=>`<option ${F.c===c?'selected':''}>${c}</option>`).join('')}</select><select class="txt" id="hp-fr">${HP_FREQ.map(x=>`<option value="${x[0]}" ${+F.fr===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></div>`:'')+
   `<div class="hplv">${['L','M','H'].map(k=>`<button class="btn ghost" data-hp="lv|${k}" aria-pressed="${F.lvl===k}">${HP_LN[k]} ${sg}${src[k].s}<small>${src[k].d}</small></button>`).join('')}</div>
   <div class="hpstep"><button class="round" data-hp="st|-1" aria-label="Kurang">−</button><b>${sg}${F.pts}</b><button class="round" data-hp="st|1" aria-label="Tambah">+</button><span class="hphint ${al?'al':''}">${esc(hint)}</span></div>`+
   (tab==='plus'?`<label class="hpchk"><input type="checkbox" id="hp-v" ${F.v?'checked':''}> Perlu disahkan dulu</label>`:'')+
   `<button class="btn" data-hp="add|1">${tab==='plus'?'Tambah misi':neg?'Tambah sebab tolak':'Tambah bonus'}</button></div></div>`;
  return h}
function hpRules(M){const D=M.D,R=M.R,open=!!S.open.hprule,c=(k,v,l)=>`<button class="btn ghost" data-hp="rule|${k}|${v}" aria-pressed="${String((k==='target'||k==='ctarget'?D.cfg[k]:R[k])??'')===String(v)}">${l}</button>`;
  let h=`<div class="card"><div class="head"><h2>Peraturan</h2><button class="sedit" data-open="hprule">${open?'Tutup':'Buka'}</button></div>`;
  if(!open)return h+`<p class="note">Target ${+D.cfg.target||100} seminggu${R.cap?' · tolak maks '+R.cap+' sehari':''}${R.streak?' · streak +'+R.streak:''}${R.tebus?' · tebus '+R.tebus+'%':''}${R.auto!==0?' · auto-sah Ahad 9 malam':''}</p></div>`;
  const row=(t,sub,btns)=>`<div class="hprule"><span class="nm">${t}<small>${sub}</small></span><div class="hpchips">${btns}</div></div>`;
  h+=row('Target seminggu','Untuk treat mingguan dan streak',[70,80,100,120].map(v=>c('target',v,v)).join(''));
  h+=row('Target minggu cuti','Tekan "Minggu cuti" dalam kad atas',[50,70,80].map(v=>c('ctarget',v,v)).join(''));
  h+=row('Auto-sah Ahad 9 malam','Tick yang tak disahkan masuk sendiri',c('auto',1,'Buka')+c('auto',0,'Tutup'));
  h+=row('Had tolak sehari','Satu hari teruk tak padam usaha seminggu',[0,10,20,30].map(v=>c('cap',v,v?'−'+v:'Tutup')).join(''));
  h+=row('Misi tebus','Lepas kena tolak, Maliq boleh dapat balik',[0,50,100].map(v=>c('tebus',v,v?v+'%':'Tutup')).join(''));
  h+=row('Streak 3 minggu','Capai target 3 minggu berturut',[0,20,30,50].map(v=>c('streak',v,v?'+'+v:'Tutup')).join(''));
  return h+`<p class="note">Ganjaran tetap: 7 bintang RM10, Perisai Gangsa RM30, Perak RM50, Emas hadiah pilihan (RM150), phone.</p></div>`}
function hpLog(M){const L=(M.D.log||[]).filter(e=>e.k!=='auto').slice().sort((a,b)=>b.t-a.t),open=!!S.open.hplog;
  let h=`<div class="card"><div class="head"><h2>Rekod points</h2><button class="sedit" data-open="hplog">${open?'Tutup':'Buka'}</button></div>`;
  if(!open)return h+`<p class="note">${L.length} rekod oleh Mama dan Papa</p></div>`;
  return h+(L.slice(0,30).map(e=>`<div class="row"><span class="nm">${esc(e.n)}<small>${e.k==='x'?'ditolak · ':''}${esc(e.w||'')} · ${dm(new Date(e.t))}</small></span><span class="tot ${e.v<0?'hpneg':''}">${e.k==='x'?'✗':(e.v>0?'+':'')+e.v}</span><button class="del" data-hp="dl|${e.id}" aria-label="Buang rekod ${esc(e.n)}">×</button></div>`).join('')||'<p class="note">Belum ada.</p>')+`</div>`}

/* ---------- klik ---------- */
function hpForm(){const g=id=>document.getElementById(id);if(g('hp-n'))HP.f.n=g('hp-n').value;if(g('hp-c'))HP.f.c=g('hp-c').value;if(g('hp-fr'))HP.f.fr=g('hp-fr').value;if(g('hp-v'))HP.f.v=g('hp-v').checked;if(g('hp-cn'))HP.cn=g('hp-cn').value;if(g('hp-cv'))HP.cv=g('hp-cv').value}
function hpLogAdd(D,e){D.log=D.log||[];D.log.push(Object.assign({id:newId(),t:Date.now(),w:hpWho()},e));hpSaveD()}
function hpQ(v,n){const D=hpDoc(),R=D.cfg.rules||{};if(v<0&&R.cap){const t0=new Date();t0.setHours(0,0,0,0);const used=-(D.log||[]).filter(x=>x.v<0&&x.t>=t0.getTime()).reduce((a,x)=>a+x.v,0),room=R.cap-used;
    if(room<=0){toast('Had tolak hari ni dah capai (−'+R.cap+').');return}if(-v>room){v=-room;toast('Ditolak '+v+' sahaja (had −'+R.cap+' sehari).')}}
  hpLogAdd(D,{v,n,k:'q'});hpPop((v>0?'+':'')+v,v<0)}
function hpClick(b,d){if(!d.hp)return false;const[a,x,y]=d.hp.split('|'),R=()=>(render(true),true);hpForm();
  if(hpMe()){const M=hpModel();if(!M)return R();
    if(a==='tick'){const m=(M.D.cfg.missions||[]).find(z=>z.id===x)||hpRedeem(M).find(z=>z.id===x);if(!m||!hpCanTick(M,m)||!M.started)return R();
      const h=hpHpW();h.tk.push({id:newId(),m:m.id,n:m.n,p:hpClamp(m.p),v:!!m.v,t:Date.now()});hpSaveP();hpPop(m.v?'HANTAR!':'POW! +'+m.p);return R()}
    if(a==='undo'){const h=hpHpW(),k=h.tk.find(z=>z.id===x);if(k&&!M.dec[k.id]){h.tk=h.tk.filter(z=>z.id!==x);hpSaveP()}return R()}
    if(a==='food'&&HP_FOOD[x]){const h=hpHpW();if(!h.cl['w'+M.cw]){h.food[M.cw]=x;hpSaveP()}return R()}
    if(a==='claim'){const h=hpHpW();if(!h.cl[x]){h.cl[x]=Date.now();hpSaveP();hpPop('CLAIM!')}return R()}
    return R()}
  if(wkid())return R();
  const D=hpDoc();if(!D)return R();const F=HP.f;
  if(a==='ok'||a==='no'){const M=hpModel(),k=M.pend.find(z=>z.id===x);if(k)hpLogAdd(D,{v:a==='ok'?hpClamp(k.p):0,n:k.n,k:a==='ok'?'ok':'x',ref:k.id,wt:k.t});return R()}
  if(a==='okall'){const M=hpModel();D.log=D.log||[];M.pend.forEach(k=>D.log.push({id:newId(),t:Date.now(),w:hpWho(),v:hpClamp(k.p),n:k.n,k:'ok',ref:k.id,wt:k.t}));hpSaveD();toast(M.pend.length+' tick disahkan.');return R()}
  if(a==='give'){D.given=D.given||{};D.given[x]=Date.now();hpSaveD();return R()}
  if(a==='cuti'){D.cuti=D.cuti||{};if(D.cuti[x])delete D.cuti[x];else D.cuti[x]=1;hpSaveD();return R()}
  if(a==='q'){const z=(x==='b'?D.cfg.bonus:D.cfg.minus).find(q=>q.id===y);if(z)hpQ(+z.p,z.n);return R()}
  if(a==='cus'){const n=HP.cn.trim(),v=Math.round(Math.abs(parseFloat(HP.cv)));if(!n){toast('Tulis sebab dulu.');return R()}if(!(v>0&&v<=50)){toast('Points antara 1 hingga 50.');return R()}hpQ(v*(+x),n);HP.cn='';HP.cv='';return R()}
  if(a==='tab'){F.tab=x;F.lvl='M';F.pts=5;return R()}
  if(a==='lv'){F.lvl=x;F.pts=(F.tab==='minus'?HP_LVM:HP_LV)[x].s;return R()}
  if(a==='st'){F.pts=Math.max(1,Math.min(30,F.pts+(+x)));return R()}
  if(a==='add'){const n=F.n.trim();if(!n){toast('Tulis nama dulu.');return R()}const by=hpWho()||'Mama';
    if(F.tab==='plus')(D.cfg.missions=D.cfg.missions||[]).push({id:newId(),n,c:F.c,f:+F.fr||1,p:F.pts,v:!!F.v,by});
    else(D.cfg[F.tab]=D.cfg[F.tab]||[]).push({id:newId(),n,p:F.tab==='minus'?-F.pts:F.pts,by});
    F.n='';hpSaveD();toast('Ditambah: '+n);return R()}
  if(a==='rm'){const k=x==='plus'?'missions':x;D.cfg[k]=(D.cfg[k]||[]).filter(m=>m.id!==y);hpSaveD();return R()}
  if(a==='rule'){const v=+y;if(x==='target'||x==='ctarget')D.cfg[x]=v;else{D.cfg.rules=D.cfg.rules||{};D.cfg.rules[x]=v}hpSaveD();return R()}
  if(a==='dl'){D.log=(D.log||[]).filter(e=>e.id!==x);hpSaveD();return R()}
  return R()}
document.addEventListener('change',e=>{const t=e.target;if(t.id!=='hp-end'||wkid())return;const v=t.value,P=hpPlan();if(!P||!/^\d{4}-\d{2}-\d{2}$/.test(v))return;
  if(v<=TODAY){toast('Tarikh phone mesti selepas hari ni.');return render(true)}P.end=v;wsave('pts-'+HPK+'-plan');HP.synced=0;hpSync();toast('Tarikh phone: '+fmtD(v));render(true)});
