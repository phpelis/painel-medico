import { FileText, X } from 'lucide-react';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { FeedbackBanner } from '@/components/shared/FeedbackBanner';
import { TIPO_OPTIONS } from './constants';

interface FormState {
    titulo: string;
    tipo: string;
    conteudo: string;
    descricao: string;
}

interface Props {
    mode: 'create' | 'edit';
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    saving: boolean;
    form: FormState;
    setForm: (update: (prev: FormState) => FormState) => void;
    feedback: { type: 'success' | 'error'; msg: string } | null;
}

export function DocumentEditModal({
    mode,
    isOpen,
    onClose,
    onSave,
    saving,
    form,
    setForm,
    feedback
}: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0 bg-background-secondary/30">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <FileText size={16} className="text-primary" />
                        {mode === 'edit' ? 'Editar Modelo de Documento' : 'Novo Modelo de Documento'}
                    </h2>
                    <button
                        onClick={onClose}
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
                        <RichTextEditor
                            value={form.conteudo}
                            onChange={v => setForm(p => ({ ...p, conteudo: v }))}
                            placeholder="Comece a digitar o conteúdo do seu modelo aqui..."
                            className="flex-1 min-h-[400px]"
                        />
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border shrink-0 bg-background-secondary/20">
                    <button
                        onClick={onClose}
                        className="action-btn-ghost h-10 px-6 font-bold"
                        disabled={saving}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="action-btn-primary h-10 px-8 font-bold shadow-lg shadow-primary/20"
                    >
                        {saving ? 'Processando...' : 'Salvar Modelo'}
                    </button>
                </div>
            </div>
        </div>
    );
}
