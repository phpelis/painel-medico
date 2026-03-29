'use client';

import { useState, useEffect } from 'react';
import { CHATWOOT_ORIGIN } from '@/app/chatwoot/constants';

/**
 * Hook to manage the Chatwoot iframe handshake for painel-medico.
 * Listens for postMessage from Chatwoot host and extracts the agent's
 * email and chatwoot_user_id — no patient data needed.
 */
export function useChatwootHandshake() {
    const [doctorEmail, setDoctorEmail] = useState('');
    const [chatwootUserId, setChatwootUserId] = useState<number | null>(null);
    const [isLinked, setIsLinked] = useState(false);
    const [handshakeLoading, setHandshakeLoading] = useState(true);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // 1. Initial check: Try to get data from URL params as a fast fallback
        const searchParams = new URLSearchParams(window.location.search);
        const emailParam = searchParams.get('user_email') || searchParams.get('email');
        const idParam = searchParams.get('user_id') || searchParams.get('id');

        if (emailParam) setDoctorEmail(emailParam);
        if (idParam) setChatwootUserId(parseInt(idParam));

        if (emailParam && idParam) {
            setIsLinked(true);
            setHandshakeLoading(false);
        }
        let inIframe = false;
        try {
            inIframe = window.self !== window.top;
        } catch {
            inIframe = true;
        }

        setIsStandalone(!inIframe);

        if (!inIframe) {
            setHandshakeLoading(false);
            return;
        }

        const handleMessage = (event: MessageEvent) => {
            // Strict origin check
            if (event.origin !== CHATWOOT_ORIGIN) return;

            try {
                // Skip plain string messages (e.g. event names)
                if (typeof event.data === 'string' && !event.data.startsWith('{')) return;

                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;


                if (data.event === 'appContext' || data.event === 'chatwoot-dashboard-app:fetch-info') {
                    const ctx = data.data || data;
                    const { currentAgent } = ctx;

                    if (currentAgent?.id) setChatwootUserId(currentAgent.id);
                    if (currentAgent?.email) setDoctorEmail(currentAgent.email);

                    if (currentAgent?.email && currentAgent?.id) {
                        setIsLinked(true);
                    }

                    setHandshakeLoading(false);
                }
            } catch {
                // Silently ignore non-JSON messages from other plugins
            }
        };

        window.addEventListener('message', handleMessage);

        // Poll parent iframe for context data
        const interval = setInterval(
            () => window.parent.postMessage('chatwoot-dashboard-app:fetch-info', '*'),
            2000
        );

        // Fallback timeout: if no valid handshake after 5s, we stop loading
        // (but we might have data from URL params)
        const timeout = setTimeout(() => {
            setHandshakeLoading(false);
        }, 5000);

        return () => {
            window.removeEventListener('message', handleMessage);
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    return {
        doctorEmail,
        chatwootUserId,
        isLinked,
        handshakeLoading,
        isStandalone,
    };
}
