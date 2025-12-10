<template>
  <div class="category-page-wrapper">
    <Header />
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
            <div 
              v-for="subcategory in categoryData.subcategories" 
              :key="subcategory.id"
              class="subcategory-card"
            >
              <span class="material-symbols-outlined subcategory-icon">{{ subcategory.icon }}</span>
              <span class="subcategory-name">{{ subcategory.name }}</span>
            </div>
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
              <button class="filter-btn">
                <span class="material-symbols-outlined">tune</span>
                <span>Filtre</span>
              </button>
              <button class="sort-btn">
                <span class="material-symbols-outlined">sort</span>
                <span>Trier par</span>
              </button>
            </div>
          </div>

          <div class="products-grid">
            <div 
              v-for="product in filteredProducts" 
              :key="product.id"
              class="product-card"
            >
              <div class="product-image">
                <img :src="product.image" :alt="product.title" />
                <button class="wishlist-btn" @click="toggleWishlist(product.id)">
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
                <button class="add-to-cart-btn" @click="addToCart(product.id)">
                  Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter -->
      <NewsletterSection />
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Header from './Header.vue'
import Footer from './Footer.vue'
import NewsletterSection from './NewsletterSection.vue'

const route = useRoute()
const searchQuery = ref('')

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
      { id: 4, name: 'COLLIERS', icon: 'necklace' },
      { id: 5, name: 'BRACELETS', icon: 'watch' },
      { id: 6, name: 'BAGUES', icon: 'ring' },
      { id: 7, name: 'BOUCLES D\'OREILLES', icon: 'hearing' },
      { id: 8, name: 'BROCHES', icon: 'pin' }
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
      { id: 4, name: 'ARMORES', icon: 'wardrobe' },
      { id: 5, name: 'COMMODES', icon: 'dresser' },
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
      { id: 3, name: 'SCULPTURES', icon: 'sculpture' },
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
      { id: 7, name: 'MURALE', icon: 'wallpaper' },
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
      { id: 2, name: 'BRONZE', icon: 'sculpture' },
      { id: 3, name: 'MARBRE', icon: 'sculpture' },
      { id: 4, name: 'TERRE CUITE', icon: 'sculpture' },
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
      { id: 5, name: 'SPORTIVES', icon: 'speed' },
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

// Produits (à remplacer par un appel API)
const products = ref([
  {
    id: 1,
    title: 'Titre produit',
    description: 'Description du produit',
    price: 150,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
    isWishlisted: false
  },
  {
    id: 2,
    title: 'Titre produit',
    description: 'Description du produit',
    price: 200,
    image: 'https://cdn.pixabay.com/photo/2018/11/30/18/53/church-3848348_1280.jpg',
    isWishlisted: false
  },
  {
    id: 3,
    title: 'Titre produit',
    description: 'Description du produit',
    price: 175,
    image: 'https://cdn.pixabay.com/photo/2017/07/11/12/11/chair-backrest-2493326_1280.jpg',
    isWishlisted: false
  },
  {
    id: 4,
    title: 'Titre produit',
    description: 'Description du produit',
    price: 300,
    image: 'https://cdn.pixabay.com/photo/2023/10/28/06/40/wine-8346641_1280.jpg',
    isWishlisted: false
  },
  {
    id: 5,
    title: 'Titre produit',
    description: 'Description du produit',
    price: 250,
    image: 'https://cdn.pixabay.com/photo/2020/12/09/18/42/violin-5818267_1280.jpg',
    isWishlisted: false
  },
  {
    id: 6,
    title: 'Titre produit',
    description: 'Description du produit',
    price: 180,
    image: 'https://cdn.pixabay.com/photo/2014/09/05/18/32/old-books-436498_1280.jpg',
    isWishlisted: false
  },
  {
    id: 7,
    title: 'Titre produit',
    description: 'Description du produit',
    price: 220,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop',
    isWishlisted: false
  },
  {
    id: 8,
    title: 'Titre produit',
    description: 'Description du produit',
    price: 190,
    image: 'https://cdn.pixabay.com/photo/2021/09/28/14/21/clocks-6664622_1280.jpg',
    isWishlisted: false
  },
  {
    id: 9,
    title: 'Titre produit',
    description: 'Description du produit',
    price: 160,
    image: 'https://cdn.pixabay.com/photo/2015/04/07/14/34/camera-711040_1280.jpg',
    isWishlisted: false
  }
])

const filteredProducts = computed(() => {
  if (!searchQuery.value) {
    return products.value
  }
  const query = searchQuery.value.toLowerCase()
  return products.value.filter(product => 
    product.title.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query)
  )
})

const toggleWishlist = (productId) => {
  const product = products.value.find(p => p.id === productId)
  if (product) {
    product.isWishlisted = !product.isWishlisted
  }
}

const addToCart = (productId) => {
  console.log('Ajouter au panier:', productId)
  // TODO: Implémenter l'ajout au panier
}

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
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #645394;
  background-color: #ffffff;
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

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.product-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.product-card:hover {
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

@media (max-width: 1024px) {
  .subcategories-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
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

