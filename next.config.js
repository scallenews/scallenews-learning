/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/**/*": ["./infra/migrations/**/*"],
    "/**/*": ["./infra/migrations/**/*"],
  },
};

module.exports = nextConfig;
