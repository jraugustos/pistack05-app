import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const authResult = await auth();

    return NextResponse.json({
      success: true,
      hasUserId: !!authResult.userId,
      userId: authResult.userId,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
