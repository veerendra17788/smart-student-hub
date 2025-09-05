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
  department?: string;
  rollNumber?: string;
}

  interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: (navigate?: any) => void;
    isAuthenticated: boolean;
    token: string | null;
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

  // Load user from localStorage if already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
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

      // Save user and token in state and localStorage
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
    } catch (err: any) {
      console.error('Login error:', err);
      throw err; // allow frontend to handle error
    }
  };

  // Logout function
  const logout = (navigate?: any) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
