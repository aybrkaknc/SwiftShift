import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';

/**
 * ThemeToggle Bileşeni
 * Animasyonlu Güneş/Ay geçişi ile tema değiştirme butonu.
 * Güneş: Aydınlık tema, Ay+Yıldızlar: Karanlık tema
 */
export const ThemeToggle: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [isAnimating, setIsAnimating] = useState(false);

    // İlk yüklemede kayıtlı temayı al
    useEffect(() => {
        StorageService.getTheme().then((savedTheme) => {
            setTheme(savedTheme);
            applyTheme(savedTheme);
        });
    }, []);

    // Temayı uygula
    const applyTheme = (newTheme: 'light' | 'dark') => {
        if (newTheme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    };

    // Tema değiştir
    const toggleTheme = async () => {
        if (isAnimating) return;

        setIsAnimating(true);
        const newTheme = theme === 'dark' ? 'light' : 'dark';

        // Animasyon süresi
        setTimeout(() => {
            setTheme(newTheme);
            applyTheme(newTheme);
            StorageService.setTheme(newTheme);
        }, 150);

        setTimeout(() => {
            setIsAnimating(false);
        }, 500);
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-8 h-8 rounded-full text-muted hover:text-primary hover:bg-primary/10 transition-all overflow-hidden"
            title={theme === 'dark' ? 'Aydınlık Temaya Geç' : 'Karanlık Temaya Geç'}
        >
            {/* Güneş (Light Theme Icon) */}
            <div
                className={`absolute transition-all duration-500 ${theme === 'light' && !isAnimating
                        ? 'theme-icon-enter'
                        : theme === 'dark' || isAnimating
                            ? 'opacity-0 scale-0 rotate-90'
                            : ''
                    }`}
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
            </div>

            {/* Ay + Yıldızlar (Dark Theme Icon) */}
            <div
                className={`absolute transition-all duration-500 ${theme === 'dark' && !isAnimating
                        ? 'theme-icon-enter'
                        : theme === 'light' || isAnimating
                            ? 'opacity-0 scale-0 -rotate-90'
                            : ''
                    }`}
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {/* Yarım Ay */}
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    {/* Yıldızlar */}
                    <circle cx="17" cy="5" r="1" className="star-twinkle fill-current" />
                    <circle cx="20" cy="8" r="0.5" className="star-twinkle star-twinkle-delay-1 fill-current" />
                    <circle cx="15" cy="3" r="0.5" className="star-twinkle star-twinkle-delay-2 fill-current" />
                </svg>
            </div>
        </button>
    );
};

export default ThemeToggle;
