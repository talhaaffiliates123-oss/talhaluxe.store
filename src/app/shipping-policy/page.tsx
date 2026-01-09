
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ShippingPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">Shipping Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-stone dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          
          <h2 className="text-xl font-semibold text-foreground">Order Processing</h2>
          <p>
            All orders are processed within 1-2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Domestic Shipping Rates and Estimates</h2>
          <p>
            Shipping charges for your order will be calculated and displayed at checkout. We offer a variety of shipping options to meet your needs.
          </p>
          <p>
            <strong>Standard Shipping:</strong> 5-7 business days.
          </p>
          <p>
            <strong>Express Shipping:</strong> 2-3 business days.
          </p>
          <p>
            Please note that delivery times are estimates and may vary due to carrier delays or other circumstances outside of our control.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Shipment Confirmation & Order Tracking</h2>
          <p>
            You will receive a shipment confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Damages</h2>
          <p>
            Talha Luxe is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground">International Shipping</h2>
          <p>
            We exclusively ship to addresses within Pakistan. We do not offer international shipping at this time.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Questions</h2>
          <p>
            If you have any questions about our shipping policy, please contact us at Talhaluxe999@gmail.com.
          </p>

        </CardContent>
      </Card>
    </div>
  );
}
