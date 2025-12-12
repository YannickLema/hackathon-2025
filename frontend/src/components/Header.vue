<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="header-left">
          <router-link to="/" class="logo-link">
            <img :src="logo" alt="Purple Dog Logo" class="logo" />
          </router-link>
          <button 
            class="menu-burger" 
            :class="{ active: isMenuOpen }"
            @click="toggleMenu" 
            aria-label="Menu"
          >
            <span class="material-symbols-outlined burger-icon">menu</span>
          </button>
        </div>
        <div class="header-right">
          <!-- Favoris et Panier pour tous les utilisateurs -->
          <button class="header-icon-btn" @click="toggleWishlist" aria-label="Favoris">
            <span class="material-symbols-outlined">favorite</span>
            <span v-if="wishlistCount > 0" class="icon-badge">{{ wishlistCount }}</span>
          </button>
          <button class="header-icon-btn" @click="toggleCart" aria-label="Panier">
            <span class="material-symbols-outlined">shopping_cart</span>
            <span v-if="cartCount > 0" class="icon-badge">{{ cartCount }}</span>
          </button>
          
          <!-- Menu utilisateur connecté -->
          <div v-if="isAuthenticated" class="user-menu-container">
            <button class="user-menu-btn" @click="toggleUserMenu" aria-label="Menu utilisateur">
              <div class="user-avatar-small">
                <img 
                  v-if="userProfilePhoto" 
                  :src="userProfilePhoto" 
                  alt="Photo de profil" 
                  class="user-avatar-img"
                />
                <div v-else class="user-avatar-placeholder-small">
                  <span class="material-symbols-outlined">person</span>
                </div>
              </div>
              <span class="user-name">{{ userFirstName }}</span>
              <span class="material-symbols-outlined dropdown-icon">arrow_drop_down</span>
            </button>
            <div v-if="isUserMenuOpen" class="user-menu-dropdown">
              <router-link :to="getDashboardRoute()" class="user-menu-item" @click="closeUserMenu">
                <span class="material-symbols-outlined">dashboard</span>
                <span>Tableau de bord</span>
              </router-link>
              <router-link to="/profil" class="user-menu-item" @click="closeUserMenu">
                <span class="material-symbols-outlined">person</span>
                <span>Mon profil</span>
              </router-link>
              <!-- Liens spécifiques aux professionnels -->
              <template v-if="user?.role === 'PROFESSIONNEL' || user?.role === 'professionnel'">
                <router-link to="/recherche" class="user-menu-item" @click="closeUserMenu">
                  <span class="material-symbols-outlined">search</span>
                  <span>Recherche d'objet</span>
                </router-link>
                <router-link to="/mes-favoris" class="user-menu-item" @click="closeUserMenu">
                  <span class="material-symbols-outlined">favorite</span>
                  <span>Mes favoris & Historique</span>
                </router-link>
                <router-link to="/mes-annonces" class="user-menu-item" @click="closeUserMenu">
                  <span class="material-symbols-outlined">inventory_2</span>
                  <span>Mes objets en vente</span>
                </router-link>
                <router-link to="/creer-annonce" class="user-menu-item" @click="closeUserMenu">
                  <span class="material-symbols-outlined">add_circle</span>
                  <span>Vendre un objet</span>
                </router-link>
              </template>
              <!-- Liens spécifiques aux particuliers -->
              <template v-else-if="user?.role === 'PARTICULIER' || user?.role === 'particulier'">
                <router-link to="/mes-objets" class="user-menu-item" @click="closeUserMenu">
                  <span class="material-symbols-outlined">inventory_2</span>
                  <span>Mes objets en vente</span>
                </router-link>
                <router-link to="/creer-annonce" class="user-menu-item" @click="closeUserMenu">
                  <span class="material-symbols-outlined">add_circle</span>
                  <span>Vendre un objet</span>
                </router-link>
              </template>
              <button class="user-menu-item user-menu-logout" @click="handleLogout">
                <span class="material-symbols-outlined">logout</span>
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
          
          <!-- Boutons de connexion/inscription si non connecté -->
          <template v-else>
            <router-link to="/login" class="btn-action btn-login">Connexion</router-link>
            <router-link to="/register" class="btn-action btn-signup">Inscription</router-link>
          </template>
        </div>
      </div>
    </div>
    
    <!-- Menu latéral -->
    <div class="menu-overlay" :class="{ open: isMenuOpen || isWishlistOpen || isCartOpen }" @click="closeAllPanels"></div>
    <nav class="menu-sidebar" :class="{ open: isMenuOpen }">
      <div class="menu-header">
        <router-link to="/" class="menu-logo-link" @click="closeMenu">
          <img :src="logo" alt="Purple Dog Logo" class="menu-logo" />
        </router-link>
        <button class="menu-close" @click="closeMenu" aria-label="Fermer le menu">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div class="menu-content">
        <ul class="menu-list">
          <li class="menu-item">
            <router-link to="/" class="menu-link" @click="closeMenu">
              <span class="material-symbols-outlined menu-icon">home</span>
              <span class="menu-link-text">Accueil</span>
            </router-link>
          </li>
          <li class="menu-item">
            <router-link to="/produits" class="menu-link" @click="closeMenu">
              <span class="material-symbols-outlined menu-icon">store</span>
              <span class="menu-link-text">Tous les produits</span>
            </router-link>
          </li>
          <li class="menu-item">
            <router-link to="/a-propos" class="menu-link" @click="closeMenu">
              <span class="material-symbols-outlined menu-icon">info</span>
              <span class="menu-link-text">À propos</span>
            </router-link>
          </li>
          <li class="menu-item">
            <router-link to="/contact" class="menu-link" @click="closeMenu">
              <span class="material-symbols-outlined menu-icon">mail</span>
              <span class="menu-link-text">Contact</span>
            </router-link>
          </li>
          <li class="menu-item">
            <router-link to="/mentions-legales" class="menu-link" @click="closeMenu">
              <span class="material-symbols-outlined menu-icon">gavel</span>
              <span class="menu-link-text">Mentions légales</span>
            </router-link>
          </li>
        </ul>
        
        <!-- Menu actions (Favoris et Panier pour tous) -->
        <div class="menu-actions">
          <button class="menu-action-btn" @click="openWishlistFromMenu" aria-label="Mes favoris">
            <span class="material-symbols-outlined menu-action-icon">favorite</span>
            <span class="menu-action-text">Mes favoris</span>
            <span v-if="wishlistCount > 0" class="menu-action-badge">{{ wishlistCount }}</span>
          </button>
          <button class="menu-action-btn" @click="openCartFromMenu" aria-label="Mon panier">
            <span class="material-symbols-outlined menu-action-icon">shopping_cart</span>
            <span class="menu-action-text">Mon panier</span>
            <span v-if="cartCount > 0" class="menu-action-badge">{{ cartCount }}</span>
          </button>
        </div>
        
        <div class="menu-auth">
          <template v-if="isAuthenticated">
            <div class="menu-user-header">
              <div class="menu-user-avatar">
                <img 
                  v-if="userProfilePhoto" 
                  :src="userProfilePhoto" 
                  alt="Photo de profil" 
                  class="menu-avatar-image"
                />
                <div v-else class="menu-avatar-placeholder">
                  <span class="material-symbols-outlined">person</span>
                </div>
              </div>
              <div class="menu-user-name">{{ userFirstName }}</div>
            </div>
            <div class="menu-links">
              <router-link :to="getDashboardRoute()" class="menu-auth-link menu-auth-profile" @click="closeMenu">
                <span class="material-symbols-outlined menu-auth-icon">dashboard</span>
                <span>Tableau de bord</span>
              </router-link>
              <router-link to="/profil" class="menu-auth-link menu-auth-profile" @click="closeMenu">
                <span class="material-symbols-outlined menu-auth-icon">person</span>
                <span>Mon profil</span>
              </router-link>
              <!-- Liens spécifiques aux professionnels -->
              <template v-if="user?.role === 'PROFESSIONNEL' || user?.role === 'professionnel'">
                <router-link to="/recherche" class="menu-auth-link menu-auth-search" @click="closeMenu">
                  <span class="material-symbols-outlined menu-auth-icon">search</span>
                  <span>Recherche d'objet</span>
                </router-link>
                <router-link to="/mes-favoris" class="menu-auth-link menu-auth-favorites" @click="closeMenu">
                  <span class="material-symbols-outlined menu-auth-icon">favorite</span>
                  <span>Mes favoris & Historique</span>
                </router-link>
                <router-link to="/mes-annonces" class="menu-auth-link menu-auth-listings" @click="closeMenu">
                  <span class="material-symbols-outlined menu-auth-icon">inventory_2</span>
                  <span>Mes objets en vente</span>
                </router-link>
                <router-link to="/creer-annonce" class="menu-auth-link menu-auth-create" @click="closeMenu">
                  <span class="material-symbols-outlined menu-auth-icon">add_circle</span>
                  <span>Vendre un objet</span>
                </router-link>
              </template>
              <!-- Liens spécifiques aux particuliers -->
              <template v-else-if="user?.role === 'PARTICULIER' || user?.role === 'particulier'">
                <router-link to="/mes-objets" class="menu-auth-link menu-auth-listings" @click="closeMenu">
                  <span class="material-symbols-outlined menu-auth-icon">inventory_2</span>
                  <span>Mes objets en vente</span>
                </router-link>
                <router-link to="/creer-annonce" class="menu-auth-link menu-auth-create" @click="closeMenu">
                  <span class="material-symbols-outlined menu-auth-icon">add_circle</span>
                  <span>Vendre un objet</span>
                </router-link>
              </template>
              <button class="menu-auth-link menu-auth-logout" @click="handleLogoutFromMenu">
                <span class="material-symbols-outlined menu-auth-icon">logout</span>
                <span>Déconnexion</span>
              </button>
            </div>
          </template>
          <template v-else>
            <router-link to="/login" class="menu-auth-link menu-auth-login" @click="closeMenu">
              <span class="material-symbols-outlined menu-auth-icon">login</span>
              <span>Connexion</span>
            </router-link>
            <router-link to="/register" class="menu-auth-link menu-auth-signup" @click="closeMenu">
              <span class="material-symbols-outlined menu-auth-icon">person_add</span>
              <span>Inscription</span>
            </router-link>
          </template>
        </div>
      </div>
    </nav>

    <!-- Panneau Favoris -->
    <div class="panel-sidebar wishlist-panel" :class="{ open: isWishlistOpen }">
      <div class="panel-header">
        <h2 class="panel-title">Mes favoris</h2>
        <button class="panel-close" @click="closeWishlist" aria-label="Fermer les favoris">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="panel-content">
        <div v-if="wishlistItems.length === 0" class="panel-empty">
          <span class="material-symbols-outlined empty-icon">favorite_border</span>
          <p class="empty-text">Votre liste de favoris est vide</p>
          <router-link to="/" class="empty-link" @click="closeWishlist">Découvrir nos produits</router-link>
        </div>
        <div v-else class="panel-items">
          <div 
            v-for="item in wishlistItems" 
            :key="item.id" 
            class="panel-item wishlist-item"
          >
            <router-link 
              :to="`/produit/${item.id}`"
              class="panel-item-link-content"
              @click="closeWishlist"
            >
              <img :src="item.image" :alt="item.title" class="panel-item-image" />
              <div class="panel-item-info">
                <h3 class="panel-item-title">{{ item.title }}</h3>
                <p class="panel-item-price">{{ item.price }}€</p>
              </div>
            </router-link>
            <button 
              class="panel-item-remove" 
              @click="removeFromWishlist(item.id)" 
              aria-label="Retirer des favoris"
              title="Retirer des favoris"
            >
              <span class="material-symbols-outlined">favorite</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Panneau Panier -->
    <div class="panel-sidebar cart-panel" :class="{ open: isCartOpen }">
      <div class="panel-header">
        <h2 class="panel-title">Mon panier</h2>
        <button class="panel-close" @click="closeCart" aria-label="Fermer le panier">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="panel-content">
        <div v-if="cartItems.length === 0" class="panel-empty">
          <span class="material-symbols-outlined empty-icon">shopping_cart</span>
          <p class="empty-text">Votre panier est vide</p>
          <router-link to="/" class="empty-link" @click="closeCart">Découvrir nos produits</router-link>
        </div>
        <div v-else class="panel-items">
          <router-link 
            v-for="item in cartItems" 
            :key="item.id" 
            :to="`/produit/${item.id}`"
            class="panel-item-link"
            @click="closeCart"
          >
            <div class="panel-item">
              <img :src="item.image" :alt="item.title" class="panel-item-image" />
              <div class="panel-item-info">
                <h3 class="panel-item-title">{{ item.title }}</h3>
                <div class="panel-item-details">
                  <p class="panel-item-price">{{ item.price }}€</p>
                  <div class="panel-item-quantity">
                    <button 
                      class="quantity-btn" 
                      @click.stop.prevent="decreaseQuantity(item.id)"
                    >-</button>
                    <span class="quantity-value">{{ item.quantity }}</span>
                    <button 
                      class="quantity-btn" 
                      @click.stop.prevent="increaseQuantity(item.id)"
                    >+</button>
                  </div>
                </div>
              </div>
              <button 
                class="panel-item-remove" 
                @click.stop.prevent="removeFromCart(item.id)" 
                aria-label="Retirer du panier"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </router-link>
          <div class="panel-footer">
            <div class="panel-total">
              <span class="total-label">Total :</span>
              <span class="total-price">{{ cartTotal }}€</span>
            </div>
            <button class="panel-checkout-btn" @click="goToCheckout">Valider le panier</button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import logo from '@/assets/Purple dog.svg'

