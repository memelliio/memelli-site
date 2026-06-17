/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  env: {
    NEXT_PUBLIC_RAIL: "https://memelli-bar-control.up.railway.app"
  }
};
module.exports = nextConfig;
