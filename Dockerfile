FROM node:20-slim

WORKDIR /app

COPY server/package*.json ./
COPY server/prisma ./prisma/

RUN npm install

COPY server/ .

RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]