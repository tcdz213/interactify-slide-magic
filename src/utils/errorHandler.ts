/**
 * Centralized error handler - uses inline errors for better UX
 * No popups or toasts - errors are shown contextually
 */
class ErrorHandler {
  private errorCallbacks: Map<string, (message: string, title?: string) => void> = new Map()

  /**
   * Register a callback for a specific context
   */
  registerErrorCallback(context: string, callback: (message: string, title?: string) => void): void {
    this.errorCallbacks.set(context, callback)
  }

  /**
   * Unregister a callback
   */
  unregisterErrorCallback(context: string): void {
    this.errorCallbacks.delete(context)
  }

  /**
   * Show network error inline
   */
  showNetworkError(context: string, error?: Error | unknown): void {
    this.logError(context, error)
    
    const callback = this.errorCallbacks.get(context)
    if (callback) {
      callback(
        "Unable to connect to server. Please check your connection.",
        "Connection Error"
      )
    }
  }

  /**
   * Show API error inline
   */
  showApiError(context: string, message?: string, error?: Error | unknown): void {
    this.logError(context, error)
    
    const callback = this.errorCallbacks.get(context)
    if (callback) {
      callback(
        message || "Something went wrong. Please try again.",
        "Error"
      )
    }
  }

  /**
   * Show validation error inline
   */
  showValidationError(context: string, message: string): void {
    const callback = this.errorCallbacks.get(context)
    if (callback) {
      callback(message, "Validation Error")
    }
  }

  /**
   * Show success message (console only)
   */
  showSuccess(message: string, title: string = "Success"): void {
    console.log(`✓ ${title}: ${message}`)
  }

  /**
   * Log error silently without showing toast
   */
  logError(context: string, error: Error | unknown): void {
    console.error(`[${context}]`, error)
  }

  /**
   * Check if an error is a network error
   */
  isNetworkError(error: Error | unknown): boolean {
    if (error instanceof TypeError) {
      return error.message.includes('fetch') || error.message.includes('network')
    }
    return false
  }

  /**
   * Clear all registered callbacks
   */
  clearErrors(): void {
    this.errorCallbacks.clear()
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler()
