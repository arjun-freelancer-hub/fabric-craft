'use client';

import { useEffect } from 'react';
import { useWorkspace } from '@/store/hooks';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Users } from 'lucide-react';

export function WorkspaceSelector() {
    const { workspaces, currentWorkspace, switchWorkspace, fetchWorkspaces, isLoading } = useWorkspace();

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    if (isLoading || workspaces.length === 0) {
        return null;
    }

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
        <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select
                value={currentWorkspace?.id}
                onValueChange={switchWorkspace}
            >
                <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent>
                    {workspaces.map((workspace) => (
                        <SelectItem key={workspace.id} value={workspace.id}>
                            <div className="flex items-center justify-between w-full gap-2">
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">{workspace.name}</span>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Users className="h-3 w-3" />
                                        <span>{workspace.memberCount} members</span>
                                    </div>
                                </div>
                                <Badge variant={getRoleBadgeVariant(workspace.role)}>
                                    {workspace.role}
                                </Badge>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

