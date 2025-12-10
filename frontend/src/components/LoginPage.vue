<template>
  <div class="login-page-wrapper">
    <Header />
    <div class="login-page">
    <div class="login-container">
      <h1 class="login-title">Connexion</h1>
      
      <!-- Toggle Particulier/Professionnel -->
      <div class="user-type-toggle">
        <button 
          :class="['toggle-option', { active: userType === 'particulier' }]"
          @click="userType = 'particulier'"
        >
          Particulier
        </button>
        <button 
          :class="['toggle-option', { active: userType === 'professionnel' }]"
          @click="userType = 'professionnel'"
        >
          Professionnel
        </button>
      </div>

      <!-- Formulaire de connexion -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="Votre adresse email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Mot de passe</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="Votre mot de passe"
            required
          />
        </div>

        <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">
          J'ai oublié mon mot de passe
        </a>

        <button type="submit" class="login-button" :disabled="isLoading">
          {{ isLoading ? 'Connexion...' : 'Se connecter' }}
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from './Header.vue'
import Footer from './Footer.vue'

const userType = ref('particulier')
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erreur de connexion')
    }

    // Stocker le token si présent
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user || {}))
    }

    // Redirection après connexion réussie
    window.location.href = '/'
  } catch (err) {
    error.value = err.message || 'Une erreur est survenue lors de la connexion'
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = () => {
  // TODO: Implémenter la récupération de mot de passe
  console.log('Mot de passe oublié')
}
</script>

<style scoped>
.login-page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.login-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: #ffffff;
}

.login-container {
  width: 100%;
  max-width: 450px;
  background-color: #ffffff;
  padding: 50px 40px;
  border-radius: 12px;
}

.login-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 2.5rem;
  color: #000000;
  text-align: center;
  margin-bottom: 40px;
}

/* Toggle Particulier/Professionnel */
.user-type-toggle {
  display: flex;
  gap: 0;
  margin-bottom: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.toggle-option {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background-color: transparent;
  color: #213547;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 0;
}

.toggle-option:first-child {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.toggle-option:last-child {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.toggle-option.active {
  background-color: #645394;
  color: #ffffff;
}

.toggle-option:not(.active):hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Formulaire */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #213547;
}

.form-input {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 16px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f5f5f5;
  color: #213547;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #645394;
  background-color: #ffffff;
}

.form-input::placeholder {
  color: #999;
}

.forgot-password {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #000000;
  text-decoration: underline;
  align-self: flex-start;
  cursor: pointer;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #645394;
}

.login-button {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 16px;
  padding: 14px 28px;
  background-color: #000000;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-button:hover:not(:disabled) {
  background-color: #1a1a1a;
  transform: translateY(-1px);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #d32f2f;
  padding: 12px;
  background-color: #ffebee;
  border-radius: 8px;
  text-align: center;
}

@media (max-width: 768px) {
  .login-container {
    padding: 40px 30px;
  }

  .login-title {
    font-size: 2rem;
    margin-bottom: 30px;
  }

  .user-type-toggle {
    margin-bottom: 30px;
  }

  .toggle-option {
    padding: 10px 16px;
    font-size: 13px;
  }

  .login-form {
    gap: 20px;
  }
}
</style>

