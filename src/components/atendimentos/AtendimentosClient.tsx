'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Atendimento } from '@/types/database';
import { useDynamicPagination } from '@/hooks/useDynamicPagination';

import { AtendimentosFilterBar } from './AtendimentosFilterBar';
import { AtendimentosStats } from './AtendimentosStats';
import { AtendimentosTable } from './AtendimentosTable';

type Filtros = { status: string; dataInicio: string; dataFim: string; paciente: string; };

const ROW_HEIGHT = 49;
const API_MAX_LIMIT = 500;

export function AtendimentosClient() {
    const tableRef = useRef<HTMLDivElement>(null);
    const [filtros, setFiltros] = useState<Filtros>({ status: 'todos', dataInicio: '', dataFim: '', paciente: '' });
    const [allData, setAllData] = useState<Atendimento[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [displayPage, setDisplayPage] = useState(1);

    const { itemsPerPage, availableHeight } = useDynamicPagination(tableRef, ROW_HEIGHT, 0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filtros.status !== 'todos') params.set('status', filtros.status);
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

    const handleFilter = (key: keyof Filtros, value: string) => {
        setFiltros(prev => ({ ...prev, [key]: value }));
    };

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

    return (
        <div className="flex flex-col gap-4">
            <AtendimentosFilterBar filtros={filtros} onFilter={handleFilter} />

            <AtendimentosStats
                total={total}
                totalPago={totalPago}
                totalPendente={totalPendente}
                loading={loading}
                hasData={allData.length > 0}
            />

            <AtendimentosTable
                items={paginatedData}
                loading={loading}
                availableHeight={availableHeight}
                tableRef={tableRef}
                currentPage={safePage}
                totalPages={totalDisplayPages}
                onPageChange={setDisplayPage}
            />
        </div>
    );
}
