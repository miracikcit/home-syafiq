/* more.js (26 Nov 2026): Wellness, period tracker + Mood Meter Bonda, Menu + tracker makan, Parenting, Trips, Lagi.
   Dimuat SEBELUM app.js; hanya fungsi, guna S / save / esc / pad dari app.js masa dipanggil.
   Data: koleksi "well" (a-<orang>-<tahun>-<bulan>, p-<orang>, period, menu, meal-<tahun>-<bulan>, parenting, trips). */
const W=(()=>{const n=new Date();return{y:n.getFullYear(),m:n.getMonth(),sel:n.getDate(),pmode:'haid',mmode:'bonda',cat:{},form:null,open:{}}})();
const WCOL={syafiq:['#D6E6FB','#BCD5F7','#A2C3F2','#88B0EA'],mira:['#E9DFFA','#D9C9F4','#C8B2ED','#B79CE4'],maliq:['#FBF2CC','#F7E8AE','#F2DD90','#ECD173'],musa:['#FCE3CF','#F9D2B2','#F5C196','#F0AF7A']};
const WA=['Bersenam','Mengaji','Solat malam','Puasa'],WPT=['Ramadan','Sunat','Qada'],WPID=['syafiq','mira','maliq','musa'];
const WSK='stroke="#2E2723" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
const wsv=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const WAI=['<path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/>','<path d="M4 6c3-1 6-1 8 1 2-2 5-2 8-1v12c-3-1-6-1-8 1-2-2-5-2-8-1zM12 7v12"/>','<path d="M16 4a8 8 0 1 0 4 12A7 7 0 0 1 16 4z"/>','<ellipse cx="12" cy="14" rx="4.5" ry="6.5"/><path d="M12 7.5V3M10 12v4"/>'].map(wsv);
const WPI=['<path d="M15 3a9 9 0 1 0 6 15.7A8 8 0 0 1 15 3z" fill="currentColor"/>','<path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.200l7.1-.6z" fill="currentColor"/>','<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 3v5h5"/>'].map(wsv);
const WFACE=(x,y)=>`<circle cx="${x-6}" cy="${y}" r="2.2" fill="#2E2723"/><circle cx="${x+6}" cy="${y}" r="2.2" fill="#2E2723"/><path d="M${x-4} ${y+6}q4 4 8 0" fill="none" ${WSK}/><circle cx="${x-11}" cy="${y+5}" r="3" fill="#F7B8C0"/><circle cx="${x+11}" cy="${y+5}" r="3" fill="#F7B8C0"/>`;
const WSTK={
 heart:`<path d="M15 26C6 19 3 14 4.5 9c1.500-4.500 7-5.500 10.500-.5 3.500-5 9-4 10.500.5C27 14 24 19 15 26z" fill="#F4A9B8"/>`,
 star:`<path d="M15 3l3.4 7.4 8 .8-6 5.4 1.800 8L15 20.400 7.800 24.600l1.800-8-6-5.400 8-.8z" fill="#F7E8AE"/>`,
 flower:`<g fill="#F7C6D0"><circle cx="15" cy="7.5" r="4.5"/><circle cx="22.5" cy="13" r="4.5"/><circle cx="19.5" cy="21.5" r="4.5"/><circle cx="10.5" cy="21.5" r="4.5"/><circle cx="7.5" cy="13" r="4.5"/></g><circle cx="15" cy="15" r="3.6" fill="#F7E8AE"/>`,
 moon:`<path d="M20 4a11 11 0 1 0 6 19A10 10 0 0 1 20 4z" fill="#F7E8AE"/>`,
 drop:`<path d="M15 4c-6 8-8 12-8 15a8 8 0 0 0 16 0c0-3-2-7-8-15z" fill="#F7B8C0"/>`,
 cloud:`<path d="M8 22a5 5 0 0 1 0-10 7 7 0 0 1 13-2 6 6 0 0 1 2 12z" fill="#D6E6FB"/>`,
 bow:`<path d="M15 15L4 8v14zM15 15l11-7v14z" fill="#D9C9F4"/><circle cx="15" cy="15" r="3" fill="#F7C6D0"/>`,
 sparkle:`<path d="M15 3c1 7 4 10 11 12-7 2-10 5-11 12-1-7-4-10-11-12 7-2 10-5 11-12z" fill="#F9D2B2"/>`,
 fire:`<path d="M15 3c1 6 8 8 8 15a8 8 0 0 1-16 0c0-4 3-5 3-9 2 1 4 2 5-6z" fill="#F5C196"/>`,
 pot:`<path d="M6 13h18v8a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4zM3 15h3M24 15h3M9 13q6-7 12 0" fill="#F7C6D0"/>`,
 chef:`<path d="M9 17a5 5 0 0 1 1-10 6 6 0 0 1 10 0 5 5 0 0 1 1 10v8H9z" fill="#BCD5F7"/><path d="M9 21h12" fill="none"/>`,
 box:`<path d="M5 12h20l-2 13H7z" fill="#F7E8AE"/><path d="M4 8h22v4H4z" fill="#fff"/><path d="M12 17q3 3 6 0" fill="none"/>`,
 bag:`<path d="M7 11h16l2 15H5z" fill="#F9D2B2"/><path d="M11 13V9a4 4 0 0 1 8 0v4M12 19q3 3 6 0" fill="none"/>`,
 shop:`<path d="M6 14h18v11H6z" fill="#FFF6E0"/><path d="M4 14l3-7h16l3 7z" fill="#BFE6D3"/><path d="M13 25v-6h4v6" fill="#F9D2B2"/>`};
const wstk=k=>`<svg class="wsk" viewBox="0 0 30 30" aria-hidden="true" stroke="#2E2723" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">${WSTK[k]||WSTK.star}</svg>`;
const wrow=l=>`<div class="stkrow">${l.split(',').map(wstk).join('')}</div>`;
const WFOOD={
 ayam:`<path d="M24 52q-11-8-7-17 7 4 11 11" fill="#F7E8AE" ${WSK}/><ellipse cx="48" cy="60" rx="28" ry="25" fill="#FFF6E0" ${WSK}/><circle cx="66" cy="35" r="16" fill="#FFF6E0" ${WSK}/><path d="M57 22q2-9 6-2 3-9 7-1 5-5 4 4" fill="#E58A99" ${WSK}/><path d="M81 34l10 3-10 5z" fill="#F0AF7A" ${WSK}/><circle cx="70" cy="33" r="2.4" fill="#2E2723"/><circle cx="63" cy="41" r="3.2" fill="#F7B8C0"/><path d="M36 58q10-9 19 2-7 12-19 6z" fill="#F7E8AE" ${WSK}/><path d="M42 84v9M56 84v9M38 93h8M52 93h8" fill="none" stroke="#F0AF7A" stroke-width="2.6" stroke-linecap="round"/>`,
 ikan:`<path d="M70 50l20-15v30z" fill="#A2C3F2" ${WSK}/><ellipse cx="45" cy="50" rx="30" ry="19" fill="#BCD5F7" ${WSK}/><circle cx="30" cy="45" r="2.6" fill="#2E2723"/><path d="M24 55q4 4 8 0M48 40q8 10 0 20" fill="none" ${WSK}/><circle cx="36" cy="54" r="3.2" fill="#F7B8C0"/>`,
 kek:`<path d="M20 52h60v30H20z" fill="#F7C6D0" ${WSK}/><path d="M20 54q7.5 9 15 0 7.500 9 15 0 7.500 9 15 0 7.500 9 15 0v-8H20z" fill="#FFF6E0" ${WSK}/><path d="M50 46V32" ${WSK}/><path d="M50 20c-4 5-4 9 0 10 4-1 4-5 0-10z" fill="#F0AF7A" ${WSK}/>${WFACE(50,68)}`,
 kedai:`<path d="M22 46h56v38H22z" fill="#FFF6E0" ${WSK}/><path d="M16 46l7-18h54l7 18z" fill="#F7B8C0" ${WSK}/><path d="M34 28l-3 18M50 28v18M66 28l3 18" fill="none" ${WSK}/><path d="M44 84V64h12v20" fill="#F9D2B2" ${WSK}/>${WFACE(50,56)}`,
 bowl:`<path d="M16 50h68a34 32 0 0 1-68 0z" fill="#F9D2B2" ${WSK}/><path d="M36 38q-4-6 0-12M50 38q-4-6 0-12M64 38q-4-6 0-12" fill="none" ${WSK}/>${WFACE(50,62)}`};
const foodKind=n=>{n=String(n||'').toLowerCase();return/ayam|chicken/.test(n)?'ayam':/ikan|fish|sardin|udang|sotong|seafood/.test(n)?'ikan':/kek|kuih|cake|puding|biskut|dessert|manis/.test(n)?'kek':/kedai|restoran|makan luar|cafe|kafe|mamak/.test(n)?'kedai':'bowl'};
const wfood=(n,sz)=>`<svg class="food" style="width:${sz||46}px;height:${sz||46}px" viewBox="0 0 100 100" aria-hidden="true">${WFOOD[foodKind(n)]}</svg>`;
function wanimal(k,c,extra){const ear={bear:`<circle cx="27" cy="28" r="12" fill="${c}" ${WSK}/><circle cx="73" cy="28" r="12" fill="${c}" ${WSK}/>`,
  rabbit:`<ellipse cx="36" cy="20" rx="8" ry="19" fill="${c}" ${WSK}/><ellipse cx="64" cy="20" rx="8" ry="19" fill="${c}" ${WSK}/><ellipse cx="36" cy="22" rx="3" ry="11" fill="#F7C6D0"/><ellipse cx="64" cy="22" rx="3" ry="11" fill="#F7C6D0"/>`,
  cat:`<path d="M23 44l3-28 22 14z" fill="${c}" ${WSK}/><path d="M77 44l-3-28-22 14z" fill="${c}" ${WSK}/>`,
  fox:`<path d="M20 46l2-34 26 18z" fill="${c}" ${WSK}/><path d="M80 46l-2-34-26 18z" fill="${c}" ${WSK}/>`}[k];
  const ex={bear:`<ellipse cx="50" cy="66" rx="11" ry="8" fill="#FFF6E0" ${WSK}/>`,rabbit:'',cat:`<path d="M24 58h-10M24 63l-9 3M76 58h10M76 63l9 3" fill="none" ${WSK}/>`,fox:`<path d="M24 62q26 30 52 0-10 22-26 22T24 62z" fill="#FFF6E0" ${WSK}/>`}[k];
  return`<svg viewBox="0 0 100 100" aria-hidden="true">${ear}<circle cx="50" cy="58" r="30" fill="${c}" ${WSK}/>${ex}${WFACE(50,54)}<path d="M47 61h6l-3 3z" fill="#2E2723"/>${extra||''}</svg>`}
