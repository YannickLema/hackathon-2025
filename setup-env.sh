#!/bin/bash

echo "🔧 Configuration de .env.production"
echo "===================================="

# Générer JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)

cat > .env.production << EOF
APP_NAME=purple-dog
NODE_ENV=production
POSTGRES_USER=purple
POSTGRES_PASSWORD=PurpleDog2025!Secure
POSTGRES_DB=purpledog
POSTGRES_HOST=db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://purple:PurpleDog2025!Secure@db:5432/purpledog?schema=public
BACKEND_PORT=3000
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
FRONTEND_PORT=5173
VITE_API_URL=https://purpledog.site/api
STRIPE_SECRET_KEY=sk_test_51Qa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Qa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=noreply@purpledog.site
SMTP_PASSWORD=purpledog
SMTP_FROM=noreply@purpledog.site
DOCKER=true
EOF

echo "✅ Fichier .env.production créé"
echo ""
echo "📝 Vérifiez et modifiez si nécessaire :"
echo "   nano .env.production"
echo ""
echo "Puis lancez le déploiement :"
echo "   ./deploy.sh"

