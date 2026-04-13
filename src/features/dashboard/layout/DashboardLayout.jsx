import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaSignOutAlt } from 'react-icons/fa';
import DashboardSidebar from '../components/DashboardSidebar';
import { selectUser } from '../../../store/userSlice';

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const title = 'Dashboard';

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <div className="flex">
        <DashboardSidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed((v) => !v)}
        />

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 h-16 bg-white/70 backdrop-blur border-b border-black/5">
            <div className="h-full px-4 md:px-6 flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-sm text-gray-500">Admin</div>
                <div className="text-lg font-semibold text-gray-900 truncate">{title}</div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 hover:bg-black/10 text-sm text-gray-800"
                  onClick={() => navigate('/')}
                >
                  Back to app
                </button>

                <div className="hidden sm:block h-9 w-px bg-black/10" />

                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
                    {user?.username || user?.fullname || 'Admin'}
                  </div>
                  <div className="text-xs text-gray-500">{user?.role || 'admin'}</div>
                </div>

                <button
                  type="button"
                  className="h-10 w-10 rounded-xl bg-black/5 hover:bg-black/10 text-gray-800 flex items-center justify-center"
                  title="Sign out"
                  onClick={() => navigate('/profile/' + (user?.username || ''))}
                >
                  <FaSignOutAlt className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
