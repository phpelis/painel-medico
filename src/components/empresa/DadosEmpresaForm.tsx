'use client';

import { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { EmpresaMedico } from '@/types/database';
import { maskCNPJ, maskCEP, unmask } from '@/utils/masks';
import { UF_OPTIONS } from '@/utils/constants';
import { SectionCard } from '@/components/shared/SectionCard';
import { ReadonlyField } from '@/components/shared/ReadonlyField';
import { FeedbackBanner } from '@/components/shared/FeedbackBanner';

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

    function set(key: keyof FormState, value: string) {
        setForm(prev => ({ ...prev, [key]: value }));
    }

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
            const d = json.data;
            setForm(prev => ({ ...prev, ...d, cnpj: unmask(d.cnpj) }));
            setFeedback({ type: 'success', msg: 'Dados da empresa preenchidos automaticamente. Verifique e salve.' });
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
            setForm(prev => ({
                ...prev,
                endereco_fiscal_logradouro: data.logradouro || prev.endereco_fiscal_logradouro,
                endereco_fiscal_bairro: data.bairro || prev.endereco_fiscal_bairro,
                endereco_fiscal_cidade: data.localidade || prev.endereco_fiscal_cidade,
                endereco_fiscal_uf: data.uf || prev.endereco_fiscal_uf,
                endereco_fiscal_ibge: data.ibge || prev.endereco_fiscal_ibge,
            }));
        } catch {
            // silently ignore CEP lookup errors
        } finally {
            setLookingUpCep(false);
        }
    }

    function handleTrocarEmpresa() {
        setForm(buildForm(null));
        setEditMode(true);
        setFeedback(null);
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
            const json = await res.json();
            if (!res.ok) throw new Error(json.error?.message || 'Erro ao salvar');
            setFeedback({ type: 'success', msg: 'Empresa salva com sucesso!' });
            setEditMode(false);
        } catch (err: any) {
            setFeedback({ type: 'error', msg: err.message });
        } finally {
            setSaving(false);
        }
    }

    const inp = (label: string, key: keyof FormState, mask?: (v: string) => string, raw?: boolean) => (
        <div key={key}>
            <label className="text-label block mb-1.5">{label}</label>
            {editMode
                ? <input className="medical-input" value={mask ? mask(form[key]) : form[key]} onChange={e => set(key, raw ? unmask(e.target.value) : e.target.value)} />
                : <ReadonlyField value={mask ? mask(form[key]) : form[key]} />
            }
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Empresa</h2>
                <div className="flex gap-2">
                    {!isNew && !editMode && (
                        <>
                            <button onClick={handleTrocarEmpresa} className="action-btn-ghost text-sm">
                                <RefreshCw size={14} /> Trocar empresa
                            </button>
                            <button onClick={() => setEditMode(true)} className="action-btn-secondary text-sm">Editar</button>
                        </>
                    )}
                    {editMode && (
                        <>
                            {!isNew && <button onClick={() => { setEditMode(false); setFeedback(null); setForm(buildForm(empresa)); }} className="action-btn-ghost text-sm">Cancelar</button>}
                            <button onClick={handleSave} disabled={saving} className="action-btn-primary text-sm">
                                {saving ? 'Salvando...' : isNew ? 'Cadastrar empresa' : 'Salvar'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

            <SectionCard title="Identificação">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-label block mb-1.5">CNPJ</label>
                        {editMode ? (
                            <div className="flex gap-2">
                                <input
                                    className="medical-input"
                                    value={maskCNPJ(form.cnpj)}
                                    onChange={e => set('cnpj', unmask(e.target.value))}
                                    placeholder="00.000.000/0000-00"
                                />
                                <button
                                    type="button"
                                    onClick={buscarCnpj}
                                    disabled={searching}
                                    className="action-btn-secondary shrink-0 px-3"
                                    title="Buscar dados do CNPJ"
                                >
                                    {searching ? '...' : <Search size={15} />}
                                </button>
                            </div>
                        ) : <ReadonlyField value={maskCNPJ(form.cnpj)} />}
                    </div>
                    {inp('Razão Social', 'razao_social')}
                    {inp('Nome Fantasia', 'nome_fantasia')}
                    {inp('Inscrição Municipal', 'inscricao_municipal')}
                    {inp('Inscrição Estadual', 'inscricao_estadual')}
                </div>
            </SectionCard>

            <SectionCard title="Endereço Fiscal">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-label block mb-1.5">CEP {lookingUpCep && <span className="text-foreground-secondary font-normal">(buscando...)</span>}</label>
                        {editMode ? (
                            <input
                                className="medical-input"
                                value={maskCEP(form.endereco_fiscal_cep)}
                                onChange={e => {
                                    const raw = unmask(e.target.value);
                                    set('endereco_fiscal_cep', raw);
                                    if (raw.length === 8) lookupCep(raw);
                                }}
                                onBlur={() => lookupCep(form.endereco_fiscal_cep)}
                                placeholder="00000-000"
                            />
                        ) : <ReadonlyField value={maskCEP(form.endereco_fiscal_cep)} />}
                    </div>
                    {inp('Logradouro', 'endereco_fiscal_logradouro')}
                    {inp('Número', 'endereco_fiscal_numero')}
                    {inp('Complemento', 'endereco_fiscal_complemento')}
                    {inp('Bairro', 'endereco_fiscal_bairro')}
                    {inp('Cidade', 'endereco_fiscal_cidade')}
                    <div>
                        <label className="text-label block mb-1.5">UF</label>
                        {editMode ? (
                            <select className="medical-input" value={form.endereco_fiscal_uf} onChange={e => set('endereco_fiscal_uf', e.target.value)}>
                                <option value="">Selecione</option>
                                {UF_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        ) : <ReadonlyField value={form.endereco_fiscal_uf} />}
                    </div>
                    {inp('Código IBGE', 'endereco_fiscal_ibge')}
                </div>
            </SectionCard>
        </div>
    );
}
