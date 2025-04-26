import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the context type
type UserContextType = {
  userId: string | null;
  setUserId: (id: string | null) => void;
  generateUserId: () => string;
};

// Create the context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Props for the provider component
type UserProviderProps = {
  children: ReactNode;
};

// Provider component that will wrap the app
export const UserProvider = ({ children }: UserProviderProps) => {
  const [userId, setUserId] = useState<string | null>(null);

  // Generate a random user ID
  const generateUserId = (): string => {
    const newUserId = `user_${Math.random().toString(36).substring(2, 15)}`;
    return newUserId;
  };

  // Initialize the user ID from localStorage on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('historyhub_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = generateUserId();
      localStorage.setItem('historyhub_user_id', newUserId);
      setUserId(newUserId);
    }
  }, []);

  // Save userId to localStorage whenever it changes
  useEffect(() => {
    if (userId) {
      localStorage.setItem('historyhub_user_id', userId);
    }
  }, [userId]);

  return (
    <UserContext.Provider value={{ userId, setUserId, generateUserId }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};