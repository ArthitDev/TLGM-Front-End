import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

import { parseCookies } from '@/utils/nookies';

const DynamicLoginForm = dynamic(() => import('components/login/LoginForm'));

type LoginProps = {};

const Login: React.FC<LoginProps> = () => {
  return <DynamicLoginForm />;
};

export default Login;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx);
  const { accessToken } = cookies;
  const { refreshToken } = cookies;

  if (accessToken || refreshToken) {
    return {
      redirect: {
        destination: '/admin',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
