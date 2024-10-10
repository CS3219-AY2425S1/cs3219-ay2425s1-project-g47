/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/", // The path you want to redirect from
        destination: "/questions", // The path you want to redirect to
        permanent: true, // Permanent redirect (308)
      },
    ];
  },
};

module.exports = nextConfig;
