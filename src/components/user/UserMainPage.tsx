import { useQuery } from '@tanstack/react-query';
import React from 'react';

import { getUserProfile } from '@/services/profileService';
import withAuth from '@/utils/withAuth';

const UserMainPage = () => {
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="p-8">
      {profileData && (
        <div>
          <h1 className="text-4xl font-bold text-center mb-6">ยินดีต้อนรับ</h1>
          <div className="text-center mb-6">
            <p className="text-xl">คุณ {profileData.user.name}</p>
            <p className="text-gray-600">({profileData.user.username})</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(UserMainPage, 'user');
