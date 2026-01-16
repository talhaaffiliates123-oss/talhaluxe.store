'use client';
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function BulkUpload() {
  const firestore = useFirestore();

  // PASTE YOUR SCRAPED DATA FROM DARAZ HERE
  const productsToUpload = [
    { title: "Sample Watch 1", price: 1500, img: "https://placehold.co/600x600/EEE/31343C?text=Sample+1", link: "daraz.pk/1" },
    { title: "Sample Watch 2", price: 2500, img: "https://placehold.co/600x600/EEE/31343C?text=Sample+2", link: "daraz.pk/2" },
    // ... add all 200 items here
  ];

  const handleUpload = async () => {
    if (!firestore) {
        alert("Firestore is not ready. Please try again in a moment.");
        return;
    }
    try {
      console.log("Starting upload...");
      for (const product of productsToUpload) {
        await addDoc(collection(firestore, "products"), {
          name: product.title,
          shortDescription: "High-quality imported accessory.",
          description: "Premium Luxury Edition. Imported quality with elegant finishing.",
          // Automating Profit: Daraz Price + 30% + 200 PKR for shipping
          price: Math.ceil(product.price * 1.3) + 200, 
          discountedPrice: null,
          category: 'watches',
          imageUrls: [product.img],
          stock: 100,
          rating: 0,
          reviewCount: 0,
          isNewArrival: true,
          isBestSeller: false,
          onSale: false,
          createdAt: serverTimestamp()
        });
      }
      alert(`Success! All ${productsToUpload.length} products are now live on Talha Luxe.`);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Check console.");
    }
  };

  return (
    <div className="p-10 md:p-20 text-center">
      <h1 className="text-2xl font-bold mb-4">Talha Luxe Admin: Bulk Importer</h1>
      <p className="text-muted-foreground mb-8">
        This tool allows you to upload products in bulk from a predefined list.
      </p>
      <button 
        onClick={handleUpload}
        className="bg-accent text-accent-foreground px-8 py-3 rounded-md font-bold hover:bg-accent/90 transition-colors disabled:opacity-50"
        disabled={!firestore}
      >
        Click to Upload {productsToUpload.length} Products
      </button>
    </div>
  );
}
