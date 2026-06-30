/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/**/*": ["./infra/migrations/**/*"],
      "/**/*": ["./infra/migrations/**/*"],
    },
  },
};

module.exports = nextConfig;
