import dynamic from 'next/dynamic';
import React from 'react';

const DynamicUserSetting = dynamic(
  () => import('@/components/setting/UserSetting'),
  {
    ssr: false,
  }
);

type UserSettingProps = {};

const UserSetting: React.FC<UserSettingProps> = () => {
  return <DynamicUserSetting />;
};

export default UserSetting;
