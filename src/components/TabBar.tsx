import {
  CirclePlus,
  ClipboardList,
  FileText,
  LayoutDashboard,
  List,
  LogIn,
  User,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import type { Role } from '../lib/auth';
import { useAuth } from '../lib/authContext';

type Tab = { to: string; label: string; icon: LucideIcon };

const FAULTS: Tab = { to: '/faults', label: 'tabs.faults', icon: List };
const PROFILE: Tab = { to: '/profile', label: 'tabs.profile', icon: User };

// Tabs for each role (PRD 7.2). Visitors are users with no role.
const tabsByRole: Record<Role | 'visitor', Tab[]> = {
  visitor: [FAULTS, { to: '/log-in', label: 'tabs.logIn', icon: LogIn }],
  resident: [
    FAULTS,
    { to: '/report', label: 'tabs.report', icon: CirclePlus },
    { to: '/my-reports', label: 'tabs.myReports', icon: FileText },
    PROFILE,
  ],
  ward_admin: [
    { to: '/queue', label: 'tabs.queue', icon: ClipboardList },
    { to: '/dashboard', label: 'tabs.dashboard', icon: LayoutDashboard },
    FAULTS,
    PROFILE,
  ],
  field_team: [{ to: '/my-jobs', label: 'tabs.myJobs', icon: Wrench }, FAULTS, PROFILE],
};

// PRD 8.3 Tab bar: bottom bar on phones and tablets, left side menu over
// 1024 px. The active tab uses the primary colour and a bold label.
export default function TabBar() {
  const { t } = useTranslation();
  const { userId, role } = useAuth();
  // While a logged-in user's role is loading, show no tabs rather than the
  // visitor tabs.
  const tabs = role ? tabsByRole[role] : userId ? [] : tabsByRole.visitor;

  return (
    <nav
      aria-label={t('tabs.label')}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white lg:inset-x-auto lg:bottom-0 lg:left-0 lg:top-0 lg:w-60 lg:border-r lg:border-t-0 lg:pt-20"
    >
      <ul className="mx-auto flex h-16 max-w-content lg:h-auto lg:flex-col lg:gap-1 lg:px-3">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1 lg:flex-none">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex h-full min-h-11 flex-col items-center justify-center gap-1 rounded-button text-[13px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-3 lg:text-base ${
                  isActive
                    ? 'font-bold text-primary lg:bg-primary/10'
                    : 'text-text-secondary hover:text-primary lg:hover:bg-surface'
                }`
              }
            >
              <Icon aria-hidden="true" className="h-6 w-6" />
              <span>{t(label)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
