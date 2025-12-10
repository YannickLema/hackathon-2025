FROM node:20-alpine

WORKDIR /app

# Installer les dépendances (cached layer)
COPY package*.json ./
RUN npm install

# Copier le code
COPY . .

EXPOSE 3000

# Entrée : nettoie éventuellement un ancien client Prisma, installe, applique les migrations, régénère, lance Nest
CMD [ "sh", "-c", "rm -rf node_modules/.prisma && npm install && npx prisma migrate deploy && npx prisma generate && npm run start:dev" ]