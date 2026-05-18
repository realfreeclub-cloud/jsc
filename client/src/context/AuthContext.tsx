import { createContext, useContext, useState, type ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type User = Record<string, any>;

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jsc_token'));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('jsc_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('jsc_token', newToken);
    localStorage.setItem('jsc_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('jsc_token');
    localStorage.removeItem('jsc_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
