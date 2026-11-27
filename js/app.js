const MN=['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogo','Sep','Okt','Nov','Dis'];
/* Transkrip tab 2018, 2019 dan UTILITIES (2020-2025). #tahun|kumpulan|bulan mula ; nama|bil|baris bayar */
/* Sejarah 2018-2025 disimpan dalam APP DATA (archive/yearly), bukan dalam kod. */
function nums(s){const o=[];String(s).split(',').forEach(t=>{const[v,k]=t.split('*');for(let i=0;i<(+k||1);i++)o.push(v===''?null:+v)});return o}
let ARCH={},ARCHRAW=null;
function buildArch(RAW){ARCH={};ARCHRAW=RAW;let y,g,st;RAW.trim().split('\n').forEach(l=>{l=l.trim();if(!l)return;
  if(l[0]==='#'){const h=l.slice(1).split('|');y=+h[0];g=h[1];st=+h[2]-1;ARCH[y]=ARCH[y]||{groups:[]};return}
  const[n,a,p]=l.split('|'),A=nums(a),P=nums(p||'');
  let G=ARCH[y].groups.find(x=>x.name===g);if(!G){G={name:g,items:[]};ARCH[y].groups.push(G)}
  let it=G.items.find(x=>x.n===n);if(!it){it={n,a:Array(12).fill(null),p:Array(12).fill(false),pa:Array(12).fill(null)};G.items.push(it)}
  for(let i=0;i<4;i++){const v=A[i];if(!v)continue;it.a[st+i]=v;const q=P[i];
    if(q!=null&&(y>=2024||q!==0)){it.p[st+i]=true;it.pa[st+i]=y>=2024?v:Math.abs(q)}}
})}

const now=new Date(),pad=n=>String(n).padStart(2,'0'),iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()),TODAY=iso(now);
const MFULL=['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'],DAYS=['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'];
const MAIN=[['home','Home','<path d="M3 10.500 12 3l9 7.500V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'],
['finance','Finance','<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10.500h18M7 15h4"/>'],
['well','Wellness','<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>'],
['menu','Menu','<path d="M4 11h16a8 8 0 0 1-16 0zM9 4v3M12 3v4M15 4v3"/>'],
['lagi','Lagi','<path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h5v5h-5z"/>']];
const FT=[['overview','Overview','Komitmen'],['bill','Bill','Bill'],['breakdown','Breakdown','Breakdown'],['commitment','Commitment','Commitment'],['cukai','Cukai','Cukai'],['reserve','Reserve','Reserve'],['debt','Debt Syafiq','Debt Syafiq'],['yearly','Yearly','Yearly']];
const COLS=['lists','tracker','goals','events','family','tax','archive','well'];
const S={main:'home',ft:'overview',fp:'b',df:null,month:now.getFullYear()===2026?now.getMonth():0,year:2026,edit:false,lists:{},tracker:{},goals:{},events:{},family:{},archive:{},well:{},evf:null,tax:{},tw:'s',ya:2026,tt:'ring',tfe:null,tdr:{},tadd:null,scan:null,person:null,ptab:'ring',fe:null,open:{},cal:{y:now.getFullYear(),m:now.getMonth()},sel:null,ready:false,msg:'Tengah ambil data…'};
let db=null,dirty=false;const Q={};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const n2=v=>(+v||0).toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2});
const rm=v=>(v<0?'−':'')+'RM '+n2(Math.abs(+v||0));
const sum=a=>a.reduce((s,v)=>s+(+v||0),0);
const byOrder=o=>Object.entries(o).sort((a,b)=>(a[1].order||0)-(b[1].order||0));
const L=id=>S.lists[id];
const sec=s=>byOrder(S.lists).filter(([,d])=>d.section===s);
const YM=()=>'2026-'+pad(S.month+1);
const pc=w=>w==='s'?'ps':'pm';
function toast(t){const e=$('#toast');e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,3200)}
function fail(e){toast(e&&e.code==='conflict'?'Ada perubahan dari phone lain. Data dah dikemas kini, cuba ubah lagi.':'Tak dapat simpan. Cuba lagi.')}
function save(col,id){if(!db)return toast('Data tak dapat disimpan sekarang.');const d=JSON.parse(JSON.stringify(S[col][id]));
  const k=col+'/'+id;Q[k]=(Q[k]||Promise.resolve()).then(()=>db.collection(col).doc(id).set(d)).catch(fail);if(col==='lists'&&id!=='fin-sync')finTouch(id)}
function newId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}

function yearModel(y){const R=S.archive&&S.archive.yearly&&S.archive.yearly.raw;if(R&&R!==ARCHRAW)buildArch(R);if(y!==2026)return ARCH[y]||{groups:[]};
  return{groups:byOrder(S.tracker).filter(([,d])=>d.year===2026).map(([,d])=>({name:d.owner,items:(d.items||[]).map(it=>({n:it.n,a:it.a,p:it.p,pa:it.a}))}))}}
const gcol=n=>/MIRA|BREAKDOWN/.test(n)?'var(--cm)':/MALIQ|ANAK|MUSA/.test(n)?'var(--c3)':'var(--cs)';
const wait=()=>`<div class="card"><p class="note">${esc(S.msg)}</p></div>`;
const months=()=>`<div class="chips">${MN.map((x,i)=>`<button class="pill" data-month="${i}" aria-pressed="${i===S.month}">${x}</button>`).join('')}</div>`;
const delBtn=(k,n)=>S.edit?`<button class="del" data-del="${k}" aria-label="Buang ${esc(n)}">×</button>`:'';
const addRow=(k,ph)=>S.edit?`<div class="add"><input class="txt" id="add-${k.replace(/\|/g,'-')}" placeholder="${ph}" maxlength="60" autocomplete="off"><button class="btn" data-add="${k}">Tambah</button></div>`:'';
const amtBtn=(k,v,cls,empty)=>`<button class="amt ${cls||''} ${v==null?'none':''}" data-amt="${k}">${v==null?(empty||'isi'):rm(v)}</button>`;

function payTot(){let s=0,m=0;sec('commitment').forEach(([,d])=>(d.items||[]).forEach(i=>{if(i.w==='s')s+=+i.a||0;else m+=+i.a||0}));return{s,m}}
function donut(s,m){const t=s+m||1,C=2*Math.PI*46,a=s/t*C;
  return`<svg viewBox="0 0 120 120" class="donut" role="img" aria-label="Syafiq ${Math.round(s/t*100)} peratus, Mira ${Math.round(m/t*100)} peratus"><circle cx="60" cy="60" r="46" fill="none" stroke="var(--cm)" stroke-width="16"/><circle cx="60" cy="60" r="46" fill="none" stroke="var(--cs)" stroke-width="16" stroke-dasharray="${a} ${C-a}" transform="rotate(-90 60 60)"/><text x="60" y="57" text-anchor="middle" class="dt">${n2(s+m).split('.')[0]}</text><text x="60" y="73" text-anchor="middle" class="ds">RM sebulan</text></svg>`}

function vOverview(){if(!S.ready)return wait();
  const p=payTot(),ym=YM(),bi=(BILLS()||{items:[]}).items,due=sum(bi.map(i=>i.a)),paid=sum(bi.map(i=>i.paid&&i.paid[ym]?i.a:0)),un=bi.filter(i=>i.a&&!(i.paid&&i.paid[ym]));
  let h=`<div class="card"><div class="head"><h2>Komitmen ${MN[now.getMonth()]} ${now.getFullYear()}</h2></div><div class="split"><div class="grow">
    <b class="hero">${rm(p.s+p.m)}</b>
    <div class="row"><span class="nm">Syafiq</span><span class="amt ps">${rm(p.s)}</span></div>
    <div class="row"><span class="nm">Mira</span><span class="amt pm">${rm(p.m)}</span></div></div>${donut(p.s,p.m)}</div></div>`;
  h+=`<div class="card"><div class="head"><h2>Bill ${MN[S.month]}</h2><span class="tot">${rm(paid)} / ${n2(due)}</span></div><div class="bar"><i style="width:${due?Math.round(paid/due*100):0}%"></i></div>`+
   (un.length?un.map(u=>`<div class="row"><span class="nm">${esc(u.n)}<small>${u.due?'Due '+u.due+' hb':'Belum bayar'}</small></span><span class="amt ${pc(u.w)}">${rm(u.a)}</span></div>`).join(''):`<p class="hand" style="margin:8px 0 0">${due?'Semua bill dah settle bulan ni ✓':'Belum ada bill.'}</p>`)+`</div>`;
  const ys=[2018,2019,2020,2021,2022,2023,2024,2025,2026].map(y=>{const M=yearModel(y),g=M.groups.map(G=>[G.name,sum(G.items.map(i=>sum(i.a)))]);return{y,g,t:sum(g.map(x=>x[1]))}});
  const mx=Math.max(1,...ys.map(x=>x.t));
  h+=`<div class="card"><div class="head"><h2>Jumlah bil setiap tahun</h2><span class="tot">2018 – 2026</span></div>`+
   ys.map(x=>`<div class="yr"><b>${x.y}</b><div class="seg">${x.g.map(g=>`<i style="width:${g[1]/mx*100}%;background:${gcol(g[0])}"></i>`).join('')}</div><span>${n2(x.t)}</span></div>`).join('')+
   `<div class="leg"><span><i style="background:var(--cs)"></i>Syafiq</span><span><i style="background:var(--cm)"></i>Mira</span><span><i style="background:var(--c3)"></i>Maliq</span></div>
   <p class="note" style="margin-top:6px">Ikut rekod dalam sheet. 2018 ada 4 bulan, 2020 ada 8 bulan.</p></div>`;
  const dv=id=>sum(its(id).map(dBal)),av=id=>sum(its(id).map(i=>ansCalc(i).bal||0));
  h+=`<div class="card"><div class="head"><h2>Hutang</h2><span class="tot">${rm(dv('debt-syafiq')+dv('debt-mira')+av('ans-syafiq')+av('ans-mira'))}</span></div>
   <div class="row"><span class="nm">Debt Syafiq<small>baki</small></span><span class="amt ps">${rm(dv('debt-syafiq'))}</span></div>
   <div class="row"><span class="nm">Debt Ansuran Syafiq<small>baki</small></span><span class="amt ps">${rm(av('ans-syafiq'))}</span></div>
   <div class="row"><span class="nm">Debt Mira<small>baki</small></span><span class="amt pm">${rm(dv('debt-mira'))}</span></div>
   <div class="row"><span class="nm">Debt Ansuran Mira<small>baki</small></span><span class="amt pm">${rm(av('ans-mira'))}</span></div></div>`;
  return h}

function vBill(){let h=months();if(!S.ready)return h+wait();const B=BILLS(),ym=YM();if(!B)return h+`<div class="card"><p class="note">Belum ada bill.</p></div>`;
  const BI=B.items.filter(i=>S.fp==='b'||i.w===S.fp),its=B.items.map((it,i)=>[it,i]).filter(([it])=>S.fp==='b'||it.w===S.fp).sort((a,b)=>(a[0].due||99)-(b[0].due||99)),tot=sum(BI.map(i=>i.a)),pd=sum(BI.map(i=>i.paid&&i.paid[ym]?i.a:0));
  h+=`<div class="card"><div class="head"><h2>Bill ${S.fp==='b'?'':PN[S.fp]+' · '}${MN[S.month]} 2026</h2><span class="tot">${rm(pd)} / ${n2(tot)}</span></div><div class="bar" style="margin-bottom:6px"><i style="width:${tot?Math.round(pd/tot*100):0}%"></i></div>`+
   its.map(([it,i])=>{const p=!!(it.paid&&it.paid[ym]);return`<div class="row ${p?'paid':''}"><input type="checkbox" id="b-${i}" data-chk="b|${i}" ${p?'checked':''} aria-label="${esc(it.n)} dah bayar">
     <span class="nm">${esc(it.n)}<small><button class="lk" data-amt="lists|bills|${i}|due">${it.due?'Due '+it.due+' hb':'Due: belum tahu'}</button>${it.hint?' · '+esc(it.hint):''}</small></span>
     ${S.edit?`<button class="who ${pc(it.w)}" data-who="bills|${i}" aria-label="Tukar siapa bayar"></button>`:''}${amtBtn('lists|bills|'+i+'|a',it.a,pc(it.w))}</div>`}).join('')+addRow('lists|bills','Nama bill baru')+`</div>`;
  return h+`<p class="note">${SB.ready?'Bill ni satu sumber dengan Planner Mira: tab BILL dalam sheet SPENDING. Tick, jumlah dan due terus ditulis ke Sheet.':'Tak dapat sambung ke Sheet sekarang, jadi ini salinan terakhir dan tak boleh diubah.'} Biru = Syafiq bayar, purple = Mira bayar. Untuk buang bill, padam barisnya dalam Sheet.</p>`}

function vBreak(){let h=months();if(!S.ready)return h+wait();const m=S.month,docs=byOrder(S.tracker).filter(([,d])=>S.fp==='b'||String(d.owner||'').toUpperCase()===(S.fp==='s'?'SYAFIQ':'MIRA'));
  docs.forEach(([id,d])=>{const its=d.items||[],tot=sum(its.map(i=>i.a[m])),pd=sum(its.map(i=>i.p[m]?i.a[m]:0)),any=its.some(x=>x.a[m]!=null);
    h+=`<div class="card"><div class="head"><h2><i class="dot" style="background:${gcol(d.owner)}"></i>${esc(d.owner)}</h2><span class="tot">${rm(tot)}</span></div>`+
    its.map((it,i)=>{const v=it.a[m],p=!!it.p[m];if(v==null&&!S.edit)return'';
      return`<div class="row ${p?'paid':''}"><label><input type="checkbox" id="c-${id}-${i}" data-chk="t|${id}|${i}" ${p?'checked':''} ${v?'':'disabled'}><span class="nm">${esc(it.n)}</span></label>${amtBtn('tracker|'+id+'|'+i,v)}${delBtn('tracker|'+id+'|'+i,it.n)}</div>`}).join('')+
    (any||S.edit?'':`<p class="note">Bulan ni belum diisi. Tekan Edit untuk isi jumlah.</p>`)+(tot?`<div class="bar"><i style="width:${Math.round(pd/tot*100)}%"></i></div>`:'')+addRow('tracker|'+id,'Nama bil baru')+`</div>`});
  return h+`<p class="note">Pecahan bil sebenar setiap bulan (tab UTILITIES dalam sheet). Tick bila dah bayar.</p>`}

function comCard(id,d){const its=d.items||[];
  return`<div class="card"><div class="head"><h2>${esc(d.title)}</h2><span class="tot">${rm(sum(its.map(i=>i.a)))}</span></div>`+
   (its.length?its.map((it,i)=>`<div class="row"><span class="nm">${esc(it.n)}${it.note?`<small>${esc(it.note)}</small>`:''}</span>${S.edit?amtBtn('lists|'+id+'|'+i+'|a',it.a,pc(it.w)):`<button class="amt ${pc(it.w)}" data-who="${id}|${i}" aria-label="${esc(it.n)}: ${it.w==='s'?'Syafiq':'Mira'} bayar. Tekan untuk tukar">${it.a==null?'—':rm(it.a)}</button>`}${delBtn('lists|'+id+'|'+i,it.n)}</div>`).join(''):`<p class="note">Belum ada item. Tekan Edit untuk tambah.</p>`)+addRow('lists|'+id,'Nama item baru')+`</div>`}
function splitCard(id,d){const its=d.items||[];
  return`<div class="card"><div class="head"><h2>${esc(d.title)}</h2><span class="tot">kongsi</span></div>`+
   its.map((it,i)=>`<div class="row"><span class="nm">${esc(it.n)}<small>Jumlah ${rm((+it.s||0)+(+it.m||0))}${it.note?' · '+esc(it.note):''}</small></span>${amtBtn('lists|'+id+'|'+i+'|s',it.s,'ps','—')}${amtBtn('lists|'+id+'|'+i+'|m',it.m,'pm','—')}${delBtn('lists|'+id+'|'+i,it.n)}</div>`).join('')+addRow('lists|'+id,'Nama bill kongsi')+
   `<p class="note" style="margin-top:6px">Biru = bahagian Syafiq, purple = bahagian Mira. Tekan nombor untuk ubah.</p></div>`}
function vCommit(){if(!S.ready)return wait();const p=payTot();
  return`<div class="two"><div class="big ps"><span>Syafiq</span><b>${rm(p.s)}</b></div><div class="big pm"><span>Mira</span><b>${rm(p.m)}</b></div></div>
   <div class="grid">${sec('commitment').map(([id,d])=>comCard(id,d)).join('')}${sec('split').map(([id,d])=>splitCard(id,d)).join('')}</div>
   <p class="note">Warna nombor tunjuk siapa bayar. Tekan nombor untuk tukar biru ↔ purple; jumlah di atas ikut sekali. Nak ubah angka, tekan Edit dulu.</p>`}

function plainCard(id,d,cls){const its=d.items||[];
  return`<div class="card"><div class="head"><h2>${esc(d.title)}</h2><span class="tot">${rm(sum(its.map(i=>i.a)))}</span></div>`+
   (its.length?its.map((it,i)=>`<div class="row"><span class="nm">${esc(it.n)}</span>${amtBtn('lists|'+id+'|'+i+'|a',it.a,cls)}${delBtn('lists|'+id+'|'+i,it.n)}</div>`).join(''):`<p class="note">Belum ada item. Tekan Edit untuk tambah.</p>`)+addRow('lists|'+id,'Nama item baru')+`</div>`}
function vReserve(){if(!S.ready)return wait();return`<div class="grid">${sec('reserve').map(([id,d])=>plainCard(id,d,pc(d.w))).join('')}</div>`}

function debtCard(id,d){const its=d.items||[],c=pc(d.w);
  return`<div class="card"><div class="head"><h2>${esc(d.title)}</h2><span class="tot">${rm(sum(its.map(i=>i.a)))}</span></div>`+
   (its.length?its.map((it,i)=>{const k=id+'-'+i,op=!!S.open[k],sub=it.sub||[];
     return`<div class="row"><button class="exp" data-open="${k}" aria-expanded="${op}"><span class="chev">${op?'−':'+'}</span><span class="nm">${esc(it.n)}<small>${sub.length?sub.length+' item':'tiada senarai'}</small></span></button>${sub.length?`<span class="amt ${c}">${rm(it.a)}</span>`:amtBtn('lists|'+id+'|'+i+'|a',it.a,c)}${delBtn('lists|'+id+'|'+i,it.n)}</div>`+
     (op?`<div class="sub">`+(sub.length?sub.map((x,j)=>`<div class="row"><span class="nm">${esc(x.n)}</span>${amtBtn('lists|'+id+'|'+i+'|a|'+j,x.a)}${delBtn('lists|'+id+'|'+i+'|'+j,x.n)}</div>`).join(''):`<p class="note">Tiada senarai untuk hutang ni.</p>`)+addRow('sub|'+id+'|'+i,'Item hutang baru')+`</div>`:'')}).join(''):`<p class="note">Belum ada rekod. Tekan Edit untuk tambah.</p>`)+addRow('lists|'+id,'Nama hutang baru')+`</div>`}
function ansCard(id,d){const its=d.items||[],c=pc(d.w),cell=(i,f,v)=>`<td><button class="lk num" data-amt="lists|${id}|${i}|${f}">${v==null?'isi':n2(v)}</button></td>`;
  return`<div class="card"><div class="head"><h2>${esc(d.title)}</h2><span class="tot">${rm(sum(its.map(i=>i.balance)))}</span></div>`+
   (its.length?`<div class="scroll"><table><thead><tr><th>Item</th><th>Jumlah Monthly</th><th>Balance Debt</th><th>Total Debt</th>${S.edit?'<th></th>':''}</tr></thead><tbody>`+
     its.map((it,i)=>`<tr><td><i class="dot" style="background:var(--c${d.w==='s'?'s':'m'})"></i>${esc(it.n)}</td>${cell(i,'monthly',it.monthly)}${cell(i,'balance',it.balance)}${cell(i,'total',it.total)}${S.edit?`<td>${delBtn('lists|'+id+'|'+i,it.n)}</td>`:''}</tr>`).join('')+`</tbody></table></div>`:`<p class="note">Belum ada ansuran. Tekan Edit untuk tambah.</p>`)+addRow('lists|'+id,'Nama item ansuran')+`</div>`}
function vDebt(){if(!S.ready)return wait();const o=['debt-syafiq','ans-syafiq','debt-mira','ans-mira'];
  return o.filter(L).map(id=>id.startsWith('ans')?ansCard(id,L(id)):debtCard(id,L(id))).join('')+`<p class="note">Tekan satu hutang untuk buka senarainya, tekan lagi untuk tutup. Tekan nombor untuk ubah.</p>`}

function vYearly(){const ys=[2026,2025,2024,2023,2022,2021,2020,2019,2018],M0=yearModel(S.year),M={groups:M0.groups.filter(G=>S.fp==='b'||(S.fp==='s'?/SYAFIQ/i:/MIRA/i).test(G.name))};
  let h=`<div class="chips">${ys.map(y=>`<button class="pill" data-year="${y}" aria-pressed="${y===S.year}">${y}</button>`).join('')}</div>`;
  if(!M.groups.length)return h+`<div class="card"><p class="note">${M0.groups.length?'Tiada rekod atas nama '+PN[S.fp]+' untuk tahun ni. Tengok tab Bersama.':S.year===2026?esc(S.msg):'Tiada rekod.'}</p></div>`;
  M.groups.forEach(G=>{const mt=MN.map((_,k)=>sum(G.items.map(i=>i.a[k])));
    h+=`<div class="card"><div class="head"><h2><i class="dot" style="background:${gcol(G.name)}"></i>${esc(G.name)}</h2><span class="tot">${rm(sum(mt))}</span></div><div class="scroll"><table><thead><tr><th>Bil</th>${MN.map(x=>`<th>${x}</th>`).join('')}<th>Jumlah</th></tr></thead><tbody>`+
    G.items.filter(i=>i.a.some(v=>v!=null)).map(it=>`<tr><td>${esc(it.n)}</td>${it.a.map((v,k)=>v==null?'<td></td>':`<td class="${it.p[k]?'pd':'un'}">${n2(v)}${it.p[k]&&Math.abs(it.pa[k]-v)>0.009?`<small>bayar ${n2(it.pa[k])}</small>`:''}</td>`).join('')}<td>${n2(sum(it.a))}</td></tr>`).join('')+
    `</tbody><tfoot><tr><td>Jumlah</td>${mt.map(v=>`<td>${v?n2(v):''}</td>`).join('')}<td>${n2(sum(mt))}</td></tr></tfoot></table></div></div>`});
  return h+`<p class="note">✓ = dah bayar. Merah = tiada rekod bayar.${S.year<2021?' Tahun ni nombor atas ialah bajet; "bayar" ialah jumlah sebenar.':''}</p>`}

function vHome(){const{y,m}=S.cal,first=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate(),by={};
  Object.values(S.events).forEach(e=>(by[e.date]=by[e.date]||[]).push(e));
  let cells=DAYS.map(d=>`<div class="wd">${d.slice(0,3)}</div>`).join('')+'<div></div>'.repeat(first);
  for(let d=1;d<=dim;d++){const k=y+'-'+pad(m+1)+'-'+pad(d),ev=(by[k]||[]).sort((a,b)=>(a.time||'')<(b.time||'')?-1:1);
    cells+=`<button class="day ${k===TODAY?'today':''} ${k===S.sel?'sel':''}" data-day="${k}" aria-label="${d} ${MFULL[m]}${ev.length?', '+ev.length+' acara':''}"><span class="n">${d}</span>${ev.slice(0,2).map(e=>`<span class="ev ${e.tent?'tent':''}" style="--evc:${evCol(e.type||'lain')}">${esc(e.title)}</span>`).join('')}${ev.length>2?`<span class="more">+${ev.length-2}</span>`:''}</button>`}
  if(wkid())return famCard()+kTiles(wme())+kidToday(wme());
  let h=(S.evf?evForm():'')+famCard()+inboxCard()+menuHomeCard()+(S.ready?upcomingCard()+checkAllCard():'')+taxAlert()+`<div class="card"><div class="head"><h2>${MFULL[m]} ${y}</h2><div style="display:flex;gap:8px"><button class="round" data-cal="-1" aria-label="Bulan sebelum">‹</button><button class="round" data-cal="1" aria-label="Bulan depan">›</button></div></div><div class="cal">${cells}</div>${calLegend()}</div>`;
  const list=Object.entries(S.events).filter(([,e])=>S.sel?e.date===S.sel:e.date>=TODAY).sort((a,b)=>a[1].date===b[1].date?((a[1].time||'')<(b[1].time||'')?-1:1):a[1].date<b[1].date?-1:1);
  h+=`<div class="card"><div class="head"><h2>${S.sel?dLab(S.sel):'Semua plan akan datang'}</h2><div class="hr">${S.sel?`<button class="lk" data-day="">Tengok semua</button>`:''}<button class="sedit" data-evnew="">+ Plan</button></div></div>`+
   (!S.ready?`<p class="note">${esc(S.msg)}</p>`:list.length?list.map(([id,e])=>evRow(id,e)).join(''):`<p class="note">${S.sel?'Tiada plan pada hari ni.':'Belum ada plan akan datang.'}</p>`)+
   `<p class="note" style="margin-top:6px">Tekan plan untuk ubah jenis, warna atau orang. Tekan pill untuk tukar Tentative ↔ Confirm.</p></div>`+datesCard();
  return h}

function vCheck(){if(!S.ready)return wait();const d=L('checklist')||{items:[]},its=d.items||[],dn=its.filter(i=>i.done).length;
  return`<div class="card"><div class="head"><h2>Checklist kita</h2><span class="tot">${dn} / ${its.length}</span></div>`+
   (its.length?its.map((it,i)=>`<div class="row ${it.done?'paid':''}"><label><input type="checkbox" id="k-${i}" data-chk="c|${i}" ${it.done?'checked':''}><span class="nm">${esc(it.n)}</span></label>${it.for&&PC[it.for]?`<span class="who2 ${PC[it.for]}">${esc(pname(it.for))}</span>`:''}${delBtn('lists|checklist|'+i,it.n)}</div>`).join(''):`<p class="note">Belum ada apa-apa. Tambah benda yang kena buat atau beli di bawah.</p>`)+
   `<div class="add"><input class="txt" id="add-check" placeholder="Tambah item" maxlength="80" autocomplete="off"><select class="txt sel" id="add-for" aria-label="Untuk siapa"><option value="">Semua</option>${PPL.map(x=>`<option value="${x[0]}">${esc(pname(x[0]))}</option>`).join('')}</select><button class="btn" data-add="check">Tambah</button></div></div>`}

