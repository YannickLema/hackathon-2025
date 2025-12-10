<template>
  <section class="newsletter-section">
    <div class="newsletter-background">
      <div class="image-overlay"></div>
      <div class="newsletter-content">
        <div class="form-content">
          <h2 class="newsletter-title">Rester informés</h2>
          <form @submit.prevent="handleSubmit" class="newsletter-form">
            <div class="email-row">
              <input 
                type="email" 
                v-model="email"
                placeholder="Votre adresse email"
                class="email-input"
                required
              />
              <button type="submit" class="btn-rect submit-btn">S'abonner</button>
            </div>
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="acceptTerms"
                required
              />
              <span>J'ai lu et j'accepte que mes donnees soit utillisees</span>
            </label>
          </form>
        </div>
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
  margin: 0;
  padding: 0;
  margin-bottom: 0 !important;
  width: 100%;
}

.newsletter-background {
  background-image: url('https://cdn.pixabay.com/photo/2016/11/29/02/26/library-1866844_1280.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  width: 100%;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.7) 100%);
}

.newsletter-content {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 40px 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-content {
  width: 100%;
  max-width: 800px;
}

.newsletter-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600; /* Semibold - Caption */
  font-style: normal;
  font-size: 2rem;
  color: #ffffff;
  margin-bottom: 20px;
  line-height: 1.2;
}

.newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.email-row {
  display: flex;
  gap: 15px;
  width: 100%;
  align-items: stretch;
}

.email-input {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200; /* ExtraLight - Paragraphe */
  padding: 12px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 16px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #213547;
  flex: 1;
}

.email-input::placeholder {
  color: #999;
}

.email-input:focus {
  outline: 2px solid #645394;
  border-color: #645394;
  background-color: #ffffff;
}

.checkbox-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600; /* Semibold - Caption */
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #ffffff;
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

.submit-btn {
  background-color: #645394;
  color: white;
  white-space: nowrap;
  flex-shrink: 0;
}

.submit-btn:hover {
  background-color: #4F4670;
}

@media (max-width: 768px) {
  .newsletter-background {
    min-height: 220px;
  }
  
  .newsletter-content {
    padding: 30px 20px;
  }
  
  .newsletter-title {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }
  
  .newsletter-form {
    gap: 12px;
  }
  
  .email-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .submit-btn {
    width: 100%;
  }
}
</style>
