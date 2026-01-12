
'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import FirebaseErrorListener from '@/components/FirebaseErrorListener';
import { useEffect } from 'react';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Metadata can't be exported from a client component.
// We can keep it here, but it won't be actively used in this client-side layout.
// export const metadata: Metadata = {
//   title: 'Talha Luxe - Premium Fashion',
//   description:
//     'Discover premium fashion at Talha Luxe. Shop the latest trends in watches, bags, jewelry, and more.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => console.log('Service Worker registered with scope:', registration.scope))
        .catch((error) => console.error('Service Worker registration failed:', error));
    }
  }, []);

  return (
    <html lang="en" className={`${inter.variable} font-body antialiased`}>
      <head>
         <title>Talha Luxe - Premium Fashion</title>
          <meta
            name="description"
            content="Discover premium fashion at Talha Luxe. Shop the latest trends in watches, bags, jewelry, and more."
          />
      </head>
      <body>
        <Script id="ad-script-2">
          {`(function(s){s.dataset.zone='10453119',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}
        </Script>
        <FirebaseClientProvider>
          <FirebaseErrorListener>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-grow bg-background">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </CartProvider>
          </FirebaseErrorListener>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
