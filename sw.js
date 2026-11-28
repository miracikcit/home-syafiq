/* Home Syafiq: simpan app dalam phone (buka tanpa internet) dan hidang gambar dari Drive private (laluan blob/<id>). */
const V = '2026.11.28-7';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'css/app.css?v=' + V, 'js/config.js?v=' + V, 'js/runtime.js?v=' + V, 'js/more.js?v=' + V, 'js/hero.js?v=' + V, 'js/layout.js?v=' + V, 'js/app.js?v=' + V, 'icons/icon-180.png', 'icons/icon-192.png'];
let CFG = null;

self.addEventListener('install', e => { e.waitUntil(caches.open('hs-' + V).then(c => c.addAll(CORE))); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('hs-2') && k !== 'hs-' + V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.t === 'skip') self.skipWaiting();
  if (d.t === 'cfg') { CFG = { api: d.api, code: d.code }; e.waitUntil(caches.open('hs-meta').then(c => c.put('/hs-cfg', new Response(JSON.stringify(CFG))))); }
});
async function cfg() {
  if (CFG) return CFG;
  const r = await (await caches.open('hs-meta')).match('/hs-cfg');
  return (CFG = r ? await r.json() : null);
}
async function blob(id) {
  const key = self.registration.scope + 'img/' + encodeURIComponent(id);
  const cache = await caches.open('hs-img');
  const hit = await cache.match(key);
  if (hit) return hit;
  const c = await cfg();
  if (!c) return new Response('belum masuk', { status: 401 });
  const r = await fetch(c.api, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'file', code: c.code, id }) });
  const j = await r.json();
  if (!j.ok) return new Response(j.error || 'tiada', { status: 404 });
  const bin = atob(j.b64), u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  const res = new Response(u8, { headers: { 'Content-Type': j.mime || 'image/jpeg' } });
  cache.put(key, res.clone()).catch(() => {});
  return res;
}
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const m = u.origin === location.origin && u.pathname.match(/\/blob\/([^/]+)$/);
  if (m) { e.respondWith(blob(decodeURIComponent(m[1])).catch(() => new Response('', { status: 502 }))); return; }
  const same = u.origin === location.origin, font = u.hostname.includes('fonts.g');
  if (!same && !font) return;
  // rangkaian dulu supaya sentiasa versi terbaru; cache bila offline
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open('hs-' + V).then(x => x.put(e.request, c)); } return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
