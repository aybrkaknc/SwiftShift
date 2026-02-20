import { useState } from 'react';
import { Github, ArrowRight, Check, Copy, ExternalLink, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { StorageService } from '../services/storage';
import { TelegramService } from '../services/telegram';
import { useTranslation } from '../utils/useTranslation';

interface WelcomeProps {
    onComplete?: () => void;
    embedded?: boolean;
}

const Welcome = ({ onComplete, embedded = false }: WelcomeProps) => {
    const { t } = useTranslation();
    const [step, setStep] = useState<'intro' | 'tutorial' | 'name_input' | 'input' | 'success'>('intro');
    const [tutorialStep, setTutorialStep] = useState(1);
    const [token, setToken] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [botName, setBotName] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleConnect = async () => {
        if (!token.includes(':')) {
            alert('Invalid Token Format');
            return;
        }

        setIsConnecting(true);
        const res = await TelegramService.getMe(token);

        if (res.ok) {
            // Attempt to detect Chat ID immediately
            const detectedChatId = await TelegramService.detectUserChatId(token);

            const newProfile = {
                id: res.result.id.toString(),
                name: res.result.first_name,
                displayName: displayName.trim() || 'User',
                username: res.result.username,
                botToken: token,
                chatId: detectedChatId || '',
                targets: [],
                lastSynced: Date.now()
            };

            await StorageService.saveProfile(newProfile);
            chrome.runtime.sendMessage({ type: 'REFRESH_MENU' });
            setBotName(res.result.first_name);
            setStep('success');

            // If chat ID wasn't detected, we might want to prompt the user in the success step
            // But for now, we just save what we have. The dashboard will handle missing IDs.
        } else {
            alert('Connection Failed: Invalid Token');
        }
        setIsConnecting(false);
    };

    return (
        <div className={`${embedded ? 'p-5 pb-8' : 'min-h-screen p-8 justify-center'} bg-background text-foreground flex flex-col items-center relative font-sans`}>

            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Main Content */}
            <div className={`max-w-4xl w-full z-10 flex flex-col items-center ${embedded ? '' : 'justify-center mx-auto'}`}>

                {step === 'intro' ? (
                    <div className={`text-center ${embedded ? 'space-y-6' : 'space-y-8'} animate-fade-in`}>
                        <div className={`${embedded ? 'space-y-3' : 'space-y-4'}`}>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-white/10 text-xs font-medium text-primary tracking-wide uppercase mx-auto">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                {t.welcome.betaBadge}
                            </div>
                            <h1 className={`${embedded ? 'text-4xl' : 'text-5xl md:text-7xl'} font-bold tracking-tight bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent`}>
                                {t.welcome.title}
                            </h1>
                            <p className={`${embedded ? 'text-sm' : 'text-lg md:text-xl'} text-muted max-w-lg mx-auto leading-relaxed whitespace-pre-line`}>
                                {t.welcome.subtitle}
                            </p>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setStep('tutorial')}
                                className="h-12 px-8 rounded-full bg-primary text-background font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all active:scale-95 shadow-[0_0_20px_-5px_rgba(244,171,37,0.4)]"
                            >
                                {t.welcome.getStarted}
                                <ArrowRight size={18} />
                            </button>
                            <a
                                href="https://github.com/ridvan/send-to-telegram"
                                target="_blank"
                                className="h-12 px-8 rounded-full bg-surface border border-white/5 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition-all active:scale-95 icon-link"
                            >
                                <Github size={18} />
                                {t.welcome.sourceCode}
                            </a>
                        </div>
                    </div>
                ) : step === 'tutorial' ? (
                    <div className={`animate-fade-in w-full max-w-2xl mx-auto bg-surface/30 backdrop-blur-md border border-white/10 rounded-3xl ${embedded ? 'p-6' : 'p-8 md:p-10'} shadow-2xl relative overflow-hidden transition-all duration-300`}>
                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 h-1 bg-white/10 w-full">
                            <div
                                className="h-full bg-primary transition-all duration-500 ease-out"
                                style={{ width: `${(tutorialStep / 3) * 100}%` }}
                            />
                        </div>

                        {/* Content Steps */}
                        <div className="min-h-[320px] flex flex-col justify-between">
                            {tutorialStep === 1 && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="space-y-2 text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary mb-2">
                                            <span className="text-xl font-bold">1</span>
                                        </div>
                                        <h2 className={`${embedded ? 'text-xl' : 'text-3xl'} font-bold`}>{t.tutorial.step1.title}</h2>
                                        <p className="text-muted text-sm max-w-md mx-auto">
                                            {t.tutorial.step1.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <a
                                            href="https://t.me/BotFather"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="h-14 bg-[#2AABEE]/10 border border-[#2AABEE]/20 hover:bg-[#2AABEE]/20 rounded-xl flex items-center justify-center gap-3 transition-all group"
                                        >
                                            <ExternalLink size={20} className="text-[#2AABEE] group-hover:scale-110 transition-transform" />
                                            <span className="font-bold text-[#2AABEE]">{t.tutorial.step1.actionOpen}</span>
                                        </a>

                                        <button
                                            onClick={() => handleCopy('/newbot')}
                                            className="h-14 bg-surface border border-white/10 hover:bg-white/5 rounded-xl flex items-center justify-center gap-3 transition-all group relative overflow-hidden"
                                        >
                                            {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} className="text-white/60 group-hover:text-white" />}
                                            <span className="font-bold text-white">{t.tutorial.step1.actionCopy}</span>
                                        </button>
                                    </div>

                                    <div className="bg-black/20 rounded-xl p-4 border border-white/5 text-xs text-muted leading-relaxed">
                                        <p>{t.tutorial.step1.guide}</p>
                                    </div>
                                </div>
                            )}

                            {tutorialStep === 2 && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="space-y-2 text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 mb-2">
                                            <span className="text-xl font-bold">2</span>
                                        </div>
                                        <h2 className={`${embedded ? 'text-xl' : 'text-3xl'} font-bold`}>{t.tutorial.step2.title}</h2>
                                        <p className="text-muted text-sm max-w-md mx-auto">
                                            {t.tutorial.step2.description}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4 bg-surface/50 p-3 rounded-xl border border-white/5">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                                            <p className="text-sm">{t.tutorial.step2.subStep1}</p>
                                        </div>
                                        <div className="flex items-center gap-4 bg-surface/50 p-3 rounded-xl border border-white/5">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                                            <p className="text-sm">{t.tutorial.step2.subStep2}</p>
                                        </div>
                                        <div className="flex items-center gap-4 bg-primary/10 p-3 rounded-xl border border-primary/20">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">!</div>
                                            <p className="text-sm text-primary">{t.tutorial.step2.subStep3}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tutorialStep === 3 && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="space-y-2 text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400 mb-2">
                                            <span className="text-xl font-bold">3</span>
                                        </div>
                                        <h2 className={`${embedded ? 'text-xl' : 'text-3xl'} font-bold`}>{t.tutorial.step3.title}</h2>
                                        <p className="text-muted text-sm max-w-md mx-auto">
                                            {t.tutorial.step3.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-surface/50 p-4 rounded-xl border border-white/10 hover:bg-surface/80 transition-colors">
                                            <div className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">{t.tutorial.step3.recommended}</div>
                                            <h4 className="font-bold text-white mb-2">{t.tutorial.step3.recTitle}</h4>
                                            <p className="text-xs text-muted mb-3 leading-relaxed">
                                                {t.tutorial.step3.recDesc}
                                            </p>
                                            <a href="https://web.telegram.org" target="_blank" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                                                {t.tutorial.step3.openWeb} <ExternalLink size={12} />
                                            </a>
                                        </div>

                                        <div className="bg-surface/50 p-4 rounded-xl border border-white/10 hover:bg-surface/80 transition-colors">
                                            <div className="text-[10px] font-bold text-muted mb-1 uppercase tracking-wider">{t.tutorial.step3.alternative}</div>
                                            <h4 className="font-bold text-white mb-2">{t.tutorial.step3.altTitle}</h4>
                                            <p className="text-xs text-muted leading-relaxed">
                                                {t.tutorial.step3.altDesc}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 justify-center text-[10px] text-muted bg-black/20 py-2 rounded-lg">
                                        <AlertCircle size={12} />
                                        <span>{t.tutorial.step3.hint}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/5">
                            <button
                                onClick={() => {
                                    if (tutorialStep > 1) setTutorialStep(s => s - 1);
                                    else setStep('intro');
                                }}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                            >
                                <ChevronLeft size={16} />
                                {t.tutorial.nav.back}
                            </button>

                            <button
                                onClick={() => {
                                    if (tutorialStep < 3) setTutorialStep(s => s + 1);
                                    else setStep('name_input');
                                }}
                                className="px-6 py-2 rounded-full bg-primary text-background font-bold text-sm flex items-center gap-2 hover:bg-primary-hover transition-all shadow-lg active:scale-95"
                            >
                                {tutorialStep === 3 ? t.tutorial.nav.finish : t.tutorial.nav.continue}
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                ) : step === 'name_input' ? (
                    <div className={`animate-fade-in max-w-md w-full mx-auto bg-surface/30 backdrop-blur-md border border-white/10 rounded-3xl ${embedded ? 'p-6' : 'p-8'} shadow-2xl text-center`}>
                        <h2 className={`${embedded ? 'text-xl' : 'text-2xl'} font-bold mb-2 text-white`}>{t.nameInput.title}</h2>
                        <p className="text-muted text-xs mb-6">{t.nameInput.subtitle}</p>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder={t.nameInput.placeholder}
                                autoFocus
                                className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-lg text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors text-center font-medium"
                                onKeyDown={(e) => e.key === 'Enter' && displayName.trim() && setStep('input')}
                            />

                            <button
                                onClick={() => setStep('input')}
                                disabled={!displayName.trim()}
                                className="w-full h-12 rounded-full bg-primary text-background font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                            >
                                {t.nameInput.continue}
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                ) : step === 'input' ? (
                    <div className={`animate-fade-in max-w-md w-full mx-auto bg-surface/30 backdrop-blur-md border border-white/10 rounded-3xl ${embedded ? 'p-6' : 'p-8'} shadow-2xl`}>
                        <h2 className={`${embedded ? 'text-xl' : 'text-2xl'} font-bold mb-2 text-center text-white`}>{t.connect.title}</h2>
                        <p className="text-muted text-xs text-center mb-6">{t.connect.subtitle}</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-muted uppercase mb-1">{t.connect.label}</label>
                                <input
                                    type="text"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder={t.connect.placeholder}
                                    className="w-full h-10 bg-black/20 border border-white/10 rounded-lg px-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <button
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className="w-full h-10 mt-2 rounded-full bg-primary text-background font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isConnecting ? t.connect.connecting : t.connect.button}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={`animate-fade-in max-w-md w-full mx-auto bg-surface/30 backdrop-blur-md border border-white/10 rounded-3xl ${embedded ? 'p-6' : 'p-8'} shadow-2xl text-center`}>
                        <div className={`${embedded ? 'w-12 h-12 mb-4' : 'w-16 h-16 mb-6'} bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto`}>
                            <Check size={embedded ? 24 : 32} strokeWidth={4} />
                        </div>
                        <h2 className={`${embedded ? 'text-xl' : 'text-2xl'} font-bold mb-2 text-white`}>{t.success.title}</h2>
                        <p className="text-muted text-xs mb-6 leading-relaxed whitespace-pre-line">
                            {t.success.description.replace('{botName}', botName)}
                        </p>
                        <button
                            onClick={() => {
                                if (onComplete) {
                                    onComplete();
                                } else {
                                    window.close();
                                }
                            }}
                            className="w-full h-12 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
                        >
                            {embedded ? t.success.buttonEmbedded : t.success.buttonStandalone}
                        </button>
                    </div>
                )}

            </div>

            <style>{`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`}</style>
        </div>
    );
};

export default Welcome;
