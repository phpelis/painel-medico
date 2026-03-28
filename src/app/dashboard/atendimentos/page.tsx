import { getAuthenticatedUser } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { AtendimentosClient } from '@/components/atendimentos/AtendimentosClient';

export default async function AtendimentosPage() {
    const user = await getAuthenticatedUser();
    if (!user) redirect('/login');

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar title="Atendimentos" subtitle="Histórico de consultas realizadas" />
            <div className="flex-1 overflow-y-auto p-6">
                <AtendimentosClient />
            </div>
        </div>
    );
}
