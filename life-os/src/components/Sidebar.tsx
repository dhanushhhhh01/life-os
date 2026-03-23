'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  LayoutDashboard,
  Heart,
  BookOpen,
  MessageCircle,
  BarChart3,
  Shield,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/checkin', label: 'Check-in', icon: Heart },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/coach', label: 'Coach', icon: MessageCircle },
  { href: '/report', label: 'Report', icon: BarChart3 },
  { href: '/security', label: 'Security', icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-50 border-r border-glass-border flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-glass-border">
        <div className="p-2 rounded-xl bg-accent/10">
          <Sparkles className="w-6 h-6 text-accent-light" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">DEX</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-accent/15 text-accent-light shadow-glow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-accent-light' : ''}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-glass-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
