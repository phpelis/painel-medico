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
        <div className="flex-1 overflow-y-auto scrollbar-hidden p-4">
            <DocumentosGrid modelos={(modelos || []) as DocumentoModelo[]} />
        </div>
    );
}
