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
              Créer une annonce
            </router-link>
          </div>
        </div>
      </div>

      <!-- Statistiques principales -->
      <div class="stats-grid">
        <div class="stat-card stat-primary">
          <div class="stat-icon-wrapper">
            <span class="material-symbols-outlined stat-icon">inventory_2</span>
          </div>
          <div class="stat-content">
            <p class="stat-label">Annonces actives</p>
            <p class="stat-value">{{ stats.activeListings }}</p>
            <p class="stat-change positive">+{{ stats.newListingsThisMonth }} ce mois</p>
          </div>
        </div>

        <div class="stat-card stat-secondary">
          <div class="stat-icon-wrapper">
            <span class="material-symbols-outlined stat-icon">visibility</span>
          </div>
          <div class="stat-content">
            <p class="stat-label">Vues totales</p>
            <p class="stat-value">{{ stats.totalViews }}</p>
            <p class="stat-change positive">+{{ stats.viewsThisWeek }} cette semaine</p>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon-wrapper">
            <span class="material-symbols-outlined stat-icon">sell</span>
          </div>
          <div class="stat-content">
            <p class="stat-label">Ventes réalisées</p>
            <p class="stat-value">{{ stats.totalSales }}</p>
            <p class="stat-change positive">{{ stats.salesThisMonth }} ce mois</p>
          </div>
        </div>

        <div class="stat-card stat-info">
          <div class="stat-icon-wrapper">
            <span class="material-symbols-outlined stat-icon">euro</span>
          </div>
          <div class="stat-content">
            <p class="stat-label">Chiffre d'affaires</p>
            <p class="stat-value">{{ formatCurrency(stats.totalRevenue) }}</p>
            <p class="stat-change positive">{{ formatCurrency(stats.revenueThisMonth) }} ce mois</p>
          </div>
        </div>
      </div>

      <!-- Grille principale avec modules -->
      <div class="dashboard-grid">
        <!-- Colonne gauche -->
        <div class="grid-column">
          <!-- Mes annonces récentes -->
          <div class="module-card">
            <div class="module-header">
              <h2 class="module-title">
                <span class="material-symbols-outlined module-icon">inventory_2</span>
                Mes annonces récentes
              </h2>
              <router-link to="/mes-annonces" class="module-link">
                Voir tout <span class="material-symbols-outlined">arrow_forward</span>
              </router-link>
            </div>
            <div class="module-content">
              <div v-if="recentListings.length === 0" class="empty-state">
                <span class="material-symbols-outlined empty-icon">inventory_2</span>
                <p>Aucune annonce pour le moment</p>
                <router-link to="/creer-annonce" class="btn-secondary">Créer ma première annonce</router-link>
              </div>
              <div v-else class="listings-list">
                <div v-for="listing in recentListings" :key="listing.id" class="listing-item">
                  <img :src="listing.image" :alt="listing.title" class="listing-image" />
                  <div class="listing-info">
                    <h3 class="listing-title">{{ listing.title }}</h3>
                    <p class="listing-price">{{ formatCurrency(listing.price) }}</p>
                    <div class="listing-meta">
                      <span class="listing-status" :class="listing.status">{{ getStatusLabel(listing.status) }}</span>
                      <span class="listing-views">{{ listing.views }} vues</span>
                    </div>
                  </div>
                  <div class="listing-actions">
                    <button class="action-btn" @click="editListing(listing.id)" title="Modifier">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="action-btn" @click="viewListing(listing.id)" title="Voir">
                      <span class="material-symbols-outlined">visibility</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Activité récente -->
          <div class="module-card">
            <div class="module-header">
              <h2 class="module-title">
                <span class="material-symbols-outlined module-icon">history</span>
                Activité récente
              </h2>
            </div>
            <div class="module-content">
              <div v-if="recentActivity.length === 0" class="empty-state">
                <span class="material-symbols-outlined empty-icon">history</span>
                <p>Aucune activité récente</p>
              </div>
              <div v-else class="activity-list">
                <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
                  <div class="activity-icon" :class="activity.type">
                    <span class="material-symbols-outlined">{{ getActivityIcon(activity.type) }}</span>
                  </div>
                  <div class="activity-content">
                    <p class="activity-text">{{ activity.message }}</p>
                    <p class="activity-time">{{ formatTime(activity.date) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne droite -->
        <div class="grid-column">
          <!-- Graphique de performance -->
          <div class="module-card">
            <div class="module-header">
              <h2 class="module-title">
                <span class="material-symbols-outlined module-icon">trending_up</span>
                Performance des ventes
              </h2>
              <select v-model="performancePeriod" class="period-select">
                <option value="week">7 jours</option>
                <option value="month">30 jours</option>
                <option value="year">1 an</option>
              </select>
            </div>
            <div class="module-content">
              <div class="chart-container">
                <div class="chart-placeholder">
                  <span class="material-symbols-outlined chart-icon">bar_chart</span>
                  <p>Graphique de performance</p>
                  <p class="chart-note">Données des {{ performancePeriod === 'week' ? '7 derniers jours' : performancePeriod === 'month' ? '30 derniers jours' : '12 derniers mois' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions rapides -->
          <div class="module-card">
            <div class="module-header">
              <h2 class="module-title">
                <span class="material-symbols-outlined module-icon">flash_on</span>
                Actions rapides
              </h2>
            </div>
            <div class="module-content">
              <div class="quick-actions">
                <router-link to="/creer-annonce" class="quick-action-btn">
                  <span class="material-symbols-outlined">add_circle</span>
                  <span>Nouvelle annonce</span>
                </router-link>
                <router-link to="/mes-annonces" class="quick-action-btn">
                  <span class="material-symbols-outlined">inventory_2</span>
                  <span>Gérer mes annonces</span>
                </router-link>
                <router-link to="/statistiques" class="quick-action-btn">
                  <span class="material-symbols-outlined">analytics</span>
                  <span>Statistiques détaillées</span>
                </router-link>
                <router-link to="/profil" class="quick-action-btn">
                  <span class="material-symbols-outlined">person</span>
                  <span>Mon profil</span>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const performancePeriod = ref('month')

const stats = ref({
  activeListings: 0,
  newListingsThisMonth: 0,
  totalViews: 0,
  viewsThisWeek: 0,
  totalSales: 0,
  salesThisMonth: 0,
  totalRevenue: 0,
  revenueThisMonth: 0
})

const recentListings = ref([])
const recentActivity = ref([])

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const userFirstName = computed(() => {
  return user.value?.firstName || 'Utilisateur'
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

const formatTime = (date) => {
  const now = new Date()
  const activityDate = new Date(date)
  const diffInHours = Math.floor((now - activityDate) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Il y a moins d\'une heure'
  if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
  return activityDate.toLocaleDateString('fr-FR')
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

const getActivityIcon = (type) => {
  const icons = {
    view: 'visibility',
    sale: 'sell',
    listing: 'inventory_2',
    message: 'mail'
  }
  return icons[type] || 'info'
}

const loadStats = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) return

  try {
    // TODO: Remplacer par les vraies API calls
    // const response = await fetch(`${API_URL}/listings/stats`, {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // })
    // const data = await response.json()
    
    // Données de démonstration
    stats.value = {
      activeListings: 3,
      newListingsThisMonth: 2,
      totalViews: 1247,
      viewsThisWeek: 89,
      totalSales: 5,
      salesThisMonth: 2,
      totalRevenue: 12500,
      revenueThisMonth: 4500
    }
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  }
}

const loadRecentListings = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) return

  try {
    // TODO: Remplacer par les vraies API calls
    // const response = await fetch(`${API_URL}/listings/recent`, {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // })
    // const data = await response.json()
    
    // Données de démonstration
    recentListings.value = [
      {
        id: 1,
        title: 'Montre ancienne de collection',
        price: 2500,
        image: 'https://cdn.pixabay.com/photo/2015/06/25/17/21/smart-watch-821557_1280.jpg',
        status: 'PUBLISHED',
        views: 45
      },
      {
        id: 2,
        title: 'Tableau impressionniste',
        price: 8500,
        image: 'https://cdn.pixabay.com/photo/2018/11/30/18/53/church-3848348_1280.jpg',
        status: 'PUBLISHED',
        views: 123
      },
      {
        id: 3,
        title: 'Bijou art déco',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
        status: 'DRAFT',
        views: 0
      }
    ]
  } catch (error) {
    console.error('Erreur lors du chargement des annonces:', error)
  }
}

const loadRecentActivity = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) return

  try {
    // TODO: Remplacer par les vraies API calls
    // Données de démonstration
    recentActivity.value = [
      {
        id: 1,
        type: 'view',
        message: 'Votre annonce "Montre ancienne" a reçu 5 nouvelles vues',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 2,
        type: 'sale',
        message: 'Vente réalisée : "Tableau impressionniste" pour 8500€',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        type: 'listing',
        message: 'Nouvelle annonce créée : "Bijou art déco"',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]
  } catch (error) {
    console.error('Erreur lors du chargement de l\'activité:', error)
  }
}

const editListing = (id) => {
  router.push(`/mes-annonces/${id}/edit`)
}

const viewListing = (id) => {
  router.push(`/mes-annonces/${id}`)
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
  loadRecentActivity()
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
  margin-bottom: 30px;
  width: 100%;
  box-sizing: border-box;
}

.stat-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 25px;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  transition: all 0.3s ease;
  border-left: 4px solid;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-primary .stat-icon-wrapper {
  background-color: rgba(100, 83, 148, 0.1);
}

.stat-secondary .stat-icon-wrapper {
  background-color: rgba(33, 150, 243, 0.1);
}

.stat-success .stat-icon-wrapper {
  background-color: rgba(76, 175, 80, 0.1);
}

.stat-info .stat-icon-wrapper {
  background-color: rgba(255, 152, 0, 0.1);
}

.stat-icon {
  font-size: 28px;
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
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.stat-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 8px 0;
}

.stat-value {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 700;
  font-size: 2rem;
  color: #213547;
  margin: 0 0 5px 0;
}

.stat-change {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  margin: 0;
}

.stat-change.positive {
  color: #4CAF50;
}

/* Grille principale */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  width: 100%;
  box-sizing: border-box;
}

.grid-column {
  display: flex;
  flex-direction: column;
  gap: 30px;
  min-width: 0;
  width: 100%;
}

/* Modules */
.module-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 30px;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.module-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
  width: 100%;
  box-sizing: border-box;
  gap: 15px;
}

.module-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.3rem;
  color: #213547;
  margin: 0;
  min-width: 0;
  flex: 1;
}

