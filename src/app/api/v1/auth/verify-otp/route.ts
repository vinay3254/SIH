import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { mfaSessionToken, otp } = await request.json();
    if (!mfaSessionToken) {
      return NextResponse.json({ error: 'Missing MFA session token' }, { status: 401 });
    }
    if (!otp || otp.length !== 6) {
      return NextResponse.json({ error: 'OTP must be 6 digits' }, { status: 400 });
    }

    const accessToken = `jwt_token_${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

    return NextResponse.json({
      success: true,
      accessToken,
      expiresAt,
      user: {
        id: 'user-001',
        name: 'SA Reyes, Marcus',
        email: 'sa.reyes@lea-cyberunit.gov',
        role: 'Analyst',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