const router = useRouter()
const route = useRoute()
const isMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const isAuthenticated = ref(false)
const user = ref(null)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  // Empêcher le scroll du body quand le menu est ouvert
  if (isMenuOpen.value) {
    isWishlistOpen.value = false
    isCartOpen.value = false
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMenu = () => {
  isMenuOpen.value = false
  document.body.style.overflow = ''
}

const isWishlistOpen = ref(false)
const isCartOpen = ref(false)

// Favoris
const wishlistItems = ref([])
const wishlistCount = computed(() => wishlistItems.value.length)

// Panier
const cartItems = ref([])
const cartCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0))
const cartTotal = computed(() => cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0))

const toggleWishlist = () => {
  isWishlistOpen.value = !isWishlistOpen.value
  if (isWishlistOpen.value) {
    isCartOpen.value = false
    isMenuOpen.value = false
    document.body.style.overflow = 'hidden'
    loadWishlist()
    window.dispatchEvent(new Event('wishlist-updated'))
  } else {
    document.body.style.overflow = ''
  }
}

const closeWishlist = () => {
  isWishlistOpen.value = false
  document.body.style.overflow = ''
}

const toggleCart = () => {
  isCartOpen.value = !isCartOpen.value
  if (isCartOpen.value) {
    isWishlistOpen.value = false
    isMenuOpen.value = false
    document.body.style.overflow = 'hidden'
    loadCart()
    window.dispatchEvent(new Event('cart-updated'))
  } else {
    document.body.style.overflow = ''
  }
}

