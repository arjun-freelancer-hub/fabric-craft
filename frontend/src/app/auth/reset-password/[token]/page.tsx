'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/lib/api';

const resetPasswordSchema = z.object({
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            'Password must include uppercase, lowercase, number, and special character'
        ),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidToken, setIsValidToken] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const router = useRouter();
    const params = useParams();
    const token = params.token as string;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    useEffect(() => {
        verifyToken();
    }, [token]);

    const verifyToken = async () => {
        try {
            setIsVerifying(true);
            await authApi.verifyResetToken(token);
            setIsValidToken(true);
        } catch (error) {
            toast.error('Invalid or expired reset link');
            setIsValidToken(false);
            setTimeout(() => router.push('/auth/forgot-password'), 2000);
        } finally {
            setIsVerifying(false);
        }
    };

    const onSubmit = async (data: ResetPasswordFormData) => {
        setIsLoading(true);
        try {
            await authApi.resetPassword(token, data.newPassword);
            toast.success('Password reset successful! Please login with your new password');
            router.push('/auth/login');
        } catch (error: any) {
            toast.error(error.message || 'Failed to reset password');
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
                        <p>Verifying reset link...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isValidToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-red-500">Invalid Link</CardTitle>
                        <CardDescription>
                            This password reset link is invalid or has expired
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                    <CardDescription>
                        Enter your new password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="newPassword" className="text-sm font-medium">
                                New Password
                            </label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter new password"
                                    {...register('newPassword')}
                                    className={errors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
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
                            {errors.newPassword && (
                                <p className="text-sm text-red-500">{errors.newPassword.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm Password
                            </label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm new password"
                                {...register('confirmPassword')}
                                className={errors.confirmPassword ? 'border-red-500' : ''}
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
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
                                    Resetting...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

