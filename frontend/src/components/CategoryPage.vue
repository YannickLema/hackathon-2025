<template>
  <div class="category-page-wrapper">
    <div class="category-page">
      <!-- Bouton retour catégories -->
      <div class="category-breadcrumb">
        <router-link to="/" class="breadcrumb-btn">
          <span class="material-symbols-outlined">arrow_back</span>
          <span>Catégories</span>
        </router-link>
      </div>

      <!-- Section principale de la catégorie -->
      <section class="category-hero">
        <div class="container">
          <div class="category-hero-content">
            <div class="category-image">
              <img :src="categoryData.image" :alt="categoryData.name" />
            </div>
            <div class="category-info">
              <h1 class="category-title">{{ categoryData.name }}</h1>
              <p class="category-description">
                {{ categoryData.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Sous-catégories -->
      <section class="subcategories-section">
        <div class="container">
          <h2 class="subcategories-title">Sous-catégories</h2>
          <div class="subcategories-grid">
            <button
              v-for="subcategory in categoryData.subcategories" 
              :key="subcategory.id"
              class="subcategory-card"
              :class="{ active: selectedSubcategory === subcategory.id }"
              @click="selectSubcategory(subcategory.id)"
            >
              <span class="material-symbols-outlined subcategory-icon">{{ subcategory.icon }}</span>
              <span class="subcategory-name">{{ subcategory.name }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Section produits avec recherche et filtres -->
      <section class="products-section">
        <div class="container">
          <div class="products-header">
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Recherche rapide..." 
              class="search-input"
            />
            <div class="products-actions">
              <button class="filter-btn" @click="toggleFilterModal">
                <span class="material-symbols-outlined">tune</span>
                <span>Filtre</span>
              </button>
              <button class="sort-btn" @click="toggleSortModal">
                <span class="material-symbols-outlined">sort</span>
                <span>Trier par</span>
              </button>
            </div>
            
            <!-- Modal Filtres -->
            <div class="filter-modal" v-if="showFilterModal" @click.self="closeFilterModal">
              <div class="filter-modal-content">
                <div class="filter-modal-header">
                  <h3>Filtres</h3>
                  <button class="filter-modal-close" @click="closeFilterModal">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div class="filter-options">
                  <div class="filter-group">
                    <label class="filter-label">Prix</label>
                    <div class="price-range">
                      <input type="number" v-model.number="filters.minPrice" placeholder="Min" class="price-input" />
                      <span>-</span>
                      <input type="number" v-model.number="filters.maxPrice" placeholder="Max" class="price-input" />
                    </div>
                  </div>
                  <div class="filter-group">
                    <label class="filter-label">Sous-catégorie</label>
                    <select v-model="filters.subcategory" class="filter-select">
                      <option value="">Toutes</option>
                      <option v-for="subcat in categoryData.subcategories" :key="subcat.id" :value="subcat.id">
                        {{ subcat.name }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="filter-modal-footer">
                  <button class="filter-reset-btn" @click="resetFilters">Réinitialiser</button>
                  <button class="filter-apply-btn" @click="applyFilters">Appliquer</button>
                </div>
              </div>
            </div>

            <!-- Modal Trier -->
            <div class="sort-modal" v-if="showSortModal" @click.self="closeSortModal">
              <div class="sort-modal-content">
                <div class="sort-modal-header">
                  <h3>Trier par</h3>
                  <button class="sort-modal-close" @click="closeSortModal">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div class="sort-options">
                  <button 
                    v-for="option in sortOptions" 
                    :key="option.value"
                    class="sort-option"
                    :class="{ active: sortBy === option.value }"
                    @click="selectSort(option.value)"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="isLoading" class="products-loading">
            <p>Chargement des produits...</p>
          </div>
          <div v-else-if="filteredProducts.length === 0" class="products-empty">
            <p>Aucun produit trouvé dans cette catégorie.</p>
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
                </div>
                <div class="product-content">
                  <div class="product-header">
                    <h3 class="product-title">{{ product.title }}</h3>
                    <span class="product-price">{{ product.price }}€</span>
                  </div>
                  <p class="product-description">{{ product.description }}</p>
                  <button 
                    class="add-to-cart-btn" 
                    @click.stop.prevent="addToCart(product.id)"
                  >
                    Ajouter au panier
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import NewsletterSection from './NewsletterSection.vue'

const route = useRoute()
const searchQuery = ref('')
const selectedSubcategory = ref(null)
const showFilterModal = ref(false)
const showSortModal = ref(false)
const sortBy = ref('default')
const isLoading = ref(false)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Mapping entre les catégories frontend et backend
const categoryMapping = {
  1: 'BIJOUX_MONTRES', // Bijoux & montres
  2: 'MEUBLES_ANCIENS', // Meubles anciens
  3: 'OBJETS_ART_TABLEAUX', // Objets d'art & tableaux
  4: 'OBJETS_ART_TABLEAUX', // Objets de collection
  5: 'VINS_SPIRITUEUX', // Vins & spiritueux
  6: 'INSTRUMENTS_MUSIQUE', // Instruments de musique
  7: 'LIVRES_MANUSCRITS', // Livres anciens
  8: 'MODE_ACCESSOIRES_LUXE', // Accessoires de luxe
  9: 'BIJOUX_MONTRES', // Horlogerie & pendules
  10: 'PHOTOGRAPHIES_ANCIENNES', // Photographie anciennes
  11: 'OBJETS_ART_TABLEAUX', // Vaisselle, argenterie
  12: 'SCULPTURES_DECORATION', // Sculptures & objets decoratifs
  13: 'OBJETS_ART_TABLEAUX' // Vehicules de collection
}

const filters = ref({
  minPrice: null,
  maxPrice: null,
  subcategory: null
})

const sortOptions = [
  { value: 'default', label: 'Par défaut' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'name-asc', label: 'Nom A-Z' },
  { value: 'name-desc', label: 'Nom Z-A' }
]

// Base de données des catégories avec descriptions
const categoriesDatabase = {
  1: {
    id: 1,
    name: 'Bijoux & montres',
    description: 'Découvrez notre collection exceptionnelle de bijoux et montres de collection. Des pièces uniques allant des bijoux anciens aux montres de prestige, chaque objet raconte une histoire et témoigne d\'un savoir-faire d\'exception. Que vous recherchiez une bague Art Déco, une montre de luxe ou un collier vintage, notre sélection vous garantit authenticité et qualité.',
    image: 'https://cdn.pixabay.com/photo/2014/03/06/21/57/coffer-281251_1280.jpg',
    subcategories: [
      { id: 1, name: 'COUPS DE COEUR', icon: 'favorite' },
      { id: 2, name: 'MONTRES', icon: 'watch' },
      { id: 3, name: 'BIJOUX ANCIENS', icon: 'diamond' },
      { id: 4, name: 'COLLIERS', icon: 'diamond' },
      { id: 5, name: 'BRACELETS', icon: 'watch' },
      { id: 6, name: 'BAGUES', icon: 'diamond_shine' },
      { id: 7, name: 'BOUCLES D\'OREILLES', icon: 'tune' },
      { id: 8, name: 'BROCHES', icon: 'push_pin' }
    ]
  },
  2: {
    id: 2,
    name: 'Meubles anciens',
    description: 'Plongez dans l\'univers des meubles anciens et du mobilier d\'époque. Notre collection rassemble des pièces rares et authentiques, du mobilier Louis XVI aux créations Art Nouveau, en passant par les meubles régionaux. Chaque meuble est expertisé et restauré avec soin pour préserver son caractère et son histoire. Trouvez la pièce unique qui donnera une âme à votre intérieur.',
    image: 'https://cdn.pixabay.com/photo/2017/07/11/12/11/chair-backrest-2493326_1280.jpg',
    subcategories: [
      { id: 1, name: 'COUPS DE COEUR', icon: 'favorite' },
      { id: 2, name: 'CHAISES', icon: 'chair' },
      { id: 3, name: 'TABLES', icon: 'table_restaurant' },
      { id: 4, name: 'ARMOIRES', icon: 'dresser' },
      { id: 5, name: 'COMMODES', icon: 'inventory_2' },
      { id: 6, name: 'FAUTEUILS', icon: 'chair' },
      { id: 7, name: 'LITS', icon: 'bed' },
      { id: 8, name: 'BIBLIOTHEQUES', icon: 'library_books' }
    ]
  },
  3: {
    id: 3,
    name: 'Objets d\'art & tableaux',
    description: 'Explorez notre galerie d\'objets d\'art et de tableaux de collection. Des œuvres d\'artistes reconnus aux créations d\'artistes émergents, notre sélection couvre toutes les périodes et tous les styles. Peintures, sculptures, gravures et objets d\'art décoratif : chaque pièce est authentifiée et accompagnée de son certificat d\'authenticité. Offrez-vous une œuvre qui enrichira votre collection.',
    image: 'https://cdn.pixabay.com/photo/2018/11/30/18/53/church-3848348_1280.jpg',
    subcategories: [
      { id: 1, name: 'COUPS DE COEUR', icon: 'favorite' },
      { id: 2, name: 'PEINTURES', icon: 'palette' },
      { id: 3, name: 'SCULPTURES', icon: 'palette' },
      { id: 4, name: 'GRAVURES', icon: 'brush' },
      { id: 5, name: 'AQUARELLES', icon: 'water_drop' },
      { id: 6, name: 'DESSINS', icon: 'edit' },
      { id: 7, name: 'PHOTOGRAPHIES', icon: 'camera' },
      { id: 8, name: 'ART CONTEMPORAIN', icon: 'auto_awesome' }
    ]
  },
  4: {
    id: 4,
    name: 'Objets de collection',
    description: 'Découvrez notre sélection d\'objets de collection rares et précieux. Des objets vintage aux pièces de collection uniques, notre catalogue rassemble des trésors qui passionnent les collectionneurs. Jouets anciens, objets publicitaires, souvenirs historiques ou objets de curiosité : chaque pièce a été soigneusement sélectionnée pour sa rareté et son intérêt. Commencez ou enrichissez votre collection dès aujourd\'hui.',
    image: 'https://cdn.pixabay.com/photo/2016/08/15/16/48/vinyl-1595847_1280.jpg',
    subcategories: [
      { id: 1, name: 'COUPS DE COEUR', icon: 'favorite' },
      { id: 2, name: 'VINTAGE', icon: 'history' },
      { id: 3, name: 'RARETES', icon: 'star' },
      { id: 4, name: 'JOUETS ANCIENS', icon: 'toys' },
      { id: 5, name: 'PUBLICITAIRE', icon: 'campaign' },
      { id: 6, name: 'HISTORIQUE', icon: 'museum' },
      { id: 7, name: 'CURIOSITES', icon: 'explore' },
      { id: 8, name: 'LIMITED EDITION', icon: 'workspace_premium' }
    ]
  },
  5: {
    id: 5,
    name: 'Vins & spiritueux de collection',
    description: 'Explorez notre cave de vins et spiritueux de collection d\'exception. Des grands crus aux spiritueux rares, notre sélection provient des meilleurs domaines et distilleries. Chaque bouteille est stockée dans des conditions optimales et accompagnée de son certificat d\'authenticité. Que vous soyez amateur de grands vins ou collectionneur de spiritueux, découvrez des pièces uniques pour enrichir votre cave.',
    image: 'https://cdn.pixabay.com/photo/2023/10/28/06/40/wine-8346641_1280.jpg',
    subcategories: [
      { id: 1, name: 'COUPS DE COEUR', icon: 'favorite' },
      { id: 2, name: 'GRANDS CRUS', icon: 'wine_bar' },
      { id: 3, name: 'CHAMPAGNES', icon: 'celebration' },
      { id: 4, name: 'WHISKY', icon: 'liquor' },
      { id: 5, name: 'COGNAC', icon: 'wine_bar' },
      { id: 6, name: 'RHUM', icon: 'liquor' },
      { id: 7, name: 'VINS RARES', icon: 'star' },
      { id: 8, name: 'MILLESIMES', icon: 'calendar_month' }
    ]
  },
  6: {
    id: 6,
    name: 'Instruments de musique',
    description: 'Découvrez notre collection d\'instruments de musique de qualité. Des instruments classiques aux instruments rares, notre sélection s\'adresse aux musiciens et collectionneurs. Violons, pianos, guitares, instruments à vent : chaque instrument est expertisé et entretenu par des professionnels. Trouvez l\'instrument qui vous accompagnera dans votre pratique musicale ou qui enrichira votre collection.',
    image: 'https://cdn.pixabay.com/photo/2020/12/09/18/42/violin-5818267_1280.jpg',
    subcategories: [
      { id: 1, name: 'COUPS DE COEUR', icon: 'favorite' },
      { id: 2, name: 'VIOLONS', icon: 'music_note' },
      { id: 3, name: 'PIANOS', icon: 'piano' },
      { id: 4, name: 'GUITARES', icon: 'music_note' },
      { id: 5, name: 'VENT', icon: 'air' },
      { id: 6, name: 'PERCUSSION', icon: 'music_note' },
      { id: 7, name: 'INSTRUMENTS RARES', icon: 'star' },
      { id: 8, name: 'ACCESSOIRES', icon: 'tune' }
    ]
  },
  7: {
    id: 7,
    name: 'Livres anciens & manuscrits',
    description: 'Plongez dans l\'univers des livres anciens et manuscrits rares. Notre collection rassemble des ouvrages précieux, des premières éditions aux manuscrits historiques. Livres illustrés, éditions originales, ouvrages scientifiques ou littéraires : chaque livre est expertisé et documenté. Que vous soyez bibliophile ou chercheur, découvrez des trésors littéraires qui enrichiront votre bibliothèque.',
    image: 'https://cdn.pixabay.com/photo/2014/09/05/18/32/old-books-436498_1280.jpg',
    subcategories: [
      { id: 1, name: 'COUPS DE COEUR', icon: 'favorite' },
      { id: 2, name: 'PREMIERES EDITIONS', icon: 'book' },
      { id: 3, name: 'MANUSCRITS', icon: 'description' },
      { id: 4, name: 'LIVRES ILLUSTRES', icon: 'auto_stories' },
      { id: 5, name: 'SCIENTIFIQUES', icon: 'science' },
      { id: 6, name: 'LITTERAIRES', icon: 'menu_book' },
      { id: 7, name: 'HISTORIQUES', icon: 'history_edu' },
      { id: 8, name: 'RARES', icon: 'star' }
    ]
  },
  8: {
    id: 8,
    name: 'Accessoires de luxe',
    description: 'Explorez notre sélection d\'accessoires de luxe authentiques. Des sacs iconiques aux accessoires de marque, notre collection rassemble des pièces d\'exception des plus grandes maisons. Chaque article est authentifié et accompagné de son certificat. Que vous recherchiez un sac à main de créateur, une montre de luxe ou un accessoire de marque, trouvez la pièce qui complétera votre garde-robe avec élégance.',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop',
    subcategories: [
      { id: 1, name: 'COUPS DE COEUR', icon: 'favorite' },
      { id: 2, name: 'SACS', icon: 'shopping_bag' },
      { id: 3, name: 'MONTRES', icon: 'watch' },
      { id: 4, name: 'LUNETTES', icon: 'visibility' },
      { id: 5, name: 'CEINTURES', icon: 'style' },
      { id: 6, name: 'ECHARPES', icon: 'checkroom' },
      { id: 7, name: 'BIJOUX', icon: 'diamond' },
      { id: 8, name: 'MARQUES', icon: 'label' }
    ]
  },
  9: {
    id: 9,
    name: 'Horlogerie & pendules',
    description: 'Découvrez notre collection d\'horlogerie et pendules d\'exception. Des pendules anciennes aux montres de précision, notre sélection rassemble des pièces rares et authentiques. Chaque horloge et pendule est expertisée et entretenue par des horlogers professionnels. Que vous recherchiez une pendule de cheminée, une horloge comtoise ou une montre de collection, trouvez la pièce qui marquera le temps avec élégance.',
    image: 'https://cdn.pixabay.com/photo/2021/09/28/14/21/clocks-6664622_1280.jpg',
    subcategories: [
      { id: 1, name: 'COUPS DE COEUR', icon: 'favorite' },
      { id: 2, name: 'PENDULES', icon: 'schedule' },
      { id: 3, name: 'HORLOGES', icon: 'access_time' },
      { id: 4, name: 'MONTRE DE POCHE', icon: 'watch' },
      { id: 5, name: 'COMTOISES', icon: 'schedule' },
      { id: 6, name: 'CHEMINEE', icon: 'fireplace' },
      { id: 7, name: 'MURALE', icon: 'schedule' },
      { id: 8, name: 'ANTIQUES', icon: 'history' }
    ]
  },
  10: {
    id: 10,
    name: 'Photographie anciennes',
    description: 'Explorez notre collection de photographies anciennes et d\'époque. Des daguerréotypes aux tirages vintage, notre sélection rassemble des images rares qui témoignent de l\'histoire de la photographie. Portraits, paysages, scènes de vie : chaque photographie est authentifiée et documentée. Que vous soyez collectionneur ou amateur d\'art, découvrez des images qui capturent des moments précieux du passé.',
    image: 'https://cdn.pixabay.com/photo/2015/04/07/14/34/camera-711040_1280.jpg',
    subcategories: [
      { id: 1, name: 'COUPS DE COEUR', icon: 'favorite' },
      { id: 2, name: 'PORTRAITS', icon: 'person' },
      { id: 3, name: 'PAYSAGES', icon: 'landscape' },
      { id: 4, name: 'DAGUERREOTYPES', icon: 'camera' },
      { id: 5, name: 'TIREAGES VINTAGE', icon: 'photo' },
      { id: 6, name: 'ALBUMS', icon: 'photo_library' },
      { id: 7, name: 'ARTISTIQUES', icon: 'palette' },
      { id: 8, name: 'HISTORIQUES', icon: 'history' }
    ]
  },
  11: {
    id: 11,
    name: 'Vaisselle, argenterie & cristallerie',
    description: 'Découvrez notre sélection de vaisselle, argenterie et cristallerie de qualité. Des services complets aux pièces uniques, notre collection rassemble des objets précieux qui orneront votre table avec élégance. Porcelaine fine, argenterie ancienne, cristal de Baccarat : chaque pièce est expertisée et entretenue. Que vous recherchiez un service de table complet ou une pièce de collection, trouvez l\'objet qui sublimera vos repas.',
    image: 'https://cdn.pixabay.com/photo/2018/06/18/18/04/dishes-3483005_1280.jpg',
    subcategories: [
      { id: 1, name: 'COUPS DE COEUR', icon: 'favorite' },
      { id: 2, name: 'ARGENTERIE', icon: 'dining' },
      { id: 3, name: 'PORCELAINE', icon: 'restaurant' },
      { id: 4, name: 'CRISTAL', icon: 'wine_bar' },
      { id: 5, name: 'SERVICES', icon: 'dinner_dining' },
      { id: 6, name: 'COUVERTS', icon: 'restaurant_menu' },
      { id: 7, name: 'VASES', icon: 'local_florist' },
      { id: 8, name: 'DECORATIFS', icon: 'home' }
    ]
  },
  12: {
    id: 12,
    name: 'Sculptures & objets decoratifs',
    description: 'Explorez notre collection de sculptures et objets décoratifs d\'art. Des sculptures classiques aux créations contemporaines, notre sélection rassemble des pièces uniques qui enrichiront votre intérieur. Bronze, marbre, terre cuite ou matériaux modernes : chaque sculpture est authentifiée et documentée. Que vous recherchiez une pièce monumentale ou un objet décoratif raffiné, découvrez des œuvres qui apporteront caractère et élégance à votre espace.',
    image: 'https://cdn.pixabay.com/photo/2021/12/30/16/46/bells-6904308_1280.jpg',
    subcategories: [
      { id: 1, name: 'COUPS DE COEUR', icon: 'favorite' },
      { id: 2, name: 'BRONZE', icon: 'palette' },
      { id: 3, name: 'MARBRE', icon: 'palette' },
      { id: 4, name: 'TERRE CUITE', icon: 'palette' },
      { id: 5, name: 'CONTEMPORAIN', icon: 'auto_awesome' },
      { id: 6, name: 'CLASSIQUE', icon: 'museum' },
      { id: 7, name: 'DECORATIFS', icon: 'home' },
      { id: 8, name: 'MONUMENTALES', icon: 'landscape' }
    ]
  },
  13: {
    id: 13,
    name: 'Vehicules de collection',
    description: 'Découvrez notre sélection de véhicules de collection d\'exception. Des voitures anciennes aux motos vintage, notre collection rassemble des véhicules rares et authentiques. Chaque véhicule est expertisé et entretenu par des professionnels. Que vous recherchiez une voiture de prestige, une moto classique ou un véhicule historique, trouvez la pièce qui vous permettra de rouler avec style et caractère.',
    image: 'https://cdn.pixabay.com/photo/2019/08/08/23/33/car-4393990_1280.jpg',
    subcategories: [
      { id: 1, name: 'COUPS DE COEUR', icon: 'favorite' },
      { id: 2, name: 'VOITURES', icon: 'directions_car' },
      { id: 3, name: 'MOTOS', icon: 'two_wheeler' },
      { id: 4, name: 'VINTAGE', icon: 'history' },
      { id: 5, name: 'SPORTIVES', icon: 'fast_forward' },
      { id: 6, name: 'CLASSIQUES', icon: 'star' },
      { id: 7, name: 'RESTAUREES', icon: 'build' },
      { id: 8, name: 'RARES', icon: 'workspace_premium' }
    ]
  }
}

const categoryData = ref({
  id: 1,
  name: 'Bijoux & montres',
  description: '',
  image: '',
  subcategories: []
})

// Produits chargés depuis l'API
const products = ref([])

// Charger les produits depuis l'API
const loadProducts = async () => {
  isLoading.value = true
  try {
    const categoryId = parseInt(route.params.id)
    const backendCategory = categoryMapping[categoryId] || 'AUTRE'
    
    // Construire les paramètres de requête
    const params = new URLSearchParams({
      category: backendCategory,
      status: 'PUBLISHED',
    })
    
    if (searchQuery.value) {
      params.append('search', searchQuery.value)
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
    products.value = data.listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: parseFloat(listing.priceDesired),
      image: listing.photos && listing.photos.length > 0 
        ? listing.photos[0].url 
        : 'https://via.placeholder.com/400x400?text=No+Image',
      isWishlisted: wishlistIds.has(listing.id),
      subcategoryId: null, // Les sous-catégories ne sont pas gérées côté backend pour l'instant
      saleMode: listing.saleMode,
      auctionStartPrice: listing.auctionStartPrice ? parseFloat(listing.auctionStartPrice) : null,
      auctionEndAt: listing.auctionEndAt,
      categoryId: categoryId
    }))
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error)
    products.value = []
  } finally {
    isLoading.value = false
  }
}

const filteredProducts = computed(() => {
  let filtered = [...products.value]

  // Note: La recherche textuelle est déjà gérée côté serveur via l'API
  // On peut garder un filtre local pour les sous-catégories si nécessaire
  // (mais les sous-catégories ne sont pas encore implémentées côté backend)

  // Filtre par prix (déjà géré côté serveur, mais on peut aussi filtrer localement)
  // Les filtres de prix sont envoyés à l'API, donc on ne les refiltre pas ici

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

const selectSubcategory = (subcategoryId) => {
  if (selectedSubcategory.value === subcategoryId) {
    // Désélectionner si déjà sélectionné
    selectedSubcategory.value = null
  } else {
    selectedSubcategory.value = subcategoryId
  }
  // Synchroniser avec le filtre modal
  filters.value.subcategory = selectedSubcategory.value
}

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

const selectSort = (sortValue) => {
  sortBy.value = sortValue
  closeSortModal()
}

const applyFilters = () => {
  // Synchroniser la sous-catégorie sélectionnée avec le filtre
  if (filters.value.subcategory) {
    selectedSubcategory.value = filters.value.subcategory
  } else {
    selectedSubcategory.value = null
  }
  closeFilterModal()
  // Recharger les produits avec les nouveaux filtres
  loadProducts()
}

const resetFilters = () => {
  filters.value = {
    minPrice: null,
    maxPrice: null,
    subcategory: null
  }
  selectedSubcategory.value = null
  // Recharger les produits sans filtres
  loadProducts()
}

const toggleWishlist = (productId) => {
  const product = products.value.find(p => p.id === productId)
  if (product) {
    product.isWishlisted = !product.isWishlisted
    
    // Gérer le localStorage pour les favoris
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    
    if (product.isWishlisted) {
      // Ajouter aux favoris
      if (!wishlist.find(item => item.id === productId)) {
        wishlist.push({
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          categoryId: parseInt(route.params.id) // Ajouter l'ID de la catégorie
        })
      }
    } else {
      // Retirer des favoris
      wishlist = wishlist.filter(item => item.id !== productId)
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
    window.dispatchEvent(new Event('wishlist-updated'))
  }
}

const addToCart = (productId) => {
  const product = products.value.find(p => p.id === productId)
  if (product) {
    // Gérer le localStorage pour le panier
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
        categoryId: parseInt(route.params.id) // Ajouter l'ID de la catégorie
      })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
  }
}

// Watcher pour recharger les produits quand la recherche change
let searchTimeout = null
watch(searchQuery, () => {
  // Debounce pour éviter trop d'appels API
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    loadProducts()
  }, 500)
})

