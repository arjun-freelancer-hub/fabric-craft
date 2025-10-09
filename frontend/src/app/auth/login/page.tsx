'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/providers/AuthProvider';
import { Scissors, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast({
                title: "Missing Information",
                description: "Please enter both email and password",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsLoading(true);
            await login(email, password);

            toast({
                title: "Login Successful",
                description: "Welcome back!",
            });
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message || "Invalid email or password",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 fabric-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Scissors className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">FabricCraft Billing</h1>
                    <p className="text-muted-foreground mt-2">Professional Clothing Store Management</p>
                </div>

                {/* Login Form */}
                <Card className="pos-card">
                    <CardHeader>
                        <CardTitle className="text-center">Sign In</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@fabriccraft.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full primary-gradient text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? "Signing In..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="mt-4 text-center">
                            <Button
                                variant="link"
                                className="p-0 h-auto text-sm text-muted-foreground hover:text-primary"
                                onClick={() => router.push('/auth/forgot-password')}
                                disabled={isLoading}
                            >
                                Forgot password?
                            </Button>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <Button
                                    variant="link"
                                    className="p-0 h-auto text-primary"
                                    onClick={() => router.push('/auth/register')}
                                    disabled={isLoading}
                                >
                                    Sign up
                                </Button>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Demo Credentials */}
                <Card className="mt-4 pos-card">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Demo Credentials</h3>
                            <div className="text-xs text-muted-foreground space-y-1">
                                <p><strong>Admin:</strong> admin@fabriccraft.com / admin123</p>
                                <p><strong>Staff:</strong> staff@fabriccraft.com / staff123</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}