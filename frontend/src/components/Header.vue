<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="header-left">
          <a href="/" class="logo-link">
            <img :src="logo" alt="Purple Dog Logo" class="logo" />
          </a>
          <button class="menu-burger" @click="toggleMenu" aria-label="Menu">
            <span class="burger-line"></span>
            <span class="burger-line"></span>
            <span class="burger-line"></span>
          </button>
        </div>
        <div class="header-right">
          <button class="btn-action btn-login">Connexion</button>
          <button class="btn-action btn-signup">Inscription</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import logo from '@/assets/Purple dog.svg'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  // Logique pour ouvrir/fermer le menu
  console.log('Menu:', isMenuOpen.value ? 'ouvert' : 'fermé')
}
</script>

<style scoped>
.header {
  background-color: #ffffff;
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #e0e0e0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo-link {
  display: inline-block;
  text-decoration: none;
  cursor: pointer;
}

.logo {
  height: 60px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(60%) sepia(50%) saturate(2000%) hue-rotate(350deg) brightness(0.9) contrast(1.1);
  transition: opacity 0.3s ease;
}

.logo-link:hover .logo {
  opacity: 0.8;
}

.menu-burger {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
}

.burger-line {
  width: 24px;
  height: 2px;
  background-color: #213547;
  transition: all 0.3s ease;
  display: block;
}

.menu-burger:hover .burger-line {
  background-color: #E07A5F;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-action {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600; /* Semibold - Caption */
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-login {
  background-color: transparent;
  color: #213547;
  border: 1px solid #213547;
  border-radius: 20px;
}

.btn-login:hover {
  background-color: rgba(33, 53, 71, 0.1);
}

.btn-signup {
  background-color: #E07A5F;
  color: white;
}

.btn-signup:hover {
  background-color: #D2691E;
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
  }
  
  .logo {
    height: 50px;
  }
  
  .header-right {
    gap: 10px;
  }
  
  .btn-action {
    padding: 8px 16px;
    font-size: 12px;
  }
}
</style>
