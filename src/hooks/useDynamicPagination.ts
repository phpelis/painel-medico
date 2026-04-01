'use client';

import { useState, useEffect, useLayoutEffect, useCallback, RefObject } from 'react';

const PAGINATION_HEIGHT = 48;
const CONTAINER_PADDING = 32; // pt-4 (16px) + pb-4 (16px)
const BOTTOM_MARGIN = 16; // Corresponde ao pb-4 (16px) do Main, garantindo gap visual na borda inferior
const MIN_ITEMS = 4;

/**
 * Calcula dinamicamente quantos itens cabem na lista usando a posição
 * do elemento no viewport (getBoundingClientRect) em vez de clientHeight.
 *
 * Quebra a dependência circular onde medir clientHeight retornava
 * a altura do próprio conteúdo renderizado.
 */
export function useDynamicPagination(
    containerRef: RefObject<HTMLDivElement | null>,
    itemHeight: number = 58,
    gap: number = 12
): { itemsPerPage: number; availableHeight: number } {
    const [itemsPerPage, setItemsPerPage] = useState(MIN_ITEMS);
    const [availableHeight, setAvailableHeight] = useState(0);

    const calculate = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        if (rect.width === 0) return;

        const totalHeight = window.innerHeight - rect.top;

        if (totalHeight <= 50) {
            setItemsPerPage(MIN_ITEMS);
            setAvailableHeight(0);
            return;
        }

        const forItems = totalHeight - PAGINATION_HEIGHT - CONTAINER_PADDING - BOTTOM_MARGIN;
        const count = Math.max(MIN_ITEMS, Math.floor((forItems + gap) / (itemHeight + gap)));

        setAvailableHeight(totalHeight);
        setItemsPerPage(count);
    }, [containerRef, itemHeight, gap]);

    useLayoutEffect(() => {
        calculate();
    }, [calculate]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        calculate();

        const observer = new ResizeObserver(() => calculate());
        observer.observe(el);
        if (el.parentElement) observer.observe(el.parentElement);

        window.addEventListener('resize', calculate);
        const timer = setTimeout(calculate, 300);

        return () => {
            window.removeEventListener('resize', calculate);
            observer.disconnect();
            clearTimeout(timer);
        };
    }, [containerRef, calculate]);

    return { itemsPerPage, availableHeight };
}
