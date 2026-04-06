const configuredApiGatewayOrigin = process.env.API_GATEWAY_ORIGIN;
const isHostedProductionBuild =
  process.env.NODE_ENV === 'production' &&
  (process.env.VERCEL === '1' || process.env.NETLIFY === 'true');

if (isHostedProductionBuild && !configuredApiGatewayOrigin) {
  throw new Error('API_GATEWAY_ORIGIN must be set for hosted frontend builds.');
}

const apiGatewayOrigin = (configuredApiGatewayOrigin || 'http://localhost:8080').replace(/\/$/, '');

module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiGatewayOrigin}/api/:path*`,
      },
    ]
  },
}
