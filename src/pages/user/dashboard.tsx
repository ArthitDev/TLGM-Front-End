import dynamic from 'next/dynamic';
import React from 'react';

const DynamicUserDashboard = dynamic(
  () => import('@/components/dashboard/UserDashboard')
);

type DashboardUserProps = {};

const DashboardUser: React.FC<DashboardUserProps> = () => {
  return <DynamicUserDashboard />;
};

export default DashboardUser;
