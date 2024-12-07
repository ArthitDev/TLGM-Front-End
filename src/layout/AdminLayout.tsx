import React from 'react';

import AdminSidebar from '@/components/sidebar/AdminSidebar';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="admin-layout">{children}</div>;
    </div>
  );
};

export default AdminLayout;
