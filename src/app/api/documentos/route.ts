import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { ForbiddenError, formatErrorResponse } from '@/lib/errors';

export async function GET() {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new ForbiddenError('Não autenticado');

        const admin = getSupabaseAdmin();
        const { data, error } = await admin
            .from('documentos_modelos')
            .select('id, titulo, tipo, descricao, created_at')
            .order('titulo', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ data: data || [] });
    } catch (err) {
        if (err instanceof ForbiddenError) return NextResponse.json(formatErrorResponse(err), { status: err.statusCode });
        console.error('[GET /api/documentos]', err);
        return NextResponse.json({ error: { message: 'Erro ao buscar modelos' } }, { status: 500 });
    }
}
