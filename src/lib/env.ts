/**
 * Environment variables for painel-medico
 * Standalone app — no Chatwoot or FastAPI dependencies
 */

export const IS_SERVER = typeof window === 'undefined';
export const APP_ENV = (process.env.APP_ENV || (process.env.NODE_ENV === 'production' ? 'production' : 'development')) as 'development' | 'staging' | 'production';
export const IS_PRODUCTION = APP_ENV === 'production' || process.env.NODE_ENV === 'production';

function isBuildPhase() {
    return (
        process.env?.npm_lifecycle_event === 'build' ||
        process.env?.NEXT_PHASE === 'phase-production-build' ||
        process.env?.IS_NEXT_BUILD === 'true'
    );
}

function getEnv(key: string): string | undefined {
    if (isBuildPhase()) return '';
    return process.env[key]?.trim();
}

export const ENV = {
    APP_ENV,
    NEXT_PUBLIC_SUPABASE_URL: (process.env.NEXT_PUBLIC_SUPABASE_URL || getEnv('NEXT_PUBLIC_SUPABASE_URL'))?.trim(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'))?.trim(),
    SUPABASE_SERVICE_ROLE_KEY: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
    ENCRYPTION_KEY: getEnv('ENCRYPTION_KEY'),
    WOOVI_API_KEY: getEnv('WOOVI_API_KEY'),
    WOOVI_BASE_URL: getEnv('WOOVI_BASE_URL'),
};

export function validateEnv() {
    if (isBuildPhase()) return;
    if (!IS_SERVER) return;

    const required: (keyof typeof ENV)[] = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'ENCRYPTION_KEY',
    ];

    const missing = required.filter(k => !ENV[k]);
    if (missing.length > 0) {
        console.warn(`⚠️ painel-medico: Missing env vars: ${missing.join(', ')}`);
    } else {
        console.log(`✅ painel-medico: ${APP_ENV} env validated`);
    }
}

if (IS_SERVER && !isBuildPhase()) {
    validateEnv();
}
