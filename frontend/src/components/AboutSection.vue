<template>
  <section class="about-section">
    <div class="container">
      <div class="about-card">
        <h2 class="about-title">Purple Dog</h2>
        <button class="btn-oval about-btn">Qui sommes-nous ?</button>
        <p class="about-description">
          Presentation de Purple Dog pour meiux vendre les objets de valeurs a des tiers de confiance.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.about-section {
  padding: 40px 0;
}

.about-card {
  background-color: white;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  background-color: #6c63ff;
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
  .about-card {
    padding: 20px;
  }
  
  .about-title {
    font-size: 2rem;
  }
}
</style>
