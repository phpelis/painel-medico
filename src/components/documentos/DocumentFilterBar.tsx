import { Search, Filter, Plus } from 'lucide-react';
import { FILTER_OPTIONS } from './constants';

interface Props {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    filterTipo: string;
    setFilterTipo: (v: string) => void;
    totalCount: number;
    onOpenCreate: () => void;
}

export function DocumentFilterBar({ 
    searchTerm, 
    setSearchTerm, 
    filterTipo, 
    setFilterTipo, 
    totalCount, 
    onOpenCreate 
}: Props) {
    return (
        <div className="medical-card p-3 shrink-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary pointer-events-none" />
                        <input
                            placeholder="Buscar modelo ou conteúdo..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="medical-input pl-8"
                        />
                    </div>
                    <div className="relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary pointer-events-none" />
                        <select 
                            value={filterTipo} 
                            onChange={e => setFilterTipo(e.target.value)} 
                            className="medical-input pl-8"
                        >
                            {FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground-secondary shrink-0">
                            <strong className="text-foreground">{totalCount}</strong> modelos
                        </span>
                    </div>
                </div>
                <button onClick={onOpenCreate} className="action-btn-primary flex items-center justify-center gap-1.5 shrink-0">
                    <Plus size={16} /> Novo Modelo
                </button>
            </div>
        </div>
    );
}
