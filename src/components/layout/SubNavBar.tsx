'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/index';

const perfilTabs = [
    { label: 'Dados do Médico', href: '/dashboard/perfil/dados' },
    { label: 'Endereço Residencial', href: '/dashboard/perfil/endereco' },
    { label: 'Certificado Digital', href: '/dashboard/perfil/certificado' },
];

const empresaTabs = [
    { label: 'Dados da Empresa', href: '/dashboard/empresa/dados' },
    { label: 'Configuração de Notas', href: '/dashboard/empresa/notas' },
];

export function SubNavBar() {
    const pathname = usePathname();

    const isPerfil = pathname.startsWith('/dashboard/perfil');
    const isEmpresa = pathname.startsWith('/dashboard/empresa');

    if (!isPerfil && !isEmpresa) return null;

    const tabs = isPerfil ? perfilTabs : empresaTabs;

    return (
        <div className="shrink-0 bg-background-secondary border-b border-border h-10 flex items-center px-6 gap-1">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            'relative flex items-center px-3 h-7 text-[10px] font-semibold uppercase tracking-wider rounded-md transition-all',
                            isActive
                                ? 'text-primary bg-white shadow-sm'
                                : 'text-foreground-secondary hover:text-foreground hover:bg-white/50'
                        )}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
