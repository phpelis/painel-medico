'use client';

import { useState } from 'react';
import { Medico } from '@/types/database';
import { maskCPF, maskPhone, maskCRM_RQE } from '@/utils/masks';
import { UF_OPTIONS } from '@/utils/constants';
import { SectionCard } from '@/components/shared/SectionCard';
import { ReadonlyField } from '@/components/shared/ReadonlyField';
import { FeedbackBanner } from '@/components/shared/FeedbackBanner';

interface Props {
    medico: Medico;
}

const ESPECIALIDADES = [
    'Clínica Geral', 'Cardiologia', 'Dermatologia', 'Endocrinologia',
    'Gastroenterologia', 'Ginecologia', 'Neurologia', 'Oftalmologia',
    'Ortopedia', 'Pediatria', 'Psiquiatria', 'Urologia', 'Outras',
];

const PIX_TIPO_OPTIONS = ['CPF', 'CNPJ', 'E-mail', 'Telefone', 'Chave Aleatória'] as const;

export function DadosMedicoForm({ medico }: Props) {
    const [form, setForm] = useState({
        nome: medico.nome || '',
        celular: medico.celular || '',
        telefone: medico.telefone || '',
        crm: medico.crm || '',
        uf_crm: medico.uf_crm || '',
        especialidade_primaria: medico.especialidade_primaria || '',
        especialidade_secundaria: medico.especialidade_secundaria || '',
        rqe_primaria: medico.rqe_primaria || '',
        rqe_secundaria: medico.rqe_secundaria || '',
        woovi_pix_key: medico.woovi_pix_key || '',
        woovi_pix_key_tipo: medico.woovi_pix_key_tipo || '',
    });

    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    function handleChange(field: string, value: string) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    async function handleSave() {
        setSaving(true);
        setFeedback(null);
        try {
            const res = await fetch('/api/medico/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error('Erro ao salvar');
            setFeedback({ type: 'success', msg: 'Dados salvos com sucesso!' });
            setEditMode(false);
        } catch {
            setFeedback({ type: 'error', msg: 'Erro ao salvar. Tente novamente.' });
        } finally {
            setSaving(false);
        }
    }

    const field = (label: string, id: string, value: string, onChange?: (v: string) => void, masked?: (v: string) => string) => (
        <div key={id}>
            <label htmlFor={id} className="text-label block mb-1.5">{label}</label>
            {editMode && onChange ? (
                <input
                    id={id}
                    className="medical-input"
                    value={masked ? masked(value) : value}
                    onChange={e => onChange(masked ? e.target.value.replace(/\D/g, '') : e.target.value)}
                />
            ) : <ReadonlyField value={masked ? masked(value) : value} />}
        </div>
    );

    const selectField = (label: string, id: string, value: string, options: readonly string[], onChange: (v: string) => void) => (
        <div key={id}>
            <label htmlFor={id} className="text-label block mb-1.5">{label}</label>
            {editMode ? (
                <select
                    id={id}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="medical-input"
                >
                    <option value="">Selecione</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : <ReadonlyField value={value} />}
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Ações */}
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Informações do Médico</h2>
                {!editMode ? (
                    <button onClick={() => setEditMode(true)} className="action-btn-secondary text-sm">
                        Editar
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => { setEditMode(false); setFeedback(null); }} className="action-btn-ghost text-sm">
                            Cancelar
                        </button>
                        <button onClick={handleSave} disabled={saving} className="action-btn-primary text-sm">
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                )}
            </div>

            {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

            <SectionCard title="Dados Pessoais">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {field('Nome completo', 'nome', form.nome, v => handleChange('nome', v))}
                    <div>
                        <label className="text-label block mb-1.5">CPF</label>
                        {<ReadonlyField value={maskCPF(medico.cpf || '')} />}
                    </div>
                    <div>
                        <label className="text-label block mb-1.5">E-mail</label>
                        {<ReadonlyField value={medico.email || ''} />}
                    </div>
                    {field('Celular', 'celular', form.celular, v => handleChange('celular', v), maskPhone)}
                    {field('Telefone', 'telefone', form.telefone, v => handleChange('telefone', v), maskPhone)}
                </div>
            </SectionCard>

            <SectionCard title="Dados Profissionais">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {field('CRM', 'crm', form.crm, v => handleChange('crm', v), maskCRM_RQE)}
                    {selectField('UF do CRM', 'uf_crm', form.uf_crm, UF_OPTIONS, v => handleChange('uf_crm', v))}
                    {selectField('Especialidade primária', 'esp1', form.especialidade_primaria, ESPECIALIDADES, v => handleChange('especialidade_primaria', v))}
                    {field('RQE primária', 'rqe1', form.rqe_primaria, v => handleChange('rqe_primaria', v), maskCRM_RQE)}
                    {selectField('Especialidade secundária', 'esp2', form.especialidade_secundaria, ESPECIALIDADES, v => handleChange('especialidade_secundaria', v))}
                    {field('RQE secundária', 'rqe2', form.rqe_secundaria, v => handleChange('rqe_secundaria', v), maskCRM_RQE)}
                </div>
            </SectionCard>

            <SectionCard title="Dados Financeiros">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectField('Tipo da chave Pix', 'pix_tipo', form.woovi_pix_key_tipo, PIX_TIPO_OPTIONS, v => handleChange('woovi_pix_key_tipo', v))}
                    {field('Chave Pix (Woovi)', 'pix', form.woovi_pix_key, v => handleChange('woovi_pix_key', v))}
                </div>
            </SectionCard>
        </div>
    );
}
