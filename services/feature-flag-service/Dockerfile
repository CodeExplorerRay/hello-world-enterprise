FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN addgroup -S app && adduser -S -G app app && chown -R app:app /app

ENV HOST=0.0.0.0
EXPOSE 8084

USER app

CMD ["node", "index.js"]
