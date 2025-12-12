<template>
  <div class="dashboard-admin-wrapper">
    <div class="dashboard-admin-container">
      <!-- En-tête -->
      <div class="page-header">
        <h1 class="page-title">Tableau de bord Administrateur</h1>
        <p class="page-subtitle">Gérez la plateforme Purple Dog</p>
      </div>

      <!-- Statistiques globales -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-symbols-outlined">inventory_2</span>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalListings }}</h3>
            <p>Annonces totales</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-symbols-outlined">people</span>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalUsers }}</h3>
            <p>Utilisateurs</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-symbols-outlined">euro</span>
          </div>
          <div class="stat-content">
            <h3>{{ formatCurrency(stats.totalRevenue) }}</h3>
            <p>Revenus totaux</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-symbols-outlined">feedback</span>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalFeedback }}</h3>
            <p>Feedbacks</p>
          </div>
        </div>
      </div>

      <!-- Navigation par onglets -->
      <div class="tabs-container">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
        >
          <span class="material-symbols-outlined">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Contenu des onglets -->
      <div class="tab-content">
        <!-- Onglet: Annonces -->
        <div v-if="activeTab === 'listings'" class="tab-panel">
          <div class="panel-header">
            <h2>Gestion des annonces</h2>
            <div class="filters">
              <select v-model="listingsFilters.status" class="filter-select">
                <option value="">Tous les statuts</option>
                <option value="PUBLISHED">Publiées</option>
                <option value="DRAFT">Brouillons</option>
                <option value="SOLD">Vendues</option>
              </select>
              <select v-model="listingsFilters.saleMode" class="filter-select">
                <option value="">Tous les modes</option>
                <option value="AUCTION">Enchères</option>
                <option value="INSTANT_SALE">Vente rapide</option>
              </select>
              <button @click="loadListings" class="btn-refresh">
                <span class="material-symbols-outlined">refresh</span>
              </button>
            </div>
          </div>
          <div v-if="listingsLoading" class="loading">Chargement...</div>
          <div v-else class="listings-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titre</th>
                  <th>Vendeur</th>
                  <th>Prix</th>
                  <th>Statut</th>
                  <th>Mode</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="listing in listings" :key="listing.id">
                  <td>{{ listing.id.substring(0, 8) }}...</td>
                  <td>{{ listing.title }}</td>
                  <td>{{ listing.seller?.firstName }} {{ listing.seller?.lastName }}</td>
                  <td>{{ formatCurrency(listing.priceDesired) }}</td>
                  <td>
                    <span class="status-badge" :class="listing.status.toLowerCase()">
                      {{ listing.status }}
                    </span>
                  </td>
                  <td>{{ listing.saleMode }}</td>
                  <td>
                    <button @click="viewListing(listing.id)" class="btn-action">
                      <span class="material-symbols-outlined">visibility</span>
                    </button>
                    <button @click="deleteListing(listing.id)" class="btn-action danger">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Onglet: Utilisateurs -->
        <div v-if="activeTab === 'users'" class="tab-panel">
          <div class="panel-header">
            <h2>Gestion des utilisateurs</h2>
            <button @click="showCreateUserModal = true" class="btn-primary">
              <span class="material-symbols-outlined">add</span>
              Créer un utilisateur
            </button>
          </div>
          <div v-if="usersLoading" class="loading">Chargement...</div>
          <div v-else class="users-table">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nom</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user.email }}</td>
                  <td>{{ user.firstName }} {{ user.lastName }}</td>
                  <td>{{ user.role }}</td>
                  <td>
                    <span class="status-badge" :class="user.status?.toLowerCase()">
                      {{ user.status }}
                    </span>
                  </td>
                  <td>
                    <button @click="blockUser(user.id, !user.blocked)" class="btn-action">
                      <span class="material-symbols-outlined">
                        {{ user.blocked ? 'lock_open' : 'lock' }}
                      </span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Onglet: Commissions -->
        <div v-if="activeTab === 'commissions'" class="tab-panel">
          <div class="panel-header">
            <h2>Gestion des commissions</h2>
          </div>
          <div v-if="commissionsLoading" class="loading">Chargement...</div>
          <div v-else class="commissions-list">
            <div class="commission-item">
              <h3>Commission globale</h3>
              <div class="commission-control">
                <input
                  v-model.number="globalCommission"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  class="commission-input"
                />
                <span>%</span>
                <button @click="updateGlobalCommission" class="btn-primary">Mettre à jour</button>
              </div>
            </div>
            <div v-for="commission in categoryCommissions" :key="commission.category" class="commission-item">
              <h3>{{ commission.category }}</h3>
              <div class="commission-control">
                <input
                  v-model.number="commission.commissionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  class="commission-input"
                />
                <span>%</span>
                <button @click="updateCategoryCommission(commission.category, commission.commissionRate)" class="btn-primary">
                  Mettre à jour
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet: Feedbacks -->
        <div v-if="activeTab === 'feedback'" class="tab-panel">
          <div class="panel-header">
            <h2>Feedbacks utilisateurs</h2>
          </div>
          <div v-if="feedbackLoading" class="loading">Chargement...</div>
          <div v-else class="feedback-list">
            <div v-for="item in feedbacks" :key="item.id" class="feedback-item">
              <div class="feedback-header">
                <div>
                  <strong>{{ item.user?.firstName }} {{ item.user?.lastName }}</strong>
                  <span class="feedback-role">{{ item.user?.role }}</span>
                </div>
                <div class="feedback-ratings">
                  <span v-if="item.stars" class="stars">
                    ⭐ {{ item.stars }}/5
                  </span>
                  <span v-if="item.nps" class="nps">
                    NPS: {{ item.nps }}/10
                  </span>
                </div>
              </div>
              <p v-if="item.comment" class="feedback-comment">{{ item.comment }}</p>
              <span class="feedback-date">{{ formatDate(item.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal: Créer utilisateur -->
      <div v-if="showCreateUserModal" class="modal-overlay" @click="showCreateUserModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Créer un utilisateur</h3>
            <button @click="showCreateUserModal = false" class="modal-close">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <form @submit.prevent="createUser" class="modal-body">
            <div class="form-group">
              <label>Email *</label>
              <input v-model="newUser.email" type="email" required />
            </div>
            <div class="form-group">
              <label>Prénom *</label>
              <input v-model="newUser.firstName" type="text" required />
            </div>
            <div class="form-group">
              <label>Nom *</label>
              <input v-model="newUser.lastName" type="text" required />
            </div>
            <div class="form-group">
              <label>Rôle *</label>
              <select v-model="newUser.role" required>
                <option value="PARTICULIER">Particulier</option>
                <option value="PROFESSIONNEL">Professionnel</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div class="form-group">
              <label>Mot de passe *</label>
              <input v-model="newUser.password" type="password" required />
            </div>
            <div class="modal-footer">
              <button type="button" @click="showCreateUserModal = false" class="btn-secondary">Annuler</button>
              <button type="submit" class="btn-primary">Créer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const activeTab = ref('listings')
const tabs = [
  { id: 'listings', label: 'Annonces', icon: 'inventory_2' },
  { id: 'users', label: 'Utilisateurs', icon: 'people' },
  { id: 'commissions', label: 'Commissions', icon: 'euro' },
  { id: 'feedback', label: 'Feedbacks', icon: 'feedback' }
]

const stats = ref({
  totalListings: 0,
  totalUsers: 0,
  totalRevenue: 0,
  totalFeedback: 0
})

const listings = ref([])
const listingsLoading = ref(false)
const listingsFilters = ref({
  status: '',
  saleMode: ''
})

const users = ref([])
const usersLoading = ref(false)
const showCreateUserModal = ref(false)
const newUser = ref({
  email: '',
  firstName: '',
  lastName: '',
  role: 'PARTICULIER',
  password: ''
})

const globalCommission = ref(0)
const categoryCommissions = ref([])
const commissionsLoading = ref(false)

const feedbacks = ref([])
const feedbackLoading = ref(false)

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const getToken = () => {
  return localStorage.getItem('access_token')
}

const checkAuth = () => {
  const token = getToken()
  const userData = localStorage.getItem('user')
  
  if (!token || !userData) {
    router.push('/login')
    return false
  }
  
  try {
    const user = JSON.parse(userData)
    const userRole = user.role?.toUpperCase()
    if (userRole !== 'ADMIN' && userRole !== 'admin') {
      // Rediriger vers le bon dashboard
      if (userRole === 'PROFESSIONNEL' || userRole === 'professionnel') {
        router.push('/dashboard/professionnel')
      } else if (userRole === 'PARTICULIER' || userRole === 'particulier') {
        router.push('/dashboard/particulier')
      } else {
        router.push('/')
      }
      return false
    }
    return true
  } catch (e) {
    console.error('Erreur lors du parsing des données utilisateur:', e)
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    router.push('/login')
    return false
  }
}

const loadStats = async () => {
  const token = getToken()
  if (!token) return
  
  try {
    // Charger les stats depuis les différentes sources
    const [listingsRes, usersRes, feedbackRes] = await Promise.all([
      fetch(`${API_URL}/admin/listings?limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${API_URL}/admin/feedback`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ])
    
    if (listingsRes.ok) {
      const data = await listingsRes.json()
      stats.value.totalListings = data.pagination?.total || 0
    }
    
    if (usersRes.ok) {
      const data = await usersRes.json()
      stats.value.totalUsers = data.pagination?.total || data.users?.length || data.length || 0
    }
    
    if (feedbackRes.ok) {
      const data = await feedbackRes.json()
      stats.value.totalFeedback = data.length || 0
    }
  } catch (error) {
    console.error('Erreur lors du chargement des stats:', error)
  }
}

const loadListings = async () => {
  listingsLoading.value = true
  const token = getToken()
  if (!token) return
  
  try {
    const params = new URLSearchParams()
    if (listingsFilters.value.status) params.append('status', listingsFilters.value.status)
    if (listingsFilters.value.saleMode) params.append('saleMode', listingsFilters.value.saleMode)
    
    const response = await fetch(`${API_URL}/admin/listings?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      const data = await response.json()
      listings.value = data.listings || []
    }
  } catch (error) {
    console.error('Erreur lors du chargement des annonces:', error)
  } finally {
    listingsLoading.value = false
  }
}

const loadUsers = async () => {
  usersLoading.value = true
  const token = getToken()
  if (!token) return
  
  try {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      users.value = await response.json()
    }
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
  } finally {
    usersLoading.value = false
  }
}

const loadCommissions = async () => {
  commissionsLoading.value = true
  const token = getToken()
  if (!token) return
  
  try {
    const response = await fetch(`${API_URL}/admin/commissions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      const data = await response.json()
      // Séparer commission globale et catégories
      const global = data.find(c => c.isGlobal === true)
      if (global) {
        globalCommission.value = parseFloat(global.sellerRate || global.commissionRate || 0) * 100
      }
      categoryCommissions.value = data.filter(c => !c.isGlobal).map(c => ({
        category: c.category?.code || c.category,
        commissionRate: parseFloat(c.sellerRate || c.commissionRate || 0) * 100
      }))
    }
  } catch (error) {
    console.error('Erreur lors du chargement des commissions:', error)
  } finally {
    commissionsLoading.value = false
  }
}

const loadFeedback = async () => {
  feedbackLoading.value = true
  const token = getToken()
  if (!token) return
  
  try {
    const response = await fetch(`${API_URL}/admin/feedback`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      feedbacks.value = await response.json()
    }
  } catch (error) {
    console.error('Erreur lors du chargement des feedbacks:', error)
  } finally {
    feedbackLoading.value = false
  }
}

const viewListing = (id) => {
  router.push(`/produit/${id}`)
}

const deleteListing = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return
  
  const token = getToken()
  try {
    const response = await fetch(`${API_URL}/admin/listings/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.ok) {
      loadListings()
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

const createUser = async () => {
  const token = getToken()
  try {
    const response = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser.value)
    })
    
    if (response.ok) {
      showCreateUserModal.value = false
      newUser.value = { email: '', firstName: '', lastName: '', role: 'PARTICULIER', password: '' }
      loadUsers()
    }
  } catch (error) {
    console.error('Erreur lors de la création:', error)
  }
}

const blockUser = async (id, block) => {
  const token = getToken()
  try {
    const response = await fetch(`${API_URL}/admin/users/${id}/block`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ block })
    })
    
    if (response.ok) {
      loadUsers()
    }
  } catch (error) {
    console.error('Erreur lors du blocage:', error)
  }
}

const updateGlobalCommission = async () => {
  const token = getToken()
  try {
    const response = await fetch(`${API_URL}/admin/commissions/global`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ commissionRate: globalCommission.value / 100 })
    })
    
    if (response.ok) {
      alert('Commission globale mise à jour')
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  }
}

const updateCategoryCommission = async (category, rate) => {
  const token = getToken()
  try {
    const response = await fetch(`${API_URL}/admin/commissions/category/${category}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ commissionRate: rate / 100 })
    })
    
    if (response.ok) {
      alert('Commission mise à jour')
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  }
}

// Charger les données quand on change d'onglet
watch(activeTab, (newTab) => {
  if (!checkAuth()) return
  if (newTab === 'listings') {
    loadListings()
  } else if (newTab === 'users') {
    loadUsers()
  } else if (newTab === 'commissions') {
    loadCommissions()
  } else if (newTab === 'feedback') {
    loadFeedback()
  }
})

onMounted(() => {
  if (!checkAuth()) return
  loadStats()
  loadListings()
  loadUsers()
  loadCommissions()
  loadFeedback()
})
</script>

<style scoped>
.dashboard-admin-wrapper {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30px 0;
}

.dashboard-admin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-family: 'Georgia', serif;
  font-size: 2.5rem;
  color: #213547;
  margin: 0 0 10px 0;
}

