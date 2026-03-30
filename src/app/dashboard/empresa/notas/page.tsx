import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ConfigNotasForm } from '@/components/empresa/ConfigNotasForm';
import { CertificadoSection } from '@/components/certificado/CertificadoSection';

export default async function EmpresaNotasPage() {
    const user = await getAuthenticatedUser();
    if (!user) redirect('/login');

    const admin = getSupabaseAdmin();
    const [empresaRes, certRes] = await Promise.all([
        admin.from('empresa_medico').select('id, regime_tributario, inscricao_municipal, inscricao_estadual, nuvem_fiscal_sincronizado').eq('medico_id', user.id).maybeSingle(),
        admin.from('certificados_digitais').select('id, status, validade_ate, dados_certificado, tipo').eq('medico_id', user.id).eq('tipo', 'e-cnpj').eq('status', 'ativo').maybeSingle(),
    ]);

    if (!empresaRes.data) {
        redirect('/dashboard/empresa/dados');
    }

    return (
        <div className="p-6">
            <div className="max-w-xl space-y-6">
                <ConfigNotasForm empresa={empresaRes.data} />
                <CertificadoSection
                    cert={certRes.data}
                    tipo="e-cnpj"
                    uploadEndpoint="/api/empresa/certificado/upload"
                    title="Certificado Digital e-CNPJ"
                    description="Usado para assinar Notas Fiscais de Serviço Eletrônicas (NFS-e) via Nuvem Fiscal."
                />
            </div>
        </div>
    );
}
