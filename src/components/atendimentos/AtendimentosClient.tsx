'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Atendimento } from '@/types/database';
import { useDynamicPagination } from '@/hooks/useDynamicPagination';

import { AtendimentosTable } from './AtendimentosTable';
import { AtendimentoDetailsModal } from './AtendimentoDetailsModal';

/** Server-side date filters only — search is done client-side */
type Filtros = { search: string; dataInicio: string; dataFim: string };

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

/** Mobile cards are taller (~84px); desktop keeps 58px. Hook uses this for container height only. */
const CARD_HEIGHT = 84;
const CARD_GAP    = 8;
const API_MAX_LIMIT = 500;

export function AtendimentosClient() {
    // contentRef goes on the scrollable card — NOT the toolbar wrapper
    const contentRef = useRef<HTMLDivElement>(null);

    const [filtros, setFiltros] = useState<Filtros>({ search: '', dataInicio: '', dataFim: '' });
    const [allData, setAllData] = useState<Atendimento[]>([]);
    const [loading, setLoading] = useState(true);
    const [displayPage, setDisplayPage] = useState(1);

    // Modal state
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType | null>(null);
    const [detailsCache, setDetailsCache] = useState<Record<string, AtendimentoDetail>>({});

    // Hook measures container height — items per page fixed at 4
    const { availableHeight } = useDynamicPagination(contentRef, CARD_HEIGHT, CARD_GAP);

    // ── Fetch (server-side: only date range + always finalizado) ──────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('status', 'finalizado');
            if (filtros.dataInicio) params.set('data_inicio', filtros.dataInicio);
            if (filtros.dataFim)    params.set('data_fim',    filtros.dataFim);
            params.set('limit', String(API_MAX_LIMIT));

            const res  = await fetch(`/api/atendimentos?${params}`);
            const json = await res.json();
            setAllData(json.data || []);
            setDisplayPage(1);
        } catch {
            setAllData([]);
        } finally {
            setLoading(false);
        }
    }, [filtros.dataInicio, filtros.dataFim]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Client-side search (nome, token, tipo) ─────────────────────────────────
    const filteredData = useMemo(() => {
        const term = filtros.search.trim().toLowerCase();
        if (!term) return allData;
        return allData.filter(a =>
            a.paciente?.nome?.toLowerCase().includes(term) ||
            a.token?.toLowerCase().includes(term)         ||
            a.tipo_consulta?.toLowerCase().includes(term)
        );
    }, [allData, filtros.search]);

    // ── Pagination ─────────────────────────────────────────────────────────────
    const perPage          = 4; // Fixed 4 items per page
    const totalPages       = Math.max(1, Math.ceil(filteredData.length / perPage));
    const safePage         = Math.min(displayPage, totalPages);

    const paginatedData = useMemo(() => {
        const start = (safePage - 1) * perPage;
        return filteredData.slice(start, start + perPage);
    }, [filteredData, safePage, perPage]);

    // ── Stats (computed from full allData, not filtered) ──────────────────────
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
        if (key !== 'search') setDisplayPage(1);
    }, []);

    const expandedItem = expandedId ? allData.find(a => a.id === expandedId) ?? null : null;

    return (
        <div className="flex flex-col">
            <AtendimentosTable
                items={paginatedData}
                loading={loading}
                contentRef={contentRef}
                availableHeight={availableHeight}
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setDisplayPage}
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
