<template>
  <div class="search-wrapper">
    <div class="search-container">
      <!-- En-tête -->
      <div class="page-header">
        <router-link to="/dashboard/professionnel" class="back-link">
          <span class="material-symbols-outlined">arrow_back</span>
          Retour au tableau de bord
        </router-link>
        <h1 class="page-title">Recherche d'objet</h1>
        <p class="page-subtitle">Trouvez les objets qui vous intéressent</p>
      </div>

      <!-- Barre de recherche principale -->
      <div class="search-section">
        <div class="main-search-box">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            v-model="searchQuery"
            type="text"
            class="main-search-input"
            placeholder="Rechercher un objet, une description..."
            @input="handleSearchInput"
            @keyup.enter="performSearch"
          />
          <button @click="performSearch" class="search-btn">
            <span class="material-symbols-outlined">search</span>
            Rechercher
          </button>
        </div>

        <!-- Suggestions de recherche (si disponible) -->
        <div v-if="searchSuggestions.length > 0 && showSuggestions" class="search-suggestions">
          <div
            v-for="suggestion in searchSuggestions"
            :key="suggestion.id"
            @click="selectSuggestion(suggestion)"
            class="suggestion-item"
          >
            <span class="material-symbols-outlined">search</span>
            <span>{{ suggestion.text }}</span>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters-section">
        <div class="filters-header">
          <h2 class="filters-title">
            <span class="material-symbols-outlined">tune</span>
            Filtres
          </h2>
          <button @click="resetFilters" class="reset-filters-btn">
            Réinitialiser
          </button>
        </div>

        <div class="filters-grid">
          <!-- Filtre par prix -->
          <div class="filter-group">
            <label class="filter-label">Prix</label>
            <div class="price-range">
              <input
                v-model.number="filters.minPrice"
                type="number"
                class="price-input"
                placeholder="Min"
                min="0"
              />
              <span class="price-separator">-</span>
              <input
                v-model.number="filters.maxPrice"
                type="number"
                class="price-input"
                placeholder="Max"
                min="0"
              />
            </div>
          </div>

          <!-- Filtre par mode de vente -->
          <div class="filter-group">
            <label class="filter-label">Mode de vente</label>
            <div class="filter-options">
              <label class="filter-option">
                <input
                  v-model="filters.saleMode"
                  type="radio"
                  value=""
                />
                <span>Tous</span>
              </label>
              <label class="filter-option">
                <input
                  v-model="filters.saleMode"
                  type="radio"
                  value="AUCTION"
                />
                <span class="material-symbols-outlined">gavel</span>
                <span>Enchères</span>
              </label>
              <label class="filter-option">
                <input
                  v-model="filters.saleMode"
                  type="radio"
                  value="INSTANT_SALE"
                />
                <span class="material-symbols-outlined">flash_on</span>
                <span>Vente rapide</span>
              </label>
            </div>
          </div>

          <!-- Filtre par catégorie -->
          <div class="filter-group">
            <label class="filter-label">Catégorie</label>
            <select v-model="filters.category" class="filter-select">
              <option value="">Toutes les catégories</option>
              <option value="PEINTURE">Peinture</option>
              <option value="SCULPTURE">Sculpture</option>
              <option value="MONTRE">Montre</option>
              <option value="BIJOU">Bijou</option>
              <option value="OBJET_ART">Objet d'art</option>
              <option value="PHOTOGRAPHIE">Photographie</option>
              <option value="VETEMENT">Vêtement</option>
              <option value="ACCESSOIRE">Accessoire</option>
              <option value="DESIGN">Design</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          <!-- Filtre par statut -->
          <div class="filter-group">
            <label class="filter-label">Statut</label>
            <div class="filter-options">
              <label class="filter-option">
                <input
                  v-model="filters.status"
                  type="radio"
                  value=""
                />
                <span>Tous</span>
              </label>
              <label class="filter-option">
                <input
                  v-model="filters.status"
                  type="radio"
                  value="PUBLISHED"
                />
                <span>En vente</span>
              </label>
              <label class="filter-option">
                <input
                  v-model="filters.status"
                  type="radio"
                  value="ENDED"
                />
                <span>Plus disponible</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Résultats -->
      <div class="results-section">
        <div class="results-header">
          <h2 class="results-title">
            Résultats de recherche
            <span v-if="filteredListings.length > 0" class="results-count">
              ({{ filteredListings.length }})
            </span>
          </h2>
          <div class="sort-options">
            <label class="sort-label">Trier par :</label>
            <select v-model="sortBy" class="sort-select">
              <option value="default">Par défaut</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="date-desc">Plus récent</option>
              <option value="date-asc">Plus ancien</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <span class="material-symbols-outlined loading-icon">hourglass_empty</span>
          <p>Recherche en cours...</p>
        </div>

        <div v-else-if="filteredListings.length === 0" class="empty-state">
          <span class="material-symbols-outlined empty-icon">search_off</span>
          <p>Aucun résultat trouvé</p>
          <p class="empty-hint">Essayez de modifier vos critères de recherche</p>
        </div>

        <div v-else class="listings-grid">
          <div
            v-for="listing in sortedListings"
            :key="listing.id"
            class="listing-card"
          >
            <div class="listing-image-container">
              <img :src="listing.mainImage" :alt="listing.title" class="listing-image" />
              <button
                @click="toggleFavorite(listing.id)"
                class="favorite-btn"
                :class="{ active: listing.isFavorite }"
                aria-label="Ajouter aux favoris"
              >
                <span class="material-symbols-outlined">favorite</span>
              </button>
              <div class="listing-badges">
                <span class="sale-mode-badge" :class="listing.saleMode.toLowerCase()">
                  <span class="material-symbols-outlined">
                    {{ listing.saleMode === 'AUCTION' ? 'gavel' : 'flash_on' }}
                  </span>
                  {{ listing.saleMode === 'AUCTION' ? 'Enchères' : 'Vente rapide' }}
                </span>
                <span class="status-badge" :class="listing.status.toLowerCase()">
                  {{ listing.status === 'PUBLISHED' ? 'En vente' : 'Plus disponible' }}
                </span>
              </div>
            </div>

            <div class="listing-content">
              <h3 class="listing-title">{{ listing.title }}</h3>
              <p class="listing-category">{{ getCategoryLabel(listing.category) }}</p>
              
              <!-- Prix ou enchère en cours -->
              <div v-if="listing.saleMode === 'AUCTION'" class="auction-info">
                <div class="current-bid">
                  <span class="bid-label">Enchère en cours :</span>
                  <span class="bid-amount">{{ formatCurrency(listing.currentBid || listing.priceDesired) }}</span>
                </div>
                <div v-if="listing.auctionEndAt" class="auction-timer">
                  <span class="material-symbols-outlined">schedule</span>
                  <span>Fin dans {{ getTimeRemaining(listing.auctionEndAt) }}</span>
                </div>
              </div>
              <div v-else class="listing-price">
                {{ formatCurrency(listing.priceDesired) }}
              </div>

              <div class="listing-actions">
                <button
                  v-if="listing.saleMode === 'AUCTION'"
                  @click="placeBid(listing.id)"
                  class="action-btn btn-bid"
                >
                  <span class="material-symbols-outlined">gavel</span>
                  Enchérir
                </button>
                <button
                  v-else
                  @click="makeOffer(listing.id)"
                  class="action-btn btn-offer"
                >
                  <span class="material-symbols-outlined">local_offer</span>
                  Faire une offre
                </button>
                <router-link
                  :to="`/categorie/${listing.categoryId}/produit/${listing.id}`"
                  class="action-btn btn-view"
                >
                  <span class="material-symbols-outlined">visibility</span>
                  Voir
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const loading = ref(false)
const searchQuery = ref('')
const showSuggestions = ref(false)
const searchSuggestions = ref([])
const sortBy = ref('default')

