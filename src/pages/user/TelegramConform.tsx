import dynamic from 'next/dynamic';
import React from 'react';

const DynamicTelegramConform = dynamic(
  () => import('@/components/telegramconform/TelegramConform'),
  {
    ssr: false,
  }
);

type TelegramConformProps = {};

const TelegramConform: React.FC<TelegramConformProps> = () => {
  return <DynamicTelegramConform />;
};

export default TelegramConform;
