import { useRef } from 'react';

/**
 * useSpotlight Hook
 * Mouse hareketine göre CSS değişkenlerini (--mouse-x, --mouse-y) günceller.
 * Windows Reveal/Spotlight efekti için kullanılır.
 */
export const useSpotlight = <T extends HTMLElement>() => {
    const containerRef = useRef<T>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if (!containerRef.current) return;

        const { left, top } = containerRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        containerRef.current.style.setProperty('--mouse-x', `${x}px`);
        containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    return { containerRef, handleMouseMove };
};
