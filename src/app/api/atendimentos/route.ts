import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { ForbiddenError, formatErrorResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new ForbiddenError('Não autenticado');

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const dataInicio = searchParams.get('data_inicio');
        const dataFim = searchParams.get('data_fim');
        const paciente = searchParams.get('paciente');
        const limit = parseInt(searchParams.get('limit') || '50');
        const page = parseInt(searchParams.get('page') || '1');
        const offset = (page - 1) * limit;

        const admin = getSupabaseAdmin();
        let query = admin
            .from('atendimentos')
            .select(`
                id, token, status, inicio, fim, valor_consulta, tipo_consulta,
                pagamento_status, pagamento_id, cid, created_at,
                paciente:pacientes(nome, cpf)
            `, { count: 'exact' })
            .eq('medico_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status && status !== 'todos') {
            query = query.eq('status', status);
        }
        if (dataInicio) {
            query = query.gte('created_at', `${dataInicio}T00:00:00`);
        }
        if (dataFim) {
            query = query.lte('created_at', `${dataFim}T23:59:59`);
        }
        if (paciente) {
            query = query.ilike('pacientes.nome', `%${paciente}%`);
        }

        const { data, error, count } = await query;
        if (error) throw error;

        return NextResponse.json({ data: data || [], total: count || 0, page, limit });
    } catch (err) {
        if (err instanceof ForbiddenError) {
            return NextResponse.json(formatErrorResponse(err), { status: err.statusCode });
        }
        console.error('[GET /api/atendimentos]', err);
        return NextResponse.json({ error: { message: 'Erro ao buscar atendimentos' } }, { status: 500 });
    }
}
