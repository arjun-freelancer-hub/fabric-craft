'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { ReduxProvider } from './ReduxProvider';
import { AuthProvider } from './AuthProvider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        retry: (failureCount, error: any) => {
                            if (error?.response?.status === 401) {
                                return false; // Don't retry on auth errors
                            }
                            return failureCount < 3;
                        },
                    },
                    mutations: {
                        retry: (failureCount, error: any) => {
                            if (error?.response?.status === 401) {
                                return false; // Don't retry on auth errors
                            }
                            return failureCount < 2;
                        },
                    },
                },
            })
    );

    return (
        <ReduxProvider>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        {children}
                    </TooltipProvider>
                </AuthProvider>
                {process.env.NODE_ENV === 'development' && (
                    <ReactQueryDevtools initialIsOpen={false} />
                )}
            </QueryClientProvider>
        </ReduxProvider>
    );
}
