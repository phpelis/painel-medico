'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { Search, Stethoscope, HeartPulse, FileText, MessageCircle } from 'lucide-react';
import type { Atendimento } from '@/types/database';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { useDynamicPagination } from '@/hooks/useDynamicPagination';
import { cn } from '@/utils';

type Filtros = { search: string };

interface Props {
    items: Atendimento[];
    loading: boolean;
    expandedId: string | null;
    activeTab: 'summary' | 'documents' | 'chat' | null;
    onAction: (id: string, tab: 'summary' | 'documents' | 'chat') => void;
    filtros: Filtros;
    onFilter: (key: keyof Filtros, value: string) => void;
    total: number;
    totalPago: number;
    totalPendente: number;
}

function getPagamento(a: Atendimento): { label: string; cls: string } {
    if (a.status === 'cancelado')                      return { label: 'Cancelado',  cls: 'text-[--error]' };
    if (!a.valor_consulta || a.valor_consulta === 0)   return { label: 'Gratuito',   cls: 'text-[--info]' };
    switch (a.pagamento_status) {
        case 'pago':     return { label: 'Concluído',  cls: 'text-[--success]' };
        case 'pendente': return { label: 'Pendente',   cls: 'text-[--warning]' };
        case 'cancelado':return { label: 'Cancelado',  cls: 'text-[--error]' };
        case 'estornado':return { label: 'Estornado',  cls: 'text-foreground-secondary' };
        default:         return { label: 'Pendente',   cls: 'text-[--warning]' };
    }
}

function ColBlock({ label, children, className }: {
    label: string; children: React.ReactNode; className?: string;
}) {
    return (
        <div className={cn('flex flex-col text-left', className)}>
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">{label}</span>
            <div className="text-[11px] font-bold text-slate-600 tracking-tight leading-none whitespace-nowrap">{children}</div>
        </div>
    );
}

