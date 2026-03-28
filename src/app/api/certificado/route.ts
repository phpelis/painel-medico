import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { ForbiddenError, formatErrorResponse } from '@/lib/errors';

export async function GET() {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new ForbiddenError('Não autenticado');

        const admin = getSupabaseAdmin();
        const { data } = await admin
            .from('certificados_digitais')
            .select('id, status, validade_ate, dados_certificado, tipo, created_at')
            .eq('medico_id', user.id)
            .eq('tipo', 'e-cpf')
            .eq('status', 'ativo')
            .maybeSingle();

        return NextResponse.json({ data });
    } catch (err) {
        if (err instanceof ForbiddenError) {
            return NextResponse.json(formatErrorResponse(err), { status: err.statusCode });
        }
        return NextResponse.json({ error: { message: 'Erro ao buscar certificado' } }, { status: 500 });
    }
}