const closeCart = () => {
  isCartOpen.value = false
  document.body.style.overflow = ''
}

const closeAllPanels = () => {
  isMenuOpen.value = false
  isWishlistOpen.value = false
  isCartOpen.value = false
  document.body.style.overflow = ''
}

const loadWishlist = () => {
  // Charger depuis localStorage ou API
  const saved = localStorage.getItem('wishlist')
  if (saved) {
    try {
      wishlistItems.value = JSON.parse(saved)
    } catch (e) {
      console.error('Erreur lors du chargement des favoris:', e)
      wishlistItems.value = []
      localStorage.removeItem('wishlist')
    }
  } else {
    wishlistItems.value = []
  }
}

const loadCart = () => {
  // Charger depuis localStorage ou API
  const saved = localStorage.getItem('cart')
  if (saved) {
    try {
      cartItems.value = JSON.parse(saved)
    } catch (e) {
      console.error('Erreur lors du chargement du panier:', e)
      cartItems.value = []
      localStorage.removeItem('cart')
    }
  } else {
    cartItems.value = []
  }
}

const removeFromWishlist = (itemId) => {
  wishlistItems.value = wishlistItems.value.filter(item => item.id !== itemId)
  localStorage.setItem('wishlist', JSON.stringify(wishlistItems.value))
  window.dispatchEvent(new Event('wishlist-updated'))
}

