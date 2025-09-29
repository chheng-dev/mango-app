export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface ToastOptions {
  type: ToastType;
  message: string;
  duration?: number;
  title?: string;
  position?: ToastPosition;
  persistent?: boolean; // Won't auto-dismiss
  icon?: string | null; // Custom icon or null to hide
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'secondary';
  };
  onClose?: () => void;
  richContent?: boolean; // Allow HTML content
}

declare global {
  interface Window {
    removeToast?: (element: HTMLElement) => void;
  }
}


const toastIcons = {
  success: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>`,
  error: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>`,
  info: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>`,
  warning: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
  </svg>`,
  loading: `<svg class="h-5 w-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
  </svg>`
};

const toastStyles = {
  success: {
    bg: 'bg-white dark:bg-gray-800',
    border: 'border-l-4 border-green-500',
    shadow: 'shadow-lg shadow-green-500/10',
    iconBg: 'bg-green-50 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  error: {
    bg: 'bg-white dark:bg-gray-800', 
    border: 'border-l-4 border-red-500',
    shadow: 'shadow-lg shadow-red-500/10',
    iconBg: 'bg-red-50 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400'
  },
  info: {
    bg: 'bg-white dark:bg-gray-800',
    border: 'border-l-4 border-blue-500', 
    shadow: 'shadow-lg shadow-blue-500/10',
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  warning: {
    bg: 'bg-white dark:bg-gray-800',
    border: 'border-l-4 border-amber-500',
    shadow: 'shadow-lg shadow-amber-500/10', 
    iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
  loading: {
    bg: 'bg-white dark:bg-gray-800',
    border: 'border-l-4 border-indigo-500',
    shadow: 'shadow-lg shadow-indigo-500/10',
    iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400'
  }
};

const positionClasses = {
  'top-right': 'top-4 right-4 flex-col',
  'top-left': 'top-4 left-4 flex-col',
  'bottom-right': 'bottom-4 right-4 flex-col-reverse',
  'bottom-left': 'bottom-4 left-4 flex-col-reverse',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2 flex-col',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2 flex-col-reverse'
};

const toastContainers: Map<ToastPosition, HTMLElement> = new Map();
let toastCount = 0;

function createToastContainer(position: ToastPosition = 'top-right') {
  if (!toastContainers.has(position)) {
    const container = document.createElement('div');
    container.className = `toast-container fixed ${positionClasses[position]} z-50 flex gap-2 pointer-events-none`;
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-label', 'Notifications');
    container.setAttribute('data-position', position);
    document.body.appendChild(container);
    toastContainers.set(position, container);
  }
  return toastContainers.get(position)!;
}

function cleanupContainer(position: ToastPosition) {
  const container = toastContainers.get(position);
  if (container && container.children.length === 0) {
    container.remove();
    toastContainers.delete(position);
  }
}

export function showToast({ 
  type, 
  message, 
  duration = 4000, 
  title, 
  action, 
  position = 'top-right',
  persistent = false,
  icon,
  onClose,
  richContent = false
}: ToastOptions) {
  const container = createToastContainer(position);
  const toastId = ++toastCount;
  const styles = toastStyles[type];
  
  // Override duration for persistent toasts
  const finalDuration = persistent ? Infinity : (type === 'error' ? 6000 : duration);
   
  const notification = document.createElement('div');
  notification.className = `
    toast-notification pointer-events-auto transform transition-all duration-300 ease-out
    ${styles.bg} ${styles.border} ${styles.shadow} 
    rounded-xl p-4 min-w-[320px] max-w-[480px] backdrop-blur-md border border-gray-200/80 dark:border-gray-700/80
    animate-in ${getSlideDirection(position)} fade-in duration-300
    hover:scale-[1.02] hover:shadow-2xl hover:backdrop-blur-lg
    shadow-2xl shadow-black/10 dark:shadow-black/30
  `.replace(/\s+/g, ' ').trim();
  
  notification.setAttribute('role', 'alert');
  notification.setAttribute('data-toast-id', toastId.toString());
  notification.setAttribute('data-toast-type', type);
  
  const titleHtml = title ? `
    <div class="font-semibold text-gray-900 dark:text-gray-100 mb-1 pr-8">${title}</div>
  ` : '';
  
  const iconHtml = icon !== null ? `
    <div class="${styles.iconBg} ${styles.iconColor} p-2 rounded-lg flex-shrink-0 relative">
      ${icon || toastIcons[type]}
      ${type === 'loading' ? '<div class="absolute inset-0 rounded-lg animate-pulse bg-current opacity-20"></div>' : ''}
    </div>
  ` : '';
  
  const actionVariantClasses = {
    default: 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600',
    primary: 'text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
    secondary: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50'
  };
  
  const actionHtml = action ? `
    <button 
      class="toast-action inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md
             ${actionVariantClasses[action.variant || 'default']} 
             transition-all duration-200 ml-3 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      onclick="(() => { (${action.onClick.toString()})(); })()"
    >
      ${action.label}
    </button>
  ` : '';
  
  const messageContent = richContent ? message : escapeHtml(message);
  
  notification.innerHTML = `
    <div class="flex items-start gap-3">
      ${iconHtml}
      <div class="flex-1 min-w-0">
        ${titleHtml}
        <div class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pr-8">
          ${messageContent}
        </div>
        ${action ? `<div class="mt-3 flex items-center">${actionHtml}</div>` : ''}
      </div>
      <button 
        class="toast-close flex-shrink-0 p-1.5 rounded-md text-gray-400 hover:text-gray-600 
               dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 
               transition-all duration-200 -mr-1 -mt-1 hover:scale-110 focus:ring-2 focus:ring-gray-400 focus:outline-none"
        onclick="window.removeToast && window.removeToast(this.closest('.toast-notification'))"
        aria-label="Close notification"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    
    <!-- Enhanced Progress bar -->
    ${!persistent ? `
      <div class="absolute bottom-0 left-0 h-1 overflow-hidden rounded-b-xl">
        <div class="h-full bg-gradient-to-r ${getProgressBarColor(type)} rounded-b-xl
                    toast-progress animate-[progress_${finalDuration}ms_linear_forwards] shadow-sm"></div>
      </div>
    ` : ''}
  `;
  
  container.appendChild(notification);
  
  if (!window.removeToast) {
    window.removeToast = (element: HTMLElement) => {
      if (element && element.parentElement) {
        const container = element.parentElement;
        const position = container.getAttribute('data-position') as ToastPosition;
        
        element.style.animation = `${getSlideOutDirection(position)} 0.3s ease-in forwards, fade-out 0.3s ease-in forwards`;
        setTimeout(() => {
          if (element.parentElement) {
            element.remove();
            onClose?.();
          }
          cleanupContainer(position);
        }, 300);
      }
    };
  }
  
  let timeoutId: NodeJS.Timeout | null = null;
  if (!persistent) {
    timeoutId = setTimeout(() => {
      window.removeToast?.(notification);
    }, finalDuration);
  }
  
  // Enhanced interaction handling
  notification.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('.toast-close')) {
      if (timeoutId) clearTimeout(timeoutId);
    }
  });
  
  notification.addEventListener('mouseenter', () => {
    const progressBar = notification.querySelector('.toast-progress') as HTMLElement;
    if (progressBar) {
      progressBar.style.animationPlayState = 'paused';
    }
  });
  
  notification.addEventListener('mouseleave', () => {
    const progressBar = notification.querySelector('.toast-progress') as HTMLElement;
    if (progressBar) {
      progressBar.style.animationPlayState = 'running';
    }
  });
  
  return {
    id: toastId,
    element: notification,
    remove: () => window.removeToast?.(notification),
    updateContent: (newMessage: string, newTitle?: string) => {
      const messageEl = notification.querySelector('.text-gray-700');
      const titleEl = notification.querySelector('.font-semibold');
      if (messageEl) messageEl.textContent = newMessage;
      if (titleEl && newTitle) titleEl.textContent = newTitle;
    }
  };
}

