FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV HOST=0.0.0.0
ENV AI_DECISION_ENGINE_PORT=8081
EXPOSE 8081

CMD ["node", "index.js"]