const WMASC={syafiq:['bear','#A2C3F2'],mira:['rabbit','#C8B2ED'],maliq:['cat','#F2DD90'],musa:['fox','#F5C196']};
const wmasc=(p,extra)=>wanimal(WMASC[p][0],WMASC[p][1],extra);
const WCROWN='<path d="M34 12l5 12 11-13 11 13 5-12 3 24H31z" fill="#F7E8AE" stroke="#2E2723" stroke-width="2.2" stroke-linejoin="round" transform="translate(0 -4) scale(1 .7)"/>';
const WBABY=`<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M26 58c0-16 10-24 24-24s24 8 24 24-8 34-24 34-24-18-24-34z" fill="#D6E6FB" ${WSK}/><path d="M30 60q20 14 40 0M34 74q16 10 32 0" fill="none" stroke="#88B0EA" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="36" r="21" fill="#FCE9DA" ${WSK}/><path d="M29 33c1-14 10-21 21-21s20 7 21 21c-12-6-30-6-42 0z" fill="#F7C6D0" ${WSK}/><circle cx="50" cy="10" r="5" fill="#fff" ${WSK}/><path d="M39 40q4 3 8 0M53 40q4 3 8 0" fill="none" ${WSK}/><circle cx="50" cy="49" r="3.6" fill="#F7E8AE" ${WSK}/><circle cx="36" cy="46" r="3.4" fill="#F7B8C0"/><circle cx="64" cy="46" r="3.4" fill="#F7B8C0"/></svg>`;

/* ---------- data ---------- */
const WL=()=>S.well||(S.well={});
const wme=()=>String((window.HS&&HS.who&&HS.who())||'').toLowerCase();
const wdoc=(id,def)=>WL()[id]||(WL()[id]=def);
const wsave=id=>save('well',id);
const wiso=(y,m,d)=>y+'-'+pad(m+1)+'-'+pad(d);
const wAId=(p,y,m)=>'a-'+p+'-'+y+'-'+pad(m+1);
const aGet=(p,y,m)=>WL()[wAId(p,y,m)]||{d:{},q:{}};
const aStr=(p,y,m,day)=>String((aGet(p,y,m).d||{})[day]||'');
const wOwe=p=>+((WL()['p-'+p]||{}).owe)||0;
function wOweAdd(p,dv){const doc=wdoc('p-'+p,{owe:0});doc.owe=Math.max(0,(+doc.owe||0)+dv);wsave('p-'+p)}
const wrole=()=>(window.HS&&HS.role&&HS.role())||'family',wkid=()=>wrole()==='kid',wcall=(a,b)=>HS.call(a,b);
const wCan=p=>wkid()?p===wme():(p==='maliq'||p==='musa'||p===wme());
function aToggle(p,y,m,day,i){const id=wAId(p,y,m),doc=wdoc(id,{d:{},q:{}});doc.d=doc.d||{};doc.q=doc.q||{};let s=String(doc.d[day]||'');const on=s.includes(i);
  if(i===3){const t=on?(+doc.q[day]||0):-1;
    if(!on){s+='3';doc.q[day]=0}else if(t<2){doc.q[day]=t+1;if(t+1===2&&wOwe(p)>0){wOweAdd(p,-1);doc.q[day]=2;doc.qd=doc.qd||{};doc.qd[day]=1}}
    else{s=s.replace('3','');delete doc.q[day];if(doc.qd&&doc.qd[day]){delete doc.qd[day];wOweAdd(p,1)}}}
  else s=on?s.replace(String(i),''):s+i;
  if(s)doc.d[day]=s;else delete doc.d[day];wsave(id)}
const wWeek=()=>{const t=new Date();t.setHours(0,0,0,0);const o=[];for(let i=0;i<7;i++){const d=new Date(t);d.setDate(t.getDate()-t.getDay()+i);o.push(d)}return o};
const wCount=(p,dates)=>dates.reduce((n,d)=>n+aStr(p,d.getFullYear(),d.getMonth(),d.getDate()).length,0);
function wStreak(p){let n=0;const d=new Date();d.setHours(0,0,0,0);for(let i=0;i<60;i++){if(aStr(p,d.getFullYear(),d.getMonth(),d.getDate()).length)n++;else if(i>0)break;d.setDate(d.getDate()-1)}return n}

/* ---------- Wellness ---------- */
const wNav=t=>`<div class="head"><h2>${t||''}${MFULL[W.m]} ${W.y}</h2><div style="display:flex;gap:8px"><button class="round" data-wnav="-1" aria-label="Bulan sebelum">‹</button><button class="round" data-wnav="1" aria-label="Bulan depan">›</button></div></div>`;
const wHead=()=>DAYS.map(d=>`<div class="wd">${d.slice(0,3)}</div>`).join('');
const wBeads=(p,s,tag)=>[0,1,2,3].map(i=>`<${tag} class="bead" style="${s.includes(i)?'background:'+WCOL[p][3]:''}"></${tag}>`).join('');
function vWell(){if(!S.ready)return wait();const y=W.y,m=W.m,first=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate(),tm=new Date();if(W.sel>dim)W.sel=dim;
  let cells='<div></div>'.repeat(first);
  for(let d=1;d<=dim;d++){const td=y===tm.getFullYear()&&m===tm.getMonth()&&d===tm.getDate();
    cells+=`<button class="wbox ${td?'today':''} ${d===W.sel?'sel':''}" data-wday="${d}" aria-label="${d} ${MFULL[m]}">${WPID.map(p=>wBeads(p,aStr(p,y,m,d),'span')).join('')}<span class="wn">${d}</span></button>`}
  const wk=wWeek(),cnt=WPID.map(p=>[p,wCount(p,wk)]).sort((a,b)=>b[1]-a[1]),top=cnt[0];
  return`<div class="card">${wNav()}
   <div class="masc">${WPID.map(p=>`<button class="mascb" data-person="${p}" aria-label="Buka tab ${esc(pname(p))}">${wmasc(p)}<span class="frn">${esc(pname(p))}</span>${wOwe(p)?`<span class="qb">ganti <b>${wOwe(p)}</b></span>`:''}</button>`).join('')}</div>
   <div class="wcal7">${wHead()}</div><div class="wcal7">${cells}</div>
   <div class="wleg">${WPID.map(p=>`<span><i style="background:${WCOL[p][3]}"></i>${esc(pname(p))}</span>`).join('')}<span>baris = orang · lajur:</span>${WA.map((a,i)=>`<span>${WAI[i]}${a}</span>`).join('')}</div>
   <div class="wdet"><b>${W.sel} ${MFULL[m]}</b>${WPID.map(p=>{const s=aStr(p,y,m,W.sel),q=(aGet(p,y,m).q||{})[W.sel];return`<div class="who3"><span class="wmini">${wBeads(p,s,'i')}</span><b>${esc(pname(p))}</b><span>${s?[...s].sort().map(c=>+c===3?'Puasa '+(WPT[q||0]||'').toLowerCase():WA[+c]).join(', '):'Belum ada'}</span></div>`}).join('')}</div>
   <p class="note">Tick dibuat dalam tab masing-masing. Tekan maskot untuk buka tab.</p></div>`+
   (top[1]?`<div class="card"><div class="champ">${wmasc(top[0],WCROWN)}<span><span class="cute">Juara minggu ini!</span><span class="note" style="display:block">${esc(pname(top[0]))} · ${top[1]} tick${wStreak(top[0])>1?' · streak '+wStreak(top[0])+' hari':''}</span></span>${wstk('fire')}</div>
     <div class="wscore">${cnt.map(([p,n])=>`<span><i style="background:${WCOL[p][3]}"></i>${esc(pname(p))} <b>${n}</b></span>`).join('')}</div></div>`:'')+(wkid()?'':vPeriod())}
function wellWeek(id){if(!S.ready||!WCOL[id])return'';const wk=wWeek(),can=wCan(id),tm=new Date();tm.setHours(0,0,0,0);const kid=id==='maliq'||id==='musa';
  const y=tm.getFullYear(),m=tm.getMonth(),dim=new Date(y,m+1,0).getDate();let mt=0;for(let d=1;d<=dim;d++)mt+=aStr(id,y,m,d).length;
  return`<div class="card wkc"><div class="head"><h2>Wellness minggu ini</h2><span class="tot">${wCount(id,wk)} tick</span></div>
   <div class="champ">${wmasc(id)}<span><span class="cute">${wStreak(id)>1?'Streak '+wStreak(id)+' hari!':'Jom mula!'}</span><span class="note" style="display:block">${can?'Tekan bulat untuk tick. Puasa: tekan lagi untuk tukar jenis.':'Hanya '+esc(pname(id))+' boleh tick di sini.'}</span></span></div>
   <div class="wcal7">${wk.map(d=>{const s=aStr(id,d.getFullYear(),d.getMonth(),d.getDate()),q=(aGet(id,d.getFullYear(),d.getMonth()).q||{})[d.getDate()],fut=d>tm,td=+d===+tm;
     return`<div class="wdc"><span class="wd">${DAYS[d.getDay()].slice(0,3)} ${d.getDate()}</span><div class="wbox wk ${td?'today':''} ${fut?'fut':''}">${WA.map((a,i)=>{const on=s.includes(i);return`<button class="tk" ${fut||!can?'disabled':''} aria-pressed="${on}" aria-label="${a} ${d.getDate()} ${MN[d.getMonth()]}" data-wt="${id}|${d.getFullYear()}|${d.getMonth()}|${d.getDate()}|${i}" style="${on?'background:'+WCOL[id][i]:''}">${i===3&&on?WPI[q||0]:WAI[i]}</button>`}).join('')}${s.length===4?`<span class="wstar">${wstk('star')}</span>`:''}</div></div>`}).join('')}</div>
   <div class="wleg">${WA.map((a,i)=>`<span><i style="background:${WCOL[id][i]}"></i>${WAI[i]}${a}</span>`).join('')}${WPT.map((t,i)=>`<span>${WPI[i]}${t}</span>`).join('')}</div>
   <div class="row"><span class="nm">Puasa ganti<small>Baki turun sendiri bila tick puasa jenis Qada</small></span>${can?`<button class="round" data-wowe="${id}|-1" aria-label="Kurang">−</button>`:''}<span class="qb st">${wOwe(id)?'ganti <b>'+wOwe(id)+'</b>':'tiada'}</span>${can?`<button class="round" data-wowe="${id}|1" aria-label="Tambah">+</button>`:''}</div>
   ${kid?`<div class="rew"><span class="cute">${Math.min(mt,20)} / 20 tick bulan ni${mt>=20?', dapat sticker!':''}</span><div class="bar"><i style="width:${Math.min(100,mt*5)}%;background:${WCOL[id][3]}"></i></div></div>`:''}</div>`}

/* ---------- Period tracker + Mood Meter ---------- */
const WPH={
 haid:{n:'Fasa Kucing Manja',w:'Bonda perlukan rehat, coklat dan urut',s:['Senggugut','Penat','Nak manja','Sakit pinggang'],h:'#D9C9F4'},
 ceria:{n:'Fasa Matahari',w:'Bonda ceria, masa sesuai ajak keluar',s:['Tenaga tinggi','Mood baik','Rajin'],h:'#F7C6D0'},
 subur:{n:'Fasa Bunga',w:'Bonda berseri-seri hari ini',s:['Berseri','Yakin','Mesra'],h:'#F7C6D0'},
 lapar:{n:'Fasa Lapar',w:'Selera Bonda tinggi, sediakan makanan',s:['Selera tinggi','Nak manis','Cepat penat'],h:'#F7E8AE'},
 singa:{n:'Fasa Singa',w:'Hati-hati, Bonda dalam fasa Singa',s:['Mood swing','Bloated','Sensitif','Jerawat','Mengidam'],h:'#F5C196'}};
