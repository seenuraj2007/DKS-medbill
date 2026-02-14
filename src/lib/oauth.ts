import { Google } from 'arctic';
import { cookies } from 'next/headers';
import { generateState, generateCodeVerifier } from 'arctic';

// OAuth Provider Configuration
const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return 'http://localhost:3000';
};

// Google OAuth with dynamic redirect URI
export function getGoogleOAuth(redirectUri?: string): Google | null {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return null;
    }

    const baseUrl = redirectUri || getBaseUrl();
    return new Google(
        clientId,
        clientSecret,
        `${baseUrl}/api/auth/callback/google`
    );
}

// Generate authorization URL with state for CSRF protection
export async function createOAuthState(): Promise<{ state: string; codeVerifier?: string }> {
    const state = generateState();
    return { state };
}

export async function createPKCEState(): Promise<{ state: string; codeVerifier: string }> {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    return { state, codeVerifier };
}

// Store OAuth state in cookies
export async function setOAuthStateCookie(state: string, codeVerifier?: string) {
    const cookieStore = await cookies();

    cookieStore.set('oauth_state', state, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 10, // 10 minutes
        sameSite: 'lax'
    });

    if (codeVerifier) {
        cookieStore.set('oauth_code_verifier', codeVerifier, {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 60 * 10, // 10 minutes
            sameSite: 'lax'
        });
    }
}

// Verify OAuth state from cookies
export async function verifyOAuthState(state: string): Promise<{ valid: boolean; codeVerifier?: string }> {
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    const codeVerifier = cookieStore.get('oauth_code_verifier')?.value;

    if (!storedState || storedState !== state) {
        return { valid: false };
    }

    // Clear the state cookies after verification
    cookieStore.delete('oauth_state');
    cookieStore.delete('oauth_code_verifier');

    return { valid: true, codeVerifier };
}

// Check if Google OAuth is configured
export function isGoogleOAuthConfigured(): boolean {
    return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}
