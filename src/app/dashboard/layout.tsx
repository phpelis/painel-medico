import { redirect } from 'next/navigation';
import { getAuthenticatedUser, getSupabaseAdmin } from '@/utils/supabase/server';
import { AppHeader } from '@/components/layout/AppHeader';
import { NavBar } from '@/components/layout/NavBar';
import { SubNavBar } from '@/components/layout/SubNavBar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await getAuthenticatedUser();
    if (!user) redirect('/login');

    const admin = getSupabaseAdmin();
    const { data: medico } = await admin
        .from('medicos')
        .select('nome, crm, uf_crm')
        .eq('id', user.id)
        .maybeSingle();

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            <AppHeader
                nomeMedico={medico?.nome}
                crm={medico?.crm ? String(medico.crm) : undefined}
                ufCrm={medico?.uf_crm}
            />
            <NavBar />
            <SubNavBar />
            <main className="flex-1 overflow-y-auto scrollbar-hidden">
                {children}
            </main>
        </div>
    );
}
