import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/utils/supabase/server';
import { ForbiddenError, ValidationError, formatErrorResponse } from '@/lib/errors';
import { parsePfxCertificate } from '@/lib/certificate/parseService';

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new ForbiddenError('Não autenticado');

        const formData = await request.formData();
        const pfxFile = formData.get('pfxFile') as File | null;
        const password = formData.get('password') as string | null;

        if (!pfxFile || !password) {
            throw new ValidationError('Arquivo e senha são necessários para verificação');
        }

        const pfxBuffer = await pfxFile.arrayBuffer();
        const parsed = await parsePfxCertificate(pfxBuffer, password);

        return NextResponse.json({ 
            tipo: parsed.tipo,
            commonName: parsed.dados_certificado.commonName 
        });
    } catch (err: any) {
        if (err instanceof ForbiddenError || err instanceof ValidationError) {
            return NextResponse.json(formatErrorResponse(err), { status: err.statusCode });
        }
        // Se for erro de senha ou de parse, retornamos como 400 amigável
        return NextResponse.json({ 
            error: { message: err.message || 'Erro ao verificar certificado' } 
        }, { status: 400 });
    }
}
