import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

const TOKEN_KEY = 'mindraven_token';
const USER_KEY = 'mindraven_user';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const { trackUserLogin, trackUserLogout } = useGoogleAnalytics();

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      // Track user login in Google Analytics
      trackUserLogin(user.id, user.email);
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user, trackUserLogin]);

  const value = useMemo(
    () => ({
      token,
      user,
      login: (payload) => {
        setToken(payload.token);
        setUser(payload.user);
      },
      logout: () => {
        setToken('');
        setUser(null);
        // Track user logout in Google Analytics
        trackUserLogout();
      },
      updateUser: (newUser) => {
        setUser(newUser);
      }
    }),
    [token, user, trackUserLogout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
