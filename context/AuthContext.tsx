import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  username: string;
  role: 'admin' | 'customer';
}

interface StoredUser {
  username: string;
  password: string;
  role: 'admin' | 'customer';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, password: string, role: 'admin' | 'customer') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'users';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUsers = async (): Promise<StoredUser[]> => {
    const usersData = await AsyncStorage.getItem(USERS_KEY);
    if (!usersData) {
      const defaultAdmin: StoredUser = { username: 'gengar', password: 'pikapika', role: 'admin' };
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
      return [defaultAdmin];
    }
    return JSON.parse(usersData);
  };

  const saveUsers = async (users: StoredUser[]) => {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const signup = async (username: string, password: string, role: 'admin' | 'customer'): Promise<{ success: boolean; error?: string }> => {
    if (!username.trim() || !password.trim()) {
      return { success: false, error: 'Please fill all fields' };
    }
    if (password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' };
    }

    const users = await getUsers();
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (existingUser) {
      return { success: false, error: 'Username already exists' };
    }

    const newUser: StoredUser = { username, password, role };
    await saveUsers([...users, newUser]);

    const loggedInUser = { username, role };
    await AsyncStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    
    return { success: true };
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!username.trim() || !password.trim()) {
      return { success: false, error: 'Please enter username and password' };
    }

    const users = await getUsers();
    const foundUser = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      return { success: false, error: 'Invalid username or password' };
    }

    const loggedInUser = { username: foundUser.username, role: foundUser.role };
    await AsyncStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    
    return { success: true };
  };

  const logout = async () => {
    await AsyncStorage.removeItem('currentUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