const filters = ref({
  minPrice: null,
  maxPrice: null,
  saleMode: '',
  category: '',
  status: ''
})

const listings = ref([])

const filteredListings = computed(() => {
  let filtered = [...listings.value]

  // Filtre par recherche textuelle
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(listing =>
      listing.title.toLowerCase().includes(query) ||
      listing.description?.toLowerCase().includes(query) ||
      getCategoryLabel(listing.category).toLowerCase().includes(query)
    )
  }

  // Filtre par prix
  if (filters.value.minPrice !== null && filters.value.minPrice !== '') {
    filtered = filtered.filter(l => l.priceDesired >= filters.value.minPrice)
  }
  if (filters.value.maxPrice !== null && filters.value.maxPrice !== '') {
    filtered = filtered.filter(l => l.priceDesired <= filters.value.maxPrice)
  }

  // Filtre par mode de vente
  if (filters.value.saleMode) {
    filtered = filtered.filter(l => l.saleMode === filters.value.saleMode)
  }

  // Filtre par catégorie
  if (filters.value.category) {
    filtered = filtered.filter(l => l.category === filters.value.category)
  }

  // Filtre par statut
  if (filters.value.status) {
    filtered = filtered.filter(l => l.status === filters.value.status)
  }

  return filtered
})

const sortedListings = computed(() => {
  const sorted = [...filteredListings.value]

  switch (sortBy.value) {
    case 'price-asc':
      return sorted.sort((a, b) => a.priceDesired - b.priceDesired)
    case 'price-desc':
      return sorted.sort((a, b) => b.priceDesired - a.priceDesired)
    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    case 'date-asc':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    default:
      return sorted
  }
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

const getCategoryLabel = (category) => {
  const labels = {
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
  return labels[category] || category
}

const getTimeRemaining = (endDate) => {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end - now

  if (diff <= 0) return 'Terminé'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}j ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}min`
  return `${minutes}min`
}

const handleSearchInput = () => {
  // TODO: Implémenter les suggestions de recherche
  // Pour l'instant, on cache les suggestions après 2 secondes
  if (searchQuery.value.length > 2) {
    showSuggestions.value = true
    // Simuler des suggestions
    searchSuggestions.value = [
      { id: 1, text: searchQuery.value + ' - Peinture' },
      { id: 2, text: searchQuery.value + ' - Montre' }
    ]
  } else {
    showSuggestions.value = false
  }
}

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion.text
  showSuggestions.value = false
  performSearch()
}

const performSearch = () => {
  showSuggestions.value = false
  loadListings()
}

const resetFilters = () => {
  filters.value = {
    minPrice: null,
    maxPrice: null,
    saleMode: '',
    category: '',
    status: ''
  }
  searchQuery.value = ''
  loadListings()
}

const loadListings = async () => {
  loading.value = true
  const token = localStorage.getItem('access_token')

  try {
    const params = new URLSearchParams()
    if (searchQuery.value) params.append('q', searchQuery.value)
    if (filters.value.minPrice) params.append('priceMin', filters.value.minPrice.toString())
    if (filters.value.maxPrice) params.append('priceMax', filters.value.maxPrice.toString())
    if (filters.value.saleMode) params.append('saleMode', filters.value.saleMode)
    if (filters.value.category) params.append('category', filters.value.category)
    if (filters.value.status) params.append('status', filters.value.status)
    
    const response = await fetch(`${API_URL}/listings/search?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la recherche')
    }
    
    const data = await response.json()
    
    // Transformer les données
    listings.value = data.map(listing => ({
      id: listing.id,
      title: listing.title,
      category: listing.category,
      description: listing.description,
      priceDesired: parseFloat(listing.priceDesired),
      saleMode: listing.saleMode,
      status: listing.status,
      mainImage: listing.photos && listing.photos.length > 0 
        ? listing.photos[0].url 
        : 'https://via.placeholder.com/400x400?text=No+Image',
      currentBid: listing.auctionStartPrice ? parseFloat(listing.auctionStartPrice) : null,
      auctionEndAt: listing.auctionEndAt,
      categoryId: null,
      createdAt: listing.createdAt,
      isFavorite: false
    }))
  } catch (error) {
    console.error('Erreur lors de la recherche:', error)
    listings.value = []
  } finally {
    loading.value = false
  }
}

