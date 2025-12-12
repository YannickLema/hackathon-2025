<template>
  <div class="favorites-wrapper">
    <div class="favorites-container">
      <!-- En-tête -->
      <div class="page-header">
        <router-link to="/dashboard/professionnel" class="back-link">
          <span class="material-symbols-outlined">arrow_back</span>
          Retour au tableau de bord
        </router-link>
        <h1 class="page-title">Favoris & Historique</h1>
        <p class="page-subtitle">Vos objets favoris, enchères et achats</p>
      </div>

      <!-- Onglets -->
      <div class="tabs-section">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
        >
          <span class="material-symbols-outlined">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
          <span v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Contenu des onglets -->
      <div class="content-section">
        <!-- Favoris -->
        <div v-if="activeTab === 'favorites'" class="tab-content">
          <div v-if="favoriteItems.length === 0" class="empty-state">
            <span class="material-symbols-outlined empty-icon">favorite_border</span>
            <p>Aucun objet en favoris</p>
            <router-link to="/recherche" class="btn-secondary">Découvrir des objets</router-link>
          </div>
          <div v-else class="items-grid">
            <div
              v-for="item in favoriteItems"
              :key="item.id"
              class="item-card"
            >
              <div class="item-image-container">
                <img :src="item.image" :alt="item.title" class="item-image" />
                <span class="status-badge" :class="item.status === 'available' ? 'available' : 'sold'">
                  {{ item.status === 'available' ? 'En vente' : 'Plus disponible' }}
                </span>
              </div>
              <div class="item-content">
                <h3 class="item-title">{{ item.title }}</h3>
                <p class="item-category">{{ item.category }}</p>
                <p class="item-price">{{ formatCurrency(item.price) }}</p>
                <div class="item-actions">
                  <button @click="removeFavorite(item.id)" class="action-btn remove-btn">
                    <span class="material-symbols-outlined">favorite</span>
                    Retirer
                  </button>
                  <router-link :to="`/categorie/${item.categoryId}/produit/${item.id}`" class="action-btn view-btn">
                    <span class="material-symbols-outlined">visibility</span>
                    Voir
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mes enchères -->
        <div v-if="activeTab === 'bids'" class="tab-content">
          <div v-if="myBids.length === 0" class="empty-state">
            <span class="material-symbols-outlined empty-icon">gavel</span>
            <p>Aucune enchère en cours</p>
          </div>
          <div v-else class="items-grid">
            <div
              v-for="bid in myBids"
              :key="bid.id"
              class="item-card"
            >
              <div class="item-image-container">
                <img :src="bid.image" :alt="bid.title" class="item-image" />
                <span class="status-badge" :class="bid.status">
                  {{ getBidStatusLabel(bid.status) }}
                </span>
              </div>
              <div class="item-content">
                <h3 class="item-title">{{ bid.title }}</h3>
                <div class="bid-info">
                  <div class="bid-detail">
                    <span class="bid-label">Mon enchère :</span>
                    <span class="bid-amount">{{ formatCurrency(bid.myBid) }}</span>
                  </div>
                  <div class="bid-detail">
                    <span class="bid-label">Enchère actuelle :</span>
                    <span class="bid-amount">{{ formatCurrency(bid.currentBid) }}</span>
                  </div>
                  <div v-if="bid.auctionEndAt" class="bid-timer">
                    <span class="material-symbols-outlined">schedule</span>
                    <span>Fin dans {{ getTimeRemaining(bid.auctionEndAt) }}</span>
                  </div>
                </div>
                <div class="item-actions">
                  <button @click="increaseBid(bid.id)" class="action-btn bid-btn">
                    <span class="material-symbols-outlined">add</span>
                    Surenchérir
                  </button>
                  <router-link :to="`/categorie/${bid.categoryId}/produit/${bid.id}`" class="action-btn view-btn">
                    <span class="material-symbols-outlined">visibility</span>
                    Voir
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mes propositions -->
        <div v-if="activeTab === 'offers'" class="tab-content">
          <div v-if="myOffers.length === 0" class="empty-state">
            <span class="material-symbols-outlined empty-icon">local_offer</span>
            <p>Aucune proposition en cours</p>
          </div>
          <div v-else class="items-grid">
            <div
              v-for="offer in myOffers"
              :key="offer.id"
              class="item-card"
            >
              <div class="item-image-container">
                <img :src="offer.image" :alt="offer.title" class="item-image" />
                <span class="status-badge" :class="offer.status">
                  {{ getOfferStatusLabel(offer.status) }}
                </span>
              </div>
              <div class="item-content">
                <h3 class="item-title">{{ offer.title }}</h3>
                <div class="offer-info">
                  <div class="offer-detail">
                    <span class="offer-label">Mon offre :</span>
                    <span class="offer-amount">{{ formatCurrency(offer.myOffer) }}</span>
                  </div>
                  <div class="offer-detail">
                    <span class="offer-label">Prix demandé :</span>
                    <span class="offer-amount">{{ formatCurrency(offer.askingPrice) }}</span>
                  </div>
                </div>
                <div class="item-actions">
                  <button v-if="offer.status === 'pending'" @click="cancelOffer(offer.id)" class="action-btn cancel-btn">
                    <span class="material-symbols-outlined">close</span>
                    Annuler
                  </button>
                  <router-link :to="`/categorie/${offer.categoryId}/produit/${offer.id}`" class="action-btn view-btn">
                    <span class="material-symbols-outlined">visibility</span>
                    Voir
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Achats -->
        <div v-if="activeTab === 'purchases'" class="tab-content">
          <div v-if="purchases.length === 0" class="empty-state">
            <span class="material-symbols-outlined empty-icon">shopping_bag</span>
            <p>Aucun achat effectué</p>
          </div>
          <div v-else class="items-grid">
            <div
              v-for="purchase in purchases"
              :key="purchase.id"
              class="item-card"
            >
              <div class="item-image-container">
                <img :src="purchase.image" :alt="purchase.title" class="item-image" />
                <span class="status-badge completed">Acheté</span>
              </div>
              <div class="item-content">
                <h3 class="item-title">{{ purchase.title }}</h3>
                <div class="purchase-info">
                  <div class="purchase-detail">
                    <span class="purchase-label">Prix payé :</span>
                    <span class="purchase-amount">{{ formatCurrency(purchase.pricePaid) }}</span>
                  </div>
                  <div class="purchase-detail">
                    <span class="purchase-label">Date d'achat :</span>
                    <span class="purchase-date">{{ formatDate(purchase.purchaseDate) }}</span>
                  </div>
                </div>
                <div class="item-actions">
                  <button @click="viewPurchase(purchase.id)" class="action-btn view-btn">
                    <span class="material-symbols-outlined">receipt</span>
                    Voir les détails
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Objets perdus -->
        <div v-if="activeTab === 'lost'" class="tab-content">
          <div v-if="lostItems.length === 0" class="empty-state">
            <span class="material-symbols-outlined empty-icon">cancel</span>
            <p>Aucun objet perdu</p>
          </div>
          <div v-else class="items-grid">
            <div
              v-for="item in lostItems"
              :key="item.id"
              class="item-card"
            >
              <div class="item-image-container">
                <img :src="item.image" :alt="item.title" class="item-image" />
                <span class="status-badge lost">Perdu</span>
              </div>
              <div class="item-content">
                <h3 class="item-title">{{ item.title }}</h3>
                <div class="lost-info">
                  <div class="lost-detail">
                    <span class="lost-label">Prix final :</span>
                    <span class="lost-amount">{{ formatCurrency(item.finalPrice) }}</span>
                  </div>
                  <div class="lost-detail">
                    <span class="lost-label">Vendu le :</span>
                    <span class="lost-date">{{ formatDate(item.soldDate) }}</span>
                  </div>
                </div>
                <div class="item-actions">
                  <router-link :to="`/categorie/${item.categoryId}/produit/${item.id}`" class="action-btn view-btn">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const activeTab = ref('favorites')

