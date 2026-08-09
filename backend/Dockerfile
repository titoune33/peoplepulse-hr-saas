FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

ENV PORT=3002
ENV NODE_ENV=production

EXPOSE 3002

CMD ["node", "dist/index.js"]
