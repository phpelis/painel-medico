import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DocumentosGrid } from '@/components/documentos/DocumentosGrid';
import type { DocumentoModelo } from '@/types/database';

export default async function DocumentosPage() {
    const user = await getAuthenticatedUser();
    if (!user) redirect('/login');

    const admin = getSupabaseAdmin();
    const { data: modelos } = await admin
        .from('documentos_modelos')
        .select('id, titulo, tipo, conteudo, descricao, created_at')
        .order('titulo', { ascending: true });

    return (
        <div className="p-4 h-full overflow-hidden flex flex-col">
            <DocumentosGrid modelos={(modelos || []) as DocumentoModelo[]} />
        </div>
    );
}
