#!/bin/bash
# Script complet à exécuter sur le serveur Hostinger
# Usage: Copiez ce fichier sur le serveur et exécutez: bash install-sur-serveur.sh

set -e

echo "🚀 Installation complète de Purple Dog"
echo "======================================="

# Aller dans le dossier
cd /var/www/purpledog 2>/dev/null || {
    echo "📁 Création du dossier /var/www/purpledog"
    mkdir -p /var/www/purpledog
    cd /var/www/purpledog
}

# 1. Créer setup-env.sh
echo "📝 Création de setup-env.sh..."
cat > setup-env.sh << 'SETUPEOF'
#!/bin/bash
echo "🔧 Configuration de .env.production"
JWT_SECRET=$(openssl rand -base64 32)
cat > .env.production << EOL
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
EOL
echo "✅ Fichier .env.production créé"
SETUPEOF
chmod +x setup-env.sh
echo "✅ setup-env.sh créé"

# 2. Créer deploy.sh
echo "📝 Création de deploy.sh..."
cat > deploy.sh << 'DEPLOYEOF'
#!/bin/bash
set -e
echo "🚀 Déploiement Purple Dog en production"
echo "========================================"

if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Ce script nécessite les droits root"
    echo "Utilisez : sudo ./deploy.sh"
    exit 1
fi

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
    systemctl enable docker
    systemctl start docker
fi

# Installer Docker Compose si nécessaire
if ! docker compose version &> /dev/null; then
    echo "📦 Installation de Docker Compose..."
    apt-get update -qq
    apt-get install -y docker-compose-plugin
fi

# Arrêter les containers existants
echo "🛑 Arrêt des containers..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Construire les images
echo "🔨 Construction des images (cela peut prendre plusieurs minutes)..."
docker compose -f docker-compose.prod.yml build --no-cache

# Démarrer les services
echo "🚀 Démarrage des services..."
docker compose -f docker-compose.prod.yml up -d db
echo "⏳ Attente de la base de données (15 secondes)..."
sleep 15
docker compose -f docker-compose.prod.yml up -d backend frontend

# SSL avec Certbot
if [ ! -f "/etc/letsencrypt/live/purpledog.site/fullchain.pem" ]; then
    echo "🔐 Configuration SSL..."
    if ! command -v certbot &> /dev/null; then
        apt-get update -qq
        apt-get install -y certbot python3-certbot-nginx
    fi
    
    docker compose -f docker-compose.prod.yml stop nginx 2>/dev/null || true
    
    # Libérer le port 80
    if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "⚠️  Libération du port 80..."
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
        echo "   1. Le domaine purpledog.site pointe vers 72.60.212.109"
        echo "   2. Le port 80 est accessible"
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
chmod +x deploy.sh
echo "✅ deploy.sh créé"

# 3. Vérifier si c'est un repo Git
if [ -d ".git" ]; then
    echo "📥 Mise à jour depuis Git..."
    git pull origin main || git pull origin develop || git pull origin master || echo "⚠️  Git pull échoué, continuons..."
else
    echo "📥 Initialisation Git..."
    git init
    git remote add origin https://github.com/YannickLema/hackathon-2025.git 2>/dev/null || echo "⚠️  Remote déjà configuré"
    git fetch origin 2>/dev/null || echo "⚠️  Fetch échoué"
    git checkout -b main origin/main 2>/dev/null || git checkout -b develop origin/develop 2>/dev/null || echo "⚠️  Checkout échoué, fichiers locaux utilisés"
fi

echo ""
echo "✅ Installation terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo "   1. Exécutez : ./setup-env.sh"
echo "   2. Vérifiez : nano .env.production (si nécessaire)"
echo "   3. Déployez : sudo ./deploy.sh"
echo ""

