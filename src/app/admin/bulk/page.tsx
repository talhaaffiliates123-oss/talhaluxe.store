'use client';
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductData {
    title: string;
    price: number;
    img: string;
    link: string;
}

export default function BulkUpload() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [productsToUpload, setProductsToUpload] = useState<ProductData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const parsedJson = JSON.parse(content);
          // Assuming the JSON is an array of product objects
          if (Array.isArray(parsedJson)) {
            setProductsToUpload(parsedJson);
            toast({
              title: "File Loaded",
              description: `Found ${parsedJson.length} products in ${file.name}.`,
            });
          } else {
            toast({
              variant: "destructive",
              title: "Invalid JSON format",
              description: "The JSON file should contain an array of products.",
            });
          }
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error Reading File",
          description: "Could not parse the JSON file. Please check its format.",
        });
        console.error("Error parsing JSON:", error);
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!firestore) {
        toast({ variant: "destructive", title: "Error", description: "Firestore is not ready." });
        return;
    }
    if (productsToUpload.length === 0) {
        toast({ variant: "destructive", title: "No Products", description: "Please load a file with products to upload." });
        return;
    }

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const product of productsToUpload) {
        try {
            await addDoc(collection(firestore, "products"), {
            name: product.title,
            shortDescription: "High-quality imported accessory.",
            description: "Premium Luxury Edition. Imported quality with elegant finishing.",
            price: Math.ceil(product.price * 1.3) + 200, 
            discountedPrice: null,
            category: 'watches', // Default category, can be enhanced later
            imageUrls: [product.img],
            stock: 100,
            rating: 0,
            reviewCount: 0,
            isNewArrival: true,
            isBestSeller: false,
            onSale: false,
            createdAt: serverTimestamp()
            });
            successCount++;
        } catch (e) {
            errorCount++;
            console.error(`Failed to upload product: ${product.title}`, e);
        }
      }

      toast({
        title: "Upload Complete",
        description: `${successCount} products uploaded successfully. ${errorCount} failed.`,
      });

    } catch (error) {
      console.error("Error during upload:", error);
      toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "A major error occurred during the upload process. Check the console.",
      });
    } finally {
        setIsUploading(false);
        setProductsToUpload([]);
        setFileName('');
    }
  };

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold">Bulk Product Importer</h1>
            <p className="text-muted-foreground">Upload products in bulk from a JSON file.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Upload JSON File</CardTitle>
                <CardDescription>
                    Select a JSON file containing an array of products. Each product should have a 'title', 'price', and 'img' key.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="json-upload">JSON File</Label>
                    <Input id="json-upload" type="file" accept=".json" onChange={handleFileChange} disabled={isUploading} />
                    {fileName && <p className="text-sm text-muted-foreground">Selected file: {fileName}</p>}
                </div>
                
                <Button 
                    onClick={handleUpload}
                    disabled={isUploading || productsToUpload.length === 0 || !firestore}
                    className="w-full md:w-auto"
                >
                    {isUploading ? `Uploading ${productsToUpload.length} products...` : `Upload ${productsToUpload.length} Products`}
                </Button>

                {isUploading && <p className="text-sm text-muted-foreground text-center">Please wait, this may take a few moments...</p>}
            </CardContent>
        </Card>
    </div>
  );
}
