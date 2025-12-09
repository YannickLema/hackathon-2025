<template>
  <section class="categories">
    <div class="container">
      <div class="categories-grid">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="category-card"
        >
          <div class="category-placeholder"></div>
          <h3 class="category-name">{{ category.name }}</h3>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const categories = ref([
  { id: 1, name: 'Bijoux & montres' },
  { id: 2, name: 'Meubles anciens' },
  { id: 3, name: 'Objets d\'art & tableaux' },
  { id: 4, name: 'Objets de collection' },
  { id: 5, name: 'Vins & spiritueux de collection' },
  { id: 6, name: 'Instruments de musique' },
  { id: 7, name: 'Livres anciens & manuscrits' },
  { id: 8, name: 'Accessoires de luxe' },
  { id: 9, name: 'Horlogerie & pendules' },
  { id: 10, name: 'Photographie anciennes' },
  { id: 11, name: 'Vaisselle, argenterie & cristallerie' },
  { id: 12, name: 'Sculptures & objets decoratifs' },
  { id: 13, name: 'Vehicules de collection' }
])
</script>

<style scoped>
.categories {
  padding: 40px 0;
}

.categories-grid {
  background-color: white;
  border-radius: 8px;
  padding: 40px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
}

.category-placeholder {
  width: 100%;
  aspect-ratio: 1;
  background-color: #e0e0e0;
  border-radius: 8px;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #213547;
  text-align: center;
  margin: 0;
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
    padding: 20px;
  }
}
</style>
