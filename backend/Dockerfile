FROM node:20-alpine

WORKDIR /app

# Installer les dépendances (cached layer)
COPY package*.json ./
RUN npm ci

# Copier le code
COPY . .

EXPOSE 3000

# Entrée : nettoie éventuellement un ancien client Prisma, installe, régénère, lance Nest
CMD [ "sh", "-c", "rm -rf node_modules/.prisma && npm install && npx prisma generate && npm run start:dev" ]