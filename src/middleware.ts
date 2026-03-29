import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

const CHATWOOT_ORIGIN = 'https://chat.doutortaon.app';

export async function middleware(request: NextRequest) {
    const { response, user } = await updateSession(request);

    const isChatwootRoute = request.nextUrl.pathname.startsWith('/chatwoot');
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

    // Security headers — allow iframe for Chatwoot origin globally
    response.headers.set('Content-Security-Policy', `frame-ancestors 'self' ${CHATWOOT_ORIGIN}`);
    response.headers.delete('X-Frame-Options'); // Allow via CSP instead

    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Protected route redirect — skip for Chatwoot routes (auth handled by cookie)
    if (!user && isDashboard && !isChatwootRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from login
    if (user && request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
