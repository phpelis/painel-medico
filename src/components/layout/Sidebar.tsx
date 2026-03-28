'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    ClipboardList,
    User,
    Building2,
    FileText,
    ChevronDown,
    ChevronRight,
    LogOut,
} from 'lucide-react';
import { cn } from '@/utils/index';
import { createClient } from '@/utils/supabase/client';

type NavItem = {
    label: string;
    href?: string;
    icon: React.ReactNode;
    children?: { label: string; href: string }[];
};

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard size={18} />,
    },
    {
        label: 'Atendimentos',
        href: '/dashboard/atendimentos',
        icon: <ClipboardList size={18} />,
    },
    {
        label: 'Perfil',
        icon: <User size={18} />,
        children: [
            { label: 'Dados do Médico', href: '/dashboard/perfil/dados' },
            { label: 'Endereço Residencial', href: '/dashboard/perfil/endereco' },
            { label: 'Certificado Digital', href: '/dashboard/perfil/certificado' },
        ],
    },
    {
        label: 'Empresa',
        icon: <Building2 size={18} />,
        children: [
            { label: 'Dados da Empresa', href: '/dashboard/empresa/dados' },
            { label: 'Configuração de Notas', href: '/dashboard/empresa/notas' },
        ],
    },
    {
        label: 'Documentos',
        href: '/dashboard/documentos',
        icon: <FileText size={18} />,
    },
];

export function Sidebar({ nomeMedico }: { nomeMedico?: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const [expanded, setExpanded] = useState<string[]>(['Perfil', 'Empresa']);

    function toggleGroup(label: string) {
        setExpanded(prev =>
            prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
        );
    }

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    }

    return (
        <aside className="w-56 shrink-0 h-screen bg-white border-r border-border flex flex-col">
            {/* Logo */}
            <div className="px-4 py-5 border-b border-border">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                        D
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">DoutorTáOn</p>
                        <p className="text-[10px] text-foreground-secondary truncate">
                            {nomeMedico ? `Dr. ${nomeMedico.split(' ')[0]}` : 'Painel Médico'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                {navItems.map(item => {
                    const isActive = item.href ? pathname === item.href : false;
                    const isGroupActive = item.children?.some(c => pathname.startsWith(c.href));
                    const isExpanded = expanded.includes(item.label);

                    if (item.children) {
                        return (
                            <div key={item.label}>
                                <button
                                    onClick={() => toggleGroup(item.label)}
                                    className={cn(
                                        'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                        isGroupActive
                                            ? 'bg-primary/8 text-primary'
                                            : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground'
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        {item.icon}
                                        {item.label}
                                    </span>
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                                {isExpanded && (
                                    <div className="mt-0.5 ml-4 pl-3 border-l border-border space-y-0.5">
                                        {item.children.map(child => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={cn(
                                                    'block px-3 py-1.5 rounded-md text-sm transition-colors',
                                                    pathname === child.href
                                                        ? 'bg-primary/10 text-primary font-semibold'
                                                        : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground'
                                                )}
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href!}
                            className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground'
                            )}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-2 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground-secondary hover:bg-error-light hover:text-error transition-colors"
                >
                    <LogOut size={16} />
                    Sair
                </button>
            </div>
        </aside>
    );
}
