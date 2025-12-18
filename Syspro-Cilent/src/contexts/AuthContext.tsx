import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  user: { username: string } | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ username: string } | null>(null);

  // In-memory login logic (for demo/dev)
  const login = async (username: string, password: string) => {
    // Placeholder for real API integration
    // Example:
    // const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    // if (response.ok) { ... }

    // Simple in-memory logic
    if ((username === 'demo' && password === 'demo123') || (username === 'admin' && password === 'admin123')) {
      setUser({ username });
      return { success: true };
    } else {
      return { success: false, message: 'Invalid credentials' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}; 