import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "simple";
}

// Simple CSS-only spinner component
export function SimpleSpinner({ size = "md", className }: { size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const sizeClasses = {
    sm: "simple-spinner-sm",
    md: "simple-spinner",
    lg: "simple-spinner-lg",
    xl: "simple-spinner-xl"
  };

  return <div className={cn(sizeClasses[size], className)} />;
}

export function LoadingSpinner({ size = "md", className, variant = "default" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  if (variant === "simple") {
    return <SimpleSpinner size={size} className={className} />;
  }

  return (
    <div className={cn("animate-spin text-primary", sizeClasses[size], className)}>
      <svg
        className="h-full w-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

interface GlobalLoadingProps {
  message?: string;
  showSpinner?: boolean;
}

export function GlobalLoading({ 
  message = "Loading...", 
  showSpinner = true 
}: GlobalLoadingProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-6 p-8 rounded-lg bg-card border shadow-lg max-w-sm w-full mx-4">
        {showSpinner && (
          <div className="relative">
            <LoadingSpinner size="xl" className="text-primary" />
          </div>
        )}
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-foreground">{message}</p>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare everything for you
          </p>
        </div>
      </div>
    </div>
  );
}

interface PageLoadingProps {
  message?: string;
  className?: string;
}

export function PageLoading({ 
  message = "Loading...", 
  className 
}: PageLoadingProps) {
  return (
    <div className={cn(
      "flex min-h-[60vh] w-full items-center justify-center p-6",
      className
    )}>
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <LoadingSpinner size="lg" className="text-primary" />
        </div>
        <div className="text-center space-y-3">
          <p className="text-base font-semibold text-foreground">{message}</p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InlineLoadingProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

export function InlineLoading({ 
  size = "sm", 
  message, 
  className 
}: InlineLoadingProps) {
  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <LoadingSpinner size={size} className="text-primary" />
      {message && (
        <span className="text-sm font-medium text-foreground">{message}</span>
      )}
    </div>
  );
}

// Pulse loading alternative if spinner doesn't show
export function PulseLoading({ 
  message = "Loading...", 
  className 
}: { message?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <p className="text-sm font-medium text-foreground">{message}</p>
    </div>
  );
}

// Enhanced Global Loading with fallback
export function EnhancedGlobalLoading({ 
  message = "Loading...", 
  showSpinner = true 
}: GlobalLoadingProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-6 p-8 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl max-w-sm w-full mx-4">
        {showSpinner && (
          <div className="relative flex items-center justify-center">
            {/* Use simple CSS spinner as primary */}
            <SimpleSpinner size="xl" />
          </div>
        )}
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{message}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please wait while we prepare everything for you
          </p>
          {/* Progress dots */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
