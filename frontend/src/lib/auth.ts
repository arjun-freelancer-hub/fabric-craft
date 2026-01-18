const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';
const REFRESH_TOKEN_KEY = 'refreshToken';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role?: string;
  isActive?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// Helper function to get cookie value by name (client-side only)
function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Helper function to set cookie (client-side only)
// Note: Cookies set from client-side cannot be httpOnly, but they can be read by proxy/server
function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSite = isProduction ? 'Strict' : 'Lax';
  
  // Set cookie with proper attributes for proxy access
  // SameSite=Lax/Strict allows cookies to be sent in cross-site requests (for proxy)
  // Secure flag only in production (HTTPS)
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=${sameSite}${isProduction ? '; Secure' : ''}`;
}

// Helper function to delete cookie (client-side only)
function deleteCookie(name: string): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

// Server-side cookie utilities using Next.js cookies API
// These functions are safe to use in server components and middleware
export const serverAuthUtils = {
  // Get authentication token from server-side cookies
  getToken: async (): Promise<string | null> => {
    if (typeof window !== 'undefined') {
      // Client-side, use client utilities
      return null;
    }
    
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      return cookieStore.get(AUTH_TOKEN_KEY)?.value || null;
    } catch {
      return null;
    }
  },

  // Get user data from server-side cookies
  getUser: async (): Promise<User | null> => {
    if (typeof window !== 'undefined') {
      // Client-side, use client utilities
      return null;
    }

    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const userData = cookieStore.get(USER_DATA_KEY)?.value;
      if (!userData) return null;
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  // Get current auth state from server-side cookies
  getAuthState: async (): Promise<AuthState> => {
    const token = await serverAuthUtils.getToken();
    const user = await serverAuthUtils.getUser();

    return {
      isAuthenticated: !!token && !!user,
      user,
      token,
    };
  },
};

export const authUtils = {
  // Set authentication data (stores in cookies for proxy access)
  setAuth: (token: string, user: User, refreshToken?: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      // Store token in cookie (readable by proxy/server)
      setCookie(AUTH_TOKEN_KEY, token, 7); // 7 days
      
      // Store user data in cookie (readable by proxy/server)
      setCookie(USER_DATA_KEY, JSON.stringify(user), 7);
      
      // Store refresh token if provided
      if (refreshToken) {
        setCookie(REFRESH_TOKEN_KEY, refreshToken, 30); // 30 days for refresh token
      }
    } catch (error) {
      console.error('Error saving auth data to cookies:', error);
    }
  },

  // Get authentication token from cookies (readable by proxy)
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Read from cookies (for proxy access)
    const token = getCookie(AUTH_TOKEN_KEY);
    if (token) {
      return decodeURIComponent(token);
    }
    
    return null;
  },

  // Get user data from cookies (readable by proxy)
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    
    const cookieUserData = getCookie(USER_DATA_KEY);
    if (!cookieUserData) return null;
    
    try {
      return JSON.parse(decodeURIComponent(cookieUserData));
    } catch (error) {
      console.error('Error parsing user data from cookie:', error);
      return null;
    }
  },

  // Get refresh token from cookies (readable by proxy)
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    const refreshToken = getCookie(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      return decodeURIComponent(refreshToken);
    }
    
    return null;
  },

  // Get current auth state (client-side only)
  getAuthState: (): AuthState => {
    const token = authUtils.getToken();
    const user = authUtils.getUser();

    return {
      isAuthenticated: !!token && !!user,
      user,
      token,
    };
  },

  // Clear authentication data (client-side only)
  clearAuth: () => {
    if (typeof window === 'undefined') return;
    
    // Clear cookies
    deleteCookie(AUTH_TOKEN_KEY);
    deleteCookie(USER_DATA_KEY);
    deleteCookie(REFRESH_TOKEN_KEY);
    
    // Also clear localStorage if it exists (for backward compatibility during migration)
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      // Ignore localStorage errors
    }
  },

  // Check if user has specific role
  hasRole: (role: string): boolean => {
    const user = authUtils.getUser();
    return user?.role?.toUpperCase() === role.toUpperCase();
  },

  // Check if user has any of the specified roles
  hasAnyRole: (roles: string[]): boolean => {
    const user = authUtils.getUser();
    return user ? roles.map(r => r.toUpperCase()).includes(user.role?.toUpperCase()) : false;
  },

  // Role hierarchy: OWNER > ADMIN > STAFF
  roleHierarchy: {
    OWNER: 3,
    ADMIN: 2,
    STAFF: 1,
  } as Record<string, number>,

  // Check if user has minimum role level (hierarchical)
  hasMinRole: (minRole: string): boolean => {
    const user = authUtils.getUser();
    if (!user?.role) return false;

    const userLevel = authUtils.roleHierarchy[user.role.toUpperCase()] || 0;
    const minLevel = authUtils.roleHierarchy[minRole.toUpperCase()] || 0;

    return userLevel >= minLevel;
  },

  // Check if user is owner
  isOwner: (): boolean => {
    return authUtils.hasRole('OWNER');
  },

  // Check if user is admin or higher
  isAdmin: (): boolean => {
    return authUtils.hasMinRole('ADMIN');
  },

  // Check if user is staff or higher
  isStaff: (): boolean => {
    return authUtils.hasMinRole('STAFF');
  },

  // Check if user can manage another role
  canManageRole: (targetRole: string): boolean => {
    const user = authUtils.getUser();
    if (!user?.role) return false;

    const userLevel = authUtils.roleHierarchy[user.role.toUpperCase()] || 0;
    const targetLevel = authUtils.roleHierarchy[targetRole.toUpperCase()] || 0;

    return userLevel > targetLevel;
  },

  // Check if user can invite another role
  canInviteRole: (targetRole: string): boolean => {
    return authUtils.canManageRole(targetRole);
  },
};

// Auth context type for React context
export interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    organizationName?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

// Default auth state
export const defaultAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};