export function AtendimentosTable({
    items, loading, expandedId, activeTab, onAction,
    filtros, onFilter, total, totalPago, totalPendente,
}: Props) {
    // containerRef: medido via getBoundingClientRect — sem loop circular
    const containerRef = useRef<HTMLDivElement>(null);
    const { itemsPerPage, availableHeight } = useDynamicPagination(containerRef, 68, 8);

    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => { setCurrentPage(1); }, [items.length]);

    const totalPages = Math.max(1, Math.ceil(items.length / Math.max(1, itemsPerPage)));
    const safePage   = Math.min(currentPage, totalPages);
    const pageItems  = useMemo(
        () => items.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage),
        [items, safePage, itemsPerPage]
    );

    // maxHeight constrange o container ao espaço disponível sem dependência circular
    const outerStyle: React.CSSProperties = availableHeight > 0 ? { maxHeight: availableHeight } : {};

    return (
        <div className="flex flex-col">

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-2 px-2 py-1.5 bg-slate-100/50 border border-slate-200 border-b-0 rounded-t-xl shrink-0">
                <div className="relative flex-1 min-w-[140px] sm:max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar por paciente, token, tipo ou dd/mm/aa - dd/mm/aa..."
                        value={filtros.search}
                        onChange={e => onFilter('search', e.target.value)}
                        className="w-full pl-8 pr-3 h-9 border border-slate-200 rounded-lg bg-white text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                    />
                </div>
                {!loading && total > 0 && (
                    <div className="hidden sm:flex items-center gap-3 ml-auto pr-1 text-[10px] font-medium text-slate-500 whitespace-nowrap">
                        <span><strong className="text-slate-700">{total}</strong> atendimentos</span>
                        <span className="text-[--success]">Rec: <strong>R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                        <span className="text-[--warning]">Pend: <strong>R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                    </div>
                )}
            </div>

            {/* ── Content card — maxHeight via getBoundingClientRect, sem loop circular ── */}
            <div
                ref={containerRef}
                className="relative flex flex-col bg-white border border-slate-200 rounded-b-xl overflow-hidden shadow-sm"
                style={outerStyle}
            >
                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-foreground-secondary py-12">Carregando...</div>
                ) : items.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-foreground-secondary py-12">Nenhum atendimento encontrado.</div>
                ) : (
                    <div className="flex-1 flex flex-col min-h-0">

                        {/* Scroll container */}
                        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
                            <div className="flex flex-col gap-3">
                                {pageItems.map(a => {
                                    const endDate    = a.fim ? new Date(a.fim) : a.inicio ? new Date(a.inicio) : null;
                                    const dateStr    = endDate ? endDate.toLocaleDateString('pt-BR') : '—';
                                    const timeStr    = endDate ? endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null;
                                    const isExpanded = expandedId === a.id;
                                    const pagamento  = getPagamento(a);

                                    return (
                                        <div key={a.id} className="group flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm transition-all duration-200 overflow-hidden hover:border-blue-300 hover:shadow-md">

                                            {/* ── Mobile (< md) ── */}
                                            <div className="flex flex-col md:hidden p-3 gap-0">
                                                {/* Top: icon + name + meta */}
                                                <div className="flex items-center gap-3 w-full min-w-0">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 transition-colors group-hover:bg-blue-100 border border-slate-100 shadow-sm">
                                                        <Stethoscope className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-bold text-slate-700 truncate">{a.paciente?.nome || '—'}</span>
                                                        <span className="text-[10px] text-slate-500 font-medium truncate">
                                                            #{(a.token || a.id.slice(0, 6)).toUpperCase()}{a.tipo_consulta && ` · ${a.tipo_consulta}`}{` — ${pagamento.label}`}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Divider + date + icon-only buttons */}
                                                <div className="flex items-center justify-between border-t border-slate-100 mt-3 pt-3">
                                                    <div className="flex flex-col text-left">
                                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Data</span>
                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 tracking-tight leading-none whitespace-nowrap">
                                                            <span>{dateStr}</span>
                                                            {timeStr && <span className="text-slate-600 opacity-60 text-[10px]">{timeStr}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <button onClick={() => onAction(a.id, 'summary')} className={cn("flex items-center justify-center w-8 h-8 border rounded-lg transition-all duration-200", activeTab === 'summary' && isExpanded ? "border-rose-200 text-rose-700 bg-rose-50 ring-1 ring-rose-100" : "bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/30")} title="Resumo"><HeartPulse className="w-4 h-4" /></button>
                                                        <button onClick={() => onAction(a.id, 'documents')} className={cn("flex items-center justify-center w-8 h-8 border rounded-lg transition-all duration-200", activeTab === 'documents' && isExpanded ? "border-orange-200 text-orange-700 bg-orange-50 ring-1 ring-orange-100" : "bg-white border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50/30")} title="Documentos"><FileText className="w-4 h-4" /></button>
                                                        <button onClick={() => onAction(a.id, 'chat')} className={cn("flex items-center justify-center w-8 h-8 border rounded-lg transition-all duration-200", activeTab === 'chat' && isExpanded ? "border-emerald-200 text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100" : "bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/30")} title="Chat"><MessageCircle className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ── Desktop (md+) ── */}
                                            <div className="hidden md:flex items-center justify-between p-3 gap-4">
                                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 transition-colors group-hover:bg-blue-100 border border-slate-100 shadow-sm">
                                                        <Stethoscope className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-bold text-slate-700 truncate">{a.paciente?.nome || '—'}</span>
                                                        <span className="text-[10px] text-slate-500 font-medium truncate">
                                                            #{(a.token || a.id.slice(0, 6)).toUpperCase()}{a.tipo_consulta && ` · ${a.tipo_consulta}`}{` — ${pagamento.label}`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 shrink-0 justify-end">
                                                    <ColBlock label="Data">
                                                        <span>{dateStr}</span>
                                                        {timeStr && <span className="ml-2 opacity-60 text-[10px]">{timeStr}</span>}
                                                    </ColBlock>
                                                    <div className="flex items-center gap-1.5">
                                                        <button onClick={() => onAction(a.id, 'summary')} className={cn("flex items-center justify-center w-8 h-8 border rounded-lg transition-all", activeTab === 'summary' && isExpanded ? "border-rose-200 text-rose-700 bg-rose-50 ring-1 ring-rose-100" : "bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/30")} title="Resumo"><HeartPulse className="w-4 h-4" /></button>
                                                        <button onClick={() => onAction(a.id, 'documents')} className={cn("flex items-center justify-center w-8 h-8 border rounded-lg transition-all", activeTab === 'documents' && isExpanded ? "border-orange-200 text-orange-700 bg-orange-50 ring-1 ring-orange-100" : "bg-white border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50/30")} title="Documentos"><FileText className="w-4 h-4" /></button>
                                                        <button onClick={() => onAction(a.id, 'chat')} className={cn("flex items-center justify-center w-8 h-8 border rounded-lg transition-all", activeTab === 'chat' && isExpanded ? "border-emerald-200 text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100" : "bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/30")} title="Chat"><MessageCircle className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Paginação fixa na base */}
                        {totalPages > 1 && (
                            <div className="px-4 pb-4 bg-white shrink-0 z-10">
                                <PaginationControls currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} className="pt-4 border-t border-slate-100 mt-2" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
