const apiGatewayOrigin = process.env.API_GATEWAY_ORIGIN || 'http://localhost:8080';

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
