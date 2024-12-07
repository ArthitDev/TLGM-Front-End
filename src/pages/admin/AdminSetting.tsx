import dynamic from 'next/dynamic';
import React from 'react';

const DynamicAdminSetting = dynamic(
  () => import('@/components/setting/AdminSetting'),
  {
    ssr: false,
  }
);

type AdminSettingProps = {};

const AdminSetting: React.FC<AdminSettingProps> = () => {
  return <DynamicAdminSetting />;
};

export default AdminSetting;
