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
    const [debugData, setDebugData] = useState<unknown>(null);

    useEffect(() => {
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
                setDebugData(data);

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
                console.warn('[useChatwootHandshake] Failed to parse message');
            }
        };

        window.addEventListener('message', handleMessage);

        // Poll parent iframe for context data
        const interval = setInterval(
            () => window.parent.postMessage('chatwoot-dashboard-app:fetch-info', '*'),
            5000
        );

        return () => {
            window.removeEventListener('message', handleMessage);
            clearInterval(interval);
        };
    }, []);

    return {
        doctorEmail,
        chatwootUserId,
        isLinked,
        handshakeLoading,
        isStandalone,
        debugData,
    };
}
