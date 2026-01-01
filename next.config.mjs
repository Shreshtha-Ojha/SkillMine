import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        domains:[
            'assets.aceternity.com',
            'images.unsplash.com',
            'www.w3.org',
            'aceternity.com',
            'i0.wp.com',
            'th.bing.com',
            'jaredchu.com',
            'res.cloudinary.com'
        ]
    },
    // Security headers
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(self), geolocation=()'
                    }
                ]
            }
        ];
    }
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
    // Suppresses source map uploading logs during build
    silent: true,

    // Upload source maps only in production
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,

    // Auth token for uploading source maps (set in environment)
    authToken: process.env.SENTRY_AUTH_TOKEN,

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Disables the Sentry webpack plugin in development
    disableServerWebpackPlugin: process.env.NODE_ENV !== "production",
    disableClientWebpackPlugin: process.env.NODE_ENV !== "production",
};

// Wrap config with Sentry (only affects production builds)
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
