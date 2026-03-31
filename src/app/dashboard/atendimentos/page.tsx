import { getAuthenticatedUser } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AtendimentosClient } from '@/components/atendimentos/AtendimentosClient';

export default async function AtendimentosPage() {
    const user = await getAuthenticatedUser();
    if (!user) redirect('/login');

    return (
        <div className="h-full flex flex-col p-4">
            <AtendimentosClient />
        </div>
    );
}
