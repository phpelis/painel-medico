'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { FileText, Pencil, Trash2, Plus, X, Search, Filter } from 'lucide-react';
import type { DocumentoModelo } from '@/types/database';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { FeedbackBanner } from '@/components/shared/FeedbackBanner';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { useDynamicPagination } from '@/hooks/useDynamicPagination';

interface Props { modelos: DocumentoModelo[] }

type ModalState =
    | { mode: 'closed' }
    | { mode: 'create' }
    | { mode: 'edit'; doc: DocumentoModelo }
    | { mode: 'delete'; doc: DocumentoModelo };

type FormState = {
    titulo: string;
    tipo: string;
    conteudo: string;
    descricao: string;
};

const TIPO_LABELS: Record<string, { label: string; color: string }> = {
    receita:        { label: 'Receita',          color: 'bg-info-light text-info' },
    atestado:       { label: 'Atestado',         color: 'bg-success-light text-success' },
    pedido_exame:   { label: 'Pedido de Exame',  color: 'bg-warning-light text-warning' },
    declaracao:     { label: 'Declaração',       color: 'bg-primary/10 text-primary' },
    encaminhamento: { label: 'Encaminhamento',   color: 'bg-primary/10 text-primary' },
};

const FILTER_OPTIONS = [
    { value: 'todos',          label: 'Todos os tipos' },
    { value: 'receita',        label: 'Receita' },
    { value: 'atestado',       label: 'Atestado' },
    { value: 'pedido_exame',   label: 'Pedido de Exame' },
    { value: 'declaracao',     label: 'Declaração' },
    { value: 'encaminhamento', label: 'Encaminhamento' },
];

const TIPO_OPTIONS = [
    { value: 'receita',        label: 'Receita' },
    { value: 'atestado',       label: 'Atestado' },
    { value: 'pedido_exame',   label: 'Pedido de Exame' },
    { value: 'declaracao',     label: 'Declaração' },
    { value: 'encaminhamento', label: 'Encaminhamento' },
];

const ROW_HEIGHT = 68;
const EMPTY_FORM: FormState = { titulo: '', tipo: '', conteudo: '', descricao: '' };

