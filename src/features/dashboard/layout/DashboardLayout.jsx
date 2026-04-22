import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaArrowLeft, FaUserCircle } from 'react-icons/fa';
import DashboardSidebar from '../components/DashboardSidebar';
import { selectUser } from '../../../store/userSlice';

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const title = 'Dashboard';

  return (
    <div className="min-h-screen bg-[#e6f3ff8a]">
      <div className="flex">
        <DashboardSidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed((v) => !v)}
        />

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 h-16 bg-white/75 backdrop-blur border-b border-black/5">
            <div className="h-full px-3 sm:px-4 md:px-6 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="hidden sm:block text-sm text-text-secondary">Admin</div>
                <div className="text-lg font-semibold text-text-primary truncate">{title}</div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center h-10 px-3 sm:px-4 gap-2 rounded-xl bg-primary-50 hover:bg-primary-100 text-sm text-primary-800 border border-primary-100 cursor-pointer"
                  onClick={() => navigate('/')}
                  aria-label="Back to App"
                >
                  <FaArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to App</span>
                </button>

                <div className="hidden md:block h-9 w-px bg-black/10" />

                <button
                  type="button"
                  onClick={() => navigate('/profile/' + (user?.username || ''))}
                  className="hidden sm:block text-right rounded-xl px-2 py-1 hover:bg-primary-50 cursor-pointer"
                  aria-label="Go to profile"
                >
                  <div className="text-sm font-semibold text-text-primary truncate max-w-[160px]">
                    {user?.username || user?.fullname || 'Admin'}
                  </div>
                  <div className="text-xs text-text-secondary">{user?.role || 'admin'}</div>
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 h-10 px-3 rounded-xl bg-primary-50 hover:bg-primary-100 text-sm text-primary-800 border border-primary-100 cursor-pointer"
                  title="Go to profile"
                  onClick={() => navigate('/profile/' + (user?.username || ''))}
                >
                  <FaUserCircle className="h-5 w-5" />
                  <span className="hidden md:inline">Go to Profile</span>
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
