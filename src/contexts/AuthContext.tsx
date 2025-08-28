import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useKV } from '@github/spark/hooks';
import { User, AuthState, LoginCredentials, RegisterData, EmailVerificationRequest } from '@/types/auth';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  verifyEmail: (verification: EmailVerificationRequest) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useKV<User | null>('current-user', null);
  const [users, setUsers] = useKV<User[]>('users', []);
  const [pendingVerifications, setPendingVerifications] = useKV<Record<string, string>>('pending-verifications', {});
  const [isLoading, setIsLoading] = useKV<boolean>('auth-loading', false);
  const [error, setError] = useKV<string | null>('auth-error', null);

  // Simulate email service
  const sendVerificationEmail = async (email: string, code: string) => {
    // In a real app, this would send an actual email
    console.log(`Verification email sent to ${email} with code: ${code}`);
    toast.info('Verification email sent! Check your console for the code in this demo.');
  };

  const generateVerificationCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const foundUser = users.find(u => u.email === credentials.email);
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      if (!foundUser.isEmailVerified) {
        throw new Error('Please verify your email address before logging in');
      }

      // In a real app, you'd verify the password hash
      // For demo purposes, we'll accept any password
      
      const updatedUser = {
        ...foundUser,
        lastLoginAt: new Date()
      };

      setUser(updatedUser);
      setUsers(currentUsers => 
        currentUsers.map(u => u.id === foundUser.id ? updatedUser : u)
      );

      toast.success('Welcome back!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if user already exists
      const existingUser = users.find(u => u.email === data.email);
      if (existingUser) {
        throw new Error('An account with this email already exists');
      }

      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'user',
        isEmailVerified: false,
        createdAt: new Date(),
        phone: data.phone
      };

      // Generate verification code
      const verificationCode = generateVerificationCode();
      
      // Store user and verification code
      setUsers(currentUsers => [...currentUsers, newUser]);
      setPendingVerifications(current => ({
        ...current,
        [data.email]: verificationCode
      }));

      // Send verification email
      await sendVerificationEmail(data.email, verificationCode);

      toast.success('Registration successful! Please check your email for verification code.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (verification: EmailVerificationRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const storedCode = pendingVerifications[verification.email];
      if (!storedCode || storedCode !== verification.verificationCode) {
        throw new Error('Invalid verification code');
      }

      // Update user verification status
      const updatedUsers = users.map(u => 
        u.email === verification.email 
          ? { ...u, isEmailVerified: true }
          : u
      );

      setUsers(updatedUsers);
      
      // Remove pending verification
      setPendingVerifications(current => {
        const updated = { ...current };
        delete updated[verification.email];
        return updated;
      });

      toast.success('Email verified successfully! You can now log in.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const userExists = users.find(u => u.email === email && !u.isEmailVerified);
      if (!userExists) {
        throw new Error('User not found or already verified');
      }

      const verificationCode = generateVerificationCode();
      setPendingVerifications(current => ({
        ...current,
        [email]: verificationCode
      }));

      await sendVerificationEmail(email, verificationCode);
      toast.success('Verification email resent!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend verification';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      setUsers(currentUsers => 
        currentUsers.map(u => u.id === user.id ? updatedUser : u)
      );

      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    toast.success('Logged out successfully');
  };

  // Initialize admin user if no users exist
  useEffect(() => {
    if (users.length === 0) {
      const adminUser: User = {
        id: 'admin_001',
        email: 'admin@auctionhub.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isEmailVerified: true,
        createdAt: new Date()
      };
      setUsers([adminUser]);
    }
  }, [users.length, setUsers]);

  const authState: AuthContextType = {
    isAuthenticated: !!user,
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
    updateProfile
  };

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};