'use client';

import { Bell, Star, Stethoscope } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { maskCRM_RQE } from '@/utils/masks';

interface AppHeaderProps {
    nomeMedico?: string;
    crm?: string;
    ufCrm?: string;
    mediaAvaliacao?: number;
}

export function AppHeader({ nomeMedico, crm, ufCrm, mediaAvaliacao }: AppHeaderProps) {
    const router = useRouter();

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    }

    return (
        <header className="shrink-0 bg-white border-b border-border shadow-sm relative z-50">
            <div className="flex items-center justify-between px-6 py-3 gap-6">

                {/* Left: Logo */}
                <div className="flex items-center gap-3">
                    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary-ultra-light/30 border border-primary-light/20">
                        <Stethoscope className="w-5 h-5 text-primary" strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground">DoutorTáOn</p>
                        <p className="text-[10px] text-foreground-secondary">Painel Médico</p>
                    </div>
                </div>

                {/* Right: Doctor card + Bell */}
                <div className="flex items-center gap-3">
                    <button
                        aria-label="Notificações"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground-secondary hover:bg-background-secondary transition-colors"
                    >
                        <Bell size={16} />
                    </button>

                    {nomeMedico && (
                        <div className="shrink-0 flex items-center gap-3 px-4 py-2 rounded-lg bg-background-secondary/50 border border-border">
                            <div className="flex flex-col items-end gap-0.5">
                                <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                                    Dr(a). {nomeMedico}
                                </span>
                                <div className="flex items-center gap-2">
                                    {(mediaAvaliacao !== undefined && mediaAvaliacao > 0) && (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-warning-light border border-(--warning)/20">
                                            <Star className="w-3 h-3 fill-current text-(--warning)" />
                                            <span className="text-[10px] font-bold text-(--warning)">
                                                {mediaAvaliacao.toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-[10px] font-semibold text-foreground-secondary uppercase tracking-wider">
                                        CRM {crm ? maskCRM_RQE(crm) : '---'}/{ufCrm || 'UF'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
