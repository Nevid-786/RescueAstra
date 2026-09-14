import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser, UserRole } from '../types';
import { fetchCurrentUser } from '../services/api';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  login: (token: string, user: IUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('skypetrol_token'));
  const [userRole, setUserRoleState] = useState<UserRole>('RESCUE_TEAM');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await fetchCurrentUser();
        setUser(userData);
        setUserRoleState(userData.role);
      } catch (err) {
        console.warn('Failed to verify token:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = (newToken: string, newUser: IUser) => {
    localStorage.setItem('skypetrol_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setUserRoleState(newUser.role);
  };

  const logout = () => {
    localStorage.removeItem('skypetrol_token');
    setToken(null);
    setUser(null);
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        userRole,
        setUserRole,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