const perDoc=()=>WL().period||{days:[],love:[]};
const wms=s=>new Date(s+'T00:00').getTime();
function perModel(){const P=perDoc(),set=new Set(P.days||[]);if(!set.size)return null;const ds=[...set].sort(),starts=ds.filter(s=>{const d=new Date(s+'T00:00');d.setDate(d.getDate()-1);return!set.has(iso(d))}).map(wms);
  let len=28;if(starts.length>1){const g=[];for(let i=1;i<starts.length;i++){const x=Math.round((starts[i]-starts[i-1])/864e5);if(x>=20&&x<=45)g.push(x)}if(g.length)len=Math.round(g.reduce((a,b)=>a+b,0)/g.length)}
  return{set,starts,len}}
function phaseOf(s,M){M=M||perModel();if(!M)return null;const t=wms(s);let base=M.starts[0];for(const x of M.starts)if(x<=t)base=x;
  const diff=Math.round((t-base)/864e5),len=M.len,cd=((diff%len)+len)%len+1,ov=len-14,real=M.set.has(s);
  const k=real||cd<=5?'haid':cd>=ov-5&&cd<=ov+1?'subur':cd>len-6?'singa':cd>ov+1?'lapar':'ceria';
  return{k,cd,ov:!real&&cd===ov,real,next:new Date(base+(Math.floor(diff/len)+1)*len*864e5)}}
function wgirl(m){const p=WPH[m];let o=`<svg class="girl" viewBox="0 0 100 100" role="img" aria-label="${p.n}">`;
  if(m==='singa')for(let i=0;i<12;i++){const a=i/12*Math.PI*2;o+=`<circle cx="${(50+37*Math.cos(a)).toFixed(1)}" cy="${(50+37*Math.sin(a)).toFixed(1)}" r="11" fill="#F0AF7A" ${WSK}/>`}
  o+=`<path d="M50 14c-21 0-33 15-33 35 0 13 4 21 2 32 10 6 52 6 62 0-2-11 2-19 2-32 0-20-12-35-33-35z" fill="${p.h}" ${WSK}/><ellipse cx="50" cy="48" rx="19" ry="20" fill="#FCE9DA" ${WSK}/><circle cx="37" cy="54" r="4" fill="#F7B8C0"/><circle cx="63" cy="54" r="4" fill="#F7B8C0"/>`;
  const dots='<circle cx="42" cy="46" r="2.4" fill="#2E2723"/><circle cx="58" cy="46" r="2.4" fill="#2E2723"/>';
  if(m==='singa')o+=`<path d="M35 38l10 4M65 38l-10 4M43 58l3.5-3 3.500 3 3.500-3 3.500 3M30 50h-9M30 54l-8 3M70 50h9M70 54l8 3" fill="none" ${WSK}/>${dots}<path d="M80 18l5-6M84 22l7-2M78 14l1-7" fill="none" stroke="#C2534F" stroke-width="2.4" stroke-linecap="round"/>`;
  if(m==='haid')o+=`<path d="M38 45q4 3 8 0M54 45q4 3 8 0M45 58q5-3 10 0" fill="none" ${WSK}/><path d="M66 50c-2 3-3 5 0 6 3-1 2-3 0-6z" fill="#A2C3F2" ${WSK}/>`;
  if(m==='ceria')o+=`${dots}<path d="M42 54q8 8 16 0" fill="none" ${WSK}/><path d="M84 16v8M80 20h8M14 26v6M11 29h6" fill="none" stroke="#D1A23A" stroke-width="2.2" stroke-linecap="round"/>`;
  if(m==='subur')o+=`<path d="M42 49c-5-3-6-7-3-8 2 0 3 1 3 2 0-1 1-2 3-2 3 1 2 5-3 8zM58 49c-5-3-6-7-3-8 2 0 3 1 3 2 0-1 1-2 3-2 3 1 2 5-3 8z" fill="#E58A99" stroke="#2E2723" stroke-width="1.2"/><path d="M43 56q7 7 14 0" fill="none" ${WSK}/>`;
  if(m==='lapar')o+=`${dots}<ellipse cx="50" cy="58" rx="5" ry="4" fill="#C2534F" ${WSK}/><circle cx="82" cy="78" r="10" fill="#F5C196" ${WSK}/><circle cx="82" cy="78" r="3.5" fill="#F7F3EF" ${WSK}/>`;
  return o+'</svg>'}
function moodSync(){if(wme()!=='mira'||wkid())return;const M=perModel(),cur=WL().mood||{};if(!M||cur.at===TODAY&&cur.n===M.set.size)return;const days={},d=new Date();d.setHours(0,0,0,0);for(let i=0;i<40;i++){const s=iso(d),f=phaseOf(s,M);if(f)days[s]=f.k;d.setDate(d.getDate()+1)}WL().mood={at:TODAY,n:M.set.size,days};wsave('mood')}
function moodBox(){if(!S.ready)return'';let t;if(wkid()){const k=((WL().mood||{}).days||{})[TODAY];t=k&&WPH[k]?{k}:null}else{t=phaseOf(TODAY);moodSync()}if(!t)return'';
  return`<button class="mood" data-main="well">${wgirl(t.k)}<span><span class="lab">Mood meter Bonda</span><b class="cute">${WPH[t.k].w}</b></span>${t.k==='haid'?`<span class="db">${wstk('drop')}Datang Bulan</span>`:''}</button>`}
function vPeriod(){const y=W.y,m=W.m,first=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate(),M=perModel(),P=perDoc(),love=new Set(P.love||[]),can=wme()==='mira',rows=Math.ceil((first+dim)/7);
  let cells='<div></div>'.repeat(first),babies='';
  for(let d=1;d<=dim;d++){const s=wiso(y,m,d),f=phaseOf(s,M);let c='';
    if(f){c=f.k==='haid'?(f.real?'haid':'ramal'):f.k==='subur'?(f.ov?'ov':'subur'):f.k==='ceria'?'':f.k;
      if(f.ov){const i=first+d-1,col=i%7,row=Math.floor(i/7),two=col>0&&d>1;babies+=`<div class="baby" style="left:${((two?col:col+.5)/7*100).toFixed(2)}%;top:${((row+.5)/rows*100).toFixed(2)}%">${WBABY}<b>HATI-HATI!</b></div>`}}
    cells+=`<button class="pc ${c} ${s===TODAY?'today':''}" data-pday="${s}" ${can?'':'disabled'} aria-label="${d} ${MFULL[m]}${f?' '+WPH[f.k].n:''}${love.has(s)?' bersama':''}">${d}${f&&f.ov?'<span class="mk">✿</span>':''}${love.has(s)?`<span class="hrt">${wstk('heart')}</span>`:''}</button>`}
  const t=phaseOf(TODAY,M);
  return`<div class="card per"><span class="stk s1">${wstk('star')}</span><span class="stk s2">${wstk('flower')}</span>
   ${wNav('Period tracker Bonda · ')}${wrow('heart,moon,flower,drop,star,bow,cloud,heart')}
   <div class="pnow">${t?`${wgirl(t.k)}<div><h3 class="cute">${WPH[t.k].n}</h3><span class="note">Hari ke-${t.cd} kitaran · haid seterusnya dijangka ${t.next.getDate()} ${MN[t.next.getMonth()]}</span><div class="sym">${WPH[t.k].s.map(x=>`<span>${x}</span>`).join('')}</div><span class="note">Peluang hamil hari ini: <b class="${t.k==='subur'?'hi':'lo'}">${t.k==='subur'?'tinggi':'rendah'}</b></span></div>`:`<span></span><span class="note">${can?'Tanda hari haid dalam kalendar untuk mula ramalan.':'Bonda belum isi tarikh haid.'}</span>`}</div>
   ${can?`<div class="head" style="margin:0"><span class="note">Tekan tarikh untuk tanda:</span><span style="display:flex;gap:6px"><button class="pill" data-pmode="haid" aria-pressed="${W.pmode==='haid'}">Haid</button><button class="pill" data-pmode="love" aria-pressed="${W.pmode==='love'}">♥ Bersama</button></span></div>`:''}
   <div class="wcal7">${wHead()}</div><div class="wcal7 pcal">${cells}${babies}</div>
   <div class="wleg">${[['#F7B8C0','Haid'],['#FBE1E5','Ramalan haid'],['#CFE8D8','Subur (peluang tinggi)'],['#A9D8BC','✿ Ovulasi'],['#FBF2CC','Selera tinggi'],['#FCE3CF','Singa (PMS)']].map(x=>`<span><i style="background:${x[0]}"></i>${x[1]}</span>`).join('')}<span>♥ Tarikh bersama</span></div>
   ${wrow('cloud,sparkle,bow,heart,moon,flower,star,drop')}
   <p class="note">Ramalan ialah anggaran dari tarikh yang diisi${M?' (kitaran '+M.len+' hari)':''}. Makin banyak bulan diisi, makin tepat. Jangan guna sebagai kaedah perancang keluarga.</p></div>`}

/* ---------- Menu + tracker makan ---------- */
const WMCAT=['Ayam','Daging','Ikan & seafood','Sayur','Kuih & manis','Anak-anak','Makan luar','Lain-lain'];
const WMK=[['bonda','Bonda masak','pot','#FBDDE3'],['apak','Apak masak','chef','#D6E6FB'],['left','Leftover','box','#FBF2CC'],['deliv','Delivery','bag','#FCE3CF'],['luar','Makan luar','shop','#DDEFE5']];
const menuDoc=()=>WL().menu||{plan:{},items:[]};
const wfl=(l,h)=>`<label class="fl full">${l}${h}</label>`;
const wAct=k=>`<div class="acts"><button class="btn ghost" data-wcancel="1">Batal</button><button class="btn" data-wsave="${k}">Simpan</button></div>`;
const wIn=(id,ph,v)=>`<input class="txt" id="${id}" placeholder="${ph||''}" maxlength="120" autocomplete="off" value="${esc(v||'')}">`;
const wSel=(id,opts,v)=>`<select class="txt" id="${id}">${opts.map(o=>`<option ${o===v?'selected':''}>${o}</option>`).join('')}</select>`;
const wChips=(k,list)=>`<div class="chips">${['Semua',...list].map(c=>`<button class="pill" data-wcat="${k}|${c==='Semua'?'':c}" aria-pressed="${(W.cat[k]||'')===(c==='Semua'?'':c)}">${c}</button>`).join('')}</div>`;
function menuOf(d){const D=menuDoc(),p=(D.plan||{})[d];if(p&&p.n)return p;const w=D.week;if(w&&w.names){const i=Math.round((wms(d)-wms(w.start))/864e5);if(i>=0&&i<7&&w.names[i])return{n:w.names[i],cook:''}}return null}
function menuHomeCard(){if(!S.ready)return'';const t=menuOf(TODAY);
  if(!t||!t.n)return`<div class="card"><div class="head"><h2>Menu hari ini</h2><button class="sedit" data-main="menu">Pilih</button></div><p class="note">Belum pilih menu hari ini.</p></div>`;
  return`<div class="card mhome"><div class="head"><h2>Menu hari ini</h2><button class="sedit" data-main="menu">Menu</button></div>${wrow('sparkle,heart,star')}<div class="ctr">${wfood(t.n,84)}<span class="cute big">${esc(t.n)}</span><span class="note">${t.cook?esc(t.cook)+' masak · ':''}yum!</span></div>${wrow('pot,flower,heart,sparkle,chef')}</div>`}
