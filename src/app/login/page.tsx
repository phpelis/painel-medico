'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { FeedbackBanner } from '@/components/shared/FeedbackBanner';
import { LoadingScreen } from '@/components/shared/StatusScreens';
import { useChatwootHandshake } from '@/hooks/useChatwootHandshake';

export default function LoginPage() {
    const router = useRouter();
    const { doctorEmail, chatwootUserId, isLinked, handshakeLoading } = useChatwootHandshake();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [autoAuthLoading, setAutoAuthLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isLinked && !autoAuthLoading) {
            setAutoAuthLoading(true);
            fetch('/api/auth/chatwoot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorEmail, chatwootUserId }),
            }).then(async (res) => {
                if (res.ok) {
                    router.push('/dashboard');
                    router.refresh();
                } else {
                    const data = await res.json().catch(() => ({}));
                    setError(data.error?.message || 'Falha ao logar automaticamente (Chatwoot)');
                    setAutoAuthLoading(false);
                }
            }).catch(() => {
                setError('Falha de comunicação no auto-login do Chatwoot');
                setAutoAuthLoading(false);
            });
        }
    }, [isLinked, autoAuthLoading, doctorEmail, chatwootUserId, router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const supabase = createClient();
            const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

            if (authError) {
                setError('E-mail ou senha incorretos. Verifique suas credenciais.');
                return;
            }

            router.push('/dashboard');
            router.refresh();
        } catch {
            setError('Erro ao fazer login. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    if (handshakeLoading || autoAuthLoading) {
        return (
            <LoadingScreen 
                message={autoAuthLoading 
                    ? `Autenticando Dr(a). ${doctorEmail}...` 
                    : 'Sincronizando com o Chatwoot...'} 
            />
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo / Título */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white text-xl font-bold mb-4">
                        D
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Painel do Médico</h1>
                    <p className="text-sm text-foreground-secondary mt-1">DoutorTáOn — Área exclusiva</p>
                </div>

                {/* Card de Login */}
                <div className="medical-card p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="text-label block mb-1.5">
                                E-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                                autoComplete="email"
                                className="medical-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="text-label block mb-1.5">
                                Senha
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                                className="medical-input"
                            />
                        </div>

                        {error && <FeedbackBanner type="error" message={error} />}

                        <button
                            type="submit"
                            disabled={loading}
                            className="action-btn-primary w-full"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
