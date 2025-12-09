<template>
  <section class="featured-product">
    <div class="container">
      <div class="product-card">
        <div class="product-image">
          <div class="image-placeholder">
            <!-- Placeholder pour l'image du produit -->
          </div>
        </div>
        <div class="product-info">
          <button class="btn-oval category-btn">Catégorie</button>
          <h1 class="product-title">Titre du produit</h1>
          <p class="product-description">
            Description de l'objet et des resultats passés
          </p>
          <div class="carousel-nav">
            <button class="nav-btn" @click="previousImage">‹</button>
            <button class="nav-btn" @click="nextImage">›</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const currentImage = ref(0)

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
  padding: 40px 0;
}

.product-card {
  background-color: white;
  border-radius: 8px;
  padding: 40px;
  display: flex;
  gap: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-image {
  flex: 1;
}

.image-placeholder {
  width: 100%;
  aspect-ratio: 1;
  background-color: #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-btn {
  background-color: #6c63ff;
  color: white;
  align-self: flex-start;
}

.product-title {
  font-family: 'Georgia', serif;
  font-weight: 700; /* Bold - H1 */
  font-style: normal;
  font-size: 2.5rem;
  color: #213547;
  margin: 0;
}

.product-description {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200; /* ExtraLight - Paragraphe */
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  flex: 1;
}

.carousel-nav {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f0f0f0;
  border: none;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.nav-btn:hover {
  background-color: #e0e0e0;
}

@media (max-width: 768px) {
  .product-card {
    flex-direction: column;
    padding: 20px;
  }
  
  .product-title {
    font-size: 1.8rem;
  }
}
</style>
