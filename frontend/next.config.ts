import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {},
  images: {
    remotePatterns: [
      { hostname: 'euc.li' },
      { hostname: 'metadata.ens.domains' },
      { hostname: 'ipfs.io' },
      { hostname: 'ipfs.io' },
      { hostname: '*.ipfs.dweb.link' },
      { hostname: 'api.dicebear.com' },
    ],
  },
};

export default nextConfig;
