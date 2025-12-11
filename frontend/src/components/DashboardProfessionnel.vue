<template>
  <div class="dashboard-wrapper">
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1 class="dashboard-title">Tableau de bord - Professionnel</h1>
        <p class="dashboard-subtitle">Bienvenue, {{ userFirstName }} !</p>
      </div>
      
      <!-- Statistiques rapides -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <span class="material-symbols-outlined stat-icon">inventory_2</span>
          </div>
          <div class="stat-content">
            <p class="stat-value">{{ listingsCount }}</p>
            <p class="stat-label">Annonces actives</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <span class="material-symbols-outlined stat-icon">visibility</span>
          </div>
          <div class="stat-content">
            <p class="stat-value">{{ viewsCount }}</p>
            <p class="stat-label">Vues totales</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <span class="material-symbols-outlined stat-icon">sell</span>
          </div>
          <div class="stat-content">
            <p class="stat-value">{{ salesCount }}</p>
            <p class="stat-label">Ventes réalisées</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <span class="material-symbols-outlined stat-icon">euro</span>
          </div>
          <div class="stat-content">
            <p class="stat-value">{{ revenue }}€</p>
            <p class="stat-label">Chiffre d'affaires</p>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="dashboard-grid">
          <!-- Mes annonces -->
          <div class="dashboard-card">
            <div class="card-header">
              <span class="material-symbols-outlined card-icon">inventory_2</span>
              <h2 class="card-title">Mes annonces</h2>
            </div>
            <div class="card-content">
              <p class="card-description">Gérez vos annonces de vente</p>
              <router-link to="/mes-annonces" class="card-link">
                Voir mes annonces <span class="material-symbols-outlined">arrow_forward</span>
              </router-link>
            </div>
          </div>

          <!-- Créer une annonce -->
          <div class="dashboard-card">
            <div class="card-header">
              <span class="material-symbols-outlined card-icon">add_circle</span>
              <h2 class="card-title">Créer une annonce</h2>
            </div>
            <div class="card-content">
              <p class="card-description">Publiez un nouveau produit</p>
              <router-link to="/creer-annonce" class="card-link">
                Créer une annonce <span class="material-symbols-outlined">arrow_forward</span>
              </router-link>
            </div>
          </div>

          <!-- Statistiques -->
          <div class="dashboard-card">
            <div class="card-header">
              <span class="material-symbols-outlined card-icon">analytics</span>
              <h2 class="card-title">Statistiques</h2>
            </div>
            <div class="card-content">
              <p class="card-description">Consultez vos statistiques de vente</p>
              <router-link to="/statistiques" class="card-link">
                Voir les statistiques <span class="material-symbols-outlined">arrow_forward</span>
              </router-link>
            </div>
          </div>

          <!-- Mes favoris -->
          <div class="dashboard-card">
            <div class="card-header">
              <span class="material-symbols-outlined card-icon">favorite</span>
              <h2 class="card-title">Mes favoris</h2>
            </div>
            <div class="card-content">
              <p class="card-description">Gérez vos produits favoris</p>
              <router-link to="/mes-favoris" class="card-link">
                Voir mes favoris <span class="material-symbols-outlined">arrow_forward</span>
              </router-link>
            </div>
          </div>

          <!-- Mon panier -->
          <div class="dashboard-card">
            <div class="card-header">
              <span class="material-symbols-outlined card-icon">shopping_cart</span>
              <h2 class="card-title">Mon panier</h2>
            </div>
            <div class="card-content">
              <p class="card-description">Consultez votre panier d'achat</p>
              <router-link to="/mon-panier" class="card-link">
                Voir mon panier <span class="material-symbols-outlined">arrow_forward</span>
              </router-link>
            </div>
          </div>

          <!-- Mes achats -->
          <div class="dashboard-card">
            <div class="card-header">
              <span class="material-symbols-outlined card-icon">shopping_bag</span>
              <h2 class="card-title">Mes achats</h2>
            </div>
            <div class="card-content">
              <p class="card-description">Historique de vos commandes</p>
              <router-link to="/mes-achats" class="card-link">
                Voir mes achats <span class="material-symbols-outlined">arrow_forward</span>
              </router-link>
            </div>
          </div>

          <!-- Mon profil -->
          <div class="dashboard-card">
            <div class="card-header">
              <span class="material-symbols-outlined card-icon">person</span>
              <h2 class="card-title">Mon profil</h2>
            </div>
            <div class="card-content">
              <p class="card-description">Gérez vos informations professionnelles</p>
              <router-link to="/profil" class="card-link">
                Modifier mon profil <span class="material-symbols-outlined">arrow_forward</span>
              </router-link>
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
const listingsCount = ref(0)
const viewsCount = ref(0)
const salesCount = ref(0)
const revenue = ref(0)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const userFirstName = computed(() => {
  return user.value?.firstName || 'Utilisateur'
})

const loadStats = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) return

  try {
    // TODO: Remplacer par les vraies API calls quand elles seront disponibles
    // const response = await fetch(`${API_URL}/listings/stats`, {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // })
    // const data = await response.json()
    // listingsCount.value = data.activeListings || 0
    // viewsCount.value = data.totalViews || 0
    // salesCount.value = data.totalSales || 0
    // revenue.value = data.totalRevenue || 0
    
    // Pour l'instant, valeurs par défaut
    listingsCount.value = 0
    viewsCount.value = 0
    salesCount.value = 0
    revenue.value = 0
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
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
})
</script>

<style scoped>
.dashboard-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-container {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
}

.dashboard-header {
  margin-bottom: 40px;
}

.dashboard-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-size: 2.5rem;
  color: #213547;
  margin-bottom: 10px;
}

.dashboard-subtitle {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 1.2rem;
  color: #666;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  border-color: #645394;
  box-shadow: 0 4px 12px rgba(100, 83, 148, 0.1);
}

.stat-icon-wrapper {
  width: 60px;
  height: 60px;
  background-color: #f5f5f5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon {
  font-size: 32px;
  color: #645394;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 700;
  font-size: 2rem;
  color: #213547;
  margin: 0 0 5px 0;
}

.stat-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.dashboard-content {
  margin-top: 30px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.dashboard-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 30px;
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #645394;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.card-icon {
  font-size: 32px;
  color: #645394;
}

.card-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  color: #213547;
  margin: 0;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.card-description {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.card-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  color: #645394;
  text-decoration: none;
  transition: all 0.3s ease;
}

.card-link:hover {
  color: #4F4670;
  gap: 12px;
}

.card-link .material-symbols-outlined {
  font-size: 18px;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 20px 15px;
  }

  .dashboard-title {
    font-size: 2rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .dashboard-card {
    padding: 20px;
  }

  .stats-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>

