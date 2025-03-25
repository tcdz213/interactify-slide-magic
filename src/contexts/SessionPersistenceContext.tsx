
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchCurrentUser } from '@/redux/slices/authSlice';
import { authService } from '@/api/auth';

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
      // Check if we have a valid token
      if (authService.isAuthenticated() && (!user || Object.keys(user).length === 0)) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          console.error('Failed to restore session:', error);
        }
      }
      setIsLoadingSession(false);
    };
    
    initSession();
  }, [dispatch, user]);
  
  return (
    <SessionContext.Provider value={{ isLoadingSession }}>
      {isLoadingSession ? (
        <div className="w-full h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <div className="text-lg font-medium">Loading your session...</div>
          </div>
        </div>
      ) : (
        children
      )}
    </SessionContext.Provider>
  );
};
