<template>
  <section class="about-section">
    <div class="container">
      <div class="about-card">
        <h2 class="about-title">Purple Dog</h2>
        <button class="btn-oval about-btn">Qui sommes-nous ?</button>
        <p class="about-description">
          Purple Dog est une plateforme de vente en ligne qui permet aux utilisateurs de vendre des objets de valeur à des tiers de confiance.
          Nous sommes une équipe de passionnés qui aime partager nos objets de valeur avec le monde.
          Nous sommes basés à Paris, France. Nous sommes ouverts à tous les utilisateurs qui souhaitent vendre des objets de valeur.
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
  box-shadow: none;
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
  max-width: 800px;
}

@media (max-width: 768px) {
  .about-title {
    font-size: 2rem;
  }
}
</style>