function vGoals(){if(!S.ready)return wait();const gs=byOrder(S.goals);
  let h=gs.map(([id,g])=>{const s=+g.s||0,m=+g.m||0,t=+g.target||0,pct=t?Math.min(100,(s+m)/t*100):0,ps=t?Math.min(100,s/t*100):0,pm=Math.min(100-ps,t?m/t*100:0);
    return`<div class="card"><div class="head"><h2>${esc(g.name)}</h2>${S.edit?`<button class="del" data-deldoc="goals|${id}" aria-label="Buang ${esc(g.name)}">×</button>`:`<span class="tot">${Math.round(pct)}%</span>`}</div>
     <div><b class="hero">${rm(s+m)}</b> <small class="of">daripada <button class="lk" data-amt="goals|${id}||target">${t?rm(t):'set goal'}</button></small></div>
     <div class="gbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}"><i style="width:${ps}%;background:var(--cs)"></i><i style="width:${pm}%;background:var(--cm)"></i><span class="knob" style="left:${pct}%"></span></div>
     <div class="two"><label class="fld ps" for="g-${id}-s">Syafiq<input class="gin" id="g-${id}-s" data-gin="${id}|s" type="text" inputmode="decimal" value="${s||''}" placeholder="0.00"></label><label class="fld pm" for="g-${id}-m">Mira<input class="gin" id="g-${id}-m" data-gin="${id}|m" type="text" inputmode="decimal" value="${m||''}" placeholder="0.00"></label></div>
     ${t>s+m?`<p class="note">Baki ${rm(t-s-m)} lagi.</p>`:t?`<p class="hand">Goal tercapai ✓</p>`:''}</div>`}).join('');
  if(!gs.length)h+=`<div class="card"><p class="note">Belum ada goal. Tambah goal simpanan pertama di bawah, contohnya Tabung Haji atau cuti keluarga.</p></div>`;
  return h+`<div class="card"><div class="head"><h2>Goal baru</h2></div><div class="add wrapf" style="padding-top:0"><input class="txt" id="goal-name" placeholder="Nama goal" maxlength="50" autocomplete="off"><input class="txt date" id="goal-target" type="text" inputmode="decimal" placeholder="Jumlah RM" aria-label="Jumlah goal RM"><button class="btn" data-add="goal">Tambah</button></div></div>
   <p class="note">Goals disimpan dalam app sahaja, tak masuk Sheet.</p>`}

/* Keluarga: family header on Home, profile page, dashboards for each person. Data in db collection `family` (syafiq, mira, maliq, musa, meta). */
const PPL=[['syafiq','Syafiq','adult'],['mira','Mira','adult'],['maliq','Maliq','kid'],['musa','Musa','kid']];
const PC={syafiq:'ps',mira:'pm',maliq:'pk1',musa:'pk2'};
const PTH={syafiq:'syafiq',maliq:'maliq',musa:'musa'};   /* tema tab sendiri (27 Nov 2026): Mira dan Home kekal */
const PPOW='<svg class="ppow" viewBox="0 0 100 80" aria-hidden="true"><path d="M50 2l9 18 20-10-6 21 24 4-20 13 14 18-23-4-4 22-14-17-15 15-2-22-23 2 15-17L5 30l22-3-5-21 18 11z" fill="#FFD23F" stroke="#1B1B1F" stroke-width="3" stroke-linejoin="round"/><text x="50" y="49" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="22" fill="#E8443A" stroke="#1B1B1F" stroke-width="1">POW!</text></svg>';
const KT=[['ring','Ringkasan'],['sekolah','Jadual sekolah'],['wallet','Duit belanja'],['belanja','Perbelanjaan'],['butiran','Butiran'],['umur','Umur & Sekolah'],['aktiviti','Aktiviti'],['info','Info penting']];
const HARI=['Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu','Ahad'];
/* Panduan umum ikut umur (umur yang dicapai dalam tahun tu). Boleh diubah dalam app. */
const MST=[[0,'Lahir · mula jadual imunisasi bayi di klinik (ikut buku rekod kesihatan)'],[1,'Suntikan MMR dan dos susulan ikut jadual klinik'],[4,'Boleh mula tadika'],[5,'Prasekolah (umur 5 hingga 6)'],
 [6,'Daftar Tahun 1 secara online untuk masuk sekolah tahun depan'],[7,'Tahun 1 · mula KAFA · suntikan MR dan DT di sekolah'],[8,'Tahun 2'],[9,'Tahun 3'],[10,'Tahun 4 · UPKK (ujian KAFA)'],[11,'Tahun 5'],
 [12,'Tahun 6 · UASA akhir sekolah rendah · mohon MRSM / SBP · buat MyKad di JPN (wajib umur 12)'],[13,'Tingkatan 1'],[14,'Tingkatan 2'],[15,'Tingkatan 3 · Pentaksiran Tingkatan 3 · suntikan tetanus di sekolah'],
 [16,'Tingkatan 4 · pilih aliran'],[17,'Tingkatan 5 · SPM · boleh ambil lesen memandu'],[18,'Lepas SPM · masuk senarai pemilih secara automatik']];
let assets=null,dls=null;
const FM=id=>S.family[id]||{};
const pname=id=>FM(id).name||(PPL.find(x=>x[0]===id)||[,'?'])[1];
const T0=()=>new Date(TODAY+'T00:00');
const dm=d=>d.getDate()+' '+MN[d.getMonth()];
const fmtD=s=>{if(!s)return'—';const d=new Date(s+'T00:00');return isNaN(d)?esc(s):d.getDate()+' '+MN[d.getMonth()]+' '+d.getFullYear()};
function nextOcc(s){if(!s)return null;const[y,m,d]=s.split('-').map(Number);if(!y||!m||!d)return null;const t=T0();let n=new Date(t.getFullYear(),m-1,d);if(n<t)n=new Date(t.getFullYear()+1,m-1,d);return{date:n,days:Math.round((n-t)/864e5),turns:n.getFullYear()-y}}
function ageY(s){if(!s)return null;const b=new Date(s+'T00:00'),t=T0();let a=t.getFullYear()-b.getFullYear();if(t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()))a--;return a}
function monthsSince(s){const b=new Date(s+'T00:00'),t=T0();return(t.getFullYear()-b.getFullYear())*12+t.getMonth()-b.getMonth()-(t.getDate()<b.getDate()?1:0)}
function ago(s){const m=monthsSince(s);return m<0?'akan datang':m===0?'bulan ni':m<12?m+' bulan lepas':Math.floor(m/12)+' tahun lepas'}
function fmtT(t){const[h,m]=String(t).split(':').map(Number);if(isNaN(h))return esc(t);const p=h<12?'pagi':h<14?'tengah hari':h<19?'petang':'malam';return((h%12)||12)+':'+pad(m||0)+' '+p}
function schoolLabel(by,y){const a=y-by;return a>=7&&a<=12?'Tahun '+(a-6):a>=13&&a<=17?'Tingkatan '+(a-12):a===5||a===6?'Prasekolah':''}
function genMs(id){const p=FM(id);if(!p.dob)return[];const by=+p.dob.slice(0,4);return MST.map(([a,t])=>({y:by+a,t}))}
const bUrl=o=>o.id?'blob/'+encodeURIComponent(o.id):o.url;
function av(id,sz,tag){const p=FM(id),t=tag||'button',nm=pname(id);
  return`<${t} class="av ${PC[id]}" ${t==='button'?`data-person="${id}" aria-label="Buka dashboard ${esc(nm)}"`:''} style="--sz:${sz}px">${p.photo?`<img src="${esc(bUrl(p.photo))}" alt="">`:esc(nm.slice(0,2))}</${t}>`}

/* Section edit: every section has its own Edit button. S.fe = {key, d: draft} */
const isFe=k=>!!(S.fe&&S.fe.key===k);
const sh=(title,key,right)=>`<div class="head"><h2>${title}</h2><div class="hr">${right||''}<button class="sedit ${isFe(key)?'on':''}" data-fe="${key}">${isFe(key)?(S.fe.d==null?'Siap':'Batal'):'Edit'}</button></div></div>`;
const fin=(path,val,ph,type,cls)=>`<input class="txt ${cls||''}" data-fd="${path}" type="${type||'text'}" ${type?'':'inputmode="text"'} value="${esc(val??'')}" placeholder="${esc(ph||'')}" aria-label="${esc(ph||path)}" autocomplete="off" maxlength="200">`;
const fl=(label,inner,full)=>`<label class="fl ${full?'full':''}">${label}${inner}</label>`;
const acts=()=>`<div class="acts"><button class="btn ghost" data-fcancel="1">Batal</button><button class="btn" data-fsave="1">Simpan</button></div>`;
function rowsEd(fields,extra){return S.fe.d.map((r,i)=>`<div class="er">${fields.map(f=>f.sel?`<select class="txt sm" data-fd="${i}.${f.k}" aria-label="${f.ph}">${f.sel.map((o,j)=>`<option value="${j+1}" ${+r[f.k]===j+1?'selected':''}>${o}</option>`).join('')}</select>`:fin(i+'.'+f.k,r[f.k],f.ph,f.type,f.cls)).join('')}<button class="del" data-frm="${i}" aria-label="Buang baris">×</button></div>`).join('')+
  `<div class="acts" style="justify-content:space-between"><span style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost" data-fadd="1">+ Tambah</button>${extra||''}</span><span style="display:flex;gap:8px"><button class="btn ghost" data-fcancel="1">Batal</button><button class="btn" data-fsave="1">Simpan</button></span></div>`}
function feSrc(key){const[k,id]=key.split(':'),p=FM(id),M=S.family.meta||{},t=p.det||{},cp=a=>(a||[]).map(x=>Object.assign({},x));
  switch(k){case'p':return{name:p.name||'',dob:p.dob||''};case'anniv':return{anniv:M.anniv||''};case'dates':return cp(M.dates);
    case'det':return{jantina:t.jantina||'',berat:t.berat||'',tinggi:t.tinggi||'',kaki:t.kaki||'',kasut:t.kasut||'',baju:t.baju||'',dada:t.dada||'',pinggang:t.pinggang||'',seluar:t.seluar||''};
    case'kes':return{vaksin:t.vaksin||'',vaksinD:t.vaksinD||'',dental:t.dental||'',dentalN:t.dentalN||''};
    case'ms':return cp(p.ms||genMs(id));case'wk':return cp(p.wk);case'info':return cp(p.info);case'hajat':return cp(p.hajat);default:return null}}
const BLANK={ms:()=>({y:'',t:''}),wk:()=>({d:'1',t:'',n:'',p:''}),info:()=>({t:'',v:''}),hajat:()=>({n:''}),dates:()=>({n:'',date:''})};
function startFe(key){S.fe=isFe(key)?null:{key,d:feSrc(key)}}
function saveFe(){const{key,d}=S.fe,[k,id]=key.split(':');S.fe=null;const tr=v=>String(v??'').trim();
  const clean=a=>a.map(r=>{const o={};Object.keys(r).forEach(x=>o[x]=tr(r[x]));return o});
  if(k==='anniv'||k==='dates'){const M=S.family.meta=S.family.meta||{};if(k==='anniv')M.anniv=d.anniv||null;else M.dates=clean(d).filter(x=>x.n&&x.date);return save('family','meta')}
  const p=S.family[id]=S.family[id]||{};
  if(k==='p'){p.name=tr(d.name)||null;p.dob=d.dob||null}
  else if(k==='det'||k==='kes'){p.det=Object.assign(p.det||{},clean([d])[0]);if(k==='det'){p.det.upd=TODAY;const u=p.ukur=p.ukur||[],e={d:TODAY,berat:p.det.berat||'',tinggi:p.det.tinggi||''},l=u[u.length-1];if(e.berat||e.tinggi){if(l&&l.d===TODAY)u[u.length-1]=e;else if(!l||l.berat!==e.berat||l.tinggi!==e.tinggi)u.push(e)}}}
  else if(k==='ms')p.ms=clean(d).map(x=>({y:parseInt(x.y,10)||null,t:x.t})).filter(x=>x.y&&x.t).sort((a,b)=>a.y-b.y);
  else if(k==='wk')p.wk=clean(d).filter(x=>x.n);
  else if(k==='info')p.info=clean(d).filter(x=>x.t||x.v);
  else if(k==='hajat')p.hajat=clean(d).filter(x=>x.n);
  save('family',id)}

function impDates(){const o=[];
  PPL.forEach(([id])=>{const p=FM(id),x=nextOcc(p.dob);o.push({ic:'🎂',cls:PC[id],n:'Birthday '+pname(id),x,sub:x?dm(x.date)+' · genap '+x.turns+' tahun · sekarang '+fYMD(ymd(p.dob),1):'Tarikh lahir belum diisi'})});
  const M=S.family.meta||{},ax=nextOcc(M.anniv);o.push({ic:'💍',cls:'pa',n:'Anniversary kahwin',x:ax,sub:ax?dm(ax.date)+' · '+ax.turns+' tahun':'Tarikh kahwin belum diisi'});
  (M.dates||[]).forEach(d=>{const x=nextOcc(d.date);if(x)o.push({ic:'📌',cls:'',n:d.n,x,sub:dm(x.date)+' · setiap tahun'})});
  return o.sort((a,b)=>(a.x?a.x.days:1e4)-(b.x?b.x.days:1e4))}
const cdTxt=x=>x?(x.days===0?'Hari ni':x.days===1?'Esok':x.days+' hari'):'?';
const drow=d=>`<div class="row"><span class="ic ${d.cls}">${d.ic}</span><span class="nm">${esc(d.n)}<small>${esc(d.sub)}</small></span><span class="cd ${d.x&&d.x.days<=1?'now':''}">${cdTxt(d.x)}</span></div>`;

const LUV='<svg class="luv" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 41C10 31 5 23 7 15c2-7 11-9 17-1 6-8 15-6 17 1 2 8-3 16-17 26z" fill="#F4A9B8" stroke="#9A4F5D" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 16c1-3 4-4 6-3" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>';
const HAT='<svg class="conf" viewBox="0 0 100 44" aria-hidden="true"><g stroke="#2E2723" stroke-width=".8"><rect x="6" y="20" width="6" height="4" fill="#F4A9B8" transform="rotate(20 9 22)"/><circle cx="20" cy="8" r="3" fill="#F7E8AE"/><rect x="30" y="26" width="5" height="5" fill="#A2C3F2" transform="rotate(-15 32 28)"/><path d="M80 8l3 5-6 1z" fill="#C8B2ED"/><circle cx="92" cy="24" r="3" fill="#F5C196"/><rect x="70" y="24" width="6" height="4" fill="#BFE6D3" transform="rotate(30 73 26)"/></g></svg><svg class="hat" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 6L8 35h24z" fill="#F7C6D0" stroke="#2E2723" stroke-width="2" stroke-linejoin="round"/><path d="M15 18l10 5M12 26l15 6" stroke="#A2C3F2" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="5" r="4" fill="#F7E8AE" stroke="#2E2723" stroke-width="2"/></svg>';
function frame(id,kid){const p=FM(id),nm=pname(id),x=nextOcc(p.dob),a=ageY(p.dob),bd=!!(x&&x.days===0);
  return`<button class="fr ${kid?'kid':''}" data-person="${id}" aria-label="Buka dashboard ${esc(nm)}">${bd?HAT:''}<span class="ph ${PC[id]}">${p.photo?`<img src="${esc(bUrl(p.photo))}" alt="">`:esc(nm.slice(0,2))}</span><span class="frn">${esc(nm)}</span>${kid&&a!=null?`<span class="age">${a} thn${x&&x.days>0&&x.days<=14?' · nak '+(a+1)+'!':''}</span>`:''}</button>`}
function famCard(){const M=S.family.meta||{},an=M.anniv,o=an?ymd(an):null,days=an?Math.round((T0()-new Date(an+'T00:00'))/864e5):null;
  const ds=impDates().filter(d=>d.x).slice(0,2),ck=((L('checklist')||{}).items||[]).filter(i=>!i.done).length;
  return`<div class="card fam"><div class="famg"><div class="frames"><div class="cpl">${frame('syafiq')}${frame('mira')}${LUV}</div>${frame('maliq',1)}${frame('musa',1)}</div>
   <div class="side"><div class="sbox"><span class="tog">♡ Together ♡</span><span><b>${days!=null?days.toLocaleString('en-MY'):'?'}</b> <small>hari</small></span>${o?`<small>${o.y} thn ${o.m} bln</small>`:''}</div>
   <div class="sbox"><span class="lab">Tarikh penting</span>${ds.length?ds.map(d=>`<span class="dt"><span aria-hidden="true">${d.ic}</span><span>${esc(d.n.replace(' kahwin','').replace('Birthday ',''))} · ${d.x.days===0?'hari ni!':d.x.days===1?'esok!':d.x.days+' hari'}</span></span>`).join(''):'<small>Belum diisi</small>'}</div>
   <div class="sbox ckb"><span><b class="ckn">Checklist</b><small>${ck} belum</small></span><button class="sedit" data-main="check">Buka</button></div></div></div>${moodBox()}
   <button class="lk" data-person="profile">Butiran keluarga</button></div>
`}
function datesCard(){return`<div class="card"><div class="head"><h2>Tarikh penting</h2><button class="sedit" data-person="profile">Edit</button></div>${impDates().map(drow).join('')}</div>`}

function personForm(id){const p=FM(id),d=S.fe.d;
  return`<div class="row" style="border:0">${av(id,64,'span')}<button class="btn ghost" data-upl="photo|${id}">${p.photo?'Tukar gambar':'Upload gambar'}</button></div>
   <div class="form">${fl('Nama',fin('name',d.name,(PPL.find(x=>x[0]===id)||[])[1]))}${fl('Tarikh lahir',fin('dob',d.dob,'','date'))}</div>${acts()}`}
function heroCard(id){const p=FM(id),nm=pname(id),a=ageY(p.dob),x=nextOcc(p.dob),k='p:'+id;
  if(isFe(k))return`<div class="card">${sh(esc(nm),k)}${personForm(id)}</div>`;
  if(PTH[id]){const im=p.cut||p.photo,role={syafiq:'Apak',maliq:'Abang',musa:'Adik'}[id];
    return`<div class="card phero2"><div class="ppor"><div class="pfr"></div>${im?`<img class="pcut ${p.cut?'':'nocut'}" src="${esc(bUrl(im))}" alt="${esc(nm)}">`:`<span class="pini">${esc(nm.slice(0,2))}</span>`}${id==='maliq'?PPOW:''}</div>
     <div class="pside"><div class="ptop"><span class="ptag">${role}</span><button class="sedit" data-fe="${k}">Edit</button></div><h2 class="pnm">${esc(nm)}</h2>
     <p class="psub">${p.dob?fmtD(p.dob)+(a!=null?' · '+a+' thn':''):'Tarikh lahir belum diisi'}${x?'<br>'+(x.days===0?'birthday hari ni! 🎉':x.days===1?'🎂 nak '+((a||0)+1)+' thn esok!':'birthday lagi '+x.days+' hari'):''}</p></div></div>`}
  return`<div class="card phero"><div style="display:flex;justify-content:flex-end"><button class="sedit" data-fe="${k}">Edit</button></div>${av(id,96,'span')}<h2>${esc(nm)}</h2>
   <p class="hand">${x?fYMD(ymd(p.dob))+'<br>'+(x.days===0?'birthday hari ni! 🎉':'birthday lagi '+x.days+' hari'):'Tarikh lahir belum diisi'}</p></div>`}

function ckCard(id){const its=((L('checklist')||{}).items||[]).map((it,i)=>[it,i]).filter(([it])=>it.for===id),k='ck:'+id,ed=isFe(k),dn=its.filter(([it])=>it.done).length;
  return`<div class="card">${sh('Checklist '+esc(pname(id)),k,`<span class="tot">${dn} / ${its.length}</span>`)}`+
   (its.length?its.map(([it,i])=>`<div class="row ${it.done?'paid':''}"><label><input type="checkbox" id="pk-${i}" data-chk="c|${i}" ${it.done?'checked':''}><span class="nm">${esc(it.n)}</span></label>${ed?`<button class="del" data-del="lists|checklist|${i}" aria-label="Buang ${esc(it.n)}">×</button>`:''}</div>`).join(''):`<p class="note">Belum ada item untuk ${esc(pname(id))}.</p>`)+
   `<div class="add"><input class="txt" id="add-check-${id}" placeholder="Tambah item" maxlength="80" autocomplete="off"><button class="btn" data-add="check|${id}">Tambah</button></div></div>`}

function kidList(id){const nm=pname(id).toLowerCase();return sec('commitment').find(([,d])=>{const t=String(d.title||'').toLowerCase();return t.includes(nm)||t.includes(id)})}
function kRing(id){const p=FM(id),nm=pname(id),cl=kidList(id),its=cl?(cl[1].items||[]):[],tot=sum(its.map(i=>i.a)),wk=p.wk||[],y=now.getFullYear(),by=p.dob?+p.dob.slice(0,4):null;
  const ms=p.ms||genMs(id),cur=ms.filter(m=>m.y===y),nxt=ms.filter(m=>m.y===y+1),lab=by?(schoolLabel(by,y)||'Umur '+(y-by)):'?';
  let h=heroCard(id)+kEsok(id,true)+kTiles(id)+chToday(id)+personEvCard(id);
  h+=`<div class="card"><div class="head"><h2>Komitmen ${esc(nm)}</h2><div class="hr"><span class="tot">${rm(tot)}</span><button class="sedit" data-goto="finance|commitment">Edit</button></div></div>`+
   (its.length?its.map(i=>`<div class="row"><span class="nm">${esc(i.n)}</span><span class="amt ${pc(i.w)}">${i.a==null?'—':rm(i.a)}</span></div>`).join('')+`<div class="leg"><span><i style="background:var(--cs)"></i>Syafiq bayar</span><span><i style="background:var(--cm)"></i>Mira bayar</span></div>`
   :`<p class="note">${cl?'Belum ada item dalam kad '+esc(cl[1].title)+'.':'Tiada kad komitmen untuk '+esc(nm)+' lagi.'}</p>`)+`</div>`;
  h+=`<div class="card"><div class="head"><h2>Tahun ni &amp; tahun depan</h2><button class="sedit" data-ptab="umur">Edit</button></div>`+
   (cur.length||nxt.length?cur.map(m=>`<div class="row"><span class="nm">${esc(m.t)}<small>${m.y} · tahun ni</small></span></div>`).join('')+nxt.map(m=>`<div class="row"><span class="nm">${esc(m.t)}<small>${m.y} · tahun depan</small></span></div>`).join('')
   :`<p class="note">${p.dob?'Tiada apa-apa dalam senarai untuk tahun ni dan tahun depan.':'Isi tarikh lahir dulu.'}</p>`)+`</div>`;
  return h+ckCard(id)}
const kv=(l,v,u)=>`<div><span>${l}</span><b>${v?esc(v)+(u&&/^[\d.,\s]+$/.test(v)?u:''):'—'}</b></div>`;
function kBut(id){const p=FM(id),t=p.det||{},nm=pname(id),nk='nric:'+id,nr=p.nric,img=nr&&String(nr.type||'').startsWith('image/');
  let h=`<div class="card">${sh('Salinan IC / MyKid',nk)}`+
   (nr?`<div class="row"><span class="ic">📄</span><span class="nm">${esc(nr.name||'Salinan IC')}<small>${nr.at?'Upload '+fmtD(nr.at):''}</small></span><button class="amt" data-dl="${id}">Muat turun</button></div>`+
     (img?`<button class="lk" data-view="${id}">${S.open['v'+id]?'Sorok gambar':'Tengok gambar'}</button>${S.open['v'+id]?`<img class="thumb" src="${esc(bUrl(nr))}" alt="Salinan IC ${esc(nm)}">`:''}`:'')
    :`<p class="note">Belum ada salinan. Tekan Edit, kemudian Upload (gambar atau PDF).</p>`)+
   (isFe(nk)?`<div class="acts"><button class="btn" data-upl="nric|${id}">${nr?'Tukar fail':'Upload salinan'}</button>${nr?`<button class="btn ghost" data-nrm="${id}">Buang dari app</button>`:''}</div>`:'')+`</div>`;
  const dk='det:'+id;
  h+=`<div class="card">${sh('Badan &amp; saiz',dk)}`+(isFe(dk)?`<div class="form">${fl('Jantina',`<select class="txt" data-fd="jantina"><option value="">Pilih</option><option value="L" ${S.fe.d.jantina==='L'?'selected':''}>Lelaki</option><option value="P" ${S.fe.d.jantina==='P'?'selected':''}>Perempuan</option></select>`)}${fl('Berat (kg)',fin('berat',S.fe.d.berat,'cth 25'))}${fl('Tinggi (cm)',fin('tinggi',S.fe.d.tinggi,'cth 128'))}${fl('Panjang kaki (cm)',fin('kaki',S.fe.d.kaki,'cth 19.5'))}${fl('Saiz kasut sekarang',fin('kasut',S.fe.d.kasut,'cth UK 13 atau EU 32'))}${fl('Saiz baju sekarang',fin('baju',S.fe.d.baju,'cth 8-9 thn / M'))}${fl('Lilitan dada (cm)',fin('dada',S.fe.d.dada,'cth 66'))}${fl('Pinggang (cm)',fin('pinggang',S.fe.d.pinggang,'cth 58'))}${fl('Panjang seluar (cm)',fin('seluar',S.fe.d.seluar,'pinggang ke buku lali'),1)}</div><p class="note" style="margin-top:6px">Ukur kaki: berdiri atas kertas, tanda tumit dan jari paling panjang.</p>${acts()}`
   :`<div class="kv">${kv('Berat',t.berat,' kg')}${kv('Tinggi',t.tinggi,' cm')}${kv('Saiz kasut',t.kasut)}${kv('Saiz baju',t.baju)}${kv('Panjang kaki',t.kaki,' cm')}${kv('Jantina',t.jantina==='L'?'Lelaki':t.jantina==='P'?'Perempuan':'')}</div>${t.upd?`<p class="note" style="margin-top:8px">Dikemaskini ${fmtD(t.upd)}</p>`:''}`)+`</div>`+growthCard(id)+sizeCard(id);
  const hk='kes:'+id;
  h+=`<div class="card">${sh('Kesihatan',hk)}`+(isFe(hk)?`<div class="form">${fl('Vaksin terakhir',fin('vaksin',S.fe.d.vaksin,'cth MR dan DT'),1)}${fl('Tarikh vaksin',fin('vaksinD',S.fe.d.vaksinD,'','date'))}${fl('Dental check terakhir',fin('dental',S.fe.d.dental,'','date'))}${fl('Nota dental',fin('dentalN',S.fe.d.dentalN,'cth klinik mana, tampal gigi'),1)}</div>${acts()}`
   :`<div class="row"><span class="ic">💉</span><span class="nm">${t.vaksin?esc(t.vaksin):'Vaksin terakhir belum diisi'}<small>${t.vaksinD?fmtD(t.vaksinD)+' · '+ago(t.vaksinD):'Tarikh belum diisi'}</small></span></div>
    <div class="row"><span class="ic">🦷</span><span class="nm">Dental check terakhir<small>${t.dental?fmtD(t.dental)+' · '+ago(t.dental):'Belum diisi'}${t.dentalN?' · '+esc(t.dentalN):''}</small></span>${t.dental&&monthsSince(t.dental)>=6?'<span class="cd">Dah 6 bulan</span>':''}</div>`)+`</div>`;
  return h}
