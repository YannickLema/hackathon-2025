# 🚀 Déploiement en production

## Sur le serveur Hostinger

### 1. Se connecter
```bash
ssh root@72.60.212.109
# Mot de passe : Purpledog@2025
```

### 2. Cloner le projet
```bash
cd /var/www
git clone https://github.com/YannickLema/hackathon-2025.git purpledog
cd purpledog
```

### 3. Configurer l'environnement
```bash
chmod +x setup-env.sh
./setup-env.sh
```

Cela crée `.env.production` avec vos valeurs. Modifiez si nécessaire :
```bash
nano .env.production
```

### 4. Déployer
```bash
chmod +x deploy.sh
./deploy.sh
```

### 5. Vérifier
```bash
docker compose -f docker-compose.prod.yml ps
```

Le site sera disponible sur : **https://purpledog.site**

## Commandes utiles

```bash
# Voir les logs
docker compose -f docker-compose.prod.yml logs -f

# Redémarrer
docker compose -f docker-compose.prod.yml restart

# Arrêter
docker compose -f docker-compose.prod.yml down

# Reconstruire
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

