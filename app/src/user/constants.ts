import { LayoutDashboard, Settings, Shield } from 'lucide-react';

export const userMenuItems = [
  {
    name: 'AI Scheduler (Demo App)',
    to: '/demo-app',
    icon: LayoutDashboard,
    isAdminOnly: false,
    isAuthRequired: true,
  },
  {
    name: 'Account Settings',
    to: '/account',
    icon: Settings,
    isAuthRequired: false,
    isAdminOnly: false,
  },
  {
    name: 'Admin Dashboard',
    to: '/admin',
    icon: Shield,
    isAuthRequired: false,
    isAdminOnly: true,
  },
] as const;
