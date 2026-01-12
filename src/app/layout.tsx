
'use client';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const title = "Talha Luxe - Premium Watches, Bags & Jewelry in Pakistan";
  const description = "Discover premium fashion at Talha Luxe. Shop the latest trends in watches, bags, jewelry, and more. Quality craftsmanship and timeless style delivered in Pakistan.";
  const siteUrl = "https://talhaluxe.com";
  const heroImageUrl = "https://images.unsplash.com/photo-1614208194190-5bf690ad8a98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxmYXNoaW9uJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3Njc1NDQ0NTh8MA&ixlib=rb-4.1.0&q=80&w=1080";

  const jsonLd = {
    '@context': 'https.org',
    '@type': 'Organization',
    name: 'Talha Luxe',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`, // Assuming you have a logo file at public/logo.png
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+92-329-0586406',
      contactType: 'Customer Service',
      email: 'Talhaluxe999@gmail.com'
    },
    sameAs: [
      'https://www.facebook.com/', // Add your real social media links
      'https://www.twitter.com/',
      'https://www.instagram.com/'
    ]
  };

  return (
    <html lang="en" className={`${inter.variable} font-body antialiased`}>
      <head>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content={siteUrl} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:image" content={heroImageUrl} />
          <meta property="og:site_name" content="Talha Luxe" />

          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content={siteUrl} />
          <meta property="twitter:title" content={title} />
          <meta property="twitter:description" content={description} />
          <meta property="twitter:image" content={heroImageUrl} />

          {/* Schema.org */}
          <Script
            id="json-ld-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
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
        <Script src="https://3nbf4.com/act/files/tag.min.js?z=10453217" data-cfasync="false" async></Script>
      </body>
    </html>
  );
}