function vMenu(){if(!S.ready)return wait();const D=menuDoc(),t=menuOf(TODAY),tm=new Date();tm.setDate(tm.getDate()+1);const e=menuOf(iso(tm)),cat=W.cat.menu||'',items=(D.items||[]).map((x,i)=>[x,i]).filter(([x])=>!cat||x.cat===cat),f=W.form;
  let h=`<div class="card"><div class="head"><h2>Menu hari ini</h2><button class="sedit" data-wform="plan">${t&&t.n?'Tukar':'Pilih'}</button></div>`+
   (f&&f.t==='plan'?`<div class="form">${wfl('Hidangan utama',wIn('wf-n','cth Ayam masak merah',t&&t.n))}${wfl('Siapa masak',wSel('wf-cook',['Bonda','Apak','Leftover','Delivery','Makan luar'],t&&t.cook))}${wfl('Untuk',wSel('wf-day',['Hari ini','Esok'],'Hari ini'))}</div>${wAct('plan')}`
    :t&&t.n?`<div class="mhero"><span><span class="lab">${t.cook?esc(t.cook)+' masak':'Makan hari ini'}</span><span class="cute big">${esc(t.n)}</span></span>${wfood(t.n,78)}</div>`:`<p class="note">Belum pilih. Tekan Pilih, atau tekan "Jadi menu" pada resepi di bawah.</p>`)+
   `<p class="note" style="margin-top:6px"><b>Esok:</b> ${e&&e.n?esc(e.n):'belum pilih'}</p>${wrow('heart,star,pot,flower,sparkle,heart')}</div>`+wChips('menu',WMCAT)+
   weekCard(D)+groceryCard(D)+
   `<div class="card"><div class="head"><h2>Buku resepi</h2><button class="sedit" data-wform="recipe">+ Tambah</button></div>`+
   (f&&f.t==='recipe'?`<div class="form">${wfl('Nama',wIn('wf-n','cth Ayam goreng berempah'))}${wfl('Kategori',wSel('wf-cat',WMCAT,cat||'Ayam'))}${wfl('Link video (pilihan)',wIn('wf-link','https://'))}<label class="fl full">Bahan (satu baris satu bahan)<textarea class="txt" id="wf-ing" rows="5" maxlength="1500" placeholder="1/2 biji kobis&#10;300g ayam&#10;2 ulas bawang putih"></textarea></label>${wfl('Nota (pilihan)',wIn('wf-note','masa, harga'))}</div>${wAct('recipe')}`:'')+
   (items.length?items.map(([x,i])=>{const op=W.open['r'+i],ing=x.ing||[];return`<div class="rcard"><button class="rhead" data-wopen="r${i}" aria-expanded="${!!op}">${wfood(x.cat==='Makan luar'?'kedai':x.n+' '+x.cat,42)}<span class="nm"><span class="cute">${esc(x.n)}</span><small>${esc(x.cat||'')}${ing.length?' · '+ing.length+' bahan':x.cat==='Makan luar'?'':' · bahan belum lengkap'}${x.c?' · dimasak '+x.c+'×':x.cat==='Makan luar'?'':' · baru'}${x.by?' · '+esc(x.by):''}</small></span>${wtok(x.tok)}<span class="chev">${op?'▾':'▸'}</span></button>
     ${op?`<div class="rbody">${ing.length?`<div class="ings">${ing.map(g=>`<span class="${g.p?'fresh':''}">${esc(g.q?g.q+' ':'')}${esc(g.n)}</span>`).join('')}</div>`:''}${x.note?`<p class="note">${esc(x.note)}</p>`:''}<div class="racts">${x.link?`<a class="sedit" href="${esc(x.link)}" target="_blank" rel="noopener">Tengok video</a>`:''}<button class="sedit" data-setmenu="${i}">Jadi menu hari ini</button>${x.cat==='Makan luar'?'':`<button class="sedit" data-cooked="${i}">Dah masak</button>`}${S.edit?`<button class="del" data-wdel="menu|${i}" aria-label="Buang ${esc(x.n)}">×</button>`:''}</div></div>`:''}</div>`}).join(''):`<p class="note">Belum ada resepi. Tekan + Tambah, atau hantar link resepi kepada bot Telegram. Tekan Edit di atas untuk buang.</p>`)+`</div>`;
  /* tracker makan */
  const y=W.y,m=W.m,first=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate(),md=(WL()['meal-'+y+'-'+pad(m+1)]||{}).d||{},c={};Object.values(md).forEach(k=>c[k]=(c[k]||0)+1);
  let cells='<div></div>'.repeat(first);for(let d=1;d<=dim;d++){const k=WMK.find(x=>x[0]===md[d]);cells+=`<button class="pc mc ${wiso(y,m,d)===TODAY?'today':''}" data-mday="${d}" style="${k?'background:'+k[3]:''}" aria-label="${d} ${MFULL[m]}${k?' '+k[1]:''}">${k?wstk(k[2]):''}${d}</button>`}
  return h+`<div class="card per"><span class="stk s1">${wfood('ayam',36)}</span>${wNav('Tracker makan · ')}${wrow('pot,heart,chef,star,box,bag,shop,sparkle')}
   <div class="tot5">${WMK.map(k=>`<div>${wstk(k[2])}<b>${c[k[0]]||0}</b><span>${k[1]}</span></div>`).join('')}</div>
   <p class="cute ctr">${Object.keys(md).length} hari direkod · masak di rumah ${(c.bonda||0)+(c.apak||0)} hari</p>
   <span class="note">Pilih jenis, lepas tu tekan tarikh:</span><div class="chips">${WMK.map(k=>`<button class="pill mbtn" data-mmode="${k[0]}" aria-pressed="${W.mmode===k[0]}">${wstk(k[2])}${k[1]}</button>`).join('')}</div>
   <div class="wcal7">${wHead()}</div><div class="wcal7">${cells}</div></div>`}

/* ---------- Parenting ---------- */
const WPCAT=['Doa','Tips','Disiplin','Kesihatan','Sekolah'];
function vParenting(){if(!S.ready)return wait();const D=WL().parenting||{items:[]},cat=W.cat.par||'',all=(D.items||[]).map((x,i)=>[x,i]),doa=all.filter(([x])=>x.cat==='Doa'),f=W.form;
  const list=all.filter(([x])=>!cat||x.cat===cat).sort((a,b)=>(b[0].pin?1:0)-(a[0].pin?1:0)),dy=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/864e5),td=doa.length?doa[dy%doa.length][0]:null;
  return`<button class="back" data-main="lagi">‹ Lagi</button><div class="card"><div class="head"><h2>Doa hari ini</h2></div>${td?`<div class="mhero dua"><span><span class="cute big">${esc(td.n)}</span>${td.body?`<span class="pbody">${esc(td.body)}</span>`:''}</span></div>`:`<p class="note">Tambah nota kategori Doa, dan satu doa akan keluar di sini setiap hari.</p>`}${wrow('moon,star,heart,flower,sparkle')}</div>`+wChips('par',WPCAT)+
   `<div class="card"><div class="head"><h2>Nota disimpan</h2><button class="sedit" data-wform="par">+ Tambah</button></div>`+
   (f&&f.t==='par'?`<div class="form">${wfl('Tajuk',wIn('wf-n','cth Doa sebelum tidur'))}${wfl('Kategori',wSel('wf-cat',WPCAT,cat||'Doa'))}${wfl('Untuk',wSel('wf-for',['Semua','Maliq','Musa'],'Semua'))}<label class="fl full">Isi<textarea class="txt" id="wf-body" rows="4" maxlength="2000" placeholder="Teks doa, tips atau nota"></textarea></label>${wfl('Link (pilihan)',wIn('wf-link','https://'))}</div>${wAct('par')}`:'')+
   (list.length?list.map(([x,i])=>`<div class="row prow"><span class="nm"><span class="cute">${x.pin?'📌 ':''}${esc(x.n)}</span><small>${esc(x.cat||'')}${x.for&&x.for!=='Semua'?' · '+esc(x.for):''}${x.by?' · '+esc(x.by):''}</small>${W.open['p'+i]&&x.body?`<span class="pbody">${esc(x.body)}</span>`:''}${x.link?`<a class="lk" href="${esc(x.link)}" target="_blank" rel="noopener">Buka link</a>`:''}</span>${wtok(x.tok)}${x.body?`<button class="sedit" data-wopen="p${i}">${W.open['p'+i]?'Tutup':'Baca'}</button>`:''}<button class="sedit" data-wpin="${i}">${x.pin?'Nyahsemat':'Semat'}</button>${S.edit?`<button class="del" data-wdel="parenting|${i}" aria-label="Buang ${esc(x.n)}">×</button>`:''}</div>`).join(''):`<p class="note">Belum ada nota. Tekan + Tambah. Tekan Edit di atas untuk buang.</p>`)+`</div>`}

/* ---------- Trips ---------- */
const WTST=[['impian','Impian'],['dirancang','Dirancang'],['pergi','Dah pergi']];
const WCOVER=['linear-gradient(135deg,#A2C3F2,#CFE3D6)','linear-gradient(135deg,#C8B2ED,#F9D2B2)','linear-gradient(135deg,#F7C6D0,#F7E8AE)','linear-gradient(135deg,#BFE6D3,#F2DD90)'];
const wimg=(u,c)=>/^https:\/\//i.test(String(u||''))?`<img class="${c}" src="${esc(u)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:'';
const tripImg=x=>x.img||((x.hotels||[]).find(h=>h.img)||{}).img||'';
function tripCard(x,i,f){return`<div class="card"><div class="cover" style="background:${WCOVER[i%4]}">${wimg(tripImg(x),'cimg')}<span>${esc(x.n)}</span></div>
     <div class="head" style="margin-top:8px"><span class="note">${esc(x.when||'Belum ada tarikh')}${x.bud?' · bajet '+rm(x.bud):''}</span>${S.edit?`<button class="del" data-wdel="trips|${i}" aria-label="Buang ${esc(x.n)}">×</button>`:''}</div>
     ${x.note?`<p class="note">${esc(x.note)}</p>`:''}
     <div class="chips">${WTST.map(c=>`<button class="pill" data-tst="${i}|${c[0]}" aria-pressed="${x.st===c[0]}">${c[1]}</button>`).join('')}</div>
     ${(x.hotels||[]).map((hh,j)=>`<div class="row">${wimg(hh.img,'hth')||'<span class="ic">🏨</span>'}<span class="nm">${esc(hh.n)}<small>${hh.price?rm(hh.price)+' / malam':'harga belum diisi'}${hh.note?' · '+esc(hh.note):''}${hh.by?' · '+esc(hh.by):''}</small>${hh.link?`<a class="lk" href="${esc(hh.link)}" target="_blank" rel="noopener">Buka link</a>`:''}</span>${wtok(hh.tok)}<button class="sedit" data-hlove="${i}|${j}">${(hh.love||[]).length?'♥ '+hh.love.length:'♡'}</button>${S.edit?`<button class="del" data-wdel="hotel|${i}|${j}" aria-label="Buang ${esc(hh.n)}">×</button>`:''}</div>`).join('')}
     ${f&&f.t==='hotel'&&f.i===i?`<div class="form">${wfl('Hotel',wIn('wf-n','Nama hotel'))}${wfl('Harga semalam RM (pilihan)',wIn('wf-price','cth 420'))}${wfl('Link (pilihan)',wIn('wf-link','https://'))}${wfl('Nota (pilihan)',wIn('wf-note','bilik keluarga, kolam, sarapan'))}</div>${wAct('hotel')}`:`<button class="lk" data-wform="hotel|${i}">+ Hotel</button>`}</div>`}