function kUmur(id){const p=FM(id),k='ms:'+id,y=now.getFullYear(),by=p.dob?+p.dob.slice(0,4):null;
  if(!by&&!p.ms&&!isFe(k))return`<div class="card"><p class="note">Isi tarikh lahir ${esc(pname(id))} dulu. Lepas tu senarai ikut umur keluar sendiri.</p><div class="acts"><button class="btn" data-fill="${id}">Isi tarikh lahir</button></div></div>`;
  let h=`<div class="card">${sh('Ikut umur di Malaysia',k)}`;
  if(isFe(k))h+=rowsEd([{k:'y',ph:'Tahun',cls:'sm'},{k:'t',ph:'Apa perlu tahu / buat'}],by?`<button class="btn ghost" data-freset="${id}">Set semula ikut umur</button>`:'');
  else{const ms=p.ms||genMs(id),past=ms.filter(m=>m.y<y),rest=ms.filter(m=>m.y>=y),op=!!S.open['past'+id];
    const tl=m=>{const st=m.y<y?'past':m.y===y?'now':m.y===y+1?'next':'';return`<div class="tl ${st}"><div class="yy">${m.y}<small>${by?'umur '+(m.y-by):''}</small></div><div class="grow">${esc(m.t)}${st==='now'?'<span class="tag">Tahun ni</span>':st==='next'?'<span class="tag soft">Tahun depan</span>':''}</div></div>`};
    h+=(past.length?`<button class="lk" data-view="past${id}" style="margin-bottom:6px">${op?'Sorok':'Tunjuk'} yang dah lepas (${past.length})</button>`+(op?past.map(tl).join(''):''):'')+(rest.map(tl).join('')||'<p class="note">Senarai kosong. Tekan Edit untuk tambah.</p>')}
  return h+`</div><p class="note">Panduan umum sistem sekolah dan kesihatan Malaysia. Tarikh sebenar ikut sekolah, KAFA dan klinik. Tekan Edit untuk betulkan atau tambah.</p>`}
function kAkt(id){const p=FM(id),k='wk:'+id,wk=p.wk||[];let h=`<div class="card">${sh('Aktiviti setiap minggu',k)}`;
  if(isFe(k))h+=rowsEd([{k:'d',ph:'Hari',sel:HARI},{k:'t',ph:'Masa',type:'time',cls:'sm3'},{k:'n',ph:'Aktiviti'},{k:'p',ph:'Tempat / nota'}]);
  else{const td=(now.getDay()+6)%7+1;
    h+=wk.length?HARI.map((dn,j)=>{const rs=wk.filter(r=>+r.d===j+1).sort((a,b)=>String(a.t).localeCompare(String(b.t)));
      return rs.length?`<div class="dayh ${td===j+1?'today':''}">${dn}</div>`+rs.map(r=>`<div class="row"><span class="nm">${esc(r.n)}<small>${[r.t?fmtT(r.t):'',esc(r.p||'')].filter(Boolean).join(' · ')}</small></span></div>`).join(''):''}).join('')
     :`<p class="note">Belum ada aktiviti. Tekan Edit untuk tambah, contohnya Swimming setiap Sabtu.</p>`}
  return h+'</div>'}
function infoCard(id,title,empty){const p=FM(id),k='info:'+id,its=p.info||[];let h=`<div class="card">${sh(title,k)}`;
  if(isFe(k))h+=rowsEd([{k:'t',ph:'Tajuk (cth Cikgu kelas)'},{k:'v',ph:'Isi'}]);
  else h+=its.length?its.map(r=>`<div class="row"><span class="nm">${esc(r.t)}<small style="white-space:pre-wrap">${esc(r.v)}</small></span></div>`).join(''):`<p class="note">${empty}</p>`;
  return h+'</div>'}
