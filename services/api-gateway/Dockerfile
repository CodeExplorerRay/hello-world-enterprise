FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN addgroup -S app && adduser -S -G app app && chown -R app:app /app

EXPOSE 8080

USER app

CMD ["npm", "start"]
