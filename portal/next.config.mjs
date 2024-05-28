/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,

    },
    trailingSlash: true,
    images: { unoptimized: true },
    reactStrictMode: false,  
    experimental: {
        missingSuspenseWithCSRBailout: false,
      },


};

export default nextConfig;