const kInfo=id=>infoCard(id,'Info penting','Belum ada info. Contoh: sekolah dan kelas, nama cikgu dan no. telefon, alahan, kumpulan darah, klinik.');
/* Sheets aku (28 Nov 2026): butang terus ke Google Sheet Mira. Senarai dalam db `well/sheets` {items:[{g,n,u}]}, bukan dalam repo awam, dan anak tak boleh baca. Hanya dalam halaman Mira, bila Mira sendiri buka. */
function sheetsCard(){const L=((S.well||{}).sheets||{}).items||[],G=[];if(!L.length)return'';
  L.forEach(x=>{if(!/^https:\/\/docs\.google\.com\//.test(x.u||''))return;let g=G.find(z=>z[0]===x.g);if(!g)G.push(g=[x.g,[]]);g[1].push(x)});
  return`<div class="card"><div class="head"><h2>Sheets aku</h2><span class="tot">${G.reduce((a,g)=>a+g[1].length,0)}</span></div>`+G.map(([g,xs])=>`<p class="shg">${esc(g||'Lain')}</p><div class="shl">`+
   xs.map(x=>`<a class="btn ghost shb" href="${esc(x.u)}" target="_blank" rel="noopener">${esc(x.n)}<span aria-hidden="true">↗</span></a>`).join('')+`</div>`).join('')+`</div>`}
function hajatCard(id){const p=FM(id),k='hajat:'+id,its=p.hajat||[];let h=`<div class="card">${sh('Hajat '+esc(pname(id)),k)}`;
  if(isFe(k))h+=rowsEd([{k:'n',ph:'Wishlist / nak pergi / nak buat'}]);
  else h+=its.length?its.map(r=>`<div class="row"><span class="ic">✨</span><span class="nm">${esc(r.n)}</span></div>`).join(''):`<p class="note">Hadiah atau benda yang ${esc(pname(id))} teringin. Tekan Edit untuk tambah.</p>`;
  return h+'</div>'}
function vAdult(id){const w=id==='syafiq'?'s':'m',nm=pname(id),com=[];
  sec('commitment').forEach(([,d])=>(d.items||[]).forEach(i=>{if(i.w===w)com.push(Object.assign({g:d.title},i))}));
  const ct=sum(com.map(i=>i.a)),ym=YM(),bi=((BILLS()||{items:[]}).items||[]).filter(i=>i.w===w),un=bi.filter(i=>i.a&&!(i.paid&&i.paid[ym]));
  const dv=sum(its('debt-'+id).map(dBal))+sum(its('ans-'+id).map(i=>ansCalc(i).bal||0));
  let h=heroCard(id)+`<div class="tiles"><div class="card tile"><b>${n2(ct).split('.')[0]}</b><small>RM ${esc(nm)} bayar sebulan</small></div><div class="card tile"><b>${un.length}</b><small>bill belum bayar ${MN[S.month]}</small></div><div class="card tile"><b>${n2(dv).split('.')[0]}</b><small>RM hutang</small></div></div>`+(id==='mira'&&wme()==='mira'?sheetsCard():'')+(id==='syafiq'?kDadWallet()+vWork():'')+chToday(id)+personEvCard(id);
  h+=`<div class="card"><div class="head"><h2>Komitmen ${esc(nm)}</h2><div class="hr"><span class="tot">${rm(ct)}</span><button class="sedit" data-goto="finance|commitment">Edit</button></div></div>`+
   (com.length?com.map(i=>`<div class="row"><span class="nm">${esc(i.n)}<small>${esc(i.g)}</small></span><span class="amt ${pc(w)}">${i.a==null?'—':rm(i.a)}</span></div>`).join(''):'<p class="note">Tiada komitmen.</p>')+`</div>`;
  h+=`<div class="card"><div class="head"><h2>Bill ${MN[S.month]}</h2><button class="sedit" data-goto="finance|bill">Edit</button></div>`+
   (bi.length?bi.map(i=>{const pd=!!(i.paid&&i.paid[ym]);return`<div class="row ${pd?'paid':''}"><span class="nm">${esc(i.n)}<small>${i.due?'Due '+i.due+' hb':'Due belum tahu'}</small></span><span class="cd ${pd?'now':''}">${pd?'✓ bayar':'Belum'}</span></div>`}).join(''):'<p class="note">Tiada bill atas nama '+esc(nm)+'.</p>')+`</div>`;
  return h+ckCard(id)+hajatCard(id)}
function vProfile(){let h=`<button class="back" data-person="">‹ Home</button><p class="note">Isi butiran keluarga di sini. Setiap bahagian ada butang Edit sendiri.</p>`;
  PPL.forEach(([id])=>{const p=FM(id),k='p:'+id;
    h+=`<div class="card">${sh(esc(pname(id)),k)}`+(isFe(k)?personForm(id):`<div class="row">${av(id,52,'span')}<span class="nm">${esc(pname(id))}<small>${p.dob?'Lahir '+fmtD(p.dob)+' · '+fYMD(ymd(p.dob)):'Tarikh lahir belum diisi'}</small></span><button class="amt" data-person="${id}">Dashboard ›</button></div>`)+`</div>`});
  const M=S.family.meta||{};
  h+=`<div class="card">${sh('Tarikh kahwin','anniv')}`+(isFe('anniv')?`<div class="form">${fl('Tarikh kahwin',fin('anniv',S.fe.d.anniv,'','date'),1)}</div>${acts()}`
   :`<div class="row"><span class="ic pa">💍</span><span class="nm">${M.anniv?fmtD(M.anniv):'Belum diisi'}<small>${M.anniv?fYMD(ymd(M.anniv))+' bersama':'Untuk "tahun bersama" dan countdown anniversary'}</small></span></div>`)+`</div>`;
  h+=`<div class="card">${sh('Tarikh penting lain','dates')}`+(isFe('dates')?rowsEd([{k:'n',ph:'Nama (cth Birthday Mak)'},{k:'date',ph:'Tarikh',type:'date',cls:'sm3'}])
   :(M.dates||[]).length?M.dates.map(x=>`<div class="row"><span class="ic">📌</span><span class="nm">${esc(x.n)}<small>${fmtD(x.date)} · diingatkan setiap tahun</small></span></div>`).join(''):`<p class="note">Contoh: birthday mak ayah, tarikh tunang. Semua keluar dalam Tarikh penting setiap tahun.</p>`)+`</div>`;
  return h+`<p class="note">Gambar dan salinan IC disimpan dalam app ni sahaja. Sesiapa yang kau share app ni boleh tengok.</p>`}
function vPerson(){const id=S.person;if(id==='profile')return vProfile();const P=PPL.find(x=>x[0]===id);if(!P){S.person=null;return vHome()}
  const back=`<button class="back" data-person="">‹ Home</button>`+(S.evf?evForm():'');
  if(wkid())return back+(S.ready?heroCard(id)+kTiles(id)+(wme()===id?kidToday(id)+vKSek(id).replace(/<div class="card kbag">[\s\S]*$/,''):'')+wellWeek(id):wait());
  if(!S.ready)return back+wait();
  if(P[2]==='adult')return back+vAdult(id)+wellWeek(id);
  return back+`<div class="menu glass">${KT.map(t=>`<button class="mi" data-ptab="${t[0]}" aria-pressed="${S.ptab===t[0]}">${t[1]}</button>`).join('')}</div>`+({ring:kRing,sekolah:vKSek,wallet:vKWallet,belanja:vKExp,butiran:kBut,umur:kUmur,aktiviti:kAkt,info:kInfo}[S.ptab]||kRing)(id)+(S.ptab==='ring'?wellWeek(id):'')}

/* Uploads (gambar profil dan salinan IC) and downloads */
const fileIn=document.createElement('input');fileIn.type='file';fileIn.hidden=true;document.body.appendChild(fileIn);
function pickFile(t){if(!assets)return toast('Upload belum sedia. Cuba lagi sekejap.');fileIn.dataset.t=t;fileIn.accept=t.startsWith('photo')?'image/*':'image/*,application/pdf';fileIn.value='';fileIn.click()}
function shrink(f,max){return new Promise((res,rej)=>{const u=URL.createObjectURL(f),im=new Image();
  im.onload=()=>{const s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(b=>b?res(b):rej(),'image/jpeg',.86)};
  im.onerror=()=>{URL.revokeObjectURL(u);rej()};im.src=u})}
fileIn.addEventListener('change',async()=>{const f=fileIn.files&&fileIn.files[0],[kind,id]=String(fileIn.dataset.t||'').split('|');if(!f||!id)return;
  try{const blob=await rzOpen(f,kind==='photo'?'photo':'doc');if(!blob)return;toast('Tengah upload…');const r=await assets.upload(blob),p=S.family[id]=S.family[id]||{};
    if(kind==='photo')p.photo={id:r.id};else p.nric={id:r.id,name:f.name,type:r.contentType||f.type||'',at:TODAY};
    save('family',id);toast('Siap upload.');render(true)}
  catch(e){toast(e&&e.code==='too_large'?'Fail terlalu besar (had 20 MB).':e&&e.code==='unsupported_type'?'Jenis fail ni tak boleh. Guna gambar atau PDF.':'Upload tak berjaya. Cuba lagi.')}});
async function dlNric(id){const n=FM(id).nric;if(!n)return;const url=bUrl(n),ty=String(n.type||'');
  const ext=/pdf/.test(ty)?'pdf':/png/.test(ty)?'png':/webp/.test(ty)?'webp':/jpe?g/.test(ty)?'jpg':null;
  if(!dls||!ext){window.open(url,'_blank','noopener');return}
  try{const b=await (await fetch(url)).blob();await dls.save({filename:'IC-'+pname(id)+'.'+ext,data:b})}
  catch(e){if(e&&e.code==='declined')return;window.open(url,'_blank','noopener')}}
function famClick(b,d){
  if('person' in d){S.person=d.person||null;S.ptab='ring';S.fe=null;S.evf=null;window.scrollTo(0,0);render(true);return true}
  if(d.ptab){S.ptab=d.ptab;S.fe=null;render(true);return true}
  if(d.fill){S.ptab='ring';S.fe={key:'p:'+d.fill,d:feSrc('p:'+d.fill)};render(true);return true}
  if(d.fe){startFe(d.fe);render(true);return true}
  if(d.fcancel){S.fe=null;render(true);return true}
  if(d.fsave){if(S.fe)saveFe();render(true);return true}
  if(d.fadd){const k=S.fe.key.split(':')[0];S.fe.d.push(BLANK[k]());render(true);return true}
  if(d.frm){S.fe.d.splice(+d.frm,1);render(true);return true}
  if(d.freset){S.fe.d=genMs(d.freset);render(true);return true}
  if(d.upl){pickFile(d.upl);return true}
  if(d.dl){dlNric(d.dl);return true}
  if(d.nrm){const p=S.family[d.nrm];if(p&&p.nric){delete p.nric;save('family',d.nrm)}S.fe=null;render(true);return true}
  if(d.view){S.open['v'+d.view]=!S.open['v'+d.view];if(d.view.startsWith('past'))S.open[d.view]=S.open['v'+d.view];render(true);return true}
  if(d.goto){const[m,ft]=d.goto.split('|');S.person=null;S.fe=null;S.main=m;if(ft)S.ft=ft;S.edit=true;window.scrollTo(0,0);render(true);return true}
  return false}
document.addEventListener('input',e=>{const t=e.target,f=t.dataset&&t.dataset.fd;if(f==null||!S.fe||S.fe.d==null)return;const[a,b]=f.split('.');if(b!=null){if(S.fe.d[+a])S.fe.d[+a][b]=t.value}else S.fe.d[a]=t.value});


/* Cukai: sub-tab Finance. Syafiq (gaji, borang BE) dan Mira (bisnes, borang B). db collection `tax`: docs s-<YA>, m-<YA>, setup.
   Had pelepasan YA2026 dari panduan Bajet 2026; semak dengan LHDN sebelum hantar borang. */
const TC=[
 ['med','Perbelanjaan perubatan',10000,'🩺','Diri, pasangan dan anak',[['umum','Penyakit serius / rawatan',10000],['vaksin','Vaksin',1000],['gigi','Rawatan gigi',1000],['periksa','Pemeriksaan penuh / mental / ujian',1000],['anak','Anak: diagnosis & intervensi pembelajaran',10000]]],
 ['parent','Rawatan ibu bapa',8000,'👵','Perubatan, keperluan khas, penjaga'],
 ['life','Gaya hidup',2500,'🛍️','Buku, gajet, internet, kursus'],
 ['sport','Sukan',1000,'🏸','Peralatan, yuran gim, gelanggang'],
 ['tour','Tiket tempat pelancongan',1000,'🎟️','YA2026 sahaja'],
 ['care','Taska, tadika & pusat transit',3000,'🧸','Anak 12 tahun ke bawah, pusat berdaftar'],
 ['bf','Peralatan penyusuan',1000,'🍼','Anak 2 tahun ke bawah'],
 ['edu','Yuran pendidikan diri',7000,'🎓','Termasuk kursus upskilling'],
 ['epf','KWSP',4000,'🏦','Wajib atau sukarela'],
 ['lifeins','Insurans hayat / takaful',3000,'🛡️','Diri, pasangan dan anak'],
 ['edumed','Insurans pendidikan & perubatan',4000,'🩹','Diri, pasangan dan anak'],
 ['sspn','Simpanan SSPN',8000,'📘','Simpanan bersih tahun ni'],
 ['prs','PRS',3000,'📈','Skim persaraan swasta'],
 ['socso','PERKESO / SIP',350,'🧾','Caruman tahun ni'],
 ['green','Cas EV / CCTV / mesin sisa makanan',2500,'🔌','Tuntut sekali sahaja'],
 ['house','Faedah pinjaman rumah pertama',7000,'🏠','Faedah sahaja, SPA 2025–2027'],
 ['derma','Derma diluluskan',null,'🤲','Had 10% pendapatan'],
 ['zakat','Zakat',null,'🕌','Tolak terus dari cukai']];
const TCM=Object.fromEntries(TC.map(c=>[c[0],c]));
const TT=[['ring','Ringkasan'],['relief','Relief'],['resit','Resit'],['efile','e-Filing']];
const TW={s:['syafiq','Syafiq','ps','BE','gaji'],m:['mira','Mira','pm','B','bisnes']};
const IND=9000,KID=2000,BANDS=[[5000,0],[15000,.01],[15000,.03],[15000,.06],[20000,.11],[30000,.19],[300000,.25],[200000,.26],[1400000,.28],[Infinity,.30]];
let sampler=null,simg=false;
const tKey=()=>S.tw+'-'+S.ya;
const TD=()=>S.tax[tKey()]||{owner:S.tw,ya:S.ya,inc:null,paid:null,recs:[]};
function TDw(){const k=tKey();if(!S.tax[k])S.tax[k]=TD();S.tax[k].recs=S.tax[k].recs||[];return S.tax[k]}
const TSET=()=>S.tax.setup||{kids:{}};
const recs=c=>(TD().recs||[]).filter(r=>!c||r.c===c);
const r0=v=>Math.round((+v||0)*100)/100;
function claimC(c){const C=TCM[c],rs=recs(c);if(!C[2])return sum(rs.map(r=>r.a));
  if(C[5]){const by={};rs.forEach(r=>by[r.sub||'umum']=(by[r.sub||'umum']||0)+(+r.a||0));return Math.min(C[2],sum(C[5].map(([k,,l])=>Math.min(l,by[k]||0))))}
  return Math.min(C[2],sum(rs.map(r=>r.a)))}
function kidsFor(w){const k=TSET().kids||{};return['maliq','musa'].filter(id=>k[id]===w).map(id=>{const a=ageAt(FM(id).dob,S.ya);return{id,a,amt:a==null||a<18?KID:0}})}
function ageAt(dob,ya){if(!dob)return null;return ya-+dob.slice(0,4)}
function model(){const D=TD(),kids=kidsFor(S.tw),auto=IND+sum(kids.map(k=>k.amt)),cl=sum(TC.filter(c=>c[2]).map(c=>claimC(c[0]))),inc=D.inc==null?null:+D.inc;
  const dm=sum(recs('derma').map(r=>r.a)),zk=sum(recs('zakat').map(r=>r.a)),dd=inc==null?dm:Math.min(dm,inc*.1);
  let tax=null,ch=null,rb=0,zr=0,net=null,bal=null;
  if(inc!=null){ch=Math.max(0,inc-dd-auto-cl);let left=ch;tax=0;for(const[w,r]of BANDS){const x=Math.min(left,w);tax+=x*r;left-=x;if(left<=0)break}
    rb=ch<=35000?Math.min(400,tax):0;zr=Math.min(zk,tax-rb);net=r0(Math.max(0,tax-rb-zr));bal=r0(net-(+D.paid||0))}
  return{kids,auto,cl,inc,dd,zk,tax:r0(tax),ch,rb,zr,net,bal,tot:auto+cl}}
const pct=(a,b)=>b?Math.min(100,Math.round(a/b*100)):0;

/* Cadangan dari data yang dah ada dalam app */
const RX=[[/sspn/i,'sspn'],[/\bprs\b/i,'prs'],[/kwsp|epf|i-?saraan/i,'epf'],[/perkeso|socso|sksps/i,'socso'],[/medic|perubatan|kesihatan|hospital/i,'edumed'],[/takaful|insuran|insurance|prudential|\baia\b|great eastern|etiqa|allianz|zurich|manulife|hayat/i,'lifeins'],[/unifi|internet|wifi|fibre|maxis|celcom|digi|\btime\b|u ?mobile|\byes\b|postpaid/i,'life'],[/gym|gim|badminton|futsal|sukan/i,'sport'],[/taska|tadika|nursery|daycare|pengasuh/i,'care']];
function tSugg(){const o=[],D=TD(),has=(n,f)=>(D.recs||[]).some(r=>r.n===n&&r.from===f),w=S.tw;
  const scan=(its,from,mult)=>its.forEach(it=>{if(it.w!==w||!it.n)return;const hit=RX.find(([re])=>re.test(it.n));if(!hit)return;if(!(hit[1]==='life'?from==='Bill':true))return;
    const a=from==='Bill'?0:+it.a||0;if(!has(it.n,from))o.push({c:hit[1],n:it.n,a:a?r0(Math.min(a*mult,TCM[hit[1]][2]||a*mult)):null,from,sub:from==='Bill'?'bahagian internet sahaja, bil atas nama sendiri':a?rm(a)+' sebulan × 12':'jumlah belum diisi'})});
  sec('commitment').forEach(([,d])=>scan(d.items||[],'Commitment',12));
  const B=BILLS();if(B)scan(B.items||[],'Bill',12);
  ['maliq','musa'].forEach(id=>{const t=FM(id).det||{},nm=pname(id);
    if(t.dental&&t.dental.startsWith(String(S.ya))&&(TSET().kids||{})[id]===w&&!has('Dental '+nm,'Keluarga'))o.push({c:'med',sb:'gigi',n:'Dental '+nm,a:null,d:t.dental,from:'Keluarga',sub:'Dental check '+fmtD(t.dental)});
    if(t.vaksinD&&t.vaksinD.startsWith(String(S.ya))&&(TSET().kids||{})[id]===w&&!has('Vaksin '+nm,'Keluarga'))o.push({c:'med',sb:'vaksin',n:'Vaksin '+nm,a:null,d:t.vaksinD,from:'Keluarga',sub:(t.vaksin||'Vaksin')+' · '+fmtD(t.vaksinD)});
    const a=ageAt(FM(id).dob,S.ya);if(a!=null&&a<=12&&!recs('care').length&&!o.some(x=>x.c==='care'))o.push({c:'care',n:'Yuran taska / tadika '+nm,a:null,from:'Keluarga',sub:nm+' '+a+' tahun tahun ni'})});
  if(w==='s'&&!recs('epf').length)o.push({c:'epf',n:'KWSP dari Borang EA',a:null,from:'Tip',sub:'Ambil dari Borang EA majikan hujung Feb'});
  if(w==='m'&&!recs('epf').length)o.push({c:'epf',n:'KWSP sukarela / i-Saraan',a:null,from:'Tip',sub:'Bisnes sendiri: caruman sukarela boleh dituntut'});
  if(w==='m'&&!recs('socso').length)o.push({c:'socso',n:'PERKESO bekerja sendiri (SKSPS)',a:null,from:'Tip',sub:'Kalau kau carum SKSPS'});
  return o}

/* Paparan */
const tPill=()=>`<div class="two tw2">${['s','m'].map(w=>`<button class="big ${TW[w][2]} twb" data-tw="${w}" aria-pressed="${S.tw===w}"><span>${TW[w][1]}</span><small>Borang ${TW[w][3]} · ${TW[w][4]}</small></button>`).join('')}</div>`;
function catRow(c,M){const C=TCM[c],rs=recs(c),a=claimC(c),nr=rs.filter(isMiss).length;
  return`<button class="row trow" data-topen="${c}"><span class="ic">${C[3]}</span><span class="nm">${esc(C[1])}${C[2]?`<span class="bar sm"><i style="width:${pct(a,C[2])}%"></i></span>`:''}<small>${C[2]?'daripada '+rm(C[2]):esc(C[4])} · ${rs.length} rekod${nr?` · <b class="nor">${nr} tiada resit</b>`:''}</small></span><b class="tamt">${rm(c==='derma'?M.dd:a)}</b></button>`}
const tYears=()=>{const o=[];for(let y=2026;y<=Math.max(2026,now.getFullYear());y++)o.push(y);return o};
function vTax(){if(!S.ready)return wait();const M=model(),D=TD(),w=TW[S.tw];
  let h=`<div class="chips">${TT.map(t=>`<button class="pill" data-tt="${t[0]}" aria-pressed="${S.tt===t[0]}">${t[1]}</button>`).join('')}${tYears().length>1?tYears().map(y=>`<button class="pill ya" data-tya="${y}" aria-pressed="${S.ya===y}">YA ${y}</button>`).join(''):`<span class="ya">YA ${S.ya}</span>`}</div>`;
  h+=({ring:tRing,relief:tRelief,resit:tResit,efile:tEfile}[S.tt]||tRing)(M,D,w);
  return h+`<p class="note">Had pelepasan ikut panduan YA${S.ya} (Bajet 2026). Anggaran ni panduan sahaja, bukan nasihat cukai rasmi. Semak dengan LHDN sebelum hantar borang.</p>`}
function tRing(M,D,w){const used=TC.filter(c=>c[2]&&recs(c[0]).length);
  let h=`<div class="card txhero ${w[2]}"><small>Pelepasan ${esc(w[1])} YA${S.ya}</small><b class="hero">${rm(M.tot)}</b><div class="tbar"><i style="width:${pct(M.auto,M.tot)}%"></i><i class="cl" style="width:${pct(M.cl,M.tot)}%"></i></div><div class="tleg"><span><i></i>Automatik <b>${rm(M.auto)}</b></span><span><i class="cl"></i>Dituntut <b>${rm(M.cl)}</b></span></div></div>`+missCard();
  h+=tEst(M,D,w);
  const mo=now.getMonth();if(S.ya===now.getFullYear()&&mo>=9){const left=['life','sport','tour','green'].map(c=>[c,TCM[c][2]-claimC(c)]).filter(x=>x[1]>0);
    if(left.length)h+=`<div class="card warmc"><div class="head"><h2>Baki relief sebelum 31 Dis</h2><span class="tot">${Math.round((new Date(S.ya,11,31)-T0())/864e5)} hari</span></div>${left.map(([c,b])=>`<div class="row"><span class="ic">${TCM[c][3]}</span><span class="nm">${esc(TCM[c][1])}<small>${esc(TCM[c][4])}</small></span><span class="cd">baki ${rm(b)}</span></div>`).join('')}<p class="note">Belanja dalam tahun ni dan simpan resit. Lepas 31 Dis, baki hangus untuk YA${S.ya}.</p></div>`}
  const nr=(D.recs||[]).filter(isMiss).length;
  h+=`<div class="card"><div class="head"><h2>Tuntutan ${esc(w[1])}</h2>${nr?`<span class="cd warnc">${nr} tiada resit</span>`:''}</div>`+(used.length?used.map(c=>catRow(c[0],M)).join(''):`<p class="note">Belum ada tuntutan. Tekan Snap resit dalam tab Resit, atau tambah dari tab Relief.</p>`)+`</div>`;
  h+=tAuto(M,w);
  const sg=tSugg();
  h+=`<div class="card"><div class="head"><h2>Mungkin berkaitan dengan ${esc(w[1])}</h2></div>`+(sg.length?sg.map((x,i)=>`<div class="row"><span class="ic">${TCM[x.c][3]}</span><span class="nm">${esc(x.n)}<small>${esc(TCM[x.c][1])} · ${esc(x.sub)} · dari ${esc(x.from)}</small></span><button class="amt" data-tsg="${i}">${x.a?'+ '+rm(x.a):'+ Tambah'}</button></div>`).join(''):`<p class="note">Tiada cadangan baru.</p>`)+`<p class="note" style="margin-top:6px">Cadangan diambil dari Commitment, Bill dan Keluarga. Tekan untuk masukkan; semak jumlah dengan penyata sebenar.</p></div>`;
  return h}
function tAuto(M,w){const k=TSET().kids||{},kidRow=id=>{const nm=pname(id),a=ageAt(FM(id).dob,S.ya);
    return`<div class="row"><span class="ic ${PC[id]}">${esc(nm.slice(0,1))}</span><span class="nm">${esc(nm)}<small>${a==null?'Tarikh lahir belum diisi, dikira bawah 18':a+' tahun pada '+S.ya}</small></span><span class="seg2">${['s','m'].map(x=>`<button class="mini ${TW[x][2]}" data-tkid="${id}|${x}" aria-pressed="${k[id]===x}">${TW[x][1]}</button>`).join('')}</span></div>`};
  return`<div class="card"><div class="head"><h2>Automatik</h2><span class="tot">${rm(M.auto)}</span></div>
   <div class="row"><span class="ic">👤</span><span class="nm">Individu<small>Diberi kepada semua</small></span><span class="amt">${rm(IND)}</span></div>
   <div class="row"><span class="ic">💍</span><span class="nm">Suami / isteri<small>Tak layak: Syafiq dan Mira dua-dua ada pendapatan</small></span><span class="amt none">—</span></div>
   <div class="row"><span class="ic">🧒</span><span class="nm">Anak bawah 18 tahun<small>${M.kids.length?M.kids.map(x=>esc(pname(x.id))).join(', ')+' dituntut '+esc(w[1]):'Tiada anak dituntut '+esc(w[1])}</small></span><span class="amt">${rm(sum(M.kids.map(x=>x.amt)))}</span></div>
   <p class="hand" style="margin:8px 0 2px">Siapa tuntut anak?</p>${kidRow('maliq')}${kidRow('musa')}
   <p class="note" style="margin-top:6px">Seorang anak dituntut oleh seorang sahaja. Pilihan ni sama untuk Syafiq dan Mira.</p></div>`}
function tEst(M,D,w){const ed=S.tfe==='inc';
  const lbI=S.tw==='s'?'Gaji setahun (termasuk bonus)':'Untung bersih bisnes setahun',lbP=S.tw==='s'?'PCB dah dipotong':'Ansuran CP500 dah bayar';
  let h=`<div class="card"><div class="head"><h2>Anggaran cukai</h2><button class="sedit ${ed?'on':''}" data-tfe="inc">${ed?'Batal':'Edit'}</button></div>`;
  if(ed)return h+`<div class="form"><label class="fl full">${lbI}<input class="txt" inputmode="decimal" id="t-inc" value="${S.tdr.inc??D.inc??''}" data-ti="inc" placeholder="cth 60000"></label><label class="fl full">${lbP}<input class="txt" inputmode="decimal" id="t-paid" value="${S.tdr.paid??D.paid??''}" data-ti="paid" placeholder="0"></label></div>${S.tw==='m'?'<p class="note" style="margin-top:6px">Untung bersih = jualan tolak belanja bisnes yang dibenarkan.</p>':''}<div class="acts"><button class="btn" data-tsave="inc">Simpan</button></div></div>`;
  h+=pnlLine(D);
  if(M.inc==null)return h+`<p class="note">Isi ${S.tw==='s'?'gaji setahun dan PCB':'untung bersih bisnes dan ansuran CP500'} untuk tengok sama ada ${esc(w[1])} kena bayar atau dapat refund.</p></div>`;
  const st=M.bal>0.5?`<b class="tres pay">Kena bayar ${rm(M.bal)}</b>`:M.bal<-0.5?`<b class="tres ref">Refund ${rm(-M.bal)}</b>`:`<b class="tres ok">Tiada baki cukai</b>`;
  const r=(n,v,s)=>`<div class="row"><span class="nm">${n}</span><span class="${s||''}">${v}</span></div>`;
  return h+st+`<div class="tsum">${r(S.tw==='s'?'Gaji setahun':'Untung bisnes',rm(M.inc))}${M.dd?r('Derma',('− '+rm(M.dd))):''}${r('Pelepasan','− '+rm(M.tot))}${r('Pendapatan bercukai',rm(M.ch),'b')}${r('Cukai',rm(M.tax))}${M.rb?r('Rebat individu','− '+rm(M.rb)):''}${M.zr?r('Zakat','− '+rm(M.zr)):''}${r(S.tw==='s'?'PCB':'CP500','− '+rm(+D.paid||0))}</div></div>`}
function recRow(r,i){const C=TCM[r.c]||TC[0],subN=C[5]&&r.sub?(C[5].find(x=>x[0]===r.sub)||[,''])[1]:'';
  return`<div class="row"><span class="nm">${esc(r.n||C[1])}<small>${r.d?fmtD(r.d):'Tiada tarikh'}${subN?' · '+esc(subN):''}${r.from?' · dari '+esc(r.from):''}${r.note?'<br>'+esc(r.note):''}</small></span>${r.r?`<button class="mini" data-trv="${r.id}" aria-label="Tengok resit">📎</button>`:r.link?`<a class="mini drv" href="${esc(r.link)}" target="_blank" rel="noopener">📁 Buka</a>`:r.doc==='drive'?`<span class="mini drv">📁 Drive</span>`:`<button class="mini nor" data-tup="${r.id}">+ Resit</button>`}<button class="amt" data-tedit="${r.id}">${rm(r.a)}</button></div>`+(S.open['rv'+r.id]&&r.r?`<img class="thumb" src="${esc(bUrl(r.r))}" alt="Resit ${esc(r.n||'')}">`:'')}
function addForm(){const a=S.tadd,C=TCM[a.c]||TC[0];
  return`<div class="card tform"><div class="head"><h2>${a.id?'Ubah rekod':'Rekod baru'}</h2><button class="sedit" data-tcancel="1">Batal</button></div>
   ${a.r?`<img class="thumb" src="${esc(bUrl(a.r))}" alt="Resit">`:''}${a.ai?`<p class="note aino">${esc(a.ai)}</p>`:''}
   <div class="form"><label class="fl full">Kategori<select class="txt" id="ta-c" data-ta="c">${TC.map(c=>`<option value="${c[0]}" ${c[0]===a.c?'selected':''}>${esc(c[1])}</option>`).join('')}</select></label>
   ${C[5]?`<label class="fl full">Jenis<select class="txt" id="ta-sub" data-ta="sub">${C[5].map(s=>`<option value="${s[0]}" ${s[0]===(a.sub||'umum')?'selected':''}>${esc(s[1])} (had ${rm(s[2])})</option>`).join('')}</select></label>`:''}
   <label class="fl full">Butiran<input class="txt" id="ta-n" data-ta="n" value="${esc(a.n||'')}" placeholder="cth Kedai buku, Klinik gigi" maxlength="60"></label>
   <label class="fl">Jumlah (RM)<input class="txt" id="ta-a" data-ta="a" inputmode="decimal" value="${a.a??''}" placeholder="0.00"></label>
   <label class="fl">Tarikh<input class="txt" id="ta-d" data-ta="d" type="date" value="${esc(a.d||'')}"></label><label class="fl full">Nota<input class="txt" id="ta-note" data-ta="note" value="${esc(a.note||'')}" placeholder="cth untuk Maliq, bulan Mac" maxlength="200"></label><label class="fl full">Link resit dalam Drive<input class="txt" id="ta-link" data-ta="link" value="${esc(a.link||'')}" placeholder="Tampal link dari Google Drive"></label>${a.r?'':`<label class="fl full chk"><input type="checkbox" id="ta-doc" ${a.doc==='drive'?'checked':''}> Resit dah disimpan dalam Drive</label>`}</div>
   <div class="acts">${a.id?`<button class="btn ghost" data-tdel="${a.id}">Buang</button><button class="btn ghost" data-tcopym="1">Salin bulan depan</button>`:''}${a.r?'':`<button class="btn ghost" data-tattach="1">Lampir resit</button>`}<button class="btn" data-tsave="rec">Simpan</button></div></div>`}
function tRelief(M){if(S.tadd)return addForm();
  return`<div class="card"><div class="head"><h2>Semua pelepasan</h2><span class="tot">${rm(M.cl)}</span></div>`+TC.map(c=>{const op=!!S.open['tc'+c[0]],rs=recs(c[0]).map(r=>[r,TD().recs.indexOf(r)]);
    return catRow(c[0],M)+(op?`<div class="sub">${rs.length?rs.map(([r,i])=>recRow(r,i)).join(''):`<p class="note">${esc(c[4])}. Belum ada rekod.</p>`}<div class="add" style="flex-wrap:wrap"><button class="btn ghost" data-tnew="${c[0]}">+ Tambah ${esc(c[1].toLowerCase())}</button>${driveLink(c[0])?`<a class="btn ghost" href="${driveLink(c[0])}" target="_blank" rel="noopener">📁 Folder Drive</a>`:''}</div></div>`:'')}).join('')+`</div>`}
function tResit(M,D){if(S.tadd)return addForm();const all=(D.recs||[]).slice().sort((a,b)=>String(b.d||'').localeCompare(String(a.d||''))),f=S.open.tnor,list=f?all.filter(r=>!r.r):all;
  return`<div class="card snapc"><button class="snap" data-tsnap="1" ${S.scan?'disabled':''} aria-label="Snap resit"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg></button>
    <div><b>${S.scan?esc(S.scan):'Snap resit'}</b><small>Ambil gambar resit dan isi butiran sendiri.</small></div></div>
   <div class="add" style="padding:0 0 4px;flex-wrap:wrap"><button class="btn ghost" data-tnew="life">+ Tambah tanpa gambar</button><button class="btn ghost" data-open="tnor" aria-pressed="${!!f}">Tiada resit sahaja</button></div>
   <div class="card"><div class="head"><h2>Semua rekod</h2><span class="tot">${list.length}</span></div>`+(list.length?list.map(r=>{const C=TCM[r.c]||TC[0];return`<div class="trc"><span class="ic">${C[3]}</span>${recRow(r)}</div>`}).join(''):`<p class="note">${f?'Semua rekod ada resit ✓':'Belum ada rekod.'}</p>`)+`</div>
   <p class="note">LHDN boleh minta resit untuk semakan sehingga 7 tahun. Gambar resit disimpan dalam app ni; muat turun salinan setiap tahun dalam tab e-Filing.</p>`}
function tEfile(M,D,w){const ya=S.ya,dl=S.tw==='s'?'30 Apr '+(ya+1):'30 Jun '+(ya+1),rows=[['Individu',IND],['Anak bawah 18 tahun',sum(M.kids.map(x=>x.amt))]].concat(TC.filter(c=>c[2]).map(c=>[c[1],claimC(c[0])])).filter(x=>x[1]>0);
  return`<div class="card"><div class="head"><h2>Borang ${w[3]} · ${esc(w[1])}</h2><span class="cd">Akhir ${dl}</span></div><p class="note">${S.tw==='s'?'Pekerja makan gaji: e-BE di MyTax. Ambil Borang EA dari majikan dulu.':'Ada pendapatan bisnes: e-B di MyTax. Sediakan untung rugi bisnes setahun.'} Salin angka di bawah ikut ruangan pelepasan.</p></div>
   <div class="card"><div class="head"><h2>Angka untuk borang</h2><span class="tot">${rm(M.tot)}</span></div>${rows.map(([n,v])=>`<div class="row"><span class="nm">${esc(n)}</span><button class="amt" data-tcopy="${v}">${rm(v)}</button></div>`).join('')}
   ${M.dd?`<div class="row"><span class="nm">Derma diluluskan</span><button class="amt" data-tcopy="${M.dd}">${rm(M.dd)}</button></div>`:''}${M.zk?`<div class="row"><span class="nm">Zakat (rebat)</span><button class="amt" data-tcopy="${M.zk}">${rm(M.zk)}</button></div>`:''}
   <p class="note" style="margin-top:6px">Tekan angka untuk salin.</p></div>
   ${docsCard()}${sheetCard()}<div class="card"><div class="head"><h2>Simpanan YA${ya}</h2></div><p class="note">Satu fail dengan semua rekod dan gambar resit ${esc(w[1])} untuk YA${ya}. Simpan dalam Drive untuk 7 tahun.</p><div class="acts"><button class="btn" data-tdl="1">Muat turun</button></div></div>`}

/* Simpan dan resit */
function saveTax(){save('tax',tKey());markDirty(S.tw)}
const num=v=>{const t=String(v??'').trim().replace(/,/g,'').replace(/^RM\s*/i,'');if(t==='')return null;const n=parseFloat(t);return isNaN(n)?NaN:r0(n)};
const tFile=document.createElement('input');tFile.type='file';tFile.accept='image/*';tFile.hidden=true;document.body.appendChild(tFile);
function tPick(mode){if(!assets&&mode!=='snap')return toast('Upload belum sedia. Cuba lagi sekejap.');tFile.accept=mode.startsWith('doc:')?'image/*,application/pdf':'image/*';tFile.dataset.m=mode;tFile.value='';tFile.click()}
tFile.addEventListener('change',async()=>{const f=tFile.files&&tFile.files[0],mode=tFile.dataset.m||'';if(!f)return;
  const small=await rzOpen(f,'doc');if(!small)return;
  const up=assets?assets.upload(small).then(r=>({id:r.id,type:r.contentType||'image/jpeg'})).catch(()=>null):Promise.resolve(null);
  if(mode.startsWith('doc:')){const r=await up;if(!r)return toast('Upload tak berjaya. Cuba lagi.');const T=TDw();T.docs=T.docs||{};T.docs[mode.slice(4)]={ok:true,at:TODAY,r};saveTax();toast('Dokumen disimpan.');return render(true)}
  if(mode.startsWith('rec:')){const r=await up;if(!r)return toast('Upload tak berjaya. Cuba lagi.');const it=TDw().recs.find(x=>x.id===mode.slice(4));if(it){it.r=r;saveTax();toast('Resit dilampir.')}return render(true)}
  if(mode==='attach'){S.scan='Tengah upload…';render(true);const r=await up;S.scan=null;if(r&&S.tadd)S.tadd.r=r;else toast('Upload tak berjaya.');return render(true)}
  S.tadd={c:'life',n:'',a:null,d:TODAY,r:null};S.tt='resit';
  S.scan='Tengah upload…';render(true);S.tadd.r=await up;S.scan=null;if(!S.tadd.r)toast('Gambar tak berjaya diupload. Cuba lampir semula.');render(true)});
function readAdd(){const a=S.tadd;['c','sub','n','a','d','note','link'].forEach(k=>{const e=document.getElementById('ta-'+k);if(e)a[k]=e.value});const dc=document.getElementById('ta-doc');if(dc)a.doc=dc.checked?'drive':''}
async function tDownload(){const D=TD(),w=TW[S.tw],M=model();toast('Tengah sediakan fail…');
  const toData=async r=>{try{const b=await (await fetch(bUrl(r))).blob();return await new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=()=>res('');fr.readAsDataURL(b)})}catch(_){return''}};
  let rows='';for(const r of (D.recs||[]).slice().sort((a,b)=>String(a.c).localeCompare(b.c))){const C=TCM[r.c]||TC[0],img=r.r?await toData(r.r):'';
    rows+=`<section><h3>${esc(C[1])} · ${esc(r.n||'')}</h3><p>${r.d?fmtD(r.d):'Tiada tarikh'} · <b>${rm(r.a)}</b>${r.r?'':' · tiada resit'}</p>${img?`<img src="${img}" alt="">`:''}</section>`}
  const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cukai YA${S.ya} ${esc(w[1])}</title><style>body{font:15px/1.5 system-ui,sans-serif;max-width:720px;margin:24px auto;padding:0 16px;color:#222}h1{font-size:22px}table{width:100%;border-collapse:collapse}td{padding:4px 0;border-bottom:1px solid #ddd}td:last-child{text-align:right}section{border-top:1px solid #ccc;padding:10px 0;break-inside:avoid}img{max-width:100%;max-height:520px;display:block;margin-top:6px}</style></head><body>
   <h1>Cukai YA${S.ya} · ${esc(w[1])} (Borang ${w[3]})</h1><p>Disediakan ${fmtD(TODAY)} dari Home Syafiq. Anggaran sahaja.</p>
   <table><tr><td>Pelepasan automatik</td><td>${rm(M.auto)}</td></tr><tr><td>Pelepasan dituntut</td><td>${rm(M.cl)}</td></tr><tr><td><b>Jumlah pelepasan</b></td><td><b>${rm(M.tot)}</b></td></tr>${TC.filter(c=>c[2]&&claimC(c[0])).map(c=>`<tr><td>${esc(c[1])}</td><td>${rm(claimC(c[0]))}</td></tr>`).join('')}${M.zk?`<tr><td>Zakat</td><td>${rm(M.zk)}</td></tr>`:''}</table>
   <h2>Rekod dan resit</h2>${rows||'<p>Tiada rekod.</p>'}</body></html>`;
  const fn='Cukai-YA'+S.ya+'-'+w[1]+'.html',blob=new Blob([html],{type:'text/html'});
  if(!dls){const u=URL.createObjectURL(blob);window.open(u,'_blank','noopener');return}
  try{await dls.save({filename:fn,data:blob})}catch(e){if(e&&e.code!=='declined')toast('Muat turun tak berjaya.')}}
function taxClick(b,d){
  if(tax2Click(b,d))return true;
  if(d.tw){S.tw=d.tw;S.tadd=null;S.tfe=null;return render(true),true}
  if(d.tya){S.ya=+d.tya;S.tadd=null;S.tfe=null;return render(true),true}
  if(d.tt){S.tt=d.tt;S.tadd=null;S.tfe=null;return render(true),true}
  if(d.topen){const k='tc'+d.topen;if(S.tt!=='relief'){S.tt='relief';S.open[k]=true}else S.open[k]=!S.open[k];return render(true),true}
  if(d.tkid){const[id,w]=d.tkid.split('|'),s=S.tax.setup=S.tax.setup||{kids:{}};s.kids=s.kids||{};s.kids[id]=s.kids[id]===w?'':w;save('tax','setup');markDirty('s');markDirty('m');return render(true),true}
  if(d.tfe){S.tfe=S.tfe===d.tfe?null:d.tfe;S.tdr={};return render(true),true}
  if(d.tsave==='inc'){const i=num($('#t-inc').value),p=num($('#t-paid').value);if(Number.isNaN(i)||Number.isNaN(p)){toast('Masukkan nombor sahaja.');return true}const T=TDw();if(T.inc!==i)T.incSrc='';T.inc=i;T.paid=p;saveTax();S.tfe=null;S.tdr={};return render(true),true}
  if(d.tnew){S.tadd={c:d.tnew,n:'',a:null,d:TODAY,r:null};return render(true),true}
  if(d.tsg){const x=tSugg()[+d.tsg];if(!x)return true;if(x.a){TDw().recs.push({id:newId(),c:x.c,sub:x.sb,n:x.n,a:x.a,d:x.d||'',r:null,from:x.from});saveTax();toast('Ditambah. Lampir resit bila ada.')}else{S.tadd={c:x.c,sub:x.sb,n:x.n,a:null,d:x.d||TODAY,r:null,from:x.from};S.tt='relief'}return render(true),true}
  if(d.tedit){const r=TD().recs.find(x=>x.id===d.tedit);if(r){S.tadd=JSON.parse(JSON.stringify(r))}return render(true),true}
  if(d.tcancel){S.tadd=null;return render(true),true}
  if(d.tsave==='rec'){readAdd();const a=S.tadd,v=num(a.a);if(v==null||Number.isNaN(v)){toast('Isi jumlah dalam nombor.');return true}
    const T=TDw(),o={id:a.id||newId(),c:a.c,n:String(a.n||'').trim().slice(0,60),a:v,d:a.d||'',r:a.r||null,from:a.from||'',note:String(a.note||'').trim().slice(0,200),doc:a.r?'':(a.doc||''),link:/^https:\/\/(drive|docs)\.google\.com\//.test(String(a.link||'').trim())?String(a.link).trim():''};if(TCM[a.c][5])o.sub=a.sub||'umum';
    const i=T.recs.findIndex(x=>x.id===o.id);if(i>=0)T.recs[i]=o;else T.recs.push(o);saveTax();S.tadd=null;S.open['tc'+o.c]=true;toast('Disimpan.');return render(true),true}
  if(d.tdel){const T=TDw();T.recs=T.recs.filter(x=>x.id!==d.tdel);saveTax();S.tadd=null;return render(true),true}
  if(d.tsnap){tPick('snap');return true}
  if(d.tattach){readAdd();tPick('attach');return true}
  if(d.tup){tPick('rec:'+d.tup);return true}
  if(d.trv){S.open['rv'+d.trv]=!S.open['rv'+d.trv];return render(true),true}
  if(d.tcopy){const t=String(d.tcopy);(navigator.clipboard&&navigator.clipboard.writeText(t)||Promise.reject()).then(()=>toast('Disalin: '+t),()=>toast(t));return true}
  if(d.tdl){tDownload();return true}
  return false}
document.addEventListener('input',e=>{const t=e.target,d=t.dataset||{};if(d.ta&&S.tadd)S.tadd[d.ta]=t.value;if(d.ti)S.tdr[d.ti]=t.value});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.ta==='sub'&&S.tadd)S.tadd.sub=t.value;if(t.id==='ta-c'&&S.tadd){readAdd();S.tadd.c=t.value;if(!TCM[t.value][5])delete S.tadd.sub;render(true)}});
/* Tarikh akhir borang dalam senarai Tarikh penting di Home */
const _impDates=impDates;impDates=function(){const o=_impDates(),y=now.getFullYear();
  [['s','30 Apr','04-30'],['m','30 Jun','06-30']].forEach(([w,lb,md])=>{const x=nextOcc((y+1)+'-'+md);if(x)o.push({ic:'🧾',cls:TW[w][2],n:'Hantar e-'+TW[w][3]+' '+TW[w][1],x,sub:lb+' · cukai YA'+(x.date.getFullYear()-1)})});
  return o.sort((a,b)=>(a.x?a.x.days:1e4)-(b.x?b.x.days:1e4))};
async function startTax(){sampler=null;simg=false;render()}

/* v7: Sheet sync, dokumen, kad "Perlu dilengkapkan", alert di Home */
const DOCS={s:[['ea','Borang EA dari majikan','Biasanya dapat hujung Feb'],['kwsp','Penyata KWSP tahunan','Dari i-Akaun KWSP'],['ins','Penyata cukai insurans / takaful','Pecahan hayat, perubatan dan pendidikan',['lifeins','edumed']],['sspn','Penyata SSPN tahunan','Simpanan bersih setahun',['sspn']],['zakat','Resit zakat','Dari pusat zakat negeri',['zakat']]],
 m:[['pnl','Penyata untung rugi bisnes','Jualan tolak belanja bisnes'],['bank','Penyata bank 12 bulan','Sokong pendapatan bisnes'],['ins','Penyata cukai insurans / takaful','Pecahan hayat, perubatan dan pendidikan',['lifeins','edumed']],['sspn','Penyata SSPN tahunan','Simpanan bersih setahun',['sspn']],['zakat','Resit zakat','Dari pusat zakat negeri',['zakat']]]};
const withW=(w,fn)=>{const o=S.tw;S.tw=w;try{return fn()}finally{S.tw=o}};
const isMiss=r=>!r.r&&r.doc!=='drive'&&!r.link;
function docList(w){return withW(w,()=>{const D=TD(),dd=D.docs||{};return DOCS[w].filter(d=>!d[3]||d[3].some(c=>recs(c).length)).map(d=>({k:d[0],n:d[1],sub:d[2],st:dd[d[0]]||{}}))})}
function missing(w){return withW(w,()=>({recs:(TD().recs||[]).filter(isMiss),docs:docList(w).filter(d=>!d.st.ok)}))}
function missCard(){const w=S.tw,M=missing(w),n=M.recs.length+M.docs.length;if(!n)return`<div class="card okc"><div class="row"><span class="ic">✅</span><span class="nm">Semua resit dan dokumen ${esc(TW[w][1])} lengkap<small>YA${S.ya}</small></span></div></div>`;
  const all=!!S.open.tmiss,lim=all?999:5;let i=0;
  const rows=M.docs.map(d=>`<div class="row"><span class="ic">📄</span><span class="nm">${esc(d.n)}<small>Dokumen · ${esc(d.st.note||d.sub)}</small></span>${d.st.link?`<a class="mini drv" href="${esc(d.st.link)}" target="_blank" rel="noopener">Buka ↗</a>`:''}<button class="mini" data-tdocup="${d.k}">+ Fail</button><button class="mini" data-tdok="${d.k}">Dah ada</button></div>`)
   .concat(M.recs.map(r=>{const C=TCM[r.c]||TC[0];return`<div class="row"><span class="ic">${C[3]}</span><span class="nm">${esc(r.n||C[1])}<small>${esc(C[1])} · ${rm(r.a)}${r.d?' · '+fmtD(r.d):''}</small></span><button class="mini" data-tup="${r.id}">+ Resit</button><button class="mini" data-tdrv="${r.id}">Dalam Drive</button></div>`}));
  return`<div class="card misc"><div class="head"><h2>Perlu dilengkapkan</h2><span class="cd warnc">${n}</span></div><p class="note">${M.recs.length} resit dan ${M.docs.length} dokumen ${esc(TW[w][1])} belum ada. Upload, atau tanda kalau dah simpan dalam Drive.</p>`+rows.slice(0,lim).join('')+
   (rows.length>5?`<button class="lk" data-open="tmiss" style="margin-top:6px">${all?'Tunjuk sikit':'Tunjuk semua '+rows.length}</button>`:'')+
   `<div class="acts"><button class="btn ghost" data-tck="${w}">Masuk Checklist ${esc(TW[w][1])}</button></div></div>`}
function taxAlert(){if(!S.ready)return'';const c=['s','m'].map(w=>{const M=missing(w);return[w,M.recs.length,M.docs.length]}).filter(x=>x[1]+x[2]);if(!c.length)return'';
  return`<div class="card misc"><div class="head"><h2>Cukai belum lengkap</h2><span class="tot">YA${S.ya}</span></div>${c.map(([w,a,b])=>`<button class="row trow" data-tgo="${w}"><span class="ic ${TW[w][2]}">🧾</span><span class="nm">${esc(TW[w][1])}<small>${a?a+' resit':''}${a&&b?' · ':''}${b?b+' dokumen':''} belum ada</small></span><span class="cd">Lengkapkan ›</span></button>`).join('')}</div>`}
function toChecklist(w){const M=missing(w),L=S.lists.checklist=S.lists.checklist||{title:'Checklist',section:'check',items:[]},fo=w==='s'?'syafiq':'mira',have=new Set(L.items.map(x=>x.n));let k=0;
  M.docs.map(d=>'Cukai: dapatkan '+d.n.toLowerCase()).concat(M.recs.map(r=>'Cukai: resit '+(r.n||TCM[r.c][1])+' '+rm(r.a))).forEach(n=>{if(!have.has(n)){L.items.push({n,done:false,for:fo});k++}});
  if(k)save('lists','checklist');toast(k?k+' item masuk Checklist '+TW[w][1]+'.':'Semua dah ada dalam Checklist.')}
function driveLink(c){const d=((TSET().drive||{})[S.tw])||{},id=d[c]||(c==='edumed'?d.lifeins:'')||d.other;return id?'https://drive.google.com/drive/folders/'+encodeURIComponent(id):''}

/* Google Sheet: app tulis satu blok (B:J, 346 baris) ke tab yang dipilih. Ubah dalam app, atau ubah dalam Sheet lepas tu tekan Ambil dari Sheet. */
const BL=346,SY={s:{},m:{},busy:false,t:null};
const sCfg=w=>((TSET().sheets||{})[w])||null;
const qTab=t=>"'"+String(t).replace(/'/g,"''")+"'";
const bRange=c=>qTab(c.tab)+'!B'+c.row+':J'+(c.row+BL-1);
function hsh(v){const s=JSON.stringify(v||[]);let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return String(h)}
function buildBlock(w,r0){return withW(w,()=>{const M=model(),D=TD(),R1=r0+46,R2=r0+BL-1,rows=[],E=n=>Array(n).fill(''),row=a=>rows.push(a.concat(E(9-a.length)));
  const rg=c=>'$'+c+'$'+R1+':$'+c+'$'+R2;
  row(['PELEPASAN CUKAI YA'+S.ya+' · '+TW[w][1].toUpperCase()+' (BORANG '+TW[w][3]+')']);
  row(['Diisi automatik oleh app Home Syafiq. Ubah dalam app, atau ubah jadual REKOD di bawah dan tekan "Ambil dari Sheet" dalam app. Had kecil perubatan (vaksin, gigi, pemeriksaan) dikira dalam app.']);row([]);
  row(['ANGGARAN (DIKIRA OLEH APP)','RM']);
  const v=x=>x==null?'':x;
  [['Pendapatan setahun ('+(w==='s'?'gaji':'untung bisnes')+')',v(M.inc)],['Pelepasan automatik (individu dan anak)',r0f(M.auto)],['Pelepasan dituntut',r0f(M.cl)],['Derma diluluskan',r0f(M.dd)],['Pendapatan bercukai',v(M.ch)],['Cukai',M.inc==null?'':M.tax],['Rebat dan zakat',M.inc==null?'':r0f(M.rb+M.zr)],[w==='s'?'PCB dah dipotong':'CP500 dah bayar',v(D.paid)],['Baki (positif kena bayar, negatif refund)',v(M.bal)]].forEach(x=>row(x));
  row([]);row(['KATEGORI','DITUNTUT (RM)','HAD (RM)','DIKIRA (RM)','REKOD','TIADA RESIT']);
  const c0=r0+15;TC.forEach((c,i)=>{const r=c0+i;row([c[1],'=SUMIFS('+rg('G')+','+rg('D')+',$B'+r+')',c[2]==null?'':c[2],'=IF(D'+r+'="",C'+r+',MIN(C'+r+',D'+r+'))','=COUNTIF('+rg('D')+',$B'+r+')','=COUNTIFS('+rg('D')+',$B'+r+','+rg('H')+',"Tiada")'])});
  const cE=c0+15;row(['JUMLAH PELEPASAN DITUNTUT','=SUM(C'+c0+':C'+cE+')','','=SUM(E'+c0+':E'+cE+')','=SUM(F'+c0+':F'+(c0+17)+')','=SUM(G'+c0+':G'+(c0+17)+')']);
  row([]);row(['DOKUMEN','STATUS','TARIKH']);const dl=docList(w);for(let i=0;i<8;i++){const d=dl[i];row(d?[d.n,d.st.ok?'Ada':'Belum',d.st.at||'']:[])}
  row([]);row(['ID','TARIKH','KATEGORI','JENIS','BUTIRAN','RM','RESIT','DARI','NOTA']);
  const rs=(D.recs||[]).slice().sort((a,b)=>(TC.findIndex(c=>c[0]===a.c)-TC.findIndex(c=>c[0]===b.c))||String(a.d||'').localeCompare(String(b.d||'')));
  for(let i=0;i<BL-46;i++){const x=rs[i];if(!x){row([]);continue}const C=TCM[x.c]||TC[0],sb=C[5]&&x.sub?(C[5].find(s=>s[0]===x.sub)||[,''])[1]:'';
    row([x.id,x.d||'',C[1],sb,x.n||'',+x.a||0,x.r?'App':x.link?'=HYPERLINK("'+x.link.replace(/"/g,'')+'","Drive")':x.doc==='drive'?'Drive':'Tiada',x.from||'',x.note||''])}
  return{rows,over:rs.length>BL-46}})}
const r0f=v=>Math.round((+v||0)*100)/100;
function pDate(s){s=String(s||'').trim();if(!s)return'';let m=/^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);if(m)return m[1]+'-'+pad(+m[2])+'-'+pad(+m[3]);m=/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);if(m)return m[3]+'-'+pad(+m[2])+'-'+pad(+m[1]);return''}
function pullRows(w,vals,r0){return withW(w,()=>{const T=TDw(),start=46;let up=0,add=0;
  for(let i=start;i<vals.length;i++){const v=(vals[i]||[]).map(x=>String(x??'').trim());if(!v.some(Boolean))continue;
    const a=num(v[5]);if(a==null||Number.isNaN(a))continue;const C=TC.find(c=>c[1].toLowerCase()===v[2].toLowerCase());if(!C)continue;
    const sub=C[5]?((C[5].find(s=>s[1].toLowerCase()===v[3].toLowerCase())||['umum'])[0]):undefined,o={c:C[0],d:pDate(v[1]),n:v[4].slice(0,60),a,from:v[7],note:v[8]};if(sub)o.sub=sub;
    const ex=v[0]&&T.recs.find(x=>x.id===v[0]);
    if(ex){const before=JSON.stringify(ex);Object.assign(ex,o);if(!ex.r)ex.doc=v[6].toLowerCase()==='drive'?'drive':'';if(JSON.stringify(ex)!==before)up++}
    else{T.recs.push(Object.assign({id:newId(),r:null,doc:v[6].toLowerCase()==='drive'?'drive':''},o));add++}}
  return{up,add}})}
const sErr=e=>{const c=e&&e.code;return['needs_reauth','server_not_connected','consent_required','not_in_manifest','selection_required'].includes(c)?'Tak dapat sambung ke Google Sheet.':c==='tool_error'?'Tak dapat buka Sheet ni. Semak link, nama tab, dan akses akaun Google.':'Tak dapat sambung ke Sheet. Cuba lagi.'};
async function syncSheet(w,mode,pm){const c=sCfg(w);if(!c||!c.id){SY[w]={st:'off'};return render()}if(!mcp){SY[w]={st:'err',msg:'Tak dapat sambung ke Google Sheet. Semak internet dan cuba lagi.'};return render()}
  if(SY.busy)return;SY.busy=true;SY[w]={st:'busy'};render();
  try{const get=()=>mcp.callTool(GS,'get_values',{spreadsheetId:c.id,range:bRange(c)},{cache:{refresh:true}}).then(r=>(r&&r.payload&&r.payload.values)||[]);
    const vals=await get(),h=hsh(vals),set=S.tax.setup;
    if(mode==='pull'){const r=pullRows(w,vals,c.row);withW(w,()=>save('tax',tKey()));set.sheets[w].dirty=Date.now();save('tax','setup');SY.busy=false;render(true);return syncSheet(w,'force','Diambil dari Sheet: '+r.up+' diubah, '+r.add+' baru.')}
    if(!c.hash&&!c.own&&vals.some(r=>(r||[]).some(x=>String(x??'').trim()))){SY[w]={st:'notempty'};return}
    if(c.hash&&h!==c.hash&&mode!=='force'){SY[w]={st:'changed'};return}
    const B=buildBlock(w,c.row);await mcp.callTool(GS,'update_values',{spreadsheetId:c.id,range:bRange(c),values:B.rows});
    const after=await get();Object.assign(set.sheets[w],{hash:hsh(after),own:true,dirty:0,at:Date.now()});save('tax','setup');
    SY[w]={st:'ok',msg:(pm||'')+(B.over?' Rekod lebih 300, sebahagian tak masuk Sheet.':'')}}
  catch(e){SY[w]={st:'err',msg:sErr(e)}}
  finally{SY.busy=false;render()}}
function markDirty(w){const s=S.tax.setup;if(s&&s.sheets&&s.sheets[w]){s.sheets[w].dirty=Date.now();save('tax','setup')}autoSync()}
function autoSync(){clearTimeout(SY.t);SY.t=setTimeout(()=>{if(!mcp||SY.busy)return;for(const w of['s','m']){const c=sCfg(w);if(c&&c.id&&c.auto!==false&&c.dirty&&!['changed','notempty'].includes(SY[w].st)){syncSheet(w,'auto');return}}},2500)}
setInterval(autoSync,20000);
const ago2=t=>{if(!t)return'belum pernah';const m=Math.round((Date.now()-t)/6e4);return m<1?'baru tadi':m<60?m+' minit lepas':m<1440?Math.round(m/60)+' jam lepas':Math.round(m/1440)+' hari lepas'};
function sheetCard(){const w=S.tw,c=sCfg(w),st=SY[w]||{},ed=S.tfe==='sheet';
  let h=`<div class="card"><div class="head"><h2>Google Sheet</h2><button class="sedit ${ed?'on':''}" data-tfe="sheet">${ed?'Batal':'Edit'}</button></div>`;
  if(ed){const d=Object.assign({id:'',tab:'',row:1,auto:true},c||{},S.tdr);
    return h+`<div class="form"><label class="fl full">Link atau ID Google Sheet<input class="txt" id="ts-id" data-ti="id" value="${esc(d.id)}" placeholder="https://docs.google.com/spreadsheets/d/…"></label>
     <label class="fl">Nama tab<input class="txt" id="ts-tab" data-ti="tab" value="${esc(d.tab)}" placeholder="TAX"></label><label class="fl">Baris mula<input class="txt" id="ts-row" data-ti="row" inputmode="numeric" value="${esc(d.row)}"></label>
     <label class="fl full chk"><input type="checkbox" id="ts-auto" ${d.auto!==false?'checked':''}> Tulis ke Sheet secara automatik bila rekod berubah</label></div>
     <p class="note" style="margin-top:6px">App guna lajur B hingga J, ${BL} baris bermula dari baris mula. Kalau kawasan tu ada data lain, app tak akan tulis.</p><div class="acts"><button class="btn" data-tsave="sheet">Simpan</button></div></div>`}
  if(!c||!c.id)return h+`<p class="note">Belum disambung. Tekan Edit dan tampal link Google Sheet.</p></div>`;
  const msg=st.st==='busy'?'Tengah tulis ke Sheet…':st.st==='changed'?'Sheet ada perubahan yang belum diambil. Ambil dulu, atau tulis ganti dengan data app.':st.st==='notempty'?'Kawasan B'+c.row+':J'+(c.row+BL-1)+' dalam tab tu ada data lain. Tukar baris mula.':st.st==='err'?st.msg:st.msg||'';
  return h+`<div class="row"><span class="ic">📊</span><span class="nm">Tab ${esc(c.tab)} · baris ${c.row}<small>Auto ${c.auto!==false?'hidup':'mati'} · ditulis ${ago2(c.at)}${c.dirty?' · ada perubahan belum ditulis':''}</small></span><a class="mini" href="https://docs.google.com/spreadsheets/d/${encodeURIComponent(c.id)}/edit" target="_blank" rel="noopener">Buka ↗</a></div>
   ${msg?`<p class="note ${['changed','notempty','err'].includes(st.st)?'warnt':''}" style="margin-top:6px">${esc(msg)}</p>`:''}
   <div class="acts"><button class="btn ghost" data-tsync="pull" ${SY.busy?'disabled':''}>Ambil dari Sheet</button><button class="btn" data-tsync="${st.st==='changed'?'force':'auto'}" ${SY.busy?'disabled':''}>${st.st==='changed'?'Tulis ganti':'Tulis sekarang'}</button></div></div>`}
function tax2Click(b,d){
  if(d.tgo){S.main='finance';S.ft='cukai';S.tw=d.tgo;S.fp=d.tgo;S.tt='ring';S.person=null;S.fe=null;window.scrollTo(0,0);return render(true),true}
  if(d.tck){toChecklist(d.tck);return true}
  if(d.tdrv){const r=TDw().recs.find(x=>x.id===d.tdrv);if(r){r.doc='drive';saveTax()}return render(true),true}
  if(d.tdok){const T=TDw();T.docs=T.docs||{};T.docs[d.tdok]={ok:true,at:TODAY};saveTax();return render(true),true}
  if(d.tdocup){tPick('doc:'+d.tdocup);return true}
  if(d.tcopym){readAdd();const a=S.tadd,dt=a.d?new Date(a.d+'T00:00'):T0();dt.setMonth(dt.getMonth()+1);S.tadd={c:a.c,sub:a.sub,n:a.n,a:a.a,d:iso(dt),r:null,doc:'',note:a.note,from:a.from};toast('Salinan untuk '+MFULL[dt.getMonth()]+'. Semak dan simpan.');return render(true),true}
  if(d.tsync){syncSheet(S.tw,d.tsync);return true}
  if(d.tpnl){const T=TDw();T.inc=PNL.v;T.incSrc='pnl';saveTax();return render(true),true}
  if(d.tsave==='sheet'){const id=(/\/d\/([\w-]+)/.exec($('#ts-id').value)||[,$('#ts-id').value.trim()])[1],tab=$('#ts-tab').value.trim(),row=parseInt($('#ts-row').value,10)||1,auto=$('#ts-auto').checked;
    if(!id||!tab){toast('Isi link sheet dan nama tab.');return true}
    const s=S.tax.setup=S.tax.setup||{kids:{}};s.sheets=s.sheets||{};const old=s.sheets[S.tw]||{},same=old.id===id&&old.tab===tab&&old.row===row;
    s.sheets[S.tw]=Object.assign({},same?old:{},{id,tab,row,auto,dirty:Date.now()});if(!same){delete s.sheets[S.tw].hash;delete s.sheets[S.tw].own}
    save('tax','setup');S.tfe=null;S.tdr={};SY[S.tw]={};render(true);autoSync();return true}
  return false}

/* v8: BMI dan pertumbuhan ikut umur (anggaran carta WHO), saiz kasut UK/EU dan saiz baju */
/* Umur 2..18 tahun. BMI: [-2SD, median, +1SD, +2SD]. Tinggi: [median, SD]. Anggaran dari carta WHO 2006 (bawah 5) dan WHO 2007 (5-19). */
const WB={L:[[13.8,16.0,17.3,18.9],[13.4,15.7,16.9,18.4],[13.1,15.4,16.7,18.2],[13.0,15.3,16.6,18.3],[13.0,15.3,16.8,18.5],[13.1,15.5,17.0,19.0],[13.3,15.7,17.4,19.7],[13.5,16.0,17.9,20.5],[13.7,16.4,18.5,21.4],[14.1,16.9,19.2,22.5],[14.5,17.5,19.9,23.6],[14.9,18.2,20.8,24.8],[15.5,19.0,21.8,25.9],[16.0,19.8,22.7,27.0],[16.5,20.5,23.5,27.9],[16.9,21.1,24.3,28.6],[17.3,21.7,24.9,29.2]],
 P:[[13.3,15.7,17.2,18.7],[13.1,15.4,16.9,18.4],[12.9,15.3,16.8,18.5],[12.7,15.2,16.9,18.9],[12.7,15.3,17.0,19.2],[12.7,15.4,17.3,19.8],[12.9,15.7,17.7,20.6],[13.1,16.1,18.3,21.5],[13.5,16.6,19.0,22.6],[13.9,17.2,19.9,23.7],[14.4,18.0,20.8,25.0],[14.9,18.8,21.8,26.2],[15.4,19.6,22.7,27.3],[15.9,20.2,23.5,28.2],[16.2,20.7,24.1,28.9],[16.4,21.0,24.5,29.3],[16.4,21.3,24.8,29.5]]};
const WH={L:[[86.4,3.2],[96.1,3.8],[103.3,4.3],[110.0,4.7],[116.0,5.0],[121.7,5.3],[127.3,5.7],[132.6,6.0],[137.8,6.3],[143.1,6.8],[149.1,7.5],[156.0,8.0],[163.2,8.0],[169.0,7.6],[172.9,7.3],[175.2,7.2],[176.1,7.2]],
 P:[[85.7,3.2],[95.1,3.9],[102.7,4.3],[109.4,4.7],[115.1,5.1],[120.8,5.4],[126.6,5.8],[132.5,6.2],[138.6,6.7],[145.0,7.1],[151.2,7.1],[156.4,6.8],[159.8,6.5],[161.7,6.3],[162.5,6.3],[162.9,6.3],[163.1,6.3]]};
function ageF(dob,on){if(!dob)return null;const b=new Date(dob+'T00:00'),t=on?new Date(on+'T00:00'):T0();return(t-b)/(365.25*864e5)}
function lerp(tab,a){if(a==null||a<2||a>18.99)return null;const i=Math.min(15,Math.floor(a-2)),f=Math.min(1,a-2-i),A=tab[i],B=tab[i+1];return A.map((v,k)=>v+(B[k]-v)*f)}
const ncdf=z=>{const t=1/(1+.2316419*Math.abs(z)),d=.3989423*Math.exp(-z*z/2),p=d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return z>0?1-p:p};
const nnum=v=>{const n=parseFloat(String(v??'').replace(',','.'));return isFinite(n)&&n>0?n:null};
function growth(id){const p=FM(id),t=p.det||{},w=nnum(t.berat),h=nnum(t.tinggi),sx=t.jantina,a=ageF(p.dob,t.upd);
  const o={w,h,a,sx,bmi:w&&h?w/((h/100)**2):null};
  if(o.bmi&&sx&&WB[sx]){const r=lerp(WB[sx],a);if(r){o.br=r;o.cat=o.bmi<r[0]?['Kurus','warn']:o.bmi>r[3]?['Obes','warn']:o.bmi>r[2]?['Berlebihan berat','warn2']:['Normal','ok'];
    const lo=r[0]-1.5,hi=r[3]+1.5,P=v=>Math.round((v-lo)/(hi-lo)*100);o.bpos=Math.max(1,Math.min(99,P(o.bmi)));o.bst=[P(r[0]),P(r[2]),P(r[3])]}}
  if(h&&sx&&WH[sx]){const r=lerp(WH[sx],a);if(r){o.hm=r[0];o.hp=Math.round(ncdf((h-r[0])/r[1])*100)}}
  return o}
/* Kasut: anggaran dari panjang kaki. UK kanak-kanak 0 = 10.16 cm acuan, setiap saiz +0.847 cm; EU = acuan cm x 1.5. Ruang dalam kasut ~1.2-1.5 cm. */
const r5=v=>Math.round(v*2)/2;
function ukLabel(c){return c<=13.5?'UK '+c+' kanak-kanak':'UK '+r5(c-13)}
function shoe(t){const L=nnum(t.kaki);if(L){const c=r5((L+1.2-10.16)/0.847),cb=r5((L+2.0-10.16)/0.847);return{L,uk:ukLabel(c),eu:Math.round((L+1.5)*1.5),ukb:ukLabel(cb),eub:Math.round((L+2.3)*1.5)}}
  const s=String(t.kasut||''),m=/(uk|eu)\s*(\d+(?:\.5)?)/i.exec(s);if(!m)return null;const n=+m[2];
  if(m[1].toLowerCase()==='eu'){const Lx=n/1.5-1.5,c=r5((Lx+1.2-10.16)/0.847);return{L:null,Lx,uk:ukLabel(c),eu:n}}
  const kid=!/dewasa|adult/i.test(s)&&n>=3,c=kid?n:n+13,Lx=c*0.847+10.16-1.2;return{L:null,Lx,uk:ukLabel(kid?n:n+13),eu:Math.round((Lx+1.5)*1.5)}}
const EUS=[86,92,98,104,110,116,122,128,134,140,146,152,158,164,170,176],UKA={86:'12–18 bln',92:'18–24 bln',98:'2–3 thn',104:'3–4 thn',110:'4–5 thn',116:'5–6 thn',122:'6–7 thn',128:'7–8 thn',134:'8–9 thn',140:'9–10 thn',146:'10–11 thn',152:'11–12 thn',158:'12–13 thn',164:'13–14 thn',170:'14–15 thn',176:'15–16 thn'};
function cloth(t){const h=nnum(t.tinggi);if(!h)return null;const i=EUS.findIndex(s=>s>=h-1),k=i<0?EUS.length-1:i,eu=EUS[k],nx=EUS[Math.min(EUS.length-1,k+1)];return{eu,uk:UKA[eu],nx,ukn:UKA[nx]}}
function growthCard(id){const g=growth(id),t=FM(id).det||{},p=FM(id),hist=(p.ukur||[]).slice(-6);
  if(!g.w&&!g.h)return'';
  let h=`<div class="card"><div class="head"><h2>BMI &amp; pertumbuhan</h2>${g.a!=null?`<span class="tot">${g.a.toFixed(1)} tahun</span>`:''}</div>`;
  if(!p.dob)h+=`<p class="note">Isi tarikh lahir (Butiran) untuk banding ikut umur.</p>`;
  else if(!g.sx)h+=`<p class="note">Pilih jantina dalam Badan &amp; saiz untuk banding dengan carta WHO.</p>`;
  if(g.bmi)h+=`<div class="row"><span class="ic">⚖️</span><span class="nm">BMI ${g.bmi.toFixed(1)}<small>${g.cat?'Ikut umur: '+g.cat[0]+(g.br?' · normal '+g.br[0].toFixed(1)+'–'+g.br[2].toFixed(1):''):'Perlu umur 2–18 dan jantina untuk kategori'}</small></span>${g.cat?`<span class="cd bm-${g.cat[1]}">${g.cat[0]}</span>`:''}</div>`+
    (g.bpos!=null?`<div class="bmibar" aria-hidden="true" style="background:linear-gradient(90deg,#F2B45A 0 ${g.bst[0]}%,#7FCFA8 ${g.bst[0]}% ${g.bst[1]}%,#F2C46A ${g.bst[1]}% ${g.bst[2]}%,#E87A5D ${g.bst[2]}%)"><i style="left:${g.bpos}%"></i></div><div class="bmileg"><span>Kurus</span><span>Normal</span><span>Berlebihan</span><span>Obes</span></div>`:'');
  if(g.hm)h+=`<div class="row"><span class="ic">📏</span><span class="nm">Tinggi ${g.h} cm<small>Purata umur ni ${g.hm.toFixed(1)} cm · lebih tinggi dari ${g.hp}% budak sebaya</small></span><span class="cd">${g.hp<3?'Rendah':g.hp>97?'Tinggi':'Biasa'}</span></div>`;
  if(hist.length>1){const a=hist[hist.length-2],b=hist[hist.length-1],dh=nnum(b.tinggi)&&nnum(a.tinggi)?nnum(b.tinggi)-nnum(a.tinggi):null,dw=nnum(b.berat)&&nnum(a.berat)?nnum(b.berat)-nnum(a.berat):null,mo=Math.max(1,Math.round((new Date(b.d)-new Date(a.d))/(30.4*864e5)));
    h+=`<div class="row"><span class="ic">📈</span><span class="nm">Sejak ${fmtD(a.d)}<small>${dh!=null?(dh>=0?'+':'')+dh.toFixed(1)+' cm':''}${dh!=null&&dw!=null?' · ':''}${dw!=null?(dw>=0?'+':'')+dw.toFixed(1)+' kg':''} dalam ${mo} bulan</small></span></div>`+sparkH(hist)}
  const up=t.upd?monthsSince(t.upd):null;if(up!=null&&up>=4)h+=`<p class="note warnt" style="margin-top:6px">Kali terakhir ukur ${up} bulan lepas. Ukur semula berat dan tinggi.</p>`;
  return h+`<p class="note" style="margin-top:6px">Anggaran ikut carta pertumbuhan WHO. Untuk penilaian sebenar, rujuk klinik kesihatan.</p></div>`}
function sparkH(hist){const pts=hist.filter(x=>nnum(x.tinggi));if(pts.length<2)return'';const ys=pts.map(x=>nnum(x.tinggi)),mn=Math.min(...ys)-1,mx=Math.max(...ys)+1,W=280,H=56;
  const xy=pts.map((x,i)=>[8+i*(W-16)/(pts.length-1),H-6-(ys[i]-mn)/(mx-mn)*(H-14)]);
  return`<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tinggi dari ${ys[0]} ke ${ys[ys.length-1]} cm"><polyline points="${xy.map(p=>p.join(',')).join(' ')}" fill="none" stroke="currentColor" stroke-width="2"/>${xy.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="3"/><text x="${p[0]}" y="${p[1]-6}" text-anchor="middle">${ys[i]}</text>`).join('')}</svg>`}
function sizeCard(id){const t=FM(id).det||{},s=shoe(t),c=cloth(t);if(!s&&!c)return'';
  let h=`<div class="card"><div class="head"><h2>Saiz kasut &amp; baju</h2></div>`;
  if(s)h+=`<div class="row"><span class="ic">👟</span><span class="nm">${s.L?'Kaki '+s.L+' cm':'Dari saiz '+esc(t.kasut)}<small>Muat sekarang: ${s.uk} · EU ${s.eu}${s.ukb?' · beli untuk membesar: '+s.ukb+' / EU '+s.eub:''}</small></span></div>`;
  if(s&&!s.L)h+=`<p class="note">Ukur panjang kaki (tumit ke jari paling panjang, berdiri) untuk saiz lebih tepat.</p>`;
  if(c)h+=`<div class="row"><span class="ic">👕</span><span class="nm">Baju ikut tinggi ${t.tinggi} cm<small>EU ${c.eu} · UK ${c.uk}${c.nx!==c.eu?' · saiz seterusnya EU '+c.nx+' ('+c.ukn+')':''}</small></span></div>`;
  const ms=[['Dada',t.dada],['Pinggang',t.pinggang],['Panjang seluar',t.seluar]].filter(x=>nnum(x[1]));
  if(ms.length)h+=`<div class="kv" style="margin-top:6px">${ms.map(x=>`<div><span>${x[0]}</span><b>${esc(x[1])} cm</b></div>`).join('')}</div>`;
  return h+`<p class="note" style="margin-top:6px">Saiz anggaran; jenama berbeza sedikit. Kaki budak biasanya membesar sekitar 1 cm setahun, semak setiap 3–4 bulan.</p></div>`}

function docsCard(){const dl=docList(S.tw);return`<div class="card"><div class="head"><h2>Dokumen</h2><span class="tot">${dl.filter(d=>d.st.ok).length}/${dl.length}</span></div>`+dl.map(d=>`<div class="row"><span class="ic">${d.st.ok?'✅':'📄'}</span><span class="nm">${esc(d.n)}<small>${d.st.ok?'Ada'+(d.st.at?' · '+fmtD(d.st.at):''):'Belum ada'}${d.st.note?' · '+esc(d.st.note):''}</small></span>${d.st.link?`<a class="mini drv" href="${esc(d.st.link)}" target="_blank" rel="noopener">Buka ↗</a>`:''}${d.st.r?`<a class="mini" href="${esc(bUrl(d.st.r))}" target="_blank" rel="noopener">Fail</a>`:''}${d.st.ok?'':`<button class="mini" data-tdok="${d.k}">Dah ada</button>`}</div>`).join('')+`</div>`}
const PNL={v:null,at:0,err:'',busy:false};
function pnlLine(D){const P=(TSET().pnl||{})[S.tw];if(!P||!P.id)return'';
  if(mcp&&!PNL.busy&&Date.now()-PNL.at>300000){PNL.busy=true;mcp.callTool(GS,'get_values',{spreadsheetId:P.id,range:P.range},{cache:{refresh:true}}).then(r=>{const v=num(((r&&r.payload&&r.payload.values)||[[]])[0][0]);PNL.v=Number.isNaN(v)?null:v;PNL.err=''})
    .catch(()=>{PNL.err='x'}).then(()=>{PNL.at=Date.now();PNL.busy=false;const T=S.tax[tKey()];if(PNL.v!=null&&T&&T.incSrc==='pnl'&&Math.abs((+T.inc||0)-PNL.v)>0.5){T.inc=PNL.v;saveTax()}render()})}
  const lk=`https://docs.google.com/spreadsheets/d/${encodeURIComponent(P.id)}/edit#gid=${P.gid||0}`;
  return`<div class="row"><span class="ic">📒</span><span class="nm">Penyata untung rugi<small>${PNL.v!=null?'Pendapatan perniagaan (unjuran setahun) '+rm(PNL.v)+(D.incSrc==='pnl'?' · dipakai di bawah':''):PNL.err?'Tak dapat baca Sheet':'Tengah baca Sheet…'}</small></span><a class="mini" href="${lk}" target="_blank" rel="noopener">Buka ↗</a>${PNL.v!=null&&D.incSrc!=='pnl'?`<button class="mini" data-tpnl="1">Guna</button>`:''}</div>`}

/* v9: umur tahun-bulan-hari, Home (2 minggu akan datang + checklist semua), jenis acara berwarna, acara ikut orang */
function ymd(s,to){if(!s)return null;const b=new Date(s+'T00:00'),t=to||T0();if(isNaN(b))return null;let y=t.getFullYear()-b.getFullYear(),m=t.getMonth()-b.getMonth(),d=t.getDate()-b.getDate();
  if(d<0){m--;d+=new Date(t.getFullYear(),t.getMonth(),0).getDate()}if(m<0){y--;m+=12}return y<0?null:{y,m,d}}
const fYMD=(o,sh)=>o?(sh?o.y+' thn '+o.m+' bln '+o.d+' hari':o.y+' tahun '+o.m+' bulan '+o.d+' hari'):'';
const ET=[['sekolah','Sekolah','🎒','#86D3BD'],['keluarga','Keluarga','🏡','#F5A9C2'],['majlis','Majlis','🎉','#C9AAF3'],['jalan','Bercuti','✈️','#F6C979'],['kesihatan','Kesihatan','🩺','#F2938A'],['kerja','Kerja','💼','#9FBDEB'],['bayar','Bayaran','💳','#A6DC9F'],['lain','Lain-lain','📌','#D8CBBF']];
const ETM=Object.fromEntries(ET.map(t=>[t[0],t]));
const evCol=t=>((S.family.meta||{}).evc||{})[t]||(ETM[t]||ETM.lain)[3];
const GUESS=[[/jamuan|majlis|kenduri|kahwin|aqiqah|birthday|hari ?jadi|party|open house|rumah terbuka|tahlil/i,'majlis'],[/sekolah|pibg|kelas|tadika|kafa|upkk|exam|peperiksaan|ujian|hari sukan|hari guru|transit|taska|lawatan/i,'sekolah'],[/klinik|doktor|dental|gigi|vaksin|hospital|checkup|pemeriksaan|terapi/i,'kesihatan'],[/trip|cuti|holiday|bercuti|hotel|genting|langkawi|balik kampung|flight|staycation/i,'jalan'],[/meeting|shoot|event brand|client|kerja|office|bisnes|live/i,'kerja'],[/bayar|bil\b|bill|due|insurans|roadtax|cukai|zakat/i,'bayar'],[/mak|ayah|abah|umi|atuk|nenek|keluarga|family|sepupu/i,'keluarga']];
const guessType=t=>(GUESS.find(([re])=>re.test(t))||[,'lain'])[1];
const guessWho=t=>PPL.map(x=>x[0]).filter(id=>new RegExp('(^|[^a-z])'+pname(id).toLowerCase().replace(/[^a-z0-9 ]/g,'')+'([^a-z]|$)','i').test(t));
const whoOf=e=>Array.isArray(e.who)?e.who:[];
const isoAdd=n=>{const d=T0();d.setDate(d.getDate()+n);return iso(d)};
const dLab=s=>{const d=new Date(s+'T00:00'),n=Math.round((d-T0())/864e5);return(n===0?'Hari ini':n===1?'Esok':DAYS[d.getDay()])+', '+d.getDate()+' '+MN[d.getMonth()]};
const inDays=s=>Math.round((new Date(s+'T00:00')-T0())/864e5);
const whoPills=e=>whoOf(e).map(id=>PC[id]?`<span class="who2 ${PC[id]}">${esc(pname(id))}</span>`:'').join('');
function evRow(id,e,opt){const t=ETM[e.type]||ETM.lain,n=inDays(e.date);
  return`<div class="row evr"><button class="evb" data-evedit="${id}"><span class="evdot" style="background:${evCol(e.type||'lain')}">${t[2]}</span><span class="nm">${esc(e.title)}<small>${dLab(e.date)}${e.time?' · '+fmtT(e.time):''}${e.note?' · '+esc(e.note):''}</small><span class="whos">${whoPills(e)}</span></span></button>${n>=0&&n<=31?`<span class="cd ${n<=1?'now':''}">${n===0?'Hari ni':n===1?'Esok':n+' hari'}</span>`:''}<button class="amt ${e.tent?'tentp':'okp'}" data-tent="${id}" aria-label="Tukar status ${esc(e.title)}">${e.tent?'Tentative':'Confirm'}</button></div>`}
function billsDue(days){const B=BILLS();if(!B)return[];const o=[],t=T0();
  (B.items||[]).forEach(it=>{if(!it.due||!it.a)return;for(const k of[0,1]){const d=new Date(t.getFullYear(),t.getMonth()+k,Math.min(it.due,28));const ds=iso(d),n=inDays(ds),ym=d.getFullYear()+'-'+pad(d.getMonth()+1);if(n>=0&&n<=days&&!(it.paid&&it.paid[ym])){o.push({date:ds,it});break}}});return o}
function upcomingCard(){const end=isoAdd(14),items=[];
  Object.entries(S.events).forEach(([id,e])=>{if(e.date>=TODAY&&e.date<=end)items.push({d:e.date,t:e.time||'',h:evRow(id,e)})});
  impDates().forEach(x=>{if(x.x&&x.x.days<=14)items.push({d:iso(x.x.date),t:'',h:drow(x)})});
  billsDue(14).forEach(({date,it})=>items.push({d:date,t:'',h:`<div class="row"><span class="ic ${pc(it.w)}">💳</span><span class="nm">Bill ${esc(it.n)}<small>${dLab(date)} · ${rm(it.a)} · ${it.w==='s'?'Syafiq':'Mira'}</small></span><span class="cd">${inDays(date)===0?'Hari ni':inDays(date)+' hari'}</span></div>`}));
  items.sort((a,b)=>a.d===b.d?(a.t<b.t?-1:1):a.d<b.d?-1:1);
  return`<div class="card"><div class="head"><h2>2 minggu akan datang</h2><button class="sedit" data-evnew="">+ Plan</button></div>`+(items.length?items.map(x=>x.h).join(''):`<p class="note">Tiada acara, birthday atau bill dalam 2 minggu ni.</p>`)+`</div>`}
function checkAllCard(){const its=((L('checklist')||{}).items||[]).map((it,i)=>[it,i]),open=its.filter(([it])=>!it.done),done=its.filter(([it])=>it.done),sd=!!S.open.ckdone;
  const order=['',...PPL.map(x=>x[0])],grp=order.map(w=>[w,open.filter(([it])=>(it.for||'')===w)]).filter(g=>g[1].length);
  const row=([it,i])=>`<div class="row ${it.done?'paid':''}"><label><input type="checkbox" id="hk-${i}" data-chk="c|${i}" ${it.done?'checked':''}><span class="nm">${esc(it.n)}</span></label>${it.for&&PC[it.for]?`<span class="who2 ${PC[it.for]}">${esc(pname(it.for))}</span>`:''}</div>`;
  return`<div class="card"><div class="head"><h2>Checklist semua</h2><span class="tot">${done.length} / ${its.length}</span></div>`+
   (open.length?grp.map(([w,g])=>`<p class="dayh">${w?esc(pname(w)):'Semua'}</p>`+g.map(row).join('')).join(''):`<p class="note">${its.length?'Semua dah siap ✓':'Belum ada item.'}</p>`)+
   (done.length?`<button class="lk" data-open="ckdone" style="margin-top:6px">${sd?'Sorok yang dah siap':'Tunjuk '+done.length+' yang dah siap'}</button>${sd?done.map(row).join(''):''}`:'')+
   `<div class="add"><input class="txt" id="add-check" placeholder="Tambah item" maxlength="80" autocomplete="off"><select class="txt sel" id="add-for" aria-label="Untuk siapa"><option value="">Semua</option>${PPL.map(x=>`<option value="${x[0]}">${esc(pname(x[0]))}</option>`).join('')}</select><button class="btn" data-add="check">Tambah</button></div></div>`}
function evForm(){const f=S.evf,ed=!!f.id;
  return`<div class="card evform"><div class="head"><h2>${ed?'Ubah plan':'Plan baru'}</h2><button class="sedit" data-evcancel="1">Batal</button></div>
   <div class="form"><label class="fl full">Apa<input class="txt" id="ef-title" data-ef="title" value="${esc(f.title||'')}" placeholder="cth Jamuan Maliq" maxlength="60" autocomplete="off"></label>
   <label class="fl">Tarikh<input class="txt" id="ef-date" data-ef="date" type="date" value="${esc(f.date||TODAY)}"></label><label class="fl">Masa<input class="txt" id="ef-time" data-ef="time" type="time" value="${esc(f.time||'')}"></label>
   <label class="fl full">Jenis<select class="txt" id="ef-type" data-ef="type"><option value="">Auto ikut nama</option>${ET.map(t=>`<option value="${t[0]}" ${f.type===t[0]?'selected':''}>${t[2]} ${t[1]}</option>`).join('')}</select></label>
   <div class="fl full">Untuk siapa<div class="chipsw">${PPL.map(([id])=>`<button class="mini ${(f.who||[]).includes(id)?PC[id]:''}" data-efwho="${id}" aria-pressed="${(f.who||[]).includes(id)}">${esc(pname(id))}</button>`).join('')}</div></div>
   <label class="fl full">Nota<input class="txt" id="ef-note" data-ef="note" value="${esc(f.note||'')}" placeholder="cth tempat, bawa apa" maxlength="120"></label>
   <label class="fl full chk"><input type="checkbox" id="ef-tent" ${f.tent!==false?'checked':''}> Tentative (belum confirm)</label></div>
   <p class="note" style="margin-top:6px">Tak pilih jenis atau orang? App teka dari nama, contohnya "Jamuan Maliq" jadi Majlis untuk Maliq. Plan ni keluar dalam tab orang yang dipilih.</p>
   <div class="acts">${ed?`<button class="btn ghost" data-evdel="${f.id}">Buang</button>`:''}<button class="btn" data-evsave="1">Simpan</button></div></div>`}
function personEvCard(id){const evs=Object.entries(S.events).filter(([,e])=>e.date>=TODAY&&whoOf(e).includes(id)).sort((a,b)=>a[1].date<b[1].date?-1:1).slice(0,8);
  return`<div class="card"><div class="head"><h2>Akan datang</h2><button class="sedit" data-evnew="${id}">+ Plan</button></div>`+(evs.length?evs.map(([eid,e])=>evRow(eid,e)).join(''):`<p class="note">Tiada plan untuk ${esc(pname(id))}. Plan dalam kalendar yang ditanda ${esc(pname(id))} keluar di sini.</p>`)+`</div>`}
function calLegend(){const used=new Set(Object.values(S.events).map(e=>e.type||'lain')),ed=!!S.open.evc;
  return`<div class="leg">${ET.filter(t=>used.has(t[0])||ed).map(t=>`<span><i style="background:${evCol(t[0])}"></i>${t[1]}</span>`).join('')}<span><i style="border:1.5px dashed var(--ink)"></i>Tentative</span><button class="lk" data-open="evc" style="margin-left:auto">${ed?'Siap':'Tukar warna'}</button></div>`+
   (ed?`<div class="evc">${ET.map(t=>`<label class="evcl"><input type="color" data-evc="${t[0]}" value="${evCol(t[0])}"> ${t[2]} ${t[1]}</label>`).join('')}<button class="lk" data-evcreset="1">Warna asal</button></div>`:'')}
function calClick(b,d){
  if('evnew' in d){const w=d.evnew;S.evf={title:'',date:S.sel||TODAY,time:'',type:'',who:w?[w]:[],note:'',tent:true};window.scrollTo(0,0);return render(true),true}
  if(d.evedit){const e=S.events[d.evedit];if(e){S.evf=Object.assign({id:d.evedit,who:[]},JSON.parse(JSON.stringify(e)))}window.scrollTo(0,0);return render(true),true}
  if(d.evcancel){S.evf=null;return render(true),true}
  if(d.efwho){const w=S.evf.who=S.evf.who||[],i=w.indexOf(d.efwho);if(i>=0)w.splice(i,1);else w.push(d.efwho);return render(true),true}
  if(d.evsave){const f=S.evf,t=String(f.title||'').trim();if(!t){toast('Isi nama plan dulu.');return true}if(!f.date){toast('Pilih tarikh dulu.');return true}
    const tent=($('#ef-tent')||{}).checked!==false,id=f.id||newId(),o={title:t.slice(0,60),date:f.date,time:f.time||'',type:f.type||guessType(t),who:(f.who&&f.who.length)?f.who:guessWho(t),note:String(f.note||'').trim().slice(0,120),tent};
    S.events[id]=o;save('events',id);S.evf=null;const D=new Date(o.date+'T00:00');S.cal={y:D.getFullYear(),m:D.getMonth()};toast('Disimpan'+(o.who.length?' · keluar dalam tab '+o.who.map(pname).join(', '):''));return render(true),true}
  if(d.evdel){delete S.events[d.evdel];if(db)db.collection('events').doc(d.evdel).delete().catch(fail);S.evf=null;return render(true),true}
  if(d.evcreset){const M=S.family.meta=S.family.meta||{};delete M.evc;save('family','meta');return render(true),true}
  return false}
document.addEventListener('input',e=>{const t=e.target,k=t.dataset&&t.dataset.ef;if(k&&S.evf)S.evf[k]=t.value});
document.addEventListener('change',e=>{const t=e.target,k=t.dataset&&t.dataset.evc;if(!k)return;const M=S.family.meta=S.family.meta||{};M.evc=Object.assign({},M.evc||{},{[k]:t.value});save('family','meta');render(true)});

/* v10: Finance ikut orang (Syafiq / Mira / Bersama), hutang & ansuran, sync tab FINANCE SYAFIQ / FINANCE MIRA, resize gambar */
const FP=[['s','Syafiq'],['m','Mira'],['b','Bersama']],PN={s:'Syafiq',m:'Mira'},WHO={s:'syafiq',m:'mira'};
const FTP=[['overview','Ringkasan','Ringkasan'],['bill','Bill','Bill'],['commitment','Komitmen','Komitmen'],['debt','Hutang','Hutang & ansuran'],['reserve','Reserve','Reserve'],['cukai','Cukai','Cukai'],['breakdown','Breakdown','Breakdown'],['yearly','Yearly','Yearly']];
const FTB=[['overview','Ringkasan','Ringkasan bersama'],['tanggung','Siapa tanggung','Siapa tanggung siapa'],['bill','Bill','Bill semua'],['breakdown','Breakdown','Breakdown'],['yearly','Yearly','Yearly']];
const FTD=[['dash','Dashboard','Dashboard'],...FTP];const fTabs=()=>S.fp==='b'?FTB:FTD;
const rId=w=>'r-'+WHO[w],dId=w=>'debt-'+WHO[w],aId=w=>'ans-'+WHO[w];
const its=id=>((L(id)||{}).items||[]);
const r2=v=>Math.round((+v||0)*100)/100;
const docOwner=id=>id==='c-syafiq'?'s':id==='c-mira'?'m':'k';
const forLabel=d=>String((d&&d.title)||'').replace(/^untuk\s+/i,'');
const comItems=w=>{const o=[];sec('commitment').forEach(([id,d])=>(d.items||[]).forEach((it,i)=>{if(it.w===w)o.push({id,d,it,i})}));return o};
const numIn=v=>{const t=String(v??'').trim().replace(/,/g,'').replace(/^RM\s*/i,'');if(t===''||t==='-')return null;const neg=/^\(.*\)$/.test(t),n=parseFloat(t.replace(/[()]/g,''));return isNaN(n)?NaN:r2(neg?-n:n)};
const numS=v=>{const n=numIn(v);return Number.isNaN(n)?null:n};

/* Hutang dan ansuran */
const dPaid=it=>r2(sum((it.pays||[]).map(p=>p.a)));
const dBal=it=>Math.max(0,r2((+it.a||0)-dPaid(it)));
const ymP=s=>{const m=/^(\d{4})-(\d{1,2})/.exec(String(s||''));return m?[+m[1],+m[2]]:null};
function ansCalc(it){const mo=+it.monthly||0,n=+it.months||0,st=ymP(it.start),extra=dPaid(it);
  const tot=it.total!=null&&it.total!==''?+it.total:(mo&&n?r2(mo*n):null);
  let paidN=null;if(it.paidN!=null&&it.paidN!=='')paidN=+it.paidN;else if(st&&n){const el=(now.getFullYear()-st[0])*12+(now.getMonth()+1-st[1])+1;paidN=Math.max(0,Math.min(n,el))}
  let bal=null;if(tot!=null&&paidN!=null)bal=Math.max(0,r2(tot-mo*paidN-extra));else if(it.balance!=null)bal=Math.max(0,r2(+it.balance-extra));
  let end=null;if(st&&n){const d=new Date(st[0],st[1]-1+n-1,1);end=MN[d.getMonth()]+' '+d.getFullYear()}
  return{tot,paidN,bal,end,left:n&&paidN!=null?n-paidN:null,pct:tot&&bal!=null?Math.max(0,Math.min(100,Math.round((1-bal/tot)*100))):null,mo,n,done:bal===0&&tot!=null}}
const ansBalTot=w=>r2(sum(its(aId(w)).map(i=>ansCalc(i).bal||0)));
const debtBalTot=w=>r2(sum(its(dId(w)).map(dBal)));

/* Pendapatan: Syafiq isi gaji sendiri; Mira ikut net bisnes tab TOTAL INCOME (boleh tukar ke isi sendiri) */
const INC_SHEET='BANK',INC={rows:null,at:0,busy:false,err:''};
function loadInc(){if(!mcp||INC.busy||Date.now()-INC.at<300000)return;INC.busy=true;
  mcp.callTool(GS,'get_values',{spreadsheetId:INC_SHEET,range:"'TOTAL INCOME'!B10:M21"},{cache:{refresh:true}})
   .then(r=>{const v=(r&&r.payload&&r.payload.values)||[];INC.rows=v.map(x=>({m:String(x[0]||''),inc:numS(x[4]),net:numS(x[11])}));INC.err=''})
   .catch(()=>{INC.err='x'}).then(()=>{INC.busy=false;INC.at=Date.now();render()})}
const IDOC=()=>S.lists.income||{};
function incOf(w){const m=(IDOC()[w]||{}).a;
  if(w==='s')return{v:m==null?null:+m,src:m==null?'Isi gaji bersih Syafiq':'Gaji bersih (isi sendiri)',man:true};
  if(m!=null)return{v:+m,src:'Diisi sendiri',man:true};
  const rs=(INC.rows||[]).filter(r=>r.inc!=null&&r.inc>0&&r.net!=null).slice(-3);
  if(!rs.length)return{v:null,src:INC.rows?'Tiada data dalam tab TOTAL INCOME':(mcp?'Tengah baca tab TOTAL INCOME…':'Google Sheets belum bersambung'),man:false};
  return{v:r2(sum(rs.map(r=>r.net))/rs.length),src:'Purata net bisnes '+rs[0].m+(rs.length>1?'–'+rs[rs.length-1].m:'')+' (tab TOTAL INCOME)',man:false}}
function cash(w){const I=incOf(w),com=r2(sum(comItems(w).map(x=>x.it.a))),ao=r2(sum(its(aId(w)).filter(i=>!i.inCom&&!ansCalc(i).done).map(i=>+i.monthly||0)));
  return{I,com,ao,bal:I.v==null?null:r2(I.v-com-ao)}}

/* Suis orang */
function finSwitch(){return`<div class="fsw glass" role="tablist">${FP.map(p=>`<button class="fsb ${p[0]==='s'?'ps':p[0]==='m'?'pm':''}" data-fp="${p[0]}" role="tab" aria-selected="${S.fp===p[0]}">${p[1]}</button>`).join('')}</div>`}

function vPOver(w){if(!S.ready)return wait();loadInc();const C=cash(w),I=C.I,ym=YM(),bi=((BILLS()||{items:[]}).items||[]).filter(i=>i.w===w),due=sum(bi.map(i=>i.a)),paid=sum(bi.map(i=>i.paid&&i.paid[ym]?i.a:0)),un=bi.filter(i=>i.a&&!(i.paid&&i.paid[ym]));
  let h=`<div class="card"><div class="head"><h2>Cashflow sebulan</h2><span class="tot">${PN[w]}</span></div>
   <div class="row"><span class="ic">💰</span><span class="nm">Pendapatan<small>${esc(I.src)}</small></span><input class="amtin" id="finc-${w}" data-finc="${w}" inputmode="decimal" placeholder="isi" value="${I.v==null?'':I.v}" aria-label="Pendapatan sebulan ${PN[w]}"></div>
   ${w==='m'&&I.man?`<p class="note" style="margin:-2px 0 4px 34px"><button class="lk" data-fincreset="m">Guna purata dari Sheet semula</button></p>`:''}
   <div class="row"><span class="ic">📋</span><span class="nm">Komitmen<small>${comItems(w).length} item</small></span><span class="amt ${pc(w)}">−${rm(C.com)}</span></div>
   ${C.ao?`<div class="row"><span class="ic">📱</span><span class="nm">Ansuran luar komitmen</span><span class="amt">−${rm(C.ao)}</span></div>`:''}
   <div class="row"><span class="ic">🧮</span><span class="nm"><b>Baki sebulan</b><small>${C.bal==null?'Isi pendapatan untuk kira':C.bal<0?'Komitmen lebih dari pendapatan':'Untuk simpanan dan belanja harian'}</small></span><b class="amt ${C.bal!=null&&C.bal<0?'neg':''}">${C.bal==null?'—':rm(C.bal)}</b></div>
   ${I.v?`<div class="bar"><i style="width:${Math.min(100,Math.round((C.com+C.ao)/I.v*100))}%"></i></div><p class="note" style="margin-top:4px">${Math.round((C.com+C.ao)/I.v*100)}% pendapatan pergi ke komitmen.</p>`:''}</div>`;
  h+=`<div class="card"><div class="head"><h2>Bill ${MN[S.month]}</h2><span class="tot">${rm(paid)} / ${n2(due)}</span></div><div class="bar"><i style="width:${due?Math.round(paid/due*100):0}%"></i></div>`+
   (un.length?un.map(u=>`<div class="row"><span class="nm">${esc(u.n)}<small>${u.due?'Due '+u.due+' hb':'Belum bayar'}</small></span><span class="amt ${pc(w)}">${rm(u.a)}</span></div>`).join(''):`<p class="hand" style="margin:8px 0 0">${due?'Semua bill '+PN[w]+' dah settle ✓':'Tiada bill atas nama '+PN[w]+'.'}</p>`)+`</div>`;
  const rs=r2(sum(its(rId(w)).map(i=>i.a)));
  h+=`<div class="card"><div class="head"><h2>Hutang &amp; reserve</h2><button class="sedit" data-ft="debt">Buka</button></div>
   <div class="row"><span class="ic">🧾</span><span class="nm">Baki hutang<small>${its(dId(w)).length} rekod</small></span><span class="amt ${pc(w)}">${rm(debtBalTot(w))}</span></div>
   <div class="row"><span class="ic">📱</span><span class="nm">Baki ansuran<small>${its(aId(w)).length} ansuran</small></span><span class="amt ${pc(w)}">${rm(ansBalTot(w))}</span></div>
   <div class="row"><span class="ic">🛟</span><span class="nm">Reserve</span><span class="amt">${rm(rs)}</span></div></div>`;
  return h+fsCard(w)}

function vCommitP(w){if(!S.ready)return wait();const all=comItems(w),tot=sum(all.map(x=>x.it.a));
  let h=`<div class="big ${pc(w)}" style="margin-bottom:12px"><span>${PN[w]} bayar sebulan</span><b>${rm(tot)}</b></div><div class="grid">`;
  sec('commitment').forEach(([id,d])=>{const rows=(d.items||[]).map((it,i)=>[it,i]).filter(([it])=>it.w===w);if(!rows.length&&!S.edit)return;
    const mine=docOwner(id)===w;
    h+=`<div class="card"><div class="head"><h2>Untuk ${esc(forLabel(d))}</h2><span class="tot">${rm(sum(rows.map(([it])=>it.a)))}</span></div>`+
     (rows.length?rows.map(([it,i])=>`<div class="row"><span class="nm">${esc(it.n)}${it.note?`<small>${esc(it.note)}</small>`:''}</span>${S.edit?`<button class="mini" data-who="${id}|${i}" aria-label="Pindah ${esc(it.n)} ke ${PN[w==='s'?'m':'s']}">→ ${PN[w==='s'?'m':'s']}</button>`:''}${amtBtn('lists|'+id+'|'+i+'|a',it.a,pc(w))}${delBtn('lists|'+id+'|'+i,it.n)}</div>`).join(''):`<p class="note">Belum ada item yang ${PN[w]} bayar untuk ${esc(forLabel(d))}.</p>`)+
     addRow('lists|'+id,'Item baru '+PN[w]+' bayar')+(mine||!rows.length?'':`<p class="note" style="margin-top:4px">${PN[w]} tanggung untuk ${esc(forLabel(d))}.</p>`)+`</div>`});
  return h+`</div><p class="note">Tab ni hanya tunjuk apa yang ${PN[w]} bayar, dikumpul ikut untuk siapa. Tekan nombor untuk ubah. Tekan Edit untuk tambah, buang atau pindah item ke ${PN[w==='s'?'m':'s']}.</p>`}

function vReserveP(w){if(!S.ready)return wait();const id=rId(w);if(!L(id))S.lists[id]={title:'Reserve '+PN[w],section:'reserve',w,order:w==='s'?2:1,items:[]};
  return`<div class="grid">${plainCard(id,L(id),pc(w))}</div>`}

/* Hutang: borang tambah / edit / bayar terus dalam app */
function dfForm(){const f=S.df;if(!f)return'';const d=f.d,t={debt:'hutang',ans:'ansuran',pay:'bayaran'}[f.k];
  const inp=(k,l,ph,ty,full)=>`<label class="fl${full?' full':''}">${l}<input class="txt" id="df-${k}" data-df="${k}" ${ty==='num'?'inputmode="decimal"':ty?'type="'+ty+'"':''} value="${esc(d[k]??'')}" placeholder="${esc(ph||'')}" autocomplete="off"></label>`;
  let b='';
  if(f.k==='debt')b=inp('n','Nama hutang','Contoh: DEBT 2026','',1)+(d.hasSub?`<p class="note full">Jumlah dikira dari senarai item dalam hutang ni.</p>`:inp('a','Jumlah (RM)','0.00','num'))+inp('note','Nota','Pinjam dari siapa, bila nak settle','',!d.hasSub?0:1);
  else if(f.k==='ans')b=inp('n','Nama ansuran','Contoh: IPHONE 17','',1)+inp('monthly','Bayaran bulanan (RM)','','num')+inp('total','Jumlah penuh (RM)','kosong = bulanan × tempoh','num')+inp('start','Bulan mula','','month')+inp('months','Tempoh (bulan)','Contoh: 24','num')+inp('paidN','Dah bayar (bulan)','kosong = kira ikut tarikh','num')+
    `<label class="fl full chk"><input type="checkbox" id="df-inCom" data-dfc="inCom" ${d.inCom?'checked':''}> Dah ada dalam Komitmen (supaya tak dikira dua kali dalam cashflow)</label>`+inp('note','Nota','Kedai, kad, akaun','',1);
  else b=inp('a','Jumlah bayar (RM)','','num')+inp('d','Tarikh','','date')+inp('note','Nota','Cara bayar, rujukan','',1);
  return`<div class="card" id="dfcard"><div class="head"><h2>${f.k==='pay'?'Rekod bayaran · '+esc(f.name):(f.i==null?'Tambah ':'Ubah ')+t}</h2><span class="tot">${PN[f.w]}</span></div><div class="form">${b}</div>
   <div class="acts">${f.i!=null&&f.k!=='pay'?`<button class="btn ghost" data-dfdel="1">${f.sure?'Pasti buang?':'Buang'}</button>`:''}<button class="btn ghost" data-dfx="1">Batal</button><button class="btn" data-dfsave="1">Simpan</button></div></div>`}
function paysList(id,i,it){const ps=it.pays||[];if(!ps.length)return'';
  return`<p class="hand" style="margin:8px 0 2px">Sejarah bayaran</p>`+ps.map((p,k)=>[p,k]).sort((a,b)=>a[0].d<b[0].d?1:-1).map(([p,k])=>`<div class="row"><span class="nm">${esc(fmtD(p.d))}${p.note?`<small>${esc(p.note)}</small>`:''}</span><span class="amt">${rm(p.a)}</span><button class="del" data-pdel="${id}|${i}|${k}" aria-label="Buang bayaran ${esc(p.d)}">×</button></div>`).join('')}
function debtCardP(w){const id=dId(w),D=its(id),c=pc(w);
  return`<div class="card"><div class="head"><h2>Hutang ${PN[w]}</h2><span class="tot">baki ${rm(debtBalTot(w))}</span></div>`+
   (D.length?D.map((it,i)=>{const k='d'+w+i,op=!!S.open[k],sub=it.sub||[],pd=dPaid(it),bl=dBal(it);
     return`<div class="row"><button class="exp" data-open="${k}" aria-expanded="${op}"><span class="chev">${op?'−':'+'}</span><span class="nm">${esc(it.n)}<small>${[sub.length?sub.length+' item':'',pd?'dah bayar '+rm(pd):'',it.note||''].filter(Boolean).map(esc).join(' · ')||'tekan untuk buka'}</small></span></button><span class="amt ${c} ${bl===0&&it.a?'done':''}">${bl===0&&it.a?'Settle ✓':rm(bl)}</span></div>`+
     (op?`<div class="sub"><div class="kv" style="margin:6px 0"><div><span>Jumlah</span><b>${rm(it.a)}</b></div><div><span>Baki</span><b>${rm(bl)}</b></div></div>`+
       sub.map((x,j)=>`<div class="row"><span class="nm">${esc(x.n)}</span>${amtBtn('lists|'+id+'|'+i+'|a|'+j,x.a)}<button class="del" data-del="lists|${id}|${i}|${j}" aria-label="Buang ${esc(x.n)}">×</button></div>`).join('')+
       `<div class="add"><input class="txt" id="add-sub-${id}-${i}" placeholder="Tambah item dalam hutang ni" maxlength="60" autocomplete="off"><button class="btn" data-add="sub|${id}|${i}">Tambah</button></div>`+paysList(id,i,it)+
       `<div class="acts"><button class="btn ghost" data-dfedit="debt|${i}">Edit</button><button class="btn" data-dfpay="debt|${i}">Bayar</button></div></div>`:'')}).join(''):`<p class="note">Tiada hutang. Tekan + Hutang untuk tambah.</p>`)+`</div>`}
function ansCardP(w){const id=aId(w),A=its(id),c=pc(w);
  return`<div class="card"><div class="head"><h2>Ansuran ${PN[w]}</h2><span class="tot">baki ${rm(ansBalTot(w))}</span></div>`+
   (A.length?A.map((it,i)=>{const k='a'+w+i,op=!!S.open[k],C=ansCalc(it);
     const sm=C.done?'Habis bayar ✓':[it.monthly?rm(it.monthly)+'/bln':'',C.n&&C.paidN!=null?C.paidN+'/'+C.n+' bulan':'',C.end?'habis '+C.end:''].filter(Boolean).join(' · ')||'Isi butiran';
     return`<div class="row"><button class="exp" data-open="${k}" aria-expanded="${op}"><span class="chev">${op?'−':'+'}</span><span class="nm">${esc(it.n)}${it.inCom?'<span class="tag soft">dalam komitmen</span>':''}<small>${esc(sm)}</small></span></button><span class="amt ${c}">${C.bal==null?'—':rm(C.bal)}</span></div>`+
      (C.pct!=null?`<div class="bar thin"><i style="width:${C.pct}%"></i></div>`:'')+
      (op?`<div class="sub"><div class="kv" style="margin:6px 0"><div><span>Bulanan</span><b>${it.monthly==null?'—':rm(it.monthly)}</b></div><div><span>Jumlah penuh</span><b>${C.tot==null?'—':rm(C.tot)}</b></div><div><span>Dah bayar</span><b>${C.paidN==null?'—':C.paidN+' bulan'}${it.paidN==null&&C.paidN!=null?' (ikut tarikh)':''}</b></div><div><span>Tinggal</span><b>${C.left==null?'—':C.left+' bulan'}</b></div><div><span>Mula</span><b>${it.start?MN[ymP(it.start)[1]-1]+' '+ymP(it.start)[0]:'—'}</b></div><div><span>Habis</span><b>${C.end||'—'}</b></div></div>`+
       (C.bal==null?`<p class="note warnt">Isi jumlah penuh (atau tempoh) dan bulan mula supaya app boleh kira baki.</p>`:'')+paysList(id,i,it)+
       `<div class="acts"><button class="btn ghost" data-dfedit="ans|${i}">Edit</button><button class="btn" data-dfpay="ans|${i}">Bayar lebih</button></div></div>`:'')}).join(''):`<p class="note">Tiada ansuran. Tekan + Ansuran untuk tambah.</p>`)+`</div>`}
function vDebtP(w){if(!S.ready)return wait();
  return dfForm()+`<div class="acts" style="justify-content:flex-start;padding:0 2px 10px"><button class="btn" data-dfnew="debt">+ Hutang</button><button class="btn" data-dfnew="ans">+ Ansuran</button></div>`+debtCardP(w)+ansCardP(w)+
   `<p class="note">Tekan satu hutang untuk buka. Dalam tu ada Edit, Bayar dan senarai item. Ansuran dikira ikut bulan mula (anggap auto debit setiap bulan); isi "Dah bayar" kalau lain.</p>`}
function dfOpen(k,w,i,name){const id=k==='ans'?aId(w):dId(w),it=i!=null?its(id)[i]:null;
  if(k==='pay')S.df={k,w,i,kind:name.kind,name:name.n,d:{a:'',d:TODAY,note:''}};
  else if(k==='debt')S.df={k,w,i,d:it?{n:it.n,a:it.a??'',note:it.note||'',hasSub:!!(it.sub&&it.sub.length)}:{n:'',a:'',note:''}};
  else S.df={k,w,i,d:it?{n:it.n,monthly:it.monthly??'',total:it.total??'',start:it.start||'',months:it.months??'',paidN:it.paidN??'',inCom:!!it.inCom,note:it.note||''}:{n:'',monthly:'',total:'',start:TODAY.slice(0,7),months:'',paidN:'',inCom:false,note:''}};
  window.scrollTo(0,0);render(true);setTimeout(()=>{const e=document.querySelector('#dfcard input');if(e)e.focus()},50)}
function dfDoc(k,w){const id=k==='ans'?aId(w):dId(w);if(!S.lists[id])S.lists[id]={title:(k==='ans'?'Debt Ansuran ':'Debt ')+PN[w],section:k==='ans'?'ansuran':'debt',w,order:(w==='s'?1:3)+(k==='ans'?1:0),items:[]};return id}
function dfSave(){const f=S.df,d=f.d,tr=v=>String(v??'').trim();
  if(f.k==='pay'){const id=dfDoc(f.kind,f.w),a=numIn(d.a);if(!a||Number.isNaN(a)||a<0)return toast('Isi jumlah bayar.');const it=S.lists[id].items[f.i];(it.pays=it.pays||[]).push({a,d:d.d||TODAY,note:tr(d.note)});S.df=null;save('lists',id);toast('Bayaran direkod.');return render(true)}
  const id=dfDoc(f.k,f.w),n=tr(d.n);if(!n)return toast('Isi nama dulu.');
  if(f.k==='debt'){const a=d.hasSub?null:numIn(d.a);if(Number.isNaN(a))return toast('Jumlah mesti nombor.');const it=f.i!=null?S.lists[id].items[f.i]:{sub:[]};it.n=n;if(!d.hasSub)it.a=a;it.note=tr(d.note);if(f.i==null)S.lists[id].items.push(it)}
  else{const v=['monthly','total','months','paidN'].map(k=>numIn(d[k]));if(v.some(x=>Number.isNaN(x)))return toast('Nombor sahaja untuk jumlah dan bulan.');
    const it=f.i!=null?S.lists[id].items[f.i]:{};Object.assign(it,{n,monthly:v[0],total:v[1],months:v[2]==null?null:Math.round(v[2]),paidN:v[3]==null?null:Math.round(v[3]),start:tr(d.start),inCom:!!d.inCom,note:tr(d.note)});
    if(it.total!=null||(it.monthly&&it.months))delete it.balance;if(f.i==null)S.lists[id].items.push(it)}
  S.df=null;save('lists',id);toast('Disimpan.');render(true)}

/* Bersama: siapa tanggung siapa */
function vTanggung(){if(!S.ready)return wait();
  const part=w=>comItems(w).filter(x=>docOwner(x.id)!==w),grp=w=>{const g={};part(w).forEach(x=>{const k=forLabel(x.d);(g[k]=g[k]||[]).push(x)});return g};
  const card=w=>{const g=grp(w),t=sum(part(w).map(x=>x.it.a));
    return`<div class="card"><div class="head"><h2>${PN[w]} tanggung</h2><span class="tot">${rm(t)} sebulan</span></div>`+
     (Object.keys(g).length?Object.entries(g).map(([k,a])=>`<p class="hand" style="margin:8px 0 2px">Untuk ${esc(k)} · ${rm(sum(a.map(x=>x.it.a)))}</p>`+a.map(x=>`<div class="row"><span class="nm">${esc(x.it.n)}</span><span class="amt ${pc(w)}">${rm(x.it.a)}</span></div>`).join('')).join(''):`<p class="note">${PN[w]} hanya bayar komitmen sendiri.</p>`)+`</div>`};
  const sm=sum(comItems('m').filter(x=>docOwner(x.id)==='s').map(x=>x.it.a)),ss=sum(comItems('s').filter(x=>docOwner(x.id)==='m').map(x=>x.it.a)),df=r2(sm-ss);
  let h=`<div class="card"><div class="head"><h2>Antara Syafiq &amp; Mira</h2></div>
   <div class="row"><span class="nm">Mira bayar untuk Syafiq</span><span class="amt pm">${rm(sm)}</span></div>
   <div class="row"><span class="nm">Syafiq bayar untuk Mira</span><span class="amt ps">${rm(ss)}</span></div>
   <div class="row"><span class="nm"><b>Beza sebulan</b><small>${df===0?'Seimbang':(df>0?'Mira':'Syafiq')+' tanggung lebih untuk pasangan'}</small></span><b class="amt ${df>0?'pm':df<0?'ps':''}">${rm(Math.abs(df))}</b></div>
   <p class="note" style="margin-top:6px">Komitmen untuk anak dan keluarga tak dikira dalam beza ni; ia ada dalam kad di bawah.</p></div>`;
  h+=`<div class="grid">${card('m')}${card('s')}${sec('split').map(([id,d])=>splitCard(id,d)).join('')}</div>`;
  return h}

/* Sync tab FINANCE SYAFIQ / FINANCE MIRA dalam sheet SPENDING */
const FTAB={s:'FINANCE SYAFIQ',m:'FINANCE MIRA'},FGID={s:882,m:883},FROWS=400,FRANGE=w=>`'${FTAB[w]}'!A1:J${FROWS}`;
const FS={s:{},m:{},busy:false,t:0};
const fsDoc=()=>S.lists['fin-sync']||(S.lists['fin-sync']={title:'Sync finance',section:'sys',s:{},m:{}});
function finTouch(id){let ws=null;if(id==='income')ws=['s','m'];else{const m=/^(?:c-|r-|debt-|ans-)(syafiq|mira)$/.exec(id);if(m)ws=[m[1][0]];else if(/^k-/.test(id)||id==='split')ws=['s','m']}
  if(!ws||!db||!S.ready)return;const D=fsDoc();ws.forEach(w=>D[w]=Object.assign({},D[w],{dirty:Date.now()}));save('lists','fin-sync');finAuto()}
const tx=s=>s?"'"+s:'';
function finBlock(w){const rows=[],row=a=>rows.push(a.concat(Array(10).fill('')).slice(0,10)),bl=()=>row([]),C=cash(w);
  row(['FINANCE '+PN[w].toUpperCase(),'','','','','','','','','Ditulis oleh app Home Syafiq. Boleh ubah nama dan nombor; jangan ubah tajuk seksyen.']);
  row(['Dikemaskini',tx(TODAY+' '+pad(new Date().getHours())+':'+pad(new Date().getMinutes()))]);bl();
  row(['RINGKASAN']);row(['Pendapatan sebulan',C.I.v??'',C.I.src]);row(['Komitmen',C.com]);row(['Ansuran luar komitmen',C.ao]);row(['Baki sebulan',C.bal??'']);bl();
  row(['KOMITMEN']);row(['Item','Jumlah (RM)','Untuk','Nota']);comItems(w).forEach(x=>row([x.it.n,x.it.a??'',forLabel(x.d),x.it.note||'']));row(['JUMLAH',C.com]);bl();
  row(['RESERVE']);row(['Item','Jumlah (RM)']);its(rId(w)).forEach(i=>row([i.n,i.a??'']));row(['JUMLAH',r2(sum(its(rId(w)).map(i=>i.a)))]);bl();
  row(['HUTANG']);row(['Hutang','Item','Jumlah (RM)','Dah bayar','Baki','Nota']);its(dId(w)).forEach(i=>{row([i.n,'JUMLAH',i.a??'',dPaid(i),dBal(i),i.note||'']);(i.sub||[]).forEach(x=>row(['',x.n,x.a??'']))});bl();
  row(['ANSURAN']);row(['Item','Bulanan','Jumlah penuh','Mula','Tempoh (bulan)','Dah bayar (bulan)','Baki','Habis','Dalam komitmen','Nota']);
  its(aId(w)).forEach(i=>{const c=ansCalc(i);row([i.n,i.monthly??'',i.total??'',tx(i.start||''),i.months??'',i.paidN??'',c.bal??'',c.end||'',i.inCom?'YA':'',i.note||''])});bl();
  row(['BAYARAN']);row(['Tarikh','Hutang / ansuran','Jumlah (RM)','Nota','Jenis']);
  [[dId(w),'Hutang'],[aId(w),'Ansuran']].forEach(([id,k])=>its(id).forEach(i=>(i.pays||[]).forEach(p=>row([tx(p.d),i.n,p.a,p.note||'',k]))));
  const over=rows.length>FROWS;while(rows.length<FROWS)bl();return{rows:rows.slice(0,FROWS),over}}
function dNorm(s,mo){s=String(s||'').trim();let m=/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/.exec(s),y,M,D;
  if(m){y=+m[1];M=+m[2];D=+(m[3]||1)}else if((m=/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s))){y=+m[3];const a=+m[1],b=+m[2];if(a>12){D=a;M=b}else{M=a;D=b}}else return s;
  return mo?y+'-'+pad(M):y+'-'+pad(M)+'-'+pad(D)}
function finPull(w,vals){const V=vals.map(r=>(r||[]).map(x=>String(x??'').trim())),HEAD={RINGKASAN:'sum',KOMITMEN:'com',RESERVE:'res',HUTANG:'debt',ANSURAN:'ans',BAYARAN:'pay'},o={com:[],res:[],debt:[],ans:[],pay:[]},seen={};let sc='',cur=null;
  for(const r of V){const a=r[0]||'',A=a.toUpperCase();
    if(HEAD[A]&&!r.slice(1).some(x=>x)){sc=HEAD[A];seen[sc]=1;continue}
    if(!r.some(x=>x)||A==='JUMLAH'||sc==='sum'||!sc)continue;
    if(/^(item|hutang|tarikh)$/i.test(a)&&/jumlah|item|bulanan|hutang/i.test(r[1]||''))continue;
    if(sc==='com'&&a)o.com.push({n:a,a:numS(r[1]),untuk:(r[2]||'').toLowerCase(),note:r[3]||''});
    else if(sc==='res'&&a)o.res.push({n:a,a:numS(r[1])});
    else if(sc==='debt'){if(a){cur={n:a,a:numS(r[2]),note:r[5]||'',sub:[]};o.debt.push(cur)}else if(cur&&r[1])cur.sub.push({n:r[1],a:numS(r[2])})}
    else if(sc==='ans'&&a)o.ans.push({n:a,monthly:numS(r[1]),total:numS(r[2]),start:r[3]?dNorm(r[3],1):'',months:numS(r[4]),paidN:numS(r[5]),inCom:/^ya$/i.test(r[8]||''),note:r[9]||''});
    else if(sc==='pay'&&a&&r[1])o.pay.push({d:dNorm(a),n:r[1],a:numS(r[2]),note:r[3]||'',k:/ansuran/i.test(r[4]||'')?'a':'d'})}
  if(!seen.com||!seen.debt||!seen.ans)return{ok:false};
  const bak={title:'Backup sebelum ambil dari Sheet',section:'sys',at:Date.now(),docs:{}};
  sec('commitment').forEach(([id,d])=>bak.docs[id]=JSON.parse(JSON.stringify(d)));[rId(w),dId(w),aId(w)].forEach(id=>{if(L(id))bak.docs[id]=JSON.parse(JSON.stringify(L(id)))});
  S.lists['fin-bak-'+w]=bak;save('lists','fin-bak-'+w);
  const own='c-'+WHO[w],docs=sec('commitment');
  docs.forEach(([id,d])=>{d.items=(d.items||[]).filter(i=>i.w!==w)});
  o.com.forEach(x=>{const t=docs.find(([,d])=>forLabel(d).toLowerCase()===x.untuk)||docs.find(([id])=>id===own);if(!t)return;const it={n:x.n,a:x.a,w};if(x.note)it.note=x.note;t[1].items.push(it)});
  const pays=k=>n=>o.pay.filter(p=>p.k===k&&p.n===n&&p.a!=null).map(p=>{const q={a:p.a,d:p.d};if(p.note)q.note=p.note;return q});
  vReserveP(w);dfDoc('debt',w);dfDoc('ans',w);
  S.lists[rId(w)].items=o.res;
  S.lists[dId(w)].items=o.debt.map(x=>{const it={n:x.n,a:x.sub.length?r2(sum(x.sub.map(s=>s.a))):x.a,sub:x.sub};if(x.note)it.note=x.note;const p=pays('d')(x.n);if(p.length)it.pays=p;return it});
  S.lists[aId(w)].items=o.ans.map(x=>{const it=Object.assign({},x);const p=pays('a')(x.n);if(p.length)it.pays=p;return it});
  docs.forEach(([id])=>save('lists',id));[rId(w),dId(w),aId(w)].forEach(id=>save('lists',id));
  return{ok:true,n:o.com.length+o.res.length+o.debt.length+o.ans.length}}
async function finSync(w,mode){if(!mcp){FS[w]={st:'err',msg:'Tak dapat sambung ke Google Sheet. Semak internet dan cuba lagi.'};return render()}if(FS.busy)return;FS.busy=true;FS[w]={st:'busy'};render();let again=false;
  try{const get=()=>mcp.callTool(GS,'get_values',{spreadsheetId:BILL_SHEET,range:FRANGE(w)},{cache:{refresh:true}}).then(r=>(r&&r.payload&&r.payload.values)||[]);
    const vals=await get(),h=hsh(vals),c=fsDoc()[w]||{};
    if(mode==='pull'){const r=finPull(w,vals);FS[w]=r.ok?{st:'ok',msg:'Diambil dari Sheet: '+r.n+' baris. Salinan lama disimpan.'}:{st:'err',msg:'Susunan tab '+FTAB[w]+' tak dikenali (tajuk KOMITMEN, HUTANG atau ANSURAN hilang), jadi tiada apa diambil.'};again=r.ok;return}
    if(!c.hash&&mode!=='force'&&vals.some(r=>(r||[]).some(x=>String(x??'').trim()))){FS[w]={st:'notempty'};return}
    if(c.hash&&h!==c.hash&&mode!=='force'){FS[w]={st:'changed'};return}
    const B=finBlock(w);await mcp.callTool(GS,'update_values',{spreadsheetId:BILL_SHEET,range:FRANGE(w),values:B.rows});
    const after=await get(),D=fsDoc();D[w]={hash:hsh(after),at:Date.now(),dirty:0};save('lists','fin-sync');FS[w]={st:'ok',msg:B.over?'Lebih '+FROWS+' baris, sebahagian tak masuk Sheet.':''}}
  catch(e){FS[w]={st:'err',msg:'Tak dapat tulis ke tab '+FTAB[w]+'. Semak sambungan Google Sheets.'}}
  finally{FS.busy=false;render(true)}
  if(again)finSync(w,'force')}
function finAuto(){clearTimeout(FS.t);FS.t=setTimeout(()=>{if(!mcp||FS.busy||!S.ready)return;const D=fsDoc();for(const w of['s','m']){if((D[w]||{}).dirty&&!['changed','notempty','busy'].includes((FS[w]||{}).st)){finSync(w,'auto');return}}},2500)}
setInterval(finAuto,20000);
function fsCard(w){const c=fsDoc()[w]||{},st=FS[w]||{};
  const msg=st.st==='busy'?'Tengah tulis ke Sheet…':st.st==='changed'?'Ada perubahan dalam Sheet yang belum diambil. Ambil dulu, atau tulis ganti dengan data app.':st.st==='notempty'?'Tab tu dah ada data lain, jadi app tak tulis. Tekan Tulis ganti kalau memang nak ganti.':st.msg||'';
  return`<div class="card"><div class="head"><h2>Google Sheet</h2><a class="mini" href="https://docs.google.com/spreadsheets/d/${HS.sheetId(BILL_SHEET)}/edit#gid=${FGID[w]}" target="_blank" rel="noopener">Buka ↗</a></div>
   <div class="row"><span class="ic">📊</span><span class="nm">Tab ${FTAB[w]}<small>sheet SPENDING · ditulis ${ago2(c.at)}${c.dirty?' · ada perubahan belum ditulis':''}</small></span></div>
   ${msg?`<p class="note ${['changed','notempty','err'].includes(st.st)?'warnt':''}" style="margin-top:6px">${esc(msg)}</p>`:''}
   <div class="acts"><button class="btn ghost" data-fsync="pull|${w}" ${FS.busy?'disabled':''}>Ambil dari Sheet</button><button class="btn" data-fsync="${['changed','notempty'].includes(st.st)?'force':'auto'}|${w}" ${FS.busy?'disabled':''}>${['changed','notempty'].includes(st.st)?'Tulis ganti':'Tulis sekarang'}</button></div>
   <p class="note" style="margin-top:6px">Setiap perubahan dalam app ditulis sendiri ke tab ni. Kalau ubah dalam Sheet, tekan Ambil dari Sheet.</p></div>`}

/* Resize dan crop gambar sebelum upload */
const RZS={photo:[['s','Kecil',320],['m','Sederhana',640],['l','Besar',1080]],doc:[['s','Kecil',1000],['m','Sederhana',1600],['l','Besar',2400],['o','Asal',0]]};
const mb=b=>b>=1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB';
function rzOpen(f,kind){return new Promise(done=>{if(!f||!/^image\//.test(f.type)||/gif|svg/i.test(f.type))return done(f);
  const u=URL.createObjectURL(f),im=new Image();
  im.onerror=()=>{URL.revokeObjectURL(u);done(f)};
  im.onload=()=>{const crop=kind==='photo',W=im.naturalWidth,H=im.naturalHeight,P=280,st={z:1,cx:W/2,cy:H/2,sz:'m',blob:null,seq:0};
    const ov=document.createElement('div');ov.className='rz';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Saiz gambar');
    ov.innerHTML=`<div class="rzc card"><div class="head"><h2>${crop?'Crop &amp; saiz':'Saiz gambar'}</h2></div><div class="rzw ${crop?'sq':''}"><canvas id="rzcv"></canvas></div>
     ${crop?`<label class="fl">Zoom<input type="range" id="rzz" min="1" max="3" step="0.01" value="1"></label><p class="note">Seret gambar untuk pilih bahagian.</p>`:''}
     <div class="chips rzs">${RZS[crop?'photo':'doc'].map(s=>`<button class="pill" data-rzs="${s[0]}" aria-pressed="${s[0]===st.sz}">${s[1]}</button>`).join('')}</div>
     <p class="note" id="rzi">Asal ${W}×${H} · ${mb(f.size)}</p><div class="acts"><button class="btn ghost" data-rzx="1">Batal</button><button class="btn" data-rzok="1">Guna</button></div></div>`;
    document.body.appendChild(ov);const cv=ov.querySelector('#rzcv'),cx=cv.getContext('2d'),info=ov.querySelector('#rzi');
    const side=()=>Math.min(W,H)/st.z,clamp=()=>{if(!crop)return;const s=side()/2;st.cx=Math.min(W-s,Math.max(s,st.cx));st.cy=Math.min(H-s,Math.max(s,st.cy))};
    const src=()=>{if(!crop)return[0,0,W,H];const s=side();return[st.cx-s/2,st.cy-s/2,s,s]};
    const draw=()=>{clamp();const r=src();if(crop){cv.width=P;cv.height=P}else{const k=Math.min(1,P/Math.max(W,H))*1.2;cv.width=Math.round(W*k);cv.height=Math.round(H*k)}cx.drawImage(im,r[0],r[1],r[2],r[3],0,0,cv.width,cv.height)};
    const out=()=>new Promise(res=>{const s=RZS[crop?'photo':'doc'].find(x=>x[0]===st.sz),r=src();
      if(!crop&&!s[2])return res(f);const k=Math.min(1,s[2]/Math.max(r[2],r[3])),c=document.createElement('canvas');c.width=Math.max(1,Math.round(r[2]*k));c.height=Math.max(1,Math.round(r[3]*k));
      c.getContext('2d').drawImage(im,r[0],r[1],r[2],r[3],0,0,c.width,c.height);c.toBlob(b=>res(b||f),'image/jpeg',.85)});
    const est=()=>{const q=++st.seq;info.textContent='Asal '+W+'×'+H+' · '+mb(f.size)+' → kira…';out().then(b=>{if(q!==st.seq)return;st.blob=b;const s=RZS[crop?'photo':'doc'].find(x=>x[0]===st.sz),r=src(),k=s[2]?Math.min(1,s[2]/Math.max(r[2],r[3])):1;info.textContent='Asal '+W+'×'+H+' · '+mb(f.size)+' → '+(b===f?'tak diubah':Math.round(r[2]*k)+'×'+Math.round(r[3]*k)+' · '+mb(b.size))})};
    let tm=0;const later=()=>{clearTimeout(tm);tm=setTimeout(est,250)};
    const close=v=>{ov.remove();URL.revokeObjectURL(u);done(v)};
    draw();est();
    if(crop){const z=ov.querySelector('#rzz');z.oninput=()=>{st.z=+z.value;draw();later()};let drag=null;
      cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId)});
      cv.addEventListener('pointermove',e=>{if(!drag)return;const k=side()/cv.getBoundingClientRect().width;st.cx-=(e.clientX-drag.x)*k;st.cy-=(e.clientY-drag.y)*k;drag={x:e.clientX,y:e.clientY};draw()});
      const up=()=>{if(drag){drag=null;later()}};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up)}
    ov.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();
      if(b.dataset.rzs){st.sz=b.dataset.rzs;ov.querySelectorAll('[data-rzs]').forEach(x=>x.setAttribute('aria-pressed',x===b));est()}
      if(b.dataset.rzx)close(null);
      if(b.dataset.rzok){b.disabled=true;b.textContent='Tengah siapkan…';close(await out())}})}
  im.src=u})}

