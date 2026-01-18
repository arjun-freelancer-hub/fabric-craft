import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'FabricCraft Billing - Professional Clothing Store Management',
    description: 'Complete billing and inventory management system for clothing stores with POS, customer management, and measurement tracking',
    keywords: ['billing', 'inventory', 'clothing', 'store', 'management', 'POS', 'tailoring', 'fabric'],
    authors: [{ name: 'FabricCraft Billing System' }],
    manifest: '/manifest.json',
    icons: {
        icon: '/favicon.svg',
        apple: '/favicon.svg',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
