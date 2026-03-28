'use client';

import { useState } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { ReadonlyField } from '@/components/shared/ReadonlyField';
import { FeedbackBanner } from '@/components/shared/FeedbackBanner';
import type { EmpresaMedico } from '@/types/database';

type EmpresaConfig = Pick<EmpresaMedico, 'id' | 'regime_tributario' | 'inscricao_municipal' | 'inscricao_estadual' | 'nuvem_fiscal_sincronizado'>;

interface Props { empresa: EmpresaConfig }

const REGIMES = [
    { value: 1, label: 'Simples Nacional' },
    { value: 2, label: 'Simples Nacional — Excesso de sublimite' },
    { value: 3, label: 'Regime Normal (Lucro Presumido/Real)' },
    { value: 4, label: 'MEI — Microempreendedor Individual' },
];

export function ConfigNotasForm({ empresa }: Props) {
    const [form, setForm] = useState({
        regime_tributario: empresa.regime_tributario || 1,
        inscricao_municipal: empresa.inscricao_municipal || '',
        inscricao_estadual: empresa.inscricao_estadual || '',
    });
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    async function handleSave() {
        setSaving(true);
        setFeedback(null);
        try {
            const res = await fetch('/api/empresa', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error('Erro ao salvar');
            setFeedback({ type: 'success', msg: 'Configurações salvas!' });
            setEditMode(false);
        } catch {
            setFeedback({ type: 'error', msg: 'Erro ao salvar configurações.' });
        } finally {
            setSaving(false);
        }
    }

    return (
        <SectionCard title="Configuração Fiscal">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs">
                    {empresa.nuvem_fiscal_sincronizado
                        ? <><CheckCircle size={14} className="text-success" /><span className="text-success font-medium">Sincronizado com Nuvem Fiscal</span></>
                        : <><Clock size={14} className="text-warning" /><span className="text-warning font-medium">Pendente de sincronização</span></>
                    }
                </div>
                {!editMode
                    ? <button onClick={() => setEditMode(true)} className="action-btn-secondary text-sm">Editar</button>
                    : <div className="flex gap-2">
                        <button onClick={() => { setEditMode(false); setFeedback(null); }} className="action-btn-ghost text-sm">Cancelar</button>
                        <button onClick={handleSave} disabled={saving} className="action-btn-primary text-sm">
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                }
            </div>

            {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

            <div className="space-y-4">
                <div>
                    <label className="text-label block mb-1.5">Regime Tributário</label>
                    {editMode ? (
                        <select className="medical-input" value={form.regime_tributario} onChange={e => setForm(p => ({ ...p, regime_tributario: Number(e.target.value) as 1 | 2 | 3 | 4 }))}>
                            {REGIMES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    ) : <ReadonlyField value={REGIMES.find(r => r.value === form.regime_tributario)?.label || '—'} />}
                </div>
                <div>
                    <label className="text-label block mb-1.5">Inscrição Municipal</label>
                    {editMode
                        ? <input className="medical-input" value={form.inscricao_municipal} onChange={e => setForm(p => ({ ...p, inscricao_municipal: e.target.value }))} />
                        : <ReadonlyField value={form.inscricao_municipal} />
                    }
                </div>
                <div>
                    <label className="text-label block mb-1.5">Inscrição Estadual</label>
                    {editMode
                        ? <input className="medical-input" value={form.inscricao_estadual} onChange={e => setForm(p => ({ ...p, inscricao_estadual: e.target.value }))} />
                        : <ReadonlyField value={form.inscricao_estadual} />
                    }
                </div>
            </div>
        </SectionCard>
    );
}
