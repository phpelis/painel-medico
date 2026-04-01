'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Atendimento } from '@/types/database';

import { AtendimentosTable } from './AtendimentosTable';
import { AtendimentoDetailsModal } from './AtendimentoDetailsModal';

type Filtros = { search: string };
type TabType = 'summary' | 'documents' | 'chat';

interface AtendimentoDetail {
    loading: boolean;
    error?: string | null;
    evolution?: string | null;
    cid?: string | null;
    anamnesis?: {
        doencas_previas?: string;
        medicacoes_continuas?: string;
        alergias?: string;
        peso?: string;
        altura?: string;
    };
    documents: any[];
    chat_historico?: any[] | null;
}

const API_MAX_LIMIT = 500;

export function AtendimentosClient() {
    const [filtros, setFiltros] = useState<Filtros>({ search: '' });
    const [allData, setAllData] = useState<Atendimento[]>([]);
    const [loading, setLoading] = useState(true);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType | null>(null);
    const [detailsCache, setDetailsCache] = useState<Record<string, AtendimentoDetail>>({});

    // ── Fetch (always finalizado, all data — date filtering done client-side) ──
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('status', 'finalizado');
            params.set('limit', String(API_MAX_LIMIT));

            const res  = await fetch(`/api/atendimentos?${params}`);
            const json = await res.json();
            setAllData(json.data || []);
        } catch {
            setAllData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Client-side search + date range filter ────────────────────────────────
    const filteredData = useMemo(() => {
        const term = filtros.search.trim();
        if (!term) return allData;

        // Date range: dd/mm/aa - dd/mm/aa  or  dd/mm/aaaa - dd/mm/aaaa
        const rangeMatch = term.match(/^(\d{2}\/\d{2}\/\d{2,4})\s*-\s*(\d{2}\/\d{2}\/\d{2,4})$/);
        if (rangeMatch) {
            const parseDate = (s: string): Date | null => {
                const parts = s.trim().split('/');
                if (parts.length !== 3) return null;
                const [d, m, y] = parts.map(Number);
                return new Date(y < 100 ? 2000 + y : y, m - 1, d);
            };
            const start = parseDate(rangeMatch[1]);
            const end   = parseDate(rangeMatch[2]);
            if (start && end) {
                end.setHours(23, 59, 59, 999);
                return allData.filter(a => {
                    const dt = a.fim ? new Date(a.fim) : a.inicio ? new Date(a.inicio) : null;
                    return dt ? dt >= start && dt <= end : false;
                });
            }
        }

        const lower = term.toLowerCase();
        return allData.filter(a =>
            a.paciente?.nome?.toLowerCase().includes(lower) ||
            a.token?.toLowerCase().includes(lower)         ||
            a.tipo_consulta?.toLowerCase().includes(lower)
        );
    }, [allData, filtros.search]);

    // ── Stats ─────────────────────────────────────────────────────────────────
    const { totalPago, totalPendente } = useMemo(() => ({
        totalPago:     allData.filter(a => a.pagamento_status === 'pago')
                              .reduce((s, a) => s + (a.valor_consulta || 0), 0),
        totalPendente: allData.filter(a => a.pagamento_status === 'pendente')
                              .reduce((s, a) => s + (a.valor_consulta || 0), 0),
    }), [allData]);

    // ── Detail fetch & modal handlers ─────────────────────────────────────────
    const fetchDetails = useCallback(async (id: string) => {
        if (detailsCache[id] && !detailsCache[id].loading) return;
        setDetailsCache(prev => ({ ...prev, [id]: { loading: true, documents: [] } }));
        try {
            const res  = await fetch(`/api/atendimentos/${id}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setDetailsCache(prev => ({ ...prev, [id]: { ...data, loading: false, documents: data.documents || [] } }));
        } catch {
            setDetailsCache(prev => ({
                ...prev,
                [id]: { loading: false, error: 'Erro ao carregar detalhes.', documents: [] },
            }));
        }
    }, [detailsCache]);

    const handleAction = useCallback((id: string, tab: TabType) => {
        if (expandedId === id && activeTab === tab) {
            setExpandedId(null); setActiveTab(null);
        } else {
            setExpandedId(id); setActiveTab(tab);
            fetchDetails(id);
        }
    }, [expandedId, activeTab, fetchDetails]);

    const handleFilter = useCallback((key: keyof Filtros, value: string) => {
        setFiltros(prev => ({ ...prev, [key]: value }));
    }, []);

    const expandedItem = expandedId ? allData.find(a => a.id === expandedId) ?? null : null;

    return (
        <div className="flex flex-col h-full">
            <AtendimentosTable
                items={filteredData}
                loading={loading}
                expandedId={expandedId}
                activeTab={activeTab}
                onAction={handleAction}
                filtros={filtros}
                onFilter={handleFilter}
                total={filteredData.length}
                totalPago={totalPago}
                totalPendente={totalPendente}
            />

            {expandedItem && expandedId && activeTab && (
                <AtendimentoDetailsModal
                    item={expandedItem}
                    detail={detailsCache[expandedId] || { loading: true, documents: [] }}
                    activeTab={activeTab}
                    onTabChange={tab => setActiveTab(tab)}
                    onClose={() => { setExpandedId(null); setActiveTab(null); }}
                />
            )}
        </div>
    );
}
