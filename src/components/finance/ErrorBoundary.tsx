// components/finance/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleRetry = (): void => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-red-800">
                                Something went wrong
                            </h4>
                            <p className="text-xs text-red-600 mt-1">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={this.handleRetry}
                                className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                            >
                                Retry
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;