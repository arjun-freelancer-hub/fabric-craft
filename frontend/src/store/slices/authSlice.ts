import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/lib/api';
import { authUtils } from '@/lib/auth';

interface User {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: authUtils.getUser(),
    isAuthenticated: !!authUtils.getToken(),
    isLoading: false,
    error: null,
};

// Async Thunks
export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await authApi.login(email, password);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (
        userData: {
            email: string;
            username: string;
            password: string;
            firstName: string;
            lastName: string;
            organizationName?: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await authApi.register(userData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
    await authApi.logout();
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
    try {
        const response = await authApi.getProfile();
        return response.data.user;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        clearAuth: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            authUtils.clearAuth();
            localStorage.removeItem('currentWorkspaceId');
        },
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.error = null;
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Register
        builder.addCase(registerUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.error = null;
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Logout
        builder.addCase(logoutUser.fulfilled, (state) => {
            state.user = null;
            state.isAuthenticated = false;
            authUtils.clearAuth();
            localStorage.removeItem('currentWorkspaceId');
        });

        // Fetch Profile
        builder.addCase(fetchProfile.fulfilled, (state, action) => {
            state.user = action.payload;
        });
    },
});

export const { setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;

