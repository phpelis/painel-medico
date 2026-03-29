import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

const CHATWOOT_ORIGIN = 'https://chat.doutortaon.app';

export async function middleware(request: NextRequest) {
    const { response, user } = await updateSession(request);

    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
    const isLogin = request.nextUrl.pathname === '/login';

    // Cookie set by /api/auth/chatwoot after successful Chatwoot iframe auth.
    // Presence (not content) is checked here — actual validation happens in getAuthenticatedUser().
    const hasChatwootSession = request.cookies.has('chatwoot_session');

    const isAuthenticated = !!user || hasChatwootSession;

    // Security headers — allow iframe embedding from Chatwoot origin
    response.headers.set('Content-Security-Policy', `frame-ancestors 'self' ${CHATWOOT_ORIGIN}`);
    response.headers.delete('X-Frame-Options');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Protect dashboard — redirect to login if not authenticated
    if (!isAuthenticated && isDashboard) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Skip login page for already-authenticated users
    if (isAuthenticated && isLogin) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
