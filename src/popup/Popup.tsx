import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { StorageService, UserProfile, TelegramTarget } from '../services/storage';
import { DashboardView } from './views/DashboardView';
import '../styles/globals.css';

/**
 * Main Popup Entry Point
 * Orchestrates State Management between Views.
 */
function Popup() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // Dashboard State
    const [targets, setTargets] = useState<TelegramTarget[]>([]);

    useEffect(() => {
        const init = async () => {
            await loadProfile();
        };
        init();
    }, []);

    // Load profile on start
    const loadProfile = async () => {
        setLoading(true);
        const active = await StorageService.getActiveProfile();
        setProfile(active);
        if (active) {
            setTargets(active.targets);
        }
        setLoading(false);
    };



    // Manual Refresh just reloads local storage for now to keep UI in sync
    const handleRefresh = async (currentProfile = profile) => {
        if (!currentProfile) return;
        const latestProfile = await StorageService.getActiveProfile();
        if (latestProfile) {
            setTargets(latestProfile.targets);
        }
    };

    const handleDeleteTarget = async (targetId: string) => {
        if (!profile) return;
        const updatedTargets = targets.filter(t => t.id !== targetId);
        await StorageService.updateProfileTargets(profile.id, updatedTargets);
        setTargets(updatedTargets);
        // Refresh context menu
        chrome.runtime.sendMessage({ type: 'REFRESH_MENU' });
    };

    const handleAddManualTarget = async (newTarget: TelegramTarget) => {
        if (!profile) return;

        // Check for duplicates
        const exists = targets.some(t => {
            // Check exact ID match
            if (t.id === newTarget.id) return true;

            // Check normalized ID match for channels/groups (-100 prefix)
            const tId = t.id.startsWith('-100') ? t.id.substring(4) : t.id;
            const nId = newTarget.id.startsWith('-100') ? newTarget.id.substring(4) : newTarget.id;

            // Also Check if one is a supergroup version of the other
            if (tId === nId) return true;

            return false;
        });

        if (exists) {
            // Visual feedback could be better, but for now just don't add
            console.warn('Target already exists');
            return;
        }

        const updatedTargets = [...targets, newTarget];
        await StorageService.updateProfileTargets(profile.id, updatedTargets);
        setTargets(updatedTargets);
        chrome.runtime.sendMessage({ type: 'REFRESH_MENU' });
    };

    const handleRenameTarget = async (targetId: string, newName: string) => {
        if (!profile) return;
        const updatedTargets = targets.map(t =>
            t.id === targetId ? { ...t, name: newName } : t
        );
        await StorageService.updateProfileTargets(profile.id, updatedTargets);
        setTargets(updatedTargets);
        chrome.runtime.sendMessage({ type: 'REFRESH_MENU' });
    };

    const handleTogglePin = async (targetId: string) => {
        if (!profile) return;
        const updatedTargets = targets.map(t =>
            t.id === targetId ? { ...t, pinned: !t.pinned } : t
        );
        // Sort: Pinned first, then by name (optional, but good for consistent storage)
        // Actually, let's just save the state, view handles sorting usually. 
        // But reordering storage might be better for consistency across devices?
        // For now just update state.

        await StorageService.updateProfileTargets(profile.id, updatedTargets);
        setTargets(updatedTargets);
        chrome.runtime.sendMessage({ type: 'REFRESH_MENU' });
    };

    const handleLogout = async () => {
        await StorageService.clear();
        setProfile(null);
        setTargets([]);
        chrome.runtime.sendMessage({ type: 'REFRESH_MENU' });
    };

    // --- RENDERING ---

    if (loading) {
        return <div className="w-[400px] h-[560px] bg-background flex items-center justify-center text-primary"><RefreshCw className="animate-spin" /></div>;
    }

    // View Routing
    if (!profile) {
        return (
            <div className="w-[400px] h-[560px] bg-background flex items-center justify-center p-6 text-center">
                <div>
                    <p className="text-white font-bold mb-2">Setup Required</p>
                    <p className="text-sm text-gray-400">Please finish setup in the welcome page.</p>
                    <button
                        onClick={() => chrome.tabs.create({ url: 'welcome.html' })}
                        className="mt-4 px-4 py-2 bg-primary text-background rounded-lg font-bold text-sm"
                    >
                        Open Setup
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-[400px] h-[560px] bg-background">
            <DashboardView
                profile={profile}
                targets={targets}
                onRefresh={() => handleRefresh(profile)}
                onLogout={handleLogout}
                onDeleteTarget={handleDeleteTarget}
                onAddTarget={handleAddManualTarget}
                onRenameTarget={handleRenameTarget}
                onTogglePin={handleTogglePin}
            />
        </div>
    );
}

export default Popup;
