<template>
  <div class="product-page-wrapper">
    <div v-if="isLoading" class="product-loading">
      <p>Chargement du produit...</p>
    </div>
    <div v-else-if="error" class="product-error">
      <span class="material-symbols-outlined">error</span>
      <p>{{ error }}</p>
      <router-link to="/produits" class="btn-primary">Retour aux produits</router-link>
    </div>
    <div v-else-if="product" class="product-page">
      <!-- Breadcrumb -->
      <div class="category-breadcrumb">
        <div class="container">
          <router-link to="/produits" class="breadcrumb-btn">
            <span class="material-symbols-outlined">arrow_back</span>
            <span>Retour aux produits</span>
          </router-link>
        </div>
      </div>

      <div class="container">
        <div class="product-main">
          <!-- Galerie d'images -->
          <div class="product-gallery">
            <div class="gallery-main">
              <img 
                :src="selectedImage || product.mainImage" 
                :alt="product.title"
                class="main-image"
              />
              <button 
                class="wishlist-btn" 
                @click="toggleWishlist"
                aria-label="Ajouter aux favoris"
              >
                <span class="material-symbols-outlined" :class="{ active: product.isWishlisted }">
                  favorite
                </span>
              </button>
              <div v-if="product.saleMode === 'AUCTION'" class="product-badge auction-badge">
                <span class="material-symbols-outlined">gavel</span>
                Enchères
              </div>
              <div v-else class="product-badge instant-badge">
                <span class="material-symbols-outlined">flash_on</span>
                Vente rapide
              </div>
            </div>
            <div v-if="product.images && product.images.length > 1" class="gallery-thumbnails">
              <button
                v-for="(image, index) in product.images"
                :key="index"
                @click="selectedImage = image"
                :class="['thumbnail', { active: selectedImage === image || (!selectedImage && index === 0) }]"
              >
                <img :src="image" :alt="`${product.title} - Image ${index + 1}`" />
              </button>
            </div>
          </div>

          <!-- Informations produit -->
          <div class="product-info">
            <h1 class="product-title">{{ product.title }}</h1>
            
            <div class="product-price-section">
              <div class="price-main">
                <span class="price-label">Prix souhaité</span>
                <span class="price-value">{{ formatPrice(product.price) }}€</span>
              </div>
              <div v-if="product.saleMode === 'AUCTION' && product.auctionStartPrice" class="price-auction">
                <span class="price-label">Prix de départ</span>
                <span class="price-value">{{ formatPrice(product.auctionStartPrice) }}€</span>
              </div>
              <div v-if="product.saleMode === 'AUCTION' && product.auctionEndAt" class="auction-timer">
                <span class="material-symbols-outlined">schedule</span>
                <span>Enchères se terminent le {{ formatDate(product.auctionEndAt) }}</span>
              </div>
            </div>

            <div class="product-details">
              <div class="detail-item">
                <span class="detail-label">Catégorie</span>
                <span class="detail-value">{{ formatCategory(product.category) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Dimensions</span>
                <span class="detail-value">{{ product.dimensions }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Poids</span>
                <span class="detail-value">{{ product.weight }} kg</span>
              </div>
            </div>

            <div class="product-description">
              <h2 class="section-title">Description</h2>
              <p>{{ product.description }}</p>
            </div>

            <div v-if="product.documents && product.documents.length > 0" class="product-documents">
              <h2 class="section-title">Documents</h2>
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
                </a>
              </div>
            </div>

            <div class="product-actions">
              <button 
                v-if="product.saleMode === 'AUCTION'"
                class="btn-primary btn-large"
                @click="handleBid"
              >
                <span class="material-symbols-outlined">gavel</span>
                Enchérir
              </button>
              <button 
                v-else
                class="btn-primary btn-large"
                @click="addToCart"
              >
                <span class="material-symbols-outlined">shopping_cart</span>
                Ajouter au panier
              </button>
              <button 
                class="btn-secondary btn-large"
                @click="contactSeller"
              >
                <span class="material-symbols-outlined">mail</span>
                Contacter le vendeur
              </button>
            </div>

            <div class="seller-info">
              <h2 class="section-title">Vendeur</h2>
              <div class="seller-details">
                <div class="seller-name">
                  <span v-if="product.seller?.companyName">{{ product.seller.companyName }}</span>
                  <span v-else>{{ product.seller?.firstName }} {{ product.seller?.lastName }}</span>
                </div>
                <div v-if="product.seller?.companyName" class="seller-type">
                  Professionnel
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Newsletter -->
      <NewsletterSection />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NewsletterSection from './NewsletterSection.vue'

const route = useRoute()
const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const product = ref(null)
const isLoading = ref(false)
const error = ref('')
const selectedImage = ref(null)

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
    const response = await fetch(`${API_URL}/listings/${productId}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Produit introuvable')
      }
      throw new Error('Erreur lors du chargement du produit')
    }
    
    const data = await response.json()
    
    // Charger les favoris depuis localStorage
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    const wishlistIds = new Set(wishlist.map(item => item.id))
    
    // Transformer les données backend en format frontend
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
  } catch (err) {
    console.error('Erreur lors du chargement du produit:', err)
    error.value = err.message || 'Une erreur est survenue'
  } finally {
    isLoading.value = false
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

const addToCart = () => {
  if (!product.value) return
  
  let cart = JSON.parse(localStorage.getItem('cart') || '[]')
  const existingItem = cart.find(item => item.id === product.value.id)
  
  if (existingItem) {
    existingItem.quantity++
  } else {
    cart.push({
      id: product.value.id,
      title: product.value.title,
      price: product.value.price,
      image: product.value.mainImage,
      quantity: 1,
    })
  }
  
  localStorage.setItem('cart', JSON.stringify(cart))
  window.dispatchEvent(new Event('cart-updated'))
  
  // Optionnel: afficher une notification
  alert('Produit ajouté au panier')
}

const handleBid = () => {
  // TODO: Implémenter la logique d'enchère
  alert('Fonctionnalité d\'enchère à venir')
}

const contactSeller = () => {
  // TODO: Implémenter la messagerie
  alert('Fonctionnalité de contact à venir')
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

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.product-page-wrapper {
  min-height: 100vh;
  background-color: #ffffff;
}

.product-loading,
.product-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
  text-align: center;
}

.product-error .material-symbols-outlined {
  font-size: 64px;
  color: #d32f2f;
}

.product-error p {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #666;
}

.category-breadcrumb {
  background-color: #645394;
  padding: 15px 0;
}

.breadcrumb-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: white;
  text-decoration: none;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
  transition: opacity 0.3s ease;
}

.breadcrumb-btn:hover {
  opacity: 0.8;
}

.breadcrumb-btn .material-symbols-outlined {
  font-size: 20px;
}

.product-page {
  padding: 40px 0 80px 0;
}

.product-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  margin-top: 40px;
}

/* Galerie */
.product-gallery {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.gallery-main {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 12px;
  background-color: #f5f5f5;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wishlist-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 2;
}

.wishlist-btn:hover {
  background-color: #ffffff;
  transform: scale(1.1);
}

.wishlist-btn .material-symbols-outlined {
  color: #ccc;
  font-size: 28px;
}

.wishlist-btn .material-symbols-outlined.active {
  color: #e91e63;
}

.product-badge {
  position: absolute;
  bottom: 20px;
  left: 20px;
  padding: 8px 16px;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 2;
}

.auction-badge {
  background-color: #645394;
  color: #ffffff;
}

.instant-badge {
  background-color: #ff9800;
  color: #ffffff;
}

.gallery-thumbnails {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 5px 0;
}

.thumbnail {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  background: none;
  padding: 0;
}

.thumbnail:hover {
  border-color: #645394;
}

.thumbnail.active {
  border-color: #645394;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Informations produit */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.product-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-size: 2.5rem;
  color: #213547;
  margin: 0;
  line-height: 1.2;
}

.product-price-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 12px;
}

.price-main,
.price-auction {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 1rem;
  color: #666;
}

.price-value {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.8rem;
  color: #645394;
}

.auction-timer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  color: #645394;
}

.auction-timer .material-symbols-outlined {
  font-size: 20px;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 0.95rem;
  color: #666;
}

.detail-value {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  color: #213547;
}

.section-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: #213547;
  margin: 0 0 15px 0;
}

.product-description p {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 1rem;
  color: #666;
  line-height: 1.8;
  margin: 0;
}

.product-documents {
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.document-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
  text-decoration: none;
  color: #213547;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.document-link:hover {
  background-color: #e0e0e0;
  color: #645394;
}

.document-link .material-symbols-outlined {
  font-size: 20px;
}

.product-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background-color: #645394;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #4F4670;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #213547;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-large {
  padding: 18px 28px;
  font-size: 18px;
}

.seller-info {
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.seller-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.seller-name {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: #213547;
}

.seller-type {
  padding: 4px 12px;
  background-color: #645394;
  color: #ffffff;
  border-radius: 12px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 12px;
}

@media (max-width: 968px) {
  .product-main {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .product-title {
    font-size: 2rem;
  }
}
</style>

