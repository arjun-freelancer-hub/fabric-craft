/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
            },
            {
                protocol: 'http',
                hostname: 'backend',
            },
        ],
        unoptimized: true,
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Clothing Store',
    },
    async rewrites() {
        // Get API URL with fallback for build time
        // Use backend hostname in Docker, localhost when accessed from browser
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        // For Docker internal communication, use backend service name
        const backendUrl = process.env.BACKEND_URL || 'http://backend:5001/api';

        return [
            {
                source: '/api/:path*',
                // Rewrite to backend - will be proxied by Next.js server
                destination: `${backendUrl}/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
