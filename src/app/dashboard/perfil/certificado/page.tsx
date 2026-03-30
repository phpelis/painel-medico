import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
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

    return (
        <div className="p-6">
            <CertificadoSection
                cert={cert}
                tipo="e-cpf"
                uploadEndpoint="/api/certificado/upload"
                title="Certificado Digital e-CPF"
                description="Este certificado é usado para assinar receitas, atestados e outros documentos digitalmente."
            />
        </div>
    );
}
