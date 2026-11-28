/* layout.js (28 Nov 2026): susun kad macam widget phone. Hanya Mira boleh susun; semua phone dan tablet ikut susunan Mira.
 * Data: well/p-layout = {pg:{<halaman>:{o:[kunci kad ikut susunan], h:[kunci kad tersorok]}}}
 *   (awalan p- supaya tablet anak boleh baca melalui kidRead; hanya phone Mira menulis).
 * Halaman: 'home:' (Home), 'home:<orang>' (tab orang; tablet anak guna tab dia sendiri), 'fin:<s|m|b>:<tab>', atau nama tab (well, menu, lagi ...).
 * Kunci kad: data-ck kalau ada, kalau tiada: kelas kad + tajuk h2 (tanpa nombor, RM dan nama bulan supaya kekal bila bulan bertukar).
 * Masuk mod: tekan lama mana-mana kad (Mira sahaja). Seret ⠿ atau tekan ↑ ↓ untuk alih, Sorok / Tunjuk, Siap untuk keluar.
 * Dipanggil oleh render() dalam app.js selepas halaman dipapar (layApply). */
const LAY = { on: false, t: null, x: 0, y: 0, fired: false, eatUntil: 0, drag: null };
const layCan = () => !wkid() && wme() === 'mira';
const layDoc = () => { const d = wdoc('p-layout', { pg: {} }); d.pg = d.pg || {}; return d; };
function layPage() {
  if (wkid()) return S.main === 'home' ? 'home:' + wme() : S.main;
  if (S.main === 'home') return 'home:' + (S.person || '');
  if (S.main === 'finance') return 'fin:' + S.fp + ':' + S.ft;
  return S.main;
}
const LAY_MON = /\b(januari|februari|mac|april|mei|jun|julai|ogos|september|oktober|november|disember|jan|feb|apr|jul|ogo|sep|okt|nov|dis|isnin|selasa|rabu|khamis|jumaat|sabtu|ahad)\b/g;
function layKey(el) {
  if (el.dataset.ck) return el.dataset.ck;
  const h = el.querySelector('h2,h3');
  let t = (h ? h.textContent : '').toLowerCase().replace(/\brm\b|[0-9.,:%()·•\-–+/]/g, ' ').replace(LAY_MON, ' ').replace(/\s+/g, ' ').trim().slice(0, 40);
  if (!t) {                                                     // tiada tajuk tetap: guna nama data- pertama dalam kad (cth kalendar = cal)
    const a = [...el.querySelectorAll('*')].find(x => x.dataset && Object.keys(x.dataset).length);
    t = a ? '@' + Object.keys(a.dataset)[0] : '';
  }
  const c = [...el.classList].filter(x => !/^lay/.test(x)).sort().join('.');
  return c + '|' + t;
}
const layItems = () => [...($('#app') || { children: [] }).children].filter(e => e.classList.contains('layi'));

function layApply() {
  const app = $('#app'); if (!app) return;
  document.body.classList.toggle('laycan', layCan());
  const pk = layPage(), P = layDoc().pg[pk] || { o: [], h: [] }, hid = new Set(P.h || []);
  const items = [...app.children].filter(e => !e.matches('.menu,.fsw,.back,.chips,script,style,svg,button,.layx')), seen = {};
  items.forEach(e => { let k = layKey(e); if (seen[k] != null) k += '#' + (++seen[k]); else seen[k] = 0; e.dataset.lk = k; e.classList.add('layi'); });
  if (P.o && P.o.length) {                                     // susun ikut Mira; kad baru masuk selepas kad yang asalnya di atas dia
    const by = {}; items.forEach(e => by[e.dataset.lk] = e);
    const res = [...new Set(P.o)].filter(k => by[k]).map(k => by[k]);
    items.forEach((e, i) => { if (res.includes(e)) return; let j = i - 1; while (j >= 0 && !res.includes(items[j])) j--; res.splice(j < 0 ? 0 : res.indexOf(items[j]) + 1, 0, e); });
    const slots = items.map(e => { const c = document.createComment(''); e.before(c); return c; });
    slots.forEach((c, i) => c.replaceWith(res[i]));
  }
  items.forEach(e => { const off = hid.has(e.dataset.lk); e.classList.toggle('layoff', off && !LAY.on); e.classList.toggle('layhid', off && LAY.on); });
  document.body.classList.toggle('laying', LAY.on);
  let bar = $('#laybar');
  if (!LAY.on) { if (bar) bar.remove(); return; }
  items.forEach(e => {
    if (e.querySelector(':scope > .layc')) return;
    const off = hid.has(e.dataset.lk);
    e.insertAdjacentHTML('afterbegin', `<div class="layc"><button type="button" class="layh" data-lay="drag" aria-label="Tekan dan seret untuk alih kad"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><circle cx="9" cy="6" r="1.7"/><circle cx="15" cy="6" r="1.7"/><circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/><circle cx="9" cy="18" r="1.7"/><circle cx="15" cy="18" r="1.7"/></svg></button><button type="button" data-lay="up" aria-label="Alih ke atas">↑</button><button type="button" data-lay="dn" aria-label="Alih ke bawah">↓</button><button type="button" class="layv" data-lay="hide">${off ? 'Tunjuk' : 'Sorok'}</button></div>`);
  });
  if (!bar) { bar = document.createElement('div'); bar.id = 'laybar'; bar.className = 'glass'; document.body.appendChild(bar); }
  const n = hid.size;
  bar.innerHTML = `<span>Susun kad<small>Seret butang titik atau tekan ↑ ↓${n ? ' · ' + n + ' tersorok' : ''}</small></span><button type="button" class="btn ghost" data-lay="reset">Asal</button><button type="button" class="btn" data-lay="done">Siap</button>`;
}

