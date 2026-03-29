'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useChatwootHandshake } from '@/hooks/useChatwootHandshake';
import { LoadingScreen, StandaloneScreen, ErrorScreen } from '@/components/shared/StatusScreens';

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
        if (isLinked) {
            authenticate();
        }
    }, [isLinked, authenticate]);

    // Standalone mode — not inside an iframe
    if (isStandalone) {
        return <StandaloneScreen />;
    }

    if (handshakeLoading || authStatus === 'pending') {
        return <LoadingScreen message="Conectando ao Chatwoot..." />;
    }

    if (authStatus === 'authenticating') {
        return <LoadingScreen message={`Autenticando Dr(a). ${doctorEmail}...`} />;
    }

    if (authStatus === 'success') {
        return <LoadingScreen message="Autenticado! Redirecionando..." />;
    }

    if (authStatus === 'error') {
        return <ErrorScreen message={errorMessage} />;
    }

    return null;
}
