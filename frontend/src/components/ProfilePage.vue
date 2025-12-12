<template>
  <div class="profile-page-wrapper">
    <div class="profile-container">
      <!-- En-tête avec photo en grand -->
      <div class="profile-header-section">
        <div class="profile-header-content">
          <div class="profile-avatar-large">
            <img 
              v-if="profilePhotoUrl" 
              :src="profilePhotoUrl" 
              alt="Photo de profil" 
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder-large">
              <span class="material-symbols-outlined">person</span>
            </div>
            <div class="avatar-overlay" @click="triggerPhotoInput">
              <span class="material-symbols-outlined">camera_alt</span>
              <span>Changer la photo</span>
            </div>
            <input
              ref="photoInput"
              id="photo-input"
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              @change="handlePhotoChange"
              class="file-input-hidden"
            />
          </div>
          <div class="profile-header-info">
            <h1 class="profile-title">{{ userProfile.firstName }} {{ userProfile.lastName }}</h1>
            <p class="profile-subtitle">{{ userProfile.email }}</p>
            <div v-if="userProfile.role === 'PROFESSIONNEL' || userProfile.role === 'professionnel'" class="profile-badge">
              <span class="material-symbols-outlined">business</span>
              Professionnel
            </div>
            <div v-else class="profile-badge">
              <span class="material-symbols-outlined">person</span>
              Particulier
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <span class="material-symbols-outlined loading-icon">hourglass_empty</span>
        <p>Chargement...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <span class="material-symbols-outlined error-icon">error</span>
        <p>{{ error }}</p>
        <button @click="loadProfile" class="btn-retry">Réessayer</button>
      </div>

      <div v-else class="profile-content">
        <!-- Photo de profil - Mode édition -->
        <div v-if="isEditingPhoto" class="profile-section photo-edit-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="material-symbols-outlined section-icon">photo_camera</span>
              Modifier la photo de profil
            </h2>
            <button @click="cancelEditingPhoto" class="btn-close">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="photo-edit-content">
            <div class="photo-preview-container">
              <img 
                v-if="profilePhotoUrl" 
                :src="profilePhotoUrl" 
                alt="Aperçu" 
                class="photo-preview"
              />
              <div v-else class="photo-preview-placeholder">
                <span class="material-symbols-outlined">image</span>
                <p>Aucune photo sélectionnée</p>
              </div>
            </div>
            <div class="photo-upload-actions">
              <label for="photo-input-edit" class="file-upload-btn">
                <span class="material-symbols-outlined">upload</span>
                Choisir une photo
              </label>
              <input
                ref="photoInputEdit"
                id="photo-input-edit"
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                @change="handlePhotoChange"
                class="file-input-hidden"
              />
              <p v-if="newPhotoFile" class="file-info">
                <span class="material-symbols-outlined">check_circle</span>
                {{ newPhotoFile.name }} ({{ formatFileSize(newPhotoFile.size) }})
              </p>
              <div class="photo-actions">
                <button @click="savePhoto" class="btn-save" :disabled="!newPhotoFile || isSaving">
                  <span class="material-symbols-outlined">check</span>
                  {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
                <button @click="cancelEditingPhoto" class="btn-cancel">
                  <span class="material-symbols-outlined">close</span>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Informations personnelles -->
        <div class="profile-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="material-symbols-outlined section-icon">person</span>
              Informations personnelles
            </h2>
            <button 
              v-if="!isEditingPersonal" 
              @click="startEditingPersonal" 
              class="btn-edit"
            >
              <span class="material-symbols-outlined">edit</span>
              Modifier
            </button>
            <div v-else class="edit-actions">
              <button @click="savePersonalInfo" class="btn-save" :disabled="isSaving">
                <span class="material-symbols-outlined">check</span>
                Enregistrer
              </button>
              <button @click="cancelEditingPersonal" class="btn-cancel">
                <span class="material-symbols-outlined">close</span>
                Annuler
              </button>
            </div>
          </div>
          <div class="section-content">
            <div v-if="!isEditingPersonal" class="info-list">
              <div class="info-item">
                <div class="info-item-header">
                  <div class="info-icon-wrapper">
                    <span class="material-symbols-outlined info-icon">badge</span>
                  </div>
                  <div class="info-item-content">
                    <span class="info-label">Prénom</span>
                    <span class="info-value">{{ userProfile.firstName || 'Non renseigné' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="info-item">
                <div class="info-item-header">
                  <div class="info-icon-wrapper">
                    <span class="material-symbols-outlined info-icon">badge</span>
                  </div>
                  <div class="info-item-content">
                    <span class="info-label">Nom</span>
                    <span class="info-value">{{ userProfile.lastName || 'Non renseigné' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="info-item">
                <div class="info-item-header">
                  <div class="info-icon-wrapper">
                    <span class="material-symbols-outlined info-icon">mail</span>
                  </div>
                  <div class="info-item-content">
                    <span class="info-label">Email</span>
                    <span class="info-value">{{ userProfile.email || 'Non renseigné' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="info-item">
                <div class="info-item-header">
                  <div class="info-icon-wrapper">
                    <span class="material-symbols-outlined info-icon">home</span>
                  </div>
                  <div class="info-item-content">
                    <span class="info-label">Adresse postale</span>
                    <span class="info-value">{{ userProfile.postalAddress || 'Non renseigné' }}</span>
                  </div>
                </div>
              </div>
              
              <div v-if="userProfile.birthDate" class="info-item">
                <div class="info-item-header">
                  <div class="info-icon-wrapper">
                    <span class="material-symbols-outlined info-icon">cake</span>
                  </div>
                  <div class="info-item-content">
                    <span class="info-label">Date de naissance</span>
                    <span class="info-value">{{ formatDate(userProfile.birthDate) }}</span>
                  </div>
                </div>
              </div>
              
              <div v-if="userProfile.age" class="info-item">
                <div class="info-item-header">
                  <div class="info-icon-wrapper">
                    <span class="material-symbols-outlined info-icon">calendar_today</span>
                  </div>
                  <div class="info-item-content">
                    <span class="info-label">Âge</span>
                    <span class="info-value">{{ userProfile.age }} ans</span>
                  </div>
                </div>
              </div>
            </div>
            <form v-else @submit.prevent="savePersonalInfo" class="info-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName" class="form-label">Prénom<span class="required-asterisk">*</span></label>
                  <input
                    id="firstName"
                    v-model="editForm.firstName"
                    type="text"
                    class="form-input"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="lastName" class="form-label">Nom<span class="required-asterisk">*</span></label>
                  <input
                    id="lastName"
                    v-model="editForm.lastName"
                    type="text"
                    class="form-input"
                    required
                  />
                </div>
              </div>
              <div class="form-group">
                <label for="email" class="form-label">Email<span class="required-asterisk">*</span></label>
                <input
                  id="email"
                  v-model="editForm.email"
                  type="email"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group">
                <label for="postalAddress" class="form-label">Adresse postale<span class="required-asterisk">*</span></label>
                <input
                  id="postalAddress"
                  v-model="editForm.postalAddress"
                  type="text"
                  class="form-input"
                  required
                />
              </div>
              <div v-if="userProfile.role === 'PARTICULIER' || userProfile.role === 'particulier'" class="form-row">
                <div class="form-group">
                  <label for="birthDate" class="form-label">Date de naissance</label>
                  <input
                    id="birthDate"
                    v-model="editForm.birthDate"
                    type="date"
                    class="form-input"
                    @input="calculateAge"
                  />
                </div>
                <div class="form-group">
                  <label for="age" class="form-label">Âge</label>
                  <input
                    id="age"
                    v-model="editForm.age"
                    type="number"
                    class="form-input"
                    readonly
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Informations professionnelles (uniquement pour les professionnels) -->
        <div v-if="userProfile.role === 'PROFESSIONNEL' || userProfile.role === 'professionnel'" class="profile-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="material-symbols-outlined section-icon">business</span>
              Informations professionnelles
            </h2>
            <button 
              v-if="!isEditingProfessional" 
              @click="startEditingProfessional" 
              class="btn-edit"
            >
              <span class="material-symbols-outlined">edit</span>
              Modifier
            </button>
            <div v-else class="edit-actions">
              <button @click="saveProfessionalInfo" class="btn-save" :disabled="isSaving">
                <span class="material-symbols-outlined">check</span>
                Enregistrer
              </button>
              <button @click="cancelEditingProfessional" class="btn-cancel">
                <span class="material-symbols-outlined">close</span>
                Annuler
              </button>
            </div>
          </div>
          <div class="section-content">
            <div v-if="!isEditingProfessional" class="info-list">
              <div class="info-item">
                <div class="info-item-header">
                  <div class="info-icon-wrapper">
                    <span class="material-symbols-outlined info-icon">business</span>
                  </div>
                  <div class="info-item-content">
                    <span class="info-label">Dénomination de l'entreprise</span>
                    <span class="info-value">{{ userProfile.companyName || 'Non renseigné' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="info-item">
                <div class="info-item-header">
                  <div class="info-icon-wrapper">
                    <span class="material-symbols-outlined info-icon">receipt_long</span>
                  </div>
                  <div class="info-item-content">
                    <span class="info-label">N. SIRET</span>
                    <span class="info-value">{{ userProfile.siret || 'Non renseigné' }}</span>
                  </div>
                </div>
              </div>
              
              <div v-if="userProfile.website" class="info-item">
                <div class="info-item-header">
                  <div class="info-icon-wrapper">
                    <span class="material-symbols-outlined info-icon">language</span>
                  </div>
                  <div class="info-item-content">
                    <span class="info-label">Site internet</span>
                    <a :href="userProfile.website" target="_blank" class="info-link">{{ userProfile.website }}</a>
                  </div>
                </div>
              </div>
              
              <div v-if="userProfile.specialities && userProfile.specialities.length > 0" class="info-item">
                <div class="info-item-header">
                  <div class="info-icon-wrapper">
                    <span class="material-symbols-outlined info-icon">star</span>
                  </div>
                  <div class="info-item-content">
                    <span class="info-label">Spécialités</span>
                    <div class="tags-list">
                      <span v-for="(spec, index) in userProfile.specialities" :key="index" class="tag">
                        {{ spec }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="userProfile.mostSearchedItems && userProfile.mostSearchedItems.length > 0" class="info-item">
                <div class="info-item-header">
                  <div class="info-icon-wrapper">
                    <span class="material-symbols-outlined info-icon">search</span>
                  </div>
                  <div class="info-item-content">
                    <span class="info-label">Recherches principales</span>
                    <div class="tags-list">
                      <span v-for="(item, index) in userProfile.mostSearchedItems" :key="index" class="tag">
                        {{ item }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <form v-else @submit.prevent="saveProfessionalInfo" class="info-form">
              <div class="form-group">
                <label for="companyName" class="form-label">Dénomination de l'entreprise<span class="required-asterisk">*</span></label>
                <input
                  id="companyName"
                  v-model="editForm.companyName"
                  type="text"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group">
                <label for="siret" class="form-label">N. SIRET<span class="required-asterisk">*</span></label>
                <input
                  id="siret"
                  v-model="editForm.siret"
                  type="text"
                  class="form-input"
                  maxlength="14"
                  required
                />
              </div>
              <div class="form-group">
                <label for="website" class="form-label">Site internet</label>
                <input
                  id="website"
                  v-model="editForm.website"
                  type="url"
                  class="form-input"
                  placeholder="https://example.com"
                />
              </div>
            </form>
          </div>
        </div>

        <!-- Mot de passe -->
        <div class="profile-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="material-symbols-outlined section-icon">lock</span>
              Sécurité
            </h2>
            <button 
              v-if="!isEditingPassword" 
              @click="startEditingPassword" 
              class="btn-edit"
            >
              <span class="material-symbols-outlined">edit</span>
              Modifier
            </button>
            <div v-else class="edit-actions">
              <button @click="savePassword" class="btn-save" :disabled="isSaving">
                <span class="material-symbols-outlined">check</span>
                Enregistrer
              </button>
              <button @click="cancelEditingPassword" class="btn-cancel">
                <span class="material-symbols-outlined">close</span>
                Annuler
              </button>
            </div>
          </div>
          <div v-if="isEditingPassword" class="section-content">
            <form @submit.prevent="savePassword" class="info-form">
              <div class="form-group">
                <label for="currentPassword" class="form-label">Mot de passe actuel<span class="required-asterisk">*</span></label>
                <input
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="newPassword" class="form-label">Nouveau mot de passe<span class="required-asterisk">*</span></label>
                  <input
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    type="password"
                    class="form-input"
                    required
                    minlength="8"
                  />
                </div>
                <div class="form-group">
                  <label for="confirmPassword" class="form-label">Confirmer le mot de passe<span class="required-asterisk">*</span></label>
                  <input
                    id="confirmPassword"
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    class="form-input"
                    required
                    minlength="8"
                  />
                </div>
              </div>
              <div v-if="passwordForm.newPassword && passwordForm.newPassword !== passwordForm.confirmPassword" class="form-error">
                <span class="material-symbols-outlined">error</span>
                Les mots de passe ne correspondent pas
              </div>
            </form>
          </div>
          <div v-else class="section-content">
            <div class="security-info">
              <span class="material-symbols-outlined security-icon">shield</span>
              <p>Votre mot de passe est sécurisé. Cliquez sur "Modifier" pour le changer.</p>
            </div>
          </div>
        </div>

        <!-- Messages de succès/erreur -->
        <div v-if="successMessage" class="message-toast success-message">
          <span class="material-symbols-outlined">check_circle</span>
          <span>{{ successMessage }}</span>
        </div>
        <div v-if="errorMessage" class="message-toast error-message">
          <span class="material-symbols-outlined">error</span>
          <span>{{ errorMessage }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const loading = ref(true)
const error = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isSaving = ref(false)

const userProfile = reactive({
  id: null,
  firstName: '',
  lastName: '',
  email: '',
  postalAddress: '',
  birthDate: '',
  age: '',
  role: '',
  profilePhoto: '',
  // Professionnel
  companyName: '',
  siret: '',
  website: '',
  specialities: [],
  mostSearchedItems: []
})

const isEditingPhoto = ref(false)
const isEditingPersonal = ref(false)
const isEditingProfessional = ref(false)
const isEditingPassword = ref(false)

const profilePhotoUrl = ref('')
const newPhotoFile = ref(null)
const photoInput = ref(null)
const photoInputEdit = ref(null)

const editForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  postalAddress: '',
  birthDate: '',
  age: '',
  companyName: '',
  siret: '',
  website: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const checkAuth = () => {
  const token = localStorage.getItem('access_token')
  const userData = localStorage.getItem('user')
  
  if (!token || !userData) {
    router.push('/login')
    return false
  }
  return true
}

const loadProfile = async () => {
  if (!checkAuth()) return
  
  loading.value = true
  error.value = ''
  const token = localStorage.getItem('access_token')
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors du chargement du profil')
    }
    
    const userData = await response.json()
    Object.assign(userProfile, {
      id: userData.id,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      postalAddress: userData.postalAddress || '',
      birthDate: userData.birthDate || '',
      age: userData.age || '',
      role: userData.role || '',
      profilePhoto: userData.profilePhoto || '',
      companyName: userData.professionnelProfile?.companyName || '',
      siret: userData.professionnelProfile?.siret || '',
      website: userData.professionnelProfile?.website || '',
      specialities: userData.professionnelProfile?.specialities || [],
      mostSearchedItems: []
    })
    
    // Mettre à jour localStorage
    localStorage.setItem('user', JSON.stringify(userData))
    
    if (userProfile.profilePhoto) {
      profilePhotoUrl.value = userProfile.profilePhoto
    }
  } catch (err) {
    console.error('Erreur lors du chargement du profil:', err)
    error.value = 'Erreur lors du chargement du profil'
    // Fallback sur localStorage
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      Object.assign(userProfile, {
        id: userData.id,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        postalAddress: userData.postalAddress || '',
        birthDate: userData.birthDate || '',
        age: userData.age || '',
        role: userData.role || '',
        profilePhoto: userData.profilePhoto || '',
        companyName: userData.companyName || '',
        siret: userData.siret || '',
        website: userData.website || '',
        specialities: userData.specialities || [],
        mostSearchedItems: userData.mostSearchedItems || []
      })
      if (userProfile.profilePhoto) {
        profilePhotoUrl.value = userProfile.profilePhoto
      }
    } catch (e) {
      // Ignore
    }
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const calculateAge = () => {
  if (editForm.birthDate) {
    const birth = new Date(editForm.birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    editForm.age = age.toString()
  } else {
    editForm.age = ''
  }
}

const triggerPhotoInput = () => {
  if (photoInput.value) {
    photoInput.value.click()
  }
}

const handlePhotoChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      errorMessage.value = 'Le fichier est trop volumineux. Taille maximale : 10MB'
      setTimeout(() => { errorMessage.value = '' }, 5000)
      return
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      errorMessage.value = 'Type de fichier non autorisé. Formats acceptés : JPG, PNG, GIF, WEBP'
      setTimeout(() => { errorMessage.value = '' }, 5000)
      return
    }
    newPhotoFile.value = file
    errorMessage.value = ''
    isEditingPhoto.value = true
    
    // Prévisualisation
    const reader = new FileReader()
    reader.onload = (e) => {
      profilePhotoUrl.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const cancelEditingPhoto = () => {
  isEditingPhoto.value = false
  newPhotoFile.value = null
  if (photoInput.value) {
    photoInput.value.value = ''
  }
  if (photoInputEdit.value) {
    photoInputEdit.value.value = ''
  }
  // Restaurer l'ancienne photo si annulation
  if (userProfile.profilePhoto) {
    profilePhotoUrl.value = userProfile.profilePhoto
  } else {
    profilePhotoUrl.value = ''
  }
}

const savePhoto = async () => {
  if (!newPhotoFile.value) return
  
  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  const token = localStorage.getItem('access_token')
  
  try {
    const formData = new FormData()
    formData.append('profilePhoto', newPhotoFile.value)
    
    // TODO: Remplacer par la vraie API call
    // const response = await fetch(`${API_URL}/users/profile/photo`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${token}` },
    //   body: formData
    // })
    // const data = await response.json()
    
    // Simulation
    userProfile.profilePhoto = profilePhotoUrl.value
    const userData = JSON.parse(localStorage.getItem('user'))
    userData.profilePhoto = profilePhotoUrl.value
    localStorage.setItem('user', JSON.stringify(userData))
    
    // Déclencher l'événement de mise à jour pour que le header se mette à jour
    window.dispatchEvent(new Event('auth-changed'))
    
    successMessage.value = 'Photo de profil mise à jour avec succès'
    setTimeout(() => {
      successMessage.value = ''
      cancelEditingPhoto()
    }, 3000)
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la photo:', err)
    errorMessage.value = 'Erreur lors de la mise à jour de la photo'
    setTimeout(() => { errorMessage.value = '' }, 5000)
  } finally {
    isSaving.value = false
  }
}

const startEditingPersonal = () => {
  isEditingPersonal.value = true
  editForm.firstName = userProfile.firstName
  editForm.lastName = userProfile.lastName
  editForm.email = userProfile.email
  editForm.postalAddress = userProfile.postalAddress
  editForm.birthDate = userProfile.birthDate
  editForm.age = userProfile.age
}

const cancelEditingPersonal = () => {
  isEditingPersonal.value = false
}

const savePersonalInfo = async () => {
  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  const token = localStorage.getItem('access_token')
  if (!token) {
    errorMessage.value = 'Vous devez être connecté'
    isSaving.value = false
    return
  }
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: editForm.firstName,
        lastName: editForm.lastName
      })
    })
    
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour')
    }
    
    const updatedUser = await response.json()
    
    // Mise à jour locale
    Object.assign(userProfile, {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      email: editForm.email,
      postalAddress: editForm.postalAddress,
      birthDate: editForm.birthDate,
      age: editForm.age
    })
    
    const userData = JSON.parse(localStorage.getItem('user'))
    Object.assign(userData, {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      email: editForm.email,
      postalAddress: editForm.postalAddress,
      birthDate: editForm.birthDate,
      age: editForm.age
    })
    localStorage.setItem('user', JSON.stringify(userData))
    window.dispatchEvent(new Event('auth-changed'))
    
    successMessage.value = 'Informations personnelles mises à jour avec succès'
    setTimeout(() => {
      successMessage.value = ''
      cancelEditingPersonal()
    }, 3000)
  } catch (err) {
    console.error('Erreur lors de la mise à jour:', err)
    errorMessage.value = 'Erreur lors de la mise à jour des informations'
    setTimeout(() => { errorMessage.value = '' }, 5000)
  } finally {
    isSaving.value = false
  }
}

const startEditingProfessional = () => {
  isEditingProfessional.value = true
  editForm.companyName = userProfile.companyName
  editForm.siret = userProfile.siret
  editForm.website = userProfile.website
}

const cancelEditingProfessional = () => {
  isEditingProfessional.value = false
}

const saveProfessionalInfo = async () => {
  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  const token = localStorage.getItem('access_token')
  
  try {
    Object.assign(userProfile, {
      companyName: editForm.companyName,
      siret: editForm.siret,
      website: editForm.website
    })
    
    const userData = JSON.parse(localStorage.getItem('user'))
    Object.assign(userData, {
      companyName: editForm.companyName,
      siret: editForm.siret,
      website: editForm.website
    })
    localStorage.setItem('user', JSON.stringify(userData))
    
    successMessage.value = 'Informations professionnelles mises à jour avec succès'
    setTimeout(() => {
      successMessage.value = ''
      cancelEditingProfessional()
    }, 3000)
  } catch (err) {
    console.error('Erreur lors de la mise à jour:', err)
    errorMessage.value = 'Erreur lors de la mise à jour des informations'
    setTimeout(() => { errorMessage.value = '' }, 5000)
  } finally {
    isSaving.value = false
  }
}

const startEditingPassword = () => {
  isEditingPassword.value = true
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

const cancelEditingPassword = () => {
  isEditingPassword.value = false
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

const savePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    errorMessage.value = 'Les mots de passe ne correspondent pas'
    setTimeout(() => { errorMessage.value = '' }, 5000)
    return
  }
  
  if (passwordForm.newPassword.length < 8) {
    errorMessage.value = 'Le mot de passe doit contenir au moins 8 caractères'
    setTimeout(() => { errorMessage.value = '' }, 5000)
    return
  }
  
  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  const token = localStorage.getItem('access_token')
  
  try {
    // TODO: Remplacer par la vraie API call
    successMessage.value = 'Mot de passe modifié avec succès'
    setTimeout(() => {
      successMessage.value = ''
      cancelEditingPassword()
    }, 3000)
  } catch (err) {
    console.error('Erreur lors de la modification du mot de passe:', err)
    errorMessage.value = 'Erreur lors de la modification du mot de passe'
    setTimeout(() => { errorMessage.value = '' }, 5000)
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-page-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
}

/* En-tête avec photo */
.profile-header-section {
  background: linear-gradient(135deg, #645394 0%, #4F4670 100%);
  padding: 60px 20px;
  color: #ffffff;
  margin-bottom: 40px;
}

.profile-header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
}

.profile-avatar-large {
  position: relative;
  width: 180px;
  height: 180px;
  flex-shrink: 0;
}

.avatar-image,
.avatar-placeholder-large {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.avatar-placeholder-large {
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder-large .material-symbols-outlined {
  font-size: 80px;
  color: rgba(255, 255, 255, 0.8);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
  color: #ffffff;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
}

.profile-avatar-large:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .material-symbols-outlined {
  font-size: 32px;
}

.file-input-hidden {
  display: none;
}

.profile-header-info {
  flex: 1;
  min-width: 0;
}

.profile-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-size: 2.5rem;
  color: #ffffff;
  margin: 0 0 10px 0;
}

.profile-subtitle {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 15px 0;
}

.profile-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  color: #ffffff;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.loading-icon,
.error-icon {
  font-size: 64px;
  color: #e0e0e0;
  margin-bottom: 20px;
}

.error-icon {
  color: #d32f2f;
}

.btn-retry {
  margin-top: 20px;
  padding: 12px 24px;
  background-color: #645394;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background-color: #4F4670;
}

.profile-content {
  padding: 0 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.profile-section {
  background-color: #ffffff;
  border-radius: 20px;
  padding: 35px;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.profile-section:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  gap: 15px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.4rem;
  color: #213547;
  margin: 0;
  flex: 1;
  min-width: 0;
}

.section-icon {
  font-size: 28px;
  color: #645394;
  flex-shrink: 0;
}

.btn-edit,
.btn-close {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #f5f5f5;
  color: #645394;
  border: 1px solid #645394;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-edit:hover,
.btn-close:hover {
  background-color: #645394;
  color: #ffffff;
}

.edit-actions {
  display: flex;
  gap: 10px;
  white-space: nowrap;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-save:hover:not(:disabled) {
  background-color: #45a049;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

/* Photo edit section */
.photo-edit-section {
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
}

.photo-edit-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

.photo-preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.photo-preview {
  max-width: 100%;
  max-height: 400px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.photo-preview-placeholder {
  text-align: center;
  color: #999;
  padding: 40px;
}

.photo-preview-placeholder .material-symbols-outlined {
  font-size: 64px;
  margin-bottom: 15px;
}

.photo-upload-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.file-upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  background-color: #645394;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-upload-btn:hover {
  background-color: #4F4670;
  transform: translateY(-2px);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #e8f5e9;
  color: #2e7d32;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.9rem;
  margin: 0;
}

.photo-actions {
  display: flex;
  gap: 10px;
}

/* Info list - Style professionnel */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.info-item {
  padding: 0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item:hover {
  background-color: #fafafa;
}

.info-item-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 28px;
  width: 100%;
  box-sizing: border-box;
}

.info-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(100, 83, 148, 0.1) 0%, rgba(100, 83, 148, 0.15) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.info-item:hover .info-icon-wrapper {
  background: linear-gradient(135deg, rgba(100, 83, 148, 0.15) 0%, rgba(100, 83, 148, 0.2) 100%);
  transform: scale(1.05);
}

.info-icon {
  font-size: 24px;
  color: #645394;
}

.info-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.info-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 2px;
}

.info-value {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 500;
  font-size: 1.05rem;
  color: #213547;
  word-break: break-word;
  line-height: 1.4;
}

/* Info grid pour les autres sections */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 12px;
  transition: all 0.3s ease;
  border-left: 3px solid #645394;
}

.info-card:hover {
  background-color: #f5f5f5;
  transform: translateX(5px);
}

.info-card-full {
  grid-column: 1 / -1;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.info-link {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 1.1rem;
  color: #645394;
  text-decoration: none;
  transition: color 0.3s ease;
  word-break: break-all;
}

.info-link:hover {
  color: #4F4670;
  text-decoration: underline;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 5px;
}

.tag {
  padding: 6px 14px;
  background-color: #645394;
  color: #ffffff;
  border-radius: 16px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
}

.security-info {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background-color: #e8f5e9;
  border-radius: 12px;
}

.security-icon {
  font-size: 32px;
  color: #4CAF50;
  flex-shrink: 0;
}

.security-info p {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 1rem;
  color: #2e7d32;
  margin: 0;
}

/* Formulaire */
.info-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  font-size: 0.9rem;
  color: #213547;
}

.required-asterisk {
  color: #d32f2f;
  margin-left: 4px;
}

.form-input {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 1rem;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f5f5f5;
  color: #213547;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #645394;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(100, 83, 148, 0.1);
}

.form-input:read-only {
  background-color: #e0e0e0;
  cursor: not-allowed;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  color: #d32f2f;
  padding: 12px;
  background-color: #ffebee;
  border-radius: 8px;
}

/* Messages toast */
.message-toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 12px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideInUp 0.3s ease;
}

@keyframes slideInUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.success-message {
  background-color: #4CAF50;
  color: #ffffff;
}

.error-message {
  background-color: #d32f2f;
  color: #ffffff;
}

@media (max-width: 768px) {
  .profile-header-section {
    padding: 40px 15px;
  }

  .profile-header-content {
    flex-direction: column;
    text-align: center;
    gap: 30px;
  }

  .profile-avatar-large {
    width: 150px;
    height: 150px;
  }

  .avatar-image,
  .avatar-placeholder-large {
    width: 150px;
    height: 150px;
  }

  .profile-title {
    font-size: 2rem;
  }

  .profile-content {
    padding: 0 15px 30px;
  }

  .profile-section {
    padding: 25px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .edit-actions {
    width: 100%;
    flex-direction: column;
  }

  .btn-edit,
  .btn-save,
  .btn-cancel {
    width: 100%;
    justify-content: center;
  }

  .photo-edit-content {
    grid-template-columns: 1fr;
  }

  .info-list {
    border-radius: 8px;
  }

  .info-item-header {
    padding: 20px;
    gap: 15px;
  }

  .info-icon-wrapper {
    width: 40px;
    height: 40px;
  }

  .info-icon {
    font-size: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .message-toast {
    bottom: 20px;
    right: 20px;
    left: 20px;
  }
}
</style>
