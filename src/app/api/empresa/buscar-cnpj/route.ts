import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/utils/supabase/server';
import { ForbiddenError, ValidationError, formatErrorResponse } from '@/lib/errors';
import { unmask } from '@/utils/masks';

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) throw new ForbiddenError('Não autenticado');

        const cnpj = unmask(request.nextUrl.searchParams.get('cnpj') || '');
        if (cnpj.length !== 14) throw new ValidationError('CNPJ inválido', 'cnpj');

        // Use BrasilAPI as public fallback
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
            headers: { 'User-Agent': 'painel-medico/1.0' },
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
            if (res.status === 404) throw new ValidationError('CNPJ não encontrado na base de dados', 'cnpj');
            throw new Error(`BrasilAPI retornou ${res.status}`);
        }

        const d = await res.json();

        return NextResponse.json({
            data: {
                cnpj: d.cnpj,
                razao_social: d.razao_social || '',
                nome_fantasia: d.nome_fantasia || '',
                endereco_fiscal_cep: d.cep?.replace(/\D/g, '') || '',
                endereco_fiscal_logradouro: d.logradouro || '',
                endereco_fiscal_numero: d.numero || '',
                endereco_fiscal_complemento: d.complemento || '',
                endereco_fiscal_bairro: d.bairro || '',
                endereco_fiscal_cidade: d.municipio || '',
                endereco_fiscal_uf: d.uf || '',
                endereco_fiscal_ibge: d.codigo_municipio_ibge ? String(d.codigo_municipio_ibge) : '',
            },
        });
    } catch (err) {
        if (err instanceof ForbiddenError || err instanceof ValidationError) {
            return NextResponse.json(formatErrorResponse(err), { status: err.statusCode });
        }
        console.error('[GET /api/empresa/buscar-cnpj]', err);
        return NextResponse.json({ error: { message: 'Erro ao buscar dados do CNPJ' } }, { status: 500 });
    }
}
