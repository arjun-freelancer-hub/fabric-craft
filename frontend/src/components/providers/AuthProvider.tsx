'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authUtils, AuthContextType, AuthState, User, defaultAuthState } from '@/lib/auth';
import { authApi, workspaceApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store';
import { setWorkspaces } from '@/store/slices/workspaceSlice';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>(defaultAuthState);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const currentAuthState = authUtils.getAuthState();

                if (currentAuthState.isAuthenticated) {
                    // Verify token is still valid by fetching profile
                    try {
                        await authApi.getProfile();
                        setAuthState(currentAuthState);
                    } catch (error) {
                        // Token is invalid, clear auth data
                        authUtils.clearAuth();
                        setAuthState(defaultAuthState);
                    }
                } else {
                    setAuthState(defaultAuthState);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                setAuthState(defaultAuthState);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await authApi.login(email, password);

            if (response.success) {
                const newAuthState = authUtils.getAuthState();
                setAuthState(newAuthState);

                // Set workspaces in Redux
                const workspaces = (response.data as any).workspaces;
                if (workspaces) {
                    dispatch(setWorkspaces(workspaces));
                }

                // Redirect to dashboard or intended page
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect') || '/dashboard';
                router.push(redirect);
            }
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: {
        firstName: string;
        lastName: string;
        email: string;
        username: string;
        password: string;
        organizationName?: string;
    }) => {
        try {
            setIsLoading(true);
            const response = await authApi.register(userData);

            if (response.success) {
                const newAuthState = authUtils.getAuthState();
                setAuthState(newAuthState);

                // Set workspaces in Redux
                const workspaces = (response.data as any).workspaces;
                if (workspaces) {
                    dispatch(setWorkspaces(workspaces));
                }

                // Redirect to dashboard after registration (auto-login)
                router.push('/dashboard');
            }
        } catch (error: any) {
            console.error('Registration error:', error);

            // Extract the most specific error message available
            let errorMessage = 'Registration failed. Please try again.';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            // Handle specific error cases with helpful messages
            if (error.response?.status === 0 || error.code === 'NETWORK_ERROR') {
                errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
            } else if (error.response?.status === 409) {
                errorMessage = 'Email or username already exists. Please use different credentials.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error. Please try again later or contact support.';
            }

            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await authApi.logout();
            setAuthState(defaultAuthState);

            // Clear Redux state
            dispatch(setWorkspaces([]));
            localStorage.removeItem('currentWorkspaceId');

            router.push('/auth/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if logout fails, clear local state
            setAuthState(defaultAuthState);
            dispatch(setWorkspaces([]));
            localStorage.removeItem('currentWorkspaceId');
            router.push('/auth/login');
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = (user: User) => {
        const currentToken = authUtils.getToken();
        if (currentToken) {
            authUtils.setAuth(currentToken, user);
            setAuthState(prev => ({ ...prev, user }));
        }
    };

    const value: AuthContextType = {
        authState,
        login,
        register,
        logout,
        updateUser,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Higher-order component for protecting routes
export const withAuth = <P extends object>(
    Component: React.ComponentType<P>,
    requiredRole?: string
) => {
    return function AuthenticatedComponent(props: P) {
        const { authState, isLoading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!isLoading) {
                if (!authState.isAuthenticated) {
                    router.push('/auth/login');
                    return;
                }

                if (requiredRole && authState.user?.role !== requiredRole) {
                    router.push('/dashboard');
                    return;
                }
            }
        }, [authState, isLoading, router]);

        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="loading-spinner"></div>
                </div>
            );
        }

        if (!authState.isAuthenticated) {
            return null;
        }

        if (requiredRole && authState.user?.role !== requiredRole) {
            return null;
        }

        return <Component {...props} />;
    };
};