'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Mail, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authApi } from '@/lib/api';

const acceptInvitationSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(
            /^[a-zA-Z0-9_]+$/,
            'Username can only contain letters, numbers, and underscores (no hyphens or spaces)'
        ),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            'Password must include uppercase, lowercase, number, and special character'
        ),
    firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
});

type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;

export default function AcceptInvitationPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [invitation, setInvitation] = useState<any>(null);
    const [isVerifying, setIsVerifying] = useState(true);
    const router = useRouter();
    const params = useParams();
    const token = params.token as string;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AcceptInvitationFormData>({
        resolver: zodResolver(acceptInvitationSchema),
    });

    useEffect(() => {
        verifyInvitation();
    }, [token]);

    const verifyInvitation = async () => {
        try {
            setIsVerifying(true);
            const response = await authApi.verifyInvitation(token);
            setInvitation(response.data.invitation);
        } catch (error) {
            toast.error('Invalid or expired invitation link');
            setTimeout(() => router.push('/auth/login'), 2000);
        } finally {
            setIsVerifying(false);
        }
    };

    const onSubmit = async (data: AcceptInvitationFormData) => {
        setIsLoading(true);
        try {
            await authApi.acceptInvitation({
                token,
                username: data.username,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
            });
            toast.success('Successfully joined workspace! Redirecting...');
            router.push('/dashboard');
        } catch (error: any) {
            // Extract detailed error message from backend validation
            const errorMessage = error?.response?.data?.message || error.message || 'Failed to accept invitation';

            // Show a more user-friendly error message
            toast.error(errorMessage, {
                duration: 5000,
                style: {
                    maxWidth: '500px',
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p>Verifying invitation...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Join Workspace</CardTitle>
                    <CardDescription>
                        You've been invited to join a workspace
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {invitation && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg space-y-2">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">{invitation.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">Role:</span>
                                <Badge variant="secondary">{invitation.role}</Badge>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="text-sm font-medium">
                                    First Name
                                </label>
                                <Input
                                    id="firstName"
                                    placeholder="Enter first name"
                                    {...register('firstName')}
                                    className={errors.firstName ? 'border-red-500' : ''}
                                />
                                {errors.firstName && (
                                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="lastName" className="text-sm font-medium">
                                    Last Name
                                </label>
                                <Input
                                    id="lastName"
                                    placeholder="Enter last name"
                                    {...register('lastName')}
                                    className={errors.lastName ? 'border-red-500' : ''}
                                />
                                {errors.lastName && (
                                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium">
                                Username
                            </label>
                            <Input
                                id="username"
                                placeholder="e.g., john_doe (letters, numbers, underscores only)"
                                {...register('username')}
                                className={errors.username ? 'border-red-500' : ''}
                            />
                            {errors.username && (
                                <p className="text-sm text-red-500">{errors.username.message}</p>
                            )}
                            <p className="text-xs text-gray-500">3-20 characters, only letters, numbers, and underscores</p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a password"
                                    {...register('password')}
                                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                'Accept Invitation & Join'
                            )}
                        </Button>
                    </form>

                    <p className="mt-4 text-xs text-center text-gray-500">
                        By joining, you'll also get your own workspace where you can invite your team
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

