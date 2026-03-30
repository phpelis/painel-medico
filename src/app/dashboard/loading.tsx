export default function DashboardLoading() {
    return (
        <div className="p-6 space-y-6 animate-pulse">
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="medical-card p-4 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-background-secondary shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-24 rounded bg-background-secondary" />
                            <div className="h-5 w-16 rounded bg-background-secondary" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Table skeleton */}
            <div className="medical-card p-5 space-y-4">
                <div className="h-4 w-32 rounded bg-background-secondary" />
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div className="space-y-1.5">
                                <div className="h-3.5 w-36 rounded bg-background-secondary" />
                                <div className="h-3 w-24 rounded bg-background-secondary" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-16 rounded bg-background-secondary" />
                                <div className="h-5 w-14 rounded bg-background-secondary" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
