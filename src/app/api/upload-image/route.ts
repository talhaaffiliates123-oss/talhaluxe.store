
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    // This functionality is disabled because environment keys were removed.
    return NextResponse.json({ error: 'Image upload service is not configured. Please add ImageKit credentials to your environment variables.' }, { status: 500 });
}
