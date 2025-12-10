<template>
  <div class="register-page-wrapper">
    <Header />
    <div class="register-page">
      <div class="register-container">
        <h1 class="register-title">Inscription</h1>
        
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

        <!-- Formulaire Particulier -->
        <form v-if="userType === 'particulier'" @submit.prevent="handleRegisterParticulier" class="register-form">
          <div class="form-row">
            <div class="form-group">
              <label for="particulier-lastName" class="form-label">Nom</label>
              <input
                id="particulier-lastName"
                v-model="particulierForm.lastName"
                type="text"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label for="particulier-firstName" class="form-label">Prenom</label>
              <input
                id="particulier-firstName"
                v-model="particulierForm.firstName"
                type="text"
                class="form-input"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="particulier-profilePhoto" class="form-label">Photo de profil</label>
            <input
              id="particulier-profilePhoto"
              v-model="particulierForm.profilePhoto"
              type="text"
              class="form-input"
              placeholder="URL de la photo"
            />
          </div>

          <div class="form-group">
            <label for="particulier-email" class="form-label">Email</label>
            <input
              id="particulier-email"
              v-model="particulierForm.email"
              type="email"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="particulier-postalAddress" class="form-label">Adresse postale</label>
            <input
              id="particulier-postalAddress"
              v-model="particulierForm.postalAddress"
              type="text"
              class="form-input"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="particulier-password" class="form-label">Mot de passe</label>
              <input
                id="particulier-password"
                v-model="particulierForm.password"
                type="password"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label for="particulier-confirmPassword" class="form-label">Confirmation de Mot de passe</label>
              <input
                id="particulier-confirmPassword"
                v-model="particulierForm.confirmPassword"
                type="password"
                class="form-input"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="particulier-birthDate" class="form-label">Date de naissance</label>
              <input
                id="particulier-birthDate"
                v-model="particulierForm.birthDate"
                type="date"
                class="form-input"
                @input="calculateAge"
                @change="calculateAge"
              />
            </div>
            <div class="form-group">
              <label for="particulier-age" class="form-label">Age</label>
              <input
                id="particulier-age"
                v-model="particulierForm.age"
                type="number"
                class="form-input"
                readonly
              />
            </div>
          </div>

          <!-- Checkboxes Particulier -->
          <div class="checkboxes-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="particulierForm.isOver18"
                required
              />
              <span>Je certifie avoir plus de 18 ans</span>
            </label>
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="particulierForm.newsletter"
              />
              <span>J'accepte de recevoir des offres de la part de Purple Dog, des offres promotioneeles et des actualites.</span>
            </label>
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="particulierForm.rgpdAccepted"
                required
              />
              <span>J'ai lu et j'accepte les conditions d'utilisations des donnees personnelles.</span>
            </label>
          </div>

          <button type="submit" class="register-button" :disabled="isLoading">
            {{ isLoading ? 'Inscription...' : 'Envoyer' }}
          </button>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>

        <!-- Formulaire Professionnel -->
        <form v-if="userType === 'professionnel'" @submit.prevent="handleRegisterProfessionnel" class="register-form">
          <!-- Stepper -->
          <div class="stepper">
            <div 
              v-for="step in totalSteps" 
              :key="step"
              :class="['step', { active: currentStep === step, completed: currentStep > step }]"
            >
              <div class="step-number">{{ step }}</div>
              <div class="step-label">
                <span v-if="step === 1">Informations</span>
                <span v-if="step === 2">Complémentaires</span>
                <span v-if="step === 3">Conditions</span>
              </div>
            </div>
          </div>

          <!-- Étape 1: Informations (Personnelles + Entreprise + Sécurité) -->
          <div v-show="currentStep === 1" class="step-content">
            <div class="form-row">
              <div class="form-group">
                <label for="professionnel-lastName" class="form-label">Nom</label>
                <input
                  id="professionnel-lastName"
                  v-model="professionnelForm.lastName"
                  type="text"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group">
                <label for="professionnel-firstName" class="form-label">Prenom</label>
                <input
                  id="professionnel-firstName"
                  v-model="professionnelForm.firstName"
                  type="text"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="professionnel-email" class="form-label">Email</label>
              <input
                id="professionnel-email"
                v-model="professionnelForm.email"
                type="email"
                class="form-input"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="professionnel-companyName" class="form-label">Denomination de l'entreprise</label>
                <input
                  id="professionnel-companyName"
                  v-model="professionnelForm.companyName"
                  type="text"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group">
                <label for="professionnel-siret" class="form-label">N. SIRET</label>
                <input
                  id="professionnel-siret"
                  v-model="professionnelForm.siret"
                  type="text"
                  class="form-input"
                  :class="{ 'input-error': siretError, 'input-valid': siretValid }"
                  @blur="validateSiret"
                  @input="siretError = ''; siretValid = false"
                  required
                  maxlength="14"
                />
                <div v-if="siretError" class="field-error">{{ siretError }}</div>
                <div v-if="siretValid && !siretError" class="field-success">SIRET valide</div>
                <div v-if="isValidatingSiret" class="field-info">Vérification en cours...</div>
              </div>
            </div>

            <div class="form-group">
              <label for="professionnel-officialDocument" class="form-label">Document officiel (K-Bis, avis de situation INSEE, etc...)</label>
              <input
                id="professionnel-officialDocument"
                type="file"
                class="form-input file-input"
                @change="handleFileChange"
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
              <div v-if="officialDocumentFile" class="file-info">
                <span class="file-name">{{ officialDocumentFile.name }}</span>
                <button type="button" @click="removeFile" class="file-remove">×</button>
              </div>
            </div>

            <div class="form-group">
              <label for="professionnel-postalAddress" class="form-label">Adresse postale</label>
              <input
                id="professionnel-postalAddress"
                v-model="professionnelForm.postalAddress"
                type="text"
                class="form-input"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="professionnel-password" class="form-label">Mot de passe</label>
                <input
                  id="professionnel-password"
                  v-model="professionnelForm.password"
                  type="password"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group">
                <label for="professionnel-confirmPassword" class="form-label">Confirmation de Mot de passe</label>
                <input
                  id="professionnel-confirmPassword"
                  v-model="professionnelForm.confirmPassword"
                  type="password"
                  class="form-input"
                  required
                />
              </div>
            </div>
          </div>

          <!-- Étape 2: Informations complémentaires -->
          <div v-show="currentStep === 2" class="step-content">
            <div class="form-group">
            <label for="professionnel-website" class="form-label">Votre site internet</label>
            <input
              id="professionnel-website"
              v-model="professionnelForm.website"
              type="url"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="professionnel-specialities" class="form-label">Vos specialites</label>
            <input
              id="professionnel-specialities"
              v-model="specialityInput"
              type="text"
              class="form-input"
              placeholder="Ajoutez une spécialité et appuyez sur Entrée"
              @keydown.enter.prevent="addSpeciality"
            />
            <div v-if="professionnelForm.specialities.length > 0" class="tags-list">
              <span 
                v-for="(spec, index) in professionnelForm.specialities" 
                :key="index"
                class="tag"
              >
                {{ spec }}
                <button type="button" @click="removeSpeciality(index)" class="tag-remove">×</button>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="professionnel-mostSearchedItems" class="form-label">Que recherchez-vous en particulier ?</label>
            <input
              id="professionnel-mostSearchedItems"
              v-model="mostSearchedInput"
              type="text"
              class="form-input"
              placeholder="Ajoutez un élément recherché et appuyez sur Entrée"
              @keydown.enter.prevent="addMostSearchedItem"
            />
            <div v-if="professionnelForm.mostSearchedItems.length > 0" class="tags-list">
              <span 
                v-for="(item, index) in professionnelForm.mostSearchedItems" 
                :key="index"
                class="tag"
              >
                {{ item }}
                <button type="button" @click="removeMostSearchedItem(index)" class="tag-remove">×</button>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Vos réseaux</label>
            <div 
              v-for="(network, index) in socialNetworksList" 
              :key="index"
              class="social-network-row"
            >
              <select
                v-model="network.name"
                class="form-input form-select"
              >
                <option value="">Sélectionner un réseau</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="TikTok">TikTok</option>
                <option value="Pinterest">Pinterest</option>
                <option value="Twitter">Twitter</option>
                <option value="YouTube">YouTube</option>
                <option value="Autre">Autre</option>
              </select>
              <input
                v-model="network.url"
                type="url"
                class="form-input"
                placeholder="URL"
              />
              <button 
                type="button" 
                @click="removeSocialNetwork(index)" 
                class="remove-button"
                v-if="socialNetworksList.length > 1"
              >
                ×
              </button>
              <button 
                type="button" 
                @click="addSocialNetworkField" 
                class="add-button"
                v-if="index === socialNetworksList.length - 1"
              >
                +
              </button>
            </div>
          </div>

          </div>

          <!-- Étape 3: Conditions -->
          <div v-show="currentStep === 3" class="step-content">
            <div class="checkboxes-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="professionnelForm.cgvAccepted"
                required
              />
              <span>J'accepte les CGV de Purple Dog</span>
            </label>
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="professionnelForm.mandateAccepted"
                required
              />
              <span>J'accepte le mandat d'apport d'affaire</span>
            </label>
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="professionnelForm.newsletter"
              />
              <span>J'accepte de recevoir des offres de la part de Purple Dog, des offres promotioneeles et des actualites.</span>
            </label>
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="professionnelForm.rgpdAccepted"
                required
              />
              <span>J'ai lu et j'accepte les conditions d'utilisations des donnees personnelles.</span>
            </label>
            </div>
          </div>

          <!-- Navigation entre les étapes -->
          <div class="step-navigation">
            <button 
              type="button" 
              @click="previousStep" 
              class="nav-button nav-button-prev"
              v-if="currentStep > 1"
            >
              Précédent
            </button>
            <button 
              type="button" 
              @click="nextStep" 
              class="nav-button nav-button-next"
              v-if="currentStep < totalSteps"
            >
              Suivant
            </button>
            <button 
              type="submit" 
              class="nav-button nav-button-submit"
              :disabled="isLoading"
              v-if="currentStep === totalSteps"
            >
              {{ isLoading ? 'Inscription...' : 'Envoyer' }}
            </button>
          </div>

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
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import Header from './Header.vue'
import Footer from './Footer.vue'