const removeFromCart = (itemId) => {
  cartItems.value = cartItems.value.filter(item => item.id !== itemId)
  localStorage.setItem('cart', JSON.stringify(cartItems.value))
  window.dispatchEvent(new Event('cart-updated'))
}

const increaseQuantity = (itemId) => {
  const item = cartItems.value.find(i => i.id === itemId)
  if (item) {
    item.quantity++
    localStorage.setItem('cart', JSON.stringify(cartItems.value))
    window.dispatchEvent(new Event('cart-updated'))
  }
}

const decreaseQuantity = (itemId) => {
  const item = cartItems.value.find(i => i.id === itemId)
  if (item && item.quantity > 1) {
    item.quantity--
    localStorage.setItem('cart', JSON.stringify(cartItems.value))
    window.dispatchEvent(new Event('cart-updated'))
  } else if (item && item.quantity === 1) {
    removeFromCart(itemId)
  }
}

const goToCheckout = () => {
  if (cartItems.value.length === 0) {
    alert('Votre panier est vide')
    return
  }
  // Vérifier si l'utilisateur est connecté et est un professionnel
  const userData = localStorage.getItem('user')
  if (!userData) {
    router.push('/login')
    closeCart()
    return
  }
  try {
    const user = JSON.parse(userData)
    if (user.role !== 'PROFESSIONNEL' && user.role !== 'professionnel') {
      alert('Seuls les professionnels peuvent acheter des objets')
      closeCart()
      return
    }
    // Rediriger vers la page de paiement (ou créer une page checkout)
    router.push('/paiement')
    closeCart()
  } catch (e) {
    router.push('/login')
    closeCart()
  }
}

