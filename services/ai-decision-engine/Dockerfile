FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN addgroup -S app && adduser -S -G app app && chown -R app:app /app

ENV HOST=0.0.0.0
ENV AI_DECISION_ENGINE_PORT=8081
EXPOSE 8081

USER app

CMD ["node", "index.js"]
