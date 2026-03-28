export const PAGAMENTO_BADGES: Record<string, { label: string; cls: string }> = {
    pago:      { label: 'Pago',      cls: 'status-badge active' },
    pendente:  { label: 'Pendente',  cls: 'status-badge pending' },
    cancelado: { label: 'Cancelado', cls: 'status-badge bg-error-light text-(--error) border border-(--error)/20' },
    estornado: { label: 'Estornado', cls: 'status-badge bg-background-secondary text-foreground-secondary' },
};

export const STATUS_ATENDIMENTO_BADGES: Record<string, { label: string; cls: string }> = {
    finalizado:     { label: 'Finalizado',   cls: 'status-badge completed' },
    cancelado:      { label: 'Cancelado',    cls: 'status-badge bg-error-light text-(--error) border border-(--error)/20' },
    em_atendimento: { label: 'Em andamento', cls: 'status-badge pending' },
    aguardando:     { label: 'Aguardando',   cls: 'status-badge bg-background-secondary text-foreground-secondary' },
    pendente:       { label: 'Pendente',     cls: 'status-badge bg-background-secondary text-foreground-secondary' },
};
