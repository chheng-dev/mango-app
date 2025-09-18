// Simple toast notification utility
export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  type: ToastType;
  message: string;
  duration?: number;
}

const toastIcons = {
  success: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
  </svg>`,
  error: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>`,
  info: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>`,
  warning: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
  </svg>`
};

const toastColors = {
  success: 'bg-green-100 border-green-400 text-green-700',
  error: 'bg-red-100 border-red-400 text-red-700',
  info: 'bg-blue-100 border-blue-400 text-blue-700',
  warning: 'bg-yellow-100 border-yellow-400 text-yellow-700'
};

const iconColors = {
  success: 'text-green-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  warning: 'text-yellow-600'
};

export function showToast({ type, message, duration = 4000 }: ToastOptions) {
  // Remove any existing toasts
  const existingToasts = document.querySelectorAll('.toast-notification');
  existingToasts.forEach(toast => toast.remove());
  
  const notification = document.createElement('div');
  notification.className = `toast-notification fixed top-4 right-4 ${toastColors[type]} px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 min-w-[300px] max-w-[500px] animate-in slide-in-from-top-2 duration-300`;
  
  notification.innerHTML = `
    <div class="${iconColors[type]}">
      ${toastIcons[type]}
    </div>
    <span class="font-medium flex-1">${message}</span>
    <button class="ml-2 text-gray-500 hover:text-gray-700 transition-colors" onclick="this.parentElement.remove()">
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after duration
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slide-out-to-top-2 0.3s ease-in forwards';
      setTimeout(() => notification.remove(), 300);
    }
  }, duration);
}

// Convenience methods
export const toast = {
  success: (message: string, duration?: number) => showToast({ type: 'success', message, duration }),
  error: (message: string, duration?: number) => showToast({ type: 'error', message, duration }),
  info: (message: string, duration?: number) => showToast({ type: 'info', message, duration }),
  warning: (message: string, duration?: number) => showToast({ type: 'warning', message, duration })
};
