'use client';

import { Loader2, AlertCircle } from 'lucide-react';

/**
 * Standard loading screen replicated from painel-atendimento
 */
export function LoadingScreen({ message }: { message: string }) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-white overflow-hidden">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-400 font-medium animate-pulse">{message}</p>
            </div>
        </div>
    );
}

/**
 * Restricted access screen for when application is accessed outside an authorized iframe
 */
export function StandaloneScreen() {
    return (
        <div className="h-screen w-screen flex items-center justify-center p-6 text-center overflow-hidden bg-slate-50">
            <div className="max-w-md space-y-4 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <AlertCircle className="w-16 h-16 text-slate-400 mx-auto" />
                <h2 className="text-xl font-bold text-slate-700">Acesso Restrito</h2>
                <p className="text-slate-500 text-sm">
                    Este painel foi projetado para operar exclusivamente dentro do ambiente do Chatwoot.
                </p>
                <div className="pt-4">
                    <a 
                        href="/login" 
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm underline underline-offset-4"
                    >
                        Acessar via login direto
                    </a>
                </div>
            </div>
        </div>
    );
}

/**
 * Generic error screen for initialization failures
 */
export function ErrorScreen({ message }: { message: string }) {
    return (
        <div className="h-screen w-screen flex items-center justify-center p-6 text-center overflow-hidden">
            <div className="max-w-md space-y-4">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                <h2 className="text-xl font-bold">{message}</h2>
                <p className="text-slate-500 text-sm">
                    Não foi possível sincronizar sua sessão. Verifique sua conexão ou contate o suporte.
                </p>
            </div>
        </div>
    );
}
