import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export default function AppLayout({ children, currentPath = '/' }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
      <Sidebar currentPath={currentPath} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ background: 'var(--bg-deep)' }}
        >
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-12 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}