<template>
  <section class="featured-product">
    <div class="container">
      <div class="carousel-layout">
        <!-- Colonne de gauche avec texte -->
        <div class="text-column">
          <div class="carousel-nav">
            <button class="nav-btn" @click="previousImage">‹</button>
            <button class="nav-btn" @click="nextImage">›</button>
          </div>
          <h1 class="product-title">Les produits en vedette</h1>
          <p class="product-description">
            Découvrez les produits en vedette de Purple Dog, selectionnés pour leur qualité et leur valeur.
          </p>
          <button class="cta-button">VOIR TOUS LES PRODUITS</button>
        </div>
        
        <!-- Colonnes d'images à droite -->
        <div class="images-column">
          <div class="image-card">
            <img 
              :src="featuredImages[0].image" 
              :alt="featuredImages[0].title"
              class="card-image"
            />
            <div class="image-overlay">
              <h3 class="overlay-title">{{ featuredImages[0].title }}</h3>
              <span class="overlay-link">EXPLORER ></span>
            </div>
          </div>
          <div class="image-card">
            <img 
              :src="featuredImages[1].image" 
              :alt="featuredImages[1].title"
              class="card-image"
            />
            <div class="image-overlay">
              <h3 class="overlay-title">{{ featuredImages[1].title }}</h3>
              <span class="overlay-link">EXPLORER ></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const currentImage = ref(0)

// Exemples d'images - Remplacez par des URLs depuis Pixabay ou Catawiki
// Pixabay: https://pixabay.com/fr/
// Catawiki: https://www.catawiki.com/fr/
const featuredImages = ref([
  {
    id: 1,
    title: 'Bijoux de collection',
    // Exemple: Remplacez par une URL Pixabay d'un bijou
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1200&fit=crop',
    category: 'Bijoux & montres'
  },
  {
    id: 2,
    title: 'Objets d\'art précieux',
    // Exemple: Remplacez par une URL Pixabay d'un objet d'art
    image: 'https://cdn.pixabay.com/photo/2018/11/30/18/53/church-3848348_1280.jpg',
    category: 'Objets d\'art & tableaux'
  }
])

const nextImage = () => {
  // Logique pour passer à l'image suivante
  console.log('Image suivante')
}

const previousImage = () => {
  // Logique pour passer à l'image précédente
  console.log('Image précédente')
}
</script>

<style scoped>
.featured-product {
  padding: 60px 0;
}

.carousel-layout {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 30px;
  align-items: stretch;
}

/* Colonne de texte à gauche */
.text-column {
  background-color: #fafafa;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-self: stretch;
}

.carousel-nav {
  display: flex;
  gap: 10px;
  align-self: flex-start;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  font-size: 20px;
  color: #213547;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background-color: #f5f5f5;
  border-color: #ccc;
}

.product-title {
  font-family: 'Georgia', serif;
  font-weight: 700; /* Bold - H1 */
  font-style: normal;
  font-size: 2.5rem;
  color: #213547;
  margin: 0;
  line-height: 1.2;
}

.product-description {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200; /* ExtraLight - Paragraphe */
  font-size: 1.1rem;
  color: #213547;
  line-height: 1.6;
  flex: 1;
}

.cta-button {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600; /* Semibold - Caption */
  background-color: #213547;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 20px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  align-self: flex-start;
}

.cta-button:hover {
  background-color: #2a3f57;
}

/* Colonnes d'images à droite */
.images-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  grid-column: span 2;
  align-items: stretch;
  height: 100%;
}

.image-card {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 30px 20px 20px;
  color: white;
}

.overlay-title {
  font-family: 'Georgia', serif;
  font-weight: 400;
  font-style: italic;
  font-size: 1.8rem;
  margin: 0 0 8px 0;
  color: white;
}

.overlay-link {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600; /* Semibold - Caption */
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: white;
  display: block;
}

@media (max-width: 1024px) {
  .carousel-layout {
    grid-template-columns: 1fr;
  }
  
  .images-column {
    grid-column: span 1;
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .text-column {
    padding: 30px 20px;
  }
  
  .product-title {
    font-size: 2rem;
  }
  
  .product-description {
    font-size: 1rem;
  }
}
</style>
