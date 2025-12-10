<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="header-left">
          <router-link to="/" class="logo-link">
            <img :src="logo" alt="Purple Dog Logo" class="logo" />
          </router-link>
          <button 
            class="menu-burger" 
            :class="{ active: isMenuOpen }"
            @click="toggleMenu" 
            aria-label="Menu"
          >
            <span class="material-symbols-outlined burger-icon">menu</span>
          </button>
        </div>
        <div class="header-right">
          <router-link to="/login" class="btn-action btn-login">Connexion</router-link>
          <router-link to="/register" class="btn-action btn-signup">Inscription</router-link>
        </div>
      </div>
    </div>
    
    <!-- Menu latéral -->
    <div class="menu-overlay" :class="{ open: isMenuOpen }" @click="closeMenu"></div>
    <nav class="menu-sidebar" :class="{ open: isMenuOpen }">
      <div class="menu-header">
        <router-link to="/" class="menu-logo-link" @click="closeMenu">
          <img :src="logo" alt="Purple Dog Logo" class="menu-logo" />
        </router-link>
        <button class="menu-close" @click="closeMenu" aria-label="Fermer le menu">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div class="menu-content">
        <ul class="menu-list">
          <li class="menu-item">
            <router-link to="/" class="menu-link" @click="closeMenu">
              <span class="material-symbols-outlined menu-icon">home</span>
              <span class="menu-link-text">Accueil</span>
            </router-link>
          </li>
          <li class="menu-item">
            <router-link to="/a-propos" class="menu-link" @click="closeMenu">
              <span class="material-symbols-outlined menu-icon">info</span>
              <span class="menu-link-text">À propos</span>
            </router-link>
          </li>
          <li class="menu-item">
            <router-link to="/contact" class="menu-link" @click="closeMenu">
              <span class="material-symbols-outlined menu-icon">mail</span>
              <span class="menu-link-text">Contact</span>
            </router-link>
          </li>
          <li class="menu-item">
            <router-link to="/mentions-legales" class="menu-link" @click="closeMenu">
              <span class="material-symbols-outlined menu-icon">gavel</span>
              <span class="menu-link-text">Mentions légales</span>
            </router-link>
          </li>
        </ul>
        
        <div class="menu-auth">
          <router-link to="/login" class="menu-auth-link menu-auth-login" @click="closeMenu">
            <span class="material-symbols-outlined menu-auth-icon">login</span>
            <span>Connexion</span>
          </router-link>
          <router-link to="/register" class="menu-auth-link menu-auth-signup" @click="closeMenu">
            <span class="material-symbols-outlined menu-auth-icon">person_add</span>
            <span>Inscription</span>
          </router-link>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import logo from '@/assets/Purple dog.svg'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  // Empêcher le scroll du body quand le menu est ouvert
  if (isMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMenu = () => {
  isMenuOpen.value = false
  document.body.style.overflow = ''
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
  filter: brightness(0) saturate(100%) invert(40%) sepia(30%) saturate(2000%) hue-rotate(250deg) brightness(0.9) contrast(1.1);
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
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  position: relative;
  z-index: 101;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.menu-burger:hover {
  background-color: #f5f5f5;
}

.menu-burger.active {
  opacity: 0;
  pointer-events: none;
}

.burger-icon {
  font-size: 28px;
  color: #213547;
  transition: all 0.3s ease;
  display: block;
}

.menu-burger:hover .burger-icon {
  color: #645394;
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
  text-decoration: none;
  display: inline-block;
}

.btn-login:hover {
  background-color: rgba(33, 53, 71, 0.1);
}

.btn-signup {
  background-color: #645394;
  color: white;
  text-decoration: none;
  display: inline-block;
}

.btn-signup:hover {
  background-color: #4F4670;
}

/* Menu overlay */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 99;
}

.menu-overlay.open {
  opacity: 1;
  visibility: visible;
}

/* Menu sidebar */
.menu-sidebar {
  position: fixed;
  top: 0;
  left: -100%;
  width: 320px;
  max-width: 85vw;
  height: 100vh;
  background-color: #ffffff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  z-index: 100;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.menu-sidebar.open {
  left: 0;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.menu-logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex: 1;
}

.menu-logo {
  height: 50px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(40%) sepia(30%) saturate(2000%) hue-rotate(250deg) brightness(0.9) contrast(1.1);
}

.menu-close {
  background: none;
  border: none;
  color: #213547;
  cursor: pointer;
  padding: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 8px;
  flex-shrink: 0;
  margin-left: 15px;
}

.menu-close:hover {
  background-color: #f5f5f5;
  color: #645394;
}

.menu-close .material-symbols-outlined {
  font-size: 24px;
  display: block;
}

.menu-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.menu-item {
  margin: 0;
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 16px 25px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #213547;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.menu-icon {
  font-size: 24px;
  color: #645394;
  transition: all 0.3s ease;
}

.menu-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background-color: #645394;
  transition: width 0.3s ease;
}

.menu-link:hover {
  background-color: #fafafa;
  color: #645394;
  padding-left: 30px;
}

.menu-link:hover::before {
  width: 4px;
}

.menu-link:hover .menu-icon {
  color: #645394;
  transform: scale(1.1);
}

.menu-link.router-link-active {
  background-color: #fafafa;
  color: #645394;
  padding-left: 30px;
}

.menu-link.router-link-active::before {
  width: 4px;
}

.menu-link.router-link-active .menu-icon {
  color: #645394;
}

.menu-link-text {
  position: relative;
  z-index: 1;
}

.menu-auth {
  padding: 20px 25px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-auth-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.menu-auth-icon {
  font-size: 20px;
}

.menu-auth-login {
  background-color: transparent;
  color: #213547;
  border: 1px solid #213547;
}

.menu-auth-login:hover {
  background-color: rgba(33, 53, 71, 0.1);
  border-color: #645394;
  color: #645394;
}

.menu-auth-signup {
  background-color: #645394;
  color: white;
}

.menu-auth-signup:hover {
  background-color: #4F4670;
  transform: translateY(-1px);
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
