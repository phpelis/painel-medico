'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { EmpresaMedico } from '@/types/database';
import { unmask } from '@/utils/masks';
import { FeedbackBanner } from '@/components/shared/FeedbackBanner';

import { CompanyIdentificationSection } from './CompanyIdentificationSection';
import { FiscalAddressSection } from './FiscalAddressSection';

interface Props { empresa: EmpresaMedico | null }

type FormState = {
    cnpj: string; razao_social: string; nome_fantasia: string;
    inscricao_municipal: string; inscricao_estadual: string;
    endereco_fiscal_cep: string; endereco_fiscal_logradouro: string;
    endereco_fiscal_numero: string; endereco_fiscal_complemento: string;
    endereco_fiscal_bairro: string; endereco_fiscal_cidade: string;
    endereco_fiscal_uf: string; endereco_fiscal_ibge: string;
};

function buildForm(e: EmpresaMedico | null): FormState {
    return {
        cnpj: e?.cnpj || '',
        razao_social: e?.razao_social || '',
        nome_fantasia: e?.nome_fantasia || '',
        inscricao_municipal: e?.inscricao_municipal || '',
        inscricao_estadual: e?.inscricao_estadual || '',
        endereco_fiscal_cep: e?.endereco_fiscal_cep || '',
        endereco_fiscal_logradouro: e?.endereco_fiscal_logradouro || '',
        endereco_fiscal_numero: e?.endereco_fiscal_numero || '',
        endereco_fiscal_complemento: e?.endereco_fiscal_complemento || '',
        endereco_fiscal_bairro: e?.endereco_fiscal_bairro || '',
        endereco_fiscal_cidade: e?.endereco_fiscal_cidade || '',
        endereco_fiscal_uf: e?.endereco_fiscal_uf || '',
        endereco_fiscal_ibge: e?.endereco_fiscal_ibge || '',
    };
}

export function DadosEmpresaForm({ empresa }: Props) {
    const [form, setForm] = useState<FormState>(buildForm(empresa));
    const [editMode, setEditMode] = useState(!empresa);
    const [saving, setSaving] = useState(false);
    const [searching, setSearching] = useState(false);
    const [lookingUpCep, setLookingUpCep] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const isNew = !empresa;

    const set = (key: keyof FormState, value: string) => setForm(p => ({ ...p, [key]: value }));

    async function buscarCnpj() {
        const cnpj = unmask(form.cnpj);
        if (cnpj.length !== 14) {
            setFeedback({ type: 'error', msg: 'Digite um CNPJ completo (14 dígitos) para buscar.' });
            return;
        }
        setSearching(true);
        setFeedback(null);
        try {
            const res = await fetch(`/api/empresa/buscar-cnpj?cnpj=${cnpj}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error?.message || 'CNPJ não encontrado');
            setForm(prev => ({ ...prev, ...json.data, cnpj: unmask(json.data.cnpj) }));
            setFeedback({ type: 'success', msg: 'Dados preenchidos. Verifique e salve.' });
        } catch (err: any) {
            setFeedback({ type: 'error', msg: err.message });
        } finally {
            setSearching(false);
        }
    }

    async function lookupCep(rawCep: string) {
        const digits = rawCep.replace(/\D/g, '');
        if (digits.length !== 8) return;
        setLookingUpCep(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
            const data = await res.json();
            if (data.erro) return;
            setForm(p => ({
                ...p,
                endereco_fiscal_logradouro: data.logradouro || p.endereco_fiscal_logradouro,
                endereco_fiscal_bairro: data.bairro || p.endereco_fiscal_bairro,
                endereco_fiscal_cidade: data.localidade || p.endereco_fiscal_cidade,
                endereco_fiscal_uf: data.uf || p.endereco_fiscal_uf,
                endereco_fiscal_ibge: data.ibge || p.endereco_fiscal_ibge,
            }));
        } catch {} finally { setLookingUpCep(false); }
    }

    async function handleSave() {
        setSaving(true);
        setFeedback(null);
        try {
            const payload = { ...form, cnpj: unmask(form.cnpj) };
            const method = isNew ? 'POST' : 'PATCH';
            const res = await fetch('/api/empresa', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error?.message || 'Erro ao salvar');
            }
            setFeedback({ type: 'success', msg: 'Empresa salva com sucesso!' });
            setEditMode(false);
        } catch (err: any) {
            setFeedback({ type: 'error', msg: err.message });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Configurações da Empresa</h2>
                <div className="flex gap-2">
                    {!isNew && !editMode && (
                        <>
                            <button onClick={() => { setForm(buildForm(null)); setEditMode(true); setFeedback(null); }} className="action-btn-ghost text-sm">
                                <RefreshCw size={14} /> Trocar empresa
                            </button>
                            <button onClick={() => setEditMode(true)} className="action-btn-secondary text-sm px-4">Editar</button>
                        </>
                    )}
                    {editMode && (
                        <>
                            {!isNew && <button onClick={() => { setEditMode(false); setFeedback(null); setForm(buildForm(empresa)); }} className="action-btn-ghost text-sm px-4">Cancelar</button>}
                            <button onClick={handleSave} disabled={saving} className="action-btn-primary text-sm px-6">
                                {saving ? 'Salvando...' : isNew ? 'Cadastrar empresa' : 'Salvar dados'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

            <CompanyIdentificationSection
                form={form}
                editMode={editMode}
                searching={searching}
                onBuscarCnpj={buscarCnpj}
                onChange={set}
            />

            <FiscalAddressSection
                form={form}
                editMode={editMode}
                lookingUpCep={lookingUpCep}
                onLookupCep={lookupCep}
                onChange={set}
            />
        </div>
    );
}