/* Klik dan input */
function finClick(b,d){
  if(d.fp){S.fp=d.fp;S.edit=false;S.df=null;if(S.fp!=='b')S.tw=S.fp;if(!fTabs().some(t=>t[0]===S.ft))S.ft='overview';try{localStorage.setItem('fp',S.fp)}catch(_){}return render(true),true}
  if(d.dfnew){dfOpen(d.dfnew,S.fp,null);return true}
  if(d.dfedit){const[k,i]=d.dfedit.split('|');dfOpen(k,S.fp,+i);return true}
  if(d.dfpay){const[k,i]=d.dfpay.split('|'),it=its(k==='ans'?aId(S.fp):dId(S.fp))[+i];dfOpen('pay',S.fp,+i,{kind:k,n:it.n});return true}
  if(d.dfx){S.df=null;return render(true),true}
  if(d.dfsave){dfSave();return true}
  if(d.dfdel){const f=S.df;if(!f.sure){f.sure=true;return render(true),true}const id=f.k==='ans'?aId(f.w):dId(f.w);S.lists[id].items.splice(f.i,1);S.df=null;save('lists',id);toast('Dibuang.');return render(true),true}
  if(d.pdel){const[id,i,k]=d.pdel.split('|'),it=S.lists[id].items[+i];it.pays.splice(+k,1);if(!it.pays.length)delete it.pays;save('lists',id);return render(true),true}
  if(d.fsync){const[m,w]=d.fsync.split('|');finSync(w,m);return true}
  if(d.fincreset){const D=S.lists.income=S.lists.income||{title:'Pendapatan',section:'sys'};D[d.fincreset]={a:null};save('lists','income');return render(true),true}
  return false}
