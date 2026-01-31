/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./popup.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: '#0B1121', // Deep Navy
                surface: '#15203B',    // Lighter Navy (Cards/Inputs)
                border: '#1E293B',     // Border color

                primary: '#f4ab25',    // Stitch Amber
                'primary-hover': '#e09a1e',

                text: '#E2E8F0',       // Light Grey
                muted: '#94A3B8',      // Muted Text

                success: '#0df259',    // Stitch Green (Toast)
                danger: '#EF4444',
            },
            fontFamily: {
                sans: ['"Space Grotesk"', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 15px -3px rgba(244, 171, 37, 0.3)',
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-in-out',
                'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'spring-in': 'springSlideIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                'progress': 'progressShrink 4000ms linear forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                springSlideIn: {
                    '0%': { transform: 'translateX(100%) scale(0.9)', opacity: '0' },
                    '60%': { transform: 'translateX(-5%) scale(1.02)', opacity: '1' },
                    '80%': { transform: 'translateX(2%) scale(0.98)' },
                    '100%': { transform: 'translateX(0) scale(1)' },
                },
                progressShrink: {
                    'from': { width: '100%' },
                    'to': { width: '0%' },
                }
            }
        },
    },
    plugins: [],
}
