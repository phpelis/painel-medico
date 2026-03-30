export const TIPO_LABELS: Record<string, { label: string; color: string }> = {
    receita:        { label: 'Receita',          color: 'bg-info-light text-info' },
    atestado:       { label: 'Atestado',         color: 'bg-success-light text-success' },
    pedido_exame:   { label: 'Pedido de Exame',  color: 'bg-warning-light text-warning' },
    declaracao:     { label: 'Declaração',       color: 'bg-primary/10 text-primary' },
    encaminhamento: { label: 'Encaminhamento',   color: 'bg-primary/10 text-primary' },
};

export const FILTER_OPTIONS = [
    { value: 'todos',          label: 'Todos os tipos' },
    { value: 'receita',        label: 'Receita' },
    { value: 'atestado',       label: 'Atestado' },
    { value: 'pedido_exame',   label: 'Pedido de Exame' },
    { value: 'declaracao',     label: 'Declaração' },
    { value: 'encaminhamento', label: 'Encaminhamento' },
];

export const TIPO_OPTIONS = [
    { value: 'receita',        label: 'Receita' },
    { value: 'atestado',       label: 'Atestado' },
    { value: 'pedido_exame',   label: 'Pedido de Exame' },
    { value: 'declaracao',     label: 'Declaração' },
    { value: 'encaminhamento', label: 'Encaminhamento' },
];

export const ROW_HEIGHT = 68;
