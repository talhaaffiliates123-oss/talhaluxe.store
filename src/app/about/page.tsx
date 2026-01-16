
import { Gem, Target, Award } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  const aboutImageUrl = "https://images.unsplash.com/photo-1683115096447-5d01c11d3ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxjcmFmdHNtYW4lMjB3b3Jrc2hvcHxlbnwwfHx8fDE3Njc1NDQ0NTh8MA&ixlib=rb-4.1.0&q=80&w=1080";

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">About Talha Luxe</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Crafting elegance and timeless style, one masterpiece at a time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-lg overflow-hidden">
              <Image
                src={aboutImageUrl}
                alt="A workshop view of a craftsman making jewelry."
                width={1200}
                height={800}
                className="object-cover"
                data-ai-hint="craftsman workshop"
              />
            </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-headline">Our Story</h2>
            <p className="text-muted-foreground">
              Talha Luxe was born from a passion for exquisite craftsmanship and a desire to bring a curated, boutique experience to the vast world of online shopping. While large marketplaces offer endless choice, we focus on selection. We meticulously source the best items from both global suppliers and local artisans, ensuring every piece meets our high standards for quality and style.
            </p>
            <p className="text-muted-foreground">
              Our commitment extends beyond the product. We provide priority customer service and a rigorous quality check for every item, ensuring your experience is as flawless as the pieces you purchase. We are your trusted partner in finding accessories that tell a story of artistry and attention to detail.
            </p>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="flex justify-center mb-4">
                <div className="p-4 bg-muted rounded-full">
                    <Gem className="w-8 h-8 text-accent" />
                </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
            <p className="text-muted-foreground">
              To provide our customers with accessories of unparalleled quality and design that they will cherish for a lifetime.
            </p>
          </div>
          <div className="p-6">
            <div className="flex justify-center mb-4">
                 <div className="p-4 bg-muted rounded-full">
                    <Target className="w-8 h-8 text-accent" />
                </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
            <p className="text-muted-foreground">
              To be a globally recognized name in premium fashion, synonymous with elegance, quality, and trust.
            </p>
          </div>
          <div className="p-6">
            <div className="flex justify-center mb-4">
                 <div className="p-4 bg-muted rounded-full">
                    <Award className="w-8 h-8 text-accent" />
                </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Our Values</h3>
            <p className="text-muted-foreground">
              Craftsmanship, Integrity, and Customer Delight. These pillars guide every decision we make at Talha Luxe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
