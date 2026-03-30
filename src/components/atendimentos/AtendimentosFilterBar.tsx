import { Search } from 'lucide-react';

interface Filtros {
    status: string;
    dataInicio: string;
    dataFim: string;
    paciente: string;
}

interface Props {
    filtros: Filtros;
    onFilter: (key: keyof Filtros, value: string) => void;
}

const STATUS_OPTIONS = [
    { value: 'todos', label: 'Todos' },
    { value: 'finalizado', label: 'Finalizados' },
    { value: 'cancelado', label: 'Cancelados' },
    { value: 'em_atendimento', label: 'Em atendimento' },
];

export function AtendimentosFilterBar({ filtros, onFilter }: Props) {
    return (
        <div className="medical-card p-4 shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary pointer-events-none" />
                    <input
                        placeholder="Nome do paciente"
                        value={filtros.paciente}
                        onChange={e => onFilter('paciente', e.target.value)}
                        className="medical-input pl-8"
                    />
                </div>
                <select 
                    value={filtros.status} 
                    onChange={e => onFilter('status', e.target.value)} 
                    className="medical-input"
                >
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <input
                    type="date"
                    value={filtros.dataInicio}
                    onChange={e => onFilter('dataInicio', e.target.value)}
                    className="medical-input"
                />
                <input
                    type="date"
                    value={filtros.dataFim}
                    onChange={e => onFilter('dataFim', e.target.value)}
                    className="medical-input"
                />
            </div>
        </div>
    );
}
