/* Home Syafiq runtime: ganti window.claude (artifact) dengan Apps Script dalam Sheet SPENDING.
   Data: tab APP DATA (sync semua phone, simpan dalam phone bila offline, hantar bila online semula).
   Sheets: get_values / update_values melalui Apps Script. Gambar: folder Drive private, dihidang oleh sw.js. */
(function () {
  const API = window.HS_CONFIG.api;
  const LS = k => 'homesyafiq:' + k;
  const lsGet = (k, d) => { try { const v = localStorage.getItem(LS(k)); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(LS(k), JSON.stringify(v)); } catch (e) {} };
  let CODE = lsGet('code', ''), WHO = lsGet('who', '');
  const err = (code, message) => Object.assign(new Error(message || code), { code });

  async function call(action, body, opt) {
    if (!navigator.onLine) throw err('unavailable');
    if (!CODE && !(opt && opt.noAuth)) throw err('locked');   // belum masuk kod: jangan hantar (elak reload berulang di skrin Masuk)
    let r;
    try {
      r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow',
        body: JSON.stringify(Object.assign({ action, code: CODE, who: WHO }, body || {})) });
    } catch (e) { throw err('unavailable'); }
    let j; try { j = await r.json(); } catch (e) { throw err('unavailable'); }
    if (!j.ok) {
      if (j.auth && !(opt && opt.noAuth) && lsGet('code', '')) { lsSet('code', ''); location.reload(); }
      throw Object.assign(err(j.conflict ? 'conflict' : 'tool_error', j.error), { res: j });
    }
    return j;
  }

  /* ---------------- data store (bentuk sama dengan db artifact) ---------------- */
  const cache = lsGet('cache', {});          // path -> data
  const ver = lsGet('ver', {});              // path -> updated (ms) yang phone ni kenal
  let since = lsGet('since', 0);
  let outbox = lsGet('outbox', []);          // [{p,d,b}]  b = versi asas
  const colSubs = {};
  const persist = () => { lsSet('cache', cache); lsSet('ver', ver); lsSet('since', since); lsSet('outbox', outbox); };
  const colOf = p => p.split('/').slice(0, -1).join('/');
  function emitCol(col) {
    (colSubs[col] || []).forEach(cb => {
      const docs = Object.keys(cache).filter(p => colOf(p) === col && cache[p] != null)
        .map(p => ({ id: p.split('/').pop(), data: () => JSON.parse(JSON.stringify(cache[p])) }));
      try { cb({ docs }); } catch (e) { console.error(e); }
    });
  }
  function apply(p, d) { if (d == null) delete cache[p]; else cache[p] = d; emitCol(colOf(p)); }

  let pulling = false, flushing = false, ready = false;
  const inflight = new Set();
  async function pull() {
    if (pulling) return; pulling = true;
    try {
      await flush();
      const j = await call('pull', { since });
      const pending = new Set(outbox.map(w => w.p));
      j.docs.forEach(x => { ver[x.p] = x.u; if (!pending.has(x.p)) apply(x.p, x.d); since = Math.max(since, x.u); });
      persist(); setNet('ok');
    } catch (e) { setNet(e.code === 'unavailable' ? 'offline' : 'err'); }
    finally { pulling = false; }
  }
  async function flush() {
    if (flushing || !outbox.length) return; flushing = true;
    try {
      while (outbox.length) {
        const batch = outbox.slice(0, 20); batch.forEach(w => inflight.add(w));
        let j; try { j = await call('put', { writes: batch }); } finally { batch.forEach(w => inflight.delete(w)); }
        outbox = outbox.filter(w => !batch.includes(w));
        (j.res || []).forEach((r, i) => {
          const w = batch[i], later = outbox.find(x => x.p === w.p);   // tulis baru semasa batch ni dalam perjalanan
          ver[w.p] = r.u;
          if (later) later.b = r.u;
          else if (r.conflict) { apply(w.p, r.d); toastSoon('Ada perubahan dari phone lain. Data dah dikemas kini, cuba ubah lagi.'); }
        });
        persist();
      }
      setNet('ok');
    } finally { flushing = false; }
  }
  function write(p, d) {
    const prev = outbox.find(w => w.p === p && !inflight.has(w));      // belum dihantar: ganti, kekal versi asas
    apply(p, d);
    outbox = outbox.filter(w => w !== prev); outbox.push({ p, d, b: prev ? prev.b : (ver[p] || 0) }); persist();
    return flush().catch(e => { setNet(e.code === 'unavailable' ? 'offline' : 'err'); });
  }
  const db = {
    collection(col) {
      return {
        onSnapshot(cb) { (colSubs[col] = colSubs[col] || []).push(cb); if (ready) setTimeout(() => emitCol(col), 0); return () => {}; },
        doc(id) { const p = col + '/' + id; return { set: d => write(p, d), delete: () => write(p, null) }; }
      };
    }
  };

  /* ---------------- Google Sheets (bentuk sama dengan connector lama) ---------------- */
  const watchers = [];
  async function callTool(server, tool, args) {
    if (tool !== 'get_values' && tool !== 'update_values') throw err('not_in_manifest');
    const j = await call(tool, args);
    return { payload: j.payload || {} };
  }
  function runWatch(w) {
    callTool(w.server, w.tool, w.args).then(r => {
      lsSet('w:' + w.key, r.payload);
      w.cb({ type: 'data', result: { payload: r.payload } });
    }).catch(e => w.cb({ type: 'error', error: { code: e.code } }));
  }
  const mcp = {
    callTool,
    watchTool(server, tool, args, cb, opt) {
      const w = { server, tool, args, cb, key: tool + JSON.stringify(args) };
      watchers.push(w);
      const c = lsGet('w:' + w.key, null);
      if (c) setTimeout(() => cb({ type: 'data', result: { payload: c } }), 0);
      runWatch(w);
      const ms = Math.max(20000, (opt && opt.refetchInterval) || 60000);
      setInterval(() => { if (document.visibilityState === 'visible') runWatch(w); }, ms);
      return () => {};
    },
    async invalidate(server, tool) { watchers.filter(w => w.tool === tool).forEach(runWatch); }
  };

  /* ---------------- gambar dan fail (Google Drive, private) ---------------- */
  const toB64 = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(f); });
  const assets = {
    async upload(f) {
      if (f.size > 20 * 1048576) throw err('too_large');
      const type = f.type || 'image/jpeg';
      if (!/^image\/|pdf/.test(type)) throw err('unsupported_type');
      const j = await call('upload', { name: f.name || ('gambar-' + Date.now() + '.jpg'), mime: type, b64: await toB64(f) });
      return { id: j.id, contentType: type };
    }
  };

  /* ---------------- muat turun / kongsi fail ---------------- */
  const downloads = {
    async save({ filename, data }) {
      const blob = data instanceof Blob ? data : new Blob([data]);
      const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: filename }); return; }
        catch (e) { if (e && e.name === 'AbortError') throw err('declined'); }
      }
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    }
  };

  window.claude = {
    async use(name) {
      if (name === 'db') return db;
      if (name === 'mcp') return mcp;
      if (name === 'assets') return assets;
      if (name === 'downloads') return downloads;
      throw err('capability_disabled');
    }
  };

  /* ---------------- status rangkaian ---------------- */
  let net = 'ok';
  function setNet(s) {
    if (s === net) return; net = s;
    const el = document.getElementById('netpill'); if (!el) return;
    el.hidden = s === 'ok';
    el.textContent = s === 'offline' ? 'Offline · perubahan disimpan dalam phone' : 'Tak dapat sync, cuba lagi sekejap';
  }
  function toastSoon(t) { setTimeout(() => { if (window.toast) window.toast(t); }, 300); }
  window.addEventListener('online', () => pull());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') pull(); });
  setInterval(() => { if (document.visibilityState === 'visible') pull(); }, 15000);

  /* sw.js perlukan alamat + kod untuk ambil gambar dari Drive */
  function tellSw() {
    if (!navigator.serviceWorker || !CODE) return;
    navigator.serviceWorker.ready.then(r => r.active && r.active.postMessage({ t: 'cfg', api: API, code: CODE })).catch(() => {});
  }

  /* ---------------- kod rahsia keluarga ---------------- */
  function gate() {
    return new Promise(resolve => {
      if (CODE && WHO) { tellSw(); if (!lsGet('sheets', null)) call('check').then(j => j.sheets && lsSet('sheets', j.sheets)).catch(() => {}); return resolve(); }
      const box = document.createElement('div');
      box.className = 'gate';
      box.innerHTML = `<div class="gate-in card"><p class="hand">Home Syafiq</p><h1>Masuk</h1>
        <p class="note" id="gMsg">Taip kod rahsia keluarga.</p>
        <input class="txt" id="gCode" type="password" autocomplete="current-password" placeholder="Kod rahsia">
        <p class="lbl" style="margin-top:4px">Siapa guna phone ni?</p>
        <div class="two"><button class="btn ghost ps" data-gwho="Syafiq" aria-pressed="false">Syafiq</button><button class="btn ghost pm" data-gwho="Mira" aria-pressed="false">Mira</button></div>
        <div class="two"><button class="btn ghost" data-gwho="Maliq" aria-pressed="false">Maliq</button><button class="btn ghost" data-gwho="Musa" aria-pressed="false">Musa</button></div>
        <button class="btn" id="gGo">Masuk</button></div>`;
      document.body.appendChild(box);
      ['click', 'change', 'input', 'keydown', 'focusout'].forEach(t => box.addEventListener(t, e => e.stopPropagation()));   // jangan sampai ke pengendali app
      let fresh = false, who = WHO;
      box.querySelectorAll('[data-gwho]').forEach(b => {
        b.setAttribute('aria-pressed', String(b.dataset.gwho === who));
        b.onclick = () => { who = b.dataset.gwho; box.querySelectorAll('[data-gwho]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); };
      });
      const msg = t => { document.getElementById('gMsg').textContent = t; };
      call('hello', {}, { noAuth: true }).then(j => { if (!j.hasCode) { fresh = true; msg('Kali pertama: cipta kod rahsia keluarga (sekurang-kurangnya 6 aksara). Syafiq guna kod yang sama.'); document.getElementById('gGo').textContent = 'Cipta kod'; } }).catch(() => {});
      const go = async () => {
        const v = document.getElementById('gCode').value.trim();
        if (!v) return msg('Taip kod rahsia dulu.');
        if (!who) return msg('Pilih siapa guna.');
        CODE = v; WHO = who;
        try {
          if (fresh) await call('setup', { code: v }, { noAuth: true });
          const ck = await call('check', {}, { noAuth: true }); if (ck.sheets) lsSet('sheets', ck.sheets);
          const kid = ck.role === 'kid', kidWho = who === 'Maliq' || who === 'Musa';
          if (kid !== kidWho) { CODE = ''; return msg(kid ? 'Kod ni kod anak. Pilih Maliq atau Musa.' : 'Maliq dan Musa masuk guna kod anak.'); }
          lsSet('role', kid ? 'kid' : 'family');
          lsSet('code', v); lsSet('who', who); box.remove(); tellSw(); resolve();
        } catch (e) { CODE = ''; msg(e.code === 'unavailable' ? 'Tiada internet. Cuba lagi.' : 'Kod salah. Cuba lagi.'); }
      };
      document.getElementById('gGo').onclick = go;
      document.getElementById('gCode').onkeydown = e => { if (e.key === 'Enter') go(); };
    });
  }

  window.HS = {
    async ready() {
      await gate();
      if (Object.keys(cache).length) { ready = true; pull(); return; }   // buka laju dari salinan dalam phone
      await pull(); ready = true;
    },
    lock() { lsSet('code', ''); location.reload(); },
    who: () => WHO,
    role: () => lsGet('role', 'family'),
    call: (action, body) => call(action, body),
    sheetId: k => (lsGet('sheets', {})[k]) || k
  };
})();
