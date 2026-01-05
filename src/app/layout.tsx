
'use client';

import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import FirebaseErrorListener from '@/components/FirebaseErrorListener';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
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
    <html lang="en" className={`${montserrat.variable} antialiased`}>
      <head>
         <title>Talha Luxe - Premium Fashion</title>
          <meta
            name="description"
            content="Discover premium fashion at Talha Luxe. Shop the latest trends in watches, bags, jewelry, and more."
          />
      </head>
      <body>
        <FirebaseClientProvider>
          <FirebaseErrorListener>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-grow">{children}</main>
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
