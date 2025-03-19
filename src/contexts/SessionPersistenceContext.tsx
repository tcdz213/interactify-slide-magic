
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchCurrentUser } from '@/redux/slices/authSlice';

interface SessionContextType {
  isLoadingSession: boolean;
}

const SessionContext = createContext<SessionContextType>({
  isLoadingSession: false,
});

export const useSessionContext = () => useContext(SessionContext);

export const SessionPersistenceProvider = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const dispatch = useAppDispatch();
  const { isSessionPersisted, user } = useAppSelector(state => state.auth);
  
  // On app initialization, check if we have a stored token and try to refresh user data
  useEffect(() => {
    const initSession = async () => {
      if (isSessionPersisted && !user) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          console.error('Failed to restore session:', error);
        }
      }
      setIsLoadingSession(false);
    };
    
    initSession();
  }, [dispatch, isSessionPersisted, user]);
  
  return (
    <SessionContext.Provider value={{ isLoadingSession }}>
      {children}
    </SessionContext.Provider>
  );
};
