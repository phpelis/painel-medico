import { SectionCard } from '@/components/shared/SectionCard';
import { ReadonlyField } from '@/components/shared/ReadonlyField';
import { maskCEP, unmask } from '@/utils/masks';
import { UF_OPTIONS } from '@/utils/constants';

interface FormState {
    endereco_fiscal_cep: string; 
    endereco_fiscal_logradouro: string;
    endereco_fiscal_numero: string; 
    endereco_fiscal_complemento: string;
    endereco_fiscal_bairro: string; 
    endereco_fiscal_cidade: string;
    endereco_fiscal_uf: string; 
    endereco_fiscal_ibge: string;
}

interface Props {
    form: FormState;
    editMode: boolean;
    lookingUpCep: boolean;
    onLookupCep: (cep: string) => void;
    onChange: (key: keyof FormState, value: string) => void;
}

export function FiscalAddressSection({
    form,
    editMode,
    lookingUpCep,
    onLookupCep,
    onChange
}: Props) {
    const inp = (label: string, key: keyof FormState) => (
        <div key={key}>
            <label className="text-label block mb-1.5">{label}</label>
            {editMode
                ? <input 
                    className="medical-input" 
                    value={form[key]} 
                    onChange={e => onChange(key, e.target.value)} 
                  />
                : <ReadonlyField value={form[key]} />
            }
        </div>
    );

    return (
        <SectionCard title="Endereço Fiscal">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-label block mb-1.5">
                        CEP {lookingUpCep && <span className="text-foreground-secondary font-normal">(buscando...)</span>}
                    </label>
                    {editMode ? (
                        <input
                            className="medical-input"
                            value={maskCEP(form.endereco_fiscal_cep)}
                            onChange={e => {
                                const raw = unmask(e.target.value);
                                onChange('endereco_fiscal_cep', raw);
                                if (raw.length === 8) onLookupCep(raw);
                            }}
                            onBlur={() => onLookupCep(form.endereco_fiscal_cep)}
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
                        <select 
                            className="medical-input" 
                            value={form.endereco_fiscal_uf} 
                            onChange={e => onChange('endereco_fiscal_uf', e.target.value)}
                        >
                            <option value="">Selecione</option>
                            {UF_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    ) : <ReadonlyField value={form.endereco_fiscal_uf} />}
                </div>
                {inp('Código IBGE', 'endereco_fiscal_ibge')}
            </div>
        </SectionCard>
    );
}