document.addEventListener('input',e=>{const t=e.target,k=t.dataset&&t.dataset.df;if(k&&S.df)S.df.d[k]=t.value});
document.addEventListener('change',e=>{const t=e.target,d=t.dataset||{};
  if(d.dfc&&S.df){S.df.d[d.dfc]=t.checked;return}
  if(d.finc){const v=numIn(t.value);if(Number.isNaN(v)){toast('Masukkan nombor sahaja.');return render(true)}const D=S.lists.income=S.lists.income||{title:'Pendapatan',section:'sys'};D[d.finc]={a:v};save('lists','income');render(true)}});

function render(force){const ae=document.activeElement;
  if(!force&&ae&&ae.tagName==='INPUT'&&ae.type!=='checkbox'&&$('#app').contains(ae)){dirty=true;return}dirty=false;
  if(wkid()&&!['home','well'].includes(S.main))S.main='home';$('#tabs').innerHTML=(wkid()?MAIN.filter(t=>t[0]==='home'||t[0]==='well'):MAIN).map(t=>`<button type="button" data-main="${t[0]}" ${(MAIN.some(x=>x[0]===S.main)?S.main:'lagi')===t[0]?'aria-current="page"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${t[2]}</svg>${t[1]}</button>`).join('');
  if(S.main==='finance'&&!fTabs().some(t=>t[0]===S.ft))S.ft='overview';if(S.fp!=='b')S.tw=S.fp;
  const F=fTabs().find(t=>t[0]===S.ft)||fTabs()[0],T=S.main==='home'&&S.person?['Keluarga',S.person==='profile'?'Butiran keluarga':pname(S.person)]:{home:[DAYS[now.getDay()]+', '+now.getDate()+' '+MFULL[now.getMonth()],'Home Syafiq'],finance:['Finance · '+(S.fp==='b'?'Bersama':PN[S.fp]),F[2]],check:['Sama-sama settle','Checklist'],goals:['Simpan sama-sama','Goals'],well:['Sihat sama-sama','Wellness'],menu:['Apa masak hari ni?','Menu'],lagi:['Semua yang lain','Lagi'],tetapan:['Telegram, kod anak, Apple Pay','Bot & tetapan'],chores:['Tugas rumah bergilir','Chores'],parenting:['Doa dan tips','Parenting'],trips:['Bucket list keluarga','Trips']}[S.main]||['','Home Syafiq'];
  $('#hd-sub').textContent=T[0];$('#hd-title').textContent=T[1];
  const eb=$('#editBtn');eb.setAttribute('aria-pressed',S.edit);eb.textContent=S.edit?'Siap':'Edit';eb.hidden=wkid()||['well','lagi','tetapan'].includes(S.main)||(S.main==='finance'&&['overview','yearly','cukai','debt','tanggung'].includes(S.ft))||(S.main==='home'&&!!S.person);
  let h='';
  if(S.main==='home')h=S.person?vPerson():vHome();else if(S.main==='check')h=vCheck();else if(S.main==='goals')h=vGoals();else if(S.main==='well')h=vWell();else if(S.main==='menu')h=vMenu();else if(S.main==='lagi')h=vLagi();else if(S.main==='parenting')h=vParenting();else if(S.main==='trips')h=vTrips();else if(S.main==='tetapan')h=vTetapan();else if(S.main==='chores')h=vChores();
  else if(finLocked(S.fp))h=finSwitch()+vFinLock(S.fp);else{const P=S.fp;h=finSwitch()+`<div class="menu glass">${fTabs().map(t=>`<button class="mi" data-ft="${t[0]}" aria-pressed="${S.ft===t[0]}">${t[1]}</button>`).join('')}</div>`+({dash:()=>vFinDash(P),overview:()=>P==='b'?vOverview():vPOver(P),tanggung:vTanggung,bill:vBill,breakdown:vBreak,commitment:()=>vCommitP(P),reserve:()=>vReserveP(P),debt:()=>vDebtP(P),cukai:vTax,yearly:vYearly}[S.ft]||vOverview)()}
  const th=wkid()?PTH[wme()]||'':(S.main==='home'&&S.person&&PTH[S.person])||'';document.body.dataset.th=th;
  $('#app').innerHTML=h;if(th){const t=$('#app .tiles'),sd=$('#app .phero2 .pside');if(t&&sd)sd.appendChild(t)}const on=$('.menu [aria-pressed="true"]');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest',inline:'center'})}

/* Bills: one source, the BILL tab of the SPENDING sheet (shared with Planner Mira) */
const BILL_SHEET='SPENDING',BILL_RANGE='BILL!A1:Z200',GS='Google Sheets';
let mcp=null;const SB={ready:false,doc:null,meta:null,err:'',busy:false};
const colL=i=>{let s='';i++;while(i>0){const r=(i-1)%26;s=String.fromCharCode(65+r)+s;i=Math.floor((i-1)/26)}return s};
const mHead=m=>MN[m]+' 2026 dah bayar';
function bParse(p){const rows=(p&&p.values)||[],head=(rows[1]||[]).map(x=>String(x||'').trim()),cols={},items=[];let nextCol=5,lastRow=2;
  const num=s=>{const n=parseFloat(String(s==null?'':s).replace(/[^0-9.\-]/g,''));return isFinite(n)?n:null};
  head.forEach((x,i)=>{if(x)nextCol=Math.max(nextCol,i+1);const m=/^(\S+) 2026 dah bayar$/i.exec(x);if(m){const k=MN.findIndex(n=>n.toLowerCase()===m[1].toLowerCase());if(k>=0)cols[k]=i}});
  for(let i=2;i<rows.length;i++){const r=rows[i]||[],n=String(r[0]||'').trim();if(!n)continue;lastRow=i+1;const paid={};
    Object.keys(cols).forEach(k=>{if(String(r[cols[k]]||'').trim().toUpperCase()==='YA')paid['2026-'+pad(+k+1)]=true});
    items.push({n,a:num(r[1]),due:parseInt(r[2],10)||null,w:/syafiq/i.test(String(r[3]||''))?'s':'m',hint:String(r[4]||'').trim(),row:i+1,paid})}
  return{ok:(head[0]||'').toLowerCase()==='bill'&&/jumlah/i.test(head[1]||''),items,cols,nextCol,nextRow:lastRow+1}}
const BILLS=()=>SB.ready?SB.doc:(S.lists.bills||null);
const sUpd=(range,values)=>mcp.callTool(GS,'update_values',{spreadsheetId:BILL_SHEET,range:'BILL!'+range,values});
function bWrite(it,fn){if(!SB.ready||!mcp){toast('Tak dapat sambung ke Sheet, jadi bill belum boleh diubah.');return render(true)}if(SB.busy)return;SB.busy=true;
  mcp.callTool(GS,'get_values',{spreadsheetId:BILL_SHEET,range:BILL_RANGE},{cache:{refresh:true}}).then(r=>{const cur=bParse(r&&r.payload);
    if(!cur.ok)throw{code:'struct'};if(it){const nowB=cur.items.find(x=>x.row===it.row);if(!nowB||nowB.n!==it.n)throw{code:'moved'}}return fn(cur)})
  .then(()=>{toast('Disimpan ke Sheet.');return mcp.invalidate(GS,'get_values').catch(()=>{})})
  .catch(e=>toast(e&&e.code==='moved'?'Sheet baru berubah. Cuba lagi sekejap.':e&&e.code==='struct'?'Susunan tab BILL berubah, jadi tiada apa ditulis.':'Tak dapat tulis ke Sheet. Semak sambungan Google Sheets.'))
  .then(()=>{SB.busy=false;render(true)})}
function setPaid(cur,row,on,m){const go=c=>sUpd(colL(c)+row,[[on?'YA':'']]);return cur.cols[m]!=null?go(cur.cols[m]):sUpd(colL(cur.nextCol)+'2',[[mHead(m)]]).then(()=>go(cur.nextCol))}
function cacheBills(){try{const old=S.lists.bills;if(!db||!S.ready)return;if(JSON.stringify(SB.doc.items)===JSON.stringify((old&&old.items)||[]))return;
  S.lists.bills=JSON.parse(JSON.stringify(SB.doc));db.collection('lists').doc('bills').set(S.lists.bills).catch(()=>{})}catch(_){}}
function startBills(){mcp.watchTool(GS,'get_values',{spreadsheetId:BILL_SHEET,range:BILL_RANGE},ev=>{
    if(ev.type==='data'){const r=bParse(ev.result&&ev.result.payload);
      if(r.ok){const old=S.lists.bills||{};SB.doc={title:old.title||'Bill',section:'bill',order:old.order||0,items:r.items};SB.meta=r;SB.ready=true;SB.err='';cacheBills()}else{SB.ready=false;SB.err='struct'}}
    else{const c=ev.error&&ev.error.code;if(['needs_reauth','server_not_connected','selection_required','not_in_manifest','consent_required','blocked_by_policy','approval_required'].indexOf(c)>=0){SB.ready=false;SB.err=c}}
    render()},{refetchInterval:60000})}

function ref(k){const[col,id,i,f,j]=k.split('|');
  if(col==='lists'&&id==='bills'){const it=BILLS().items[+i];return{name:it.n,int:f==='due',get:()=>it[f],set:v=>{if(SB.ready)it[f]=v},save:()=>bWrite(it,()=>sUpd((f==='due'?'C':'B')+it.row,[[it[f]==null?'':it[f]]]))}}
  if(col==='tracker'){const it=S.tracker[id].items[+i];return{name:it.n,get:()=>it.a[S.month],set:v=>{it.a[S.month]=v;if(!v)it.p[S.month]=false},save:()=>save(col,id)}}
  if(col==='goals'){const g=S.goals[id];return{name:g.name,get:()=>g[f],set:v=>{g[f]=v},save:()=>save(col,id)}}
  const it=S.lists[id].items[+i];
  if(j!=null&&j!=='')return{name:it.sub[+j].n,get:()=>it.sub[+j].a,set:v=>{it.sub[+j].a=v;it.a=Math.round(sum(it.sub.map(x=>x.a))*100)/100},save:()=>save(col,id)};
  return{name:it.n,int:f==='due',get:()=>it[f],set:v=>{it[f]=v},save:()=>save(col,id)}}
function startEdit(btn){const r=ref(btn.dataset.amt),cur=r.get();
  const inp=document.createElement('input');inp.className='amtin';inp.type='text';inp.inputMode='decimal';inp.id='amt-edit';inp.setAttribute('aria-label','Nilai '+r.name);inp.value=cur==null?'':cur;
  btn.replaceWith(inp);inp.focus();inp.select();let live=true;
  const done=ok=>{if(!live)return;live=false;
    if(ok){const t=inp.value.trim().replace(/,/g,'');let v=t===''?null:Math.round(parseFloat(t)*100)/100;
      if(t!==''&&isNaN(v))toast('Masukkan nombor sahaja.');
      else{if(r.int&&v!=null)v=Math.min(31,Math.max(1,Math.round(v)));if(v!==cur){r.set(v);r.save()}}}
    render(true)};
  inp.onblur=()=>done(true);inp.onkeydown=e=>{if(e.key==='Enter')done(true);if(e.key==='Escape')done(false)}}
const TPL={commitment:id=>({a:null,w:S.fp==='b'?(id==='c-syafiq'?'s':'m'):S.fp}),bill:()=>({a:null,due:null,w:'m',paid:{}}),split:()=>({s:null,m:null}),reserve:()=>({a:null}),debt:()=>({a:null,sub:[]}),ansuran:()=>({monthly:null,balance:null,total:null})};
function val(id){const e=document.getElementById(id);if(!e)return'';const v=e.value.trim();if(!v)e.focus();return v}

document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(b.id==='editBtn'){S.edit=!S.edit;return render(true)}
  if(wkid()&&d.person!==undefined&&d.person!==''&&d.person!==wme())return toast('Tab ni untuk '+(d.person==='profile'?'mak ayah':pname(d.person))+' sahaja.');
  if(moreClick(b,d))return;
  if(famClick(b,d))return;
  if(taxClick(b,d))return;
  if(calClick(b,d))return;
  if(finClick(b,d))return;
  if(d.main){S.main=d.main;S.edit=false;S.person=null;S.fe=null;S.evf=null;try{localStorage.setItem('main',S.main)}catch(_){}window.scrollTo(0,0);return render(true)}
  if(d.ft){S.ft=d.ft;S.edit=false;try{localStorage.setItem('ft',S.ft)}catch(_){}return render(true)}
  if(d.month){S.month=+d.month;return render(true)}
  if(d.year){S.year=+d.year;return render(true)}
  if(d.cal){let m=S.cal.m+ +d.cal,y=S.cal.y;if(m<0){m=11;y--}if(m>11){m=0;y++}S.cal={y,m};return render(true)}
  if('day' in d){S.sel=d.day&&d.day!==S.sel?d.day:null;return render(true)}
  if(d.open){S.open[d.open]=!S.open[d.open];return render(true)}
  if(d.amt)return startEdit(b);
  if(d.who&&d.who.split('|')[0]==='bills'){const it=BILLS().items[+d.who.split('|')[1]];if(SB.ready)it.w=it.w==='s'?'m':'s';bWrite(it,()=>sUpd('D'+it.row,[[it.w==='s'?'Syafiq':'Mira']]));return render(true)}
  if(d.who){const[id,i]=d.who.split('|'),it=S.lists[id].items[+i];it.w=it.w==='s'?'m':'s';save('lists',id);return render(true)}
  if(d.tent){const ev=S.events[d.tent];ev.tent=!ev.tent;save('events',d.tent);return render(true)}
  if(d.deldoc){const[col,id]=d.deldoc.split('|');delete S[col][id];if(db)db.collection(col).doc(id).delete().catch(fail);return render(true)}
  if(d.del){const[col,id,i,j]=d.del.split('|'),D=S[col][id];
    if(j!=null){const it=D.items[+i];it.sub.splice(+j,1);if(it.sub.length)it.a=Math.round(sum(it.sub.map(x=>x.a))*100)/100}else D.items.splice(+i,1);
    save(col,id);return render(true)}
  if(d.add){const p=d.add.split('|');
    if(p[0]==='event'){const n=val('ev-title'),dt=document.getElementById('ev-date').value;if(!n)return;if(!dt)return toast('Pilih tarikh dulu.');const id=newId();S.events[id]={title:n,date:dt,tent:true};save('events',id);const D=new Date(dt+'T00:00');S.cal={y:D.getFullYear(),m:D.getMonth()};return render(true)}
    if(p[0]==='goal'){const n=val('goal-name');if(!n)return;const t=parseFloat(document.getElementById('goal-target').value.replace(/,/g,''));const id=newId();S.goals[id]={name:n,target:isNaN(t)?null:Math.round(t*100)/100,s:0,m:0,order:Date.now()};save('goals',id);return render(true)}
    if(p[0]==='check'){const n=val(p[1]?'add-check-'+p[1]:'add-check');if(!n)return;const fo=p[1]||((document.getElementById('add-for')||{}).value||'');if(!S.lists.checklist)S.lists.checklist={title:'Checklist',section:'check',items:[]};S.lists.checklist.items.push(fo?{n,done:false,for:fo}:{n,done:false});save('lists','checklist');return render(true)}
    const n=val('add-'+p.join('-'));if(!n)return;
    if(p[0]==='sub'){const it=S.lists[p[1]].items[+p[2]];(it.sub=it.sub||[]).push({n,a:null});save('lists',p[1]);return render(true)}
    if(p[0]==='tracker'){S.tracker[p[1]].items.push({n,a:Array(12).fill(null),p:Array(12).fill(false)});save('tracker',p[1]);return render(true)}
    if(p[1]==='bills'){bWrite(null,cur=>sUpd('A'+cur.nextRow+':D'+cur.nextRow,[[n,'','',S.fp==='s'?'Syafiq':'Mira']]));return render(true)}
    const D=S.lists[p[1]];D.items.push(Object.assign({n},(TPL[D.section]||TPL.reserve)(p[1])));save('lists',p[1]);return render(true)}});