function vTrips(){if(!S.ready)return wait();if(!W.tv){try{W.tv=localStorage.getItem('tview')||'grid'}catch(_){W.tv='grid'}}
  const D=WL().trips||{items:[]},st=W.cat.trip||'',f=W.form,all=(D.items||[]).map((x,i)=>[x,i]),list=all.filter(([x])=>!st||x.st===st),grid=W.tv==='grid',one=grid&&W.topen!=null&&all[W.topen];
  let h=`<button class="back" data-main="lagi">‹ Lagi</button>`;
  if(one)return h+`<button class="back" data-topen="-1">‹ Semua trip</button>`+tripCard(one[0],one[1],f);
  h+=`<div class="tbar"><div class="chips">${[['','Semua'],...WTST].map(c=>`<button class="pill" data-wcat="trip|${c[0]}" aria-pressed="${st===c[0]}">${c[1]}</button>`).join('')}</div><div class="vsw" role="group" aria-label="Cara paparan"><button data-tview="grid" aria-pressed="${grid}">Kotak</button><button data-tview="list" aria-pressed="${!grid}">List</button></div></div>`+
   (f&&f.t==='trip'?`<div class="card"><div class="form">${wfl('Destinasi',wIn('wf-n','cth Langkawi'))}${wfl('Bila (pilihan)',wIn('wf-when','cth Cuti sekolah Dis, 4 hari 3 malam'))}${wfl('Bajet RM (pilihan)',wIn('wf-bud','cth 3000'))}${wfl('Nota (pilihan)',wIn('wf-note','aktiviti, barang nak bawa'))}</div>${wAct('trip')}</div>`:`<button class="lk" data-wform="trip" style="align-self:flex-start">+ Destinasi</button>`);
  if(!list.length)return h+`<div class="card"><p class="note">Belum ada destinasi. Tekan + Destinasi, atau hantar link hotel kepada bot Telegram.</p></div>`;
  if(!grid)return h+list.map(([x,i])=>tripCard(x,i,f)).join('');
  return h+`<div class="tgrid">${list.map(([x,i])=>`<button class="ttile" data-topen="${i}" style="background:${WCOVER[i%4]}" aria-label="Buka ${esc(x.n)}">${wimg(tripImg(x),'cimg')}<span class="tst">${esc((WTST.find(c=>c[0]===x.st)||['','Impian'])[1])}</span><span class="tnm"><b>${esc(x.n)}</b><small>${(x.hotels||[]).length} hotel${x.when?' · '+esc(x.when):''}</small></span></button>`).join('')}</div>`}

/* ---------- Lagi ---------- */
function vLagi(){const T=[['parenting','Parenting','Doa dan tips','moon'],['trips','Trips','Bucket list dan hotel','cloud'],['check','Checklist','Sama-sama settle','star'],['goals','Goals','Simpan sama-sama','heart'],['tetapan','Bot & tetapan','Telegram, kod anak, Apple Pay','sparkle']];
  return`<div class="lagi">${T.map(t=>`<button class="card" data-main="${t[0]}">${wstk(t[3])}<b>${t[1]}</b><span class="note">${t[2]}</span></button>`).join('')}</div>`}

/* ---------- klik ---------- */
function moreClick(b,d){const v=id=>{const e=document.getElementById(id);return e?e.value.trim():''},num=s=>{const n=parseFloat(String(s).replace(/[^0-9.]/g,''));return isFinite(n)?n:null},who=()=>(window.HS&&HS.who&&HS.who())||'',lk=u=>/^https?:\/\//i.test(u)?u:'',R=()=>(render(true),true);
  if(d.wnav){W.m+=+d.wnav;if(W.m<0){W.m=11;W.y--}if(W.m>11){W.m=0;W.y++}return R()}
  if(d.wday){W.sel=+d.wday;return R()}
  if(d.wt){const[p,y,m,day,i]=d.wt.split('|');if(wCan(p))aToggle(p,+y,+m,+day,+i);return R()}
  if(d.wowe){const[p,n]=d.wowe.split('|');if(wCan(p))wOweAdd(p,+n);return R()}
  if(d.pmode){W.pmode=d.pmode;return R()}
  if(d.pday){if(wme()!=='mira')return true;const P=wdoc('period',{days:[],love:[]}),k=W.pmode==='haid'?'days':'love';P[k]=P[k]||[];const i=P[k].indexOf(d.pday);i>=0?P[k].splice(i,1):P[k].push(d.pday);wsave('period');return R()}
  if(d.mmode){W.mmode=d.mmode;return R()}
  if(d.mday){const id='meal-'+W.y+'-'+pad(W.m+1),D=wdoc(id,{d:{}});D.d=D.d||{};D.d[d.mday]===W.mmode?delete D.d[d.mday]:D.d[d.mday]=W.mmode;wsave(id);return R()}
  if(d.wcat!=null){const[k,c]=d.wcat.split('|');W.cat[k]=c||'';return R()}
  if(d.wform){const[t,i]=d.wform.split('|');W.form={t,i:i==null?null:+i};return R()}
  if(d.wcancel){W.form=null;return R()}
  if(d.wopen){W.open[d.wopen]=!W.open[d.wopen];return R()}
  if(d.setmenu){const D=wdoc('menu',{plan:{},items:[]}),x=(D.items||[])[+d.setmenu];if(x){D.plan=D.plan||{};D.plan[TODAY]={n:x.n,cook:x.cat==='Makan luar'?'':who()==='Syafiq'?'Apak':'Bonda'};wsave('menu');toast('Jadi menu hari ini.')}return R()}
  if(d.wpin){const D=wdoc('parenting',{items:[]}),x=D.items[+d.wpin];if(x){x.pin=!x.pin;wsave('parenting')}return R()}
  if(d.tst){const[i,s]=d.tst.split('|'),D=wdoc('trips',{items:[]}),x=D.items[+i];if(x){x.st=s;wsave('trips')}return R()}
  if(d.hlove){const[i,j]=d.hlove.split('|'),D=wdoc('trips',{items:[]}),hh=((D.items[+i]||{}).hotels||[])[+j];if(hh){hh.love=hh.love||[];const w=who()||'?',k=hh.love.indexOf(w);k>=0?hh.love.splice(k,1):hh.love.push(w);wsave('trips')}return R()}
  if(d.wdel){const[c,i,j]=d.wdel.split('|');if(c==='hotel'){const D=wdoc('trips',{items:[]});((D.items[+i]||{}).hotels||[]).splice(+j,1);wsave('trips')}else{const D=wdoc(c,{items:[]});(D.items||[]).splice(+i,1);wsave(c)}return R()}
  if(d.wsave&&!['trx','bud','acc'].includes(d.wsave)){const k=d.wsave,n=v('wf-n');if(!n){toast('Isi nama dulu.');return true}
    if(k==='plan'){const D=wdoc('menu',{plan:{},items:[]}),tm=new Date();if(v('wf-day')==='Esok')tm.setDate(tm.getDate()+1);D.plan=D.plan||{};D.plan[iso(tm)]={n,cook:v('wf-cook')};wsave('menu')}
    if(k==='recipe'){const D=wdoc('menu',{plan:{},items:[]});D.items=D.items||[];D.items.unshift({n,cat:v('wf-cat'),ing:v('wf-ing').split('\n').map(z=>z.trim()).filter(Boolean).slice(0,40).map(z=>({n:z,q:'',p:WFRESH.test(z)})),link:lk(v('wf-link')),note:v('wf-note'),by:who()});wsave('menu')}
    if(k==='par'){const D=wdoc('parenting',{items:[]});D.items=D.items||[];D.items.unshift({n,cat:v('wf-cat'),for:v('wf-for'),body:v('wf-body'),link:lk(v('wf-link')),by:who()});wsave('parenting')}
    if(k==='trip'){const D=wdoc('trips',{items:[]});D.items=D.items||[];D.items.unshift({n,when:v('wf-when'),bud:num(v('wf-bud')),note:v('wf-note'),st:'impian',hotels:[]});wsave('trips')}
    if(k==='hotel'){const D=wdoc('trips',{items:[]}),x=D.items[W.form.i];if(x){x.hotels=x.hotels||[];const hh={n,price:num(v('wf-price')),link:lk(v('wf-link')),note:v('wf-note'),by:who(),love:[]};x.hotels.push(hh);wsave('trips');if(hh.link)wcall('og',{url:hh.link}).then(j=>{if(j&&j.img){hh.img=j.img;wsave('trips');render()}}).catch(()=>{})}}
    W.form=null;return R()}
  return more2Click(b,d,R,v,num,who)}

/* ================= Fasa 3 & 5: peti Telegram, penunjuk token, tetapan, Finance dashboard ================= */
const WTOK={lo:'Token rendah',mid:'Token sederhana',hi:'Token tinggi'};
const wtok=l=>WTOK[l]?`<span class="tokd ${l}" role="img" aria-label="${WTOK[l]}" title="${WTOK[l]}"></span>`:'';
const WIT={event:['Acara','📅'],resepi:['Resepi','🍳'],makan:['Makan luar','🍽️'],parenting:['Parenting','🤲'],trip:['Trip','🏨'],belanja:['Belanja','💳']};
const wmyP=()=>wme()==='syafiq'?'s':wme()==='mira'?'m':'';
function tgPull(){if(wkid()||!window.HS||!HS.call||Date.now()-(W.pullAt||0)<60000)return;W.pullAt=Date.now();HS.call('tg_poll').catch(()=>{})}
function ibAuto(){const me=(window.HS&&HS.who&&HS.who())||'',D=WL().inbox;if(!me||!D||!(D.items||[]).length)return;const go=D.items.filter(x=>!x.raw&&x.auto===me&&x.f&&x.f.type&&x.f.type!=='abai'),msgs=[];if(!go.length)return;
  go.forEach(x=>{const m=ibAccept(x);if(m!=null){msgs.push(m);D.items=D.items.filter(z=>z!==x)}else x.auto=''});wsave('inbox');if(msgs.length)setTimeout(()=>toast(go.length>1?go.length+' cadangan dari Telegram masuk sendiri.':msgs[0]),300)}
