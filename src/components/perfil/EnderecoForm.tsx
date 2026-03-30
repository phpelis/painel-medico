'use client';

import { useState } from 'react';
import { Medico } from '@/types/database';
import { maskCEP, unmask } from '@/utils/masks';
import { UF_OPTIONS } from '@/utils/constants';
import { SectionCard } from '@/components/shared/SectionCard';
import { ReadonlyField } from '@/components/shared/ReadonlyField';
import { FeedbackBanner } from '@/components/shared/FeedbackBanner';

interface Props { medico: Medico }

type EnderecoFields = {
    cep: string; logradouro: string; numero: string;
    complemento: string; bairro: string; cidade: string; uf: string;
};

function buildEnd(m: Medico, prefix: 'residencial' | 'comercial'): EnderecoFields {
    const p = `endereco_${prefix}_` as const;
    return {
        cep: (m as any)[`${p}cep`] || '',
        logradouro: (m as any)[`${p}logradouro`] || '',
        numero: (m as any)[`${p}numero`] || '',
        complemento: (m as any)[`${p}complemento`] || '',
        bairro: (m as any)[`${p}bairro`] || '',
        cidade: (m as any)[`${p}cidade`] || '',
        uf: (m as any)[`${p}uf`] || '',
    };
}

function mapToPayload(fields: EnderecoFields, prefix: 'residencial' | 'comercial') {
    const p = `endereco_${prefix}_`;
    return {
        [`${p}cep`]: unmask(fields.cep),
        [`${p}logradouro`]: fields.logradouro,
        [`${p}numero`]: fields.numero,
        [`${p}complemento`]: fields.complemento,
        [`${p}bairro`]: fields.bairro,
        [`${p}cidade`]: fields.cidade,
        [`${p}uf`]: fields.uf,
    };
}

function AddressFields({
    prefix, value, onChange, editMode, loading,
}: {
    prefix: 'residencial' | 'comercial';
    value: EnderecoFields;
    onChange: (fields: EnderecoFields) => void;
    editMode: boolean;
    loading: boolean;
}) {
    async function lookupCep(cep: string) {
        const clean = unmask(cep);
        if (clean.length !== 8) return;
        try {
            const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
            const data = await res.json();
            if (!data.erro) {
                onChange({
                    ...value,
                    cep: clean,
                    logradouro: data.logradouro || '',
                    bairro: data.bairro || '',
                    cidade: data.localidade || '',
                    uf: data.uf || '',
                });
            }
        } catch { /* ignore */ }
    }

    const inp = (label: string, key: keyof EnderecoFields, mask?: (v: string) => string) => (
        <div key={key}>
            <label className="text-label block mb-1.5">{label}</label>
            {editMode ? (
                <input
                    className="medical-input"
                    value={mask ? mask(value[key]) : value[key]}
                    onChange={e => onChange({ ...value, [key]: key === 'cep' ? unmask(e.target.value) : e.target.value })}
                    onBlur={key === 'cep' ? e => lookupCep(e.target.value) : undefined}
                    disabled={loading}
                />
            ) : <ReadonlyField value={mask ? mask(value[key]) : value[key]} />}
        </div>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inp('CEP', 'cep', maskCEP)}
            {inp('Logradouro', 'logradouro')}
            {inp('Número', 'numero')}
            {inp('Complemento', 'complemento')}
            {inp('Bairro', 'bairro')}
            {inp('Cidade', 'cidade')}
            <div>
                <label className="text-label block mb-1.5">UF</label>
                {editMode ? (
                    <select className="medical-input" value={value.uf} onChange={e => onChange({ ...value, uf: e.target.value })}>
                        <option value="">Selecione</option>
                        {UF_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                ) : <ReadonlyField value={value.uf} />}
            </div>
        </div>
    );
}

export function EnderecoForm({ medico }: Props) {
    const [residencial, setResidencial] = useState(buildEnd(medico, 'residencial'));
    const [comercial, setComercial] = useState(buildEnd(medico, 'comercial'));
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    async function handleSave() {
        setSaving(true);
        setFeedback(null);
        try {
            const res = await fetch('/api/medico/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...mapToPayload(residencial, 'residencial'),
                    ...mapToPayload(comercial, 'comercial'),
                }),
            });
            if (!res.ok) throw new Error();
            setFeedback({ type: 'success', msg: 'Endereços salvos com sucesso!' });
            setEditMode(false);
        } catch {
            setFeedback({ type: 'error', msg: 'Erro ao salvar endereços.' });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Endereços</h2>
                {!editMode ? (
                    <button onClick={() => setEditMode(true)} className="action-btn-secondary text-sm">Editar</button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => { setEditMode(false); setFeedback(null); }} className="action-btn-ghost text-sm">Cancelar</button>
                        <button onClick={handleSave} disabled={saving} className="action-btn-primary text-sm">
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                )}
            </div>

            {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

            <SectionCard title="Endereço Residencial">
                <AddressFields prefix="residencial" value={residencial} onChange={setResidencial} editMode={editMode} loading={saving} />
            </SectionCard>

            <SectionCard title="Endereço Comercial">
                <AddressFields prefix="comercial" value={comercial} onChange={setComercial} editMode={editMode} loading={saving} />
            </SectionCard>
        </div>
    );
}
