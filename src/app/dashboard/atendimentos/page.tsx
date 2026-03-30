import { getAuthenticatedUser } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AtendimentosClient } from '@/components/atendimentos/AtendimentosClient';

export default async function AtendimentosPage() {
    const user = await getAuthenticatedUser();
    if (!user) redirect('/login');

    return (
        <div className="p-6">
            <AtendimentosClient />
        </div>
    );
}
