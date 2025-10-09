import Cookies from 'js-cookie';

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

// Cookie options for security
const cookieOptions = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  expires: 7, // 7 days
};

export const authUtils = {
  // Set authentication token and user data
  setAuth: (token: string, user: User) => {
    Cookies.set(AUTH_TOKEN_KEY, token, cookieOptions);
    Cookies.set(USER_DATA_KEY, JSON.stringify(user), cookieOptions);
  },

  // Get authentication token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return Cookies.get(AUTH_TOKEN_KEY) || null;
  },

  // Get user data
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userData = Cookies.get(USER_DATA_KEY);
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  // Get current auth state
  getAuthState: (): AuthState => {
    const token = authUtils.getToken();
    const user = authUtils.getUser();

    return {
      isAuthenticated: !!token && !!user,
      user,
      token,
    };
  },

  // Clear authentication data
  clearAuth: () => {
    Cookies.remove(AUTH_TOKEN_KEY);
    Cookies.remove(USER_DATA_KEY);
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