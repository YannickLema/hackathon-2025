<template>
  <section class="newsletter-section">
    <div class="container">
      <div class="newsletter-card">
        <h2 class="newsletter-title">Rester informés</h2>
        <form @submit.prevent="handleSubmit" class="newsletter-form">
          <input 
            type="email" 
            v-model="email"
            placeholder="Votre adresse email"
            class="email-input"
            required
          />
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="acceptTerms"
              required
            />
            <span>J'ai lu et j'accepte que mes donnees soit utillisees</span>
          </label>
          <button type="submit" class="btn-rect submit-btn">S'abonner</button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const acceptTerms = ref(false)

const handleSubmit = () => {
  if (acceptTerms.value && email.value) {
    console.log('Newsletter subscription:', email.value)
    // Logique d'abonnement à la newsletter
    email.value = ''
    acceptTerms.value = false
  }
}
</script>

<style scoped>
.newsletter-section {
  padding: 40px 0;
}

.newsletter-card {
  background-color: #3a3a3a;
  padding: 40px;
  position: relative;
  overflow: hidden;
  box-shadow: none;
  border: none;
}

.newsletter-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100%;
  background: linear-gradient(135deg, transparent 0%, transparent 50%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.1) 100%);
  transform: skewX(-20deg);
  transform-origin: top left;
}

.newsletter-title {
  font-family: 'Georgia', serif;
  font-weight: 400;
  font-style: italic; /* H2 - Georgia Italic */
  font-size: 2rem;
  color: white;
  margin-bottom: 30px;
}

.newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 500px;
}

.email-input {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200; /* ExtraLight - Paragraphe */
  padding: 12px 16px;
  border-radius: 20px;
  border: none;
  font-size: 16px;
  background-color: #4a4a4a;
  color: white;
}

.email-input::placeholder {
  color: #aaa;
}

.email-input:focus {
  outline: 2px solid #E07A5F;
}

.checkbox-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600; /* Semibold - Caption */
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin-top: 3px;
  cursor: pointer;
}

.submit-btn {
  background-color: #E07A5F;
  color: white;
  align-self: flex-start;
}

.submit-btn:hover {
  background-color: #D2691E;
}

@media (max-width: 768px) {
  .newsletter-card {
    padding: 20px;
  }
  
  .newsletter-title {
    font-size: 1.5rem;
  }
}
</style>
