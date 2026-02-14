import { NextRequest, NextResponse } from 'next/server';
import { getGoogleOAuth, verifyOAuthState } from '@/lib/oauth';
import { oauthSignIn, createSessionToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureUserTenant } from '@/lib/tenant-setup';

// Get the base URL from the request to support multiple ports
function getRequestBaseUrl(request: NextRequest): string {
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 
                     (host.includes('localhost') ? 'http' : 'https');
    return `${protocol}://${host}`;
}

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
        console.error('Google OAuth error:', error);
        return NextResponse.redirect(new URL('/auth?error=oauth_denied', request.url));
    }

    if (!code || !state) {
        return NextResponse.redirect(new URL('/auth?error=invalid_request', request.url));
    }

    try {
        // Verify state
        const stateVerification = await verifyOAuthState(state);
        if (!stateVerification.valid) {
            return NextResponse.redirect(new URL('/auth?error=invalid_state', request.url));
        }

        // Get the current request's base URL to support multiple ports
        const baseUrl = getRequestBaseUrl(request);
        const google = getGoogleOAuth(baseUrl);
        
        if (!google) {
            return NextResponse.redirect(new URL('/auth?error=oauth_not_configured', request.url));
        }

        // Validate authorization code and get tokens
        const tokens = await google.validateAuthorizationCode(code, stateVerification.codeVerifier!);

        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`
            }
        });

        if (!userInfoResponse.ok) {
            throw new Error('Failed to fetch user info from Google');
        }

        const userInfo = await userInfoResponse.json();

        if (!userInfo.email) {
            return NextResponse.redirect(new URL('/auth?error=no_email', request.url));
        }

        // Sign in or create user with OAuth
        // Handle tokens that may be functions or strings
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tokensAny = tokens as any;
        const accessToken: string | undefined = typeof tokensAny.accessToken === 'function'
            ? tokensAny.accessToken()
            : tokensAny.accessToken;
        const refreshToken: string | undefined = tokensAny.refreshToken
            ? (typeof tokensAny.refreshToken === 'function' ? tokensAny.refreshToken() : tokensAny.refreshToken)
            : undefined;

        const result = await oauthSignIn(
            userInfo.email,
            userInfo.name || userInfo.given_name || null,
            'google',
            userInfo.id,
            accessToken,
            refreshToken
        );

        if (!result) {
            return NextResponse.redirect(new URL('/auth?error=oauth_failed', request.url));
        }

        const { user, token } = result;

        // Get or create tenant for user
        let tenant = await prisma.tenant.findFirst({
            where: { ownerId: user.id }
        });

        if (!tenant) {
            tenant = await ensureUserTenant(user.id, user.email);
        }

        // Create response with session cookie
        const response = NextResponse.redirect(new URL('/dashboard', request.url));

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Google OAuth callback error:', error);
        return NextResponse.redirect(new URL('/auth?error=oauth_failed', request.url));
    }
}
