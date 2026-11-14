"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary caught error in [${this.props.sectionName || "Component"}]:`, error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full my-6 p-6 sm:p-8 rounded-2xl bg-lilac/50 border border-lilac-border text-center space-y-3 font-sans">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-text-dark">
              Ritual Component Temporarily Paused
            </h4>
            <p className="text-xs text-text-gray max-w-md mx-auto mt-1 leading-relaxed">
              This {this.props.sectionName || "section"} encountered an unexpected render variation. The rest of your beauty experience remains unaffected.
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Ritual</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
