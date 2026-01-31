import { useState } from 'react';
import { Github, ArrowRight, Check, ExternalLink } from 'lucide-react';
import { StorageService } from '../services/storage';
import { TelegramService } from '../services/telegram';

const Welcome = () => {
    const [step, setStep] = useState<'intro' | 'tutorial' | 'input' | 'success'>('intro');
    const [token, setToken] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [botName, setBotName] = useState('');

    const handleConnect = async () => {
        if (!token.includes(':')) {
            alert('Invalid Token Format');
            return;
        }

        setIsConnecting(true);
        const res = await TelegramService.getMe(token);

        if (res.ok) {
            const newProfile = {
                id: res.result.id.toString(),
                name: res.result.first_name,
                username: res.result.username,
                botToken: token,
                chatId: '', // Will be detected later
                targets: [],
                lastSynced: Date.now()
            };

            await StorageService.saveProfile(newProfile);
            // Refresh context menu as profile is now active
            chrome.runtime.sendMessage({ type: 'REFRESH_MENU' });
            setBotName(res.result.first_name);
            setStep('success');
        } else {
            alert('Connection Failed: Invalid Token');
        }
        setIsConnecting(false);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 relative overflow-hidden">

            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Main Content */}
            <div className="max-w-4xl w-full z-10">

                {step === 'intro' ? (
                    <div className="text-center space-y-8 animate-fade-in">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-white/10 text-xs font-medium text-primary tracking-wide uppercase mx-auto">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                v0.1.0 Beta Released
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent">
                                SwiftShift
                            </h1>
                            <p className="text-lg md:text-xl text-muted max-w-lg mx-auto leading-relaxed">
                                Zero-friction content transfer to Telegram. <br />
                                Connect your bot, select destinations, and start shifting.
                            </p>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setStep('tutorial')}
                                className="h-12 px-8 rounded-xl bg-primary text-background font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all active:scale-95 shadow-[0_0_20px_-5px_rgba(244,171,37,0.4)]"
                            >
                                Get Started
                                <ArrowRight size={18} />
                            </button>
                            <a
                                href="https://github.com/ridvan/send-to-telegram"
                                target="_blank"
                                className="h-12 px-8 rounded-xl bg-surface border border-white/5 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition-all active:scale-95 icon-link"
                            >
                                <Github size={18} />
                                Source Code
                            </a>
                        </div>
                    </div>
                ) : step === 'tutorial' ? (
                    <div className="animate-fade-in max-w-2xl mx-auto bg-surface/30 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                        <h2 className="text-3xl font-bold mb-6 text-center">Setup Your Bot</h2>

                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center font-bold flex-shrink-0">1</div>
                                <div className="space-y-2 flex-1">
                                    <h3 className="font-bold text-lg">Create a Bot</h3>
                                    <p className="text-muted text-sm">Open Telegram and search for <strong className="text-white">@BotFather</strong>. Send command <code className="bg-white/10 px-1.5 py-0.5 rounded text-primary">/newbot</code>.</p>
                                    <a href="https://t.me/BotFather" target="_blank" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                                        Open BotFather <ExternalLink size={10} />
                                    </a>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center font-bold flex-shrink-0">2</div>
                                <div className="space-y-2 flex-1">
                                    <h3 className="font-bold text-lg">Get Token</h3>
                                    <p className="text-muted text-sm">Copy the API Token given by BotFather.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center font-bold flex-shrink-0">3</div>
                                <div className="space-y-2 flex-1">
                                    <h3 className="font-bold text-lg">Add to Chats</h3>
                                    <p className="text-muted text-sm">Add your new bot to your Channels or Groups as an <strong>Administrator</strong>.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center font-bold flex-shrink-0">4</div>
                                <div className="space-y-2 flex-1">
                                    <h3 className="font-bold text-lg">Get Chat ID</h3>
                                    <p className="text-muted text-sm">
                                        You need the <strong>Chat ID</strong> (e.g., -100123...) to add it to SwiftShift.
                                        You can use bots like <a href="https://t.me/username_to_id_bot" target="_blank" className="text-white underline">@username_to_id_bot</a> or look at the URL in Telegram Web.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-white/5 text-center">
                            <button
                                onClick={() => setStep('input')}
                                className="w-full h-12 rounded-xl bg-primary text-background font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all active:scale-95"
                            >
                                <Check size={18} />
                                I'm Ready
                            </button>
                        </div>
                    </div>
                ) : step === 'input' ? (
                    <div className="animate-fade-in max-w-md mx-auto bg-surface/30 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-2 text-center text-white">Connect Bot</h2>
                        <p className="text-muted text-sm text-center mb-6">Enter your bot token to finish setup.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase mb-1">Bot Token</label>
                                <input
                                    type="text"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="123456:ABC-DEF1234ghIkl..."
                                    className="w-full h-10 bg-black/20 border border-white/10 rounded-lg px-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <button
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className="w-full h-10 mt-2 rounded-xl bg-primary text-background font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isConnecting ? 'Adjusting Gravity...' : 'Connect'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in max-w-md mx-auto bg-surface/30 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
                        <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check size={32} strokeWidth={4} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-white">You're Ready!</h2>
                        <p className="text-muted text-sm mb-6">
                            Connected as <strong className="text-primary">{botName}</strong>.
                            <br />
                            You can now close this page and start shifting.
                        </p>
                        <button
                            onClick={() => window.close()}
                            className="w-full h-12 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
                        >
                            Close Setup
                        </button>
                    </div>
                )}

            </div>

            <style>{`
    .animate - fade -in { animation: fadeIn 0.5s ease- out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`}</style>
        </div>
    );
};

export default Welcome;
