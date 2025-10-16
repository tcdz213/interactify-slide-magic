import { toast } from "@/hooks/use-toast"

interface ErrorEntry {
  key: string
  timestamp: number
}

class ErrorHandler {
  private recentErrors: Map<string, ErrorEntry> = new Map()
  private readonly DUPLICATE_THRESHOLD = 5000 // 5 seconds
  private readonly MAX_STORED_ERRORS = 20

  /**
   * Check if an error was recently shown
   */
  private isDuplicate(errorKey: string): boolean {
    const existing = this.recentErrors.get(errorKey)
    if (!existing) return false

    const now = Date.now()
    const timeSinceLastError = now - existing.timestamp

    // If error was shown within threshold, it's a duplicate
    return timeSinceLastError < this.DUPLICATE_THRESHOLD
  }

  /**
   * Record that an error was shown
   */
  private recordError(errorKey: string): void {
    const now = Date.now()
    
    // Clean up old errors
    if (this.recentErrors.size >= this.MAX_STORED_ERRORS) {
      const oldestKey = Array.from(this.recentErrors.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0]
      this.recentErrors.delete(oldestKey)
    }

    this.recentErrors.set(errorKey, { key: errorKey, timestamp: now })
  }

  /**
   * Create a unique key for an error
   */
  private createErrorKey(type: string, message: string): string {
    return `${type}:${message.substring(0, 50)}`
  }

  /**
   * Show a network error toast (deduplicated)
   */
  showNetworkError(context: string, error?: Error | unknown): void {
    const errorKey = this.createErrorKey('network', context)
    
    if (this.isDuplicate(errorKey)) {
      console.debug(`⚠️ Duplicate error suppressed: ${context}`)
      return
    }

    this.recordError(errorKey)
    
    toast({
      title: "Connection Error",
      description: "Unable to connect to server. Please check your connection.",
      variant: "destructive"
    })

    console.error(`Network error [${context}]:`, error)
  }

  /**
   * Show a generic API error toast (deduplicated)
   */
  showApiError(context: string, message?: string, error?: Error | unknown): void {
    const errorMessage = message || "Something went wrong. Please try again."
    const errorKey = this.createErrorKey('api', `${context}:${errorMessage}`)
    
    if (this.isDuplicate(errorKey)) {
      console.debug(`⚠️ Duplicate error suppressed: ${context}`)
      return
    }

    this.recordError(errorKey)
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive"
    })

    console.error(`API error [${context}]:`, error || message)
  }

  /**
   * Show a validation error toast (deduplicated)
   */
  showValidationError(message: string): void {
    const errorKey = this.createErrorKey('validation', message)
    
    if (this.isDuplicate(errorKey)) {
      console.debug(`⚠️ Duplicate validation error suppressed`)
      return
    }

    this.recordError(errorKey)
    
    toast({
      title: "Validation Error",
      description: message,
      variant: "destructive"
    })
  }

  /**
   * Show a success message (deduplicated)
   */
  showSuccess(message: string, title: string = "Success"): void {
    const key = this.createErrorKey('success', message)
    
    if (this.isDuplicate(key)) {
      console.debug(`⚠️ Duplicate success message suppressed`)
      return
    }

    this.recordError(key)
    
    toast({
      title,
      description: message,
      variant: "success"
    })
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
   * Clear all stored errors (useful for testing or manual reset)
   */
  clearErrors(): void {
    this.recentErrors.clear()
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler()
