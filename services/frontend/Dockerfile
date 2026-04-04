FROM node:18-alpine AS builder

WORKDIR /app

ARG API_GATEWAY_ORIGIN=http://localhost:8080
ENV API_GATEWAY_ORIGIN=$API_GATEWAY_ORIGIN

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ARG API_GATEWAY_ORIGIN=http://localhost:8080
ENV API_GATEWAY_ORIGIN=$API_GATEWAY_ORIGIN

COPY --from=builder /app/package*.json ./

RUN npm install --only=production

COPY --from=builder /app/.next ./.next

EXPOSE 3000

CMD ["npm", "start"]
