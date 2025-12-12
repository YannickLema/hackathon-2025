# 🐕 Purple Dog - Plateforme de Vente d'Objets de Collection

Plateforme de marketplace pour la vente d'objets de collection, d'art et de luxe entre particuliers et professionnels.

## 👥 Équipe Hackathon

- **Rashmi**
- **Yannick**

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (ou via Docker)

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/YannickLema/hackathon-2025.git
cd hackathon-2025
```

2. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine du projet :
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/purpledog?schema=public"

# JWT
JWT_SECRET="votre-secret-jwt-tres-securise"

# Stripe (optionnel pour les paiements)
STRIPE_SECRET_KEY="sk_test_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email (optionnel)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user@example.com"
SMTP_PASS="password"
EMAIL_FROM="noreply@purpledog.site"

# API INSEE (optionnel pour validation SIRET)
INSEE_API_KEY="votre-cle-api-insee"

# URLs
VITE_API_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"
```

3. **Démarrer avec Docker Compose**

```bash
# Démarrer tous les services (DB, Backend, Frontend)
docker compose up -d

# Voir les logs
docker compose logs -f
```

4. **Initialiser la base de données**

```bash
# Entrer dans le container backend
docker compose exec backend sh

# Appliquer les migrations
npx prisma migrate deploy

# Créer les catégories
npx ts-node --project prisma/tsconfig.json prisma/seed-categories.ts

# Créer les utilisateurs de test et produits
npm run prisma:seed
```

5. **Accéder à l'application**

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000
- **Documentation API** : Voir `DOCUMENTATION_API.md`

---

## 👤 Utilisateurs de Test

### Professionnel
- **Email** : `professionnel@test.com`
- **Mot de passe** : `test123`
- **Rôle** : PROFESSIONNEL
- **Capacités** : Peut vendre ET acheter des objets

### Particulier
- **Email** : `particulier@test.com`
- **Mot de passe** : `test123`
- **Rôle** : PARTICULIER
- **Capacités** : Peut vendre mais NE PEUT PAS acheter

### Admin
- **Email** : `admin@test.com`
- **Mot de passe** : `test123`
- **Rôle** : ADMIN
- **Capacités** : Accès complet à l'administration

> **Note** : Les utilisateurs de test sont créés automatiquement lors du seed. Si vous souhaitez créer d'autres utilisateurs, utilisez le script `backend/prisma/create-users.ts`.

---

## ✨ Fonctionnalités Implémentées

### 🔐 Authentification & Gestion des Comptes

- ✅ **Inscription** (Particulier et Professionnel)
  - Formulaire multi-étapes pour les professionnels
  - Validation SIRET en temps réel avec API INSEE
  - Auto-complétion des champs entreprise (nom, adresse)
  - Upload de documents officiels (K-Bis, etc.)
  - Vérification email par token

- ✅ **Connexion / Déconnexion**
  - Authentification JWT
  - Gestion des sessions

- ✅ **Gestion du profil**
  - Modification des informations personnelles
  - Upload de photo de profil
  - Changement de mot de passe
  - Changement d'email
  - Gestion des informations professionnelles (SIRET, entreprise, etc.)

- ✅ **Récupération de mot de passe**
  - Mot de passe oublié
  - Réinitialisation par email

### 📦 Gestion des Annonces

- ✅ **Création d'annonce**
  - Formulaire complet avec validation
  - Upload multiple de photos (minimum 1)
  - Upload de documents (certificats, etc.)
  - Choix du mode de vente (Vente immédiate / Enchères)
  - Configuration des prix (prix souhaité, prix de départ enchères)
  - Sélection de catégorie
  - Description détaillée

- ✅ **Gestion des annonces**
  - Liste de mes annonces
  - Édition d'annonce
  - Suppression d'annonce
  - Statuts (Brouillon, Publié, Vendu, Archivé)

- ✅ **Recherche et Filtres**
  - Recherche textuelle
  - Filtres par catégorie
  - Filtres par prix (min/max)
  - Filtres par mode de vente
  - Tri (prix, date, popularité)

### 🎯 Enchères

- ✅ **Système d'enchères**
  - Placer une enchère (professionnels uniquement)
  - Historique des enchères
  - Affichage de la meilleure offre
  - Date de fin d'enchères
  - Validation : enchère supérieure à la précédente

- ✅ **Règles métier**
  - Seuls les professionnels peuvent enchérir
  - Méthode de paiement Stripe requise avant d'enchérir
  - Notification au gagnant
  - Finalisation de l'achat après enchère

### 💳 Paiement (Stripe)

- ✅ **Méthode de paiement**
  - Ajout de carte bancaire via Stripe Elements
  - Configuration requise pour les professionnels
  - Validation de la méthode de paiement

- ✅ **Achat immédiat**
  - Achat direct pour professionnels
  - Création de payment intent
  - Confirmation de paiement
  - Page de succès

- ✅ **Paiement après enchère**
  - Paiement du gagnant d'enchère
  - Finalisation de la transaction
  - Gestion des commissions

### ⭐ Favoris

- ✅ **Gestion des favoris**
  - Ajouter aux favoris
  - Retirer des favoris
  - Liste de mes favoris
  - Synchronisation avec le backend

### 🛒 Panier

- ✅ **Gestion du panier**
  - Ajout au panier
  - Modification des quantités
  - Suppression d'articles
  - Calcul du total
  - Validation du panier

### 📊 Dashboards

- ✅ **Dashboard Particulier**
  - Statistiques (annonces actives, vues, ventes, revenus)
  - Accès rapide aux fonctionnalités
  - Liste des annonces récentes

