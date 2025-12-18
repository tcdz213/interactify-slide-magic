import { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 h-16 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
          <div className="flex items-center justify-between h-full px-6">
            <div>
              <h1 className="text-xl font-semibold text-slate-100">{title}</h1>
              {description && (
                <p className="text-sm text-slate-400">{description}</p>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
