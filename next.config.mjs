/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        remotePatterns:[
            {
                protocol:"https",
                hostname:"randomuser.me"
            }
        ]
    },
    // Disable Clerk warnings
    env: {
        CLERK_DISABLE_WARNINGS: 'true'
    },
    // Suppress console warnings
    webpack: (config, { dev }) => {
        if (dev) {
            config.ignoreWarnings = [
                /Clock skew detected/,
                /JWT issued at date claim/,
                /infinite redirect loop/
            ];
        }
        return config;
    }
};

export default nextConfig;