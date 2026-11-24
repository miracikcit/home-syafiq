/**
 * Home Syafiq: backend dalam Google Sheet SPENDING.
 * Pengguna:
 *   - app Home Syafiq (PWA) dengan kod rahsia keluarga APP_CODE (dicipta sendiri dalam app kali pertama)
 *   - Mac mini (kunci ADMIN_KEY) untuk pindah data dan kemaskini
 * Tiada rahsia dalam kod ni. Kunci disimpan dalam Script Properties.
 */
const DATA_TAB = 'APP DATA';     // path | json | updated(ms) | deleted | oleh | sambungan json...
const LOG_TAB = 'APP LOG';       // masa | siapa | path | tindakan
const DRIVE_FOLDER = 'HOME SYAFIQ APP';
const CELL = 49000, MAXPART = 12;

function doGet() { return out({ ok: true, msg: 'Home Syafiq aktif' }); }

function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, error: 'permintaan rosak' }); }
  const props = PropertiesService.getScriptProperties();
  try {
    if (b.key !== undefined) {                       // Mac mini
      let k = props.getProperty('ADMIN_KEY');
      if (!k && String(b.key).length >= 32) { props.setProperty('ADMIN_KEY', String(b.key)); k = String(b.key); }
      if (b.key !== k) return out({ ok: false, error: 'kunci salah' });
      b.who = b.who || 'Mac mini';
      return out(app(b, true));
    }
    const code = props.getProperty('APP_CODE');
    if (b.action === 'hello') return out({ ok: true, hasCode: !!code });
    if (b.action === 'setup') {
      if (code) return out({ ok: false, error: 'kod dah wujud' });
      if (!b.code || String(b.code).length < 6) return out({ ok: false, error: 'kod terlalu pendek' });
      props.setProperty('APP_CODE', String(b.code));
      return out({ ok: true });
    }
    if (!code || b.code !== code) return out({ ok: false, error: 'kod salah', auth: true });
    return out(app(b, false));
  } catch (err) {
    return out({ ok: false, error: String(err && err.message || err) });
  }
}

function app(b, admin) {
  switch (b.action) {
    case 'check': return { ok: true, sheets: { SPENDING: SpreadsheetApp.getActive().getId(), BANK: bankId() } };
    case 'pull': {
      const since = Number(b.since) || 0, docs = [];
      dataRows().forEach(r => { if (r.u > since) docs.push({ p: r.p, d: r.del ? null : JSON.parse(r.j || 'null'), u: r.u }); });
      return { ok: true, docs, now: Date.now() };
    }
    case 'put': return withLock(() => {
      const rows = dataRows(), res = (b.writes || []).map(w => dataPut(rows, w, b.who, admin && b.force));
      return { ok: true, res };
    });
    case 'get_values': {
      const rng = openSs(b.spreadsheetId).getRange(b.range);
      return { ok: true, payload: { values: trimValues(rng.getDisplayValues()) } };
    }
    case 'update_values': return withLock(() => {
      const vals = b.values || [[]], w = Math.max.apply(null, vals.map(r => r.length).concat([1]));
      const pad = vals.map(r => { const a = r.slice(); while (a.length < w) a.push(''); return a; });
      openSs(b.spreadsheetId).getRange(b.range).offset(0, 0, pad.length, w).setValues(pad);
      log(b.who, String(b.range), 'tulis Sheet');
      return { ok: true, payload: {} };
    });
    case 'upload': {
      const blob = Utilities.newBlob(Utilities.base64Decode(b.b64), b.mime || 'image/jpeg', String(b.name || 'gambar.jpg'));
      const f = folder().createFile(blob);                 // private: tak dikongsi dengan sesiapa
      log(b.who, 'gambar/' + f.getId(), 'upload');
      return { ok: true, id: f.getId() };
    }
    case 'file': {
      const f = DriveApp.getFileById(String(b.id));
      const ps = f.getParents(), fid = folder().getId(); let okp = false;
      while (ps.hasNext()) if (ps.next().getId() === fid) { okp = true; break; }
      if (!okp) return { ok: false, error: 'fail ni bukan gambar app' };
      return { ok: true, mime: f.getMimeType(), b64: Utilities.base64Encode(f.getBlob().getBytes()) };
    }
  }
  if (admin && b.action === 'config') { if (b.bank) PropertiesService.getScriptProperties().setProperty('BANK_ID', String(b.bank)); return { ok: true, bank: bankId() }; }
  if (admin && b.action === 'ls') return { ok: true, docs: dataRows().map(r => ({ p: r.p, u: r.u, del: r.del, n: r.j.length })) };
  return { ok: false, error: 'tindakan tak dikenali' };
}

