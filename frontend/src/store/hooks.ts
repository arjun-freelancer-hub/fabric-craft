import { useAppDispatch, useAppSelector } from './index';
import {
    fetchWorkspaces,
    fetchWorkspaceMembers,
    fetchWorkspaceInvitations,
    inviteMember,
    updateMemberRole,
    removeMember,
    resendInvitation,
    cancelInvitation,
    setCurrentWorkspace,
    createWorkspace,
} from './slices/workspaceSlice';
import { loginUser, registerUser, logoutUser, fetchProfile } from './slices/authSlice';

// Auth hooks
export const useAuth = () => {
    const dispatch = useAppDispatch();
    const auth = useAppSelector((state) => state.auth);

    return {
        ...auth,
        login: (email: string, password: string) => dispatch(loginUser({ email, password })),
        register: (userData: any) => dispatch(registerUser(userData)),
        logout: () => dispatch(logoutUser()),
        fetchProfile: () => dispatch(fetchProfile()),
    };
};

// Workspace hooks
export const useWorkspace = () => {
    const dispatch = useAppDispatch();
    const workspace = useAppSelector((state) => state.workspace);

    return {
        ...workspace,
        fetchWorkspaces: () => dispatch(fetchWorkspaces()),
        switchWorkspace: (workspaceId: string) => {
            dispatch(setCurrentWorkspace(workspaceId));
            // Reload to update data for new workspace
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
        },
        fetchMembers: (workspaceId: string) => dispatch(fetchWorkspaceMembers(workspaceId)),
        fetchInvitations: (workspaceId: string) => dispatch(fetchWorkspaceInvitations(workspaceId)),
        inviteMember: (workspaceId: string, email: string, role: 'ADMIN' | 'MEMBER') =>
            dispatch(inviteMember({ workspaceId, email, role })),
        updateMemberRole: (workspaceId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER') =>
            dispatch(updateMemberRole({ workspaceId, userId, role })),
        removeMember: (workspaceId: string, userId: string) =>
            dispatch(removeMember({ workspaceId, userId })),
        resendInvitation: (workspaceId: string, invitationId: string) =>
            dispatch(resendInvitation({ workspaceId, invitationId })),
        cancelInvitation: (workspaceId: string, invitationId: string) =>
            dispatch(cancelInvitation({ workspaceId, invitationId })),
        createWorkspace: (name: string, description?: string) =>
            dispatch(createWorkspace({ name, description })),
    };
};