function getProgressBarColor(type: ToastType): string {
  switch (type) {
    case 'success': return 'from-green-500 to-green-400';
    case 'error': return 'from-red-500 to-red-400';
    case 'info': return 'from-blue-500 to-blue-400';
    case 'warning': return 'from-amber-500 to-amber-400';
    case 'loading': return 'from-indigo-500 to-indigo-400';
    default: return 'from-gray-500 to-gray-400';
  }
}

function getSlideDirection(position: ToastPosition): string {
  switch (position) {
    case 'top-right':
    case 'bottom-right':
      return 'slide-in-from-right-full';
    case 'top-left':
    case 'bottom-left':
      return 'slide-in-from-left-full';
    case 'top-center':
      return 'slide-in-from-top-full';
    case 'bottom-center':
      return 'slide-in-from-bottom-full';
    default:
      return 'slide-in-from-right-full';
  }
}

function getSlideOutDirection(position: ToastPosition): string {
  switch (position) {
    case 'top-right':
    case 'bottom-right':
      return 'slide-out-to-right-full';
    case 'top-left':
    case 'bottom-left':
      return 'slide-out-to-left-full';
    case 'top-center':
      return 'slide-out-to-top-full';
    case 'bottom-center':
      return 'slide-out-to-bottom-full';
    default:
      return 'slide-out-to-right-full';
  }
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Enhanced convenience methods with advanced options
export const toast = {
  success: (message: string, options?: Partial<ToastOptions>) => 
    showToast({ type: 'success', message, ...options }),
  
  error: (message: string, options?: Partial<ToastOptions>) => 
    showToast({ type: 'error', message, duration: 6000, ...options }),
  
  info: (message: string, options?: Partial<ToastOptions>) => 
    showToast({ type: 'info', message, ...options }),
  
  warning: (message: string, options?: Partial<ToastOptions>) => 
    showToast({ type: 'warning', message, duration: 5000, ...options }),

  loading: (message: string, options?: Partial<ToastOptions>) => 
    showToast({ type: 'loading', message, persistent: true, ...options }),
  
  // Advanced toast methods
  promise: <T>(
    promise: Promise<T>,
    {
      loading = 'Loading...',
      success = 'Success!',
      error = 'Something went wrong!',
      position = 'top-right'
    }: {
      loading?: string;
      success?: string | ((data: T) => string);
      error?: string | ((error: Error) => string);
      position?: ToastPosition;
    } = {}
  ) => {
    const loadingToast = showToast({
      type: 'loading',
      message: loading,
      persistent: true,
      position
    });

    return promise
      .then((data) => {
        loadingToast.remove();
        const successMessage = typeof success === 'function' ? success(data) : success;
        showToast({ type: 'success', message: successMessage, position });
        return data;
      })
      .catch((err) => {
        loadingToast.remove();
        const errorMessage = typeof error === 'function' ? error(err) : error;
        showToast({ type: 'error', message: errorMessage, duration: 6000, position });
        throw err;
      });
  },

  // Custom toast with full control
  custom: (options: ToastOptions) => showToast(options),

  // Bulk operations
  dismissAll: () => {
    const toasts = document.querySelectorAll('.toast-notification');
    toasts.forEach((toast) => window.removeToast?.(toast as HTMLElement));
  },

  dismissByType: (type: ToastType) => {
    const toasts = document.querySelectorAll(`[data-toast-type="${type}"]`);
    toasts.forEach((toast) => window.removeToast?.(toast as HTMLElement));
  },
  
  // Specialized notifications
  confirm: (message: string, options?: {
    title?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    position?: ToastPosition;
  }) => {
    return showToast({
      type: 'warning',
      message,
      title: options?.title || 'Confirm Action',
      persistent: true,
      position: options?.position,
      action: {
        label: options?.confirmLabel || 'Confirm',
        onClick: () => {
          options?.onConfirm?.();
          toast.dismiss();
        },
        variant: 'primary'
      }
    });
  },

  update: (toastId: number, updates: Partial<Pick<ToastOptions, 'message' | 'title' | 'type'>>) => {
    const element = document.querySelector(`[data-toast-id="${toastId}"]`);
    if (element) {
      // Update content
      const messageEl = element.querySelector('.text-gray-700');
      const titleEl = element.querySelector('.font-semibold');
      
      if (updates.message && messageEl) {
        messageEl.textContent = updates.message;
      }
      
      if (updates.title && titleEl) {
        titleEl.textContent = updates.title;
      }
      
      // Update styling if type changed
      if (updates.type) {
        element.setAttribute('data-toast-type', updates.type);
        // Additional styling updates could be implemented here
      }
    }
  },

  // Utility methods
  dismiss: (toastId?: number) => {
    if (toastId) {
      const toast = document.querySelector(`[data-toast-id="${toastId}"]`);
      if (toast) {
        window.removeToast?.(toast as HTMLElement);
      }
    } else {
      toast.dismissAll();
    }
  },

  // Configuration
  config: {
    defaultPosition: 'top-right' as ToastPosition,
    maxToasts: 5,
    setDefaults: (defaults: Partial<ToastOptions>) => {
      Object.assign(toast.config, defaults);
    }
  }
};

// Enhanced CSS animations and styles
if (typeof document !== 'undefined' && !document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }
    
    /* Slide animations for all positions */
    @keyframes slide-in-from-right-full {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slide-out-to-right-full {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes slide-in-from-left-full {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slide-out-to-left-full {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(-100%); opacity: 0; }
    }
    
    @keyframes slide-in-from-top-full {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slide-out-to-top-full {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(-100%); opacity: 0; }
    }
    
    @keyframes slide-in-from-bottom-full {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slide-out-to-bottom-full {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(100%); opacity: 0; }
    }
    
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fade-out {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    
    /* Container styles */
    .toast-container {
      max-height: calc(100vh - 2rem);
      overflow: visible;
      transition: all 0.3s ease;
    }
    
    .toast-notification {
      will-change: transform, opacity;
      box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.15),
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04),
        0 0 0 1px rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(12px) saturate(180%);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
    }
    
    .toast-notification:hover {
      box-shadow: 
        0 35px 60px -12px rgba(0, 0, 0, 0.2),
        0 25px 35px -5px rgba(0, 0, 0, 0.15),
        0 15px 15px -5px rgba(0, 0, 0, 0.08),
        0 0 0 1px rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(16px) saturate(200%);
      -webkit-backdrop-filter: blur(16px) saturate(200%);
    }
    
    .toast-notification:hover .toast-progress {
      animation-play-state: paused;
    }
    
    /* Focus styles for accessibility */
    .toast-close:focus-visible,
    .toast-action:focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
    
    /* Loading animation */
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    /* Progress bar enhancements */
    .toast-progress {
      background: linear-gradient(90deg, currentColor, rgba(255,255,255,0.8));
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    /* Responsive design */
    @media (max-width: 640px) {
      .toast-container {
        left: 1rem !important;
        right: 1rem !important;
        top: 1rem !important;
        transform: none !important;
      }
      
      .toast-container[data-position*="bottom"] {
        bottom: 1rem !important;
        top: auto !important;
      }
      
      .toast-notification {
        min-width: auto;
        max-width: none;
        width: 100%;
      }
    }
    
    /* Dark mode enhancements */
    @media (prefers-color-scheme: dark) {
      .toast-notification {
        box-shadow: 
          0 25px 50px -12px rgba(0, 0, 0, 0.4),
          0 20px 25px -5px rgba(0, 0, 0, 0.3),
          0 10px 10px -5px rgba(0, 0, 0, 0.2),
          0 0 0 1px rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px) saturate(180%) brightness(110%);
        -webkit-backdrop-filter: blur(12px) saturate(180%) brightness(110%);
      }
      
      .toast-notification:hover {
        box-shadow: 
          0 35px 60px -12px rgba(0, 0, 0, 0.5),
          0 25px 35px -5px rgba(0, 0, 0, 0.4),
          0 15px 15px -5px rgba(0, 0, 0, 0.3),
          0 0 0 1px rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(16px) saturate(200%) brightness(120%);
        -webkit-backdrop-filter: blur(16px) saturate(200%) brightness(120%);
      }
    }
    
    /* Reduce motion for accessibility */
    @media (prefers-reduced-motion: reduce) {
      .toast-notification {
        transition: none;
        animation: fade-in 0.3s ease;
      }
      
      .toast-notification:hover {
        transform: none;
      }
    }
  `;
  document.head.appendChild(style);
}
