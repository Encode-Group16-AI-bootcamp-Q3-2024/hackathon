/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "obj-store.livepeer.cloud",
        port: "",
        pathname: "/livepeer-cloud-ai-images/**",
      },
    ],
  },
};

export default nextConfig;
