<template>
  <section class="about-section">
    <div class="container">
      <div class="about-card">
        <h2 class="about-title">Purple Dog</h2>
        <button class="btn-oval about-btn">Qui sommes-nous ?</button>
        <p class="about-description">
          Purple Dog est une plateforme de vente en ligne spécialisée dans la mise en relation entre vendeurs et acheteurs d'objets de valeur. 
          Que vous souhaitiez vendre des bijoux anciens, des œuvres d'art, des meubles de collection ou tout autre objet précieux, 
          notre plateforme vous offre un espace sécurisé et de confiance pour réaliser vos transactions. 
          Nous mettons un point d'honneur à garantir l'authenticité et la qualité des objets proposés, tout en offrant une expérience 
          d'achat et de vente simple et transparente. Rejoignez notre communauté de passionnés et découvrez un nouveau moyen de valoriser 
          vos objets de collection.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.about-section {
  padding: 20px 0;
}

.about-card {
  background-color: transparent;
  padding: 0;
  border: none;
}

.about-title {
  font-family: 'Georgia', serif;
  font-weight: 700; /* Bold - H1 */
  font-style: normal;
  font-size: 3rem;
  color: #213547;
  margin-bottom: 20px;
}

.about-btn {
  background-color: #E07A5F;
  color: white;
  margin-bottom: 20px;
}

.about-description {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200; /* ExtraLight - Paragraphe */
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  width: 100%;
}

@media (max-width: 768px) {
  .about-title {
    font-size: 2rem;
  }
}
</style>
