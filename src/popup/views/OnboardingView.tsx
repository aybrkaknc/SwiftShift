import React, { useState } from 'react';
import { ArrowRight, Rocket, Zap, Settings, Key } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Accordion } from '../../components/ui/Accordion';

interface OnboardingViewProps {
    onConnect: (token: string) => void;
    isLoading: boolean;
    error?: string;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onConnect, isLoading, error }) => {
    const [token, setToken] = useState('');

    return (
        <div className="flex flex-col h-full bg-background text-white relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 z-10">
                <div className="flex items-center gap-2">
                    <Zap className="text-primary fill-primary" size={20} />
                    <span className="font-bold text-lg tracking-tight">SwiftShift</span>
                </div>
                <button className="text-muted hover:text-white transition-colors">
                    <Settings size={20} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 flex flex-col px-5 pt-2 pb-6 overflow-y-auto no-scrollbar">

                {/* Hero section with simplified glow */}
                <div className="flex flex-col items-center mb-8 mt-4">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative w-20 h-20 rounded-full bg-surface/50 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-sm">
                            <Rocket className="text-primary drop-shadow-[0_0_10px_rgba(244,171,37,0.5)]" size={36} />
                        </div>
                    </div>

                    <div className="mt-6 text-center space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">Connect Telegram</h1>
                        <p className="text-muted text-sm font-medium leading-relaxed max-w-[260px]">
                            Enter your bot token to start shifting content instantly.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="flex flex-col gap-5">
                    <div className="space-y-1.5">
                        <Input
                            label="TELEGRAM BOT TOKEN"
                            placeholder="123456:ABC-DEF1234..."
                            isSecret
                            leftIcon={<Key size={16} strokeWidth={2.5} />}
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            error={error}
                            className="text-white"
                        />
                    </div>

                    <button
                        onClick={() => onConnect(token)}
                        disabled={isLoading}
                        className="group w-full bg-gradient-to-r from-primary to-primary-hover hover:to-[#FFB74D] text-background font-black text-sm uppercase tracking-wide py-4 px-6 rounded-xl shadow-[0_0_20px_-5px_theme(colors.primary)] hover:shadow-[0_0_25px_-5px_theme(colors.primary)] transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-background rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-background rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-background rounded-full animate-bounce"></div>
                            </div>
                        ) : (
                            <>
                                <span>Connect & Detect</span>
                                <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    {/* Helper Card */}
                    <div className="mt-2 bg-surface/30 border border-white/5 rounded-xl overflow-hidden">
                        <Accordion title="Where do I get my token?">
                            <div className="space-y-2.5 text-xs text-muted pb-3">
                                <p className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold">1</span>
                                    <span>Open <a href="https://t.me/BotFather" target="_blank" className="text-primary hover:underline font-medium">@BotFather</a></span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold">2</span>
                                    <span>Send command <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">/newbot</code></span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold">3</span>
                                    <span>Copy the <strong className="text-white">HTTP API Token</strong></span>
                                </p>
                            </div>
                        </Accordion>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/5 bg-background/50 backdrop-blur-sm flex items-center justify-between text-[10px] font-medium text-muted/60">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted/40"></div>
                    <span>Disconnected</span>
                </div>
                <span>v1.0.4</span>
            </div>
        </div>
    );
};