const toggleFavorite = async (listingId) => {
  const listing = listings.value.find(l => l.id === listingId)
  if (!listing) return
  
  const token = localStorage.getItem('access_token')
  if (!token) {
    router.push('/login')
    return
  }
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    if (listing.isFavorite) {
      // Retirer des favoris
      await fetch(`${API_URL}/listings/${listingId}/favorite`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
    } else {
      // Ajouter aux favoris
      await fetch(`${API_URL}/listings/${listingId}/favorite`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
    }
    
    listing.isFavorite = !listing.isFavorite
    window.dispatchEvent(new Event('wishlist-updated'))
  } catch (error) {
    console.error('Erreur lors de la mise à jour des favoris:', error)
  }
}

const placeBid = (listingId) => {
  router.push(`/produit/${listingId}`)
}

const makeOffer = (listingId) => {
  router.push(`/produit/${listingId}`)
}

const checkAuth = () => {
  const token = localStorage.getItem('access_token')
  const userData = localStorage.getItem('user')
  
  if (!token || !userData) {
    router.push('/login')
    return false
  }
  
  try {
    const user = JSON.parse(userData)
    if (user.role !== 'PROFESSIONNEL' && user.role !== 'professionnel') {
      router.push('/dashboard/particulier')
      return false
    }
  } catch (e) {
    router.push('/login')
    return false
  }
  
  return true
}

// Charger la requête depuis l'URL
onMounted(() => {
  if (!checkAuth()) return
  
  if (route.query.q) {
    searchQuery.value = route.query.q
  }
  
  loadListings()
})

// Watcher pour recharger quand les filtres changent
watch([filters, sortBy], () => {
  // Les computed properties se mettront à jour automatiquement
})
</script>

<style scoped>
.search-wrapper {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30px 0;
  width: 100%;
  overflow-x: hidden;
}

.search-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 30px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: #645394;
  text-decoration: none;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.back-link:hover {
  gap: 12px;
  color: #4F4670;
}

.page-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-size: 2.5rem;
  color: #213547;
  margin: 0 0 10px 0;
}

