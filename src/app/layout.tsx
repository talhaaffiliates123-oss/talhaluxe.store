
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
  return (
    <html lang="en" className={`${inter.variable} font-body antialiased`}>
      <head>
         <title>Talha Luxe - Premium Fashion</title>
          <meta
            name="description"
            content="Discover premium fashion at Talha Luxe. Shop the latest trends in watches, bags, jewelry, and more."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        
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