const router = useRouter()
const userType = ref('particulier')
const isLoading = ref(false)
const error = ref('')
const currentStep = ref(1)
const totalSteps = 3

// Réinitialiser l'étape quand on change de type d'utilisateur
watch(() => userType.value, () => {
  currentStep.value = 1
  error.value = ''
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Formulaire Particulier
const particulierForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  profilePhoto: '',
  postalAddress: '',
  birthDate: '',
  age: '',
  isOver18: false,
  newsletter: false,
  rgpdAccepted: false,
})

// Formulaire Professionnel
const professionnelForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  companyName: '',
  siret: '',
  officialDocument: '',
  postalAddress: '',
  website: '',
  specialities: [],
  mostSearchedItems: [],
  cgvAccepted: false,
  mandateAccepted: false,
  newsletter: false,
  rgpdAccepted: false,
})

// Gestion du fichier document officiel
const officialDocumentFile = ref(null)

// Validation SIRET
const siretError = ref('')
const siretValid = ref(false)
const isValidatingSiret = ref(false)

// Inputs temporaires pour les tags
const specialityInput = ref('')
const mostSearchedInput = ref('')

// Liste des réseaux sociaux avec nom et URL
const socialNetworksList = ref([
  { name: '', url: '' }
])

const calculateAge = () => {
  if (particulierForm.birthDate) {
    const birth = new Date(particulierForm.birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    particulierForm.age = age.toString()
    particulierForm.isOver18 = age >= 18
  } else {
    particulierForm.age = ''
    particulierForm.isOver18 = false
  }
}

// Watcher pour calculer automatiquement l'âge quand la date de naissance change
watch(() => particulierForm.birthDate, () => {
  calculateAge()
})

// Gestion du fichier document officiel
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error.value = 'Le fichier est trop volumineux. Taille maximale : 10MB'
      event.target.value = ''
      return
    }
    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      error.value = 'Type de fichier non autorisé. Formats acceptés : PDF, JPG, PNG'
      event.target.value = ''
      return
    }
    officialDocumentFile.value = file
    error.value = ''
  }
}

