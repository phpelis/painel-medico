'use client';

import React, { useRef, useState, useMemo, ReactNode } from 'react';
import { Loader2, SearchX } from 'lucide-react';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { useDynamicPagination } from '@/hooks/useDynamicPagination';

interface PaginatedListViewProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    loading?: boolean;
    error?: string | null;
    emptyState?: ReactNode;
    itemHeightEstimate?: number;
    gap?: number;
    className?: string;
    header?: ReactNode;
    itemsPerPage?: number;
}

export function PaginatedListView<T extends { id?: string | number }>({
    items,
    renderItem,
    loading,
    error,
    emptyState,
    itemHeightEstimate = 52,
    gap = 12,
    className = '',
    header,
    itemsPerPage: itemsPerPageOverride,
}: PaginatedListViewProps<T>) {
    const listContainerRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const { itemsPerPage: calculatedItemsPerPage, availableHeight } = useDynamicPagination(
        listContainerRef,
        itemHeightEstimate,
        gap
    );
    const itemsPerPage = itemsPerPageOverride || calculatedItemsPerPage || 10;

    React.useEffect(() => {
        setCurrentPage(1);
    }, [items]);

    const totalPages = Math.ceil((items?.length || 0) / itemsPerPage);

    const paginatedItems = useMemo(() => {
        return (items || []).slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [items, currentPage, itemsPerPage]);

    const outerStyle: React.CSSProperties = availableHeight > 0
        ? { maxHeight: availableHeight }
        : {};

    if (loading) {
        return (
            <div className={`relative flex-1 flex flex-col min-h-40 medical-card overflow-hidden ${className}`}>
                {header}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground-secondary gap-3 bg-white z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-xs font-medium">Carregando...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`relative flex-1 flex flex-col min-h-40 medical-card overflow-hidden ${className}`}>
                {header}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-error gap-3 p-8 bg-white z-10">
                    <span className="text-xs font-medium">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative flex-1 flex flex-col medical-card overflow-hidden ${className}`}
            style={outerStyle}
        >
            {header}

            <div ref={listContainerRef} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto px-4 pt-4 pb-0">
                    {paginatedItems.length === 0 ? (
                        emptyState || (
                            <div className="h-full flex flex-col items-center justify-center text-foreground-secondary gap-4 py-12">
                                <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center border border-border">
                                    <SearchX className="w-8 h-8 text-border-strong" />
                                </div>
                                <p className="text-sm font-medium">Nenhum item encontrado.</p>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col gap-3">
                            {paginatedItems.map((item, index) => (
                                <React.Fragment key={item.id ?? index}>
                                    {renderItem(item, index)}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>

                {paginatedItems.length > 0 && totalPages > 1 && (
                    <div className="px-4 pb-4 bg-white shrink-0 z-10">
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
