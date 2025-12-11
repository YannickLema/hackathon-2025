<template>
  <div class="payment-page-wrapper">
    <div class="container">
      <!-- Breadcrumb -->
      <div class="breadcrumb-section">
        <router-link to="/dashboard/professionnel" class="breadcrumb-link">
          <span class="material-symbols-outlined">arrow_back</span>
          <span>Retour au tableau de bord</span>
        </router-link>
      </div>

      <div class="payment-content">
        <div class="payment-header">
          <h1 class="page-title">Méthode de paiement</h1>
          <p class="page-subtitle">
            Ajoutez une carte bancaire pour pouvoir enchérir et acheter des objets sur la plateforme
          </p>
        </div>

        <!-- Status Card -->
        <div v-if="paymentStatus" class="status-card" :class="{ success: paymentStatus.hasPaymentMethod, warning: !paymentStatus.hasPaymentMethod }">
          <div class="status-icon">
            <span v-if="paymentStatus.hasPaymentMethod" class="material-symbols-outlined">check_circle</span>
            <span v-else class="material-symbols-outlined">warning</span>
          </div>
          <div class="status-content">
            <h3 v-if="paymentStatus.hasPaymentMethod">Méthode de paiement configurée</h3>
            <h3 v-else>Aucune méthode de paiement</h3>
            <p v-if="paymentStatus.hasPaymentMethod">
              Votre carte bancaire est enregistrée et prête à être utilisée.
            </p>
            <p v-else>
              Vous devez ajouter une carte bancaire pour pouvoir enchérir ou acheter des objets.
            </p>
          </div>
        </div>

        <!-- Stripe Card Element -->
        <div v-if="!paymentStatus?.hasPaymentMethod" class="payment-form-card">
          <h2 class="form-title">Ajouter une carte bancaire</h2>
          <p class="form-subtitle">Utilisez une carte de test Stripe pour tester la fonctionnalité</p>
          
          <div class="test-cards-info">
            <h3 class="test-cards-title">Cartes de test Stripe</h3>
            <div class="test-cards-list">
              <div class="test-card-item">
                <strong>Succès :</strong>
                <code>4242 4242 4242 4242</code>
                <span class="copy-btn" @click="copyToClipboard('4242 4242 4242 4242')">Copier</span>
              </div>
              <div class="test-card-item">
                <strong>Date d'expiration :</strong>
                <code>12/34</code>
                <span class="copy-btn" @click="copyToClipboard('12/34')">Copier</span>
              </div>
              <div class="test-card-item">
                <strong>CVC :</strong>
                <code>123</code>
                <span class="copy-btn" @click="copyToClipboard('123')">Copier</span>
              </div>
            </div>
          </div>

          <form id="payment-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="card-element" class="form-label">
                Informations de la carte
              </label>
              <div id="card-element" class="stripe-element">
                <!-- Stripe Elements will create form elements here -->
              </div>
              <div id="card-errors" class="error-message" role="alert"></div>
            </div>

            <button 
              type="submit" 
              class="btn-submit" 
              :disabled="isProcessing || !stripe || !elements"
            >
              <span v-if="isProcessing" class="material-symbols-outlined spin">sync</span>
              <span v-else class="material-symbols-outlined">credit_card</span>
              <span>{{ isProcessing ? 'Traitement...' : 'Ajouter la carte' }}</span>
            </button>
          </form>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-message-card">
          <span class="material-symbols-outlined">check_circle</span>
          <p>{{ successMessage }}</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message-card">
          <span class="material-symbols-outlined">error</span>
          <p>{{ errorMessage }}</p>
        </div>

        <!-- Info Section -->
        <div class="info-section">
          <h3 class="info-title">Pourquoi ajouter une carte ?</h3>
          <ul class="info-list">
            <li>
              <span class="material-symbols-outlined">gavel</span>
              <span>Participer aux enchères sur les objets qui vous intéressent</span>
            </li>
            <li>
              <span class="material-symbols-outlined">shopping_cart</span>
              <span>Acheter des objets en vente rapide</span>
            </li>
            <li>
              <span class="material-symbols-outlined">security</span>
              <span>Paiements sécurisés via Stripe</span>
            </li>
            <li>
              <span class="material-symbols-outlined">verified</span>
              <span>Aucun paiement ne sera effectué sans votre confirmation</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51...'

const stripe = ref(null)
const elements = ref(null)
const cardElement = ref(null)
const paymentStatus = ref(null)
const isProcessing = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const loadStripe = () => {
  if (window.Stripe) {
    stripe.value = window.Stripe(STRIPE_PUBLISHABLE_KEY)
    elements.value = stripe.value.elements()
    
    const style = {
      base: {
        color: '#1a1a1a',
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#adb5bd',
        },
      },
      invalid: {
        color: '#d32f2f',
        iconColor: '#d32f2f',
      },
    }

    cardElement.value = elements.value.create('card', { style })
    cardElement.value.mount('#card-element')

    cardElement.value.on('change', (event) => {
      const displayError = document.getElementById('card-errors')
      if (event.error) {
        displayError.textContent = event.error.message
        displayError.style.display = 'block'
      } else {
        displayError.textContent = ''
        displayError.style.display = 'none'
      }
    })
  } else {
    console.error('Stripe.js n\'est pas chargé')
    errorMessage.value = 'Erreur de chargement de Stripe. Veuillez rafraîchir la page.'
  }
}

