'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { DocumentoModelo } from '@/types/database';
import { FeedbackBanner } from '@/components/shared/FeedbackBanner';
import { useDynamicPagination } from '@/hooks/useDynamicPagination';

import { DocumentFilterBar } from './DocumentFilterBar';
import { DocumentTable } from './DocumentTable';
import { DocumentEditModal } from './DocumentEditModal';
import { DocumentDeleteModal } from './DocumentDeleteModal';
import { ROW_HEIGHT } from './constants';

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

    return (
        <>
            <div className="flex flex-col gap-4">
                <DocumentFilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterTipo={filterTipo}
                    setFilterTipo={setFilterTipo}
                    totalCount={filtered.length}
                    onOpenCreate={openCreate}
                />

                {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

                <DocumentTable
                    items={paginatedItems}
                    onEdit={openEdit}
                    onDelete={openDelete}
                    listRef={listRef}
                    availableHeight={availableHeight}
                    currentPage={safePage}
                    totalPages={totalDisplayPages}
                    onPageChange={setDisplayPage}
                />
            </div>

            <DocumentEditModal
                mode={modalState.mode === 'edit' ? 'edit' : 'create'}
                isOpen={modalState.mode === 'create' || modalState.mode === 'edit'}
                onClose={closeModal}
                onSave={handleSave}
                saving={saving}
                form={form}
                setForm={setForm}
                feedback={feedback}
            />

            <DocumentDeleteModal
                isOpen={modalState.mode === 'delete'}
                onClose={closeModal}
                onConfirm={handleDelete}
                saving={saving}
                docTitle={modalState.mode === 'delete' ? modalState.doc.titulo : ''}
                feedback={feedback}
            />
        </>
    );
}
