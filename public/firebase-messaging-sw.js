// This file should be in the `public` directory

// Import and initialize the Firebase SDK
// It's important to import the a-la-carte SDKs you need
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyBSOD9aHuhr5lYk9QDVKhHbOAtcgSueOXM',
    authDomain: 'studio-4597970746-e4842.firebaseapp.com',
    databaseURL: 'https://studio-4597970746-e4842-default-rtdb.firebaseio.com',
    projectId: 'studio-4597970746-e4842',
    storageBucket: 'studio-4597970746-e4842.appspot.com',
    messagingSenderId: '424210099774',
    appId: '1:424210099774:web:ce8ed86cf460de296d6b6f',
};


firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - a message is received while the app is in the background
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png', // Make sure you have a logo.png in your public folder
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
