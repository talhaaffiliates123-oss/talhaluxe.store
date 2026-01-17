
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import ImageKit from 'imagekit';

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!serviceAccountString) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
        }
        const serviceAccount = JSON.parse(serviceAccountString);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error: any) {
        console.error('Firebase Admin SDK initialization error:', error.stack);
        // We throw a specific error here to be caught by the outer try/catch
        throw new Error(`Firebase Admin SDK failed to initialize: ${error.message}`);
    }
}

// Initialize ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
});


export async function POST(req: NextRequest) {
    // Check for API Keys
    if (!process.env.GROQ_API_KEY) {
        return NextResponse.json({ error: 'Groq API key not configured.' }, { status: 500 });
    }
    if (!process.env.FIRECRAWL_API_KEY) {
        return NextResponse.json({ error: 'Firecrawl API key not configured.' }, { status: 500 });
    }
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
        return NextResponse.json({ error: 'ImageKit credentials not configured.' }, { status: 500 });
    }

  try {
    const firestore = admin.firestore();
    const { url: darazUrl } = await req.json();

    if (!darazUrl) {
      return NextResponse.json({ error: 'Daraz URL is required.' }, { status: 400 });
    }
    
    // 1. Fetch content from Firecrawl
    const firecrawlRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.FIRECRAWL_API_KEY}`
        },
        body: JSON.stringify({
          url: darazUrl,
          pageOptions: { onlyMainContent: true }
        })
    });
    
    if (!firecrawlRes.ok) {
        const errorBody = await firecrawlRes.text();
        throw new Error(`Failed to fetch from Firecrawl: ${firecrawlRes.status} ${firecrawlRes.statusText} - ${errorBody}`);
    }
    const scrapeData = await firecrawlRes.json();
    const webText = scrapeData.data.markdown;

    // 2. Process with Groq
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `
        You are an expert e-commerce data extractor for a luxury brand named 'Talha Luxe'.
        Given the markdown content from a product page, your task is to extract the following information and return it as a single, valid JSON object.
        Do not include any text, markdown, or formatting outside of the raw JSON object.

        The JSON object must have these keys:
        {
          "name": "string",
          "price": number,
          "description": "string",
          "images": ["string"],
          "variants": [
              {"type": "string", "value": "string", "variantImage": "string"}
          ]
        }

        RULES:
        1. "name": Rewrite the product title to sound 'Premium' and 'Luxe'. NEVER mention "Daraz".
        2. "price": Extract the product price in PKR. It must be a number. Do NOT add any profit here. We will add profit later.
        3. "description": Write a compelling, one-sentence luxury description. NEVER mention "Daraz".
        4. "images": Extract ALL available unique product image URLs.
           - IMPORTANT: This should be a comprehensive list of all high-quality product photos ONLY.
           - DO NOT include any images that are logos, QR codes, app store badges, or promotional graphics.
           - IGNORE URLs that contain words like "qrcode", "app-download", "logo", or "icon".
        5. "variants": Find all product variations like 'Color' or 'Size'. For each variant, find its corresponding image URL from the webpage content and add it to the 'variantImage' field. The 'value' is the specific option (e.g., 'Black', 'Large'). The 'type' is the category of option (e.g., 'Color', 'Size'). If no variants exist, return an empty array [].
    `;

    const userPrompt = `
        Here is the markdown content:
        ---
        ${webText.substring(0, 15000)}
        ---
    `;

    const chatCompletion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.2,
        response_format: { type: 'json_object' },
    });

    const aiResponseText = chatCompletion.choices[0]?.message?.content;
    if (!aiResponseText) {
        throw new Error('AI did not return a valid response.');
    }
    
    const productData = JSON.parse(aiResponseText);

    // 3. Filter and Upload images to ImageKit
    const allSourceImageUrls = new Set<string>();
    
    // Filter out common QR code and icon URLs from base images
    const cleanBaseImages = (productData.images || []).filter((img: string) => {
        const lowerImg = img.toLowerCase();
        return (
            !lowerImg.includes("qrcode") && 
            !lowerImg.includes("qr-code") &&
            !lowerImg.includes("logo") &&
            !lowerImg.includes("icon") &&
            !lowerImg.includes("app-store")
        );
    });

    if (cleanBaseImages && Array.isArray(cleanBaseImages)) {
        cleanBaseImages.forEach((img: string) => img && allSourceImageUrls.add(img));
    }
    if (productData.variants && Array.isArray(productData.variants)) {
        productData.variants.forEach((v: any) => v.variantImage && allSourceImageUrls.add(v.variantImage));
    }

    const imageUrlsToUpload = Array.from(allSourceImageUrls);
    const urlMap = new Map<string, string>();

    if (imageUrlsToUpload.length > 0) {
        const uploadPromises = imageUrlsToUpload.map(url =>
            imagekit.upload({
                file: url,
                fileName: `product-${uuidv4()}`,
                folder: '/talhaluxe-products/',
                useUniqueFileName: true,
            }).catch(err => {
                console.warn(`Failed to upload image from ${url}:`, err.message);
                return null; // Return null on failure
            })
        );
        const uploadResults = await Promise.all(uploadPromises);

        imageUrlsToUpload.forEach((originalUrl, index) => {
            if (uploadResults[index]) {
                urlMap.set(originalUrl, (uploadResults[index] as any).url);
            }
        });
    }

    // 4. Apply business logic and add default values
    const finalPrice = (productData.price || 0) + 400;

    const uploadedBaseImages = cleanBaseImages.map((url: string) => urlMap.get(url)).filter(Boolean) as string[] || [];

    const finalVariants = productData.variants?.map((v: any) => ({
        id: uuidv4(),
        type: v.type || 'Option',
        name: v.value || 'Default',
        stock: 10,
        imageUrl: urlMap.get(v.variantImage) || uploadedBaseImages[0] || '',
    })) || [];

    const allVariantImages = finalVariants.map((v: any) => v.imageUrl).filter(Boolean);
    const combinedImageUrls = [...new Set([...uploadedBaseImages, ...allVariantImages])];


    // 5. Save to Firestore
    const productsCollection = firestore.collection('products');
    const newProduct: any = {
        name: productData.name || 'Untitled Product',
        shortDescription: productData.description || 'Exquisite new arrival.',
        description: productData.description || 'A stunning piece from our latest collection.',
        price: finalPrice,
        discountedPrice: null,
        category: 'uncategorized',
        imageUrls: combinedImageUrls,
        stock: 100, // Default stock, will be overridden by variants
        rating: 0,
        reviewCount: 0,
        isNewArrival: true,
        isBestSeller: false,
        onSale: false,
        variants: finalVariants,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (newProduct.variants.length > 0) {
        newProduct.stock = newProduct.variants.reduce((acc: number, v: any) => acc + v.stock, 0);
    }

    const docRef = await productsCollection.add(newProduct);

    // 6. Return success response
    return NextResponse.json({ 
        message: 'Product imported successfully!', 
        productId: docRef.id,
        productName: newProduct.name,
    }, { status: 200 });

  } catch (error: any) {
    console.error('API Error:', error.stack);
    // Custom error messages for better user feedback
    let errorMessage = error.message || 'An unknown error occurred.';
    if (error.status === 404) {
        errorMessage = `The AI model was not found. Please ensure the 'Generative Language API' is enabled in your Google Cloud project and that the model is available in your project's region.`;
    } else if (error.code === 'insufficient_quota') {
        errorMessage = `Your Groq API quota has been exceeded. Please check your account.`;
    } else if (error.status === 401) {
        errorMessage = `Your Groq API key is invalid. Please double-check the GROQ_API_KEY in your environment variables.`;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
