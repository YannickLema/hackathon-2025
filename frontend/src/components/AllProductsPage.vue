<template>
  <div class="all-products-page-wrapper">
    <div class="all-products-page">
      <!-- Breadcrumb -->
      <div class="category-breadcrumb">
        <div class="container">
          <router-link to="/" class="breadcrumb-btn">
            <span class="material-symbols-outlined">arrow_back</span>
            <span>Accueil</span>
          </router-link>
        </div>
      </div>

      <!-- Hero Section -->
      <section class="page-hero">
        <div class="container">
          <h1 class="page-title">Tous les produits</h1>
          <p class="page-description">
            Découvrez notre collection complète d'objets de valeur. Des pièces uniques sélectionnées avec soin pour leur qualité et leur authenticité.
          </p>
        </div>
      </section>

      <!-- Section produits avec recherche et filtres -->
      <section class="products-section">
        <div class="container">
          <div class="products-header">
            <div class="search-container">
              <span class="material-symbols-outlined search-icon">search</span>
              <input 
                type="text" 
                v-model="searchQuery"
                placeholder="Rechercher un produit..." 
                class="search-input"
              />
            </div>
            <div class="products-actions">
              <button class="filter-btn" @click="toggleFilterModal">
                <span class="material-symbols-outlined">tune</span>
                <span>Filtres</span>
                <span v-if="hasActiveFilters" class="filter-badge"></span>
              </button>
              <button class="sort-btn" @click="toggleSortModal">
                <span class="material-symbols-outlined">sort</span>
                <span>Trier</span>
              </button>
            </div>
            
            <!-- Modal Filtres -->
            <div class="filter-modal" v-if="showFilterModal" @click.self="closeFilterModal">
              <div class="filter-modal-content">
                <div class="modal-header">
                  <h3 class="modal-title">Filtrer les produits</h3>
                  <button class="filter-modal-close" @click="closeFilterModal">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div class="modal-body">
                  <div class="form-group">
                    <label for="filterCategory">Catégorie</label>
                    <select id="filterCategory" v-model="filters.category" class="form-select">
                      <option :value="null">Toutes les catégories</option>
                      <option value="OBJETS_ART_TABLEAUX">Objets d'art & tableaux</option>
                      <option value="SCULPTURES_DECORATION">Sculptures & décoration</option>
                      <option value="BIJOUX_MONTRES">Bijoux & montres</option>
                      <option value="MODE_ACCESSOIRES_LUXE">Mode & accessoires de luxe</option>
                      <option value="MEUBLES_ANCIENS">Meubles anciens</option>
                      <option value="VINS_SPIRITUEUX">Vins & spiritueux</option>
                      <option value="INSTRUMENTS_MUSIQUE">Instruments de musique</option>
                      <option value="LIVRES_MANUSCRITS">Livres & manuscrits</option>
                      <option value="PHOTOGRAPHIES_ANCIENNES">Photographies anciennes</option>
                      <option value="DESIGN">Design</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="filterSaleMode">Mode de vente</label>
                    <select id="filterSaleMode" v-model="filters.saleMode" class="form-select">
                      <option :value="null">Tous les modes</option>
                      <option value="AUCTION">Enchères</option>
                      <option value="INSTANT_SALE">Vente rapide</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="minPrice">Prix minimum (€)</label>
                    <input type="number" id="minPrice" v-model.number="filters.minPrice" class="form-input" />
                  </div>
                  <div class="form-group">
                    <label for="maxPrice">Prix maximum (€)</label>
                    <input type="number" id="maxPrice" v-model.number="filters.maxPrice" class="form-input" />
                  </div>
                </div>
                <div class="modal-footer">
                  <button class="btn-secondary" @click="resetFilters">Réinitialiser</button>
                  <button class="btn-primary" @click="applyFilters">Appliquer</button>
                </div>
              </div>
            </div>

            <!-- Modal Trier par -->
            <div class="sort-modal" v-if="showSortModal" @click.self="closeSortModal">
              <div class="sort-modal-content">
                <div class="modal-header">
                  <h3 class="modal-title">Trier les produits</h3>
                  <button class="sort-modal-close" @click="closeSortModal">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div class="modal-body">
                  <div class="form-group">
                    <label for="sortBy">Trier par</label>
                    <select id="sortBy" v-model="sortBy" class="form-select">
                      <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="modal-footer">
                  <button class="btn-primary" @click="applySort">Appliquer</button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="isLoading" class="products-loading">
            <p>Chargement des produits...</p>
          </div>
          <div v-else-if="filteredProducts.length === 0" class="products-empty">
            <span class="material-symbols-outlined empty-icon">inventory_2</span>
            <p>Aucun produit trouvé.</p>
            <button @click="resetFilters" class="btn-primary">Réinitialiser les filtres</button>
          </div>
          <div v-else class="products-grid">
            <router-link 
              v-for="product in filteredProducts" 
              :key="product.id"
              :to="`/produit/${product.id}`"
              class="product-card-link"
            >
              <div class="product-card">
                <div class="product-image">
                  <img :src="product.image" :alt="product.title" />
                  <button 
                    class="wishlist-btn" 
                    @click.stop.prevent="toggleWishlist(product.id)"
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
                <div class="product-content">
                  <div class="product-header">
                    <h3 class="product-title">{{ product.title }}</h3>
                    <span class="product-price">{{ formatPrice(product.price) }}€</span>
                  </div>
                  <p class="product-description">{{ truncateDescription(product.description) }}</p>
                  <div v-if="product.saleMode === 'AUCTION' && product.auctionStartPrice" class="auction-info">
                    <span class="auction-label">Prix de départ :</span>
                    <span class="auction-price">{{ formatPrice(product.auctionStartPrice) }}€</span>
                  </div>
                  <button 
                    class="add-to-cart-btn" 
                    @click.stop.prevent="addToCart(product.id)"
                  >
                    {{ product.saleMode === 'AUCTION' ? 'Enchérir' : 'Ajouter au panier' }}
                  </button>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </section>

      <!-- Newsletter -->
      <NewsletterSection />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import NewsletterSection from './NewsletterSection.vue'

