/**
 * ErrorBoundary
 * React Error Boundary bileşeni.
 * Alt bileşenlerde oluşan hataları yakalar ve kullanıcı dostu bir mesaj gösterir.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ErrorService, AppError, ErrorCodes } from '../services/errorService';

interface Props {
    /** Alt bileşenler */
    children: ReactNode;
    /** Özel fallback bileşeni (opsiyonel) */
    fallback?: ReactNode;
    /** Hata oluştuğunda çağrılacak callback (opsiyonel) */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary
 * @example
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    /**
     * Hata oluştuğunda state'i günceller
     */
    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    /**
     * Hata yakalandığında çağrılır
     */
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo });

        // ErrorService ile logla
        const appError = new AppError(
            error.message,
            ErrorCodes.UNKNOWN_ERROR,
            {
                componentStack: errorInfo.componentStack,
                name: error.name
            }
        );
        ErrorService.log(appError, 'ErrorBoundary');

        // Callback varsa çağır
        this.props.onError?.(error, errorInfo);
    }

    /**
     * Bileşeni sıfırlar ve yeniden render eder
     */
    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    /**
     * Sayfayı yeniden yükler
     */
    handleReload = (): void => {
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Özel fallback varsa kullan
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Varsayılan hata UI'ı
            return (
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center max-w-xs space-y-4">
                        {/* Hata İkonu */}
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-danger/10 flex items-center justify-center">
                            <AlertTriangle size={32} className="text-danger" />
                        </div>

                        {/* Başlık ve Mesaj */}
                        <div className="space-y-2">
                            <h2 className="text-lg font-bold text-white">Something went wrong</h2>
                            <p className="text-xs text-muted leading-relaxed">
                                An unexpected error occurred. Please try again or reload the extension.
                            </p>
                        </div>

                        {/* Hata Detayı (Geliştirici Modu) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-surface/50 rounded-xl p-3 text-left border border-white/5">
                                <p className="text-[10px] text-danger font-mono break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        {/* Aksiyonlar */}
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                                onClick={this.handleReset}
                                className="px-4 py-2 bg-surface/50 text-white text-xs font-bold rounded-full border border-white/10 hover:bg-surface transition-all"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="px-4 py-2 bg-primary text-background text-xs font-bold rounded-full hover:bg-primary-hover transition-all flex items-center gap-2"
                            >
                                <RefreshCw size={12} />
                                Reload
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Hook-based error boundary wrapper (functional components için)
 */
export const withErrorBoundary = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
): React.FC<P> => {
    const WithErrorBoundary: React.FC<P> = (props) => (
        <ErrorBoundary fallback={fallback}>
            <WrappedComponent {...props} />
        </ErrorBoundary>
    );

    WithErrorBoundary.displayName = `WithErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

    return WithErrorBoundary;
};
