# Documentation API - Purple Dog

## Base URL
- **Local**: `http://localhost:3000`
- **Production**: `https://purpledog.site/api`

## Authentification
Toutes les routes protégées nécessitent un token JWT dans le header :
```
Authorization: Bearer <token>
```

---

## 🔐 Authentification (`/auth`)

### POST `/auth/register/particulier`
Inscription d'un particulier
- **Body**: `RegisterParticulierDto`
- **Response**: `{ user, access_token }`

### POST `/auth/register/professionnel`
Inscription d'un professionnel
- **Body**: `RegisterProfessionnelDto`
- **Response**: `{ user, access_token }`

### POST `/auth/login`
Connexion
- **Body**: `{ email, password }`
- **Response**: `{ user, access_token }`

### GET `/auth/verify-email?token=xxx`
Vérification de l'email
- **Query**: `token` (token de vérification)
- **Response**: `{ message, success }`

### POST `/auth/resend-verification`
Renvoyer l'email de vérification
- **Body**: `{ email }`
- **Response**: `{ message }`

### POST `/auth/forgot-password`
Demande de réinitialisation de mot de passe
- **Body**: `{ email }`
- **Response**: `{ message }`

### POST `/auth/reset-password`
Réinitialisation du mot de passe
- **Body**: `{ token, newPassword }`
- **Response**: `{ message }`

### GET `/auth/me` 🔒
Obtenir le profil de l'utilisateur connecté
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `User`

### PATCH `/auth/profile` 🔒
Mettre à jour le profil
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `UpdateProfileDto`
- **Response**: `User`

### PATCH `/auth/profile/password` 🔒
Changer le mot de passe
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ currentPassword, newPassword }`
- **Response**: `{ message }`

### PATCH `/auth/profile/email` 🔒
Changer l'email
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ newEmail, password }`
- **Response**: `{ message }`

### POST `/auth/admin/verify-email`
Vérification admin d'un email
- **Body**: `{ email }`
- **Response**: `{ message }`

---

## 📦 Annonces (`/listings`)

### POST `/listings` 🔒
Créer une annonce
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `CreateListingDto`
- **Response**: `Listing`

### GET `/listings`
Liste toutes les annonces (publique)
- **Query params**:
  - `category`: Catégorie (OBJETS_ART_TABLEAUX, BIJOUX_MONTRES, etc.)
  - `status`: Statut (PUBLISHED, DRAFT, SOLD, etc.)
  - `search`: Recherche textuelle
  - `minPrice`: Prix minimum
  - `maxPrice`: Prix maximum
  - `page`: Numéro de page (défaut: 1)
  - `limit`: Nombre d'éléments (défaut: 20)
- **Response**: `{ listings: Listing[], pagination: {...} }`

### GET `/listings/:id`
Obtenir une annonce par ID
- **Response**: `Listing` (avec photos, documents, seller, etc.)

### GET `/listings/seller/my` 🔒
Obtenir mes annonces (vendeur)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `Listing[]`

### GET `/listings/me` 🔒
Obtenir mes annonces avec filtres
- **Headers**: `Authorization: Bearer <token>`
- **Query**: `status` (optionnel)
- **Response**: `Listing[]`

### GET `/listings/me/unread-counts` 🔒
Obtenir les compteurs de messages/offres non lus
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ offers: number, messages: number }`

### GET `/listings/search` 🔒
Recherche avancée
- **Headers**: `Authorization: Bearer <token>`
- **Query params**:
  - `q`: Recherche textuelle
  - `priceMin`: Prix minimum
  - `priceMax`: Prix maximum
  - `saleMode`: Mode de vente (AUCTION, INSTANT_SALE)
  - `category`: Catégorie
  - `status`: Statut
- **Response**: `Listing[]`

### POST `/listings/:id/offers` 🔒
Créer une offre pour une annonce (vente rapide)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ amount, message? }`
- **Response**: `Offer`

### PATCH `/listings/:id/offers/read` 🔒
Marquer les offres comme lues
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message }`

### POST `/listings/:id/messages` 🔒
Envoyer un message au vendeur
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ content }`
- **Response**: `ListingMessage`

### PATCH `/listings/:id/messages/read` 🔒
Marquer les messages comme lus
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message }`

### POST `/listings/:id/bids` 🔒
Placer une enchère
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ amount }`
- **Response**: `Bid`

### PATCH `/listings/:id/sale-mode` 🔒
Changer le mode de vente
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ saleMode: 'AUCTION' | 'INSTANT_SALE' }`
- **Response**: `Listing`

### PATCH `/listings/:id/price` 🔒
Mettre à jour le prix
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ priceDesired, auctionStartPrice? }`
- **Response**: `Listing`

### POST `/listings/:id/favorite` 🔒
Ajouter aux favoris
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message }`

### DELETE `/listings/:id/favorite` 🔒
Retirer des favoris
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message }`

### GET `/listings/me/favorites` 🔒
Obtenir mes favoris
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `Listing[]`

### GET `/listings/me/bids` 🔒
Obtenir mes enchères
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `Bid[]`

### GET `/listings/me/purchases` 🔒
Obtenir mes achats
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `Purchase[]`

### GET `/listings/me/offers` 🔒
Obtenir mes offres (vente rapide)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `Offer[]`

### GET `/listings/me/lost` 🔒
Obtenir mes enchères perdues
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `Listing[]`

---

## 🔨 Enchères (`/bids`)

