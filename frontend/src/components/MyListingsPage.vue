<template>
  <div class="my-listings-wrapper">
    <div class="my-listings-container">
      <!-- En-tête -->
      <div class="page-header">
        <router-link to="/dashboard/particulier" class="back-link">
          <span class="material-symbols-outlined">arrow_back</span>
          Retour au tableau de bord
        </router-link>
        <div class="header-content">
          <div>
            <h1 class="page-title">Mes objets en vente</h1>
            <p class="page-subtitle">Gérez vos annonces, offres et messages</p>
          </div>
          <router-link to="/creer-annonce" class="btn-primary">
            <span class="material-symbols-outlined">add_circle</span>
            Vendre un objet
          </router-link>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="filters-section">
        <div class="search-box">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Rechercher dans mes annonces..."
          />
        </div>
        <div class="filter-buttons">
          <button
            v-for="filter in statusFilters"
            :key="filter.value"
            @click="activeFilter = filter.value"
            class="filter-btn"
            :class="{ active: activeFilter === filter.value }"
          >
            {{ filter.label }}
            <span v-if="filter.count" class="filter-count">{{ filter.count }}</span>
          </button>
        </div>
      </div>

      <!-- Statistiques rapides -->
      <div class="quick-stats">
        <div class="quick-stat-item">
          <span class="stat-icon material-symbols-outlined">inventory_2</span>
          <div class="stat-info">
            <span class="stat-value">{{ filteredListings.length }}</span>
            <span class="stat-label">Annonces</span>
          </div>
        </div>
        <div class="quick-stat-item">
          <span class="stat-icon material-symbols-outlined">local_offer</span>
          <div class="stat-info">
            <span class="stat-value highlight">{{ totalOffers }}</span>
            <span class="stat-label">Offres reçues</span>
          </div>
        </div>
        <div class="quick-stat-item">
          <span class="stat-icon material-symbols-outlined">mail</span>
          <div class="stat-info">
            <span class="stat-value highlight">{{ totalMessages }}</span>
            <span class="stat-label">Messages</span>
          </div>
        </div>
      </div>

      <!-- Liste des annonces -->
      <div v-if="loading" class="loading-state">
        <span class="material-symbols-outlined loading-icon">hourglass_empty</span>
        <p>Chargement...</p>
      </div>

      <div v-else-if="filteredListings.length === 0" class="empty-state">
        <span class="material-symbols-outlined empty-icon">inventory_2</span>
        <p>{{ searchQuery ? 'Aucune annonce ne correspond à votre recherche' : 'Aucun objet en vente pour le moment' }}</p>
        <router-link to="/creer-annonce" class="btn-secondary">Créer ma première annonce</router-link>
      </div>

      <div v-else class="listings-grid">
        <div
          v-for="listing in filteredListings"
          :key="listing.id"
          class="listing-card"
        >
          <div class="listing-image-container">
            <img :src="listing.mainImage" :alt="listing.title" class="listing-image" />
            <div class="listing-badges">
              <span v-if="listing.offersCount > 0" class="badge badge-offers">
                <span class="material-symbols-outlined">local_offer</span>
                {{ listing.offersCount }}
              </span>
              <span v-if="listing.messagesCount > 0" class="badge badge-messages">
                <span class="material-symbols-outlined">mail</span>
                {{ listing.messagesCount }}
              </span>
            </div>
            <span class="status-badge" :class="listing.status.toLowerCase()">
              {{ getStatusLabel(listing.status) }}
            </span>
          </div>
          
          <div class="listing-content">
            <h3 class="listing-title">{{ listing.title }}</h3>
            <p class="listing-category">{{ getCategoryLabel(listing.category) }}</p>
            <p class="listing-price">{{ formatCurrency(listing.priceDesired) }}</p>
            
            <div class="listing-meta">
              <div class="meta-item">
                <span class="material-symbols-outlined">visibility</span>
                <span>{{ listing.views }} vues</span>
              </div>
              <div class="meta-item">
                <span class="material-symbols-outlined">calendar_today</span>
                <span>{{ formatDate(listing.createdAt) }}</span>
              </div>
            </div>

            <div class="listing-actions">
              <button
                v-if="listing.offersCount > 0 || listing.messagesCount > 0"
                @click="viewOffersAndMessages(listing.id)"
                class="action-btn btn-primary-action"
              >
                <span class="material-symbols-outlined">chat</span>
                Voir les offres
              </button>
              <div class="action-buttons-group">
                <button
                  @click="editListing(listing.id)"
                  class="action-btn-icon"
                  title="Modifier"
                >
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button
                  @click="viewListing(listing.id)"
                  class="action-btn-icon"
                  title="Voir"
                >
                  <span class="material-symbols-outlined">visibility</span>
                </button>
                <div class="dropdown-menu">
                  <button
                    @click="toggleDropdown(listing.id)"
                    class="action-btn-icon"
                    title="Plus d'options"
                  >
                    <span class="material-symbols-outlined">more_vert</span>
                  </button>
                  <div v-if="openDropdownId === listing.id" class="dropdown-content">
                    <button
                      v-if="listing.status === 'PUBLISHED'"
                      @click="switchToAuction(listing.id)"
                      class="dropdown-item"
                    >
                      <span class="material-symbols-outlined">gavel</span>
                      Passer en enchères
                    </button>
                    <button
                      v-if="listing.status === 'PUBLISHED'"
                      @click="switchToQuickSale(listing.id)"
                      class="dropdown-item"
                    >
                      <span class="material-symbols-outlined">flash_on</span>
                      Vente rapide
                    </button>
                    <button
                      @click="lowerPrice(listing.id)"
                      class="dropdown-item"
                    >
                      <span class="material-symbols-outlined">trending_down</span>
                      Baisser le prix
                    </button>
                    <button
                      @click="deleteListing(listing.id)"
                      class="dropdown-item delete"
                    >
                      <span class="material-symbols-outlined">delete</span>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const loading = ref(true)
