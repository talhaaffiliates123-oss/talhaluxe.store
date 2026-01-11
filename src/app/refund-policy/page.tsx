
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">Return & Replacement Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-stone dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>
            Thanks for shopping at Talha Luxe. We are committed to ensuring you are satisfied with your purchase. Please read our policy on returns and replacements carefully.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Returns for Replacement</h2>
          <p>
            You have 30 calendar days to request a replacement for an item from the date you received it.
          </p>
          <p>
            To be eligible for a replacement, your item must be unused and in the same condition that you received it. Your item must be in the original packaging and needs to have the receipt or proof of purchase.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Refunds</h2>
          <p>
            <strong>We do not offer refunds under any circumstances.</strong> Once a purchase is made, it is considered final. We only offer replacements for defective or damaged products as outlined in this policy.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Replacements</h2>
          <p>
            We only replace items if they are defective or damaged upon arrival. Once we receive your returned item, we will inspect it and notify you of the status of your replacement.
          </p>
          <p>
            If your return is approved for a replacement, we will ship a new item to you.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Shipping for Replacements</h2>
          <p>
            <strong>You will be responsible for paying for your own shipping costs for returning your item to us.</strong> Furthermore, you will also be charged for the shipping costs of the replacement item being sent to you. Shipping costs are non-refundable.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
          <p>
            If you have any questions about our replacement policy or need to initiate a return, please contact us at Talhaluxe999@gmail.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
