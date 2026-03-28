import { Bell } from 'lucide-react';

interface TopBarProps {
    title: string;
    subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
    return (
        <header className="h-14 shrink-0 border-b border-border bg-white flex items-center justify-between px-6">
            <div>
                <h1 className="text-base font-semibold text-foreground">{title}</h1>
                {subtitle && <p className="text-xs text-foreground-secondary">{subtitle}</p>}
            </div>
            <button className="p-2 rounded-lg hover:bg-background-secondary transition-colors text-foreground-secondary">
                <Bell size={18} />
            </button>
        </header>
    );
}
