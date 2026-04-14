import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaBars,
  FaChartLine,
  FaQuestionCircle,
  FaUsers,
  FaRegCalendarAlt,
  FaRegBell,
  FaCog,
} from 'react-icons/fa';

const cx = (...classes) => classes.filter(Boolean).join(' ');

const DashboardSidebar = ({ isCollapsed, onToggle }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const items = useMemo(
    () => [
      { to: '/dashboard', label: 'Overview', icon: FaChartLine, end: true },
  { to: '/dashboard/faqs', label: "FAQs", icon: FaQuestionCircle },
      { to: '/dashboard/users', label: 'Users', icon: FaUsers },
      { to: '/dashboard/events', label: 'Events', icon: FaRegCalendarAlt },
      { to: '/dashboard/alerts', label: 'Alerts', icon: FaRegBell },
      { to: '/dashboard/settings', label: 'Settings', icon: FaCog },
    ],
    [],
  );

  const SidebarContent = (
    <div className="h-full flex flex-col">
      <div className="h-16 px-4 flex items-center justify-between border-b border-black/5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-xl bg-primary-500 text-white flex items-center justify-center font-semibold shrink-0">
            A
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">Admin</div>
              <div className="text-xs text-gray-500 truncate">Dashboard</div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="hidden md:inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-black/5 text-gray-700"
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <FaBars className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-black/5 text-gray-700"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                cx(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-black/5',
                )
              }
            >
              <Icon className={cx('h-4 w-4 shrink-0', isCollapsed ? 'mx-auto' : '')} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-black/5">
        <div className={cx('rounded-xl bg-gradient-to-br from-primary-50 to-white p-3', isCollapsed && 'p-2')}>
          {!isCollapsed ? (
            <>
              <div className="text-xs font-semibold text-gray-900">Tip</div>
              <div className="text-xs text-gray-600 mt-1">
                This is a sample admin area. Wire real stats here.
              </div>
            </>
          ) : (
            <div className="h-9 w-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
              i
            </div>
          )}
        </div>
      </div>

      {/* Mobile open button (floating) */}
      <button
        type="button"
        className="md:hidden fixed bottom-5 left-5 z-50 h-12 w-12 rounded-2xl shadow-lg bg-primary-500 text-white flex items-center justify-center"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <FaBars className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            {/* Re-render sidebar non-collapsed on mobile */}
            <DashboardSidebar isCollapsed={false} onToggle={() => {}} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <aside
      className={cx(
        'hidden md:block sticky top-0 h-screen bg-white/80 backdrop-blur border-r border-black/5',
        isCollapsed ? 'w-20' : 'w-72',
      )}
    >
      {SidebarContent}
    </aside>
  );
};

export default DashboardSidebar;