const favoriteItems = ref([])
const myBids = ref([])
const myOffers = ref([])
const purchases = ref([])
const lostItems = ref([])

const tabs = computed(() => [
  { id: 'favorites', label: 'Favoris', icon: 'favorite', count: favoriteItems.value.length },
  { id: 'bids', label: 'Mes enchères', icon: 'gavel', count: myBids.value.length },
  { id: 'offers', label: 'Mes propositions', icon: 'local_offer', count: myOffers.value.length },
  { id: 'purchases', label: 'Achats', icon: 'shopping_bag', count: purchases.value.length },
  { id: 'lost', label: 'Objets perdus', icon: 'cancel', count: lostItems.value.length }
])

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const getTimeRemaining = (endDate) => {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end - now

  if (diff <= 0) return 'Terminé'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}j ${hours}h`
  return `${hours}h`
}

const getBidStatusLabel = (status) => {
  const labels = {
    active: 'En cours',
    winning: 'Gagnante',
    outbid: 'Dépassée',
    won: 'Gagnée',
    lost: 'Perdue'
  }
  return labels[status] || status
}

const getOfferStatusLabel = (status) => {
  const labels = {
    pending: 'En attente',
    accepted: 'Acceptée',
    rejected: 'Refusée',
    expired: 'Expirée'
  }
  return labels[status] || status
}

const loadFavorites = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) return
  
  try {
    const response = await fetch(`${API_URL}/listings/me/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      favoriteItems.value = data.map(listing => ({
        id: listing.id,
        title: listing.title,
        image: listing.photos && listing.photos.length > 0 ? listing.photos[0].url : '',
        price: parseFloat(listing.priceDesired),
        status: listing.status === 'PUBLISHED' ? 'available' : 'unavailable',
        categoryId: null
      }))
    }
  } catch (error) {
    console.error('Erreur lors du chargement des favoris:', error)
  }
}

