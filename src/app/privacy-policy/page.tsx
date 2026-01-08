
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-stone dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>
            Your privacy is important to us. It is Talha Luxe's policy to respect your privacy regarding any information we may collect from you across our website.
          </p>

          <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
          <p>
            We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
          </p>
          <p>
            The personal information that we may collect includes your name, email address, shipping address, phone number, and payment information. We collect this information when you create an account, place an order, or subscribe to our newsletter.
          </p>

          <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Process and fulfill your orders, including to send you emails to confirm your order status and shipment.</li>
            <li>Communicate with you and to send you information by email, postal mail, telephone, or other means about our products, services, contests, and promotions, unless you have directed us not to contact you with promotional communications.</li>
            <li>Help us learn more about your shopping preferences.</li>
            <li>Analyze trends and statistics.</li>
            <li>Protect the security or integrity of our website and our business.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">3. Data Security</h2>
          <p>
            We take reasonable measures, including administrative, technical, and physical safeguards, to protect your information from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground">4. Your Rights</h2>
          <p>
            You have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.
          </p>

          <h2 className="text-xl font-semibold text-foreground">5. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons.
          </p>

          <h2 className="text-xl font-semibold text-foreground">6. Contact Us</h2>
          <p>
            For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at Talhaluxe999@gmail.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
