'use client';

import { Bell, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface AppHeaderProps {
    nomeMedico?: string;
    crm?: string;
    ufCrm?: string;
}

export function AppHeader({ nomeMedico, crm, ufCrm }: AppHeaderProps) {
    const router = useRouter();

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    }

    const firstName = nomeMedico?.split(' ')[0] ?? '';

    return (
        <header className="shrink-0 bg-white border-b border-border h-14 flex items-center justify-between px-6 z-10">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                    D
                </div>
                <div>
                    <p className="text-sm font-bold text-foreground">DoutorTáOn</p>
                    <p className="text-[10px] text-foreground-secondary">
                        {firstName ? `Dr. ${firstName}` : 'Painel Médico'}
                    </p>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                <button
                    aria-label="Notificações"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground-secondary hover:bg-background-secondary transition-colors"
                >
                    <Bell size={16} />
                </button>

                {(nomeMedico || crm) && (
                    <div className="hidden sm:flex flex-col items-end">
                        {nomeMedico && (
                            <span className="text-xs font-semibold text-foreground">{nomeMedico}</span>
                        )}
                        {crm && ufCrm && (
                            <span className="text-[10px] text-foreground-secondary">CRM {crm}/{ufCrm}</span>
                        )}
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    aria-label="Sair da conta"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground-secondary rounded-lg hover:bg-background-secondary transition-all"
                >
                    <LogOut size={14} />
                    <span className="hidden sm:inline">Sair</span>
                </button>
            </div>
        </header>
    );
}
