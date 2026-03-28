import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createClientJS } from '@supabase/supabase-js';
import { ENV, IS_PRODUCTION } from '@/lib/env';

/**
 * Server-side Supabase client (uses session cookies from Supabase Auth).
 * No Chatwoot bypass — painel-medico uses direct Supabase Auth.
 */
export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        ENV.NEXT_PUBLIC_SUPABASE_URL!,
        ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, {
                                ...options,
                                httpOnly: true,
                                secure: IS_PRODUCTION,
                                sameSite: 'lax',
                                path: '/',
                            })
                        );
                    } catch {
                        // Called from Server Component — safe to ignore
                    }
                },
            },
        }
    );
}

/**
 * Admin client — bypasses RLS. Use only in server-side API routes.
 */
export function getSupabaseAdmin() {
    const url = ENV.NEXT_PUBLIC_SUPABASE_URL;
    const key = ENV.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase admin credentials missing');
    return createClientJS(url, key);
}

/**
 * Gets the authenticated user from the current session.
 * Falls back to Chatwoot session cookie when Supabase Auth is not available
 * (e.g., when accessed via Chatwoot iframe).
 * Returns null if not authenticated by either method.
 */
export async function getAuthenticatedUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error && user) return user;

    // Fallback: Chatwoot iframe session
    const { getChatwootSession } = await import('@/lib/authSession');
    const chatwootSession = await getChatwootSession();

    if (chatwootSession?.medico_id) {
        return {
            id: chatwootSession.medico_id,
            email: chatwootSession.email,
            user_metadata: { medico_id: chatwootSession.medico_id },
        } as unknown as import('@supabase/supabase-js').User;
    }

    return null;
}
