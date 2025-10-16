import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedError } from "@/components/AnimatedError";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero">
          <Card className="max-w-lg w-full">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AnimatedError size={100} className="mx-auto" />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                    <h2 className="text-xl font-bold">Oops! Something went wrong</h2>
                  </div>
                  
                  <p className="text-muted-foreground text-sm">
                    We apologize for the inconvenience. An unexpected error has occurred.
                  </p>
                </div>

                {process.env.NODE_ENV === "development" && this.state.error && (
                  <details className="text-left bg-muted/50 rounded-lg p-4 mt-4">
                    <summary className="cursor-pointer font-medium text-sm mb-2">
                      Error Details
                    </summary>
                    <pre className="text-xs overflow-auto max-h-40 text-destructive">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}

                <div className="flex gap-2 justify-center pt-4">
                  <Button
                    onClick={this.handleReset}
                    variant="outline"
                    size="sm"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={this.handleReload}
                    variant="default"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                    Reload Page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
