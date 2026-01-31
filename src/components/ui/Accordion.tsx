import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface AccordionProps {
    title: string;
    children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-white/5 rounded-xl bg-surface/30 overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 text-sm text-gray-300 hover:text-primary transition-colors hover:bg-white/5"
            >
                <div className="flex items-center gap-2">
                    <HelpCircle size={16} className="text-primary" />
                    <span className="font-medium">{title}</span>
                </div>
                <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-muted'}`}
                />
            </button>

            <div
                className={`transition-all duration-300 ease-in-out text-xs text-gray-400 bg-background/50 ${isOpen ? 'max-h-96 opacity-100 p-3 border-t border-white/5' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
            >
                {children}
            </div>
        </div>
    );
};
