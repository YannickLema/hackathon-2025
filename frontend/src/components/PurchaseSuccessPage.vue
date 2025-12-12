<template>
  <div class="success-page-wrapper">
    <div class="container">
      <div class="success-content">
        <div class="success-icon">
          <span class="material-symbols-outlined">check_circle</span>
        </div>
        <h1 class="success-title">Achat confirmé !</h1>
        <p class="success-message">
          Votre achat a été confirmé avec succès. Vous recevrez un email de confirmation sous peu.
        </p>
        <div class="success-actions">
          <router-link to="/mes-objets" class="btn-primary">Voir mes achats</router-link>
          <router-link to="/produits" class="btn-secondary">Continuer les achats</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped>
.success-page-wrapper {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.container {
  max-width: 600px;
  width: 100%;
}

.success-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.success-icon {
  margin-bottom: 24px;
}

.success-icon .material-symbols-outlined {
  font-size: 80px;
  color: #4CAF50;
}

.success-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 700;
  font-size: 2rem;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.success-message {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 1rem;
  color: #6c757d;
  margin: 0 0 40px 0;
}

.success-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #645394 0%, #7B6BA3 100%);
  color: #ffffff;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 83, 148, 0.3);
}

.btn-secondary {
  background: #ffffff;
  color: #645394;
  border: 2px solid #645394;
}

.btn-secondary:hover {
  background: #f8f9fa;
}
</style>

