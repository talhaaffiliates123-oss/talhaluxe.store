
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Pin } from "lucide-react";
import Image from 'next/image';

export default function ContactPage() {
  const contactImageUrl = "https://picsum.photos/seed/darkcontact/1080/432";

  return (
    <div>
        <section className="relative h-[40vh] w-full">
            <Image
                src={contactImageUrl}
                alt="A stylish flat lay of contact items like a phone and notebook."
                fill
                className="object-cover"
                priority
                data-ai-hint="dark contact"
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white p-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
                    Contact Us
                </h1>
                <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-200">
                    We&apos;re here to help. Reach out to us with any questions or feedback.
                </p>
            </div>
        </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
                <h2 className="text-3xl font-bold font-headline">Get in Touch</h2>
                <p className="text-muted-foreground">
                    Our customer service team is available from 9 AM to 5 PM, Monday to Friday. We&apos;d love to hear from you.
                </p>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-muted rounded-full">
                            <Mail className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Email</h4>
                            <a href="mailto:Talhaluxe999@gmail.com" className="text-muted-foreground hover:text-primary">Talhaluxe999@gmail.com</a>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-muted rounded-full">
                            <Phone className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Phone</h4>
                            <a href="tel:+923290586406" className="text-muted-foreground hover:text-primary">+92 329 0586406</a>
                        </div>
                    </div>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <form className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Your name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="Your email" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" placeholder="How can we help?" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="Your message..." rows={5} />
                        </div>
                        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                            Send Message
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
