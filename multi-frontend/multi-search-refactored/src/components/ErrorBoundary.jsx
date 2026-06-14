import { Component } from "react";

/**
 * Catches runtime errors in the component tree below it and renders
 * a graceful fallback instead of crashing the entire page.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message ?? "Unknown error" };
  }

  componentDidCatch(error, info) {
    // In production this would forward to Sentry / Datadog
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => this.setState({ hasError: false, message: "" });

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-500 mb-6 max-w-md">{this.state.message}</p>
          <button
            onClick={this.handleReset}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
