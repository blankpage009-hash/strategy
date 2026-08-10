/* =====================================================================
   What's the Strategy? — 오프라인용 도우미 (service worker)
   ---------------------------------------------------------------------
   웹주소로 한 번 열어두면, 그 뒤로는 인터넷이 없어도 화면이 뜨게 해 줍니다.
   자료(PDF·회의록)는 여기서 다루지 않습니다. 그것은 기기 안 저장소에 있습니다.
   프로그램을 고친 뒤에는 아래 CACHE 뒤의 번호를 1 올려 주세요.
   ===================================================================== */
const CACHE = "wts-v1";

const ASSETS = [
  "./",
  "index.html",
  "whats-the-strategy.html",
  "lib/pdf.min.js",
  "lib/pdf.worker.min.js",
  "manifest.webmanifest",
  "icon-180.png",
  "icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      /* 하나가 없어도 나머지는 담습니다 */
      .then(c => Promise.all(ASSETS.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", e => {
  if (e.data === "skip-waiting") self.skipWaiting();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  /* 제미나이 API 같은 바깥 주소는 손대지 않습니다 */
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match("whats-the-strategy.html"));
    })
  );
});