document.addEventListener('change',e=>{const t=e.target,d=t.dataset||{};
  if(d.chk){const[k,a,i]=d.chk.split('|');
    if(k==='t'){S.tracker[a].items[+i].p[S.month]=t.checked;save('tracker',a)}
    else if(k==='b'){const it=BILLS().items[+a],on=t.checked,m=S.month;if(SB.ready){it.paid=it.paid||{};if(on)it.paid[YM()]=true;else delete it.paid[YM()]}bWrite(it,cur=>setPaid(cur,it.row,on,m))}
    else{S.lists.checklist.items[+a].done=t.checked;save('lists','checklist')}
    return render(true)}
  if(d.gin){const[id,f]=d.gin.split('|'),v=parseFloat(t.value.replace(/,/g,''));if(t.value.trim()!==''&&isNaN(v)){toast('Masukkan nombor sahaja.');return render(true)}
    S.goals[id][f]=isNaN(v)?0:Math.round(v*100)/100;save('goals',id);return render(true)}});
document.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.target.tagName!=='INPUT')return;const b=e.target.closest('.add');if(b){const btn=b.querySelector('[data-add]');if(btn)btn.click()}else if(e.target.dataset.gin)e.target.blur()});
document.addEventListener('focusout',()=>setTimeout(()=>{if(dirty)render()},0));

