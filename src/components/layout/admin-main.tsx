'use client';

interface AdminMainProps {
  children: React.ReactNode;
}

export function AdminMain({ children }: AdminMainProps) {
  return (
    <main className="flex-1">
      <div className="h-screen overflow-y-auto">
        <div className="mx-auto h-screen">
          {children}
        </div>
      </div>
    </main>
  );
}