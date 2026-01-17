
'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DownloadCloud } from "lucide-react";
import Link from "next/link";

export default function ImportProductPage() {
  const { toast } = useToast();
  const [darazUrl, setDarazUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    if (!darazUrl.trim()) {
      toast({
        variant: "destructive",
        title: "URL Required",
        description: "Please paste a Daraz product URL to import.",
      });
      return;
    }

    setIsImporting(true);

    try {
      const response = await fetch('/api/import-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: darazUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred.');
      }

      toast({
        title: "Product Imported!",
        description: `"${result.productName}" is now live in your store.`,
        action: (
          <Button asChild variant="secondary" size="sm">
            <Link href={`/admin/products/${result.productId}/edit`}>View</Link>
          </Button>
        ),
      });

      setDarazUrl('');

    } catch (error: any) {
      console.error("Import failed:", error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error.message,
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold">AI Product Importer</h1>
            <p className="text-muted-foreground">Automatically create a new product listing from a Daraz URL.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Import from Daraz</CardTitle>
                <CardDescription>
                    Paste a Daraz product URL below. The AI will extract the details, rewrite them for a luxury feel, and add it to your products.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="daraz-url">Daraz Product URL</Label>
                    <Input 
                        id="daraz-url" 
                        type="url" 
                        placeholder="https://www.daraz.pk/products/..." 
                        value={darazUrl}
                        onChange={(e) => setDarazUrl(e.target.value)}
                        disabled={isImporting}
                    />
                </div>
                
                <Button 
                    onClick={handleImport}
                    disabled={isImporting}
                    className="w-full md:w-auto"
                >
                    {isImporting ? (
                        <>
                            <DownloadCloud className="mr-2 h-4 w-4 animate-pulse" />
                            Importing with AI...
                        </>
                    ) : (
                        <>
                            <DownloadCloud className="mr-2 h-4 w-4" />
                            Import Product
                        </>
                    )}
                </Button>

                {isImporting && <p className="text-sm text-muted-foreground text-center">Please wait, this can take up to 30 seconds...</p>}
            </CardContent>
        </Card>
    </div>
  );
}
