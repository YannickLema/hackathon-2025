<template>
  <div class="product-page-wrapper">
    <!-- Loading State -->
    <div v-if="isLoading" class="product-loading">
      <div class="loading-spinner"></div>
      <p>Chargement du produit...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="product-error">
      <span class="material-symbols-outlined">error</span>
      <p>{{ error }}</p>
      <router-link to="/produits" class="btn-primary">Retour aux produits</router-link>
    </div>

    <!-- Product Content -->
    <div v-else-if="product" class="product-page">
      <!-- Breadcrumb -->
      <div class="breadcrumb-section">
        <div class="container">
          <div class="breadcrumb">
            <router-link to="/">Accueil</router-link>
            <span class="separator">></span>
            <router-link to="/produits">Produits</router-link>
            <span class="separator">></span>
            <span class="current">{{ formatCategory(product.category) }}</span>
            <span class="separator">></span>
            <span class="current">{{ product.title }}</span>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="product-main">
          <!-- Galerie d'images style Selency -->
          <div class="product-gallery">
            <!-- Miniatures verticales à gauche -->
            <div v-if="product.images && product.images.length > 1" class="gallery-thumbnails-vertical">
              <button
                v-for="(image, index) in product.images"
                :key="index"
                @click="selectedImage = image; currentImageIndex = index"
                :class="['thumbnail-vertical', { active: currentImageIndex === index }]"
              >
                <img :src="image" :alt="`${product.title} - Image ${index + 1}`" />
              </button>
            </div>

            <!-- Image principale avec navigation -->
            <div class="gallery-main-wrapper">
              <div class="gallery-main" @click="openImageModal">
                <img 
                  :src="selectedImage || product.mainImage" 
                  :alt="product.title"
                  class="main-image"
                />
                <button 
                  class="wishlist-btn" 
                  @click.stop="toggleWishlist"
                  aria-label="Ajouter aux favoris"
                >
                  <span class="material-symbols-outlined" :class="{ active: product.isWishlisted }">
                    {{ product.isWishlisted ? 'favorite' : 'favorite_border' }}
                  </span>
                </button>
                <div v-if="product.saleMode === 'AUCTION'" class="product-badge auction-badge">
                  <span class="material-symbols-outlined">gavel</span>
                  <span>Enchères</span>
                </div>
                <div v-else class="product-badge instant-badge">
                  <span class="material-symbols-outlined">flash_on</span>
                  <span>Vente rapide</span>
                </div>
                
                <!-- Flèches de navigation -->
                <button 
                  v-if="product.images && product.images.length > 1 && currentImageIndex > 0"
                  class="nav-arrow nav-arrow-left"
                  @click.stop="previousImage"
                >
                  <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <button 
                  v-if="product.images && product.images.length > 1 && currentImageIndex < product.images.length - 1"
                  class="nav-arrow nav-arrow-right"
                  @click.stop="nextImage"
                >
                  <span class="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Informations produit -->
          <div class="product-info">
            <h1 class="product-title">{{ product.title }}</h1>
            
            <!-- Prix -->
            <div class="product-price-section">
              <div class="price-main">
                <span class="price-value">{{ formatPrice(product.price) }}€</span>
                <button 
                  class="favorite-btn-inline" 
                  @click="toggleWishlist"
                >
                  <span class="material-symbols-outlined" :class="{ active: product.isWishlisted }">
                    {{ product.isWishlisted ? 'favorite' : 'favorite_border' }}
                  </span>
                </button>
              </div>
              
              <!-- Enchères -->
              <div v-if="product.saleMode === 'AUCTION'" class="auction-info">
                <div v-if="product.auctionStartPrice" class="auction-start">
                  <span class="label">Prix de départ :</span>
                  <span class="value">{{ formatPrice(product.auctionStartPrice) }}€</span>
                </div>
                <div v-if="currentBid" class="current-bid-info">
                  <span class="label">Enchère actuelle :</span>
                  <span class="value highlight">{{ formatPrice(currentBid.amount) }}€</span>
                </div>
                <div v-if="product.auctionEndAt" class="auction-timer">
                  <span class="material-symbols-outlined">schedule</span>
                  <span>Enchères se terminent le {{ formatDate(product.auctionEndAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Actions principales -->
            <div class="product-actions-main">
              <button 
                v-if="product.saleMode === 'AUCTION'"
                class="btn-action btn-offer"
                @click="handleBid"
                :disabled="isBidding"
              >
                <span class="material-symbols-outlined">gavel</span>
                <span>{{ isBidding ? 'Enchérir...' : 'Faire une offre' }}</span>
              </button>
              <button 
                v-else
                class="btn-action btn-cart"
                @click="handleInstantPurchase"
                :disabled="isPurchasing"
              >
                <span class="material-symbols-outlined">shopping_cart</span>
                <span>{{ isPurchasing ? 'Traitement...' : 'Ajouter au panier' }}</span>
              </button>
            </div>

            <!-- Livraison -->
            <div class="delivery-section">
              <h3 class="section-subtitle">Livraison</h3>
              <div class="delivery-search">
                <input 
                  type="text" 
                  placeholder="Rechercher un code postal (ex: 75001)"
                  class="delivery-input"
                  v-model="postalCode"
                />
                <button class="delivery-btn" @click="checkDelivery">
                  <span class="material-symbols-outlined">search</span>
                </button>
              </div>
              <p class="delivery-info">Vous pourrez sélectionner votre livraison au moment du paiement</p>
            </div>

            <!-- Vendeur -->
            <div class="seller-section">
              <div class="seller-header">
                <span class="seller-type-badge">
                  <span class="material-symbols-outlined">business</span>
                  Vendeur {{ product.seller?.professionnelProfile?.companyName ? 'professionnel' : 'particulier' }}
                </span>
                <div class="seller-rating" v-if="false">
                  <span class="stars">★★★★★</span>
                  <span class="rating-text">5 (165 avis)</span>
                </div>
              </div>
              <div class="seller-name">
                <span v-if="product.seller?.professionnelProfile?.companyName">
                  {{ product.seller.professionnelProfile.companyName }}
                </span>
                <span v-else>
                  {{ product.seller?.firstName }} {{ product.seller?.lastName }}
                </span>
              </div>
              <button class="btn-contact-seller" @click="contactSeller">
                <span class="material-symbols-outlined">mail</span>
                Contacter le vendeur
              </button>
            </div>

            <!-- Garanties -->
            <div class="guarantees-section">
              <div class="guarantee-item">
                <span class="material-symbols-outlined">verified</span>
                <div class="guarantee-content">
                  <strong>Garantie de remboursement</strong>
                  <p>14 jours pour changer d'avis</p>
                </div>
              </div>
              <div class="guarantee-item">
                <span class="material-symbols-outlined">check_circle</span>
                <div class="guarantee-content">
                  <strong>Sélection des pièces</strong>
                  <p>Chaque objet est soigneusement sélectionné</p>
                </div>
              </div>
              <div class="guarantee-item">
                <span class="material-symbols-outlined">support_agent</span>
                <div class="guarantee-content">
                  <strong>Service client</strong>
                  <p>Une équipe à votre écoute</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Description détaillée -->
        <div class="product-details-section">
          <h2 class="section-title">Description</h2>
          <div class="description-content">
            <p class="description-text">{{ product.description }}</p>
            
            <div class="specifications-grid">
              <div class="spec-item">
                <span class="spec-label">Dimensions</span>
                <span class="spec-value">{{ product.dimensions }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Poids</span>
                <span class="spec-value">{{ product.weight }} kg</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Catégorie</span>
                <span class="spec-value">{{ formatCategory(product.category) }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">État</span>
                <span class="spec-value">Très bon état</span>
              </div>
            </div>

            <div v-if="product.documents && product.documents.length > 0" class="documents-section">
              <h3 class="documents-title">Documents</h3>
              <div class="documents-list">
                <a
                  v-for="(doc, index) in product.documents"
                  :key="index"
                  :href="doc.url"
                  target="_blank"
                  class="document-link"
                >
                  <span class="material-symbols-outlined">description</span>
                  <span>{{ doc.label || `Document ${index + 1}` }}</span>
                  <span class="material-symbols-outlined">open_in_new</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- À propos du vendeur -->
        <div class="about-seller-section">
          <h2 class="section-title">À propos de ce vendeur</h2>
          <div class="seller-card-large">
            <div class="seller-avatar-large">
              <span class="material-symbols-outlined">person</span>
            </div>
            <div class="seller-info-large">
              <div class="seller-name-large">
                <span v-if="product.seller?.professionnelProfile?.companyName">
                  {{ product.seller.professionnelProfile.companyName }}
                </span>
                <span v-else>
                  {{ product.seller?.firstName }} {{ product.seller?.lastName }}
                </span>
              </div>
              <div class="seller-type-large">
                {{ product.seller?.professionnelProfile?.companyName ? 'Vendeur professionnel' : 'Vendeur particulier' }}
              </div>
              <div class="seller-stats">
                <span class="stat-item">600 ventes</span>
                <span class="stat-item">5 (165 avis)</span>
              </div>
              <div class="seller-actions">
                <button class="btn-view-store">Voir la boutique</button>
                <button class="btn-contact-seller-large" @click="contactSeller">
                  Contacter le vendeur
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Enchères (si enchères) -->
        <div v-if="product.saleMode === 'AUCTION' && allBids.length > 0" class="bids-section">
          <h2 class="section-title">Historique des enchères</h2>
          <div class="bids-list">
            <div 
              v-for="(bid, index) in allBids" 
              :key="bid.id"
              :class="['bid-item', { winning: bid.isWinning }]"
            >
              <div class="bid-rank">{{ index + 1 }}</div>
              <div class="bid-info">
                <div class="bid-amount-large">{{ formatPrice(bid.amount) }}€</div>
                <div class="bid-bidder-name">
                  {{ bid.bidder?.professionnelProfile?.companyName || 
                     `${bid.bidder?.firstName} ${bid.bidder?.lastName}` }}
                </div>
              </div>
              <div class="bid-time">{{ formatTime(bid.createdAt) }}</div>
              <div v-if="bid.isWinning" class="bid-badge">
                <span class="material-symbols-outlined">emoji_events</span>
                En tête
              </div>
            </div>
          </div>
        </div>

        <!-- Produits similaires -->
        <div class="similar-products-section">
          <div class="section-header">
            <h2 class="section-title">Vous aimerez aussi</h2>
            <router-link to="/produits" class="view-all-link">
              Voir d'autres produits similaires
              <span class="material-symbols-outlined">arrow_forward</span>
            </router-link>
          </div>
          <div class="similar-products-carousel">
            <div class="product-card-mini" v-for="i in 4" :key="i">
              <div class="product-image-mini">
                <img src="https://via.placeholder.com/200x200" alt="Produit similaire" />
              </div>
              <div class="product-info-mini">
                <h3 class="product-title-mini">Produit similaire {{ i }}</h3>
                <span class="product-price-mini">120€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
      <button class="modal-close" @click.stop="closeImageModal">
        <span class="material-symbols-outlined">close</span>
      </button>
      <img :src="selectedImage || product?.mainImage" :alt="product?.title" class="modal-image" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const product = ref(null)
const isLoading = ref(false)
const error = ref('')
const selectedImage = ref(null)
const currentImageIndex = ref(0)
const showImageModal = ref(false)
const currentBid = ref(null)
const allBids = ref([])
const isBidding = ref(false)
const isPurchasing = ref(false)
const postalCode = ref('')

const categoryNames = {
  PEINTURE: 'Peinture',
  SCULPTURE: 'Sculpture',
  MONTRE: 'Montre',
  BIJOU: 'Bijou',
  OBJET_ART: 'Objet d\'art',
  PHOTOGRAPHIE: 'Photographie',
  VETEMENT: 'Vêtement',
  ACCESSOIRE: 'Accessoire',
  DESIGN: 'Design',
  AUTRE: 'Autre'
}

const loadProduct = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const productId = route.params.id
    const response = await fetch(`${API_URL}/listings/${productId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Produit introuvable')
      }
      throw new Error('Erreur lors du chargement du produit')
    }
    
    const data = await response.json()
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    const wishlistIds = new Set(wishlist.map(item => item.id))
    
    const images = data.photos && data.photos.length > 0 
      ? data.photos.map(p => p.url)
      : ['https://via.placeholder.com/800x800?text=No+Image']
    
    product.value = {
      id: data.id,
      title: data.title,
      description: data.description,
      price: parseFloat(data.priceDesired),
      mainImage: images[0],
      images: images,
      isWishlisted: wishlistIds.has(data.id),
      saleMode: data.saleMode,
      auctionStartPrice: data.auctionStartPrice ? parseFloat(data.auctionStartPrice) : null,
      auctionEndAt: data.auctionEndAt,
      category: data.category,
      dimensions: data.dimensions,
      weight: parseFloat(data.weightKg),
      documents: data.documents || [],
      seller: data.seller || {}
    }

    selectedImage.value = images[0]
    currentImageIndex.value = 0

    if (data.saleMode === 'AUCTION') {
      await loadBids(data.id)
    }
  } catch (err) {
    console.error('Erreur lors du chargement du produit:', err)
    error.value = err.message || 'Une erreur est survenue'
  } finally {
    isLoading.value = false
  }
}

const loadBids = async (listingId) => {
  try {
    const response = await fetch(`${API_URL}/bids/listing/${listingId}`)
    if (response.ok) {
      const bids = await response.json()
      allBids.value = bids
      const winningBid = bids.find(b => b.isWinning)
      if (winningBid) {
        currentBid.value = winningBid
      }
    }
  } catch (err) {
    console.error('Erreur lors du chargement des enchères:', err)
  }
}

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
    selectedImage.value = product.value.images[currentImageIndex.value]
  }
}

const nextImage = () => {
  if (currentImageIndex.value < product.value.images.length - 1) {
    currentImageIndex.value++
    selectedImage.value = product.value.images[currentImageIndex.value]
  }
}

const toggleWishlist = () => {
  if (!product.value) return
  
  product.value.isWishlisted = !product.value.isWishlisted
  
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
  
  if (product.value.isWishlisted) {
    if (!wishlist.find(item => item.id === product.value.id)) {
      wishlist.push({
        id: product.value.id,
        title: product.value.title,
        price: product.value.price,
        image: product.value.mainImage,
      })
    }
  } else {
    wishlist = wishlist.filter(item => item.id !== product.value.id)
  }
  
  localStorage.setItem('wishlist', JSON.stringify(wishlist))
  window.dispatchEvent(new Event('wishlist-updated'))
}

const handleBid = async () => {
  if (!product.value) return
  
  const token = localStorage.getItem('access_token')
  if (!token) {
    router.push('/login')
    return
  }

  try {
    const statusResponse = await fetch(`${API_URL}/stripe/payment-method-status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (statusResponse.ok) {
      const status = await statusResponse.json()
      if (!status.hasPaymentMethod) {
        alert('Vous devez ajouter une méthode de paiement avant de pouvoir enchérir.')
        router.push('/dashboard/professionnel')
        return
      }
    }
  } catch (err) {
    console.error('Erreur:', err)
  }

  const minBid = currentBid.value 
    ? parseFloat(currentBid.value.amount) * 1.05 
    : (product.value.auctionStartPrice || product.value.price * 0.9)
  
  const bidAmount = prompt(`Entrez votre enchère (minimum: ${formatPrice(minBid)}€):`, formatPrice(minBid))
  
  if (!bidAmount) return
  
  const amount = parseFloat(bidAmount.replace(/\s/g, '').replace(',', '.'))
  
  if (isNaN(amount) || amount < minBid) {
    alert(`Le montant doit être au moins de ${formatPrice(minBid)}€`)
    return
  }

  isBidding.value = true
  
  try {
    const response = await fetch(`${API_URL}/bids/${product.value.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de l\'enchère')
    }
    
    alert('Enchère placée avec succès !')
    await loadBids(product.value.id)
  } catch (err) {
    alert(err.message || 'Erreur lors de l\'enchère')
  } finally {
    isBidding.value = false
  }
}

const handleInstantPurchase = async () => {
  if (!product.value) return
  
  const token = localStorage.getItem('access_token')
  if (!token) {
    router.push('/login')
    return
  }

  try {
    const statusResponse = await fetch(`${API_URL}/stripe/payment-method-status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (statusResponse.ok) {
      const status = await statusResponse.json()
      if (!status.hasPaymentMethod) {
        alert('Vous devez ajouter une méthode de paiement avant de pouvoir acheter.')
        router.push('/dashboard/professionnel')
        return
      }
    }
  } catch (err) {
    console.error('Erreur:', err)
  }

  isPurchasing.value = true
  
  try {
    const response = await fetch(`${API_URL}/purchases/instant/${product.value.id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur lors de l\'achat')
    }
    
    alert('Achat initié avec succès !')
  } catch (err) {
    alert(err.message || 'Erreur lors de l\'achat')
  } finally {
    isPurchasing.value = false
  }
}

const contactSeller = async () => {
  if (!product.value) return
  
  const token = localStorage.getItem('access_token')
  if (!token) {
    router.push('/login')
    return
  }
  
  const message = prompt('Votre message au vendeur:')
  if (!message || !message.trim()) return
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await fetch(`${API_URL}/listings/${product.value.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: message.trim() })
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi du message')
    }
    
    alert('Message envoyé au vendeur avec succès !')
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur lors de l\'envoi du message')
  }
}

const checkDelivery = () => {
  if (postalCode.value) {
    alert(`Vérification de la livraison pour ${postalCode.value}`)
  }
}

const openImageModal = () => {
  if (product.value?.images && product.value.images.length > 0) {
    showImageModal.value = true
  }
}

const closeImageModal = () => {
  showImageModal.value = false
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

const formatCategory = (category) => {
  return categoryNames[category] || category
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'À l\'instant'
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short'
  }).format(date)
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.product-page-wrapper {
  min-height: 100vh;
  background: #ffffff;
}

/* Loading & Error */
.product-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #645394;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.product-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
  text-align: center;
}

/* Breadcrumb */
.breadcrumb-section {
  background: #f8f9fa;
  padding: 16px 0;
  border-bottom: 1px solid #e9ecef;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 14px;
  color: #6c757d;
}

.breadcrumb a {
  color: #645394;
  text-decoration: none;
  transition: color 0.3s;
}

.breadcrumb a:hover {
  color: #4F4670;
}

.breadcrumb .separator {
  color: #adb5bd;
}

.breadcrumb .current {
  color: #495057;
  font-weight: 500;
}

/* Main Layout */
.product-page {
  padding: 40px 0 80px 0;
}

.product-main {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 60px;
  margin-bottom: 80px;
}

/* Gallery Style Selency */
.product-gallery {
  display: flex;
  gap: 16px;
}

.gallery-thumbnails-vertical {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 600px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.gallery-thumbnails-vertical::-webkit-scrollbar {
  width: 4px;
}

.gallery-thumbnails-vertical::-webkit-scrollbar-thumb {
  background: #645394;
  border-radius: 2px;
}

.thumbnail-vertical {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  background: none;
  padding: 0;
  flex-shrink: 0;
}

.thumbnail-vertical:hover {
  border-color: #645394;
}

.thumbnail-vertical.active {
  border-color: #645394;
  box-shadow: 0 0 0 2px rgba(100, 83, 148, 0.2);
}

.thumbnail-vertical img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-main-wrapper {
  flex: 1;
  position: relative;
}

.gallery-main {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: zoom-in;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wishlist-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.wishlist-btn:hover {
  background: #ffffff;
  transform: scale(1.1);
}

.wishlist-btn .material-symbols-outlined {
  color: #adb5bd;
  font-size: 24px;
}

.wishlist-btn .material-symbols-outlined.active {
  color: #e91e63;
  font-variation-settings: 'FILL' 1;
}

.product-badge {
  position: absolute;
  bottom: 16px;
  left: 16px;
  padding: 8px 16px;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.auction-badge {
  background: #645394;
  color: #ffffff;
}

.instant-badge {
  background: #FF9800;
  color: #ffffff;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.nav-arrow:hover {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-arrow-left {
  left: 16px;
}

.nav-arrow-right {
  right: 16px;
}

/* Product Info */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 2rem;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
}

.product-price-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e9ecef;
}

.price-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.price-value {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 700;
  font-size: 2.5rem;
  color: #1a1a1a;
}

.favorite-btn-inline {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #e9ecef;
  background: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.favorite-btn-inline:hover {
  border-color: #645394;
}

.favorite-btn-inline .material-symbols-outlined {
  color: #adb5bd;
  font-size: 20px;
}

.favorite-btn-inline .material-symbols-outlined.active {
  color: #e91e63;
  font-variation-settings: 'FILL' 1;
}

.auction-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.auction-start,
.current-bid-info {
  display: flex;
  gap: 8px;
  font-size: 0.95rem;
}

.auction-start .label,
.current-bid-info .label {
  color: #6c757d;
}

.auction-start .value,
.current-bid-info .value {
  font-weight: 600;
  color: #1a1a1a;
}

.current-bid-info .value.highlight {
  color: #645394;
  font-size: 1.1rem;
}

.auction-timer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 4px;
}

/* Actions */
.product-actions-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid;
}

.btn-offer {
  background: #ffffff;
  border-color: #1a1a1a;
  color: #1a1a1a;
}

.btn-offer:hover:not(:disabled) {
  background: #1a1a1a;
  color: #ffffff;
}

.btn-cart {
  background: #1a1a1a;
  border-color: #1a1a1a;
  color: #ffffff;
}

.btn-cart:hover:not(:disabled) {
  background: #333333;
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Delivery */
.delivery-section {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.section-subtitle {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.delivery-search {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.delivery-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 14px;
}

.delivery-btn {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  background: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.delivery-btn:hover {
  background: #f8f9fa;
  border-color: #645394;
}

.delivery-info {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
}

/* Seller */
.seller-section {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.seller-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.seller-type-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #645394;
}

.seller-rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars {
  color: #FFD700;
  font-size: 0.875rem;
}

.rating-text {
  font-size: 0.875rem;
  color: #6c757d;
}

.seller-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.btn-contact-seller {
  width: 100%;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #ffffff;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-contact-seller:hover {
  border-color: #645394;
  color: #645394;
}

/* Guarantees */
.guarantees-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.guarantee-item {
  display: flex;
  gap: 12px;
}

.guarantee-item .material-symbols-outlined {
  color: #645394;
  font-size: 24px;
  flex-shrink: 0;
}

.guarantee-content strong {
  display: block;
  font-weight: 600;
  font-size: 0.95rem;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.guarantee-content p {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
}

/* Details Section */
.product-details-section {
  margin-bottom: 60px;
  padding-top: 40px;
  border-top: 1px solid #e9ecef;
}

.section-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  color: #1a1a1a;
  margin: 0 0 24px 0;
}

.description-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.description-text {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 1rem;
  color: #495057;
  line-height: 1.8;
  margin: 0;
}

.specifications-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.spec-label {
  font-weight: 500;
  color: #6c757d;
}

.spec-value {
  font-weight: 600;
  color: #1a1a1a;
}

.documents-section {
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.documents-title {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 16px;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: #1a1a1a;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
}

.document-link:hover {
  background: #e9ecef;
  color: #645394;
}

/* About Seller */
.about-seller-section {
  margin-bottom: 60px;
  padding-top: 40px;
  border-top: 1px solid #e9ecef;
}

.seller-card-large {
  display: flex;
  gap: 24px;
  padding: 32px;
  background: #f8f9fa;
  border-radius: 12px;
}

.seller-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #645394;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.seller-avatar-large .material-symbols-outlined {
  font-size: 40px;
}

.seller-info-large {
  flex: 1;
}

.seller-name-large {
  font-weight: 700;
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.seller-type-large {
  font-size: 0.95rem;
  color: #6c757d;
  margin-bottom: 16px;
}

.seller-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  font-size: 0.95rem;
  color: #495057;
}

.seller-actions {
  display: flex;
  gap: 12px;
}

.btn-view-store,
.btn-contact-seller-large {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
  background: #ffffff;
}

.btn-view-store:hover,
.btn-contact-seller-large:hover {
  border-color: #645394;
  color: #645394;
}

/* Bids */
.bids-section {
  margin-bottom: 60px;
  padding-top: 40px;
  border-top: 1px solid #e9ecef;
}

.bids-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bid-item {
  display: grid;
  grid-template-columns: 50px 1fr auto auto;
  gap: 20px;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px solid transparent;
}

.bid-item.winning {
  background: rgba(100, 83, 148, 0.1);
  border-color: #645394;
}

.bid-rank {
  font-weight: 700;
  font-size: 1.25rem;
  color: #6c757d;
  text-align: center;
}

.bid-amount-large {
  font-weight: 700;
  font-size: 1.5rem;
  color: #645394;
}

.bid-bidder-name {
  font-size: 0.9rem;
  color: #6c757d;
}

.bid-time {
  font-size: 0.875rem;
  color: #868e96;
}

.bid-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #645394;
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Similar Products */
.similar-products-section {
  margin-bottom: 60px;
  padding-top: 40px;
  border-top: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #645394;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.3s;
}

.view-all-link:hover {
  color: #4F4670;
}

.similar-products-carousel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.product-card-mini {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card-mini:hover {
  border-color: #645394;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-image-mini {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f8f9fa;
}

.product-image-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info-mini {
  padding: 12px;
}

.product-title-mini {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.product-price-mini {
  font-weight: 700;
  font-size: 1rem;
  color: #1a1a1a;
}

/* Image Modal */
.image-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: zoom-out;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
}

/* Responsive */
@media (max-width: 968px) {
  .product-main {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .gallery-thumbnails-vertical {
    flex-direction: row;
    max-height: none;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .thumbnail-vertical {
    width: 60px;
    height: 60px;
  }

  .similar-products-carousel {
    grid-template-columns: repeat(2, 1fr);
  }

  .specifications-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .product-title {
    font-size: 1.5rem;
  }

  .price-value {
    font-size: 2rem;
  }

  .similar-products-carousel {
    grid-template-columns: 1fr;
  }

  .seller-card-large {
    flex-direction: column;
    text-align: center;
  }

  .seller-actions {
    flex-direction: column;
  }
}
</style>