const openWishlistFromMenu = () => {
  closeMenu()
  // Attendre que l'animation de fermeture du menu soit terminée
  setTimeout(() => {
    loadWishlist() // Recharger les favoris avant d'ouvrir
    toggleWishlist()
  }, 300)
}

const openCartFromMenu = () => {
  closeMenu()
  // Attendre que l'animation de fermeture du menu soit terminée
  setTimeout(() => {
    loadCart() // Recharger le panier avant d'ouvrir
    toggleCart()
  }, 300)
}

const handleLogoutFromMenu = () => {
  closeMenu()
  handleLogout()
}

const checkAuth = () => {
  const token = localStorage.getItem('access_token')
  const userData = localStorage.getItem('user')
  
  if (token && userData) {
    try {
      user.value = JSON.parse(userData)
      isAuthenticated.value = true
      console.log('✅ Utilisateur authentifié:', user.value?.firstName, user.value?.email)
    } catch (e) {
      console.error('Erreur lors du parsing des données utilisateur:', e)
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      isAuthenticated.value = false
    }
  } else {
    isAuthenticated.value = false
    user.value = null
    console.log('❌ Utilisateur non authentifié')
  }
}

const userFirstName = computed(() => {
  return user.value?.firstName || 'Utilisateur'
})

const userProfilePhoto = computed(() => {
  return user.value?.profilePhoto || null
})

