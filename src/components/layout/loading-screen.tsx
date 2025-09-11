'use client';

export function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="h-12 w-12 mx-auto">
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Loading Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Please wait while we prepare your workspace</p>
        </div>
      </div>
    </div>
  );
}
