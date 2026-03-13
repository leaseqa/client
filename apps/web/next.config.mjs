const apiProxyOrigin =
    process.env.API_PROXY_URL ||
    process.env.NEXT_PUBLIC_HTTP_SERVER ||
    "http://localhost:4000";

const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "10mb",
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
    reactStrictMode: true,
    transpilePackages: ["@leaseqa/ui"],
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${apiProxyOrigin}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