// Watcher pour recharger quand la catégorie change
watch(() => route.params.id, () => {
  const categoryId = parseInt(route.params.id)
  
  // Charger les données de la catégorie
  if (categoriesDatabase[categoryId]) {
    categoryData.value = categoriesDatabase[categoryId]
  } else {
    // Catégorie par défaut si l'ID n'existe pas
    categoryData.value = categoriesDatabase[1]
  }
  
  // Recharger les produits pour la nouvelle catégorie
  loadProducts()
})

onMounted(() => {
  // Récupérer l'ID de la catégorie depuis l'URL
  const categoryId = parseInt(route.params.id)
  
  // Charger les données de la catégorie
  if (categoriesDatabase[categoryId]) {
    categoryData.value = categoriesDatabase[categoryId]
  } else {
    // Catégorie par défaut si l'ID n'existe pas
    categoryData.value = categoriesDatabase[1]
  }
  
  // Charger les produits depuis l'API
  loadProducts()
})
</script>

<style scoped>
.category-page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
}

.category-page {
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

/* Section Hero Catégorie */
.category-hero {
  background-color: #ffffff;
  padding: 60px 0;
}

.category-hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.category-image {
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #e0e0e0;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-size: 3rem;
  color: #213547;
  margin: 0;
  line-height: 1.2;
}

.category-description {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 1.1rem;
  color: #666;
  line-height: 1.8;
  margin: 0;
}

/* Sous-catégories */
.subcategories-section {
  background-color: #f8ecff;
  padding: 30px 0;
}

.subcategories-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-size: 2rem;
  color: #213547;
  text-align: center;
  margin-bottom: 40px;
}

