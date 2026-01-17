
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import * as admin from 'firebase-admin';

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


export async function POST(req: NextRequest) {
    // Check for API Keys
    if (!process.env.GROQ_API_KEY) {
        return NextResponse.json({ error: 'Groq API key not configured.' }, { status: 500 });
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
    if (error.code === 'insufficient_quota') {
        errorMessage = `Your Groq API quota has been exceeded. Please check your account.`;
    } else if (error.status === 401) {
        errorMessage = `Your Groq API key is invalid. Please double-check the GROQ_API_KEY in your environment variables.`;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