/* ================= data store ================= */
function dataSheet() {
  return sheet(DATA_TAB, ['path', 'json', 'updated', 'deleted', 'oleh', 'json sambungan']);
}
function dataRows() {
  const sh = dataSheet(), last = sh.getLastRow();
  if (last < 2) return [];
  const w = Math.max(5, sh.getLastColumn());
  return sh.getRange(2, 1, last - 1, w).getValues().map((r, i) => ({
    row: i + 2, p: String(r[0]), j: String(r[1]) + r.slice(5).join(''), u: Number(r[2]) || 0, del: r[3] === true || r[3] === 'TRUE'
  })).filter(r => r.p);
}
/* Satu tulis. Konflik: phone ni tulis atas versi lama (b < versi dalam Sheet) -> tolak dan pulang versi terkini. */
function dataPut(rows, w, who, force) {
  const path = String(w.p);
  if (!/^[A-Za-z0-9_\-.~:@+]+(\/[A-Za-z0-9_\-.~:@+]+)+$/.test(path)) throw new Error('path salah');
  const r = rows.find(x => x.p === path);
  if (r && !force && w.b !== undefined && Number(w.b) < r.u) return { conflict: true, u: r.u, d: r.del ? null : JSON.parse(r.j || 'null') };
  const json = w.d === null || w.d === undefined ? '' : JSON.stringify(w.d);
  const parts = [];
  for (let i = 0; i < json.length; i += CELL) parts.push(json.slice(i, i + CELL));
  if (parts.length > MAXPART) throw new Error('dokumen terlalu besar');
  if (!parts.length) parts.push('');
  let u = Date.now();
  const maxU = rows.reduce((m, x) => Math.max(m, x.u), 0);
  if (u <= maxU) u = maxU + 1;                 // masa sentiasa naik, supaya pull tak terlepas
  const sh = dataSheet(), row = r ? r.row : sh.getLastRow() + 1;
  const vals = [path, parts[0], u, json === '', who || ''].concat(parts.slice(1));
  const oldW = r ? Math.max(5, sh.getLastColumn()) : 0;
  sh.getRange(row, 2, 1, 1).setNumberFormat('@');
  sh.getRange(row, 1, 1, vals.length).setValues([vals]);
  if (oldW > vals.length) sh.getRange(row, vals.length + 1, 1, oldW - vals.length).clearContent();
  if (r) { r.u = u; r.j = json; r.del = json === ''; } else rows.push({ row, p: path, j: json, u, del: json === '' });
  log(who, path, json === '' ? 'buang' : 'ubah');
  return { u };
}

/* ================= helpers ================= */
function log(who, path, what) {
  try { sheet(LOG_TAB, ['masa', 'siapa', 'path', 'tindakan']).appendRow([new Date(), who || '', path, what]); } catch (e) {}
}
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function withLock(fn) { const l = LockService.getScriptLock(); l.waitLock(25000); try { return fn(); } finally { l.releaseLock(); } }
/* Hanya Sheet keluarga: SPENDING, Bank Statements 2026, dan Sheet yang dipaut dalam tetapan Cukai app. */
function bankId() { return PropertiesService.getScriptProperties().getProperty('BANK_ID') || ''; }
function openSs(id) {
  const a = SpreadsheetApp.getActive();
  if (!id || id === 'SPENDING' || id === a.getId()) return a;
  if (id === 'BANK') id = bankId();
  const ok = [bankId()];
  try {
    const r = dataRows().find(x => x.p === 'tax/setup' && !x.del), s = r ? JSON.parse(r.j) : {};
    ['sheets', 'pnl'].forEach(k => Object.keys(s[k] || {}).forEach(w => { if (s[k][w] && s[k][w].id) ok.push(String(s[k][w].id)); }));
  } catch (e) {}
  if (ok.indexOf(String(id)) < 0) throw new Error('Sheet ni bukan Sheet keluarga');
  return SpreadsheetApp.openById(id);
}
function sheet(name, header) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.getRange(1, 1, 1, header.length).setValues([header]); sh.hideSheet(); }
  return sh;
}
function folder() {
  const it = DriveApp.getFoldersByName(DRIVE_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(DRIVE_FOLDER);
}
function trimValues(v) {
  const o = v.map(r => { let n = r.length; while (n > 0 && r[n - 1] === '') n--; return r.slice(0, n); });
  let m = o.length; while (m > 0 && o[m - 1].length === 0) m--;
  return o.slice(0, m);
}

/** Jalankan sekali dari editor (butang Run) untuk beri kebenaran Sheet dan Drive. */
function izinkan() { folder(); dataSheet(); sheet(LOG_TAB, ['masa', 'siapa', 'path', 'tindakan']); return 'OK'; }
