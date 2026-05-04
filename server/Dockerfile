FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN mkdir -p logs assets

EXPOSE 3000

CMD ["node", "server.js"]
