import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  failed: boolean;
}

/**
 * Safety net: if any part of the page crashes while rendering, show a friendly message
 * with a reload button instead of a blank screen. Technical details are never shown to
 * visitors; during development they still appear in the browser console.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="crash" role="alert">
        <div className="crash__card glass">
          <img src="/images/logo.webp" alt="Cutesify Hair Company" width={88} height={88} />
          <h1>Something went wrong</h1>
          <p>Sorry, this page hit a problem. Reloading usually fixes it, and your bag will still be saved.</p>
          <button className="btn btn--primary btn--lg" onClick={() => window.location.reload()}>
            Reload the page
          </button>
        </div>
      </div>
    );
  }
}
