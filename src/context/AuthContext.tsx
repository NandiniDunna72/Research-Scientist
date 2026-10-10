import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());
  const [token, setToken] = useState<string | null>(() => authService.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const storedToken = authService.getToken();
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          if (currentUser) {
            setUser(currentUser);
            setToken(storedToken);
          } else {
            setUser(null);
            setToken(null);
          }
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await authService.signIn(email, password);
    setUser(res.user);
    setToken(res.token);
  };

  const signUp = async (fullName: string, email: string, password: string) => {
    const res = await authService.signUp(fullName, email, password);
    setUser(res.user);
    setToken(res.token);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    signIn,
    signUp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
