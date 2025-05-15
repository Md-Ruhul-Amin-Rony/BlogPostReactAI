import db from '../lib/db';
import { User } from '../types';

// Simulated JWT token creation
const generateToken = (userId: string): string => {
  // This is a simplified token without actual JWT encoding
  // In a real app, you would use a proper JWT library
  const payload = { userId, exp: Date.now() + 24 * 60 * 60 * 1000 };
  return btoa(JSON.stringify(payload));
};

// Decode token
const decodeToken = (token: string): { userId: string; exp: number } | null => {
  try {
    return JSON.parse(atob(token));
  } catch (error) {
    return null;
  }
};

// Validate token
const validateToken = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return false;
  
  // Check if token is expired
  return decoded.exp > Date.now();
};

// Login
const login = (email: string, password: string): { user: User; token: string } | null => {
  const user = db.getUserByEmail(email);
  
  if (!user || user.password !== password) {
    return null;
  }
  
  const token = generateToken(user.id);
  
  // Store token in localStorage
  localStorage.setItem('token', token);
  
  return { user, token };
};

// Register
const register = (userData: Pick<User, 'username' | 'email' | 'password' | 'profilePicture' | 'bio'>): { user: User; token: string } | null => {
  // Check if email is already taken
  const existingUser = db.getUserByEmail(userData.email);
  if (existingUser) {
    return null;
  }
  
  // Create new user
  const user = db.createUser(userData);
  
  // Generate token
  const token = generateToken(user.id);
  
  // Store token in localStorage
  localStorage.setItem('token', token);
  
  return { user, token };
};

// Logout
const logout = (): void => {
  localStorage.removeItem('token');
};

// Get current user from token
const getCurrentUser = (): User | null => {
  const token = localStorage.getItem('token');
  if (!token || !validateToken(token)) {
    return null;
  }
  
  const decoded = decodeToken(token);
  if (!decoded) {
    return null;
  }
  
  const user = db.getUserById(decoded.userId);
  return user || null;
};

// Update user profile
const updateProfile = (userId: string, userData: Partial<User>): User | null => {
  const updatedUser = db.updateUser(userId, userData);
  return updatedUser || null;
};

const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  updateProfile,
};

export default authService;