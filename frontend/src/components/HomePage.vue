<template>
  <div>
    <FeaturedProduct />
    <Categories />
    <AboutSection />
    <NewsletterSection />
  </div>
</template>

<script setup>
import FeaturedProduct from './FeaturedProduct.vue'
import Categories from './Categories.vue'
import AboutSection from './AboutSection.vue'
import NewsletterSection from './NewsletterSection.vue'
</script>

<style scoped>
main {
  flex: 1;
}
</style>