const removeFile = () => {
  officialDocumentFile.value = null
  const fileInput = document.getElementById('professionnel-officialDocument')
  if (fileInput) {
    fileInput.value = ''
  }
}

// Validation SIRET via API INSEE Sirene
const validateSiret = async () => {
  const siret = professionnelForm.siret.replace(/\s/g, '') // Supprimer les espaces
  
  // Vérifier le format (14 chiffres)
  if (!siret || siret.length !== 14 || !/^\d+$/.test(siret)) {
    siretError.value = 'Le SIRET doit contenir 14 chiffres'
    siretValid.value = false
    return
  }

  isValidatingSiret.value = true
  siretError.value = ''
  siretValid.value = false

  try {
    // Utiliser l'API Sirene de l'INSEE (version publique)
    // Note: Cette API nécessite généralement une clé API, mais on peut utiliser une version publique limitée
    // Pour un environnement de production, il faudrait passer par le backend
    const response = await fetch(`https://entreprise.api.gouv.fr/v3/insee/sirene/etablissements/${siret}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      if (data.etablissement) {
        siretValid.value = true
        siretError.value = ''
        // Optionnel : pré-remplir le nom de l'entreprise si disponible
        if (data.etablissement.unite_legale && data.etablissement.unite_legale.denomination && !professionnelForm.companyName) {
          professionnelForm.companyName = data.etablissement.unite_legale.denomination
        }
      } else {
        siretError.value = 'SIRET introuvable dans l\'annuaire des entreprises'
        siretValid.value = false
      }
    } else if (response.status === 404) {
      siretError.value = 'SIRET introuvable dans l\'annuaire des entreprises'
      siretValid.value = false
    } else {
      // Si l'API publique ne fonctionne pas, on peut vérifier via le backend
      // Pour l'instant, on accepte le SIRET mais on affiche un avertissement
      console.warn('Impossible de vérifier le SIRET via l\'API publique. Vérification côté serveur nécessaire.')
      siretError.value = 'Impossible de vérifier le SIRET. La vérification sera effectuée lors de la soumission.'
      siretValid.value = false
    }
  } catch (err) {
    // En cas d'erreur réseau, on peut essayer via le backend
    console.error('Erreur lors de la vérification du SIRET:', err)
    // On ne bloque pas l'utilisateur, la vérification se fera côté serveur
    siretError.value = 'Vérification impossible. La validation sera effectuée lors de la soumission.'
    siretValid.value = false
  } finally {
    isValidatingSiret.value = false
  }
}

const addSpeciality = () => {
  if (specialityInput.value.trim()) {
    professionnelForm.specialities.push(specialityInput.value.trim())
    specialityInput.value = ''
  }
}

const removeSpeciality = (index) => {
  professionnelForm.specialities.splice(index, 1)
}

const addMostSearchedItem = () => {
  if (mostSearchedInput.value.trim()) {
    professionnelForm.mostSearchedItems.push(mostSearchedInput.value.trim())
    mostSearchedInput.value = ''
  }
}

const removeMostSearchedItem = (index) => {
  professionnelForm.mostSearchedItems.splice(index, 1)
}

const addSocialNetworkField = () => {
  socialNetworksList.value.push({ name: '', url: '' })
}

const removeSocialNetwork = (index) => {
  if (socialNetworksList.value.length > 1) {
    socialNetworksList.value.splice(index, 1)
  }
}

const buildSocialNetworksObject = () => {
  const networks = {}
  socialNetworksList.value.forEach(network => {
    if (network.name && network.name.trim()) {
      networks[network.name.trim()] = network.url || ''
    }
  })
  return Object.keys(networks).length > 0 ? networks : undefined
}

const nextStep = () => {
  if (validateCurrentStep()) {
    if (currentStep.value < totalSteps) {
      currentStep.value++
    }
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const validateCurrentStep = () => {
  error.value = ''
  
  if (currentStep.value === 1) {
    if (!professionnelForm.firstName || !professionnelForm.lastName || !professionnelForm.email ||
        !professionnelForm.companyName || !professionnelForm.siret || !officialDocumentFile.value ||
        !professionnelForm.postalAddress || !professionnelForm.password || !professionnelForm.confirmPassword) {
      error.value = 'Veuillez remplir tous les champs obligatoires'
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(professionnelForm.email)) {
      error.value = 'Veuillez entrer une adresse email valide'
      return false
    }
    if (professionnelForm.password !== professionnelForm.confirmPassword) {
      error.value = 'Les mots de passe ne correspondent pas'
      return false
    }
    if (siretError.value && !siretValid.value) {
      error.value = 'Veuillez corriger le numéro SIRET'
      return false
    }
  }
  
  if (currentStep.value === 2) {
    if (professionnelForm.specialities.length === 0) {
      error.value = 'Veuillez ajouter au moins une spécialité'
      return false
    }
    if (professionnelForm.mostSearchedItems.length === 0) {
      error.value = 'Veuillez ajouter au moins un élément recherché'
      return false
    }
  }
  
  if (currentStep.value === 3) {
    if (!professionnelForm.cgvAccepted || !professionnelForm.mandateAccepted) {
      error.value = 'Vous devez accepter les CGV et le mandat'
      return false
    }
    if (!professionnelForm.rgpdAccepted) {
      error.value = 'Vous devez accepter les conditions d\'utilisation des données personnelles'
      return false
    }
  }
  
  return true
}

const handleRegisterParticulier = async () => {
  error.value = ''
  
  if (particulierForm.password !== particulierForm.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  if (!particulierForm.isOver18) {
    error.value = 'Vous devez avoir plus de 18 ans pour vous inscrire'
    return
  }

  isLoading.value = true

  try {
    const response = await fetch(`${API_URL}/auth/register/particulier`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: particulierForm.firstName,
        lastName: particulierForm.lastName,
        email: particulierForm.email,
        password: particulierForm.password,
        profilePhoto: particulierForm.profilePhoto || undefined,
        postalAddress: particulierForm.postalAddress,
        isOver18: particulierForm.isOver18,
        newsletter: particulierForm.newsletter || undefined,
        rgpdAccepted: particulierForm.rgpdAccepted,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'inscription')
    }

    // Stocker le token si présent
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user || {}))
    }

    // Redirection après inscription réussie
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Une erreur est survenue lors de l\'inscription'
  } finally {
    isLoading.value = false
  }
}

const handleRegisterProfessionnel = async () => {
  error.value = ''
  
  // Validation finale avant soumission
  if (!validateCurrentStep()) {
    return
  }

  if (!officialDocumentFile.value) {
    error.value = 'Veuillez télécharger un document officiel'
    return
  }

  isLoading.value = true

  try {
    // Créer FormData pour envoyer le fichier
    const formData = new FormData()
    formData.append('firstName', professionnelForm.firstName)
    formData.append('lastName', professionnelForm.lastName)
    formData.append('email', professionnelForm.email)
    formData.append('password', professionnelForm.password)
    formData.append('companyName', professionnelForm.companyName)
    formData.append('siret', professionnelForm.siret.replace(/\s/g, ''))
    formData.append('officialDocument', officialDocumentFile.value)
    formData.append('postalAddress', professionnelForm.postalAddress)
    if (professionnelForm.website) {
      formData.append('website', professionnelForm.website)
    }
    formData.append('specialities', JSON.stringify(professionnelForm.specialities))
    formData.append('mostSearchedItems', JSON.stringify(professionnelForm.mostSearchedItems))
    formData.append('socialNetworks', JSON.stringify(buildSocialNetworksObject()))
    formData.append('cgvAccepted', professionnelForm.cgvAccepted.toString())
    formData.append('mandateAccepted', professionnelForm.mandateAccepted.toString())
    formData.append('newsletter', professionnelForm.newsletter.toString())
    formData.append('rgpdAccepted', professionnelForm.rgpdAccepted.toString())

    const response = await fetch(`${API_URL}/auth/register/professionnel`, {
      method: 'POST',
      // Ne pas définir Content-Type, le navigateur le fera automatiquement avec la boundary pour FormData
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'inscription')
    }

    // Stocker le token si présent
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user || {}))
    }

    // Redirection après inscription réussie
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Une erreur est survenue lors de l\'inscription'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.register-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: #ffffff;
}

.register-container {
  width: 100%;
  max-width: 800px;
  background-color: #ffffff;
  padding: 50px 40px;
  border-radius: 12px;
}

.register-title {
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
  background-color: #E07A5F;
  color: #ffffff;
}

.toggle-option:not(.active):hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Formulaire */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  border-color: #E07A5F;
  background-color: #ffffff;
}

.form-input::placeholder {
  color: #999;
}

.form-input.input-error {
  border-color: #d32f2f;
}

.form-input.input-valid {
  border-color: #2e7d32;
}

.field-error {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 12px;
  color: #d32f2f;
  margin-top: 4px;
}

.field-success {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 12px;
  color: #2e7d32;
  margin-top: 4px;
}

.field-info {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.file-input {
  cursor: pointer;
}

.file-input::-webkit-file-upload-button {
  visibility: hidden;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.file-name {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #213547;
  flex: 1;
}

.file-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d32f2f;
  transition: color 0.3s ease;
  border-radius: 4px;
}

.file-remove:hover {
  background-color: #ffebee;
  color: #b71c1c;
}

.form-separator {
  height: 1px;
  background-color: #000000;
  margin: 20px 0;
}

.checkboxes-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.register-button {
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

.register-button:hover:not(:disabled) {
  background-color: #1a1a1a;
  transform: translateY(-1px);
}

.register-button:disabled {
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

/* Tags pour spécialités et éléments recherchés */
.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #213547;
}

.tag-remove {
  background: none;
  border: none;
  color: #213547;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.tag-remove:hover {
  color: #E07A5F;
}

.social-network-row {
  display: flex;
  gap: 10px;
  align-items: stretch;
  margin-bottom: 10px;
}

.social-network-row .form-input {
  flex: 1;
}

.form-select {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 16px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f5f5f5;
  color: #213547;
  transition: all 0.3s ease;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #E07A5F;
  background-color: #ffffff;
}

.remove-button {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 20px;
  padding: 12px 16px;
  background-color: #d32f2f;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  line-height: 1;
  min-width: 44px;
}

.remove-button:hover {
  background-color: #b71c1c;
}

.add-button {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 20px;
  padding: 12px 16px;
  background-color: #E07A5F;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  line-height: 1;
  min-width: 44px;
}

.add-button:hover {
  background-color: #D2691E;
}

/* Stepper */
.stepper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
  position: relative;
}

.stepper::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 10%;
  right: 10%;
  height: 2px;
  background-color: #e0e0e0;
  z-index: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
  flex: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f5f5f5;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #999;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background-color: #E07A5F;
  border-color: #E07A5F;
  color: #ffffff;
}

.step.completed .step-number {
  background-color: #000000;
  border-color: #000000;
  color: #ffffff;
}

.step-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 12px;
  color: #999;
  text-align: center;
  transition: color 0.3s ease;
}

.step.active .step-label {
  color: #E07A5F;
}

.step.completed .step-label {
  color: #000000;
}

.step-content {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step-navigation {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #e0e0e0;
}

.nav-button {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 16px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-button-prev {
  background-color: transparent;
  color: #213547;
  border: 1px solid #213547;
}

.nav-button-prev:hover {
  background-color: rgba(33, 53, 71, 0.1);
}

.nav-button-next,
.nav-button-submit {
  background-color: #000000;
  color: #ffffff;
  margin-left: auto;
}

.nav-button-next:hover:not(:disabled),
.nav-button-submit:hover:not(:disabled) {
  background-color: #1a1a1a;
}

.nav-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .register-container {
    padding: 40px 30px;
  }

  .register-title {
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

  .register-form {
    gap: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .stepper {
    flex-wrap: wrap;
    gap: 15px;
  }

  .stepper::before {
    display: none;
  }

  .step {
    flex: 0 0 calc(50% - 7.5px);
  }

  .step-label {
    font-size: 11px;
  }

  .step-navigation {
    flex-direction: column;
  }

  .nav-button-next,
  .nav-button-submit {
    margin-left: 0;
    width: 100%;
  }
}
</style>

