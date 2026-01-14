// This service worker file is intentionally left almost empty.
// It is required for Firebase Cloud Messaging to work in the background.

// The service worker will be registered by the Firebase SDK, and it will
// automatically handle displaying notifications when the app is not in the
// active tab.

// For more advanced background message handling, you can add logic here,
// but for simple display of notifications, this is sufficient.

// You can optionally import and initialize Firebase here if you need to
// perform actions (like interacting with Firestore) when a background
// notification is received. For now, we keep it simple.

self.addEventListener("install", function (event) {
  console.log("FCM Service Worker installed.");
});

self.addEventListener("activate", function (event) {
  console.log("FCM Service Worker activated.");
});