const checkPaymentStatus = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    router.push('/login')
    return
  }

  try {
    const response = await fetch(`${API_URL}/stripe/payment-method-status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      paymentStatus.value = await response.json()
    }
  } catch (err) {
    console.error('Erreur lors de la vérification du statut:', err)
  }
}

const handleSubmit = async (event) => {
  event.preventDefault()
  
  if (!stripe.value || !elements.value) {
    errorMessage.value = 'Stripe n\'est pas initialisé. Veuillez rafraîchir la page.'
    return
  }

  isProcessing.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const token = localStorage.getItem('access_token')
  if (!token) {
    router.push('/login')
    return
  }

  try {
    // Créer un setup intent
    const setupResponse = await fetch(`${API_URL}/stripe/setup-intent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!setupResponse.ok) {
      throw new Error('Erreur lors de la création du setup intent')
    }

    const { clientSecret } = await setupResponse.json()

    // Confirmer le setup intent avec la carte
    const { error: confirmError, setupIntent } = await stripe.value.confirmCardSetup(clientSecret, {
      payment_method: {
        card: cardElement.value,
      }
    })

    if (confirmError) {
      throw new Error(confirmError.message)
    }

    // Attacher la méthode de paiement
    const attachResponse = await fetch(`${API_URL}/stripe/attach-payment-method`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        paymentMethodId: setupIntent.payment_method
      })
    })

    if (!attachResponse.ok) {
      const error = await attachResponse.json()
      throw new Error(error.message || 'Erreur lors de l\'attachement de la carte')
    }

    successMessage.value = 'Carte bancaire ajoutée avec succès !'
    
    // Recharger le statut
    setTimeout(() => {
      checkPaymentStatus()
      // Réinitialiser le formulaire
      cardElement.value.clear()
    }, 2000)

  } catch (err) {
    console.error('Erreur:', err)
    errorMessage.value = err.message || 'Une erreur est survenue lors de l\'ajout de la carte'
  } finally {
    isProcessing.value = false
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    alert(`"${text}" copié dans le presse-papiers`)
  })
}

onMounted(() => {
  checkPaymentStatus()
  // Attendre que Stripe soit chargé
  if (window.Stripe) {
    loadStripe()
  } else {
    // Attendre le chargement de Stripe
    const checkStripe = setInterval(() => {
      if (window.Stripe) {
        loadStripe()
        clearInterval(checkStripe)
      }
    }, 100)
    
    // Timeout après 5 secondes
    setTimeout(() => {
      clearInterval(checkStripe)
      if (!stripe.value) {
        errorMessage.value = 'Stripe.js n\'a pas pu être chargé. Veuillez rafraîchir la page.'
      }
    }, 5000)
  }
})

onUnmounted(() => {
  if (cardElement.value) {
    cardElement.value.unmount()
  }
})
</script>

<style scoped>
.payment-page-wrapper {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 40px 0 80px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb-section {
  margin-bottom: 30px;
}

.breadcrumb-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #645394;
  text-decoration: none;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  transition: color 0.3s;
}

.breadcrumb-link:hover {
  color: #4F4670;
}

.payment-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.payment-header {
  margin-bottom: 40px;
  text-align: center;
}

.page-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 700;
  font-size: 2rem;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.page-subtitle {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 1rem;
  color: #6c757d;
  margin: 0;
}

/* Status Card */
.status-card {
  display: flex;
  gap: 20px;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 32px;
  border: 2px solid;
}

.status-card.success {
  background: #f0f9ff;
  border-color: #4CAF50;
}

.status-card.warning {
  background: #fff8e1;
  border-color: #FF9800;
}

.status-icon {
  flex-shrink: 0;
}

.status-icon .material-symbols-outlined {
  font-size: 48px;
}

.status-card.success .status-icon .material-symbols-outlined {
  color: #4CAF50;
}

.status-card.warning .status-icon .material-symbols-outlined {
  color: #FF9800;
}

.status-content h3 {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.25rem;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.status-content p {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.95rem;
  color: #495057;
  margin: 0;
}

/* Payment Form */
.payment-form-card {
  margin-bottom: 32px;
}

.form-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.form-subtitle {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.95rem;
  color: #6c757d;
  margin: 0 0 24px 0;
}

.test-cards-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  border: 1px solid #e9ecef;
}

.test-cards-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.test-cards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.test-card-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.9rem;
}

.test-card-item strong {
  color: #1a1a1a;
  min-width: 120px;
}

.test-card-item code {
  background: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: #645394;
  flex: 1;
}

.copy-btn {
  padding: 6px 12px;
  background: #645394;
  color: #ffffff;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.copy-btn:hover {
  background: #4F4670;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.stripe-element {
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: #ffffff;
  transition: border-color 0.3s;
}

.stripe-element:focus-within {
  border-color: #645394;
}

.error-message {
  color: #d32f2f;
  font-size: 0.875rem;
  margin-top: 8px;
  display: none;
}

.btn-submit {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #645394 0%, #7B6BA3 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(100, 83, 148, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(100, 83, 148, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Messages */
.success-message-card,
.error-message-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.success-message-card {
  background: #f0f9ff;
  border: 2px solid #4CAF50;
  color: #1a1a1a;
}

.error-message-card {
  background: #ffebee;
  border: 2px solid #d32f2f;
  color: #1a1a1a;
}

.success-message-card .material-symbols-outlined {
  color: #4CAF50;
  font-size: 24px;
}

.error-message-card .material-symbols-outlined {
  color: #d32f2f;
  font-size: 24px;
}

.success-message-card p,
.error-message-card p {
  margin: 0;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 500;
}

/* Info Section */
.info-section {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 2px solid #e9ecef;
}

.info-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.25rem;
  color: #1a1a1a;
  margin: 0 0 20px 0;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.95rem;
  color: #495057;
}

.info-list li .material-symbols-outlined {
  color: #645394;
  font-size: 24px;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .payment-content {
    padding: 24px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .status-card {
    flex-direction: column;
    text-align: center;
  }

  .test-card-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .test-card-item strong {
    min-width: auto;
  }
}
</style>

