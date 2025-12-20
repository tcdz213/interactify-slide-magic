import { Badge } from '@/components/ui/badge';
import { Crown, Shield, UserCog, User } from 'lucide-react';
import type { UserRole } from '@/types/auth';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

const ROLE_CONFIG: Record<UserRole, { label: string; icon: React.ReactNode; className: string }> = {
  owner: {
    label: 'Owner',
    icon: <Crown className="h-3 w-3" />,
    className: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
  },
  admin: {
    label: 'Admin',
    icon: <Shield className="h-3 w-3" />,
    className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  moderator: {
    label: 'Moderator',
    icon: <UserCog className="h-3 w-3" />,
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  user: {
    label: 'User',
    icon: <User className="h-3 w-3" />,
    className: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  },
};

export function RoleBadge({ role, size = 'sm', showIcon = true }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;

  return (
    <Badge
      variant="outline"
      className={cn(
        config.className,
        size === 'sm' ? 'text-xs px-1.5 py-0' : 'text-sm px-2 py-0.5',
        'font-medium'
      )}
    >
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.label}
    </Badge>
  );
}
