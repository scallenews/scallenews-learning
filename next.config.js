/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/**/*": ["./infra/migrations/**/*"],
    "/**/*": ["./infra/migrations/**/*"],
  },
};

export default nextConfig;
