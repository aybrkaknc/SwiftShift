/**
 * TabBar Component Tests
 * Sekme çubuğu bileşeni için unit testler.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabBar } from '../popup/components/TabBar';

describe('TabBar', () => {
    it('üç sekme render etmeli', () => {
        const onTabChange = vi.fn();
        render(<TabBar activeTab="channels" onTabChange={onTabChange} />);

        expect(screen.getByText('Channels')).toBeInTheDocument();
        expect(screen.getByText('Recents')).toBeInTheDocument();
        expect(screen.getByText('Logs')).toBeInTheDocument();
    });

    it('aktif sekme vurgulanmalı', () => {
        const onTabChange = vi.fn();
        render(<TabBar activeTab="recents" onTabChange={onTabChange} />);

        const recentsButton = screen.getByText('Recents').closest('button');
        expect(recentsButton?.className).toContain('bg-primary');
    });

    it('sekme tıklandığında callback çağrılmalı', () => {
        const onTabChange = vi.fn();
        render(<TabBar activeTab="channels" onTabChange={onTabChange} />);

        fireEvent.click(screen.getByText('Logs'));

        expect(onTabChange).toHaveBeenCalledWith('logs');
    });

    it('tüm sekmelere tıklanabilmeli', () => {
        const onTabChange = vi.fn();
        render(<TabBar activeTab="channels" onTabChange={onTabChange} />);

        fireEvent.click(screen.getByText('Channels'));
        expect(onTabChange).toHaveBeenCalledWith('channels');

        fireEvent.click(screen.getByText('Recents'));
        expect(onTabChange).toHaveBeenCalledWith('recents');

        fireEvent.click(screen.getByText('Logs'));
        expect(onTabChange).toHaveBeenCalledWith('logs');
    });
});
