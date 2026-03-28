import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { EncryptionService } from '@/lib/encryption';
import { ForbiddenError, ValidationError, formatErrorResponse } from '@/lib/errors';

// Fields that cannot be updated via this endpoint
const IMMUTABLE_FIELDS = ['id', 'email', 'cpf', 'criado_at', 'chatwoot_user_id', 'comissao_personalizada', 'media_avaliacao'];

export async function PATCH(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new ForbiddenError('Não autenticado');

        const body = await request.json();

        // Strip immutable fields
        const updates: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(body)) {
            if (!IMMUTABLE_FIELDS.includes(key)) {
                updates[key] = value;
            }
        }

        if (Object.keys(updates).length === 0) {
            throw new ValidationError('Nenhum campo válido para atualizar');
        }

        // Encrypt pix key if present
        if (updates.woovi_pix_key && typeof updates.woovi_pix_key === 'string' && updates.woovi_pix_key.trim()) {
            const enc = new EncryptionService();
            updates.woovi_pix_key = enc.encrypt(updates.woovi_pix_key.trim());
        }

        const admin = getSupabaseAdmin();
        const { error } = await admin
            .from('medicos')
            .update(updates)
            .eq('id', user.id);

        if (error) throw new Error(error.message);

        return NextResponse.json({ ok: true });
    } catch (err) {
        if (err instanceof ForbiddenError || err instanceof ValidationError) {
            return NextResponse.json(formatErrorResponse(err), { status: err.statusCode });
        }
        console.error('[PATCH /api/medico/update]', err);
        return NextResponse.json({ error: { message: 'Erro ao atualizar cadastro' } }, { status: 500 });
    }
}
