'use client';

import { useState, useEffect } from 'react';
import { useWorkspace } from '@/store/hooks';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UserPlus, Mail, Trash2, Crown, Shield, User as UserIcon, Copy, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TeamManagement() {
    const { toast } = useToast();
    const {
        currentWorkspace,
        members,
        invitations,
        fetchMembers,
        fetchInvitations,
        inviteMember,
        updateMemberRole,
        removeMember,
        resendInvitation,
        cancelInvitation,
    } = useWorkspace();

    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resendingInvitations, setResendingInvitations] = useState<Set<string>>(new Set());
    const [cancellingInvitations, setCancellingInvitations] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (currentWorkspace) {
            fetchMembers(currentWorkspace.id);
            fetchInvitations(currentWorkspace.id);
        }
    }, [currentWorkspace]);

    const handleInvite = async () => {
        if (!currentWorkspace || !email) return;

        setIsSubmitting(true);
        try {
            await inviteMember(currentWorkspace.id, email, role);
            toast({
                title: "Success",
                description: "Invitation sent successfully!",
            });
            setEmail('');
            setRole('MEMBER');
            setIsInviteDialogOpen(false);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || 'Failed to send invitation',
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: 'OWNER' | 'ADMIN' | 'MEMBER') => {
        if (!currentWorkspace) return;

        try {
            await updateMemberRole(currentWorkspace.id, userId, newRole);
            toast({
                title: "Success",
                description: "Role updated successfully!",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || 'Failed to update role',
                variant: "destructive",
            });
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!currentWorkspace) return;

        try {
            await removeMember(currentWorkspace.id, userId);
            toast({
                title: "Success",
                description: "Member removed successfully!",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || 'Failed to remove member',
                variant: "destructive",
            });
        }
    };

    const handleResendInvitation = async (invitationId: string) => {
        if (!currentWorkspace) return;

        // Add invitation to resending set
        setResendingInvitations(prev => new Set(prev).add(invitationId));

        try {
            await resendInvitation(currentWorkspace.id, invitationId);
            toast({
                title: "Success",
                description: "Invitation resent successfully!",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || 'Failed to resend invitation',
                variant: "destructive",
            });
        } finally {
            // Remove invitation from resending set
            setResendingInvitations(prev => {
                const newSet = new Set(prev);
                newSet.delete(invitationId);
                return newSet;
            });
        }
    };

    const handleCancelInvitation = async (invitationId: string) => {
        if (!currentWorkspace) return;

        // Add invitation to cancelling set
        setCancellingInvitations(prev => new Set(prev).add(invitationId));

        try {
            await cancelInvitation(currentWorkspace.id, invitationId);
            toast({
                title: "Success",
                description: "Invitation cancelled successfully!",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || 'Failed to cancel invitation',
                variant: "destructive",
            });
        } finally {
            // Remove invitation from cancelling set
            setCancellingInvitations(prev => {
                const newSet = new Set(prev);
                newSet.delete(invitationId);
                return newSet;
            });
        }
    };

    const canInvite = currentWorkspace?.role === 'OWNER' || currentWorkspace?.role === 'ADMIN';
    const isOwner = currentWorkspace?.role === 'OWNER';
    const memberLimit = 3;
    const canInviteMore = members.length < memberLimit;

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'OWNER':
                return <Crown className="h-4 w-4 text-yellow-600" />;
            case 'ADMIN':
                return <Shield className="h-4 w-4 text-blue-600" />;
            default:
                return <UserIcon className="h-4 w-4 text-gray-600" />;
        }
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'OWNER':
                return 'default';
            case 'ADMIN':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            {/* Team Members */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>
                                Manage your workspace members ({members.length}/{memberLimit})
                            </CardDescription>
                        </div>
                        {canInvite && (
                            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button disabled={!canInviteMore}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Invite Member
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Invite Team Member</DialogTitle>
                                        <DialogDescription>
                                            Invite someone to join your workspace. They'll receive an email with an invitation link.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email Address</label>
                                            <Input
                                                type="email"
                                                placeholder="colleague@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Role</label>
                                            <Select value={role} onValueChange={(value: any) => setRole(value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {isOwner && (
                                                        <SelectItem value="ADMIN">
                                                            <div className="flex items-center gap-2">
                                                                <Shield className="h-4 w-4" />
                                                                Admin - Can invite and manage members
                                                            </div>
                                                        </SelectItem>
                                                    )}
                                                    <SelectItem value="MEMBER">
                                                        <div className="flex items-center gap-2">
                                                            <UserIcon className="h-4 w-4" />
                                                            Member - Can access workspace data
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button onClick={handleInvite} className="w-full" disabled={isSubmitting}>
                                            {isSubmitting ? 'Sending...' : 'Send Invitation'}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {!canInviteMore && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                            Member limit reached. You have {members.length} out of {memberLimit} members maximum.
                        </div>
                    )}

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                {isOwner && <TableHead>Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="font-medium">
                                            {member.user.firstName} {member.user.lastName}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            @{member.user.username}
                                        </div>
                                    </TableCell>
                                    <TableCell>{member.user.email}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getRoleIcon(member.role)}
                                            {isOwner && member.role !== 'OWNER' ? (
                                                <Select
                                                    value={member.role}
                                                    onValueChange={(value: any) => handleUpdateRole(member.user.id, value)}
                                                >
                                                    <SelectTrigger className="w-[120px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                                        <SelectItem value="MEMBER">Member</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge variant={getRoleBadgeVariant(member.role)}>
                                                    {member.role}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(member.joinedAt).toLocaleDateString()}
                                    </TableCell>
                                    {isOwner && (
                                        <TableCell>
                                            {member.role !== 'OWNER' && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Remove Member?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to remove {member.user.firstName} {member.user.lastName} from this workspace?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleRemoveMember(member.user.id)}
                                                                className="bg-red-500 hover:bg-red-600"
                                                            >
                                                                Remove
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pending Invitations */}
            {canInvite && invitations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Invitations</CardTitle>
                        <CardDescription>
                            Invitations that haven't been accepted yet
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Sent</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invitations.filter((inv) => inv.status === 'PENDING').map((invitation) => (
                                    <TableRow key={invitation.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                {invitation.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getRoleBadgeVariant(invitation.role)}>
                                                {invitation.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(invitation.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(invitation.expiresAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{invitation.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleResendInvitation(invitation.id)}
                                                    disabled={resendingInvitations.has(invitation.id)}
                                                    title="Resend invitation email"
                                                >
                                                    {resendingInvitations.has(invitation.id) ? (
                                                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="h-4 w-4 text-blue-500" />
                                                    )}
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={cancellingInvitations.has(invitation.id)}
                                                            title="Cancel invitation"
                                                        >
                                                            {cancellingInvitations.has(invitation.id) ? (
                                                                <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            )}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Cancel Invitation?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to cancel the invitation for {invitation.email}?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleCancelInvitation(invitation.id)}
                                                                className="bg-red-500 hover:bg-red-600"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

