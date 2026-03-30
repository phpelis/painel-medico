import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
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
        <div className="p-6">
            <DadosEmpresaForm empresa={empresa} />
        </div>
    );
}
