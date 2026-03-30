import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { ForbiddenError, formatErrorResponse } from '@/lib/errors';

export async function GET() {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new ForbiddenError('Não autenticado');

        const admin = getSupabaseAdmin();
        const { data, error } = await admin
            .from('documentos_modelos')
            .select('id, titulo, tipo, conteudo, descricao, created_at')
            .order('titulo', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ data: data || [] });
    } catch (err) {
        if (err instanceof ForbiddenError) return NextResponse.json(formatErrorResponse(err), { status: err.statusCode });
        console.error('[GET /api/documentos]', err);
        return NextResponse.json({ error: { message: 'Erro ao buscar modelos' } }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new ForbiddenError('Não autenticado');

        const body = await request.json();
        const { titulo, tipo, conteudo, descricao } = body;

        if (!titulo?.trim()) return NextResponse.json({ error: { message: 'Título é obrigatório' } }, { status: 400 });
        if (!conteudo?.trim()) return NextResponse.json({ error: { message: 'Conteúdo é obrigatório' } }, { status: 400 });

        const admin = getSupabaseAdmin();
        const { data, error } = await admin
            .from('documentos_modelos')
            .insert({ titulo: titulo.trim(), tipo: tipo || null, conteudo, descricao: descricao?.trim() || null, medico_id: user.id })
            .select('id, titulo, tipo, conteudo, descricao, created_at')
            .single();

        if (error) throw error;

        return NextResponse.json({ data }, { status: 201 });
    } catch (err) {
        if (err instanceof ForbiddenError) return NextResponse.json(formatErrorResponse(err), { status: err.statusCode });
        console.error('[POST /api/documentos]', err);
        return NextResponse.json({ error: { message: 'Erro ao criar modelo' } }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new ForbiddenError('Não autenticado');

        const body = await request.json();
        const { id, titulo, tipo, conteudo, descricao } = body;

        if (!id) return NextResponse.json({ error: { message: 'ID é obrigatório' } }, { status: 400 });

        const updates: Record<string, unknown> = {};
        if (titulo !== undefined) updates.titulo = titulo.trim();
        if (tipo !== undefined) updates.tipo = tipo || null;
        if (conteudo !== undefined) updates.conteudo = conteudo;
        if (descricao !== undefined) updates.descricao = descricao?.trim() || null;

        const admin = getSupabaseAdmin();
        const { data, error } = await admin
            .from('documentos_modelos')
            .update(updates)
            .eq('id', id)
            .select('id, titulo, tipo, conteudo, descricao, created_at')
            .single();

        if (error) throw error;

        return NextResponse.json({ data });
    } catch (err) {
        if (err instanceof ForbiddenError) return NextResponse.json(formatErrorResponse(err), { status: err.statusCode });
        console.error('[PUT /api/documentos]', err);
        return NextResponse.json({ error: { message: 'Erro ao atualizar modelo' } }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new ForbiddenError('Não autenticado');

        const id = new URL(request.url).searchParams.get('id');
        if (!id) return NextResponse.json({ error: { message: 'ID é obrigatório' } }, { status: 400 });

        const admin = getSupabaseAdmin();
        const { error } = await admin
            .from('documentos_modelos')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err) {
        if (err instanceof ForbiddenError) return NextResponse.json(formatErrorResponse(err), { status: err.statusCode });
        console.error('[DELETE /api/documentos]', err);
        return NextResponse.json({ error: { message: 'Erro ao excluir modelo' } }, { status: 500 });
    }
}
