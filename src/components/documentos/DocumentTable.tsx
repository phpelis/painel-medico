import { Pencil, Trash2 } from 'lucide-react';
import type { DocumentoModelo } from '@/types/database';
import { TIPO_LABELS } from './constants';
import { PaginationControls } from '@/components/ui/PaginationControls';

interface Props {
    items: DocumentoModelo[];
    onEdit: (doc: DocumentoModelo) => void;
    onDelete: (doc: DocumentoModelo) => void;
    listRef: React.RefObject<HTMLDivElement | null>;
    availableHeight: number;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function DocumentTable({ 
    items, 
    onEdit, 
    onDelete, 
    listRef, 
    availableHeight,
    currentPage,
    totalPages,
    onPageChange
}: Props) {
    const tableStyle: React.CSSProperties = availableHeight > 0
        ? { maxHeight: availableHeight }
        : {};

    return (
        <div ref={listRef} className="medical-card flex flex-col overflow-hidden" style={tableStyle}>
            <div className="overflow-x-auto overflow-y-auto flex-1 h-full min-h-0">
                <table className="w-full text-sm border-separate border-spacing-0">
                    <thead className="border-b border-border bg-background-secondary sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 text-left text-label font-bold border-b border-border">Título / Descrição</th>
                            <th className="px-4 py-3 text-left text-label font-bold border-b border-border">Data Inclusão</th>
                            <th className="px-4 py-3 text-left text-label font-bold border-b border-border">Tipo</th>
                            <th className="px-4 py-3 text-center text-label font-bold border-b border-border">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {items.map(m => {
                            const tipo = TIPO_LABELS[m.tipo] ?? { label: m.tipo || 'Modelo', color: 'bg-background-secondary text-foreground-secondary' };
                            const createdAt = m.created_at ? new Date(m.created_at) : null;
                            const dateStr = createdAt?.toLocaleDateString('pt-BR');
                            const timeStr = createdAt?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                            return (
                                <tr key={m.id} className="hover:bg-background-secondary/50 transition-colors group">
                                    <td className="px-4 py-3 align-top min-w-[200px]">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-semibold text-foreground break-words">{m.titulo}</span>
                                            {m.descricao && <span className="text-xs text-foreground-secondary line-clamp-1 break-words">{m.descricao}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-top whitespace-nowrap">
                                        {createdAt ? (
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Data</span>
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 tracking-tight leading-none">
                                                    <span>{dateStr}</span>
                                                    <span className="text-slate-600 opacity-60 text-[10px]">{timeStr}</span>
                                                </div>
                                            </div>
                                        ) : '—'}
                                    </td>
                                    <td className="px-4 py-3 align-top">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block ${tipo.color}`}>
                                            {tipo.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center align-top">
                                        <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onEdit(m)} className="p-2 rounded-lg text-foreground-secondary hover:bg-background-secondary hover:text-primary transition-colors">
                                                <Pencil size={15} />
                                            </button>
                                            <button onClick={() => onDelete(m)} className="p-2 rounded-lg text-foreground-secondary hover:bg-error-light hover:text-error transition-colors">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-20 text-center text-foreground-secondary text-sm">
                                    Nenhum modelo encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="px-4 pb-4 pt-4 shrink-0 bg-white border-t border-border z-20">
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
