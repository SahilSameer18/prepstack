import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Navigate } from 'react-router';
import Skeleton from '../ui/Skeleton';

const Protected = ({ children }) => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-6 animate-pulse">
        <Skeleton width="280px" height="2.5rem" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton height="8rem" />
          <Skeleton height="8rem" />
          <Skeleton height="8rem" />
        </div>
        <Skeleton height="18rem" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={'/login'} />
  }

  return children
}

export default Protected

