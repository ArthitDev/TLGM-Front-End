import dynamic from 'next/dynamic';
import React from 'react';

const UserSidebar = dynamic(() => import('../components/sidebar/UserSidebar'), {
  ssr: false,
});

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <UserSidebar />
      <div className="flex-grow p-6">{children}</div>
    </div>
  );
};

export default UserLayout;
