interface Props {
    title: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}

export function SectionCard({ title, children, action }: Props) {
    return (
        <div className="medical-card p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                {action}
            </div>
            {children}
        </div>
    );
}
