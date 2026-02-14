import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json(
                { error: 'Verification token is required' },
                { status: 400 }
            );
        }

        const success = await verifyEmail(token);

        if (!success) {
            return NextResponse.json(
                { error: 'Invalid or expired verification token' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: 'Email verified successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
