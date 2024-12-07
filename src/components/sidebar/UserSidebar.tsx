import {
  ArrowLeftStartOnRectangleIcon,
  Bars3Icon,
  CheckBadgeIcon,
  Cog6ToothIcon,
  HomeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { logout } from '@/services/logoutServices';

interface NavItem {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
}

const navigation: NavItem[] = [
  { name: 'หน้าหลัก', icon: HomeIcon, path: '/user/dashboard' },
  {
    name: 'ยืนยัน Telegram',
    icon: CheckBadgeIcon,
    path: '/user/TelegramConform',
  },
];

const UserSidebar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    const response = await logout();
    if (response.success) {
      localStorage.removeItem('token');
      router.push('/login');
    }
    setShowLogoutModal(false);
  };

  // ปิด sidebar เมื่อหน้าจอใหญ่ขึ้น
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-indigo-600 text-white sm:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed sm:static inset-y-0 left-0 z-40
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        sm:translate-x-0 transition-transform duration-300 ease-in-out
        bg-indigo-600 text-white min-h-screen w-60 flex flex-col
      `}
      >
        {/* Logo or Brand */}
        <div className="flex items-center justify-center py-4">
          <img
            src="/path/to/your-logo.png"
            alt="User"
            className="w-12 h-12 object-cover"
          />
        </div>

        {/* Main Menu */}
        <div className="flex-1 flex flex-col overflow-y-auto px-3 py-4">
          <nav>
            <div className="space-y-1" aria-label="Main navigation">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-indigo-700 cursor-pointer transition-colors duration-200 active:bg-indigo-800"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push(item.path);
                  }}
                >
                  <item.icon
                    className="w-5 h-5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </nav>
        </div>

        {/* User Profile */}
        <div className="border-t border-indigo-500 p-3 mt-auto">
          <div className="flex justify-center space-x-4">
            <button
              className="p-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              onClick={() => router.push('/user/UserSetting')}
            >
              <Cog6ToothIcon className="w-6 h-6" aria-hidden="true" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              onClick={handleLogout}
            >
              <ArrowLeftStartOnRectangleIcon
                className="w-6 h-6"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="bg-white/90 dark:bg-gray-800/90 w-full max-w-md rounded-3xl shadow-2xl transform transition-all animate-modal-slide-up backdrop-blur-lg border border-gray-200/20">
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-red-500/20 blur-lg animate-pulse" />
                  <ArrowLeftStartOnRectangleIcon className="relative mx-auto h-16 w-16 text-red-500 transform transition-transform hover:scale-105 duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">
                  ยืนยันการออกจากระบบ
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  คุณต้องการออกจากระบบใช่หรือไม่?
                </p>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  className="flex-1 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 bg-gray-100/80 dark:bg-gray-700/80 
                  rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transform hover:-translate-y-0.5 
                  transition-all duration-200 font-medium backdrop-blur-sm"
                  onClick={() => setShowLogoutModal(false)}
                >
                  ยกเลิก
                </button>
                <button
                  className="flex-1 px-4 py-2.5 text-sm text-white bg-gradient-to-r from-red-500 to-red-600 
                  rounded-2xl hover:from-red-600 hover:to-red-700 transform hover:-translate-y-0.5 
                  transition-all duration-200 font-medium shadow-lg shadow-red-500/30"
                  onClick={confirmLogout}
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserSidebar;
