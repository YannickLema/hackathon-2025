<template>
  <header class="header">
    <div class="container">
      <button class="btn-homepage">Homepage</button>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.header {
  background-color: #2a2a2a;
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.btn-homepage {
  background-color: #3a3a3a;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-homepage:hover {
  background-color: #4a4a4a;
}
</style>
