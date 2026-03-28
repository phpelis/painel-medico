import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { DadosMedicoForm } from '@/components/perfil/DadosMedicoForm';
import { decryptPixKey } from '@/lib/encryption';
import type { Medico } from '@/types/database';

export default async function PerfilDadosPage() {
    const user = await getAuthenticatedUser();
    if (!user) redirect('/login');

    const admin = getSupabaseAdmin();
    const { data: medico } = await admin
        .from('medicos')
        .select('*')
        .eq('id', user.id)
        .single();

    const medicoData: Medico = medico || {} as Medico;
    if (medicoData.woovi_pix_key) {
        medicoData.woovi_pix_key = decryptPixKey(medicoData.woovi_pix_key);
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar title="Dados do Médico" subtitle="Informações pessoais e profissionais" />
            <div className="flex-1 overflow-y-auto p-6">
                <DadosMedicoForm medico={medicoData} />
            </div>
        </div>
    );
}
