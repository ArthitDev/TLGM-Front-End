import dynamic from 'next/dynamic';
import React from 'react';

const UserSidebar = dynamic(() => import('../components/sidebar/UserSidebar'), {
  ssr: false,
});

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <main className="flex-1 mt-16 p-6">{children}</main>
      </div>
    </div>
  );
};

export default UserLayout;
