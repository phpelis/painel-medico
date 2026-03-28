import { redirect } from 'next/navigation';
import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await getAuthenticatedUser();
    if (!user) redirect('/login');

    const admin = getSupabaseAdmin();
    const { data: medico } = await admin
        .from('medicos')
        .select('nome')
        .eq('id', user.id)
        .maybeSingle();

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar nomeMedico={medico?.nome} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {children}
            </div>
        </div>
    );
}
