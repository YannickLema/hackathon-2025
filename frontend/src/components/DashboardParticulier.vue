<template>
  <div class="dashboard-wrapper">
    <div class="dashboard-container">
      <!-- En-tête du dashboard -->
      <div class="dashboard-header">
        <div class="header-content">
          <div>
            <h1 class="dashboard-title">Tableau de bord</h1>
            <p class="dashboard-subtitle">Bienvenue, {{ userFirstName }} !</p>
          </div>
          <div class="header-actions">
            <router-link to="/creer-annonce" class="btn-primary">
              <span class="material-symbols-outlined">add_circle</span>
              Vendre un objet
            </router-link>
          </div>
        </div>
      </div>

      <!-- Statistiques principales -->
      <div class="stats-grid">
        <div class="stat-card stat-primary">
          <div class="stat-icon-square">
            <span class="material-symbols-outlined stat-icon">inventory_2</span>
          </div>
          <div class="stat-content">
            <p class="stat-label">Annonces actives</p>
            <p class="stat-value">{{ stats.activeListings }}</p>
            <p class="stat-change positive">+{{ stats.newListingsThisMonth }} ce mois</p>
          </div>
        </div>

        <div class="stat-card stat-secondary">
          <div class="stat-icon-square">
            <span class="material-symbols-outlined stat-icon">visibility</span>
          </div>
          <div class="stat-content">
            <p class="stat-label">Vues totales</p>
            <p class="stat-value">{{ stats.totalViews }}</p>
            <p class="stat-change positive">+{{ stats.viewsThisWeek }} cette semaine</p>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon-square">
            <span class="material-symbols-outlined stat-icon">sell</span>
          </div>
          <div class="stat-content">
            <p class="stat-label">Ventes réalisées</p>
            <p class="stat-value">{{ stats.totalSales }}</p>
            <p class="stat-change positive">{{ stats.salesThisMonth }} ce mois</p>
          </div>
        </div>

        <div class="stat-card stat-info">
          <div class="stat-icon-square">
            <span class="material-symbols-outlined stat-icon">euro</span>
          </div>
          <div class="stat-content">
            <p class="stat-label">Chiffre d'affaires</p>
            <p class="stat-value">{{ formatCurrencyValue(stats.totalRevenue) }}</p>
            <p class="stat-change positive">{{ formatCurrencyValue(stats.revenueThisMonth) }} ce mois</p>
          </div>
        </div>
      </div>

      <!-- Grille principale avec les 4 features -->
      <div class="features-grid">
        <!-- Feature 1: Vendre un objet -->
        <div class="feature-card feature-sell">
          <div class="feature-header">
            <div class="feature-icon-wrapper">
              <span class="material-symbols-outlined feature-icon">add_circle</span>
            </div>
            <div class="feature-title-section">
              <h2 class="feature-title">Vendre un objet</h2>
              <p class="feature-description">Publiez vos objets de valeur en quelques clics</p>
            </div>
          </div>
          <div class="feature-content">
            <router-link to="/creer-annonce" class="feature-action-btn">
              <span class="material-symbols-outlined">add</span>
              Créer une annonce
            </router-link>
            
            <!-- Tendances des objets recherchés -->
            <div class="trends-section">
              <h3 class="trends-title">
                <span class="material-symbols-outlined">trending_up</span>
                Objets les plus recherchés
              </h3>
              <div class="trends-list">
                <div v-for="trend in trendingItems" :key="trend.id" class="trend-item">
                  <span class="trend-icon material-symbols-outlined">{{ trend.icon }}</span>
                  <div class="trend-info">
                    <span class="trend-name">{{ trend.name }}</span>
                    <span class="trend-count">{{ trend.searchCount }} recherches</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature 2: Mes objets en vente -->
        <div class="feature-card feature-listings">
          <div class="feature-header">
            <div class="feature-icon-wrapper">
              <span class="material-symbols-outlined feature-icon">inventory_2</span>
              <span v-if="notificationsCount > 0" class="notification-badge">{{ notificationsCount }}</span>
            </div>
            <div class="feature-title-section">
              <h2 class="feature-title">Mes objets en vente</h2>
              <p class="feature-description">Gérez vos annonces, offres et messages</p>
            </div>
          </div>
          <div class="feature-content">
            <div class="listings-summary">
              <div class="summary-item">
                <span class="summary-label">En vente</span>
                <span class="summary-value">{{ stats.activeListings }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Offres reçues</span>
                <span class="summary-value highlight">{{ stats.pendingOffers }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Messages</span>
                <span class="summary-value highlight">{{ stats.unreadMessages }}</span>
              </div>
            </div>
            
            <div v-if="recentListings.length === 0" class="empty-state">
              <span class="material-symbols-outlined empty-icon">inventory_2</span>
              <p>Aucun objet en vente</p>
              <router-link to="/creer-annonce" class="btn-secondary">Créer ma première annonce</router-link>
            </div>
            <div v-else class="listings-preview">
              <div v-for="listing in recentListings.slice(0, 3)" :key="listing.id" class="listing-preview-item">
                <img :src="listing.image" :alt="listing.title" class="preview-image" />
                <div class="preview-info">
                  <h4 class="preview-title">{{ listing.title }}</h4>
                  <p class="preview-price">{{ formatCurrency(listing.price) }}</p>
                  <div class="preview-badges">
                    <span v-if="listing.offersCount > 0" class="badge badge-offers">
                      <span class="material-symbols-outlined">local_offer</span>
                      {{ listing.offersCount }} offre{{ listing.offersCount > 1 ? 's' : '' }}
                    </span>
                    <span v-if="listing.messagesCount > 0" class="badge badge-messages">
                      <span class="material-symbols-outlined">mail</span>
                      {{ listing.messagesCount }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <router-link to="/mes-objets" class="feature-link">
              Voir tous mes objets <span class="material-symbols-outlined">arrow_forward</span>
            </router-link>
          </div>
        </div>

        <!-- Feature 3: Gestion du profil -->
        <div class="feature-card feature-profile">
          <div class="feature-header">
            <div class="feature-icon-wrapper">
              <span class="material-symbols-outlined feature-icon">person</span>
            </div>
            <div class="feature-title-section">
              <h2 class="feature-title">Gestion du profil</h2>
              <p class="feature-description">Modifiez vos informations personnelles</p>
            </div>
          </div>
          <div class="feature-content">
            <div class="profile-preview">
              <div class="profile-avatar-mini">
                <img 
                  v-if="userProfilePhoto" 
                  :src="userProfilePhoto" 
                  alt="Photo de profil" 
                  class="avatar-mini-img"
                />
                <div v-else class="avatar-mini-placeholder">
                  <span class="material-symbols-outlined">person</span>
                </div>
              </div>
              <div class="profile-info-mini">
                <p class="profile-name">{{ userFirstName }} {{ userLastName }}</p>
                <p class="profile-email">{{ userEmail }}</p>
              </div>
            </div>
            <router-link to="/profil" class="feature-action-btn">
              <span class="material-symbols-outlined">edit</span>
              Modifier mon profil
            </router-link>
          </div>
        </div>

        <!-- Feature 4: Donner son avis -->
        <div class="feature-card feature-feedback">
          <div class="feature-header">
            <div class="feature-icon-wrapper">
              <span class="material-symbols-outlined feature-icon">rate_review</span>
            </div>
            <div class="feature-title-section">
              <h2 class="feature-title">Donner son avis</h2>
              <p class="feature-description">Partagez votre expérience avec nous</p>
            </div>
          </div>
          <div class="feature-content">
            <div v-if="!hasGivenFeedback" class="feedback-form">
              <!-- Système d'étoiles -->
              <div class="feedback-section">
                <label class="feedback-label">Note globale</label>
                <div class="stars-rating">
                  <button
                    v-for="star in 5"
                    :key="star"
                    @click="selectedStars = star"
                    class="star-btn"
                    :class="{ active: star <= selectedStars }"
                  >
                    <span class="material-symbols-outlined">star</span>
                  </button>
                </div>
              </div>

              <!-- NPS -->
              <div class="feedback-section">
                <label class="feedback-label">Notez-nous de 1 à 10</label>
                <div class="nps-scale">
                  <button
                    v-for="score in 10"
                    :key="score"
                    @click="npsScore = score"
                    class="nps-btn"
                    :class="{ active: score === npsScore }"
                  >
                    {{ score }}
                  </button>
                </div>
                <div class="nps-labels">
                  <span>Pas du tout probable</span>
                  <span>Très probable</span>
                </div>
              </div>

              <!-- Commentaires -->
              <div class="feedback-section">
                <label for="feedback-comment" class="feedback-label">Commentaires / Suggestions</label>
                <textarea
                  id="feedback-comment"
                  v-model="feedbackComment"
                  class="feedback-textarea"
                  placeholder="Partagez vos impressions, suggestions ou commentaires..."
                  rows="4"
                ></textarea>
              </div>

              <button @click="submitFeedback" class="btn-submit-feedback" :disabled="isSubmittingFeedback">
                <span class="material-symbols-outlined">send</span>
                {{ isSubmittingFeedback ? 'Envoi...' : 'Envoyer mon avis' }}
              </button>
            </div>
            <div v-else class="feedback-thanks">
              <span class="material-symbols-outlined thanks-icon">check_circle</span>
              <p class="thanks-message">Merci pour votre avis !</p>
              <p class="thanks-submessage">Votre retour nous aide à améliorer la plateforme.</p>
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
const user = ref(null)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const stats = ref({
  activeListings: 0,
  newListingsThisMonth: 0,
  totalViews: 0,
  viewsThisWeek: 0,
  totalSales: 0,
  salesThisMonth: 0,
  totalRevenue: 0,
  revenueThisMonth: 0,
  pendingOffers: 0,
  unreadMessages: 0
})

const recentListings = ref([])
const trendingItems = ref([])
const notificationsCount = computed(() => stats.value.pendingOffers + stats.value.unreadMessages)

// Feedback
const selectedStars = ref(0)
const npsScore = ref(0)
const feedbackComment = ref('')
const hasGivenFeedback = ref(false)
const isSubmittingFeedback = ref(false)

const userFirstName = computed(() => {
  return user.value?.firstName || 'Utilisateur'
})

const userLastName = computed(() => {
  return user.value?.lastName || ''
})

const userEmail = computed(() => {
  return user.value?.email || ''
})

const userProfilePhoto = computed(() => {
  return user.value?.profilePhoto || null
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

const formatCurrencyValue = (amount) => {
  return new Intl.NumberFormat('fr-FR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(amount) + ' €'
}

const loadStats = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) return

  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await fetch(`${API_URL}/listings/me/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      stats.value = await response.json()
    } else {
      throw new Error('Erreur lors du chargement des statistiques')
    }
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
    // Valeurs par défaut en cas d'erreur
    stats.value = {
      activeListings: 0,
      newListingsThisMonth: 0,
      totalViews: 0,
      viewsThisWeek: 0,
      totalSales: 0,
      salesThisMonth: 0,
      totalRevenue: 0,
      revenueThisMonth: 0,
      pendingOffers: 0,
      unreadMessages: 0
    }
  }
}

const loadRecentListings = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) return

  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await fetch(`${API_URL}/listings/me?status=PUBLISHED&limit=3`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      recentListings.value = (data.listings || []).map(listing => ({
        id: listing.id,
        title: listing.title,
        price: parseFloat(listing.priceDesired),
        image: listing.photos && listing.photos.length > 0 ? listing.photos[0].url : 'https://via.placeholder.com/400x400?text=No+Image',
        status: listing.status,
        views: 0, // TODO: Ajouter les vues si disponible
        offersCount: listing.offers?.length || 0,
        messagesCount: listing.messages?.length || 0
      }))
    }
  } catch (error) {
    console.error('Erreur lors du chargement des annonces:', error)
    recentListings.value = []
  }
}

const loadTrendingItems = async () => {
  try {
    // TODO: Remplacer par la vraie API call
    trendingItems.value = [
      { id: 1, name: 'Bijoux anciens', icon: 'diamond', searchCount: 1247 },
      { id: 2, name: 'Montres de collection', icon: 'watch', searchCount: 892 },
      { id: 3, name: 'Tableaux et œuvres d\'art', icon: 'palette', searchCount: 756 },
      { id: 4, name: 'Meubles anciens', icon: 'chair', searchCount: 634 },
      { id: 5, name: 'Objets de collection', icon: 'tag', searchCount: 521 }
    ]
  } catch (error) {
    console.error('Erreur lors du chargement des tendances:', error)
  }
}

const checkFeedbackStatus = () => {
  const feedback = localStorage.getItem('user_feedback')
  if (feedback) {
    hasGivenFeedback.value = true
  }
}

const submitFeedback = async () => {
  if (selectedStars.value === 0 && npsScore.value === 0 && !feedbackComment.value.trim()) {
    alert('Veuillez remplir au moins un champ')
    return
  }

  isSubmittingFeedback.value = true
  const token = localStorage.getItem('access_token')
  if (!token) {
    alert('Vous devez être connecté pour donner votre avis')
    isSubmittingFeedback.value = false
    return
  }

  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stars: selectedStars.value || null,
        nps: npsScore.value || null,
        comment: feedbackComment.value.trim() || null
      })
    })

    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi du feedback')
    }

    hasGivenFeedback.value = true
    selectedStars.value = 0
    npsScore.value = 0
    feedbackComment.value = ''
    alert('Merci pour votre avis !')
  } catch (error) {
    console.error('Erreur lors de l\'envoi du feedback:', error)
    alert('Erreur lors de l\'envoi de votre avis. Veuillez réessayer.')
  } finally {
    isSubmittingFeedback.value = false
  }
}

const checkAuth = () => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      user.value = JSON.parse(userData)
    } catch (e) {
      console.error('Erreur lors du parsing des données utilisateur:', e)
      router.push('/login')
    }
  } else {
    router.push('/login')
  }
}

onMounted(() => {
  checkAuth()
  loadStats()
  loadRecentListings()
  loadTrendingItems()
  checkFeedbackStatus()
  
  // Écouter les mises à jour
  window.addEventListener('auth-changed', checkAuth)
})
</script>

<style scoped>
.dashboard-wrapper {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30px 0;
  width: 100%;
  overflow-x: hidden;
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
  box-sizing: border-box;
}

.dashboard-header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.dashboard-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-size: 2.5rem;
  color: #213547;
  margin: 0 0 5px 0;
}

.dashboard-subtitle {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
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

/* Statistiques */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
  width: 100%;
  box-sizing: border-box;
}

.stat-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease;
  border-left: 3px solid;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-primary {
  border-left-color: #645394;
}

.stat-secondary {
  border-left-color: #2196F3;
}

.stat-success {
  border-left-color: #4CAF50;
}

.stat-info {
  border-left-color: #FF9800;
}

.stat-icon-square {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-primary .stat-icon-square {
  background-color: rgba(100, 83, 148, 0.15);
}

.stat-secondary .stat-icon-square {
  background-color: rgba(33, 150, 243, 0.15);
}

.stat-success .stat-icon-square {
  background-color: rgba(76, 175, 80, 0.15);
}

.stat-info .stat-icon-square {
  background-color: rgba(255, 152, 0, 0.15);
}

.stat-icon {
  font-size: 24px;
}

.stat-primary .stat-icon {
  color: #645394;
}

.stat-secondary .stat-icon {
  color: #2196F3;
}

.stat-success .stat-icon {
  color: #4CAF50;
}

.stat-info .stat-icon {
  color: #FF9800;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.stat-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.85rem;
  color: #999;
  margin: 0;
  text-transform: none;
  letter-spacing: 0;
}

.stat-value {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 700;
  font-size: 2.2rem;
  color: #213547;
  margin: 0;
  line-height: 1.2;
}

.stat-change {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 500;
  font-size: 0.9rem;
  margin: 0;
}

.stat-change.positive {
  color: #4CAF50;
}

/* Grille des features */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  width: 100%;
  box-sizing: border-box;
}

.feature-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 30px;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.feature-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

.feature-header {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.feature-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.feature-sell .feature-icon-wrapper {
  background-color: rgba(100, 83, 148, 0.15);
}

.feature-listings .feature-icon-wrapper {
  background-color: rgba(33, 150, 243, 0.15);
}

.feature-profile .feature-icon-wrapper {
  background-color: rgba(76, 175, 80, 0.15);
}

.feature-feedback .feature-icon-wrapper {
  background-color: rgba(255, 152, 0, 0.15);
}

.feature-icon {
  font-size: 28px;
}

.feature-sell .feature-icon {
  color: #645394;
}

.feature-listings .feature-icon {
  color: #2196F3;
}

.feature-profile .feature-icon {
  color: #4CAF50;
}

.feature-feedback .feature-icon {
  color: #FF9800;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #d32f2f;
  color: #ffffff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 700;
  font-size: 0.7rem;
  border: 2px solid #ffffff;
}

.feature-title-section {
  flex: 1;
  min-width: 0;
}

.feature-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.4rem;
  color: #213547;
  margin: 0 0 5px 0;
}

.feature-description {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.feature-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background-color: #645394;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feature-action-btn:hover {
  background-color: #4F4670;
  transform: translateY(-2px);
}

.feature-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  color: #645394;
  text-decoration: none;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  border-radius: 20px;
  transition: all 0.3s ease;
  margin-top: auto;
}

.feature-link:hover {
  background-color: rgba(100, 83, 148, 0.1);
  gap: 12px;
}

/* Tendances */
.trends-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}

.trends-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: #213547;
  margin: 0 0 15px 0;
}

.trends-title .material-symbols-outlined {
  font-size: 20px;
  color: #645394;
}

.trends-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.trend-item:hover {
  background-color: #f5f5f5;
  transform: translateX(5px);
}

.trend-icon {
  font-size: 24px;
  color: #645394;
  flex-shrink: 0;
}

.trend-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.trend-name {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  color: #213547;
}

.trend-count {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.8rem;
  color: #999;
}

/* Résumé des annonces */
.listings-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 12px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  text-align: center;
}

.summary-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.85rem;
  color: #666;
}

.summary-value {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: #213547;
}

.summary-value.highlight {
  color: #645394;
}

.listings-preview {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.listing-preview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.listing-preview-item:hover {
  background-color: #f5f5f5;
}

.preview-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.preview-info {
  flex: 1;
  min-width: 0;
}

.preview-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  color: #213547;
  margin: 0 0 5px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-price {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: #645394;
  margin: 0 0 8px 0;
}

.preview-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
}

.badge-offers {
  background-color: rgba(100, 83, 148, 0.1);
  color: #645394;
}

.badge-messages {
  background-color: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.badge .material-symbols-outlined {
  font-size: 14px;
}

/* Profil preview */
.profile-preview {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 12px;
  margin-bottom: 15px;
}

.profile-avatar-mini {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.avatar-mini-img,
.avatar-mini-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e0e0e0;
}

.avatar-mini-placeholder {
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-mini-placeholder .material-symbols-outlined {
  font-size: 28px;
  color: #999;
}

.profile-info-mini {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: #213547;
  margin: 0 0 3px 0;
}

.profile-email {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Feedback */
.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.feedback-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feedback-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  color: #213547;
}

.stars-rating {
  display: flex;
  gap: 8px;
}

.star-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #e0e0e0;
}

.star-btn:hover {
  transform: scale(1.1);
}

.star-btn.active {
  color: #FFD700;
}

.star-btn .material-symbols-outlined {
  font-size: 32px;
}

.nps-scale {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.nps-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e0e0e0;
  background-color: #ffffff;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nps-btn:hover {
  border-color: #645394;
  color: #645394;
}

.nps-btn.active {
  background-color: #645394;
  border-color: #645394;
  color: #ffffff;
}

.nps-labels {
  display: flex;
  justify-content: space-between;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.8rem;
  color: #999;
  margin-top: 5px;
}

.feedback-textarea {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.95rem;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f5f5f5;
  color: #213547;
  resize: vertical;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.feedback-textarea:focus {
  outline: none;
  border-color: #645394;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(100, 83, 148, 0.1);
}

.btn-submit-feedback {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background-color: #645394;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn-submit-feedback:hover:not(:disabled) {
  background-color: #4F4670;
  transform: translateY(-2px);
}

.btn-submit-feedback:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.feedback-thanks {
  text-align: center;
  padding: 40px 20px;
}

.thanks-icon {
  font-size: 64px;
  color: #4CAF50;
  margin-bottom: 15px;
}

.thanks-message {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.2rem;
  color: #213547;
  margin: 0 0 8px 0;
}

.thanks-submessage {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.95rem;
  color: #666;
  margin: 0;
}

/* État vide */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  color: #e0e0e0;
  margin-bottom: 15px;
}

.empty-state p {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 1rem;
  margin-bottom: 20px;
}

@media (max-width: 1200px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 0 15px;
  }

  .dashboard-title {
    font-size: 2rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .listings-summary {
    grid-template-columns: 1fr;
  }

  .nps-scale {
    justify-content: center;
  }
}
</style>
