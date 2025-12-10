<template>
  <div>
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
import Header from './Header.vue'
import FeaturedProduct from './FeaturedProduct.vue'
import Categories from './Categories.vue'
import AboutSection from './AboutSection.vue'
import NewsletterSection from './NewsletterSection.vue'
import Footer from './Footer.vue'
</script>

<style scoped>
main {
  flex: 1;
}
</style>

