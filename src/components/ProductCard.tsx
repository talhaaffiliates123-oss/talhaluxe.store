
"use client";
import { useState } from 'react';

export default function ProductCard({ product }: { product: any }) {
  // Use product.imageUrls and provide a fallback
  const allImages = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : ['https://placehold.co/600x400/EEE/31343C?text=No+Image'];
    
  const [activeImage, setActiveImage] = useState(allImages[0]);

  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white">
      {/* MAIN IMAGE */}
      <img 
        src={activeImage} 
        alt={product.name} 
        className="w-full h-64 object-contain rounded-lg mb-4 bg-gray-50"
      />

      {/* THUMBNAILS (Click to switch) */}
      <div className="flex gap-2 overflow-x-auto mb-4 pb-2">
        {allImages.map((img: string, i: number) => (
          <img 
            key={i}
            src={img}
            onClick={() => setActiveImage(img)}
            className={`w-12 h-12 object-cover rounded border-2 cursor-pointer ${activeImage === img ? 'border-black' : 'border-transparent'}`}
          />
        ))}
      </div>

      <h3 className="font-bold text-lg">{product.name}</h3>
      <p className="text-blue-600 font-bold text-xl">PKR {product.price}</p>
      
      {/* VARIANTS DISPLAY */}
      {product.variants && product.variants.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {product.variants.map((v: any, i: number) => (
            <span key={i} className="text-[10px] bg-gray-100 px-2 py-1 rounded border">
              {v.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
