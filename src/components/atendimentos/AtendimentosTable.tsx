'use client';

import { Clock, Stethoscope, HeartPulse, FileText, MessageCircle } from 'lucide-react';
import type { Atendimento } from '@/types/database';
import { PAGAMENTO_BADGES } from '@/utils/constants';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { cn } from '@/utils';

interface Props {
    items: Atendimento[];
    loading: boolean;
    availableHeight: number;
    tableRef: React.RefObject<HTMLDivElement | null>;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    expandedId: string | null;
    activeTab: 'summary' | 'documents' | 'chat' | null;
    onAction: (id: string, tab: 'summary' | 'documents' | 'chat') => void;
}

const BADGE_GRATUITO = { label: 'Gratuito', cls: 'status-badge completed' };
const BADGE_CANCELADO_ATEND = { label: 'Desconsiderado', cls: 'status-badge bg-background-secondary text-foreground-secondary border border-border' };

function getPagamentoBadge(a: Atendimento) {
    if (a.status === 'cancelado') return BADGE_CANCELADO_ATEND;
    if (a.valor_consulta === 0) return BADGE_GRATUITO;
    return PAGAMENTO_BADGES[a.pagamento_status || 'pendente'] || PAGAMENTO_BADGES.pendente;
}

export function AtendimentosTable({
    items,
    loading,
    availableHeight,
    tableRef,
    currentPage,
    totalPages,
    onPageChange,
    expandedId,
    activeTab,
    onAction,
}: Props) {
    const containerStyle: React.CSSProperties = availableHeight > 0 ? { maxHeight: availableHeight } : {};

    return (
        <div ref={tableRef} className="medical-card flex flex-col overflow-hidden" style={containerStyle}>
            {loading ? (
                <div className="p-8 text-center text-sm text-foreground-secondary">Carregando...</div>
            ) : items.length === 0 ? (
                <div className="p-8 text-center text-sm text-foreground-secondary">Nenhum atendimento encontrado.</div>
            ) : (
                <div className="overflow-y-auto flex-1 p-3 flex flex-col gap-2">
                    {items.map(a => {
                        const pg = getPagamentoBadge(a);
                        const endDate = a.fim ? new Date(a.fim) : a.inicio ? new Date(a.inicio) : null;
                        const dateStr = endDate ? endDate.toLocaleDateString('pt-BR') : '—';
                        const timeStr = endDate ? endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null;
                        const emAndamento = a.status === 'em_atendimento';
                        const isExpanded = expandedId === a.id;

                        return (
                            <div
                                key={a.id}
                                className="group flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm transition-all duration-200 overflow-hidden hover:border-blue-300 hover:shadow-md"
                            >
                                <div className="flex flex-col md:flex-row items-center justify-between p-3 gap-4">

                                    {/* Left: icon + title + patient */}
                                    <div className="flex items-center gap-4 w-full md:w-auto min-w-0 flex-1">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 transition-colors group-hover:bg-blue-100 border border-slate-100 shadow-sm">
                                            <Stethoscope className="w-4 h-4 text-blue-600" />
                                        </div>

                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-slate-700 truncate">
                                                Atendimento #{(a.token || a.id.slice(0, 6)).toUpperCase()}
                                                {a.tipo_consulta && (
                                                    <span className="ml-2 text-[10px] font-semibold text-slate-400 capitalize normal-case">
                                                        · {a.tipo_consulta}
                                                    </span>
                                                )}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-medium truncate">
                                                {a.paciente?.nome || '—'}
                                                {a.valor_consulta != null && a.valor_consulta > 0 && (
                                                    <span className="ml-1 text-slate-400">
                                                        · R$ {a.valor_consulta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: date + badge + buttons */}
                                    <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">

                                        {/* Date/Time */}
                                        <div className="flex flex-col text-left">
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Data</span>
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 tracking-tight leading-none whitespace-nowrap">
                                                <span>{dateStr}</span>
                                                {timeStr && <span className="text-slate-600 opacity-60 text-[10px]">{timeStr}</span>}
                                                {emAndamento && <Clock size={11} className="text-warning shrink-0" />}
                                            </div>
                                        </div>

                                        {/* Payment badge */}
                                        <span className={pg.cls}>{pg.label}</span>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => onAction(a.id, 'summary')}
                                                className={cn(
                                                    "flex items-center justify-center w-8 h-8 border rounded-lg transition-all duration-200",
                                                    activeTab === 'summary' && isExpanded
                                                        ? "border-rose-200 text-rose-700 bg-rose-50 ring-1 ring-rose-100"
                                                        : "bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/30"
                                                )}
                                                title="Resumo do Atendimento"
                                            >
                                                <HeartPulse className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onAction(a.id, 'documents')}
                                                className={cn(
                                                    "flex items-center justify-center w-8 h-8 border rounded-lg transition-all duration-200",
                                                    activeTab === 'documents' && isExpanded
                                                        ? "border-orange-200 text-orange-700 bg-orange-50 ring-1 ring-orange-100"
                                                        : "bg-white border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50/30"
                                                )}
                                                title="Documentos Emitidos"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onAction(a.id, 'chat')}
                                                className={cn(
                                                    "flex items-center justify-center w-8 h-8 border rounded-lg transition-all duration-200",
                                                    activeTab === 'chat' && isExpanded
                                                        ? "border-emerald-200 text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100"
                                                        : "bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/30"
                                                )}
                                                title="Histórico de Chat"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && totalPages > 1 && (
                <div className="px-4 py-4 shrink-0 border-t border-border">
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
}
