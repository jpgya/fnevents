// sw.js
self.addEventListener('install', event => {
  console.log('[SW] Installed');
  self.skipWaiting(); // 新しいSW即座に有効化
});

self.addEventListener('activate', event => {
  console.log('[SW] Activated');
  self.clients.claim(); // すぐに制御を取得
});

// 通知クリック時の処理
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // すでにタブが開いていればフォーカス
      for (let client of windowClients) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      // タブがなければ新規オープン
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

// Pushイベント受信（本格的な永続通知はPushサーバー必要）
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Fortnite Event', body: 'イベント開始' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.png', // 任意のアイコン
      badge: '/badge.png', // 任意
    })
  );
});