function inboxCard(){tgPull();if(!S.ready||wkid())return'';ibAuto();const it=(WL().inbox||{}).items||[];if(!it.length)return'';const sc=W.scan||{};
  return`<div class="card"><div class="head"><h2>Dari Telegram</h2><span class="tot">${it.length}</span></div>`+it.slice(0,W.open.iball?80:6).map(x=>{const f=x.f||{},T=WIT[f.type]||['Lain','📌'],del=`<button class="del" data-ibno="${x.id}" aria-label="Buang">×</button>`;
    if(x.raw)return`<div class="row prow"><span class="ic">💬</span><span class="nm">${esc(String(x.text||'(gambar sahaja)').slice(0,110))}<small>${esc(x.from||'')}${x.chat?' · '+esc(x.chat):''}${x.photo?' · ada gambar':''} · ${x.q?'Mac mini sedang baca, masuk sendiri dalam beberapa minit':'belum discan'}</small></span>${x.q?'<span class="qtag">⏳ sedang dibaca</span>':`<button class="sedit" data-ibscan="${x.id}" ${sc[x.id]?'disabled':''}>${sc[x.id]?'Menghantar…':'Scan'}</button>`}${del}</div>`;
    if(f.type==='abai'||!f.type)return`<div class="row prow"><span class="ic">💬</span><span class="nm">${esc(String(x.text||'').slice(0,90))}<small>Dah discan: tiada apa untuk disimpan</small></span>${wtok(x.lvl)}${del}</div>`;
    return`<div class="row prow"><span class="ic">${T[1]}</span><span class="nm">${esc(f.title||T[0])}<small>${T[0]}${f.date?' · '+dLab(f.date):''}${f.time?' · '+fmtT(f.time):''}${f.price!=null?' · '+rm(f.price):''}${f.place?' · '+esc(f.place):''}${(f.ing||[]).length?' · '+f.ing.length+' bahan':''}${x.from?' · '+esc(x.from):''}</small>${f.note?`<small>${esc(f.note)}</small>`:''}</span>${x.by?'':wtok(x.lvl)}<button class="sedit" data-ibok="${x.id}">Terima</button>${del}</div>`}).join('')+
   (it.length>6?`<button class="lk" data-wopen="iball">${W.open.iball?'Tunjuk 6 sahaja':'Tunjuk semua '+it.length}</button>`:'')+`<p class="note">Bot hanya simpan mesej. Tekan Scan pada yang kau nak: Mac mini baca dalam beberapa minit guna langganan Claude (tiada kos tambahan) dan hasil masuk sendiri ke kalendar / senarai. Acara masuk sebagai tentative. Yang tak ditekan Scan tak dibaca.</p></div>`}
function ibAccept(x){const f=x.f||{},t=f.type,n=f.title||'Tanpa tajuk',pick=(list,def)=>list.find(c=>f.cat&&c.toLowerCase().includes(String(f.cat).toLowerCase().split(' ')[0]))||def;
  if(t==='event'){const id=newId();S.events[id]={title:n,date:f.date||TODAY,time:f.time||'',type:guessType(n+' '+(f.note||'')),who:f.who||[],note:f.note||'',tent:true};save('events',id);return f.date?'Masuk kalendar (tentative).':'Tiada tarikh dalam mesej, jadi masuk hari ini. Betulkan tarikh dalam kalendar.'}
  if(t==='resepi'||t==='makan'){const D=wdoc('menu',{plan:{},items:[]});D.items=D.items||[];D.items.unshift({n,cat:t==='makan'?'Makan luar':pick(WMCAT,'Lain-lain'),ing:f.ing||[],img:f.img||'',link:f.link||'',note:f.note||'',by:x.from||'Telegram',tok:x.lvl});wsave('menu');return'Masuk Menu.'}
  if(t==='parenting'){const D=wdoc('parenting',{items:[]});D.items=D.items||[];D.items.unshift({n,cat:pick(WPCAT,'Tips'),for:(f.who||[]).includes('maliq')&&!(f.who||[]).includes('musa')?'Maliq':(f.who||[]).includes('musa')&&!(f.who||[]).includes('maliq')?'Musa':'Semua',body:f.body||f.note||'',link:f.link||'',by:x.from||'Telegram',tok:x.lvl});wsave('parenting');return'Masuk Parenting.'}
  if(t==='trip'){const D=wdoc('trips',{items:[]});D.items=D.items||[];const pl=String(f.place||n);let tr=D.items.find(z=>z.n&&z.n.toLowerCase()===pl.toLowerCase());if(!tr){tr={n:pl,when:'',bud:null,note:'',st:'impian',hotels:[]};D.items.unshift(tr)}
    tr.hotels=tr.hotels||[];tr.hotels.push({n,price:f.price,img:f.img||'',link:f.link||'',note:f.note||'',by:x.from||'Telegram',love:[],tok:x.lvl});wsave('trips');return'Masuk Trips bawah '+pl+'.'}
  if(t==='belanja'){const o=wmyP();if(!o||f.price==null)return null;wcall('trx_add',{owner:o,row:{item:n,amt:f.price,date:f.date||'',src:'Telegram',note:f.note||''}}).then(()=>{W.trx={};toast('Belanja direkod.');render()}).catch(()=>toast('Tak dapat rekod belanja. Backend mungkin belum dikemas kini.'));return'Merekod belanja…'}
  return null}
async function whash(p){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('homesyafiq:'+p));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}

/* ---------- Bot & tetapan ---------- */
function vTetapan(){if(!S.ready)return wait();if(wkid())return'';const tg=WL().tg||{},pend=Object.entries(tg.pending||{}),chats=Object.entries(tg.chats||{}),I=W.info,ym=TODAY.slice(0,7),us=(tg.use||{})[ym],pins=WL().pins||{},me=wmyP();
  if(!I&&!W.infoBusy){W.infoBusy=true;wcall('info').then(j=>{W.info=j;W.infoBusy=false;render()}).catch(()=>{W.info={old:true};W.infoBusy=false;render()})}
  const yn=v=>v?'<b class="lo">sedia</b>':'<b class="hi">belum</b>';
  return`<button class="back" data-main="lagi">‹ Lagi</button>
  <div class="card"><div class="head"><h2>Bot Telegram</h2></div>
   ${!I?'<p class="note">Menyemak…</p>':I.old?'<p class="note">Backend belum dikemas kini. Tampal Code.gs baru dalam Apps Script dan deploy versi baru dulu.</p>':`<div class="row"><span class="nm">Token bot<small>Script Property TG_TOKEN</small></span>${yn(I.hasBot)}</div><div class="row"><span class="nm">Kunci AI<small>Script Property AI_KEY</small></span>${yn(I.hasAi)}</div><div class="row"><span class="nm">Bot disambung ke app<small>dibuat dari Mac mini</small></span>${yn(I.hook)}</div>`}
   ${pend.length?`<p class="dayh">Minta kebenaran</p>`+pend.map(([id,c])=>`<div class="row"><span class="nm">${esc(c.title)}<small>Chat baru hantar mesej kepada bot</small></span><button class="sedit" data-tgok="${esc(id)}|${esc(c.title)}">Benarkan</button><button class="del" data-tgno="${esc(id)}" aria-label="Tolak">×</button></div>`).join(''):''}
   ${chats.length?`<p class="dayh">Chat dibenarkan</p>`+chats.map(([id,t])=>`<div class="row"><span class="nm">${esc(t)}</span><button class="sedit" data-tgno="${esc(id)}">Buang</button></div>`).join(''):'<p class="note">Belum ada chat dibenarkan. Hantar satu mesej kepada bot, lepas tu ia keluar di sini.</p>'}
   <p class="note" style="margin-top:6px">Bulan ni: ${us?us.n+' mesej dibaca · '+(us.tok||0).toLocaleString('en-MY')+' token':'belum ada bacaan'}.</p></div>
  <div class="card"><div class="head"><h2>Penunjuk token</h2></div><div class="wleg"><span>${wtok('lo')} Rendah</span><span>${wtok('mid')} Sederhana</span><span>${wtok('hi')} Tinggi</span><span>Tiada bulat = percuma</span></div><p class="note">Hanya mesej yang dibaca bot guna token. Tick, tracker, belanja Apple Pay dan semua paparan percuma.</p></div>
  <div class="card"><div class="head"><h2>Kod anak</h2></div><p class="note">Tablet Maliq / Musa masuk guna kod ni. Mereka nampak Home, tab sendiri, Wellness dan Mood Meter sahaja.${I&&!I.old?' Sekarang: '+(I.hasKid?'dah ada kod.':'belum ada kod.'):''}</p><div class="add"><input class="txt" id="wf-kid" type="password" autocomplete="new-password" placeholder="Kod anak (4 aksara atau lebih)" maxlength="40"><button class="btn" data-setkid="1">Simpan</button></div></div>
  <div class="card"><div class="head"><h2>Kunci tab Finance</h2></div><p class="note">Password ni diminta bila orang lain buka tab Finance ${me?esc(PN[me]):'kau'}. Tab sendiri terus buka. Ini kunci skrin dalam app, bukan penyulitan data.${me?' Sekarang: '+(pins[me]?'dah ada password.':'belum ada password.'):''}</p>${me?`<div class="add"><input class="txt" id="wf-pin" type="password" autocomplete="new-password" placeholder="Password Finance ${esc(PN[me])}" maxlength="40"><button class="btn" data-setpin="1">Simpan</button></div>`:''}</div>
  <div class="card"><div class="head"><h2>Apple Pay ke Finance</h2><button class="sedit" data-paykey="1">Tunjuk kunci</button></div>
   ${W.pay?`<p class="note">Alamat (URL):</p><p class="mono">${esc(window.HS_CONFIG.api)}</p><p class="note">Kunci (pay):</p><p class="mono">${esc(W.pay)}</p>`:''}
   <ol class="steps"><li>Buka app Shortcuts › Automation › + › Transaction.</li><li>Pilih kad, pilih Run Immediately, tekan Next › New Blank Automation.</li><li>Tambah action "Get Contents of URL". URL: alamat di atas. Method: POST. Request Body: JSON.</li><li>Tambah medan: <b>pay</b> = kunci di atas, <b>who</b> = ${esc(me?PN[me]:'Mira')}, <b>amount</b> = Shortcut Input › Amount, <b>merchant</b> = Shortcut Input › Merchant, <b>card</b> = Shortcut Input › Card or Pass.</li><li>Setiap kali tap Apple Pay, belanja masuk tab TRX dalam Sheet dan Dashboard Finance. Percuma, tiada token.</li></ol></div>`}

/* ---------- Finance dashboard ---------- */
const WFC=['Makan','Barang dapur','Bil & utiliti','Kereta & minyak','Shopping','Anak','Kesihatan','Lain-lain'],WFCOL=['#C98A5A','#7E9A86','#5F8FB5','#B0937B','#8C7BB8','#D1A23A','#C2578E','#9A8F87'];
const finLocked=P=>P!=='b'&&P!==wmyP()&&!!(WL().pins||{})[P]&&!(W.unl||{})[P];
function vFinLock(P){return`<div class="card lockc">${wstk('moon')}<span class="cute big">Tab ${esc(PN[P])} dikunci</span><p class="note">Tab sendiri terus buka. Tab orang lain perlu password tuan punya.</p><input class="txt" id="wf-unl" type="password" autocomplete="off" placeholder="Password ${esc(PN[P])}"><button class="btn" data-unlock="${P}">Buka</button></div>`}
function finChart(rows,bud,dim){const Wd=300,H=120,l=30,b=14,daily=Array(dim).fill(0);rows.forEach(r=>{const d=+String(r.date).slice(8,10);if(d>=1&&d<=dim)daily[d-1]+=r.amt});
  const tot=daily.reduce((a,c)=>a+c,0),max=Math.max(tot,bud||0,100)*1.15,x=d=>l+(d-1)/(dim-1)*(Wd-l-4),y=a=>H-b-a/max*(H-b-6),last=Math.max(1,...rows.map(r=>+String(r.date).slice(8,10)||1));let c=0;
  const pts=daily.slice(0,last).map((a,i)=>{c+=a;return x(i+1).toFixed(1)+','+y(c).toFixed(1)}),step=max>4000?2000:max>1500?1000:max>600?500:200,ticks=[];for(let t=0;t<=max;t+=step)ticks.push(t);
  return`<svg class="fchart" viewBox="0 0 ${Wd} ${H}" role="img" aria-label="Belanja terkumpul ${rm(tot)}${bud?' lawan bajet '+rm(bud):''}">`+ticks.map(a=>`<line x1="${l}" x2="${Wd-4}" y1="${y(a)}" y2="${y(a)}" stroke="var(--hair)"/><text x="${l-4}" y="${y(a)+3}" text-anchor="end">${a}</text>`).join('')+
   `<polygon points="${x(1)},${y(0)} ${pts.join(' ')} ${x(last)},${y(0)}" fill="#5E8A72" opacity=".22"/><polyline points="${pts.join(' ')}" fill="none" stroke="#5E8A72" stroke-width="2" stroke-linejoin="round"/>`+
   (bud?`<line x1="${l}" x2="${Wd-4}" y1="${y(bud)}" y2="${y(bud)}" stroke="#C98A5A" stroke-width="1.5" stroke-dasharray="4 3"/>`:'')+[1,8,15,22,29].filter(d=>d<=dim).map(d=>`<text x="${x(d)}" y="${H-3}" text-anchor="middle">${d}</text>`).join('')+`</svg>`}
