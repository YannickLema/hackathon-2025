<template>
  <div class="checkout-page-wrapper">
    <div class="container">
      <!-- Breadcrumb -->
      <div class="breadcrumb-section">
        <router-link :to="`/produit/${listingId}`" class="breadcrumb-link">
          <span class="material-symbols-outlined">arrow_back</span>
          <span>Retour au produit</span>
        </router-link>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <span class="material-symbols-outlined">error</span>
        <p>{{ error }}</p>
        <router-link to="/produits" class="btn-primary">Retour aux produits</router-link>
      </div>

      <div v-else class="checkout-content">
        <div class="checkout-header">
          <h1 class="page-title">Finaliser votre achat</h1>
          <p class="page-subtitle">Confirmez votre paiement pour compléter l'achat</p>
        </div>

        <div class="checkout-grid">
          <!-- Résumé de la commande -->
          <div class="order-summary">
            <h2 class="section-title">Résumé de la commande</h2>
            
            <div v-if="product" class="product-summary">
              <div class="product-image">
                <img :src="product.mainImage || product.images?.[0]" :alt="product.title" />
              </div>
              <div class="product-details">
                <h3>{{ product.title }}</h3>
                <p class="product-category">{{ formatCategory(product.category) }}</p>
              </div>
              <div class="product-price">
                {{ formatPrice(purchaseData?.amount || 0) }}€
              </div>
            </div>

            <div class="price-breakdown">
              <div class="price-row">
                <span>Sous-total</span>
                <span>{{ formatPrice(purchaseData?.amount || 0) }}€</span>
              </div>
              <div class="price-row">
                <span>Commission ({{ (purchaseData?.commissionRate || 0) * 100 }}%)</span>
                <span>-{{ formatPrice(purchaseData?.commissionAmount || 0) }}€</span>
              </div>
              <div class="price-row total">
                <span>Total</span>
                <span>{{ formatPrice(purchaseData?.amount || 0) }}€</span>
              </div>
            </div>
          </div>

          <!-- Formulaire de paiement -->
          <div class="payment-section">
            <h2 class="section-title">Paiement</h2>
            
            <div v-if="!stripe || !elements" class="stripe-loading">
              <p>Chargement du formulaire de paiement...</p>
            </div>

            <form v-else id="payment-form" @submit.prevent="handlePayment">
              <div class="form-group">
                <label for="card-element" class="form-label">
                  Informations de la carte
                </label>
                <div id="card-element" class="stripe-element">
                  <!-- Stripe Elements will create form elements here -->
                </div>
                <div id="card-errors" class="error-message" role="alert"></div>
              </div>

              <div class="payment-info">
                <p class="info-text">
                  <span class="material-symbols-outlined">lock</span>
                  Paiement sécurisé via Stripe
                </p>
              </div>

              <button 
                type="submit" 
                class="btn-pay" 
                :disabled="isProcessing || !purchaseData"
              >
                <span v-if="isProcessing" class="material-symbols-outlined spin">sync</span>
                <span v-else class="material-symbols-outlined">credit_card</span>
                <span>{{ isProcessing ? 'Traitement...' : `Payer ${formatPrice(purchaseData?.amount || 0)}€` }}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51...'

const listingId = ref(route.params.id)
const product = ref(null)
const purchaseData = ref(null)
const isLoading = ref(true)
const isProcessing = ref(false)
const error = ref('')
const stripe = ref(null)
const elements = ref(null)
const cardElement = ref(null)

const categoryNames = {
  PEINTURE: 'Peinture',
  SCULPTURE: 'Sculpture',
  MONTRE: 'Montre',
  BIJOU: 'Bijou',
  OBJET_ART: 'Objet d\'art',
  PHOTOGRAPHIE: 'Photographie',
  VETEMENT: 'Vêtement',
  ACCESSOIRE: 'Accessoire',
  DESIGN: 'Design',
  AUTRE: 'Autre'
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const formatCategory = (category) => {
  if (!category) return 'Autre'
  if (typeof category === 'string') {
    return categoryNames[category] || category
  }
  return categoryNames[category.code] || category.label || 'Autre'
}

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
  }
}

const loadProduct = async () => {
  try {
    const response = await fetch(`${API_URL}/listings/${listingId.value}`)
    if (!response.ok) throw new Error('Produit introuvable')
    product.value = await response.json()
  } catch (err) {
    error.value = 'Erreur lors du chargement du produit'
  }
}

const createPurchase = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    router.push('/login')
    return
  }

  try {
    const response = await fetch(`${API_URL}/purchases/instant/${listingId.value}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Erreur lors de la création de la commande')
    }

    purchaseData.value = await response.json()
  } catch (err) {
    error.value = err.message || 'Erreur lors de la création de la commande'
  }
}

const handlePayment = async () => {
  if (!stripe.value || !elements.value || !purchaseData.value) {
    return
  }

  isProcessing.value = true
  error.value = ''

  try {
    // Confirmer le payment intent avec Stripe
    const { error: confirmError, paymentIntent } = await stripe.value.confirmCardPayment(
      purchaseData.value.clientSecret,
      {
        payment_method: {
          card: cardElement.value,
        }
      }
    )

    if (confirmError) {
      throw new Error(confirmError.message)
    }

    if (paymentIntent.status === 'succeeded') {
      // Confirmer l'achat côté backend
      const token = localStorage.getItem('access_token')
      const confirmResponse = await fetch(`${API_URL}/purchases/confirm/${listingId.value}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id
        })
      })

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json()
        throw new Error(errorData.message || 'Erreur lors de la confirmation de l\'achat')
      }

      // Rediriger vers la page de succès
      router.push({
        name: 'PurchaseSuccess',
        params: { id: listingId.value }
      })
    } else {
      throw new Error('Le paiement n\'a pas été confirmé')
    }
  } catch (err) {
    error.value = err.message || 'Erreur lors du paiement'
  } finally {
    isProcessing.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadProduct(), createPurchase()])
  
  if (window.Stripe) {
    loadStripe()
  } else {
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.onload = () => {
      loadStripe()
    }
    document.head.appendChild(script)
  }
  
  isLoading.value = false
})

onUnmounted(() => {
  if (cardElement.value) {
    cardElement.value.unmount()
  }
})
</script>

<style scoped>
.checkout-page-wrapper {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 40px 0 80px 0;
}

.container {
  max-width: 1200px;
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

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e9ecef;
  border-top-color: #645394;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state .material-symbols-outlined {
  font-size: 64px;
  color: #d32f2f;
  margin-bottom: 20px;
}

.checkout-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.checkout-header {
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

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.order-summary,
.payment-section {
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
}

.section-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.25rem;
  color: #1a1a1a;
  margin: 0 0 24px 0;
}

.product-summary {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 24px;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  flex: 1;
}

.product-details h3 {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.product-category {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
}

.product-price {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  color: #645394;
}

.price-breakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
  border-top: 2px solid #e9ecef;
}

.price-row {
  display: flex;
  justify-content: space-between;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.95rem;
  color: #495057;
}

.price-row.total {
  font-weight: 700;
  font-size: 1.25rem;
  color: #1a1a1a;
  padding-top: 12px;
  border-top: 2px solid #e9ecef;
}

.stripe-loading {
  text-align: center;
  padding: 40px;
  color: #6c757d;
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

.payment-info {
  margin-bottom: 24px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #b3e5fc;
}

.info-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.875rem;
  color: #0277bd;
  margin: 0;
}

.info-text .material-symbols-outlined {
  font-size: 20px;
}

.btn-pay {
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

.btn-pay:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(100, 83, 148, 0.4);
}

.btn-pay:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }
}
</style>

