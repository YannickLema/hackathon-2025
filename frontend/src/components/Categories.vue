<template>
  <section class="categories">
    <div class="container">
      <div class="categories-grid">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="category-card"
          :style="{ backgroundImage: `url(${category.image})` }"
        >
          <h3 class="category-name">{{ category.name }}</h3>
          <div class="category-overlay"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const categories = ref([
  // Bijoux & montres - image de bijoux/montres
  { id: 1, name: 'Bijoux & montres', image: 'https://cdn.pixabay.com/photo/2014/03/06/21/57/coffer-281251_1280.jpg' },
  // Meubles anciens - image de meubles vintage
  { id: 2, name: 'Meubles anciens', image: 'https://cdn.pixabay.com/photo/2017/07/11/12/11/chair-backrest-2493326_1280.jpg' },
  // Objets d'art & tableaux - image de peinture/tableau
  { id: 3, name: 'Objets d\'art & tableaux', image: 'https://cdn.pixabay.com/photo/2018/11/30/18/53/church-3848348_1280.jpg' },
  // Objets de collection - image d'objets vintage/collection
  { id: 4, name: 'Objets de collection', image: 'https://cdn.pixabay.com/photo/2016/08/15/16/48/vinyl-1595847_1280.jpg' },
  // Vins & spiritueux - image de bouteilles de vin
  { id: 5, name: 'Vins & spiritueux de collection', image: 'https://cdn.pixabay.com/photo/2023/10/28/06/40/wine-8346641_1280.jpg' },
  // Instruments de musique - image d'instrument
  { id: 6, name: 'Instruments de musique', image: 'https://cdn.pixabay.com/photo/2020/12/09/18/42/violin-5818267_1280.jpg' },
  // Livres anciens - image de livres vintage
  { id: 7, name: 'Livres anciens & manuscrits', image: 'https://cdn.pixabay.com/photo/2014/09/05/18/32/old-books-436498_1280.jpg' },
  // Accessoires de luxe - image de sac/marque de luxe
  { id: 8, name: 'Accessoires de luxe', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop' },
  // Horlogerie & pendules - image de pendule/montre
  { id: 9, name: 'Horlogerie & pendules', image: 'https://cdn.pixabay.com/photo/2021/09/28/14/21/clocks-6664622_1280.jpg' },
  // Photographie anciennes - image d'appareil photo vintage
  { id: 10, name: 'Photographie anciennes', image: 'https://cdn.pixabay.com/photo/2015/04/07/14/34/camera-711040_1280.jpg' },
  // Vaisselle, argenterie & cristallerie - image de vaisselle/argenterie
  { id: 11, name: 'Vaisselle, argenterie & cristallerie', image: 'https://cdn.pixabay.com/photo/2018/06/18/18/04/dishes-3483005_1280.jpg' },
  // Sculptures & objets decoratifs - image de sculpture
  { id: 12, name: 'Sculptures & objets decoratifs', image: 'https://cdn.pixabay.com/photo/2021/12/30/16/46/bells-6904308_1280.jpg' },
  // Vehicules de collection - image de voiture ancienne
  { id: 13, name: 'Vehicules de collection', image: 'https://cdn.pixabay.com/photo/2019/08/08/23/33/car-4393990_1280.jpg' }
])
</script>

<style scoped>
.categories {
  padding: 20px 0;
}

.categories-grid {
  background-color: transparent;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  box-shadow: none;
  border: none;
}

.category-card {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  aspect-ratio: 1;
  padding: 20px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: none;
  border: none;
  overflow: hidden;
}

.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%);
  opacity: 1;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-card:hover {
  transform: translateY(-3px);
}

.category-card:hover .category-overlay {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.35) 100%);
}

.category-name {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600; /* Semibold - Caption */
  font-size: 14px;
  color: white;
  text-align: center;
  margin: 0;
  line-height: 1.4;
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
}

.category-card:hover .category-name {
  color: white;
}

@media (max-width: 1200px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }
  
  .category-card {
    padding: 15px;
  }
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 0;
  }
  
  .category-card {
    padding: 12px;
  }
  
  .category-name {
    font-size: 12px;
  }
}
</style>
