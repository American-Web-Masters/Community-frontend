import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaBars,
  FaChartLine,
  FaComments,
  FaQuestionCircle,
  FaUsers,
  FaRegCalendarAlt,
  FaRegBell,
  FaCog,
  FaTimes,
} from 'react-icons/fa';

const cx = (...classes) => classes.filter(Boolean).join(' ');

const DashboardSidebar = ({ isCollapsed, onToggle }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const items = useMemo(
    () => [
      // { to: '/dashboard', label: 'Overview', icon: FaChartLine, end: true },
  { to: '/dashboard/faqs', label: "FAQs", icon: FaQuestionCircle },
        { to: '/dashboard/forum', label: 'Forum', icon: FaComments },
      // { to: '/dashboard/users', label: 'Users', icon: FaUsers },
      // { to: '/dashboard/events', label: 'Events', icon: FaRegCalendarAlt },
      // { to: '/dashboard/alerts', label: 'Alerts', icon: FaRegBell },
      // { to: '/dashboard/settings', label: 'Settings', icon: FaCog },
    ],
    [],
  );

  const SidebarContent = ({ forceExpanded = false } = {}) => (
    <div className="h-full flex flex-col">
      <div className="h-16 px-4 flex items-center justify-between border-b border-black/5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-xl bg-primary-500 text-white flex items-center justify-center font-semibold shrink-0">
            A
          </div>
          {!(isCollapsed && !forceExpanded) && (
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">Admin</div>
              <div className="text-xs text-gray-500 truncate">Dashboard</div>
            </div>
          )}
        </div>

        {/* Desktop collapse/expand */}
        <button
          type="button"
          className="hidden md:inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-black/5 text-gray-700 cursor-pointer"
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <FaBars className="h-4 w-4" />
        </button>

        {/* Mobile drawer close */}
        {isCollapsed && <button
          type="button"
          className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-black/5 text-gray-700"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close sidebar"
        >
          <FaTimes className="h-4 w-4" />
        </button>}
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
              <Icon
                className={cx(
                  'h-4 w-4 shrink-0',
                  isCollapsed && !forceExpanded ? 'mx-auto' : '',
                )}
              />
              {!(isCollapsed && !forceExpanded) && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      

    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cx(
          'hidden md:block sticky top-0 h-screen bg-white/35 backdrop-blur-sm border-r border-white/35',
          isCollapsed ? 'w-20' : 'w-72',
        )}
      >
        {SidebarContent()}
      </aside>

      {/* Mobile: keep a mini-rail visible so tabs are always reachable */}
      <aside className="md:hidden sticky top-0 h-screen w-16 bg-white/35 backdrop-blur-sm border-r border-white/35">
        <div className="h-full flex flex-col">
          <div className="h-16 px-2 flex items-center justify-center border-b border-black/5">
            <button
              type="button"
              className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary-500 text-white"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open sidebar"
            >
              <FaBars className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 p-2 space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cx(
                      'group flex items-center justify-center px-2 py-3 rounded-xl text-sm transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-black/5',
                    )
                  }
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon className="h-4 w-4" />
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            {SidebarContent({ forceExpanded: true })}
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardSidebar;
