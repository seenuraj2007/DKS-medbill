import { NextRequest, NextResponse } from 'next/server';
import { getGoogleOAuth, setOAuthStateCookie, createPKCEState } from '@/lib/oauth';

// Get the base URL from the request to support multiple ports
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
        // Get the current request's base URL to support multiple ports
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

        const { state, codeVerifier } = await createPKCEState();
        await setOAuthStateCookie(state, codeVerifier);

        const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'email', 'profile']);
        return NextResponse.redirect(url.toString());
    } catch (error) {
        console.error('OAuth initiation error:', error);
        return NextResponse.redirect(new URL('/auth?error=oauth_failed', request.url));
    }
}
