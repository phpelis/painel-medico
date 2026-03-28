'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Dashboard Error]', error);
    }, [error]);

    return (
        <div className="flex-1 flex items-center justify-center p-6">
            <div className="medical-card p-8 max-w-md w-full text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-error-light mx-auto">
                    <AlertTriangle size={24} className="text-error" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-base font-semibold text-foreground">Algo deu errado</h2>
                    <p className="text-sm text-foreground-secondary">
                        Ocorreu um erro ao carregar esta página. Tente novamente.
                    </p>
                </div>
                <button onClick={reset} className="action-btn-primary">
                    Tentar novamente
                </button>
            </div>
        </div>
    );
}
