/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_RAIL: "https://memelli-io-infinity-network-production.up.railway.app"
  }
};
module.exports = nextConfig;
