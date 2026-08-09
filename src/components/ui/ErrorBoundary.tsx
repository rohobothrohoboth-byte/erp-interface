import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center max-w-2xl mx-auto my-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
                    <p className="text-red-600 text-sm mb-4">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    {this.state.errorInfo && (
                        <details className="text-left text-xs text-gray-600 mt-2 p-3 bg-red-100 rounded-lg max-h-60 overflow-auto">
                            <summary className="cursor-pointer font-medium">Error details</summary>
                            <pre className="mt-2 whitespace-pre-wrap break-words">
                {this.state.error?.stack}
                                {'\n\n'}
                                {this.state.errorInfo.componentStack}
              </pre>
                        </details>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                    >
                        Reload page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;