import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { EnderecoForm } from '@/components/perfil/EnderecoForm';
import type { Medico } from '@/types/database';

export default async function PerfilEnderecoPage() {
    const user = await getAuthenticatedUser();
    if (!user) redirect('/login');

    const admin = getSupabaseAdmin();
    const { data: medico } = await admin
        .from('medicos')
        .select(`
            endereco_residencial_cep, endereco_residencial_logradouro,
            endereco_residencial_numero, endereco_residencial_complemento,
            endereco_residencial_bairro, endereco_residencial_cidade,
            endereco_residencial_uf,
            endereco_comercial_cep, endereco_comercial_logradouro,
            endereco_comercial_numero, endereco_comercial_complemento,
            endereco_comercial_bairro, endereco_comercial_cidade,
            endereco_comercial_uf
        `)
        .eq('id', user.id)
        .single();

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar title="Endereço Residencial" subtitle="Endereço residencial e comercial" />
            <div className="flex-1 overflow-y-auto p-6">
                <EnderecoForm medico={(medico || {}) as Medico} />
            </div>
        </div>
    );
}
