import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { ForbiddenError, formatErrorResponse } from '@/lib/errors';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new ForbiddenError('Não autenticado');

        const { id } = await params;
        const admin = getSupabaseAdmin();

        const { data: atendimento, error: atError } = await admin
            .from('atendimentos')
            .select('id, evolucao, doencas_previas, medicacoes_continuas, alergias, peso, altura, cid, chat_historico, medico_id')
            .eq('id', id)
            .single();

        if (atError || !atendimento) {
            return NextResponse.json({ error: { message: 'Atendimento não encontrado' } }, { status: 404 });
        }

        if (atendimento.medico_id !== user.id) {
            return NextResponse.json({ error: { message: 'Acesso negado' } }, { status: 403 });
        }

        const { data: docs } = await admin
            .from('documentos_emitidos')
            .select('id, tipo, conteudo, assinado, storage_path, criado_em')
            .eq('atendimento_id', id)
            .order('criado_em', { ascending: false });

        return NextResponse.json({
            evolution: atendimento.evolucao,
            anamnesis: {
                doencas_previas: atendimento.doencas_previas,
                medicacoes_continuas: atendimento.medicacoes_continuas,
                alergias: atendimento.alergias,
                peso: atendimento.peso,
                altura: atendimento.altura,
            },
            cid: atendimento.cid,
            documents: docs || [],
            chat_historico: atendimento.chat_historico || null,
        });
    } catch (err) {
        if (err instanceof ForbiddenError) {
            return NextResponse.json(formatErrorResponse(err), { status: err.statusCode });
        }
        console.error('[GET /api/atendimentos/[id]]', err);
        return NextResponse.json({ error: { message: 'Erro ao buscar detalhes' } }, { status: 500 });
    }
}