const getDashboardRoute = () => {
  if (!user.value || !user.value.role) {
    return '/'
  }
  const role = user.value.role.toUpperCase()
  if (role === 'PARTICULIER') {
    return '/dashboard/particulier'
  } else if (role === 'PROFESSIONNEL') {
    return '/dashboard/professionnel'
  }
  return '/'
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const handleLogout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')
  isAuthenticated.value = false
  user.value = null
  isUserMenuOpen.value = false
  router.push('/')
}

// Fermer le menu utilisateur si on clique en dehors
const handleClickOutside = (event) => {
  if (isUserMenuOpen.value && !event.target.closest('.user-menu-container')) {
    isUserMenuOpen.value = false
  }
}

// Vérifier l'authentification à chaque changement de route
watch(() => route.path, () => {
  checkAuth()
}, { immediate: false })

onMounted(() => {
  // Charger les données au montage du composant
  loadWishlist()
  loadCart()
  checkAuth()
  
  // Écouter les événements de mise à jour depuis d'autres composants
  window.addEventListener('wishlist-updated', loadWishlist)
  window.addEventListener('cart-updated', loadCart)
  window.addEventListener('auth-changed', checkAuth)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('wishlist-updated', loadWishlist)
  window.removeEventListener('cart-updated', loadCart)
  window.removeEventListener('auth-changed', checkAuth)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header {
  background-color: #ffffff;
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #e0e0e0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo-link {
  display: inline-block;
  text-decoration: none;
  cursor: pointer;
}

.logo {
  height: 60px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(40%) sepia(30%) saturate(2000%) hue-rotate(250deg) brightness(0.9) contrast(1.1);
  transition: opacity 0.3s ease;
}

.logo-link:hover .logo {
  opacity: 0.8;
}

.menu-burger {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  position: relative;
  z-index: 101;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.menu-burger:hover {
  background-color: #f5f5f5;
}

.menu-burger.active {
  opacity: 0;
  pointer-events: none;
}

.burger-icon {
  font-size: 28px;
  color: #213547;
  transition: all 0.3s ease;
  display: block;
}

.menu-burger:hover .burger-icon {
  color: #645394;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-icon-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.header-icon-btn:hover {
  background-color: #f5f5f5;
}

.header-icon-btn .material-symbols-outlined {
  font-size: 24px;
  color: #213547;
  transition: color 0.3s ease;
}

.header-icon-btn:hover .material-symbols-outlined {
  color: #645394;
}

.icon-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: #645394;
  color: #ffffff;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  line-height: 1;
}

.btn-action {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600; /* Semibold - Caption */
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-login {
  background-color: transparent;
  color: #213547;
  border: 1px solid #213547;
  border-radius: 20px;
  text-decoration: none;
  display: inline-block;
}

.btn-login:hover {
  background-color: rgba(33, 53, 71, 0.1);
}

.btn-signup {
  background-color: #645394;
  color: white;
  text-decoration: none;
  display: inline-block;
}

.btn-signup:hover {
  background-color: #4F4670;
}

/* Menu overlay */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 99;
}

.menu-overlay.open {
  opacity: 1;
  visibility: visible;
}

/* Menu sidebar */
.menu-sidebar {
  position: fixed;
  top: 0;
  left: -100%;
  width: 320px;
  max-width: 85vw;
  height: 100vh;
  background-color: #ffffff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  z-index: 100;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.menu-sidebar.open {
  left: 0;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.menu-logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex: 1;
}

.menu-logo {
  height: 50px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(40%) sepia(30%) saturate(2000%) hue-rotate(250deg) brightness(0.9) contrast(1.1);
}

.menu-close {
  background: none;
  border: none;
  color: #213547;
  cursor: pointer;
  padding: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 8px;
  flex-shrink: 0;
  margin-left: 15px;
}

.menu-close:hover {
  background-color: #f5f5f5;
  color: #645394;
}

.menu-close .material-symbols-outlined {
  font-size: 24px;
  display: block;
}

.menu-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.menu-item {
  margin: 0;
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 16px 25px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #213547;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.menu-icon {
  font-size: 24px;
  color: #645394;
  transition: all 0.3s ease;
}

.menu-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background-color: #645394;
  transition: width 0.3s ease;
}

.menu-link:hover {
  background-color: #fafafa;
  color: #645394;
  padding-left: 30px;
}

.menu-link:hover::before {
  width: 4px;
}

.menu-link:hover .menu-icon {
  color: #645394;
  transform: scale(1.1);
}

.menu-link.router-link-active {
  background-color: #fafafa;
  color: #645394;
  padding-left: 30px;
}

.menu-link.router-link-active::before {
  width: 4px;
}

.menu-link.router-link-active .menu-icon {
  color: #645394;
}

.menu-link-text {
  position: relative;
  z-index: 1;
}

.menu-actions {
  padding: 20px 25px;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-action-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 15px;
  color: #213547;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  text-align: left;
  text-decoration: none;
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.menu-action-btn:hover {
  background-color: #fafafa;
  border-color: #645394;
  color: #645394;
  box-shadow: 0 2px 6px rgba(100, 83, 148, 0.15);
  transform: translateY(-1px);
}

.menu-action-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.menu-action-btn.router-link-active {
  background-color: #fafafa;
  border-color: #645394;
  color: #645394;
}

.menu-action-icon {
  font-size: 22px;
  color: #645394;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.menu-action-btn:hover .menu-action-icon {
  transform: scale(1.1);
}

.menu-action-text {
  flex: 1;
  text-align: left;
}

.menu-action-badge {
  background-color: #645394;
  color: #ffffff;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 12px;
  min-width: 22px;
  height: 22px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 7px;
  line-height: 1;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(100, 83, 148, 0.3);
}

.menu-auth {
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.menu-user-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 0 0 20px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.menu-user-avatar {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  position: relative;
}

.menu-avatar-image,
.menu-avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e0e0e0;
}

.menu-avatar-placeholder {
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-avatar-placeholder .material-symbols-outlined {
  font-size: 28px;
  color: #999;
}

.menu-user-name {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #213547;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-auth-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 500;
  font-size: 15px;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  color: #645394;
  background-color: transparent;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.menu-auth-link:hover {
  background-color: rgba(100, 83, 148, 0.1);
  color: #645394;
}

.menu-auth-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.menu-auth-login {
  background-color: transparent;
  color: #213547;
  border: 1px solid #213547;
}

.menu-auth-login:hover {
  background-color: rgba(33, 53, 71, 0.1);
  border-color: #645394;
  color: #645394;
}

.menu-auth-signup {
  background-color: #645394;
  color: white;
}

.menu-auth-signup:hover {
  background-color: #4F4670;
  transform: translateY(-1px);
}

.menu-auth-logout {
  color: #d32f2f;
  margin-top: 8px;
  border-top: 1px solid #e8e8e8;
  padding-top: 16px;
}

.menu-auth-logout:hover {
  background-color: rgba(211, 47, 47, 0.1);
  color: #d32f2f;
}

/* Panneaux latéraux (Favoris et Panier) */
.panel-sidebar {
  position: fixed;
  top: 0;
  right: -100%;
  width: 400px;
  max-width: 90vw;
  height: 100vh;
  background-color: #ffffff;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 100;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.panel-sidebar.open {
  right: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  background-color: #ffffff;
  z-index: 1;
}

.panel-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: #213547;
  margin: 0;
  flex: 1;
  text-align: left;
}

.panel-close {
  background: none;
  border: none;
  color: #213547;
  cursor: pointer;
  padding: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.panel-close:hover {
  background-color: #f5f5f5;
  color: #645394;
}

.panel-close .material-symbols-outlined {
  font-size: 24px;
}

.panel-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.panel-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.wishlist-panel .panel-items {
  gap: 12px;
}

.panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: #e0e0e0;
  margin-bottom: 20px;
}

.empty-text {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 1rem;
  color: #666;
  margin-bottom: 20px;
}

.empty-link {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #645394;
  text-decoration: none;
  padding: 10px 20px;
  border: 1px solid #645394;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.empty-link:hover {
  background-color: #645394;
  color: #ffffff;
}

.panel-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.panel-item-link-content {
  text-decoration: none;
  color: inherit;
  display: flex;
  gap: 15px;
  flex: 1;
  align-items: center;
  transition: opacity 0.2s ease;
}

.panel-item-link-content:hover {
  opacity: 0.8;
}

.panel-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: #fafafa;
  position: relative;
  transition: all 0.3s ease;
}

/* Style spécifique pour les favoris */
.wishlist-item {
  background-color: #f5f5f5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.wishlist-item:hover {
  background-color: #f0f0f0;
}

.panel-item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.wishlist-item .panel-item-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
}

.panel-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.panel-item-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #213547;
  margin: 0;
  line-height: 1.4;
}

