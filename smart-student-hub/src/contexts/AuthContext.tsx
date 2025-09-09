// import React, { createContext, useContext, useState, ReactNode } from 'react';

// export type UserRole = 'student' | 'faculty' | 'admin';

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: UserRole;
//   avatar?: string;
//   department?: string;
//   rollNumber?: string;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
//   isAuthenticated: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<User | null>({
//     id: '1',
//     name: 'Alex Johnson',
//     email: 'alex@university.edu',
//     role: 'student',
//     department: 'Computer Science',
//     rollNumber: 'CS2024001'
//   });

//   const login = async (email: string, password: string) => {
//     // Simulate login logic
//     const mockUser: User = {
//       id: '1',
//       name: 'Alex Johnson',
//       email,
//       role: email.includes('faculty') ? 'faculty' : email.includes('admin') ? 'admin' : 'student',
//       department: 'Computer Science',
//       rollNumber: email.includes('student') ? 'CS2024001' : undefined
//     };
//     setUser(mockUser);
//   };

//   const logout = () => {
//     setUser(null);
//   };

//   const value = {
//     user,
//     login,
//     logout,
//     isAuthenticated: !!user,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };


import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department: string;
  rollNumber: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: (navigate?: any) => void;
  refreshProfile: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage if already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setRefreshTokenValue(storedRefreshToken);
    }
    setIsLoading(false);

    // Listen for token refresh events from API client
    const handleTokenRefresh = (event: CustomEvent) => {
      const { token: newToken, user: updatedUser } = event.detail;
      setToken(newToken);
      setUser(updatedUser);
    };

    // Listen for force logout events
    const handleForceLogout = () => {
      setUser(null);
      setToken(null);
      setRefreshTokenValue(null);
    };

    window.addEventListener('tokenRefreshed', handleTokenRefresh as EventListener);
    window.addEventListener('forceLogout', handleForceLogout);

    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefresh as EventListener);
      window.removeEventListener('forceLogout', handleForceLogout);
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');

      // Save user and tokens in state and localStorage
      setUser(data.user);
      setToken(data.token);
      setRefreshTokenValue(data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
    } catch (err: any) {
      console.error('Login error:', err);
      throw err; // allow frontend to handle error
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      if (!refreshTokenValue) {
        console.warn('No refresh token available');
        return false;
      }

      const res = await fetch('http://localhost:5000/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update tokens and user data
        setToken(data.token);
        setRefreshTokenValue(data.refreshToken);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } else {
        // Refresh token is invalid/expired, logout user
        console.error('Token refresh failed:', data.message);
        logout();
        return false;
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      logout();
      return false;
    }
  };

  // Refresh profile function with automatic token refresh
  const refreshProfile = async () => {
    try {
      if (!token) return;
      
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else if (data.code === 'TOKEN_EXPIRED') {
        // Try to refresh token and retry
        const refreshed = await refreshToken();
        if (refreshed) {
          // Retry profile fetch with new token
          await refreshProfile();
        }
      }
    } catch (err) {
      console.error('Profile refresh error:', err);
    }
  };

  // Logout function
  const logout = (navigate?: any) => {
    setUser(null);
    setToken(null);
    setRefreshTokenValue(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    if (navigate) navigate('/');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    refreshProfile,
    refreshToken,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
