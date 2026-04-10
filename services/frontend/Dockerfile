FROM node:18-alpine AS builder

WORKDIR /app

ARG API_GATEWAY_ORIGIN=http://localhost:8080
ENV API_GATEWAY_ORIGIN=$API_GATEWAY_ORIGIN

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ARG API_GATEWAY_ORIGIN=http://localhost:8080
ENV API_GATEWAY_ORIGIN=$API_GATEWAY_ORIGIN

COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next

COPY --from=builder /app/public ./public

RUN addgroup -S nextjs && adduser -S -G nextjs nextjs && chown -R nextjs:nextjs /app

EXPOSE 3000

USER nextjs

CMD ["npm", "start"]