.wishlist-item .panel-item-title {
  font-size: 16px;
  color: #213547;
}

.panel-item-price {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #645394;
  margin: 0;
}

.wishlist-item .panel-item-price {
  font-size: 18px;
  color: #645394;
}

.panel-item-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.panel-item-quantity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #ffffff;
  color: #213547;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.quantity-btn:hover {
  border-color: #645394;
  color: #645394;
  background-color: #fafafa;
}

.quantity-value {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #213547;
  min-width: 24px;
  text-align: center;
}

.panel-item-remove {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: #d32f2f;
  cursor: pointer;
  padding: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: 10;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.panel-item-remove:hover {
  background-color: #d32f2f;
  color: #ffffff;
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.3);
}

.panel-item-remove .material-symbols-outlined {
  font-size: 20px;
  font-weight: 400;
}

.panel-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  position: sticky;
  bottom: 0;
  background-color: #ffffff;
}

.panel-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 8px;
}

.total-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #213547;
}

.total-price {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-size: 24px;
  color: #645394;
}

.panel-checkout-btn {
  width: 100%;
  padding: 14px 20px;
  background-color: #000000;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.panel-checkout-btn:hover {
  background-color: #1a1a1a;
  transform: translateY(-1px);
}

/* Menu utilisateur */
.user-menu-container {
  position: relative;
  display: inline-block;
}

