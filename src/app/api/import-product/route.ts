
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error: any) {
        console.error('Firebase Admin SDK initialization error:', error.stack);
    }
}

export async function POST(req: NextRequest) {
    // Check for API Keys
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
    }
    if (!process.env.FIRECRAWL_API_KEY) {
        return NextResponse.json({ error: 'Firecrawl API key not configured.' }, { status: 500 });
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
        })
    });
    
    if (!firecrawlRes.ok) {
        const errorBody = await firecrawlRes.text();
        throw new Error(`Failed to fetch from Firecrawl: ${firecrawlRes.status} ${firecrawlRes.statusText} - ${errorBody}`);
    }
    const scrapeData = await firecrawlRes.json();
    const webText = scrapeData.data.markdown;

    // 2. Process with Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest"});

    const prompt = `
        You are an expert e-commerce data extractor for a luxury brand named 'Talha Luxe'.
        Given the markdown content from a product page, your task is to extract the following information and return it as a single, valid JSON object.
        Do not include any text, markdown, or formatting outside of the raw JSON object.

        The JSON object must have these keys:
        {
          "name": "string",
          "price": number,
          "imageUrl": "string",
          "shortDescription": "string",
          "description": "string"
        }
        
        RULES:
        1. "name": Rewrite the product title to sound more luxurious, premium, and appealing for our brand.
        2. "price": Extract the product price in PKR. It must be a number. If you find a price range, take the lowest price. Do NOT add any profit here.
        3. "imageUrl": Find the highest quality main product image URL available in the text.
        4. "shortDescription": Write a very brief, one-sentence tagline for the product that is luxurious and enticing.
        5. "description": Write a compelling product description (2-3 paragraphs). Rewrite the original description to be more luxurious and elegant, suitable for our premium brand. Focus on the feeling, craftsmanship, and premium materials.

        Here is the markdown content:
        ---
        ${webText.substring(0, 15000)}
        ---
    `;

    const result = await model.generateContent(prompt);
    const aiResponseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const productData = JSON.parse(aiResponseText);

    // 3. Apply business logic and add default values
    const finalPrice = (productData.price || 0) + 800;

    // 4. Save to Firestore
    const productsCollection = firestore.collection('products');
    const newProduct = {
        name: productData.name || 'Untitled Product',
        shortDescription: productData.shortDescription || 'Exquisite new arrival.',
        description: productData.description || 'A stunning piece from our latest collection.',
        price: finalPrice,
        discountedPrice: null,
        category: 'uncategorized',
        imageUrls: productData.imageUrl ? [productData.imageUrl] : [],
        stock: 100,
        rating: 0,
        reviewCount: 0,
        isNewArrival: true,
        isBestSeller: false,
        onSale: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await productsCollection.add(newProduct);

    // 5. Return success response
    return NextResponse.json({ 
        message: 'Product imported successfully!', 
        productId: docRef.id,
        productName: newProduct.name,
    }, { status: 200 });

  } catch (error: any) {
    console.error('API Error:', error.stack);
    // Custom error messages for better user feedback
    let errorMessage = error.message || 'An unknown error occurred.';
    if (error.message.includes("404 Not Found") && error.message.includes("is not found for API version")) {
        errorMessage = `The AI model ('gemini-1.5-pro-latest') was not found. Please ensure the 'Generative Language API' is enabled in your Google Cloud project and that the model is available in your project's region.`;
    } else if (error.message.includes("API key not valid")) {
        errorMessage = `Your Gemini API key is invalid. Please double-check the GEMINI_API_KEY in your .env.local file.`;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
