import { Clock } from 'lucide-react';
import type { Atendimento } from '@/types/database';
import { PAGAMENTO_BADGES } from '@/utils/constants';
import { PaginationControls } from '@/components/ui/PaginationControls';

interface Props {
    items: Atendimento[];
    loading: boolean;
    availableHeight: number;
    tableRef: React.RefObject<HTMLDivElement | null>;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
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
    onPageChange 
}: Props) {
    const tableStyle: React.CSSProperties = availableHeight > 0
        ? { maxHeight: availableHeight }
        : {};

    return (
        <div ref={tableRef} className="medical-card flex flex-col overflow-hidden" style={tableStyle}>
            {loading ? (
                <div className="p-8 text-center text-sm text-foreground-secondary">Carregando...</div>
            ) : items.length === 0 ? (
                <div className="p-8 text-center text-sm text-foreground-secondary">Nenhum atendimento encontrado.</div>
            ) : (
                <div className="overflow-x-auto overflow-y-auto flex-1">
                    <table className="w-full text-sm">
                        <thead className="border-b border-border bg-background-secondary sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-label">Data</th>
                                <th className="px-4 py-3 text-left text-label">Paciente</th>
                                <th className="px-4 py-3 text-left text-label">Tipo</th>
                                <th className="px-4 py-3 text-right text-label">Valor</th>
                                <th className="px-4 py-3 text-center text-label">Pagamento</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {items.map(a => {
                                const pg = getPagamentoBadge(a);
                                const dataInicio = a.inicio ? new Date(a.inicio) : null;
                                const horaFim = a.fim
                                    ? new Date(a.fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                                    : null;
                                const emAndamento = a.status === 'em_atendimento';

                                return (
                                    <tr key={a.id} className="hover:bg-background-secondary/50 transition-colors">
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
                                            {a.paciente?.nome || '—'}
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

            {!loading && totalPages > 1 && (
                <div className="px-4 pb-4 shrink-0 bg-white">
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
