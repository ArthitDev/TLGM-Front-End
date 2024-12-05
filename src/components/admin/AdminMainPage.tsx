import { useRouter } from 'next/router';
import React from 'react';

import { logout } from '@/services/logoutServices';
import withAuth from '@/utils/withAuth';

const AdminMainPage: React.FC = () => {
  const router = useRouter();
  const handleLogout = async () => {
    await logout();
    sessionStorage.removeItem('userData');
    router.push('/login');
  };
  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">ข้อมูลผู้ใช้ Admin</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default withAuth(AdminMainPage);