function laySave() {
  const pk = layPage(), D = layDoc(), its = layItems();
  D.pg[pk] = { o: its.map(e => e.dataset.lk), h: its.filter(e => e.classList.contains('layhid')).map(e => e.dataset.lk) };
  wsave('p-layout');
}
function layExit() { LAY.on = false; LAY.drag = null; render(true); }

/* Tekan lama untuk masuk mod susun */
const layNoPress = t => t.closest('input,textarea,select,[contenteditable],.layc,#laybar,.rz');
document.addEventListener('pointerdown', e => {
  LAY.fired = false;
  if (LAY.on || !layCan() || e.button > 0) return;
  const it = e.target.closest && e.target.closest('#app .layi'); if (!it || layNoPress(e.target)) return;
  LAY.x = e.clientX; LAY.y = e.clientY; clearTimeout(LAY.t);
  LAY.t = setTimeout(() => {
    LAY.fired = true; LAY.on = true;
    try { window.getSelection().removeAllRanges(); } catch (_) {}
    if (navigator.vibrate) navigator.vibrate(15);
    render(true);
    const k = it.dataset.lk, el = layItems().find(x => x.dataset.lk === k); if (el) el.classList.add('laypick');
  }, 550);
}, true);
document.addEventListener('pointermove', e => { if (LAY.t && Math.hypot(e.clientX - LAY.x, e.clientY - LAY.y) > 10) { clearTimeout(LAY.t); LAY.t = null; } }, true);
const layUp = () => { clearTimeout(LAY.t); LAY.t = null; if (LAY.fired) { LAY.eatUntil = Date.now() + 450; LAY.fired = false; } };
document.addEventListener('pointerup', layUp, true);
document.addEventListener('pointercancel', layUp, true);
document.addEventListener('contextmenu', e => { if (layCan() && e.target.closest && e.target.closest('#app .layi') && !layNoPress(e.target)) e.preventDefault(); }, true);

/* Dalam mod susun: hanya butang susun yang jalan */
document.addEventListener('click', e => {
  if (Date.now() < LAY.eatUntil) { e.preventDefault(); e.stopImmediatePropagation(); LAY.eatUntil = 0; return; }
  if (!LAY.on) return;
  const b = e.target.closest && e.target.closest('[data-lay]');
  if (!b) { if (e.target.closest && e.target.closest('#app')) { e.preventDefault(); e.stopImmediatePropagation(); } return; }
  e.preventDefault(); e.stopImmediatePropagation();
  const a = b.dataset.lay;
  if (a === 'done') return layExit();
  if (a === 'reset') { delete layDoc().pg[layPage()]; wsave('p-layout'); toast('Susunan halaman ni kembali asal.'); return render(true); }
  const el = b.closest('.layi'); if (!el) return;
  const its = layItems(), i = its.indexOf(el);
  if (a === 'up' && i > 0) its[i - 1].before(el);
  else if (a === 'dn' && i < its.length - 1) its[i + 1].after(el);
  else if (a === 'hide') { const off = !el.classList.contains('layhid'); el.classList.toggle('layhid', off); b.textContent = off ? 'Tunjuk' : 'Sorok'; }
  else return;
  laySave();
  if (a !== 'hide') { el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); b.focus({ preventScroll: true }); }
  else render(true);
}, true);

/* Seret ⠿ */
document.addEventListener('pointerdown', e => {
  if (!LAY.on) return;
  const h = e.target.closest && e.target.closest('.layh'); if (!h) return;
  const el = h.closest('.layi'); if (!el) return;
  e.preventDefault();
  LAY.drag = { el, y: e.pageY, moved: false };
  el.classList.add('laydrag');
  try { h.setPointerCapture(e.pointerId); } catch (_) {}
}, true);
document.addEventListener('pointermove', e => {
  const D = LAY.drag; if (!D) return;
  e.preventDefault();
  const el = D.el, its = layItems(), i = its.indexOf(el), a = its[i - 1], b = its[i + 1];
  const mid = x => { const r = x.getBoundingClientRect(); return r.top + r.height / 2; };
  const shift = fn => { const t0 = el.offsetTop; fn(); D.y += el.offsetTop - t0; D.moved = true; };
  if (a && e.clientY < mid(a)) shift(() => a.before(el));
  else if (b && e.clientY > mid(b)) shift(() => b.after(el));
  el.style.transform = 'translateY(' + (e.pageY - D.y) + 'px)';
  if (e.clientY < 70) window.scrollBy(0, -14); else if (e.clientY > innerHeight - 110) window.scrollBy(0, 14);
}, { capture: true, passive: false });
const layDrop = () => {
  const D = LAY.drag; if (!D) return;
  LAY.drag = null; D.el.classList.remove('laydrag'); D.el.style.transform = '';
  if (D.moved) laySave();
};
document.addEventListener('pointerup', layDrop, true);
document.addEventListener('pointercancel', layDrop, true);
