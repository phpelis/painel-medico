import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ENV, IS_PRODUCTION } from '@/lib/env';

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: new Headers(request.headers) },
    });

    const supabase = createServerClient(
        ENV.NEXT_PUBLIC_SUPABASE_URL!,
        ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    response = NextResponse.next({ request: { headers: request.headers } });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, {
                            ...options,
                            httpOnly: true,
                            secure: IS_PRODUCTION,
                            sameSite: 'lax',
                            path: '/',
                        })
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    return { response, user };
}