function vFinDash(P){const ym=YM(),key=P+ym,T=(W.trx=W.trx||{})[key],mine=P===wmyP(),D=WL()['fin-'+P]||{budget:{},accounts:[]},f=W.form;
  if(!T){W.trx[key]={load:true};wcall('trx_list',{owner:P,ym}).then(j=>{W.trx[key]={rows:j.rows||[]};render()}).catch(e=>{W.trx[key]={err:e&&e.code==='unavailable'?'Tiada internet.':'Backend belum dikemas kini. Tampal Code.gs baru dan deploy versi baru dulu.'};render()})}
  const rows=(T&&T.rows)||[],spent=sum(rows.map(r=>r.amt)),bud=sum(WFC.map(c=>D.budget&&D.budget[c])),by={};rows.forEach(r=>{const c=WFC.includes(r.cat)?r.cat:'Lain-lain';by[c]=(by[c]||0)+r.amt});
  const un=sum((((BILLS()||{}).items)||[]).filter(i=>i.w===P&&i.a&&!(i.paid&&i.paid[ym])).map(i=>i.a)),dim=new Date(2026,S.month+1,0).getDate(),cur=ym===TODAY.slice(0,7),left=bud-spent-un,dl=cur?dim-now.getDate()+1:0;
  const dw=Array(7).fill(0);rows.forEach(r=>{const d=new Date(r.date+'T00:00');if(!isNaN(d))dw[d.getDay()]+=r.amt});const mx=Math.max(...dw,1),acc=D.accounts||[];
  let h=months()+`<div class="card"><div class="fhero"><span class="lab">${bud?'Baki untuk belanja':'Belanja'} · ${MN[S.month]} 2026</span><span class="fbig">${rm(bud?left:spent)}</span>${bud?`<span class="note2">dah belanja ${rm(spent)}${un?' · bil belum bayar '+rm(un):''}${cur&&dl>0&&left>0?' · '+rm(left/dl)+' sehari':''}</span><div class="bar"><i style="width:${Math.min(100,Math.round((spent+un)/bud*100))}%"></i></div><span class="note2">${Math.round((spent+un)/bud*100)}% daripada bajet ${rm(bud)}</span>`:`<span class="note2">${mine?'Tetapkan bajet untuk nampak baki.':'Belum ada bajet.'}</span>`}</div>
    ${T&&T.load?'<p class="note">Mengambil belanja…</p>':T&&T.err?`<p class="note">${T.err}</p>`:''}</div>`;
  h+=`<div class="card"><div class="head"><h2>Terkini</h2>${mine?`<button class="sedit" data-wform="trx">+ Belanja</button>`:''}</div>`+
   (f&&f.t==='trx'?`<div class="form">${wfl('Perkara',wIn('wf-n','cth Makan tengah hari'))}${wfl('Jumlah RM',`<input class="txt" id="wf-amt" inputmode="decimal" placeholder="cth 12.50" autocomplete="off">`)}${wfl('Kategori',wSel('wf-cat',['Auto',...WFC],'Auto'))}${wfl('Akaun (pilihan)',wIn('wf-acc','cth E-wallet'))}</div>${wAct('trx')}`:'')+
   (rows.length?rows.slice().reverse().slice(0,W.open.trxall?200:10).map(r=>`<div class="row"><span class="ic" style="background:${WFCOL[Math.max(0,WFC.indexOf(r.cat))]}55">${esc((r.cat||'L')[0])}</span><span class="nm">${esc(r.item||r.cat)}<small>${esc(r.date.slice(8,10))} ${MN[S.month]} · ${esc(r.cat)}${r.acc?' · '+esc(r.acc):''} · ${esc(r.src)}</small></span><span class="fnum">−${n2(r.amt)}</span>${mine&&S.edit?`<button class="del" data-trxvoid="${r.row}" aria-label="Batal ${esc(r.item)}">×</button>`:''}</div>`).join('')+(rows.length>10?`<button class="lk" data-wopen="trxall">${W.open.trxall?'Tunjuk 10 sahaja':'Tunjuk semua '+rows.length}</button>`:''):`<p class="note">Belum ada belanja bulan ni.${mine?' Tekan + Belanja, atau pasang Apple Pay dalam Lagi › Bot & tetapan.':''}</p>`)+`</div>`;
  h+=`<div class="card"><div class="head"><h2>Bajet bulan ini</h2>${mine?`<button class="sedit" data-wform="bud">Tetapkan</button>`:`<span class="tot">${rm(bud)}</span>`}</div>`+
   (f&&f.t==='bud'?`<div class="form">${WFC.map((c,i)=>`<label class="fl">${c}<input class="txt" id="wf-b${i}" inputmode="decimal" value="${(D.budget&&D.budget[c])||''}" placeholder="0" autocomplete="off"></label>`).join('')}</div>${wAct('bud')}`
    :WFC.filter(c=>(D.budget&&D.budget[c])||by[c]).map(c=>{const b=+(D.budget&&D.budget[c])||0,v=by[c]||0,p=b?Math.round(v/b*100):0,o=b&&v>b;return`<div class="fbud"><div class="head" style="margin:0"><span>${c}</span><span class="fnum ${o?'over':''}">${n2(v).split('.')[0]}${b?` <small>/ ${b} · ${p}%</small>`:''}</span></div><div class="bar"><i style="width:${b?Math.min(100,p):0}%;background:${o?'var(--warn)':WFCOL[WFC.indexOf(c)]}"></i></div></div>`}).join('')||'<p class="note">Belum ada bajet atau belanja.</p>')+`</div>`;
  if(rows.length)h+=`<div class="card"><div class="head"><h2>Corak belanja</h2><span class="note">terkumpul${bud?' · garis putus = bajet':''}</span></div>${finChart(rows,bud,dim)}</div>
   <div class="card"><div class="head"><h2>Hari paling banyak belanja</h2><span class="note">${DAYS[dw.indexOf(Math.max(...dw))]}</span></div><div class="dowc">${dw.map((v,i)=>`<div style="background:color-mix(in srgb,#5E8A72 ${Math.round(v/mx*60)+6}%,var(--glass2))">${DAYS[i].slice(0,3)}<b>${Math.round(v)}</b></div>`).join('')}</div></div>`;
  h+=`<div class="card"><div class="head"><h2>Akaun</h2>${mine?`<button class="sedit" data-wform="acc">+ Akaun</button>`:`<span class="tot">${rm(sum(acc.map(a=>a.bal)))}</span>`}</div>`+
   (f&&f.t==='acc'?`<div class="form">${wfl('Nama akaun',wIn('wf-n','cth Simpanan, E-wallet, Kad kredit'))}${wfl('Baki RM (hutang guna tanda −)',`<input class="txt" id="wf-amt" inputmode="text" placeholder="cth 779.17 atau -815" autocomplete="off">`)}</div>${wAct('acc')}`:'')+
   (acc.length?acc.map((a,i)=>`<div class="row"><span class="ic">${esc((a.n||'A')[0])}</span><span class="nm">${esc(a.n)}</span><span class="fnum ${a.bal<0?'over':''}">${n2(a.bal)}</span>${mine&&S.edit?`<button class="del" data-accdel="${i}" aria-label="Buang ${esc(a.n)}">×</button>`:''}</div>`).join('')+`<div class="row"><span class="nm"><b>Bersih</b></span><span class="fnum">${rm(sum(acc.map(a=>a.bal)))}</span></div>`:`<p class="note">${mine?'Tambah akaun dan baki untuk nampak jumlah bersih. Baki dikemas kini sendiri.':'Belum ada akaun.'}</p>`)+`</div>`;
  return h+`<p class="note">Semua belanja disimpan dalam tab ${P==='s'?'TRX SYAFIQ':'TRX MIRA'} dalam Sheet SPENDING. Tekan Edit untuk batalkan satu belanja (baris ditanda BATAL, tak dipadam).</p>`}

