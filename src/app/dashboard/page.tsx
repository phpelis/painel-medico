import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

export default async function DashboardPage() {
    const user = await getAuthenticatedUser();
    if (!user) redirect('/login');

    const admin = getSupabaseAdmin();

    // Fetch medico + recent atendimentos in parallel
    const [medicoRes, atendimentosRes, totalMesRes] = await Promise.all([
        admin.from('medicos').select('nome, crm, uf_crm, media_avaliacao').eq('id', user.id).maybeSingle(),
        admin
            .from('atendimentos')
            .select('id, status, inicio, fim, valor_consulta, pagamento_status, paciente:pacientes(nome)', { count: 'exact' })
            .eq('medico_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
        admin
            .from('atendimentos')
            .select('valor_consulta, pagamento_status')
            .eq('medico_id', user.id)
            .eq('pagamento_status', 'pago')
            .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ]);

    const medico = medicoRes.data;
    const recentAtendimentos = (atendimentosRes.data as any) || [];
    const totalAtendimentos = atendimentosRes.count || 0;
    const receitaMes = (totalMesRes.data || []).reduce((sum, a) => sum + (a.valor_consulta || 0), 0);

    // Check for expiring certificate
    const certRes = await admin
        .from('certificados_digitais')
        .select('validade_ate')
        .eq('medico_id', user.id)
        .eq('tipo', 'e-cpf')
        .eq('status', 'ativo')
        .maybeSingle();

    const certVencimento = certRes.data?.validade_ate || null;

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar
                title={`Olá, Dr. ${medico?.nome?.split(' ')[0] || 'Médico'}`}
                subtitle={`CRM ${medico?.crm || '---'}/${medico?.uf_crm || '---'}`}
            />
            <div className="flex-1 overflow-y-auto p-6">
                <DashboardOverview
                    totalAtendimentos={totalAtendimentos}
                    receitaMes={receitaMes}
                    certVencimento={certVencimento}
                    recentAtendimentos={recentAtendimentos}
                    mediaAvaliacao={medico?.media_avaliacao}
                />
            </div>
        </div>
    );
}
