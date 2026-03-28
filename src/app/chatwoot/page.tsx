'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useChatwootHandshake } from '@/hooks/useChatwootHandshake';

/**
 * Chatwoot Dashboard App entry point.
 * This page is loaded inside the Chatwoot iframe.
 * It receives agent data via postMessage, authenticates via BFF,
 * then redirects to the dashboard.
 */
export default function ChatwootEntryPage() {
    const router = useRouter();
    const { doctorEmail, chatwootUserId, isLinked, handshakeLoading, isStandalone } = useChatwootHandshake();

    const [authStatus, setAuthStatus] = useState<'pending' | 'authenticating' | 'success' | 'error'>('pending');
    const [errorMessage, setErrorMessage] = useState('');
    const [hasAuthenticated, setHasAuthenticated] = useState(false);

    const authenticate = useCallback(async () => {
        if (hasAuthenticated) return;
        setHasAuthenticated(true);
        setAuthStatus('authenticating');

        try {
            const res = await fetch('/api/auth/chatwoot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorEmail, chatwootUserId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error?.message || 'Falha na autenticação');
            }

            setAuthStatus('success');

            // Small delay for cookie to be set, then redirect
            setTimeout(() => router.push('/dashboard'), 300);
        } catch (err) {
            setAuthStatus('error');
            setErrorMessage(err instanceof Error ? err.message : 'Erro desconhecido');
            setHasAuthenticated(false); // Allow retry
        }
    }, [doctorEmail, chatwootUserId, hasAuthenticated, router]);

    useEffect(() => {
        if (isLinked && !hasAuthenticated) {
            authenticate();
        }
    }, [isLinked, hasAuthenticated, authenticate]);

    // Standalone mode — not inside an iframe
    if (isStandalone) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.icon}>🔒</div>
                    <h1 style={styles.title}>Acesso Restrito</h1>
                    <p style={styles.text}>
                        Este painel deve ser acessado pelo Chatwoot.
                    </p>
                    <a href="/login" style={styles.link}>
                        → Acessar via login direto
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {(handshakeLoading || authStatus === 'pending') && (
                    <>
                        <div style={styles.spinner} />
                        <p style={styles.text}>Conectando ao Chatwoot...</p>
                    </>
                )}

                {authStatus === 'authenticating' && (
                    <>
                        <div style={styles.spinner} />
                        <p style={styles.text}>Autenticando Dr(a). {doctorEmail}...</p>
                    </>
                )}

                {authStatus === 'success' && (
                    <>
                        <div style={styles.iconSuccess}>✓</div>
                        <p style={styles.text}>Autenticado! Redirecionando...</p>
                    </>
                )}

                {authStatus === 'error' && (
                    <>
                        <div style={styles.iconError}>✕</div>
                        <p style={styles.textError}>{errorMessage}</p>
                        <button onClick={authenticate} style={styles.retryBtn}>
                            Tentar novamente
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    card: {
        textAlign: 'center' as const,
        padding: '2.5rem',
        borderRadius: '1rem',
        background: '#1e293b',
        border: '1px solid #334155',
        maxWidth: '360px',
        width: '90%',
    },
    icon: { fontSize: '2.5rem', marginBottom: '1rem' },
    iconSuccess: { fontSize: '2.5rem', marginBottom: '1rem', color: '#22c55e' },
    iconError: { fontSize: '2.5rem', marginBottom: '1rem', color: '#ef4444' },
    title: { fontSize: '1.25rem', fontWeight: 600, color: '#f1f5f9', margin: '0 0 0.5rem' },
    text: { fontSize: '0.875rem', color: '#94a3b8', margin: '0.5rem 0' },
    textError: { fontSize: '0.875rem', color: '#fca5a5', margin: '0.5rem 0' },
    link: {
        display: 'inline-block',
        marginTop: '1rem',
        fontSize: '0.875rem',
        color: '#60a5fa',
        textDecoration: 'none',
    },
    retryBtn: {
        marginTop: '1rem',
        padding: '0.5rem 1.5rem',
        borderRadius: '0.5rem',
        border: '1px solid #475569',
        background: '#334155',
        color: '#f1f5f9',
        cursor: 'pointer',
        fontSize: '0.875rem',
    },
    spinner: {
        width: '2rem',
        height: '2rem',
        border: '3px solid #334155',
        borderTop: '3px solid #60a5fa',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 1rem',
    },
};