- ✅ **Dashboard Professionnel**
  - Statistiques complètes
  - Accès à toutes les fonctionnalités
  - Recherche d'objets
  - Gestion des favoris et historique
  - Gestion des annonces

- ✅ **Dashboard Admin**
  - Gestion des utilisateurs
  - Gestion des catégories
  - Gestion des annonces
  - Gestion des commissions
  - Configuration des formulaires
  - Statistiques globales

### 📧 Communication

- ✅ **Messages**
  - Envoi de messages sur les annonces
  - Communication entre vendeur et acheteur

- ✅ **Emails**
  - Vérification d'email
  - Réinitialisation de mot de passe
  - Notifications (optionnel)

### 💬 Feedback

- ✅ **Système de feedback**
  - Notation par étoiles (1-5)
  - Score NPS (1-10)
  - Commentaires et suggestions
  - Soumission de feedback

### 🔍 Pages Publiques

- ✅ **Page d'accueil**
  - Produits en vedette
  - Catégories
  - Newsletter

- ✅ **Page produits**
  - Liste de tous les produits
  - Filtres et recherche
  - Pagination

- ✅ **Page détail produit**
  - Galerie de photos
  - Description complète
  - Informations détaillées
  - Actions (favoris, panier, achat, enchère)

- ✅ **Pages informatives**
  - À propos
  - Contact
  - Mentions légales

### 🛠️ Fonctionnalités Techniques

- ✅ **Validation SIRET en temps réel**
  - Intégration API Sirene (INSEE)
  - Auto-complétion des champs entreprise
  - Validation avec algorithme de Luhn

- ✅ **Gestion des catégories**
  - Système de catégories dynamique
  - Configuration par l'admin

- ✅ **Configuration des formulaires**
  - Formulaires dynamiques par catégorie
  - Configuration par l'admin

- ✅ **Commissions**
  - Calcul automatique des commissions
  - Gestion des commissions admin

- ✅ **Sécurité**
  - Authentification JWT
  - Guards par rôle
  - Validation des données
  - Protection CORS

---

## 📁 Structure du Projet

```
hackathon-2025/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── auth/        # Authentification
│   │   ├── listings/    # Gestion des annonces
│   │   ├── bids/        # Système d'enchères
│   │   ├── purchases/   # Gestion des achats
│   │   ├── stripe/      # Intégration Stripe
│   │   ├── admin/       # Administration
│   │   └── ...
│   └── prisma/          # Schéma et migrations
├── frontend/            # Application Vue.js
│   ├── src/
│   │   ├── components/  # Composants Vue
│   │   ├── router/      # Routes
│   │   └── services/    # Services API
│   └── ...
├── nginx/               # Configuration Nginx
├── docker-compose.yml   # Docker Compose (dev)
└── docker-compose.prod.yml  # Docker Compose (prod)
```

---

## 🛠️ Commandes Utiles

### Développement

```bash
# Démarrer en développement
docker compose up -d

# Logs backend
docker compose logs -f backend

# Logs frontend
docker compose logs -f frontend

# Accéder au container backend
docker compose exec backend sh

# Accéder au container frontend
docker compose exec frontend sh
```

### Base de données

```bash
# Appliquer les migrations
docker compose exec backend npx prisma migrate deploy

# Créer les catégories
docker compose exec backend npx ts-node --project prisma/tsconfig.json prisma/seed-categories.ts

# Seed (utilisateurs + produits)
docker compose exec backend npm run prisma:seed

# Accéder à Prisma Studio
docker compose exec backend npx prisma studio
```

### Production

```bash
# Déployer sur la production
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Vérifier les services
docker compose -f docker-compose.prod.yml ps

# Logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## 📚 Documentation

- **Documentation API** : Voir `DOCUMENTATION_API.md`
- **Schéma de base de données** : `backend/prisma/schema.prisma`

---

## 🔧 Technologies Utilisées

### Backend
- **NestJS** - Framework Node.js
- **Prisma** - ORM
- **PostgreSQL** - Base de données
- **JWT** - Authentification
- **Stripe** - Paiements
- **Nodemailer** - Emails

### Frontend
- **Vue.js 3** - Framework JavaScript
- **Vue Router** - Routing
- **Material Symbols** - Icônes
- **Stripe Elements** - Paiements

### Infrastructure
- **Docker** - Containerisation
- **Nginx** - Reverse proxy
- **Let's Encrypt** - SSL/TLS

---

## 📝 Notes Importantes

1. **Rôles et Permissions**
   - **Particuliers** : Peuvent vendre mais NE PEUVENT PAS acheter
   - **Professionnels** : Peuvent vendre ET acheter
   - **Admins** : Accès complet

2. **Enchères**
   - Seuls les professionnels peuvent enchérir
   - Méthode de paiement Stripe requise avant d'enchérir

3. **Paiements**
   - Utilisation de Stripe (mode test par défaut)
   - Configuration requise dans `.env`

4. **Validation SIRET**
   - Utilise l'API Sirene de l'INSEE
   - Clé API optionnelle (fonctionne sans mais avec limites)

---

## 🐛 Dépannage

### Problème de connexion à la base de données
```bash
# Vérifier que le container DB est démarré
docker compose ps

# Redémarrer la base de données
docker compose restart db
```

### Erreurs de migration
```bash
# Réinitialiser la base (ATTENTION: supprime les données)
docker compose down -v
docker compose up -d db
docker compose exec backend npx prisma migrate deploy
```

### Problèmes avec Stripe
- Vérifier que les clés Stripe sont correctement configurées dans `.env`
- Utiliser les clés de test pour le développement

---

## 📄 Licence

Ce projet a été développé dans le cadre d'un hackathon.

---

## 👨‍💻 Support

Pour toute question ou problème, contactez l'équipe :
- Rashmi
- Yannick