const searchQuery = ref('')
const activeFilter = ref('all')
const openDropdownId = ref(null)

const listings = ref([])

const statusFilters = computed(() => [
  { value: 'all', label: 'Toutes', count: listings.value.length },
  { value: 'PUBLISHED', label: 'Publiées', count: listings.value.filter(l => l.status === 'PUBLISHED').length },
  { value: 'DRAFT', label: 'Brouillons', count: listings.value.filter(l => l.status === 'DRAFT').length },
  { value: 'ENDED', label: 'Terminées', count: listings.value.filter(l => l.status === 'ENDED').length }
])

const filteredListings = computed(() => {
  let filtered = listings.value

  // Filtre par statut
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(l => l.status === activeFilter.value)
  }

  // Filtre par recherche
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(l =>
      l.title.toLowerCase().includes(query) ||
      l.description?.toLowerCase().includes(query) ||
      getCategoryLabel(l.category).toLowerCase().includes(query)
    )
  }

  return filtered
})

const totalOffers = computed(() => {
  return listings.value.reduce((sum, l) => sum + l.offersCount, 0)
})

const totalMessages = computed(() => {
  return listings.value.reduce((sum, l) => sum + l.messagesCount, 0)
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const getStatusLabel = (status) => {
  const labels = {
    DRAFT: 'Brouillon',
    PUBLISHED: 'Publiée',
    ENDED: 'Terminée',
    CANCELLED: 'Annulée'
  }
  return labels[status] || status
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

const loadListings = async () => {
  loading.value = true
  const token = localStorage.getItem('access_token')
  if (!token) {
    router.push('/login')
    return
  }

  try {
    const response = await fetch(`${API_URL}/listings/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des annonces')
    }
    
    const data = await response.json()
    
    // Obtenir les compteurs non lus
    const unreadResponse = await fetch(`${API_URL}/listings/me/unread-counts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const unreadData = unreadResponse.ok ? await unreadResponse.json() : { offers: 0, messages: 0 }
    
    // Transformer les données
    listings.value = data.map((listing) => ({
      id: listing.id,
      title: listing.title,
      category: listing.category,
      description: listing.description,
      priceDesired: parseFloat(listing.priceDesired),
      status: listing.status,
      saleMode: listing.saleMode,
      mainImage: listing.photos && listing.photos.length > 0 
        ? listing.photos[0].url 
        : 'https://via.placeholder.com/400x400?text=No+Image',
      views: 0, // TODO: Ajouter les vues si disponible
      offersCount: unreadData.offers || 0,
      messagesCount: unreadData.messages || 0,
      createdAt: listing.createdAt,
      publishedAt: listing.publishedAt
    }))
  } catch (error) {
    console.error('Erreur lors du chargement des annonces:', error)
  } finally {
    loading.value = false
  }
}

const toggleDropdown = (listingId) => {
  openDropdownId.value = openDropdownId.value === listingId ? null : listingId
}

const viewOffersAndMessages = (listingId) => {
  router.push(`/produit/${listingId}`)
}

const editListing = (listingId) => {
  router.push(`/creer-annonce?edit=${listingId}`)
}

const viewListing = (listingId) => {
  router.push(`/produit/${listingId}`)
}

const switchToAuction = async (listingId) => {
  if (!confirm('Êtes-vous sûr de vouloir passer cette annonce en mode enchères ?')) {
    openDropdownId.value = null
    return
  }
  
  const token = localStorage.getItem('access_token')
  if (!token) {
    router.push('/login')
    return
  }
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await fetch(`${API_URL}/listings/${listingId}/sale-mode`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ saleMode: 'AUCTION' })
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors du changement de mode de vente')
    }
    
    alert('Annonce passée en mode enchères avec succès')
    loadListings()
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur lors du changement de mode de vente')
  } finally {
    openDropdownId.value = null
  }
}

const switchToQuickSale = async (listingId) => {
  if (!confirm('Êtes-vous sûr de vouloir passer cette annonce en vente rapide ?')) {
    openDropdownId.value = null
    return
  }
  
  const token = localStorage.getItem('access_token')
  if (!token) {
    router.push('/login')
    return
  }
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await fetch(`${API_URL}/listings/${listingId}/sale-mode`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ saleMode: 'INSTANT_SALE' })
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors du changement de mode de vente')
    }
    
    alert('Annonce passée en vente rapide avec succès')
    loadListings()
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur lors du changement de mode de vente')
  } finally {
    openDropdownId.value = null
  }
}