.subcategories-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.subcategory-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
  background-color: transparent;
  border: none;
}

.subcategory-card:hover {
  transform: translateY(-5px);
}

.subcategory-icon {
  font-size: 40px;
  color: #645394;
}

.subcategory-name {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 12px;
  color: #213547;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Section Produits */
.products-section {
  background-color: #ffffff;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 250px;
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

.search-input:focus {
  outline: none;
  border-color: #645394;
  background-color: #ffffff;
  color: #213547;
}

.search-input::placeholder {
  color: #999;
}

.products-actions {
  display: flex;
  gap: 12px;
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
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #213547;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover,
.sort-btn:hover {
  border-color: #645394;
  color: #645394;
  background-color: #fafafa;
}

.filter-btn .material-symbols-outlined,
.sort-btn .material-symbols-outlined {
  font-size: 20px;
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

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.product-image {
  position: relative;
  width: 100%;
  height: 250px;
  background-color: #e0e0e0;
  overflow: hidden;
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
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.wishlist-btn:hover {
  background-color: #ffffff;
  transform: scale(1.1);
}

.wishlist-btn .material-symbols-outlined {
  font-size: 24px;
  color: #666;
  transition: all 0.3s ease;
}

.wishlist-btn .material-symbols-outlined.active {
  color: #d32f2f;
  font-variation-settings: 'FILL' 1;
}

.product-content {
  padding: 20px;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 15px;
}

.product-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: #213547;
  margin: 0;
  flex: 1;
}

.product-price {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: #645394;
  white-space: nowrap;
}

.product-description {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.add-to-cart-btn {
  width: 100%;
  padding: 12px 20px;
  background-color: #000000;
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
  background-color: #1a1a1a;
  transform: translateY(-1px);
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
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.filter-modal-header,
.sort-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e0e0e0;
}

.filter-modal-header h3,
.sort-modal-header h3 {
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
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.filter-modal-close:hover,
.sort-modal-close:hover {
  background-color: #f5f5f5;
}

.filter-modal-close .material-symbols-outlined,
.sort-modal-close .material-symbols-outlined {
  font-size: 24px;
  color: #213547;
}

.filter-options {
  padding: 25px;
}

.filter-group {
  margin-bottom: 25px;
}

.filter-label {
  display: block;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #213547;
  margin-bottom: 10px;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 16px;
  background-color: #f5f5f5;
  color: #213547;
  transition: all 0.3s ease;
}

.price-input:focus {
  outline: none;
  border-color: #645394;
  background-color: #ffffff;
  color: #213547;
}

.price-input::placeholder {
  color: #999;
}

.filter-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 16px;
  background-color: #f5f5f5;
  color: #213547;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.filter-select:focus {
  outline: none;
  border-color: #645394;
  background-color: #ffffff;
  color: #213547;
}

.filter-select option {
  color: #213547;
  background-color: #ffffff;
  padding: 10px;
}

.filter-select option:checked {
  background-color: #f5f5f5;
  color: #213547;
}

.filter-modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 25px;
  border-top: 1px solid #e0e0e0;
}

.filter-reset-btn,
.filter-apply-btn {
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

.filter-reset-btn {
  background-color: #f5f5f5;
  color: #213547;
}

.filter-reset-btn:hover {
  background-color: #e0e0e0;
}

.filter-apply-btn {
  background-color: #645394;
  color: #ffffff;
}

.filter-apply-btn:hover {
  background-color: #4F4670;
}

.sort-options {
  padding: 20px 25px;
}

.sort-option {
  width: 100%;
  padding: 15px 20px;
  margin-bottom: 10px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #213547;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-option:hover {
  background-color: #fafafa;
  border-color: #645394;
}

.sort-option.active {
  background-color: #fafafa;
  border-color: #645394;
  color: #645394;
}

@media (max-width: 1024px) {
  .subcategories-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
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

.products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
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
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.filter-modal-header,
.sort-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e0e0e0;
}

.filter-modal-header h3,
.sort-modal-header h3 {
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
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.filter-modal-close:hover,
.sort-modal-close:hover {
  background-color: #f5f5f5;
}

.filter-modal-close .material-symbols-outlined,
.sort-modal-close .material-symbols-outlined {
  font-size: 24px;
  color: #213547;
}

.filter-options {
  padding: 25px;
}

.filter-group {
  margin-bottom: 25px;
}

.filter-label {
  display: block;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #213547;
  margin-bottom: 10px;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 16px;
  background-color: #f5f5f5;
  color: #213547;
  transition: all 0.3s ease;
}

.price-input:focus {
  outline: none;
  border-color: #645394;
  background-color: #ffffff;
  color: #213547;
}

.price-input::placeholder {
  color: #999;
}

.filter-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 16px;
  background-color: #f5f5f5;
  color: #213547;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.filter-select:focus {
  outline: none;
  border-color: #645394;
  background-color: #ffffff;
  color: #213547;
}

.filter-select option {
  color: #213547;
  background-color: #ffffff;
  padding: 10px;
}

.filter-select option:checked {
  background-color: #f5f5f5;
  color: #213547;
}

.filter-modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 25px;
  border-top: 1px solid #e0e0e0;
}

.filter-reset-btn,
.filter-apply-btn {
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

.filter-reset-btn {
  background-color: #f5f5f5;
  color: #213547;
}

.filter-reset-btn:hover {
  background-color: #e0e0e0;
}

.filter-apply-btn {
  background-color: #645394;
  color: #ffffff;
}

.filter-apply-btn:hover {
  background-color: #4F4670;
}

.sort-options {
  padding: 20px 25px;
}

.sort-option {
  width: 100%;
  padding: 15px 20px;
  margin-bottom: 10px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #213547;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-option:hover {
  background-color: #fafafa;
  border-color: #645394;
}

.sort-option.active {
  background-color: #fafafa;
  border-color: #645394;
  color: #645394;
}

@media (max-width: 768px) {
  .category-hero-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .category-image {
    height: 300px;
  }

  .category-title {
    font-size: 2rem;
  }

  .subcategories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
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

.products-grid {
    grid-template-columns: 1fr;
  }

  .products-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  .products-actions {
    width: 100%;
  }

  .filter-btn,
  .sort-btn {
    flex: 1;
  }
}
</style>

