import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { DocumentosGrid } from '@/components/documentos/DocumentosGrid';
import type { DocumentoModelo } from '@/types/database';

export default async function DocumentosPage() {
    const user = await getAuthenticatedUser();
    if (!user) redirect('/login');

    const admin = getSupabaseAdmin();
    const { data: modelos } = await admin
        .from('documentos_modelos')
        .select('id, titulo, tipo, descricao, created_at')
        .order('titulo', { ascending: true });

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar title="Modelos de Documentos" subtitle="Receitas, atestados e outros modelos configurados" />
            <div className="flex-1 overflow-y-auto p-6">
                <DocumentosGrid modelos={(modelos || []) as DocumentoModelo[]} />
            </div>
        </div>
    );
}