.page-subtitle {
  color: #666;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #645394 0%, #8B7AB8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon .material-symbols-outlined {
  font-size: 32px;
}

.stat-content h3 {
  font-size: 2rem;
  margin: 0;
  color: #213547;
}

.stat-content p {
  margin: 5px 0 0 0;
  color: #666;
}

.tabs-container {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.3s;
}

.tab-button:hover {
  color: #645394;
}

.tab-button.active {
  color: #645394;
  border-bottom-color: #645394;
}

.tab-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h2 {
  margin: 0;
  color: #213547;
}

.filters {
  display: flex;
  gap: 10px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.btn-refresh, .btn-action {
  padding: 8px 12px;
  border: none;
  background: #645394;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn-action.danger {
  background: #d32f2f;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  font-weight: 600;
  color: #213547;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.published {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.draft {
  background: #fff3e0;
  color: #e65100;
}

.status-badge.sold {
  background: #e3f2fd;
  color: #1565c0;
}

.commission-item {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.commission-item:last-child {
  border-bottom: none;
}

.commission-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.commission-input {
  width: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.feedback-item {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.feedback-role {
  margin-left: 10px;
  color: #666;
  font-size: 0.9rem;
}

.feedback-ratings {
  display: flex;
  gap: 15px;
}

.feedback-comment {
  margin: 10px 0;
  color: #333;
}

.feedback-date {
  color: #999;
  font-size: 0.85rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: #645394;
  color: white;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>