.page-subtitle {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

/* Recherche principale */
.search-section {
  position: relative;
  margin-bottom: 40px;
}

.main-search-box {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-icon {
  color: #999;
  font-size: 24px;
}

.main-search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 1.1rem;
  color: #213547;
  outline: none;
}

.main-search-input::placeholder {
  color: #999;
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #645394;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background-color: #4F4670;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 10;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.suggestion-item .material-symbols-outlined {
  color: #999;
  font-size: 20px;
}

/* Filtres */
.filters-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.filters-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.3rem;
  color: #213547;
  margin: 0;
}

.filters-title .material-symbols-outlined {
  color: #645394;
  font-size: 24px;
}

.reset-filters-btn {
  padding: 8px 16px;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-filters-btn:hover {
  background-color: #e0e0e0;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  color: #213547;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.95rem;
  background-color: #f5f5f5;
  color: #213547;
}

.price-input:focus {
  outline: none;
  border-color: #645394;
  background-color: #ffffff;
}

.price-separator {
  color: #999;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.9rem;
  color: #666;
}

.filter-option input[type="radio"] {
  cursor: pointer;
}

.filter-option .material-symbols-outlined {
  font-size: 18px;
  color: #645394;
}

.filter-select {
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.95rem;
  background-color: #f5f5f5;
  color: #213547;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #645394;
  background-color: #ffffff;
}

/* Résultats */
.results-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 30px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.results-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.3rem;
  color: #213547;
  margin: 0;
}

.results-count {
  color: #645394;
  font-weight: 400;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.9rem;
  color: #666;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.9rem;
  background-color: #f5f5f5;
  color: #213547;
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: #645394;
}

/* Grille des annonces */
.listings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.listing-card {
  background-color: #fafafa;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.listing-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.listing-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  background-color: #f5f5f5;
}

.listing-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.favorite-btn:hover {
  background-color: #ffffff;
  transform: scale(1.1);
}

.favorite-btn.active {
  background-color: #d32f2f;
  color: #ffffff;
}

.listing-badges {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sale-mode-badge,
.status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
  backdrop-filter: blur(10px);
}

.sale-mode-badge.auction {
  background-color: rgba(100, 83, 148, 0.9);
  color: #ffffff;
}

.sale-mode-badge.instant_sale {
  background-color: rgba(255, 152, 0, 0.9);
  color: #ffffff;
}

.status-badge.published {
  background-color: rgba(76, 175, 80, 0.9);
  color: #ffffff;
}

.status-badge.ended {
  background-color: rgba(158, 158, 158, 0.9);
  color: #ffffff;
}

.listing-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.listing-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: #213547;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.listing-category {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.85rem;
  color: #999;
  margin: 0;
}

.listing-price {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 700;
  font-size: 1.3rem;
  color: #645394;
  margin: 0;
}

.auction-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.current-bid {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bid-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.9rem;
  color: #666;
}

.bid-amount {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 700;
  font-size: 1.2rem;
  color: #645394;
}

.auction-timer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.85rem;
  color: #d32f2f;
}

.listing-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
  border: none;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-bid {
  background-color: #645394;
  color: #ffffff;
}

.btn-bid:hover {
  background-color: #4F4670;
}

.btn-offer {
  background-color: #FF9800;
  color: #ffffff;
}

.btn-offer:hover {
  background-color: #F57C00;
}

.btn-view {
  background-color: #f5f5f5;
  color: #645394;
  border: 1px solid #e0e0e0;
}

.btn-view:hover {
  background-color: #e0e0e0;
}

/* États */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.loading-icon,
.empty-icon {
  font-size: 64px;
  color: #e0e0e0;
  margin-bottom: 20px;
}

.empty-hint {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.9rem;
  color: #999;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .search-container {
    padding: 0 15px;
  }

  .page-title {
    font-size: 2rem;
  }

  .main-search-box {
    flex-direction: column;
  }

  .search-btn {
    width: 100%;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .listings-grid {
    grid-template-columns: 1fr;
  }

  .listing-actions {
    flex-direction: column;
  }
}
</style>

