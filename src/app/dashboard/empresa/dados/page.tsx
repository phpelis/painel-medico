import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { DadosEmpresaForm } from '@/components/empresa/DadosEmpresaForm';

export default async function EmpresaDadosPage() {
    const user = await getAuthenticatedUser();
    if (!user) redirect('/login');

    const admin = getSupabaseAdmin();
    const { data: empresa } = await admin
        .from('empresa_medico')
        .select('*')
        .eq('medico_id', user.id)
        .maybeSingle();

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar title="Dados da Empresa" subtitle="CNPJ, razão social e endereço fiscal" />
            <div className="flex-1 overflow-y-auto p-6">
                <DadosEmpresaForm empresa={empresa} />
            </div>
        </div>
    );
}
