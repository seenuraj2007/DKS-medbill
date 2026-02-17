import { NextRequest, NextResponse } from 'next/server';
import { getGoogleOAuth } from '@/lib/oauth';
import { generateState, generateCodeVerifier } from 'arctic';

function getRequestBaseUrl(request: NextRequest): string {
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 
                     (host.includes('localhost') ? 'http' : 'https');
    return `${protocol}://${host}`;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const { provider } = await params;

    if (provider !== 'google') {
        return NextResponse.json({ error: 'Invalid OAuth provider. Only Google is supported.' }, { status: 400 });
    }

    try {
        const baseUrl = getRequestBaseUrl(request);
        const google = getGoogleOAuth(baseUrl);
        
        if (!google) {
            console.error('OAuth Config Error:', {
                clientIdExists: !!process.env.GOOGLE_CLIENT_ID,
                clientSecretExists: !!process.env.GOOGLE_CLIENT_SECRET,
                clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
                nodeEnv: process.env.NODE_ENV,
            });
            return NextResponse.json({ 
                error: 'Google OAuth is not configured',
                details: 'Check your .env.local file and restart the dev server'
            }, { status: 500 });
        }

        const state = generateState();
        const codeVerifier = generateCodeVerifier();

        // In development, encode codeVerifier in state to survive hot reload
        let finalState = state;
        if (process.env.NODE_ENV !== 'production') {
            finalState = `${state}:${codeVerifier}`;
        }

        const url = google.createAuthorizationURL(finalState, codeVerifier, ['openid', 'email', 'profile']);
        
        const response = NextResponse.redirect(url.toString());
        
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            path: '/',
            secure: isProduction,
            httpOnly: true,
            maxAge: 60 * 10,
            sameSite: 'lax' as const,
        };
        
        response.cookies.set('oauth_state', state, cookieOptions);
        response.cookies.set('oauth_code_verifier', codeVerifier, cookieOptions);

        console.log('OAuth initiated:', { state: state.substring(0, 10) + '...' });

        return response;
    } catch (error) {
        console.error('OAuth initiation error:', error);
        return NextResponse.redirect(new URL('/auth?error=oauth_failed', request.url));
    }
}
