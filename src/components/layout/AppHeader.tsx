import { Bell, Star, Stethoscope } from 'lucide-react';
import { maskCRM_RQE } from '@/utils/masks';

interface AppHeaderProps {
    nomeMedico?: string;
    crm?: string;
    ufCrm?: string;
    mediaAvaliacao?: number;
}

export function AppHeader({ nomeMedico, crm, ufCrm, mediaAvaliacao }: AppHeaderProps) {
    return (
        <header className="shrink-0 bg-white border-b border-border shadow-sm relative z-50">
            <div className="flex items-center justify-between px-6 py-3 gap-6">

                {/* Left: Doctor info */}
                <div className="flex-1 flex items-center gap-4 min-w-0">
                    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary-ultra-light/30 border border-primary-light/20">
                        <Stethoscope className="w-5 h-5 text-primary" strokeWidth={2} />
                    </div>

                    {nomeMedico ? (
                        <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-bold text-foreground truncate">
                                    Dr(a). {nomeMedico}
                                </h2>
                                {(mediaAvaliacao !== undefined && mediaAvaliacao > 0) && (
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-warning-light border border-(--warning)/20 shrink-0">
                                        <Star className="w-3 h-3 fill-current text-(--warning)" />
                                        <span className="text-[10px] font-bold text-(--warning)">
                                            {mediaAvaliacao.toFixed(1)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center text-metadata text-foreground-secondary">
                                <span className="text-[10px] font-semibold uppercase tracking-wider">
                                    CRM {crm ? maskCRM_RQE(crm) : '---'}/{ufCrm || 'UF'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-sm font-medium italic text-foreground-secondary">
                            Carregando...
                        </span>
                    )}
                </div>

                {/* Right: Bell */}
                <button
                    aria-label="Notificações"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground-secondary hover:bg-background-secondary transition-colors"
                >
                    <Bell size={16} />
                </button>
            </div>
        </header>
    );
}
