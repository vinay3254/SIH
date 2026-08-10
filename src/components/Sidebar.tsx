'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  FolderOpen,
  Network,
  GitBranch,
  ClipboardList,
  Shield,
  ChevronLeft,
  ChevronRight,
  Radio,
  Activity,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  group: string;
}

const navItems: NavItem[] = [
  {
    id: 'nav-dashboard',
    label: 'Case Dashboard',
    href: '/case-dashboard',
    icon: <LayoutDashboard size={18} />,
    badge: 3,
    group: 'Investigation',
  },
  {
    id: 'nav-cases',
    label: 'Cases',
    href: '/case-dashboard',
    icon: <FolderOpen size={18} />,
    badge: 12,
    group: 'Investigation',
  },
  {
    id: 'nav-new-case',
    label: 'New Case',
    href: '/new-case-evidence-intake',
    icon: <GitBranch size={18} />,
    group: 'Investigation',
  },
  {
    id: 'nav-correlation',
    label: 'Correlation Jobs',
    href: '/case-dashboard',
    icon: <Activity size={18} />,
    badge: 2,
    group: 'Analysis',
  },
  {
    id: 'nav-graph',
    label: 'Entity Graph',
    href: '/case-dashboard',
    icon: <Network size={18} />,
    group: 'Analysis',
  },
  {
    id: 'nav-ingestion',
    label: 'Ingestion Pipeline',
    href: '/case-dashboard',
    icon: <Radio size={18} />,
    group: 'Analysis',
  },
  {
    id: 'nav-audit',
    label: 'Audit Log',
    href: '/case-dashboard',
    icon: <ClipboardList size={18} />,
    group: 'Compliance',
  },
  {
    id: 'nav-admin',
    label: 'Admin Panel',
    href: '/case-dashboard',
    icon: <Shield size={18} />,
    group: 'Compliance',
  },
];

const groups = ['Investigation', 'Analysis', 'Compliance'];

interface SidebarProps {
  currentPath?: string;
}

export default function Sidebar({ currentPath = '/' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="flex flex-col flex-shrink-0 h-screen border-r overflow-hidden sidebar-transition relative z-20 glass-sidebar"
      style={{
        width: collapsed ? '64px' : '240px',
        background: 'transparent',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center h-14 px-3 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <AppLogo size={32} />
          {!collapsed && (
            <div className="min-w-0 overflow-hidden">
              <span
                className="font-mono text-sm font-600 tracking-wider truncate block"
                style={{ color: '#1D1D1F' }}
              >
                SIH1745
              </span>
              <span
                className="text-2xs font-500 tracking-widest uppercase truncate block"
                style={{ color: '#6E6E73' }}
              >
                TOR Intel
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
        {groups.map((group) => {
          const items = navItems.filter((i) => i.group === group);
          return (
            <div key={`group-${group}`} className="mb-4">
              {!collapsed && (
                <p
                  className="text-2xs font-600 tracking-widest uppercase px-2 mb-1"
                  style={{ color: '#6E6E73', opacity: 0.7 }}
                >
                  {group}
                </p>
              )}
              {items.map((item) => {
                const isActive = currentPath === item.href || (item.href === '/case-dashboard' && currentPath === '/');
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`nav-item mb-0.5 ${isActive ? 'active' : ''}`}
                    title={collapsed ? item.label : undefined}
                    style={{
                      ...(collapsed ? { justifyContent: 'center', padding: '0.625rem' } : {}),
                      transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                      color: isActive ? '#0071E3' : '#6E6E73',
                      background: isActive ? 'rgba(0,113,227,0.1)' : 'transparent',
                      border: isActive ? '1px solid rgba(0,113,227,0.2)' : '1px solid transparent',
                      borderRadius: '9999px',
                    }}
                  >
                    <span className="nav-item-icon flex-shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className="text-2xs font-600 px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{
                              background: 'rgba(0,113,227,0.1)',
                              color: '#0071E3',
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div
        className="border-t p-2 flex-shrink-0"
        style={{ borderColor: 'rgba(0,0,0,0.08)' }}
      >
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all duration-150"
          style={{ color: '#6E6E73' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.06)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : (
            <>
              <ChevronLeft size={16} />
              <span className="text-xs font-500">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}