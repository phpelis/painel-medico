import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { ForbiddenError, ValidationError, formatErrorResponse } from '@/lib/errors';
import { parsePfxCertificate } from '@/lib/certificate/parseService';

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new ForbiddenError('Não autenticado');

        const formData = await request.formData();
        const pfxFile = formData.get('pfxFile') as File | null;
        const password = formData.get('password') as string | null;
        const tipo = (formData.get('tipo') as string) || 'e-cpf';

        if (!pfxFile) throw new ValidationError('Arquivo .pfx é obrigatório', 'pfxFile');
        if (!password) throw new ValidationError('Senha do certificado é obrigatória', 'password');

        const pfxBuffer = await pfxFile.arrayBuffer();

        let dados_certificado: { commonName: string; cpf: string; serialNumber: string; issuer: string; validFrom: string; validTo: string };
        let validTo: string;

        try {
            const parsed = await parsePfxCertificate(pfxBuffer, password);
            dados_certificado = parsed.dados_certificado;
            validTo = parsed.validTo;
        } catch (e: any) {
            if (e.message?.includes('Invalid password') || e.message?.includes('mac verify')) {
                throw new ValidationError('Senha do certificado incorreta', 'password');
            }
            throw new ValidationError('Certificado inválido ou corrompido', 'pfxFile');
        }

        const admin = getSupabaseAdmin();

        // Deactivate existing certs of same type
        await admin
            .from('certificados_digitais')
            .update({ status: 'expirado' })
            .eq('medico_id', user.id)
            .eq('tipo', tipo)
            .eq('status', 'ativo');

        // Upload to storage
        const fileName = `${user.id}/${tipo}/${Date.now()}.pfx`;
        const { error: uploadError } = await admin.storage
            .from('certificados')
            .upload(fileName, pfxFile, { contentType: 'application/x-pkcs12', upsert: false });

        if (uploadError) throw new Error(`Upload falhou: ${uploadError.message}`);

        // Save metadata
        const { data: newCert, error: dbError } = await admin
            .from('certificados_digitais')
            .insert({
                medico_id: user.id,
                storage_path: fileName,
                status: 'ativo',
                tipo,
                validade_ate: validTo.split('T')[0],
                dados_certificado,
            })
            .select()
            .single();

        if (dbError || !newCert) {
            await admin.storage.from('certificados').remove([fileName]);
            throw new Error('Erro ao salvar certificado no banco');
        }

        return NextResponse.json({ data: newCert });
    } catch (err) {
        if (err instanceof ForbiddenError || err instanceof ValidationError) {
            return NextResponse.json(formatErrorResponse(err), { status: err.statusCode });
        }
        console.error('[POST /api/certificado/upload]', err);
        return NextResponse.json({ error: { message: 'Erro ao processar certificado' } }, { status: 500 });
    }
}
