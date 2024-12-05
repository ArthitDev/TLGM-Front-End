import { useAuth } from 'context/AuthContext';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import axiosInstance from '@/services/axiosInstance';

const withAuth = (WrappedComponent: React.ComponentType) => {
  const Wrapper: React.FC = (props) => {
    const router = useRouter();
    const { isAuthenticated, setIsAuthenticated } = useAuth();

    const checkAuth = async () => {
      try {
        await axiosInstance.get('/api/v1/admin');
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
        router.push('/login');
      }
    };

    useEffect(() => {
      if (!isAuthenticated) {
        checkAuth();
      }
    }, [isAuthenticated]);

    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };

  return Wrapper;
};

export default withAuth;
