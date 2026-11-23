/* Service worker: makes the whole app work offline after one online visit.
 * The build (vite.config.ts → offlinePlugin) replaces the two placeholders below with
 * the list of every built file and a version hash, then writes this file to dist/sw.js. */
const VERSION = '__VERSION__';
const FILES = __PRECACHE__;
const CACHE = `cslab-${VERSION}`;
const BASE = new URL('./', self.location).href;

self.addEventListener('install', (event) => {
  // Download every file of this version. If any one fails, the install fails and the old version stays.
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => BASE + f))));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('cslab-') && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => { if (event.data === 'skip-waiting') self.skipWaiting(); });

/** Videos ask for byte ranges; a cache only holds the whole file, so cut out the part that was asked for. */
async function rangeResponse(request, cached) {
  const m = /bytes=(\d*)-(\d*)/.exec(request.headers.get('range') || '');
  if (!m) return cached;
  const buf = await cached.arrayBuffer();
  const start = m[1] ? Number(m[1]) : Math.max(0, buf.byteLength - Number(m[2]));
  const end = m[1] && m[2] ? Math.min(Number(m[2]), buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': cached.headers.get('Content-Type') || 'video/mp4',
      'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith(BASE)) return; // other sites (Supabase, GitHub) go straight to the network
  const url = new URL(req.url); url.search = ''; url.hash = '';

  if (req.mode === 'navigate') {
    // The page itself: try the network for the newest version, fall back to the saved copy when offline.
    event.respondWith(fetch(req).catch(async () =>
      (await caches.match(url.href, { cacheName: CACHE })) || (await caches.match(BASE + 'index.html', { cacheName: CACHE })) || Response.error()));
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(url.href, { cacheName: CACHE });
    if (cached) return req.headers.has('range') ? rangeResponse(req, cached) : cached;
    return fetch(req);
  })());
});
