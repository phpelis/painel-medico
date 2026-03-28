import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { CertificadoSection } from '@/components/certificado/CertificadoSection';

export default async function PerfilCertificadoPage() {
    const user = await getAuthenticatedUser();
    if (!user) redirect('/login');

    const admin = getSupabaseAdmin();
    const { data: cert } = await admin
        .from('certificados_digitais')
        .select('id, status, validade_ate, dados_certificado, tipo, created_at')
        .eq('medico_id', user.id)
        .eq('tipo', 'e-cpf')
        .eq('status', 'ativo')
        .maybeSingle();

    // Fetch doctor CPF for validation
    const { data: medico } = await admin
        .from('medicos')
        .select('cpf, nome')
        .eq('id', user.id)
        .maybeSingle();

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar title="Certificado Digital (e-CPF)" subtitle="Usado para assinar documentos médicos" />
            <div className="flex-1 overflow-y-auto p-6">
                <CertificadoSection
                    cert={cert}
                    tipo="e-cpf"
                    uploadEndpoint="/api/certificado/upload"
                    title="Certificado Digital e-CPF"
                    description="Este certificado é usado para assinar receitas, atestados e outros documentos digitalmente."
                />
            </div>
        </div>
    );
}
