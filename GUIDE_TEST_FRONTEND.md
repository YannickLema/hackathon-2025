# Guide de Test - Frontend Purple Dog

## 🚀 Démarrage

### Option 1 : Avec Docker Compose (Recommandé)

```bash
# Démarrer tous les services (DB + Backend + Frontend)
docker compose up

# Ou en arrière-plan
docker compose up -d
```

Le frontend sera accessible sur : **http://localhost:5173**

### Option 2 : Frontend seul (si backend déjà démarré)

```bash
cd frontend
npm install  # Si pas encore fait
npm run dev
```

## 👤 Comptes de Test

### Admin
- **Email** : `admin@purpledog.site`
- **Mot de passe** : `test123`
- **Accès** : Dashboard Admin (`/admin`)

### Professionnel
- **Email** : `professionnel@test.com`
- **Mot de passe** : `test123`
- **Accès** : Dashboard Professionnel (`/dashboard/professionnel`)
- **Peut** : Vendre, Acheter, Enchérir (nécessite méthode de paiement Stripe)

### Particulier
- **Email** : `particulier@test.com`
- **Mot de passe** : `test123`
- **Accès** : Dashboard Particulier (`/dashboard/particulier`)
- **Peut** : Vendre uniquement (ne peut pas acheter)

## 🧪 Scénarios de Test

### 1. Test Admin Dashboard

1. Se connecter avec `admin@purpledog.site`
2. Aller sur `/admin`
3. Vérifier les onglets :
   - **Annonces** : Liste toutes les annonces, filtres, suppression
   - **Utilisateurs** : Liste, création, blocage/déblocage
   - **Commissions** : Modification commission globale et par catégorie
   - **Feedbacks** : Affichage des feedbacks utilisateurs

### 2. Test Particulier

1. Se connecter avec `particulier@test.com`
2. Dashboard (`/dashboard/particulier`) :
   - Vendre un objet (`/creer-annonce`)
   - Mes objets en vente (`/mes-objets`)
   - Vérifier qu'on ne peut PAS acheter (boutons désactivés)

### 3. Test Professionnel

1. Se connecter avec `professionnel@test.com`
2. Dashboard (`/dashboard/professionnel`) :
   - Vendre un objet
   - Mes objets en vente
   - Recherche d'objets
   - Mes favoris/enchères/achats (`/mes-favoris`)
   - **Important** : Ajouter méthode de paiement (`/paiement`) avant d'enchérir

### 4. Test CRUD Annonces

1. **Créer** : `/creer-annonce`
   - Remplir le formulaire
   - Ajouter 10 photos minimum
   - Choisir mode de vente (Enchères ou Vente rapide)
   - Publier

2. **Lire** : 
   - Page produits (`/produits`)
   - Page produit détail (`/produit/:id`)
   - Mes annonces (`/mes-objets`)

3. **Modifier** :
   - Depuis `/mes-objets`
   - Changer le prix
   - Changer le mode de vente

4. **Supprimer** :
   - Depuis `/mes-objets` (vendeur)
   - Depuis `/admin` (admin)

### 5. Test Recherche

1. Aller sur `/recherche` ou `/produits`
2. Tester :
   - Recherche textuelle
   - Filtres (catégorie, prix, mode de vente)
   - Tri

### 6. Test Enchères (Professionnel uniquement)

1. Se connecter en professionnel
2. Ajouter méthode de paiement Stripe (`/paiement`)
3. Aller sur un produit en enchères
4. Placer une enchère
5. Vérifier dans `/mes-favoris` > "Mes enchères"

### 7. Test Achat Instantané (Professionnel uniquement)

1. Se connecter en professionnel
2. Ajouter méthode de paiement Stripe
3. Aller sur un produit en "Vente rapide"
4. Cliquer sur "Acheter maintenant"
5. Vérifier dans `/mes-favoris` > "Achats"

## 🔍 Points de Vérification

### Frontend/Backend Connectés ✅
- [ ] Les produits s'affichent depuis la base de données
- [ ] La création d'annonce fonctionne
- [ ] Les favoris se synchronisent avec le backend
- [ ] Les enchères fonctionnent
- [ ] Les achats fonctionnent

### Dashboard Admin ✅
- [ ] Statistiques s'affichent
- [ ] Liste des annonces fonctionne
- [ ] Suppression d'annonce fonctionne
- [ ] Liste des utilisateurs fonctionne
- [ ] Création d'utilisateur fonctionne
- [ ] Blocage/déblocage fonctionne
- [ ] Modification commissions fonctionne

### CRUD Complet ✅
- [ ] CREATE : Créer annonce, utilisateur, feedback
- [ ] READ : Liste produits, annonces, utilisateurs
- [ ] UPDATE : Modifier prix, mode de vente, profil
- [ ] DELETE : Supprimer annonce (admin)

## 🐛 En cas de problème

### Frontend ne démarre pas
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Backend ne répond pas
```bash
docker compose logs backend
docker compose restart backend
```

### Erreur CORS
Vérifier que `VITE_API_URL` dans `.env` pointe vers `http://localhost:3000`

### Erreur 401 (Non authentifié)
- Vérifier que le token est bien stocké dans `localStorage`
- Se reconnecter si nécessaire

## 📝 URLs Importantes

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000
- **Documentation API** : Voir `DOCUMENTATION_API.md`

## 🎯 Checklist de Validation

Avant de merger sur `main`, vérifier :

- [ ] Tous les appels API fonctionnent
- [ ] Dashboard Admin complet et fonctionnel
- [ ] CRUD annonces fonctionnel
- [ ] CRUD utilisateurs (admin) fonctionnel
- [ ] Gestion commissions fonctionnelle
- [ ] Pas d'erreurs dans la console
- [ ] Pas d'erreurs dans les logs backend
- [ ] Les images s'affichent correctement
- [ ] Les redirections fonctionnent
- [ ] Les permissions sont respectées (particulier ne peut pas acheter)

