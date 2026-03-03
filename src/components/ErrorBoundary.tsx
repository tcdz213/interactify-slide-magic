import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Phase 4 — Error boundary pour capturer les erreurs de rendu et afficher un message clair.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[200px] flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-foreground mb-1">Une erreur s'est produite</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error.message || "Erreur inattendue. Rechargez la page ou contactez le support."}
            </p>
            <Button
              variant="outline"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Réessayer
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
