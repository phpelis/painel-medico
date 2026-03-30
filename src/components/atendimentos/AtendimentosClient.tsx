'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, Clock } from 'lucide-react';
import type { Atendimento } from '@/types/database';
import { PAGAMENTO_BADGES } from '@/utils/constants';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { useDynamicPagination } from '@/hooks/useDynamicPagination';

type Filtros = {
    status: string;
    dataInicio: string;
    dataFim: string;
    paciente: string;
};

const STATUS_OPTIONS = [
    { value: 'todos', label: 'Todos' },
    { value: 'finalizado', label: 'Finalizados' },
    { value: 'cancelado', label: 'Cancelados' },
    { value: 'em_atendimento', label: 'Em atendimento' },
];

// Badge de pagamento com tratamento especial para consultas gratuitas (valor = 0)
const BADGE_GRATUITO = { label: 'Gratuito', cls: 'status-badge completed' };
const BADGE_CANCELADO_ATEND = { label: 'Desconsiderado', cls: 'status-badge bg-background-secondary text-foreground-secondary border border-border' };

function getPagamentoBadge(a: Atendimento) {
    // Atendimento cancelado: pagamento desconsiderado independente do valor
    if (a.status === 'cancelado') return BADGE_CANCELADO_ATEND;
    // Valor zero em atendimento não-cancelado = consulta gratuita
    if (a.valor_consulta === 0) return BADGE_GRATUITO;
    return PAGAMENTO_BADGES[a.pagamento_status || 'pendente'] || PAGAMENTO_BADGES.pendente;
}

const ROW_HEIGHT = 49;

export function AtendimentosClient() {
    const tableRef = useRef<HTMLDivElement>(null);
    const [filtros, setFiltros] = useState<Filtros>({ status: 'todos', dataInicio: '', dataFim: '', paciente: '' });
    const [data, setData] = useState<Atendimento[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const { itemsPerPage } = useDynamicPagination(tableRef, ROW_HEIGHT, 0);
    const LIMIT = itemsPerPage;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filtros.status !== 'todos') params.set('status', filtros.status);
            if (filtros.dataInicio) params.set('data_inicio', filtros.dataInicio);
            if (filtros.dataFim) params.set('data_fim', filtros.dataFim);
            if (filtros.paciente) params.set('paciente', filtros.paciente);
            params.set('page', String(page));
            params.set('limit', String(LIMIT));

            const res = await fetch(`/api/atendimentos?${params}`);
            const json = await res.json();
            setData(json.data || []);
            setTotal(json.total || 0);
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [filtros, page, LIMIT]);

    useEffect(() => { fetchData(); }, [fetchData]);

    function handleFilter(key: keyof Filtros, value: string) {
        setFiltros(prev => ({ ...prev, [key]: value }));
        setPage(1);
    }

    const totalPages = Math.ceil(total / LIMIT);
    const totalPago = data.filter(a => a.pagamento_status === 'pago').reduce((s, a) => s + (a.valor_consulta || 0), 0);
    const totalPendente = data.filter(a => a.pagamento_status === 'pendente').reduce((s, a) => s + (a.valor_consulta || 0), 0);

    return (
        <div className="flex flex-col gap-4">
            {/* Filtros */}
            <div className="medical-card p-4 shrink-0">
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-foreground-secondary uppercase tracking-wide">
                    <Filter size={13} />
                    Filtros
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary pointer-events-none" />
                        <input
                            placeholder="Nome do paciente"
                            value={filtros.paciente}
                            onChange={e => handleFilter('paciente', e.target.value)}
                            className="medical-input pl-8"
                        />
                    </div>
                    <select value={filtros.status} onChange={e => handleFilter('status', e.target.value)} className="medical-input">
                        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <input
                        type="date"
                        value={filtros.dataInicio}
                        onChange={e => handleFilter('dataInicio', e.target.value)}
                        className="medical-input"
                    />
                    <input
                        type="date"
                        value={filtros.dataFim}
                        onChange={e => handleFilter('dataFim', e.target.value)}
                        className="medical-input"
                    />
                </div>
            </div>

            {/* Summary */}
            {!loading && data.length > 0 && (
                <div className="flex gap-4 text-sm shrink-0">
                    <span className="text-foreground-secondary">
                        <strong className="text-foreground">{total}</strong> atendimentos
                    </span>
                    <span className="text-success">
                        Recebido: <strong>R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </span>
                    <span className="text-warning">
                        Pendente: <strong>R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </span>
                </div>
            )}

            {/* Table */}
            <div ref={tableRef} className="medical-card overflow-hidden flex flex-col">
                {loading ? (
                    <div className="p-8 text-center text-sm text-foreground-secondary">Carregando...</div>
                ) : data.length === 0 ? (
                    <div className="p-8 text-center text-sm text-foreground-secondary">Nenhum atendimento encontrado.</div>
                ) : (
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-background-secondary">
                                <tr>
                                    <th className="px-4 py-3 text-left text-label">Data</th>
                                    <th className="px-4 py-3 text-left text-label">Paciente</th>
                                    <th className="px-4 py-3 text-left text-label">Tipo</th>
                                    <th className="px-4 py-3 text-right text-label">Valor</th>
                                    <th className="px-4 py-3 text-center text-label">Pagamento</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {data.map(a => {
                                    const pg = getPagamentoBadge(a);
                                    const dataInicio = a.inicio ? new Date(a.inicio) : null;
                                    const horaFim = a.fim ? new Date(a.fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null;
                                    const emAndamento = a.status === 'em_atendimento';

                                    return (
                                        <tr key={a.id} className="hover:bg-background-secondary/50 transition-colors">
                                            {/* Data + hora fim + ícone em andamento */}
                                            <td className="px-4 py-3 text-foreground-secondary">
                                                <div className="flex items-center gap-2">
                                                    <span>{dataInicio ? dataInicio.toLocaleDateString('pt-BR') : '—'}</span>
                                                    {horaFim && (
                                                        <span className="text-[10px] font-semibold text-foreground-secondary bg-background-secondary px-1.5 py-0.5 rounded">
                                                            {horaFim}
                                                        </span>
                                                    )}
                                                    {emAndamento && (
                                                        <Clock size={13} className="text-warning shrink-0" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-foreground">
                                                {(a as any).paciente?.nome || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-foreground-secondary capitalize">
                                                {a.tipo_consulta || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-foreground">
                                                {a.valor_consulta != null
                                                    ? `R$ ${a.valor_consulta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={pg.cls}>{pg.label}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="px-4 pb-4 shrink-0">
                        <PaginationControls
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
