import { Search } from 'lucide-react';
import { SectionCard } from '@/components/shared/SectionCard';
import { ReadonlyField } from '@/components/shared/ReadonlyField';
import { maskCNPJ, unmask } from '@/utils/masks';

interface FormState {
    cnpj: string; 
    razao_social: string; 
    nome_fantasia: string;
    inscricao_municipal: string; 
    inscricao_estadual: string;
}

interface Props {
    form: FormState;
    editMode: boolean;
    searching: boolean;
    onBuscarCnpj: () => void;
    onChange: (key: keyof FormState, value: string) => void;
}

export function CompanyIdentificationSection({
    form,
    editMode,
    searching,
    onBuscarCnpj,
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
        <SectionCard title="Identificação">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-label block mb-1.5">CNPJ</label>
                    {editMode ? (
                        <div className="flex gap-2">
                            <input
                                className="medical-input"
                                value={maskCNPJ(form.cnpj)}
                                onChange={e => onChange('cnpj', unmask(e.target.value))}
                                placeholder="00.000.000/0000-00"
                            />
                            <button
                                type="button"
                                onClick={onBuscarCnpj}
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
    );
}
