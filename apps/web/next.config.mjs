import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputFileTracingRoot = path.resolve(__dirname, "../..");

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
    outputFileTracingRoot,
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
