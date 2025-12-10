<template>
  <div class="forgot-password-page-wrapper">
    <div class="forgot-password-page">
      <div class="forgot-password-container">
        <h1 class="forgot-password-title">Mot de passe oublié</h1>
        
        <p class="forgot-password-description">
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        <form @submit.prevent="handleForgotPassword" class="forgot-password-form">
          <div class="form-group">
            <label for="email" class="form-label">Email<span class="required-asterisk">*</span></label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="Votre adresse email"
              required
            />
          </div>

          <button type="submit" class="submit-button" :disabled="isLoading">
            {{ isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation' }}
          </button>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div v-if="success" class="success-message">
            {{ success }}
          </div>
        </form>

        <div class="back-to-login">
          <router-link to="/login" class="back-link">
            ← Retour à la connexion
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const isLoading = ref(false)
const error = ref('')
const success = ref('')

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const handleForgotPassword = async () => {
  error.value = ''
  success.value = ''
  isLoading.value = true

  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'envoi de l\'email')
    }

    success.value = 'Un email de réinitialisation a été envoyé à votre adresse email.'
    email.value = ''
  } catch (err) {
    error.value = err.message || 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.forgot-password-page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 80px);
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.forgot-password-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  width: 100%;
  padding: 40px 20px;
  background-color: #ffffff;
}

.forgot-password-container {
  width: 100%;
  max-width: 450px;
  background-color: #ffffff;
  padding: 50px 40px;
  border-radius: 12px;
}

.forgot-password-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-style: normal;
  font-size: 2.5rem;
  color: #000000;
  text-align: center;
  margin-bottom: 20px;
}

.forgot-password-description {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 1rem;
  color: #666;
  text-align: center;
  margin-bottom: 40px;
  line-height: 1.6;
}

.forgot-password-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.form-label .required-asterisk {
  color: #d32f2f;
  margin-left: 4px;
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

.submit-button {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 16px;
  padding: 14px 28px;
  background-color: #000000;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-button:hover:not(:disabled) {
  background-color: #1a1a1a;
  transform: translateY(-1px);
}

.submit-button:disabled {
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

.success-message {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #2e7d32;
  padding: 12px;
  background-color: #e8f5e9;
  border-radius: 8px;
  text-align: center;
}

.back-to-login {
  margin-top: 30px;
  text-align: center;
}

.back-link {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #645394;
  text-decoration: none;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #4F4670;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .forgot-password-container {
    padding: 40px 30px;
  }
  
  .forgot-password-title {
    font-size: 2rem;
    margin-bottom: 15px;
  }
  
  .forgot-password-description {
    font-size: 0.9rem;
    margin-bottom: 30px;
  }
  
  .forgot-password-form {
    gap: 15px;
  }
}
</style>

