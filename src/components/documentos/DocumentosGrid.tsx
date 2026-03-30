'use client';

import { useState, useMemo } from 'react';
import { FileText, Pencil, Trash2, Plus, X } from 'lucide-react';
import type { DocumentoModelo } from '@/types/database';
import { PaginatedListView } from '@/components/ui/PaginatedListView';
import { FeedbackBanner } from '@/components/shared/FeedbackBanner';
import { RichTextEditor } from '@/components/shared/RichTextEditor';

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
    { value: 'todos',          label: 'Todos' },
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

const CARD_HEIGHT = 88;
const EMPTY_FORM: FormState = { titulo: '', tipo: '', conteudo: '', descricao: '' };

export function DocumentosGrid({ modelos: initial }: Props) {
    const [modelos, setModelos] = useState<DocumentoModelo[]>(initial);
    const [filterTipo, setFilterTipo] = useState('todos');
    const [modalState, setModalState] = useState<ModalState>({ mode: 'closed' });
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const filtered = useMemo(
        () => filterTipo === 'todos' ? modelos : modelos.filter(m => m.tipo === filterTipo),
        [modelos, filterTipo]
    );

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

    function renderItem(m: DocumentoModelo) {
        const tipo = TIPO_LABELS[m.tipo] ?? { label: m.tipo || 'Documento', color: 'bg-background-secondary text-foreground-secondary' };
        return (
            <div className="medical-card p-4 flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-background-secondary shrink-0">
                    <FileText size={18} className="text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground truncate">{m.titulo}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md shrink-0 ${tipo.color}`}>
                            {tipo.label}
                        </span>
                    </div>
                    {m.descricao && (
                        <p className="text-xs text-foreground-secondary mt-0.5 line-clamp-1">{m.descricao}</p>
                    )}
                    <p className="text-[10px] text-foreground-secondary mt-1">
                        {m.created_at ? new Date(m.created_at).toLocaleDateString('pt-BR') : ''}
                    </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => openEdit(m)}
                        title="Editar"
                        className="p-2 rounded-lg text-foreground-secondary hover:bg-background-secondary hover:text-primary transition-colors"
                    >
                        <Pencil size={15} />
                    </button>
                    <button
                        onClick={() => openDelete(m)}
                        title="Excluir"
                        className="p-2 rounded-lg text-foreground-secondary hover:bg-error-light hover:text-error transition-colors"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>
        );
    }

    const isEditOrCreate = modalState.mode === 'edit' || modalState.mode === 'create';
    const isDelete = modalState.mode === 'delete';

    return (
        <>
            <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">Modelos de Documentos</h1>
                        <p className="text-xs text-foreground-secondary mt-0.5">
                            {modelos.length} modelo{modelos.length !== 1 ? 's' : ''} cadastrado{modelos.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button onClick={openCreate} className="action-btn-primary flex items-center gap-1.5">
                        <Plus size={16} /> Novo Modelo
                    </button>
                </div>

                {/* Feedback */}
                {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

                {/* Filter pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    {FILTER_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setFilterTipo(opt.value)}
                            className={`text-xs py-1.5 px-3 rounded-lg font-medium transition-colors ${
                                filterTipo === opt.value
                                    ? 'bg-primary text-white'
                                    : 'bg-background-secondary text-foreground-secondary hover:text-foreground'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                <PaginatedListView
                    items={filtered}
                    renderItem={renderItem}
                    itemHeightEstimate={CARD_HEIGHT}
                    gap={12}
                    emptyState={
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <FileText size={40} className="text-border-strong mb-3" />
                            <p className="text-sm font-semibold text-foreground">Nenhum modelo encontrado</p>
                            <p className="text-xs text-foreground-secondary mt-1">
                                {filterTipo === 'todos'
                                    ? 'Clique em "Novo Modelo" para criar o primeiro.'
                                    : 'Nenhum modelo para este tipo. Tente outro filtro.'}
                            </p>
                        </div>
                    }
                />
            </div>

            {/* Edit / Create Modal */}
            {isEditOrCreate && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl w-full max-w-3xl modal-container"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                            <h2 className="text-sm font-semibold text-foreground">
                                {modalState.mode === 'edit' ? 'Editar Modelo' : 'Novo Modelo'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-1 rounded hover:bg-background-secondary text-foreground-secondary transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 custom-scrollbar">
                            {/* Feedback inside modal */}
                            {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

                            {/* Row 1: Título + Tipo */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="text-label block mb-1.5">Título *</label>
                                    <input
                                        type="text"
                                        className="medical-input w-full"
                                        value={form.titulo}
                                        onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                                        placeholder="Ex: Receita padrão adulto"
                                        maxLength={100}
                                    />
                                </div>
                                <div>
                                    <label className="text-label block mb-1.5">Tipo</label>
                                    <select
                                        className="medical-input w-full"
                                        value={form.tipo}
                                        onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                                    >
                                        <option value="">Selecione</option>
                                        {TIPO_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 2: Descrição */}
                            <div>
                                <label className="text-label block mb-1.5">Descrição</label>
                                <textarea
                                    className="medical-input w-full resize-none"
                                    rows={2}
                                    value={form.descricao}
                                    onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                                    placeholder="Breve descrição do modelo..."
                                    maxLength={200}
                                />
                            </div>

                            {/* Row 3: Rich Text Editor */}
                            <div className="flex flex-col" style={{ minHeight: '320px' }}>
                                <label className="text-label block mb-1.5">Conteúdo *</label>
                                <div className="flex-1" style={{ minHeight: '280px' }}>
                                    <RichTextEditor
                                        value={form.conteudo}
                                        onChange={v => setForm(p => ({ ...p, conteudo: v }))}
                                        placeholder="Digite o conteúdo do modelo..."
                                        className="h-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border shrink-0">
                            <button
                                onClick={closeModal}
                                className="action-btn-ghost"
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="action-btn-primary"
                            >
                                {saving ? 'Salvando...' : 'Salvar Modelo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDelete && modalState.mode === 'delete' && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-error-light shrink-0">
                                <Trash2 size={18} className="text-error" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Excluir modelo?</p>
                                <p className="text-xs text-foreground-secondary mt-1">
                                    &ldquo;{modalState.doc.titulo}&rdquo; será excluído permanentemente. Esta ação não pode ser desfeita.
                                </p>
                            </div>
                        </div>

                        {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={closeModal}
                                className="action-btn-ghost"
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-error text-white text-sm font-semibold rounded-lg hover:bg-error/90 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {saving ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