.module-icon {
  font-size: 24px;
  color: #645394;
}

.module-link {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  color: #645394;
  text-decoration: none;
  transition: all 0.3s ease;
}

.module-link:hover {
  gap: 10px;
  color: #4F4670;
}

.module-content {
  /* Contenu spécifique défini dans chaque module */
}

.period-select {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 14px;
  color: #213547;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-select:hover {
  border-color: #645394;
}

.period-select:focus {
  outline: none;
  border-color: #645394;
}

/* Liste des annonces */
.listings-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.listing-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 12px;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

.listing-item:hover {
  background-color: #f5f5f5;
  transform: translateX(5px);
}

.listing-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.listing-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.listing-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: #213547;
  margin: 0 0 5px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.listing-price {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  color: #645394;
  margin: 0 0 8px 0;
}

.listing-meta {
  display: flex;
  gap: 15px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.85rem;
  color: #666;
}

.listing-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.75rem;
}

.listing-status.PUBLISHED {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.listing-status.DRAFT {
  background-color: rgba(255, 152, 0, 0.1);
  color: #FF9800;
}

.listing-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
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

.action-btn:hover {
  border-color: #645394;
  background-color: #f5f5f5;
  color: #645394;
}

.action-btn .material-symbols-outlined {
  font-size: 18px;
}

/* Activité récente */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 12px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.view {
  background-color: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.activity-icon.sale {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.activity-icon.listing {
  background-color: rgba(100, 83, 148, 0.1);
  color: #645394;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.95rem;
  color: #213547;
  margin: 0 0 5px 0;
}

.activity-time {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.8rem;
  color: #999;
  margin: 0;
}

/* Graphique */
.chart-container {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #999;
}

.chart-icon {
  font-size: 64px;
  color: #e0e0e0;
  margin-bottom: 15px;
}

.chart-note {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.85rem;
  color: #999;
  margin-top: 10px;
}

/* Actions rapides */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  text-decoration: none;
  color: #213547;
  transition: all 0.3s ease;
}

.quick-action-btn:hover {
  background-color: #f5f5f5;
  border-color: #645394;
  color: #645394;
  transform: translateY(-3px);
}

.quick-action-btn .material-symbols-outlined {
  font-size: 32px;
}

.quick-action-btn span:last-child {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
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
  .dashboard-grid {
    grid-template-columns: 1fr;
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

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .listing-item {
    flex-wrap: wrap;
  }

  .listing-image {
    width: 100%;
    height: 200px;
  }
}
</style>
