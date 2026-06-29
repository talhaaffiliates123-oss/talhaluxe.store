import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
    publicKey: 'public_t6VZrKfi4LvDI3wUIvJuvbYyNfg=',
    privateKey: 'private_TDqTuVxMiQAXLlxaUccsIxl9Jt4=',
    urlEndpoint: 'https://ik.imagekit.io/h9hm3bwmu',
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadResponse = await imagekit.upload({
            file: buffer,
            fileName: file.name,
            folder: '/talhaluxe-products',
        });

        return NextResponse.json({ url: uploadResponse.url });

    } catch (error: any) {
        console.error('ImageKit upload error:', error);
        return NextResponse.json({ 
            error: error.message || 'Image upload failed' 
        }, { status: 500 });
    }
}