const route = useRoute()
const searchQuery = ref('')
const showFilterModal = ref(false)
const showSortModal = ref(false)
const sortBy = ref('default')
const isLoading = ref(false)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const filters = ref({
  category: null,
  saleMode: null,
  minPrice: null,
  maxPrice: null
})

const sortOptions = [
  { value: 'default', label: 'Par défaut' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'name-asc', label: 'Nom A-Z' },
  { value: 'name-desc', label: 'Nom Z-A' }
]

const products = ref([])

const hasActiveFilters = computed(() => {
  return filters.value.category !== null || 
         filters.value.saleMode !== null || 
         filters.value.minPrice !== null || 
         filters.value.maxPrice !== null
})

// Charger les produits depuis l'API
const loadProducts = async () => {
  isLoading.value = true
  try {
    const params = new URLSearchParams({
      status: 'PUBLISHED',
    })
    
    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }
    
    if (filters.value.category) {
      params.append('category', filters.value.category)
    }
    
    if (filters.value.minPrice !== null && filters.value.minPrice !== '') {
      params.append('minPrice', filters.value.minPrice.toString())
    }
    
    if (filters.value.maxPrice !== null && filters.value.maxPrice !== '') {
      params.append('maxPrice', filters.value.maxPrice.toString())
    }
    
    const response = await fetch(`${API_URL}/listings?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des produits')
    }
    
    const data = await response.json()
    
    // Charger les favoris depuis localStorage
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    const wishlistIds = new Set(wishlist.map(item => item.id))
    
    // Transformer les données backend en format frontend
    let transformedProducts = data.listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: parseFloat(listing.priceDesired),
      image: listing.photos && listing.photos.length > 0 
        ? listing.photos[0].url 
        : 'https://via.placeholder.com/400x400?text=No+Image',
      isWishlisted: wishlistIds.has(listing.id),
      saleMode: listing.saleMode,
      auctionStartPrice: listing.auctionStartPrice ? parseFloat(listing.auctionStartPrice) : null,
      auctionEndAt: listing.auctionEndAt,
      category: listing.category
    }))
    
    // Filtrer par mode de vente côté client (car l'API ne le supporte pas encore)
    if (filters.value.saleMode) {
      transformedProducts = transformedProducts.filter(p => p.saleMode === filters.value.saleMode)
    }
    
    products.value = transformedProducts
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error)
    products.value = []
  } finally {
    isLoading.value = false
  }
}

const filteredProducts = computed(() => {
  let filtered = [...products.value]

  // Tri
  if (sortBy.value === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price)
  } else if (sortBy.value === 'name-asc') {
    filtered.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortBy.value === 'name-desc') {
    filtered.sort((a, b) => b.title.localeCompare(a.title))
  }

  return filtered
})

const toggleFilterModal = () => {
  showFilterModal.value = !showFilterModal.value
  if (showFilterModal.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeFilterModal = () => {
  showFilterModal.value = false
  document.body.style.overflow = ''
}

const toggleSortModal = () => {
  showSortModal.value = !showSortModal.value
  if (showSortModal.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeSortModal = () => {
  showSortModal.value = false
  document.body.style.overflow = ''
}

const applyFilters = () => {
  closeFilterModal()
  loadProducts()
}

const resetFilters = () => {
  filters.value = {
    category: null,
    saleMode: null,
    minPrice: null,
    maxPrice: null
  }
  loadProducts()
}

const applySort = () => {
  closeSortModal()
}

const toggleWishlist = (productId) => {
  const product = products.value.find(p => p.id === productId)
  if (product) {
    product.isWishlisted = !product.isWishlisted
    
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    
    if (product.isWishlisted) {
      if (!wishlist.find(item => item.id === productId)) {
        wishlist.push({
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
        })
      }
    } else {
      wishlist = wishlist.filter(item => item.id !== productId)
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
    window.dispatchEvent(new Event('wishlist-updated'))
  }
}

const addToCart = (productId) => {
  const product = products.value.find(p => p.id === productId)
  if (product) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find(item => item.id === productId)
    
    if (existingItem) {
      existingItem.quantity++
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1,
      })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

const truncateDescription = (description) => {
  if (!description) return ''
  return description.length > 100 ? description.substring(0, 100) + '...' : description
}

// Watcher pour recharger les produits quand la recherche change
let searchTimeout = null
watch(searchQuery, () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    loadProducts()
  }, 500)
})

onMounted(() => {
  loadProducts()
  
  // Écouter les événements de création de listing pour rafraîchir
  window.addEventListener('listing-created', loadProducts)
})

// Nettoyer l'écouteur d'événement
onUnmounted(() => {
  window.removeEventListener('listing-created', loadProducts)
})
</script>

<style scoped>
.all-products-page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
}

.all-products-page {
  flex: 1;
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

.page-hero {
  background-color: #ffffff;
  padding: 60px 0;
}

.page-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-size: 3rem;
  color: #213547;
  margin: 0 0 20px 0;
  line-height: 1.2;
}

.page-description {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 1.1rem;
  color: #666;
  line-height: 1.8;
  margin: 0;
  max-width: 800px;
}

.products-section {
  padding: 40px 0 80px 0;
}

.products-header {
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.search-container {
  flex: 1;
  min-width: 300px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #999;
  font-size: 24px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 50px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 16px;
  color: #213547;
  background-color: #f5f5f5;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #645394;
  background-color: #ffffff;
}

.products-actions {
  display: flex;
  gap: 10px;
}

.filter-btn,
.sort-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  color: #213547;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.filter-btn:hover,
.sort-btn:hover {
  background-color: #f5f5f5;
  border-color: #645394;
}

.filter-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background-color: #645394;
  border-radius: 50%;
}

.filter-btn .material-symbols-outlined,
.sort-btn .material-symbols-outlined {
  font-size: 20px;
}

/* Modals */
.filter-modal,
.sort-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.filter-modal-content,
.sort-modal-content {
  background-color: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 25px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: #213547;
  margin: 0;
}

.filter-modal-close,
.sort-modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #213547;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #213547;
  margin-bottom: 8px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 16px;
  background-color: #f5f5f5;
  color: #213547;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #645394;
  background-color: #ffffff;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 25px;
  border-top: 1px solid #e0e0e0;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
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

.products-loading,
.products-empty {
  text-align: center;
  padding: 60px 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #666;
}

.products-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.products-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  flex-direction: column;
  gap: 20px;
}

.empty-icon {
  font-size: 64px;
  color: #ccc;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.product-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.product-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card-link:hover .product-card {
  transform: translateY(-2px);
}

.product-image {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wishlist-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
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
  font-size: 24px;
}

.wishlist-btn .material-symbols-outlined.active {
  color: #e91e63;
}

.product-badge {
  position: absolute;
  bottom: 12px;
  left: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
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

.product-badge .material-symbols-outlined {
  font-size: 16px;
}

.product-content {
  padding: 20px;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
}

.product-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: #213547;
  margin: 0;
  flex: 1;
  line-height: 1.3;
}

.product-price {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.2rem;
  color: #645394;
  white-space: nowrap;
}

.product-description {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
  margin-bottom: 12px;
}

.auction-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 6px;
}

.auction-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 0.85rem;
  color: #666;
}

.auction-price {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  color: #645394;
}

.add-to-cart-btn {
  width: 100%;
  padding: 12px 20px;
  background-color: #645394;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-cart-btn:hover {
  background-color: #4F4670;
}

@media (max-width: 768px) {
  .products-header {
    flex-direction: column;
  }

  .search-container {
    min-width: 100%;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 2rem;
  }
}
</style>

