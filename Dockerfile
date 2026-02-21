FROM node:20-alpine

WORKDIR /app

# Copy server files
COPY server/package*.json ./
COPY server/prisma ./prisma/

# Install dependencies (triggers postinstall → prisma generate)
RUN npm install

# Copy rest of server source
COPY server/ .

# Build TypeScript
RUN npm run build

EXPOSE 3001

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]