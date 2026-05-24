# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3001

# Run migrations + seed, then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && node server.js"]
