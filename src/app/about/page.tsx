import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Award, Gem, Target } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  const aboutImage = PlaceHolderImages.find((img) => img.id === 'about-us-image');

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
          {aboutImage && (
            <div className="rounded-lg overflow-hidden">
              <Image
                src={aboutImage.imageUrl}
                alt={aboutImage.description}
                width={1200}
                height={800}
                className="object-cover"
                data-ai-hint={aboutImage.imageHint}
              />
            </div>
          )}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-headline">Our Story</h2>
            <p className="text-muted-foreground">
              Talha Luxe was born from a passion for exquisite craftsmanship and a belief that true style is timeless. Founded in 2023, our journey began with a simple idea: to create a curated collection of fashion accessories that blend classic elegance with contemporary design. We travel the world to source the finest materials and partner with skilled artisans who share our dedication to quality.
            </p>
            <p className="text-muted-foreground">
              Every piece in our collection tells a story of artistry and attention to detail. From the intricate mechanics of our timepieces to the supple feel of our hand-stitched leather bags, we are committed to delivering not just a product, but an experience of luxury.
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
