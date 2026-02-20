import { useEffect, useState } from 'react';
import { RefreshCw, Zap, ArrowRight } from 'lucide-react';
import { StorageService, UserProfile, TelegramTarget } from '../services/storage';
import { DashboardView } from './views/DashboardView';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { TranslationProvider } from '../utils/TranslationContext';
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

        // Bir kanal silindiğinde altındaki konuların da silinmesi için parentId kontrolü eklendi
        const updatedTargets = targets.filter(t => t.id !== targetId && t.parentId !== targetId);

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
        return (
            <TranslationProvider>
                <div className="w-[400px] h-[200px] bg-background flex items-center justify-center text-primary">
                    <RefreshCw className="animate-spin" />
                </div>
            </TranslationProvider>
        );
    }

    // Profil yoksa kurulum ekranına yönlendirme butonu göster
    if (!profile) {
        const openWelcome = () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
            window.close();
        };

        return (
            <TranslationProvider>
                <div className="w-[400px] bg-background flex flex-col items-center justify-center p-8 gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Zap className="text-primary fill-primary" size={28} />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-bold text-white tracking-tight">SwiftShift</h2>
                        <p className="text-sm text-muted">Telegram botunuzu bağlayarak başlayın.</p>
                    </div>
                    <button
                        onClick={openWelcome}
                        className="w-full py-3 rounded-xl bg-primary text-background font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-hover transition-all active:scale-[0.98] shadow-[0_0_20px_-5px_rgba(244,171,37,0.3)]"
                    >
                        Kuruluma Başla
                        <ArrowRight size={16} />
                    </button>
                </div>
            </TranslationProvider>
        );
    }

    return (
        <TranslationProvider>
            <ErrorBoundary>
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
            </ErrorBoundary>
        </TranslationProvider>
    );
}

export default Popup;
