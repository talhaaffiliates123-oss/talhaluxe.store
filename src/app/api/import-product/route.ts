
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/server-initialization';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as admin from 'firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { firestore } = initializeFirebase();
    const { url: darazUrl } = await req.json();

    if (!darazUrl) {
      return NextResponse.json({ error: 'Daraz URL is required.' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
    }

    // 1. Fetch content from Jina AI Reader
    const jinaUrl = `https://r.jina.ai/${darazUrl}`;
    const response = await fetch(jinaUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch from Jina AI Reader: ${response.statusText}`);
    }
    const pageContent = await response.text();

    // 2. Process with Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    const prompt = `
        You are an expert e-commerce data extractor for a luxury brand named 'Talha Luxe'. 
        Given the text content from a product page, your task is to extract the following information and return it as a single, valid JSON object. 
        Do not include any text, markdown, or formatting outside of the raw JSON object.

        1. "name": The product title. Rewrite this title to sound more luxurious, premium, and appealing.
        2. "price": The product price as a number. Extract only the numerical value, removing any currency symbols or commas.
        3. "imageUrl": The main product image URL. Find the highest quality image URL available in the text.
        4. "description": A short, compelling product description (2-3 sentences). Rewrite the original description to be more luxurious and elegant, suitable for our premium brand.

        Here is the text content:
        ---
        ${pageContent}
        ---
    `;

    const result = await model.generateContent(prompt);
    const aiResponseText = result.response.text();
    const productData = JSON.parse(aiResponseText);

    // 3. Apply business logic
    const finalPrice = productData.price + 800;

    // 4. Save to Firestore
    const productsCollection = firestore.collection('products');
    const newProduct = {
        name: productData.name,
        shortDescription: productData.description.substring(0, 100),
        description: productData.description,
        price: finalPrice,
        discountedPrice: null,
        category: 'uncategorized', // Default category
        imageUrls: [productData.imageUrl],
        stock: 100, // Default stock
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
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'An unknown error occurred.' }, { status: 500 });
  }
}
