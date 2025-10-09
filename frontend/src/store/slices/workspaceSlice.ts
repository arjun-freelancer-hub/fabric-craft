import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { workspaceApi } from '@/lib/api';

export interface Workspace {
    id: string;
    name: string;
    description?: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    memberCount: number;
    joinedAt: string;
    isActive: boolean;
}

export interface WorkspaceMember {
    id: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        username: string;
    };
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    joinedAt: string;
    isActive: boolean;
}

interface WorkspaceState {
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    members: WorkspaceMember[];
    invitations: any[];
    isLoading: boolean;
    error: string | null;
}

const initialState: WorkspaceState = {
    workspaces: [],
    currentWorkspace: null,
    members: [],
    invitations: [],
    isLoading: false,
    error: null,
};

// Async Thunks
export const fetchWorkspaces = createAsyncThunk(
    'workspace/fetchWorkspaces',
    async (_, { rejectWithValue }) => {
        try {
            const response = await workspaceApi.getWorkspaces();
            return response.data.workspaces;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch workspaces');
        }
    }
);

export const fetchWorkspaceDetails = createAsyncThunk(
    'workspace/fetchDetails',
    async (workspaceId: string, { rejectWithValue }) => {
        try {
            const response = await workspaceApi.getWorkspace(workspaceId);
            return response.data.workspace;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch workspace details');
        }
    }
);

export const fetchWorkspaceMembers = createAsyncThunk(
    'workspace/fetchMembers',
    async (workspaceId: string, { rejectWithValue }) => {
        try {
            const response = await workspaceApi.getMembers(workspaceId);
            return response.data.members;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch members');
        }
    }
);

export const fetchWorkspaceInvitations = createAsyncThunk(
    'workspace/fetchInvitations',
    async (workspaceId: string, { rejectWithValue }) => {
        try {
            const response = await workspaceApi.getInvitations(workspaceId);
            return response.data.invitations;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch invitations');
        }
    }
);

export const inviteMember = createAsyncThunk(
    'workspace/inviteMember',
    async (
        { workspaceId, email, role }: { workspaceId: string; email: string; role: 'ADMIN' | 'MEMBER' },
        { rejectWithValue, dispatch }
    ) => {
        try {
            const response = await workspaceApi.inviteMember(workspaceId, email, role);
            // Refresh invitations after successful invite
            dispatch(fetchWorkspaceInvitations(workspaceId));
            return response.data.invitation;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send invitation');
        }
    }
);

export const updateMemberRole = createAsyncThunk(
    'workspace/updateMemberRole',
    async (
        {
            workspaceId,
            userId,
            role,
        }: { workspaceId: string; userId: string; role: 'OWNER' | 'ADMIN' | 'MEMBER' },
        { rejectWithValue, dispatch }
    ) => {
        try {
            await workspaceApi.updateMemberRole(workspaceId, userId, role);
            // Refresh members after role update
            dispatch(fetchWorkspaceMembers(workspaceId));
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update role');
        }
    }
);

export const removeMember = createAsyncThunk(
    'workspace/removeMember',
    async (
        { workspaceId, userId }: { workspaceId: string; userId: string },
        { rejectWithValue, dispatch }
    ) => {
        try {
            await workspaceApi.removeMember(workspaceId, userId);
            // Refresh members after removal
            dispatch(fetchWorkspaceMembers(workspaceId));
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove member');
        }
    }
);

export const resendInvitation = createAsyncThunk(
    'workspace/resendInvitation',
    async (
        { workspaceId, invitationId }: { workspaceId: string; invitationId: string },
        { rejectWithValue, dispatch }
    ) => {
        try {
            await workspaceApi.resendInvitation(workspaceId, invitationId);
            // Refresh invitations after resend
            dispatch(fetchWorkspaceInvitations(workspaceId));
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to resend invitation');
        }
    }
);

export const cancelInvitation = createAsyncThunk(
    'workspace/cancelInvitation',
    async (
        { workspaceId, invitationId }: { workspaceId: string; invitationId: string },
        { rejectWithValue, dispatch }
    ) => {
        try {
            await workspaceApi.cancelInvitation(workspaceId, invitationId);
            // Refresh invitations after cancellation
            dispatch(fetchWorkspaceInvitations(workspaceId));
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to cancel invitation');
        }
    }
);

export const createWorkspace = createAsyncThunk(
    'workspace/create',
    async (
        { name, description }: { name: string; description?: string },
        { rejectWithValue, dispatch }
    ) => {
        try {
            const response = await workspaceApi.createWorkspace(name, description);
            // Refresh workspaces list
            dispatch(fetchWorkspaces());
            return response.data.workspace;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create workspace');
        }
    }
);

const workspaceSlice = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        setCurrentWorkspace: (state, action: PayloadAction<string>) => {
            const workspace = state.workspaces.find((w) => w.id === action.payload);
            if (workspace) {
                state.currentWorkspace = workspace;
                localStorage.setItem('currentWorkspaceId', workspace.id);
            }
        },
        setWorkspaces: (state, action: PayloadAction<Workspace[]>) => {
            state.workspaces = action.payload;

            // Auto-select workspace if none selected
            if (!state.currentWorkspace && action.payload.length > 0) {
                const savedId = localStorage.getItem('currentWorkspaceId');
                const workspace = savedId
                    ? action.payload.find((w) => w.id === savedId)
                    : action.payload[0];

                if (workspace) {
                    state.currentWorkspace = workspace;
                    localStorage.setItem('currentWorkspaceId', workspace.id);
                }
            }
        },
        clearWorkspace: (state) => {
            state.currentWorkspace = null;
            state.workspaces = [];
            state.members = [];
            state.invitations = [];
            localStorage.removeItem('currentWorkspaceId');
        },
    },
    extraReducers: (builder) => {
        // Fetch Workspaces
        builder.addCase(fetchWorkspaces.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchWorkspaces.fulfilled, (state, action) => {
            state.isLoading = false;
            state.workspaces = action.payload;

            // Auto-select workspace if none selected
            if (!state.currentWorkspace && action.payload.length > 0) {
                const savedId = localStorage.getItem('currentWorkspaceId');
                const workspace = savedId
                    ? action.payload.find((w: Workspace) => w.id === savedId)
                    : action.payload[0];

                if (workspace) {
                    state.currentWorkspace = workspace;
                    localStorage.setItem('currentWorkspaceId', workspace.id);
                }
            }
        });
        builder.addCase(fetchWorkspaces.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Fetch Members
        builder.addCase(fetchWorkspaceMembers.fulfilled, (state, action) => {
            state.members = action.payload;
        });

        // Fetch Invitations
        builder.addCase(fetchWorkspaceInvitations.fulfilled, (state, action) => {
            state.invitations = action.payload;
        });
    },
});

export const { setCurrentWorkspace, setWorkspaces, clearWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;

