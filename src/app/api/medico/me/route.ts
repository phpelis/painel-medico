import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { EncryptionService } from '@/lib/encryption';
import { ForbiddenError, formatErrorResponse } from '@/lib/errors';

export async function GET() {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new ForbiddenError('Não autenticado');

        const admin = getSupabaseAdmin();
        const { data: medico, error } = await admin
            .from('medicos')
            .select('id, nome, email, cpf, crm, uf_crm, celular, telefone, especialidade_primaria, especialidade_secundaria, rqe_primaria, rqe_secundaria, woovi_pix_key, media_avaliacao, criado_at')
            .eq('id', user.id)
            .single();

        if (error || !medico) throw new ForbiddenError('Médico não encontrado');

        // Decrypt pix key server-side
        if (medico.woovi_pix_key) {
            try {
                const enc = new EncryptionService();
                medico.woovi_pix_key = enc.decrypt(medico.woovi_pix_key);
            } catch {
                medico.woovi_pix_key = '';
            }
        }

        return NextResponse.json({ data: medico });
    } catch (err) {
        if (err instanceof ForbiddenError) {
            return NextResponse.json(formatErrorResponse(err), { status: err.statusCode });
        }
        console.error('[GET /api/medico/me]', err);
        return NextResponse.json({ error: { message: 'Erro interno' } }, { status: 500 });
    }
}
