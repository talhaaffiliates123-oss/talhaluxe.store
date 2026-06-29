
import { NextResponse } from 'next/server';

/**
 * DEPRECATED: This API route is no longer in use.
 * Product image uploads are now handled directly via Firebase Storage in the client.
 */
export async function POST() {
    return NextResponse.json(
        { error: 'This endpoint is deprecated. Use Firebase Storage direct uploads.' }, 
        { status: 410 }
    );
}