.user-menu-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #213547;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-menu-btn:hover {
  background-color: #e0e0e0;
  border-color: #645394;
  color: #645394;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  position: relative;
}

.user-avatar-img,
.user-avatar-placeholder-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e0e0e0;
}

.user-avatar-placeholder-small {
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar-placeholder-small .material-symbols-outlined {
  font-size: 20px;
  color: #999;
}

.user-name {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #213547;
}

.dropdown-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.user-menu-btn:hover .dropdown-icon {
  transform: rotate(180deg);
}

.user-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  display: flex;
  flex-direction: column;
  margin-top: 8px;
  z-index: 10;
  overflow: hidden;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #213547;
  text-decoration: none;
  transition: all 0.2s ease;
  background-color: transparent;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.user-menu-item:hover {
  background-color: #f5f5f5;
  color: #645394;
}

.user-menu-item .material-symbols-outlined {
  font-size: 20px;
  color: #645394;
}

.user-menu-logout {
  color: #d32f2f;
  font-weight: 600;
  border-top: 1px solid #f0f0f0;
  margin-top: 5px;
  padding-top: 12px;
}

.user-menu-logout:hover {
  background-color: #ffebee;
  color: #d32f2f;
}

.user-menu-logout .material-symbols-outlined {
  color: #d32f2f;
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
  }
  
  .logo {
    height: 50px;
  }
  
  .header-right {
    gap: 10px;
  }
  
  .btn-action {
    padding: 8px 16px;
    font-size: 12px;
  }

  .header-icon-btn {
    width: 36px;
    height: 36px;
    padding: 6px;
  }

  .header-icon-btn .material-symbols-outlined {
    font-size: 20px;
  }

  .panel-sidebar {
    width: 100%;
    max-width: 100vw;
  }
}
</style>
