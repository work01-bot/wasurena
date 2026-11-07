// =============================================================
// オフラインでも動かすための仕組み（サービスワーカー）
// 一度開いたときにファイルをスマホ・PCの中に保存しておき、
// ネットがなくてもそこから表示します。
// アプリを更新したら、下の VERSION の数字を1つ増やしてください。
// =============================================================
const VERSION = 'wasurena-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './favicon.svg', './icon-180.png', './icon-192.png', './icon-512.png'];

// 最初に一度だけ：ファイルを保存する
self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});

// 古いバージョンの保存分を消す
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// 表示するとき：まずネットから最新版を取りに行き、だめなら保存分を使う
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(cache => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
