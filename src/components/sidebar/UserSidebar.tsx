import {
  ArrowLeftIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowRightIcon,
  Bars3Icon,
  ChartBarIcon,
  CheckBadgeIcon,
  Cog6ToothIcon,
  HomeIcon,
  PaperAirplaneIcon,
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
  { name: 'หน้าหลัก', icon: HomeIcon, path: '/user' },
  { name: 'แดชบอร์ด', icon: ChartBarIcon, path: '/user/dashboard' },
  { name: 'ยืนยัน Telegram', icon: CheckBadgeIcon, path: '/user/confirm' },
  { name: 'กลุ่มต้นทาง', icon: ArrowRightIcon, path: '/user/sandinggroup' },
  { name: 'กลุ่มปลายทาง', icon: ArrowLeftIcon, path: '/user/resivegroup' },
  { name: 'Forward', icon: PaperAirplaneIcon, path: '/user/forward' },
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
        className="sidebar-toggle p-2 rounded-lg bg-gray-800 text-white sm:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

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
        bg-gray-800 text-white min-h-screen w-60 flex flex-col
      `}
      >
        <div className="flex items-center justify-center py-4 cursor-pointer">
          <img
            src="/images/logo.png"
            alt="User"
            className="w-15 h-12"
            onClick={() => router.push('/user')}
          />
        </div>

        {/* Main Menu */}
        <div className="flex-1 flex flex-col overflow-y-auto px-3 py-4">
          <nav>
            <div className="space-y-1" aria-label="Main navigation">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-gray-700 cursor-pointer transition-colors duration-200 active:bg-gray-600"
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
        <div className="border-t border-gray-700 p-3 mt-auto">
          <div className="flex justify-center space-x-4">
            <button
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              onClick={() => router.push('/user/settings')}
            >
              <Cog6ToothIcon className="w-6 h-6" aria-hidden="true" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
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
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl">
            <div className="p-8">
              <div className="text-center mb-6">
                <ArrowLeftStartOnRectangleIcon className="mx-auto h-16 w-16 text-red-500" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">
                  ยืนยันการออกจากระบบ
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  คุณต้องการออกจากระบบใช่หรือไม่?
                </p>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  className="flex-1 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 
                  rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
                  onClick={() => setShowLogoutModal(false)}
                >
                  ยกเลิก
                </button>
                <button
                  className="flex-1 px-4 py-2.5 text-sm text-white bg-red-500 hover:bg-red-600
                  rounded-2xl transition-all duration-200 font-medium"
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
