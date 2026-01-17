const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

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
  // Note: setAuth() removed - cookies are now set server-side via route handlers
  // Use the login route handler at /api/auth/login to set cookies

  // Get authentication token (client-side only)
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return getCookie(AUTH_TOKEN_KEY);
  },

  // Get user data (client-side only)
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userData = getCookie(USER_DATA_KEY);
    if (!userData) return null;
    try {
      return JSON.parse(decodeURIComponent(userData));
    } catch {
      return null;
    }
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
  // Note: For proper logout, use the logout API endpoint which clears cookies server-side
  clearAuth: () => {
    if (typeof window === 'undefined') return;
    // Clear cookies by setting them to expire
    document.cookie = `${AUTH_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${USER_DATA_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
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