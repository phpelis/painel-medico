interface ReadonlyFieldProps {
    value: string;
}

export function ReadonlyField({ value }: ReadonlyFieldProps) {
    return (
        <div className="px-3 py-2 bg-background-secondary border border-border rounded-lg text-sm text-foreground-secondary">
            {value || '—'}
        </div>
    );
}
