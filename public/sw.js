const CACHE_NAME = "yoreparo-v1";

self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
    if (!event.data) return;

    let payload;
    try {
        payload = event.data.json();
    } catch {
        payload = {title: "Yo Reparo", body: event.data.text()};
    }

    const {title, body, data} = payload;

    const options = {
        body: body ?? "",
        icon: "/logo.png",
        badge: "/logo.png",
        vibrate: [200, 100, 200],
        data: {url: data ? `/dashboard/${data}` : "/dashboard"},
        actions: [
            {action: "open", title: "Ver detalles"},
            {action: "dismiss", title: "Ignorar"},
        ],
    };

    event.waitUntil(
        self.registration.showNotification(title ?? "Yo Reparo", options)
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "dismiss") return;

    const targetUrl = event.notification.data?.url ?? "/dashboard";

    event.waitUntil(
        clients.matchAll({type: "window", includeUncontrolled: true}).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && "focus" in client) {
                    client.focus();
                    client.navigate(targetUrl);
                    return;
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});