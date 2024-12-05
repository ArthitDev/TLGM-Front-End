import dynamic from 'next/dynamic';
import React from 'react';

const DynamicUserMainPage = dynamic(
  () => import('@/components/user/UserMainPage')
);

const UserPage = () => {
  return <DynamicUserMainPage />;
};

export default UserPage;
