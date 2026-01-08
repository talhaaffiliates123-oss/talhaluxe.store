
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-stone dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
          <p>
            Welcome to Talha Luxe. These Terms and Conditions govern your use of our website and the purchase of products from us. By accessing this website and/or placing an order, you agree to be bound by these Terms and Conditions.
          </p>

          <h2 className="text-xl font-semibold text-foreground">2. Use of Website</h2>
          <p>
            You are permitted to use our website for your own personal use and to print and download material from this Website provided that you do not modify any content without our consent. Material on this website must not be republished online or offline without our permission.
          </p>

          <h2 className="text-xl font-semibold text-foreground">3. Ordering</h2>
          <p>
            All orders are subject to acceptance and availability. If the goods ordered are not available, you will be notified by e-mail (or by other means if no e-mail address has been provided) and you will have the option either to wait until the item is available from stock or to cancel your order.
          </p>
          <p>
            We reserve the right to refuse any order placed by you.
          </p>

          <h2 className="text-xl font-semibold text-foreground">4. Pricing and Payment</h2>
          <p>
            All prices are as quoted on the Website and may be subject to change from time to time. Prices are inclusive of any applicable taxes but exclusive of delivery costs, which will be added to the total amount due.
          </p>
          <p>
            Payment for all orders must be made by credit/debit card or any other payment method listed on the checkout page.
          </p>

          <h2 className="text-xl font-semibold text-foreground">5. Intellectual Property</h2>
          <p>
            The copyright and other intellectual property rights in all material on this Website are owned by us or our licensors and must not be reproduced without our prior consent.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
          <p>
            We shall not be liable for any indirect or consequential loss or damage whatever (including without limitation loss of business, opportunity, data, profits) arising out of or in connection with the use of the Website.
          </p>

          <h2 className="text-xl font-semibold text-foreground">7. Governing Law</h2>
          <p>
            These Terms and Conditions shall be governed by and construed in accordance with the law of Pakistan and you hereby submit to the exclusive jurisdiction of the Pakistani courts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
