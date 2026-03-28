'use client';

import { useState } from 'react';
import { FileText, Eye } from 'lucide-react';
import type { DocumentoModelo } from '@/types/database';

interface Props { modelos: DocumentoModelo[] }

const TIPO_LABELS: Record<string, { label: string; color: string }> = {
    receita:        { label: 'Receita',          color: 'bg-info-light text-info' },
    atestado:       { label: 'Atestado',         color: 'bg-success-light text-success' },
    pedido_exame:   { label: 'Pedido de Exame',  color: 'bg-warning-light text-warning' },
    declaracao:     { label: 'Declaração',       color: 'bg-primary/10 text-primary' },
    encaminhamento: { label: 'Encaminhamento',   color: 'bg-primary/10 text-primary' },
};

export function DocumentosGrid({ modelos }: Props) {
    const [preview, setPreview] = useState<DocumentoModelo | null>(null);

    if (modelos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText size={40} className="text-border-strong mb-3" />
                <p className="text-sm font-semibold text-foreground">Nenhum modelo cadastrado</p>
                <p className="text-xs text-foreground-secondary mt-1">
                    Modelos de documentos são criados no painel de atendimento.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {modelos.map(m => {
                    const tipo = TIPO_LABELS[m.tipo] || { label: m.tipo || 'Documento', color: 'bg-background-secondary text-foreground-secondary' };
                    return (
                        <div key={m.id} className="medical-card p-4 flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="p-2 rounded-lg bg-background-secondary shrink-0">
                                    <FileText size={18} className="text-primary" />
                                </div>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${tipo.color}`}>
                                    {tipo.label}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{m.titulo}</p>
                                {m.descricao && (
                                    <p className="text-xs text-foreground-secondary mt-0.5 line-clamp-2">{m.descricao}</p>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-foreground-secondary">
                                    {m.created_at ? new Date(m.created_at).toLocaleDateString('pt-BR') : ''}
                                </span>
                                {m.conteudo && (
                                    <button
                                        onClick={() => setPreview(m)}
                                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                                    >
                                        <Eye size={12} />
                                        Visualizar
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Preview Modal */}
            {preview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setPreview(null)}>
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <h2 className="text-sm font-semibold text-foreground">{preview.titulo}</h2>
                            <button onClick={() => setPreview(null)} className="text-foreground-secondary hover:text-foreground text-lg leading-none">×</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5">
                            <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">{preview.conteudo}</pre>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
