/**
 * UI Utilities
 * Ortak kullanılan yardımcı fonksiyonlar.
 */

import React from 'react';
import { Image, Link2, FileText, Music, MapPin, CheckCircle, XCircle, Info } from 'lucide-react';

/**
 * İçerik tipi
 */
export type ContentType = 'text' | 'link' | 'image' | 'file' | 'audio' | 'location';

/**
 * Log tipi
 */
export type LogType = 'error' | 'success' | 'info';

/**
 * Timestamp'i okunabilir formata çevirir
 * @param timestamp - Unix timestamp (ms)
 * @returns Formatlanmış zaman string'i (örn: "5m", "2h", "3d")
 * @example
 * formatTime(Date.now() - 60000) // "1m"
 * formatTime(Date.now() - 3600000) // "1h"
 */
export const formatTime = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
};

/**
 * İçerik tipine göre ikon döndürür
 * @param type - İçerik tipi
 * @returns React ikon elementi
 */
export const getContentIcon = (type: ContentType): React.ReactNode => {
    switch (type) {
        case 'image': return <Image size={14} className="text-primary" />;
        case 'link': return <Link2 size={14} className="text-blue-400" />;
        case 'file': return <FileText size={14} className="text-amber-400" />;
        case 'audio': return <Music size={14} className="text-purple-400" />;
        case 'location': return <MapPin size={14} className="text-emerald-400" />;
        default: return <FileText size={14} className="text-muted" />;
    }
};

/**
 * Log tipine göre ikon döndürür
 * @param type - Log tipi
 * @returns React ikon elementi
 */
export const getLogIcon = (type: LogType): React.ReactNode => {
    switch (type) {
        case 'error': return <XCircle size={14} className="text-danger" />;
        case 'success': return <CheckCircle size={14} className="text-primary" />;
        default: return <Info size={14} className="text-muted" />;
    }
};

/**
 * Metni belirtilen uzunlukta keser
 * @param text - Kesilecek metin
 * @param maxLength - Maksimum uzunluk
 * @returns Kesilmiş metin
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Dosya adını URL'den çıkarır
 * @param url - URL veya dosya yolu
 * @returns Dosya adı
 */
export const getFileName = (url: string): string => {
    return url.split('/').pop() || 'Unknown File';
};
