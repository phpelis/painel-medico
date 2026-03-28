import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { ForbiddenError, ValidationError, formatErrorResponse } from '@/lib/errors';

export async function GET() {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new ForbiddenError('Não autenticado');

        const admin = getSupabaseAdmin();
        const { data } = await admin
            .from('empresa_medico')
            .select('*')
            .eq('medico_id', user.id)
            .maybeSingle();

        return NextResponse.json({ data });
    } catch (err) {
        if (err instanceof ForbiddenError) return NextResponse.json(formatErrorResponse(err), { status: err.statusCode });
        return NextResponse.json({ error: { message: 'Erro ao buscar empresa' } }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new ForbiddenError('Não autenticado');

        const body = await request.json();
        if (!body.cnpj || !body.razao_social) {
            throw new ValidationError('CNPJ e razão social são obrigatórios');
        }

        const admin = getSupabaseAdmin();

        // Check if already exists
        const { data: existing } = await admin
            .from('empresa_medico')
            .select('id')
            .eq('medico_id', user.id)
            .maybeSingle();

        if (existing) {
            throw new ValidationError('Empresa já cadastrada. Use PATCH para atualizar.');
        }

        const { data, error } = await admin
            .from('empresa_medico')
            .insert({ ...body, medico_id: user.id })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return NextResponse.json({ data }, { status: 201 });
    } catch (err) {
        if (err instanceof ForbiddenError || err instanceof ValidationError) {
            return NextResponse.json(formatErrorResponse(err), { status: err.statusCode });
        }
        console.error('[POST /api/empresa]', err);
        return NextResponse.json({ error: { message: 'Erro ao cadastrar empresa' } }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new ForbiddenError('Não autenticado');

        const body = await request.json();
        const { medico_id, id, created_at, ...updates } = body;

        const admin = getSupabaseAdmin();
        const { data, error } = await admin
            .from('empresa_medico')
            .update(updates)
            .eq('medico_id', user.id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return NextResponse.json({ data });
    } catch (err) {
        if (err instanceof ForbiddenError || err instanceof ValidationError) {
            return NextResponse.json(formatErrorResponse(err), { status: err.statusCode });
        }
        console.error('[PATCH /api/empresa]', err);
        return NextResponse.json({ error: { message: 'Erro ao atualizar empresa' } }, { status: 500 });
    }
}
