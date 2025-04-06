/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Desativando a verificação durante o build - erros ainda aparecerão durante o desenvolvimento
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 