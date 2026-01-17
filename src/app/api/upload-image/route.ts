
import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import { v4 as uuidv4 } from 'uuid';

// Check for API Keys
if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new Error('ImageKit credentials not configured.');
}

// Initialize ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
        }

        // Convert file to buffer
        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);

        const uploadResult = await imagekit.upload({
            file: fileBuffer,
            fileName: `product-${uuidv4()}`,
            folder: '/talhaluxe-products/',
            useUniqueFileName: true,
        });

        return NextResponse.json({ url: uploadResult.url }, { status: 200 });

    } catch (error: any) {
        console.error('Image upload error:', error);
        return NextResponse.json({ error: 'Image upload failed.', details: error.message }, { status: 500 });
    }
}