function more2Click(b,d,R,v,num,who){
  if(d.ibscan){const id=d.ibscan;(W.scan=W.scan||{})[id]=1;wcall('tg_scan',{id}).then(j=>{const D=wdoc('inbox',{items:[]}),k=(D.items||[]).findIndex(z=>z.id===id);if(k>=0&&j.item)D.items[k]=j.item;delete W.scan[id];if(j.queued)toast('Dihantar ke Mac mini. Hasil masuk sendiri dalam beberapa minit.');render(true)}).catch(e=>{delete W.scan[id];toast(e&&e.message&&!/tindakan/.test(e.message)?e.message:'Tak dapat scan. Backend mungkin belum dikemas kini.');render(true)});return R()}
  if(d.wkgen){const D=wdoc('menu',{plan:{},items:[]});weekGen(D);wsave('menu');return R()}
  if(d.wkswap){const D=wdoc('menu',{plan:{},items:[]});weekSwap(D,+d.wkswap);wsave('menu');return R()}
  if(d.pantry){const D=wdoc('menu',{plan:{},items:[]});D.pantry=D.pantry||[];const k=D.pantry.indexOf(d.pantry);k>=0?D.pantry.splice(k,1):D.pantry.push(d.pantry);wsave('menu');return R()}
  if(d.grocery){const G=groceryList(menuDoc()).filter(g=>!g.have),C=S.lists.checklist=S.lists.checklist||{title:'Checklist',items:[]};C.items=C.items||[];let n=0;G.forEach(g=>{const nm='Beli: '+g.label;if(!C.items.some(z=>z.n===nm&&!z.done)){C.items.push({n:nm,done:false,for:''});n++}});if(n)save('lists','checklist');toast(n?n+' barang masuk Checklist.':'Semua dah ada dalam Checklist.');return R()}
  if(d.cooked){const D=wdoc('menu',{plan:{},items:[]}),x=(D.items||[])[+d.cooked];if(x){x.c=(x.c||0)+1;x.last=TODAY;wsave('menu');const t=new Date(),id='meal-'+t.getFullYear()+'-'+pad(t.getMonth()+1),M=wdoc(id,{d:{}});M.d=M.d||{};M.d[t.getDate()]=who()==='Syafiq'?'apak':'bonda';wsave(id);toast('Ditanda dah masak. Tracker makan hari ini diisi.')}return R()}
  if(d.tview){W.tv=d.tview;W.topen=null;try{localStorage.setItem('tview',W.tv)}catch(_){}return R()}
  if(d.topen!=null){W.topen=+d.topen<0?null:+d.topen;window.scrollTo(0,0);return R()}
  if(d.ibno){const D=wdoc('inbox',{items:[]});D.items=(D.items||[]).filter(x=>x.id!==d.ibno);wsave('inbox');return R()}
  if(d.ibok){const D=wdoc('inbox',{items:[]}),x=(D.items||[]).find(z=>z.id===d.ibok);if(!x)return R();const msg=ibAccept(x);if(msg==null){toast('Tak dapat terima: maklumat tak cukup (contoh tiada jumlah).');return true}D.items=D.items.filter(z=>z.id!==d.ibok);wsave('inbox');toast(msg);return R()}
  if(d.tgok){const[id,...t]=d.tgok.split('|');wcall('tg_allow',{id,title:t.join('|')}).then(()=>{toast('Chat dibenarkan.');render()}).catch(()=>toast('Tak berjaya. Cuba lagi.'));return true}
  if(d.tgno){wcall('tg_allow',{id:d.tgno,off:true}).then(()=>{toast('Chat dibuang.');render()}).catch(()=>toast('Tak berjaya. Cuba lagi.'));return true}
  if(d.setkid){const k=v('wf-kid');if(k.length<4){toast('Kod anak sekurang-kurangnya 4 aksara.');return true}wcall('setkid',{kid:k}).then(()=>{W.info=null;toast('Kod anak disimpan.');render(true)}).catch(e=>toast(e&&e.message&&!/tindakan/.test(e.message)?e.message:'Backend belum dikemas kini.'));return true}
  if(d.setpin){const k=v('wf-pin'),me=wmyP();if(!me||k.length<4){toast('Password sekurang-kurangnya 4 aksara.');return true}whash(k).then(h=>{const D=wdoc('pins',{});D[me]=h;wsave('pins');toast('Password Finance disimpan.');render(true)});return true}
  if(d.unlock){const P=d.unlock;whash(v('wf-unl')).then(h=>{if(h===(WL().pins||{})[P]){(W.unl=W.unl||{})[P]=true;render(true)}else toast('Password salah.')});return true}
  if(d.paykey){wcall('paykey').then(j=>{W.pay=j.key;render(true)}).catch(()=>toast('Backend belum dikemas kini.'));return true}
  if(d.trxvoid){const P=wmyP();wcall('trx_void',{owner:P,row:+d.trxvoid}).then(()=>{W.trx={};toast('Belanja dibatalkan.');render(true)}).catch(()=>toast('Tak berjaya. Cuba lagi.'));return true}
  if(d.accdel){const P=wmyP(),D=wdoc('fin-'+P,{budget:{},accounts:[]});(D.accounts||[]).splice(+d.accdel,1);wsave('fin-'+P);return R()}
  if(d.wsave==='trx'||d.wsave==='bud'||d.wsave==='acc'){const P=wmyP(),k=d.wsave;if(!P)return true;
    if(k==='bud'){const D=wdoc('fin-'+P,{budget:{},accounts:[]});D.budget={};WFC.forEach((c,i)=>{const x=num(v('wf-b'+i));if(x)D.budget[c]=x});wsave('fin-'+P);W.form=null;return R()}
    const n=v('wf-n'),raw=v('wf-amt'),a=parseFloat(raw.replace(/[^0-9.\-]/g,''));if(!n||!isFinite(a)){toast('Isi nama dan jumlah.');return true}
    if(k==='acc'){const D=wdoc('fin-'+P,{budget:{},accounts:[]});D.accounts=D.accounts||[];D.accounts.push({n,bal:a});wsave('fin-'+P);W.form=null;return R()}
    if(a<=0){toast('Jumlah mesti lebih dari 0.');return true}const c=v('wf-cat');W.form=null;
    wcall('trx_add',{owner:P,row:{item:n,amt:a,cat:c==='Auto'?'':c,acc:v('wf-acc'),src:'App'}}).then(()=>{W.trx={};toast('Belanja direkod.');render(true)}).catch(()=>toast('Tak dapat rekod. Backend mungkin belum dikemas kini.'));return R()}
  return false}

/* ---------- Buku resepi: menu mingguan auto + senarai barang (dikira dalam app, tiada token) ---------- */
const WFRESH=/kobis|kubis|sawi|bayam|kangkung|tomato|timun|lobak|kacang|terung|brokoli|bendi|cendawan|taugeh|daun|salad|ayam|daging|ikan|udang|sotong|kerang|santan|tauhu|tempe|susu|krim|cili|lada|kentang|labu|peria|petola|jagung|limau/i;
const ingKey=n=>String(n||'').toLowerCase().replace(/[0-9½¼¾\/.,()+-]/g,' ').replace(/\b(biji|sudu|besar|kecil|teh|makan|cawan|gram|g|kg|ml|liter|l|ulas|batang|helai|keping|ekor|inci|ikat|tin|paket|peket|sedikit|secukup|rasa|segar|dihiris|dicincang|dipotong|ditumbuk|kisar|dan|atau|untuk|yang)\b/g,' ').replace(/\s+/g,' ').trim().split(' ').slice(0,2).join(' ');
const freshKeys=x=>[...new Set((x.ing||[]).filter(g=>g.p||WFRESH.test(g.n)).map(g=>ingKey(g.n)).filter(Boolean))];
const weekStartIso=()=>iso(wWeek()[0]);
const cookable=D=>(D.items||[]).filter(x=>x.n&&x.cat!=='Makan luar');
function weekScore(c,picks,prev){const have={};picks.forEach(p=>freshKeys(p).forEach(k=>have[k]=(have[k]||0)+1));let sh=0;freshKeys(c).forEach(k=>{if(have[k])sh+=have[k]%2?3:1});return sh+(prev.includes(c.n)?-4:0)+(!c.c?1:0)+Math.random()*.9}
function weekGen(D){const pool=cookable(D),start=weekStartIso(),prev=D.week&&D.week.start!==start?(D.week.names||[]):(D.prevWeek||[]),picks=[],news=pool.filter(x=>!x.c&&!prev.includes(x.n));
  if(D.week&&D.week.start!==start)D.prevWeek=D.week.names||[];
  if(news.length)picks.push(news[Math.floor(Math.random()*news.length)]);
  while(picks.length<Math.min(7,pool.length)){const rest=pool.filter(x=>!picks.includes(x));if(!rest.length)break;picks.push(rest.map(c=>[weekScore(c,picks,prev),c]).sort((a,b)=>b[0]-a[0])[0][1])}
  D.week={start,names:picks.map(x=>x.n).concat(Array(7).fill('')).slice(0,7)}}
function weekSwap(D,i){const w=D.week;if(!w)return;const pool=cookable(D),cur=w.names.filter((n,k)=>n&&k!==i),picks=pool.filter(x=>cur.includes(x.n)),rest=pool.filter(x=>!w.names.includes(x.n));if(!rest.length){toast('Tiada resepi lain dalam buku resepi.');return}
  w.names[i]=rest.map(c=>[weekScore(c,picks,D.prevWeek||[]),c]).sort((a,b)=>b[0]-a[0])[0][1].n}
function weekCard(D){const pool=cookable(D),w=D.week&&D.week.start===weekStartIso()?D.week:null,wk=wWeek();
  if(pool.length<3)return`<div class="card"><div class="head"><h2>Menu minggu ini</h2></div><p class="note">Tambah sekurang-kurangnya 3 resepi dalam buku resepi, dan app akan cadang menu seminggu yang kongsi bahan supaya tak membazir.</p></div>`;
  if(!w)return`<div class="card"><div class="head"><h2>Menu minggu ini</h2><button class="sedit" data-wkgen="1">Cadang menu</button></div><p class="note">Belum ada menu untuk minggu ni. Tekan Cadang menu.</p></div>`;
  return`<div class="card"><div class="head"><h2>Menu minggu ini</h2><button class="sedit" data-wkgen="1">Cadang semula</button></div>${wrow('pot,heart,star,chef,flower')}`+
   wk.map((d,i)=>{const n=w.names[i],x=pool.find(z=>z.n===n),td=iso(d)===TODAY;return`<div class="row wkr ${td?'now':''}"><span class="wkd">${DAYS[d.getDay()].slice(0,3)}<b>${d.getDate()}</b></span>${n?wfood(n+' '+((x||{}).cat||''),34):''}<span class="nm"><span class="cute">${n?esc(n):'kosong'}</span>${x&&!x.c?'<small>resepi baru</small>':''}</span><button class="sedit" data-wkswap="${i}">Tukar</button></div>`}).join('')+
   `<p class="note">Dipilih supaya bahan segar dikongsi antara resepi, ada resepi baru, dan tak ulang minggu lepas. Dikira dalam app, tiada token.</p></div>`}
function groceryList(D){const w=D.week&&D.week.start===weekStartIso()?D.week:null;if(!w)return[];const pool=cookable(D),m={},pan=D.pantry||[];
  w.names.forEach(n=>{const x=pool.find(z=>z.n===n);if(!x)return;(x.ing||[]).forEach(g=>{const k=ingKey(g.n);if(!k)return;const e=m[k]=m[k]||{k,name:g.n,qs:[],rc:new Set(),p:false};if(g.q)e.qs.push(g.q);e.rc.add(x.n);e.p=e.p||!!g.p||WFRESH.test(g.n)})});
  return Object.values(m).map(e=>({k:e.k,p:e.p,n:e.rc.size,have:pan.includes(e.k),label:e.name.replace(/^\s*[0-9½¼¾\/.]+\s*(g|kg|ml|biji|ulas|batang|cawan|sudu besar|sudu kecil|sudu teh|sudu makan|helai|keping|ekor|ikat|tin)?\s*/i,'').replace(/^./,c=>c.toUpperCase())+(e.qs.length?' ('+e.qs.join(' + ')+')':'')})).sort((a,b)=>(b.p-a.p)||a.label.localeCompare(b.label))}
function groceryCard(D){const G=groceryList(D);if(!G.length)return'';const need=G.filter(g=>!g.have),have=G.filter(g=>g.have);
  return`<div class="card"><div class="head"><h2>Barang dapur minggu ini</h2><button class="sedit" data-grocery="1">Masuk Checklist</button></div>`+
   need.map(g=>`<div class="row"><span class="nm">${esc(g.label)}<small>${g.p?'segar · ':''}${g.n>1?'guna dalam '+g.n+' resepi':g.p?'guna sekali sahaja minggu ni':'1 resepi'}</small></span><button class="sedit" data-pantry="${esc(g.k)}">Dah ada</button></div>`).join('')+
   (have.length?`<p class="dayh">Sentiasa ada di rumah</p><div class="ings">${have.map(g=>`<button class="sedit" data-pantry="${esc(g.k)}">${esc(g.label)} ×</button>`).join('')}</div>`:'')+
   `<p class="note">Bahan segar yang "guna sekali sahaja" mungkin berlebih. Tekan Tukar pada menu untuk cari resepi yang guna bahan sama.</p></div>`}
