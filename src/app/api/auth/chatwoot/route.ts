export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { setChatwootSession } from '@/lib/authSession';
import { getSupabaseAdmin } from '@/utils/supabase/server';
import { ValidationError, ForbiddenError, formatErrorResponse, logError, ApiError } from '@/lib/errors';

/**
 * POST /api/auth/chatwoot
 *
 * BFF endpoint for Chatwoot iframe authentication.
 * Validates the agent's email and chatwoot_user_id against the medicos table,
 * then creates an encrypted session cookie.
 */
export async function POST(request: Request) {
    const requestId = request.headers.get('X-Request-ID') || crypto.randomUUID();

    try {
        const body = await request.json();
        const { doctorEmail, chatwootUserId } = body;

        // 1. Validate required fields
        if (!doctorEmail || typeof doctorEmail !== 'string') {
            throw new ValidationError('Email do médico é obrigatório', 'doctorEmail', requestId);
        }
        if (!chatwootUserId || typeof chatwootUserId !== 'number') {
            throw new ValidationError('ID do usuário Chatwoot é obrigatório', 'chatwootUserId', requestId);
        }

        // 2. Look up the doctor by email
        const admin = getSupabaseAdmin();
        const { data: medico, error: dbError } = await admin
            .from('medicos')
            .select('id, chatwoot_user_id, nome')
            .ilike('email', doctorEmail.trim())
            .maybeSingle();

        if (dbError) {
            throw new ApiError('Erro ao consultar banco de dados', dbError.message, 500, requestId);
        }

        if (!medico) {
            throw new ForbiddenError('Médico não encontrado para este email', requestId);
        }

        // 3. Verify chatwoot_user_id matches
        if (medico.chatwoot_user_id && medico.chatwoot_user_id !== chatwootUserId) {
            console.warn(`[${requestId}] chatwoot_user_id mismatch: DB=${medico.chatwoot_user_id} vs Request=${chatwootUserId}`);
            throw new ForbiddenError('Usuário Chatwoot não corresponde ao cadastro do médico', requestId);
        }

        // 4. If medico has no chatwoot_user_id, update it (first login via Chatwoot)
        if (!medico.chatwoot_user_id) {
            await admin
                .from('medicos')
                .update({ chatwoot_user_id: chatwootUserId })
                .eq('id', medico.id);
            console.log(`[${requestId}] Auto-linked chatwoot_user_id=${chatwootUserId} to medico=${medico.id}`);
        }

        // 5. Create encrypted session
        await setChatwootSession(medico.id, doctorEmail.trim().toLowerCase());

        return NextResponse.json({
            success: true,
            data: {
                medico_id: medico.id,
                nome: medico.nome,
            },
            request_id: requestId,
        });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logError(err instanceof ApiError ? err : new ApiError(err.message, err.message, 500, requestId), requestId);

        if (err instanceof ApiError) {
            return NextResponse.json(formatErrorResponse(err), { status: err.statusCode });
        }

        return NextResponse.json(
            { error: { message: 'Erro interno do servidor', request_id: requestId } },
            { status: 500 }
        );
    }
}
