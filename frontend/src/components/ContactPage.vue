<template>
  <div class="contact-page-wrapper">
    <div class="contact-page">
      <div class="contact-container">
        <h1 class="contact-title">Nous contacter</h1>
        <p class="contact-description">
          Vous avez des questions ou souhaitez en savoir plus sur nos services ? N'hésitez pas à nous contacter. Notre équipe vous répondra dans les plus brefs délais.
        </p>
        
        <form @submit.prevent="handleSubmit" class="contact-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName" class="form-label">Prénom<span class="required-asterisk">*</span></label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                class="form-input"
                placeholder="Votre prénom"
                required
              />
            </div>
            <div class="form-group">
              <label for="lastName" class="form-label">Nom<span class="required-asterisk">*</span></label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                class="form-input"
                placeholder="Votre nom"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email<span class="required-asterisk">*</span></label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="votre.email@exemple.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="subject" class="form-label">Sujet<span class="required-asterisk">*</span></label>
            <select
              id="subject"
              v-model="form.subject"
              class="form-input form-select"
              required
            >
              <option value="">Sélectionner un sujet</option>
              <option value="question">Question générale</option>
              <option value="vendre">Je souhaite vendre un objet</option>
              <option value="acheter">Je souhaite acheter un objet</option>
              <option value="particulier">Inscription particulier</option>
              <option value="professionnel">Inscription professionnel</option>
              <option value="technique">Problème technique</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div class="form-group">
            <label for="message" class="form-label">Message<span class="required-asterisk">*</span></label>
            <textarea
              id="message"
              v-model="form.message"
              class="form-input form-textarea"
              placeholder="Votre message..."
              rows="6"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="form.rgpdAccepted"
                required
              />
              <span>J'ai lu et j'accepte les conditions d'utilisation des données personnelles.<span class="required-asterisk">*</span></span>
            </label>
          </div>

          <button type="submit" class="submit-button" :disabled="isLoading">
            {{ isLoading ? 'Envoi en cours...' : 'Envoyer le message' }}
          </button>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div v-if="success" class="success-message">
            {{ success }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  subject: '',
  message: '',
  rgpdAccepted: false
})

const isLoading = ref(false)
const error = ref('')
const success = ref('')

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const handleSubmit = async () => {
  error.value = ''
  success.value = ''
  isLoading.value = true

  try {
    const response = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'envoi du message')
    }

    success.value = 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
    
    // Réinitialiser le formulaire
    form.firstName = ''
    form.lastName = ''
    form.email = ''
    form.subject = ''
    form.message = ''
    form.rgpdAccepted = false
  } catch (err) {
    error.value = err.message || 'Une erreur est survenue lors de l\'envoi du message.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.contact-page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.contact-page {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 60px 20px;
  background-color: #ffffff;
}

.contact-container {
  width: 100%;
  max-width: 800px;
}

.contact-title {
  font-family: 'Georgia', sans-serif;
  font-weight: 600;
  font-size: 2.5rem;
  color: #000000;
  text-align: center;
  margin-bottom: 20px;
}

.contact-description {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 1rem;
  color: #666;
  text-align: center;
  margin-bottom: 40px;
  line-height: 1.6;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 40px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23213547' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: 'Be Vietnam Pro', sans-serif;
}

.checkbox-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #213547;
  font-size: 14px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin-top: 3px;
  cursor: pointer;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.submit-button {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 16px;
  padding: 14px 28px;
  background-color: #645394;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-button:hover:not(:disabled) {
  background-color: #4F4670;
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message,
.success-message {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.error-message {
  color: #d32f2f;
  background-color: #ffebee;
}

.success-message {
  color: #2e7d32;
  background-color: #e8f5e9;
}

.contact-info-section {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid #e0e0e0;
}

.required-asterisk {
  color: #d32f2f;
  margin-left: 4px;
}

@media (max-width: 768px) {
  .contact-container {
    padding: 40px 30px;
  }

  .contact-title {
    font-size: 2rem;
    margin-bottom: 15px;
  }

  .contact-description {
    font-size: 0.9rem;
    margin-bottom: 30px;
  }

  .contact-form {
    gap: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>

