interface Props {
    total: number;
    totalPago: number;
    totalPendente: number;
    loading: boolean;
    hasData: boolean;
}

export function AtendimentosStats({ total, totalPago, totalPendente, loading, hasData }: Props) {
    if (loading || !hasData) return null;

    return (
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm shrink-0">
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
    );
}
