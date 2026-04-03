"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  title: string;
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Section crashed:", this.props.title, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <section aria-live="polite" style={{ width: "min(1200px, 92vw)", margin: "2rem auto", padding: "1rem", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", background: "rgba(255,255,255,0.03)" }}>
          <h3 style={{ marginTop: 0 }}>{this.props.title} is temporarily unavailable.</h3>
          <p style={{ marginBottom: "1rem", color: "rgba(255,255,255,0.8)" }}>Please try again. If this persists, refresh the page.</p>
          <button type="button" onClick={this.handleRetry} style={{ border: "1px solid rgba(255,255,255,0.35)", borderRadius: "8px", padding: "0.5rem 0.85rem", background: "transparent", color: "inherit", cursor: "pointer" }}>
            Retry section
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
