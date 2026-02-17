import { Google } from 'arctic';
import { cookies } from 'next/headers';
import { generateState, generateCodeVerifier } from 'arctic';

const devOAuthStore = new Map<string, { codeVerifier: string; timestamp: number }>();

setInterval(() => {
    const now = Date.now();
    for (const [key, value] of devOAuthStore.entries()) {
        if (now - value.timestamp > 10 * 60 * 1000) {
            devOAuthStore.delete(key);
        }
    }
}, 60 * 1000);

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
    
    if (process.env.NODE_ENV !== 'production') {
        devOAuthStore.set(state, { codeVerifier, timestamp: Date.now() });
        console.log('DEV: Stored OAuth state in memory:', state.substring(0, 10) + '...');
    }
    
    return { state, codeVerifier };
}

export function getDevOAuthState(state: string): { codeVerifier: string } | null {
    const entry = devOAuthStore.get(state);
    if (entry) {
        devOAuthStore.delete(state);
        return { codeVerifier: entry.codeVerifier };
    }
    return null;
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

    console.log('OAuth State Verification:', {
        receivedState: state?.substring(0, 10) + '...',
        storedState: storedState?.substring(0, 10) + '...',
        hasCodeVerifier: !!codeVerifier,
        match: storedState === state,
        allCookies: cookieStore.getAll().map(c => c.name).join(', ')
    });

    if (!storedState || storedState !== state) {
        if (process.env.NODE_ENV !== 'production') {
            const devState = getDevOAuthState(state);
            if (devState) {
                console.log('DEV MODE: Retrieved OAuth state from memory');
                return { valid: true, codeVerifier: devState.codeVerifier };
            }
            console.log('DEV MODE: No stored state found');
        }
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
