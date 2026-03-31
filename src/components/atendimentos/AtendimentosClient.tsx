'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Atendimento } from '@/types/database';
import { useDynamicPagination } from '@/hooks/useDynamicPagination';

import { AtendimentosTable } from './AtendimentosTable';
import { AtendimentoDetailsModal } from './AtendimentoDetailsModal';

type Filtros = { paciente: string; dataInicio: string; dataFim: string };

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

const CARD_HEIGHT = 68;
const API_MAX_LIMIT = 500;

export function AtendimentosClient() {
    const tableRef = useRef<HTMLDivElement>(null);
    const [filtros, setFiltros] = useState<Filtros>({ paciente: '', dataInicio: '', dataFim: '' });
    const [allData, setAllData] = useState<Atendimento[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [displayPage, setDisplayPage] = useState(1);

    // Modal state
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType | null>(null);
    const [detailsCache, setDetailsCache] = useState<Record<string, AtendimentoDetail>>({});

    const { itemsPerPage, availableHeight } = useDynamicPagination(tableRef, CARD_HEIGHT, 8);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            // Always fetch only finalized atendimentos
            params.set('status', 'finalizado');
            if (filtros.dataInicio) params.set('data_inicio', filtros.dataInicio);
            if (filtros.dataFim) params.set('data_fim', filtros.dataFim);
            if (filtros.paciente) params.set('paciente', filtros.paciente);
            params.set('page', '1');
            params.set('limit', String(API_MAX_LIMIT));

            const res = await fetch(`/api/atendimentos?${params}`);
            const json = await res.json();
            setAllData(json.data || []);
            setTotal(json.total || 0);
            setDisplayPage(1);
        } catch {
            setAllData([]);
        } finally {
            setLoading(false);
        }
    }, [filtros]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const fetchDetails = useCallback(async (id: string) => {
        if (detailsCache[id] && !detailsCache[id].loading) return;

        setDetailsCache(prev => ({ ...prev, [id]: { loading: true, documents: [] } }));
        try {
            const res = await fetch(`/api/atendimentos/${id}`);
            if (!res.ok) throw new Error('Erro ao carregar detalhes');
            const data = await res.json();
            setDetailsCache(prev => ({ ...prev, [id]: { ...data, loading: false, documents: data.documents || [] } }));
        } catch {
            setDetailsCache(prev => ({
                ...prev,
                [id]: { loading: false, error: 'Erro ao carregar detalhes do atendimento.', documents: [] }
            }));
        }
    }, [detailsCache]);

    const handleAction = useCallback((id: string, tab: TabType) => {
        if (expandedId === id && activeTab === tab) {
            setExpandedId(null);
            setActiveTab(null);
        } else {
            setExpandedId(id);
            setActiveTab(tab);
            fetchDetails(id);
        }
    }, [expandedId, activeTab, fetchDetails]);

    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
    }, []);

    const handleClose = useCallback(() => {
        setExpandedId(null);
        setActiveTab(null);
    }, []);

    const handleFilter = useCallback((key: keyof Filtros, value: string) => {
        setFiltros(prev => ({ ...prev, [key]: value }));
    }, []);

    const perPage = Math.max(1, itemsPerPage);
    const totalDisplayPages = Math.max(1, Math.ceil(allData.length / perPage));
    const safePage = Math.min(displayPage, totalDisplayPages);

    const paginatedData = useMemo(() => {
        const start = (safePage - 1) * perPage;
        return allData.slice(start, start + perPage);
    }, [allData, safePage, perPage]);

    const { totalPago, totalPendente } = useMemo(() => ({
        totalPago: allData
            .filter(a => a.pagamento_status === 'pago')
            .reduce((s, a) => s + (a.valor_consulta || 0), 0),
        totalPendente: allData
            .filter(a => a.pagamento_status === 'pendente')
            .reduce((s, a) => s + (a.valor_consulta || 0), 0),
    }), [allData]);

    const expandedItem = expandedId ? allData.find(a => a.id === expandedId) : null;

    return (
        <div className="flex flex-col h-full">
            <AtendimentosTable
                items={paginatedData}
                loading={loading}
                availableHeight={availableHeight}
                tableRef={tableRef}
                currentPage={safePage}
                totalPages={totalDisplayPages}
                onPageChange={setDisplayPage}
                expandedId={expandedId}
                activeTab={activeTab}
                onAction={handleAction}
                filtros={filtros}
                onFilter={handleFilter}
                total={total}
                totalPago={totalPago}
                totalPendente={totalPendente}
            />

            {expandedItem && expandedId && activeTab && (
                <AtendimentoDetailsModal
                    item={expandedItem}
                    detail={detailsCache[expandedId] || { loading: true, documents: [] }}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    onClose={handleClose}
                />
            )}
        </div>
    );
}
