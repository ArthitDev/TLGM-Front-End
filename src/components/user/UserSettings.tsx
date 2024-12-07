import React from 'react';

import withAuth from '@/utils/withAuth';

type UserSettingsProps = {};

const UserSettings: React.FC<UserSettingsProps> = () => {
  return <div>UserSettings</div>;
};

export default withAuth(UserSettings, 'user');