try{const a=localStorage.getItem('main'),f=localStorage.getItem('ft');if(MAIN.some(x=>x[0]===a))S.main=a;if(FTP.concat(FTB).some(x=>x[0]===f))S.ft=f;const fp=localStorage.getItem('fp');if(FP.some(x=>x[0]===fp))S.fp=fp}catch(_){}
render(true);
(async()=>{await HS.ready();db=await (window.claude&&window.claude.use?window.claude.use('db'):null);
  if(!db){S.msg='Data tak dapat dibuka. Tutup dan buka semula app.';return render(true)}
  const got={};const tm=setTimeout(()=>{if(!S.ready){S.msg='Data belum sampai. Sambungan mungkin perlahan.';render()}},10000);
  COLS.forEach(col=>db.collection(col).onSnapshot(s=>{const o={};s.docs.forEach(d=>o[d.id]=JSON.parse(JSON.stringify(d.data())));
    S[col]=o;got[col]=1;if(COLS.every(c=>got[c])){S.ready=true;clearTimeout(tm)}render()},
    ()=>{clearTimeout(tm);S.msg='Data tak dapat dibuka sekarang.';render()}));
  try{mcp=await window.claude.use('mcp')}catch(_){mcp=null}if(mcp)startBills();
  try{assets=await window.claude.use('assets')}catch(_){assets=null}try{dls=await window.claude.use('downloads')}catch(_){dls=null}render();startTax()})();
