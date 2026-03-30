import { Trash2 } from 'lucide-react';
import { FeedbackBanner } from '@/components/shared/FeedbackBanner';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    saving: boolean;
    docTitle: string;
    feedback: { type: 'success' | 'error'; msg: string } | null;
}

export function DocumentDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    saving,
    docTitle,
    feedback
}: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-error-light flex items-center justify-center shrink-0 border border-error/10">
                        <Trash2 size={24} className="text-error" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-foreground">Confirmar Exclusão</h3>
                        <p className="text-xs text-foreground-secondary mt-1 leading-relaxed">
                            Você está prestes a excluir o modelo <strong className="text-foreground">&ldquo;{docTitle}&rdquo;</strong>. Esta ação é permanente e não poderá ser desfeita.
                        </p>
                    </div>
                </div>

                {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

                <div className="flex items-center gap-3 mt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 h-11 action-btn-ghost font-bold"
                        disabled={saving}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={saving}
                        className="flex-1 h-11 inline-flex items-center justify-center gap-2 px-4 py-2 bg-error text-white text-sm font-bold rounded-lg hover:bg-error/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-error/15"
                    >
                        {saving ? 'Excluindo...' : 'Sim, Excluir'}
                    </button>
                </div>
            </div>
        </div>
    );
}
