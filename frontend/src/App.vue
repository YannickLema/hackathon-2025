<template>
  <div id="app">
    <Header />
    <main>
      <FeaturedProduct />
      <Categories />
      <AboutSection />
      <NewsletterSection />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import FeaturedProduct from './components/FeaturedProduct.vue'
import Categories from './components/Categories.vue'
import AboutSection from './components/AboutSection.vue'
import NewsletterSection from './components/NewsletterSection.vue'
import Footer from './components/Footer.vue'
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>