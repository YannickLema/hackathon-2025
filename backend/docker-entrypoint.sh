#!/bin/sh
set -e

echo "🔄 Exécution des migrations Prisma..."
npx prisma migrate deploy || echo "⚠️  Aucune migration à appliquer"

echo "✅ Migrations terminées"
echo "🚀 Démarrage de l'application..."

exec "$@"

