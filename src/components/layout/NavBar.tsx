'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ClipboardList,
    User,
    Building2,
    FileText,
} from 'lucide-react';
import { cn } from '@/utils/index';

const navItems = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        exact: true,
    },
    {
        label: 'Atendimentos',
        href: '/dashboard/atendimentos',
        icon: ClipboardList,
        exact: false,
    },
    {
        label: 'Perfil',
        href: '/dashboard/perfil',
        icon: User,
        exact: false,
    },
    {
        label: 'Empresa',
        href: '/dashboard/empresa',
        icon: Building2,
        exact: false,
    },
    {
        label: 'Documentos',
        href: '/dashboard/documentos',
        icon: FileText,
        exact: false,
    },
];

export function NavBar() {
    const pathname = usePathname();

    return (
        <nav className="shrink-0 bg-white border-b border-border h-14 flex items-center px-6">
            <div className="flex items-center gap-1">
                {navItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'relative flex items-center gap-1.5 px-3 h-8 text-[10px] font-black uppercase tracking-widest transition-all duration-200 rounded-lg',
                                isActive
                                    ? 'text-primary bg-primary/5'
                                    : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
                            )}
                        >
                            <Icon
                                className={cn(
                                    'w-3.5 h-3.5 shrink-0 transition-all',
                                    isActive ? 'stroke-[2.5px]' : 'stroke-2'
                                )}
                            />
                            <span className="hidden sm:inline whitespace-nowrap">
                                {item.label}
                            </span>

                            {isActive && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
