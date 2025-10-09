'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Store, Users, Shield, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/AuthProvider';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores (no hyphens or spaces)'
    ),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must include uppercase, lowercase, number, and special character'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  organizationName: z.string().min(1, 'Workspace name is required').max(100, 'Workspace name must be less than 100 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        username: data.username,
        password: data.password,
        organizationName: data.organizationName,
      });
      toast.success('Registration successful! Redirecting to dashboard...');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <Store className="h-10 w-10" />
            <h1 className="text-3xl font-bold">FabricCraft Billing</h1>
          </div>

          <div className="space-y-6 mt-16">
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Complete Billing Solution</h3>
                <p className="text-indigo-100">
                  Manage products, customers, invoices, and inventory in one place
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
                <p className="text-indigo-100">
                  Invite up to 2 team members per workspace to work together
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
                <p className="text-indigo-100">
                  Your data is encrypted and backed up with enterprise-grade security
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>Free forever for up to 3 users</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>Get started in less than 2 minutes</span>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
        <Card className="w-full max-w-lg shadow-xl border-0">
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 lg:hidden">
              <Store className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-base">
              Start managing your business in minutes
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="firstName"
                      placeholder="Arjun"
                      {...register('firstName')}
                      className={`h-11 ${errors.firstName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="lastName"
                      placeholder="Kumar"
                      {...register('lastName')}
                      className={`h-11 ${errors.lastName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Credentials */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Account Credentials</h3>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="arjun@example.com"
                    {...register('email')}
                    className={`h-11 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="username"
                    placeholder="arjun_kumar"
                    {...register('username')}
                    className={`h-11 ${errors.username ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {errors.username && (
                    <p className="text-xs text-red-600">{errors.username.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    3-20 characters, only letters, numbers, and underscores
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      {...register('password')}
                      className={`h-11 pr-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600">{errors.password.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Must include uppercase, lowercase, number, and special character (@$!%*?&)
                  </p>
                </div>
              </div>

              {/* Workspace */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Workspace Setup</h3>

                <div className="space-y-2">
                  <label htmlFor="organizationName" className="text-sm font-medium text-gray-700">
                    Workspace Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="organizationName"
                    placeholder="Test shop"
                    {...register('organizationName')}
                    className={`h-11 ${errors.organizationName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {errors.organizationName && (
                    <p className="text-xs text-red-600">{errors.organizationName.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    You'll be the owner and can invite up to 2 team members
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating your account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm hover:underline transition-colors"
              >
                Sign in to your account →
              </Link>
            </div>

            <p className="text-xs text-center text-gray-500 pt-4">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
