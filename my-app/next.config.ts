import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CONTROLLER_DOWNGRADE: process.env.NEXT_PUBLIC_CONTROLLER_DOWNGRADE || '10',
  },
};

export default nextConfig;
