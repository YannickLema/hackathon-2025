#!/bin/bash

# Script à exécuter sur le serveur pour créer setup-env.sh et deploy.sh

cat > setup-env.sh << 'SETUPEOF'
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
SETUPEOF

cat > deploy.sh << 'DEPLOYEOF'
#!/bin/bash
set -e

echo "🚀 Déploiement Purple Dog en production"
echo "========================================"

# Vérifier qu'on est root ou sudo
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Ce script nécessite les droits root"
    echo "Utilisez : sudo ./deploy.sh"
    exit 1
fi

# Vérifier .env.production
if [ ! -f ".env.production" ]; then
    echo "❌ Fichier .env.production introuvable"
    echo "Exécutez d'abord : ./setup-env.sh"
    exit 1
fi

# Installer Docker si nécessaire
if ! command -v docker &> /dev/null; then
    echo "📦 Installation de Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Installer Docker Compose si nécessaire
if ! docker compose version &> /dev/null; then
    echo "📦 Installation de Docker Compose..."
    apt-get update -qq
    apt-get install -y docker-compose-plugin
fi

# Ajouter l'utilisateur au groupe docker si nécessaire
if [ -n "$SUDO_USER" ]; then
    usermod -aG docker $SUDO_USER 2>/dev/null || true
fi

# Arrêter les containers existants
echo "🛑 Arrêt des containers..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Construire les images
echo "🔨 Construction des images..."
docker compose -f docker-compose.prod.yml build --no-cache

# Démarrer les services
echo "🚀 Démarrage des services..."
docker compose -f docker-compose.prod.yml up -d db
sleep 10
docker compose -f docker-compose.prod.yml up -d backend frontend

# SSL avec Certbot
if [ ! -f "/etc/letsencrypt/live/purpledog.site/fullchain.pem" ]; then
    echo "🔐 Configuration SSL..."
    if ! command -v certbot &> /dev/null; then
        apt-get update -qq
        apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Arrêter nginx temporairement
    docker compose -f docker-compose.prod.yml stop nginx 2>/dev/null || true
    
    # Vérifier que le port 80 est libre
    if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "⚠️  Le port 80 est déjà utilisé. Arrêt des processus..."
        fuser -k 80/tcp 2>/dev/null || true
        sleep 2
    fi
    
    certbot certonly --standalone \
        -d purpledog.site \
        -d www.purpledog.site \
        --email admin@purpledog.site \
        --agree-tos \
        --non-interactive || {
        echo "⚠️  Erreur SSL. Vérifiez que :"
        echo "   1. Le domaine purpledog.site pointe vers ce serveur (72.60.212.109)"
        echo "   2. Le port 80 est accessible depuis l'extérieur"
        echo "   Vous pourrez relancer le déploiement après correction."
    }
fi

# Démarrer nginx
echo "🌐 Démarrage de nginx..."
docker compose -f docker-compose.prod.yml up -d nginx

# Afficher l'état
echo ""
echo "✅ Déploiement terminé !"
echo ""
docker compose -f docker-compose.prod.yml ps
echo ""
echo "🌐 Site disponible sur : https://purpledog.site"
DEPLOYEOF

chmod +x setup-env.sh deploy.sh

echo "✅ Scripts créés : setup-env.sh et deploy.sh"

