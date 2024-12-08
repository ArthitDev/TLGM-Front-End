import React from 'react';

import withAuth from '@/utils/withAuth';

type TelegramSettingsProps = {};

const TelegramSettings: React.FC<TelegramSettingsProps> = () => {
  return <div>TelegramSettings</div>;
};

export default withAuth(TelegramSettings, 'user');