### POST `/bids/:listingId` 🔒
Placer une enchère
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ amount: number }`
- **Response**: `Bid`

### GET `/bids/listing/:listingId`
Obtenir les enchères d'une annonce
- **Response**: `Bid[]`

### GET `/bids/my` 🔒
Obtenir mes enchères
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `Bid[]`

### GET `/bids/listing/:listingId/winning`
Obtenir l'enchère gagnante actuelle
- **Response**: `Bid | null`

---

## 🛒 Achats (`/purchases`)

### POST `/purchases/instant/:listingId` 🔒
Acheter immédiatement (vente rapide)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ purchase, paymentIntent }`

### POST `/purchases/confirm/:listingId` 🔒
Confirmer un achat
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ paymentIntentId: string }`
- **Response**: `Purchase`

---

## 💳 Stripe (`/stripe`)

### POST `/stripe/setup-intent` 🔒
Créer un setup intent pour ajouter une carte (professionnels uniquement)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ clientSecret, setupIntentId }`

### POST `/stripe/attach-payment-method` 🔒
Attacher une méthode de paiement
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ paymentMethodId: string }`
- **Response**: `{ success, message }`

### GET `/stripe/payment-method-status` 🔒
Vérifier si une méthode de paiement est configurée
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ hasPaymentMethod, stripeCustomerId }`

---

## 💬 Feedback (`/feedback`)

### POST `/feedback` 🔒
Créer un feedback
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ stars?, nps?, comment? }`
- **Response**: `Feedback`

---

## 👨‍💼 Admin (`/admin`)

**Toutes les routes admin nécessitent les guards `JwtAuthGuard` et `AdminGuard`**

### Commissions

#### GET `/admin/commissions`
Obtenir toutes les commissions
- **Response**: `AdminCommission[]`

#### PATCH `/admin/commissions/global`
Mettre à jour la commission globale
- **Body**: `{ commissionRate: number }`
- **Response**: `AdminCommission`

#### PATCH `/admin/commissions/category/:category`
Mettre à jour la commission d'une catégorie
- **Body**: `{ commissionRate: number }`
- **Response**: `AdminCommission`

### Utilisateurs

#### POST `/admin/users`
Créer un utilisateur
- **Body**: `CreateUserDto`
- **Response**: `User`

#### PATCH `/admin/users/:id/block`
Bloquer/Débloquer un utilisateur
- **Body**: `{ block: boolean }`
- **Response**: `User`

### Annonces

#### GET `/admin/listings`
Liste toutes les annonces (vue admin)
- **Query params**:
  - `status`: Statut
  - `saleMode`: Mode de vente
  - `sellerRole`: Rôle du vendeur
  - `category`: Catégorie
  - `page`: Numéro de page
  - `limit`: Nombre d'éléments
- **Response**: `{ listings: Listing[], pagination: {...} }`

### Feedback

#### GET `/admin/feedback`
Liste tous les feedbacks
- **Query params**:
  - `role`: Rôle de l'utilisateur
  - `minStars`: Nombre minimum d'étoiles
  - `minNps`: Score NPS minimum
- **Response**: `Feedback[]`

---

## 📋 Catégories Admin (`/admin/categories`)

### GET `/admin/categories`
Liste toutes les catégories
- **Response**: `Category[]`

### POST `/admin/categories`
Créer une catégorie
- **Body**: `CreateCategoryDto`
- **Response**: `Category`

### PATCH `/admin/categories/:id`
Mettre à jour une catégorie
- **Body**: `UpdateCategoryDto`
- **Response**: `Category`

### DELETE `/admin/categories/:id`
Supprimer une catégorie
- **Response**: `{ message }`

---

## 📝 Formulaires Admin (`/admin/forms`)

### GET `/admin/forms`
Liste toutes les configurations de formulaires
- **Response**: `FormConfig[]`

### GET `/admin/forms/resolve`
Résoudre la configuration d'un formulaire
- **Query**: `categoryId?`, `saleMode?`
- **Response**: `FormConfig`

### GET `/admin/forms/:id`
Obtenir une configuration de formulaire
- **Response**: `FormConfig`

### POST `/admin/forms`
Créer une configuration de formulaire
- **Body**: `CreateFormConfigDto`
- **Response**: `FormConfig`

### PATCH `/admin/forms/:id`
Mettre à jour une configuration de formulaire
- **Body**: `UpdateFormConfigDto`
- **Response**: `FormConfig`

### DELETE `/admin/forms/:id`
Supprimer une configuration de formulaire
- **Response**: `{ message }`

---

## 🔧 Routes Utilitaires

### GET `/`
Health check
- **Response**: `{ message: "Hello World!" }`

### GET `/verify-email?token=xxx`
Vérification email (redirection)
- **Query**: `token`
- **Response**: Redirection ou JSON

### GET `/reset-password?token=xxx`
Formulaire de réinitialisation (GET)
- **Query**: `token`
- **Response**: `{ message, token }`

### POST `/reset-password`
Réinitialisation du mot de passe
- **Body**: `ResetPasswordDto`
- **Response**: `{ message }`

---

## 📊 Codes de Statut

- `200`: Succès
- `201`: Créé
- `400`: Requête invalide
- `401`: Non authentifié
- `403`: Interdit (pas les permissions)
- `404`: Non trouvé
- `500`: Erreur serveur

---

## 🔑 Rôles

- `PARTICULIER`: Utilisateur particulier (peut vendre, ne peut pas acheter)
- `PROFESSIONNEL`: Utilisateur professionnel (peut vendre et acheter)
- `ADMIN`: Administrateur (accès complet)

---

## 📝 Notes Importantes

1. **Enchères**: Seuls les professionnels peuvent enchérir (nécessite une méthode de paiement Stripe)
2. **Achats**: Seuls les professionnels peuvent acheter
3. **Ventes**: Particuliers et professionnels peuvent vendre
4. **Admin**: Toutes les routes admin nécessitent le rôle ADMIN