const lowerPrice = async (listingId) => {
  const listing = listings.value.find(l => l.id === listingId)
  if (!listing) return
  
  const newPrice = prompt(`Nouveau prix (actuel: ${listing.priceDesired}€):`, listing.priceDesired.toString())
  if (!newPrice) {
    openDropdownId.value = null
    return
  }
  
  const price = parseFloat(newPrice.replace(/\s/g, '').replace(',', '.'))
  if (isNaN(price) || price <= 0) {
    alert('Prix invalide')
    openDropdownId.value = null
    return
  }
  
  const token = localStorage.getItem('access_token')
  if (!token) {
    router.push('/login')
    return
  }
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await fetch(`${API_URL}/listings/${listingId}/price`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ priceDesired: price })
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la modification du prix')
    }
    
    alert('Prix modifié avec succès')
    loadListings()
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur lors de la modification du prix')
  } finally {
    openDropdownId.value = null
  }
}

const deleteListing = async (listingId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.')) {
    openDropdownId.value = null
    return
  }
  
  const token = localStorage.getItem('access_token')
  if (!token) {
    router.push('/login')
    return
  }
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await fetch(`${API_URL}/listings/${listingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression')
    }
    
    alert('Annonce supprimée avec succès')
    loadListings()
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur lors de la suppression de l\'annonce')
  } finally {
    openDropdownId.value = null
  }
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
    if (user.role !== 'PARTICULIER' && user.role !== 'particulier') {
      router.push('/dashboard/professionnel')
      return false
    }
  } catch (e) {
    router.push('/login')
    return false
  }
  
  return true
}

// Fermer le dropdown si on clique en dehors
const handleClickOutside = (event) => {
  if (!event.target.closest('.dropdown-menu')) {
    openDropdownId.value = null
  }
}

onMounted(() => {
  if (!checkAuth()) return
  loadListings()
  document.addEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.my-listings-wrapper {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30px 0;
  width: 100%;
  overflow-x: hidden;
}

.my-listings-container {
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

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
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

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #645394;
  color: #ffffff;
  border-radius: 20px;
  text-decoration: none;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: #4F4670;
  transform: translateY(-2px);
}

.btn-secondary {
  display: inline-block;
  padding: 10px 20px;
  background-color: #f5f5f5;
  color: #645394;
  border: 1px solid #645394;
  border-radius: 20px;
  text-decoration: none;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background-color: #645394;
  color: #ffffff;
}

/* Filtres */
.filters-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 30px;
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 1rem;
  background-color: #f5f5f5;
  color: #213547;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #645394;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(100, 83, 148, 0.1);
}

.filter-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
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

.filter-btn:hover {
  background-color: #e0e0e0;
}

.filter-btn.active {
  background-color: #645394;
  color: #ffffff;
  border-color: #645394;
}

.filter-count {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
}

.filter-btn.active .filter-count {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Statistiques rapides */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.quick-stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  border-left: 3px solid #645394;
}

.stat-icon {
  font-size: 32px;
  color: #645394;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat-value {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: #213547;
}

.stat-value.highlight {
  color: #645394;
}

.stat-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.85rem;
  color: #666;
}

/* Liste des annonces */
.listings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
}

.listing-card {
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
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

.listing-badges {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.8rem;
  backdrop-filter: blur(10px);
}

.badge-offers {
  background-color: rgba(100, 83, 148, 0.9);
  color: #ffffff;
}

.badge-messages {
  background-color: rgba(33, 150, 243, 0.9);
  color: #ffffff;
}

.badge .material-symbols-outlined {
  font-size: 16px;
}

.status-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
  backdrop-filter: blur(10px);
}

.status-badge.published {
  background-color: rgba(76, 175, 80, 0.9);
  color: #ffffff;
}

.status-badge.draft {
  background-color: rgba(255, 152, 0, 0.9);
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
  flex: 1;
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

.listing-meta {
  display: flex;
  gap: 20px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.85rem;
  color: #666;
}

.meta-item .material-symbols-outlined {
  font-size: 18px;
}

.listing-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
}

.btn-primary-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: #645394;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary-action:hover {
  background-color: #4F4670;
}

.action-buttons-group {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn-icon {
  width: 36px;
  height: 36px;
  border: 1px solid #e0e0e0;
  background-color: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn-icon:hover {
  border-color: #645394;
  background-color: #f5f5f5;
  color: #645394;
}

.action-btn-icon .material-symbols-outlined {
  font-size: 18px;
}

.dropdown-menu {
  position: relative;
}

.dropdown-content {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  z-index: 10;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  background-color: transparent;
  border: none;
  text-align: left;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.9rem;
  color: #213547;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item.delete {
  color: #d32f2f;
  border-top: 1px solid #f0f0f0;
}

.dropdown-item.delete:hover {
  background-color: #ffebee;
}

.dropdown-item .material-symbols-outlined {
  font-size: 20px;
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

.empty-state p {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 1rem;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .my-listings-container {
    padding: 0 15px;
  }

  .page-title {
    font-size: 2rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .listings-grid {
    grid-template-columns: 1fr;
  }

  .quick-stats {
    grid-template-columns: 1fr;
  }

  .filter-buttons {
    justify-content: center;
  }
}
</style>