export function DocumentosGrid({ modelos: initial }: Props) {
    const listRef = useRef<HTMLDivElement>(null);
    const [modelos, setModelos] = useState<DocumentoModelo[]>(initial);
    const [filterTipo, setFilterTipo] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [modalState, setModalState] = useState<ModalState>({ mode: 'closed' });
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [displayPage, setDisplayPage] = useState(1);

    const { itemsPerPage, availableHeight } = useDynamicPagination(listRef, ROW_HEIGHT, 0);

    // Reset pagination when search or filter changes
    useEffect(() => {
        const handler = setTimeout(() => {
            setDisplayPage(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm, filterTipo]);

    const filtered = useMemo(() => {
        let items = modelos;
        if (filterTipo !== 'todos') {
            items = items.filter(m => m.tipo === filterTipo);
        }
        if (searchTerm.trim()) {
            const low = searchTerm.toLowerCase();
            items = items.filter(m => 
                m.titulo.toLowerCase().includes(low) || 
                m.descricao?.toLowerCase().includes(low)
            );
        }
        return items;
    }, [modelos, filterTipo, searchTerm]);

    const perPage = Math.max(1, itemsPerPage);
    const totalDisplayPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const safePage = Math.min(displayPage, totalDisplayPages);

    const paginatedItems = useMemo(() => {
        const start = (safePage - 1) * perPage;
        return filtered.slice(start, start + perPage);
    }, [filtered, safePage, perPage]);

    function openCreate() {
        setForm(EMPTY_FORM);
        setFeedback(null);
        setModalState({ mode: 'create' });
    }

    function openEdit(doc: DocumentoModelo) {
        setForm({
            titulo: doc.titulo,
            tipo: doc.tipo || '',
            conteudo: doc.conteudo || '',
            descricao: doc.descricao || '',
        });
        setFeedback(null);
        setModalState({ mode: 'edit', doc });
    }

    function openDelete(doc: DocumentoModelo) {
        setFeedback(null);
        setModalState({ mode: 'delete', doc });
    }

    function closeModal() {
        setModalState({ mode: 'closed' });
    }

    async function handleSave() {
        if (!form.titulo.trim()) {
            setFeedback({ type: 'error', msg: 'Título é obrigatório.' });
            return;
        }
        if (!form.conteudo.trim() || form.conteudo === '<br>') {
            setFeedback({ type: 'error', msg: 'Conteúdo é obrigatório.' });
            return;
        }

        setSaving(true);
        setFeedback(null);
        try {
            const isEdit = modalState.mode === 'edit';
            const method = isEdit ? 'PUT' : 'POST';
            const body = isEdit
                ? { id: (modalState as { mode: 'edit'; doc: DocumentoModelo }).doc.id, ...form }
                : { ...form };

            const res = await fetch('/api/documentos', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.error?.message || 'Erro desconhecido');
            }

            const json = await res.json();
            setModelos(prev =>
                isEdit
                    ? prev.map(m => m.id === json.data.id ? json.data : m)
                    : [json.data, ...prev]
            );
            setFeedback({ type: 'success', msg: isEdit ? 'Modelo atualizado com sucesso!' : 'Modelo criado com sucesso!' });
            closeModal();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro ao salvar. Tente novamente.';
            setFeedback({ type: 'error', msg });
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (modalState.mode !== 'delete') return;
        setSaving(true);
        setFeedback(null);
        try {
            const res = await fetch(`/api/documentos?id=${modalState.doc.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            setModelos(prev => prev.filter(m => m.id !== modalState.doc.id));
            setFeedback({ type: 'success', msg: 'Modelo excluído.' });
            closeModal();
        } catch {
            setFeedback({ type: 'error', msg: 'Erro ao excluir. Tente novamente.' });
        } finally {
            setSaving(false);
        }
    }

    const tableStyle: React.CSSProperties = availableHeight > 0
        ? { maxHeight: availableHeight }
        : {};

    const isEditOrCreate = modalState.mode === 'edit' || modalState.mode === 'create';
    const isDelete = modalState.mode === 'delete';

    return (
        <>
            <div className="flex flex-col gap-4">
                {/* Header & Filter Bar */}
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
                                    <strong className="text-foreground">{filtered.length}</strong> modelos
                                </span>
                            </div>
                        </div>
                        <button onClick={openCreate} className="action-btn-primary flex items-center justify-center gap-1.5 shrink-0">
                            <Plus size={16} /> Novo Modelo
                        </button>
                    </div>
                </div>

                {/* Feedback */}
                {feedback && (
                    <div className="shrink-0">
                        <FeedbackBanner type={feedback.type} message={feedback.msg} />
                    </div>
                )}

                {/* List — similar to Atendimentos style */}
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
                                {paginatedItems.map(m => {
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
                                                    <button onClick={() => openEdit(m)} className="p-2 rounded-lg text-foreground-secondary hover:bg-background-secondary hover:text-primary transition-colors">
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button onClick={() => openDelete(m)} className="p-2 rounded-lg text-foreground-secondary hover:bg-error-light hover:text-error transition-colors">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {paginatedItems.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center text-foreground-secondary text-sm">
                                            Nenhum modelo encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalDisplayPages > 1 && (
                        <div className="px-4 pb-4 pt-4 shrink-0 bg-white border-t border-border z-20">
                            <PaginationControls
                                currentPage={safePage}
                                totalPages={totalDisplayPages}
                                onPageChange={setDisplayPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Edit / Create Modal */}
            {isEditOrCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0 bg-background-secondary/30">
                            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <FileText size={16} className="text-primary" />
                                {modalState.mode === 'edit' ? 'Editar Modelo de Documento' : 'Novo Modelo de Documento'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-1.5 rounded-lg hover:bg-background-secondary text-foreground-secondary hover:text-foreground transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-5 pb-8 flex flex-col gap-5 custom-scrollbar">
                            {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="text-label-strong block mb-1.5 font-bold uppercase tracking-wider text-[10px]">Título do Modelo *</label>
                                    <input
                                        type="text"
                                        className="medical-input w-full"
                                        value={form.titulo}
                                        onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                                        placeholder="Ex: Receita Especial Controlada"
                                        maxLength={100}
                                    />
                                </div>
                                <div>
                                    <label className="text-label-strong block mb-1.5 font-bold uppercase tracking-wider text-[10px]">Tipo de Documento</label>
                                    <select
                                        className="medical-input w-full"
                                        value={form.tipo}
                                        onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                                    >
                                        <option value="">Selecione um tipo</option>
                                        {TIPO_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-label-strong block mb-1.5 font-bold uppercase tracking-wider text-[10px]">Descrição Opcional</label>
                                <textarea
                                    className="medical-input w-full resize-none"
                                    rows={2}
                                    value={form.descricao}
                                    onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                                    placeholder="Breve resumo para ajudar a identificar este modelo..."
                                    maxLength={200}
                                />
                            </div>

                            <div className="flex-1 flex flex-col min-h-[400px]">
                                <label className="text-label-strong block mb-1.5 font-bold uppercase tracking-wider text-[10px]">Conteúdo do Documento *</label>
                                <div className="flex-1 border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                    <RichTextEditor
                                        value={form.conteudo}
                                        onChange={v => setForm(p => ({ ...p, conteudo: v }))}
                                        placeholder="Comece a digitar o conteúdo do seu modelo aqui..."
                                        className="h-full min-h-[350px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border shrink-0 bg-background-secondary/20">
                            <button
                                onClick={closeModal}
                                className="action-btn-ghost h-10 px-6 font-bold"
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="action-btn-primary h-10 px-8 font-bold shadow-lg shadow-primary/20"
                            >
                                {saving ? 'Processando...' : 'Salvar Modelo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDelete && modalState.mode === 'delete' && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-error-light flex items-center justify-center shrink-0 border border-error/10">
                                <Trash2 size={24} className="text-error" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-foreground">Confirmar Exclusão</h3>
                                <p className="text-xs text-foreground-secondary mt-1 leading-relaxed">
                                    Você está prestes a excluir o modelo <strong className="text-foreground">&ldquo;{modalState.doc.titulo}&rdquo;</strong>. Esta ação é permanente e não poderá ser desfeita.
                                </p>
                            </div>
                        </div>

                        {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

                        <div className="flex items-center gap-3 mt-2">
                            <button
                                onClick={closeModal}
                                className="flex-1 h-11 action-btn-ghost font-bold"
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="flex-1 h-11 inline-flex items-center justify-center gap-2 px-4 py-2 bg-error text-white text-sm font-bold rounded-lg hover:bg-error/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-error/15"
                            >
                                {saving ? 'Excluindo...' : 'Sim, Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