const loadMyBids = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) return
  
  try {
    const response = await fetch(`${API_URL}/listings/me/bids`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const bids = await response.json()
      // Pour chaque bid, récupérer le listing
      const listingsPromises = bids.map(bid => 
        fetch(`${API_URL}/listings/${bid.listingId}`)
          .then(r => r.json())
          .then(listing => ({
            id: listing.id,
            title: listing.title,
            image: listing.photos && listing.photos.length > 0 ? listing.photos[0].url : '',
            myBid: parseFloat(bid.amount),
            currentBid: parseFloat(listing.auctionStartPrice || listing.priceDesired),
            status: bid.isWinning ? 'winning' : 'outbid',
            auctionEndAt: listing.auctionEndAt,
            categoryId: null
          }))
      )
      myBids.value = await Promise.all(listingsPromises)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des enchères:', error)
  }
}

const loadMyOffers = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) return
  
  try {
    const response = await fetch(`${API_URL}/listings/me/offers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const offers = await response.json()
      const listingsPromises = offers.map(offer =>
        fetch(`${API_URL}/listings/${offer.listingId}`)
          .then(r => r.json())
          .then(listing => ({
            id: listing.id,
            title: listing.title,
            image: listing.photos && listing.photos.length > 0 ? listing.photos[0].url : '',
            myOffer: parseFloat(offer.amount),
            askingPrice: parseFloat(listing.priceDesired),
            status: offer.status.toLowerCase(),
            categoryId: null
          }))
      )
      myOffers.value = await Promise.all(listingsPromises)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des offres:', error)
  }
}

const loadPurchases = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) return
  
  try {
    const response = await fetch(`${API_URL}/listings/me/purchases`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const purchasesData = await response.json()
      const listingsPromises = purchasesData.map(purchase =>
        fetch(`${API_URL}/listings/${purchase.listingId}`)
          .then(r => r.json())
          .then(listing => ({
            id: listing.id,
            title: listing.title,
            image: listing.photos && listing.photos.length > 0 ? listing.photos[0].url : '',
            pricePaid: parseFloat(purchase.finalPrice),
            purchaseDate: purchase.createdAt,
            categoryId: null
          }))
      )
      purchases.value = await Promise.all(listingsPromises)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des achats:', error)
  }
}

const loadLostItems = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) return
  
  try {
    const response = await fetch(`${API_URL}/listings/me/lost`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const lost = await response.json()
      lostItems.value = lost.map(listing => ({
        id: listing.id,
        title: listing.title,
        image: listing.photos && listing.photos.length > 0 ? listing.photos[0].url : '',
        finalPrice: parseFloat(listing.priceDesired),
        soldDate: listing.updatedAt,
        categoryId: null
      }))
    }
  } catch (error) {
    console.error('Erreur lors du chargement des objets perdus:', error)
  }
}

const removeFavorite = (itemId) => {
  favoriteItems.value = favoriteItems.value.filter(item => item.id !== itemId)
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
  const updated = wishlist.filter(item => item.id !== itemId)
  localStorage.setItem('wishlist', JSON.stringify(updated))
  window.dispatchEvent(new Event('wishlist-updated'))
}

const increaseBid = (bidId) => {
  // TODO: Ouvrir un modal pour surenchérir
  console.log('Surenchérir pour:', bidId)
}

const cancelOffer = (offerId) => {
  if (confirm('Êtes-vous sûr de vouloir annuler cette proposition ?')) {
    myOffers.value = myOffers.value.filter(offer => offer.id !== offerId)
    // TODO: Appeler l'API pour annuler
  }
}

const viewPurchase = (purchaseId) => {
  // TODO: Naviguer vers la page de détails de l'achat
  console.log('Voir l\'achat:', purchaseId)
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

onMounted(() => {
  if (!checkAuth()) return
  
  loadFavorites()
  loadMyBids()
  loadMyOffers()
  loadPurchases()
  loadLostItems()
  
  window.addEventListener('wishlist-updated', loadFavorites)
})
</script>

<style scoped>
.favorites-wrapper {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30px 0;
  width: 100%;
  overflow-x: hidden;
}

.favorites-container {
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

/* Onglets */
.tabs-section {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background-color: #f5f5f5;
  border-color: #645394;
}

.tab-btn.active {
  background-color: #645394;
  color: #ffffff;
  border-color: #645394;
}

.tab-btn .material-symbols-outlined {
  font-size: 20px;
}

.tab-badge {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.tab-btn.active .tab-badge {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Contenu */
.content-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 30px;
}

.tab-content {
  min-height: 400px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.item-card {
  background-color: #fafafa;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.item-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  background-color: #f5f5f5;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.status-badge.available {
  background-color: rgba(76, 175, 80, 0.9);
  color: #ffffff;
}

.status-badge.sold {
  background-color: rgba(158, 158, 158, 0.9);
  color: #ffffff;
}

.status-badge.completed {
  background-color: rgba(76, 175, 80, 0.9);
  color: #ffffff;
}

.status-badge.lost {
  background-color: rgba(244, 67, 54, 0.9);
  color: #ffffff;
}

.status-badge.active,
.status-badge.winning,
.status-badge.won {
  background-color: rgba(76, 175, 80, 0.9);
  color: #ffffff;
}

.status-badge.outbid {
  background-color: rgba(255, 152, 0, 0.9);
  color: #ffffff;
}

.status-badge.pending {
  background-color: rgba(33, 150, 243, 0.9);
  color: #ffffff;
}

.status-badge.accepted {
  background-color: rgba(76, 175, 80, 0.9);
  color: #ffffff;
}

.status-badge.rejected {
  background-color: rgba(244, 67, 54, 0.9);
  color: #ffffff;
}

.item-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: #213547;
  margin: 0;
}

.item-category {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.85rem;
  color: #999;
  margin: 0;
}

.item-price {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 700;
  font-size: 1.3rem;
  color: #645394;
  margin: 0;
}

.bid-info,
.offer-info,
.purchase-info,
.lost-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.bid-detail,
.offer-detail,
.purchase-detail,
.lost-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bid-label,
.offer-label,
.purchase-label,
.lost-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.9rem;
  color: #666;
}

.bid-amount,
.offer-amount,
.purchase-amount,
.lost-amount {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: #645394;
}

.bid-timer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.85rem;
  color: #d32f2f;
  margin-top: 5px;
}

.purchase-date,
.lost-date {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.9rem;
  color: #666;
}

.item-actions {
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

.remove-btn {
  background-color: #ffebee;
  color: #d32f2f;
}

.remove-btn:hover {
  background-color: #d32f2f;
  color: #ffffff;
}

.bid-btn {
  background-color: #645394;
  color: #ffffff;
}

.bid-btn:hover {
  background-color: #4F4670;
}

.cancel-btn {
  background-color: #ffebee;
  color: #d32f2f;
}

.cancel-btn:hover {
  background-color: #d32f2f;
  color: #ffffff;
}

.view-btn {
  background-color: #f5f5f5;
  color: #645394;
  border: 1px solid #e0e0e0;
}

.view-btn:hover {
  background-color: #e0e0e0;
}

/* État vide */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

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

@media (max-width: 768px) {
  .favorites-container {
    padding: 0 15px;
  }

  .page-title {
    font-size: 2rem;
  }

  .tabs-section {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tab-btn {
    flex-shrink: 0;
  }

  .items-grid {
    grid-template-columns: 1fr;
  }

  .item-actions {
    flex-direction: column;
  }
}
</style>

