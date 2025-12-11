<template>
  <div class="profile-page-wrapper">
    <div class="profile-container">
      <!-- En-tête -->
      <div class="profile-header">
        <h1 class="profile-title">Mon profil</h1>
        <p class="profile-subtitle">Gérez vos informations personnelles</p>
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
        <!-- Photo de profil -->
        <div class="profile-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="material-symbols-outlined section-icon">photo_camera</span>
              Photo de profil
            </h2>
          </div>
          <div class="profile-photo-section">
            <div class="photo-container">
              <img 
                v-if="profilePhotoUrl" 
                :src="profilePhotoUrl" 
                alt="Photo de profil" 
                class="profile-photo"
              />
              <div v-else class="profile-photo-placeholder">
                <span class="material-symbols-outlined">person</span>
              </div>
              <button 
                v-if="!isEditingPhoto" 
                @click="startEditingPhoto" 
                class="btn-edit-photo"
                title="Modifier la photo"
              >
                <span class="material-symbols-outlined">edit</span>
              </button>
            </div>
            <div v-if="isEditingPhoto" class="photo-upload">
              <input
                ref="photoInput"
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                @change="handlePhotoChange"
                class="file-input-hidden"
              />
              <label for="photo-input" class="file-upload-label">
                <span class="material-symbols-outlined">upload</span>
                Choisir une photo
              </label>
              <div class="photo-actions">
                <button @click="savePhoto" class="btn-save" :disabled="!newPhotoFile">
                  Enregistrer
                </button>
                <button @click="cancelEditingPhoto" class="btn-cancel">
                  Annuler
                </button>
              </div>
              <p v-if="newPhotoFile" class="file-name">{{ newPhotoFile.name }}</p>
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
            <div v-if="!isEditingPersonal" class="info-display">
              <div class="info-row">
                <span class="info-label">Prénom</span>
                <span class="info-value">{{ userProfile.firstName || 'Non renseigné' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Nom</span>
                <span class="info-value">{{ userProfile.lastName || 'Non renseigné' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">{{ userProfile.email || 'Non renseigné' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Adresse postale</span>
                <span class="info-value">{{ userProfile.postalAddress || 'Non renseigné' }}</span>
              </div>
              <div v-if="userProfile.birthDate" class="info-row">
                <span class="info-label">Date de naissance</span>
                <span class="info-value">{{ formatDate(userProfile.birthDate) }}</span>
              </div>
              <div v-if="userProfile.age" class="info-row">
                <span class="info-label">Âge</span>
                <span class="info-value">{{ userProfile.age }} ans</span>
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
            <div v-if="!isEditingProfessional" class="info-display">
              <div class="info-row">
                <span class="info-label">Dénomination de l'entreprise</span>
                <span class="info-value">{{ userProfile.companyName || 'Non renseigné' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">N. SIRET</span>
                <span class="info-value">{{ userProfile.siret || 'Non renseigné' }}</span>
              </div>
              <div v-if="userProfile.website" class="info-row">
                <span class="info-label">Site internet</span>
                <a :href="userProfile.website" target="_blank" class="info-link">{{ userProfile.website }}</a>
              </div>
              <div v-if="userProfile.specialities && userProfile.specialities.length > 0" class="info-row">
                <span class="info-label">Spécialités</span>
                <div class="tags-list">
                  <span v-for="(spec, index) in userProfile.specialities" :key="index" class="tag">
                    {{ spec }}
                  </span>
                </div>
              </div>
              <div v-if="userProfile.mostSearchedItems && userProfile.mostSearchedItems.length > 0" class="info-row">
                <span class="info-label">Recherches principales</span>
                <div class="tags-list">
                  <span v-for="(item, index) in userProfile.mostSearchedItems" :key="index" class="tag">
                    {{ item }}
                  </span>
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
              Mot de passe
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
                Les mots de passe ne correspondent pas
              </div>
            </form>
          </div>
          <div v-else class="section-content">
            <p class="info-note">Votre mot de passe est sécurisé. Cliquez sur "Modifier" pour le changer.</p>
          </div>
        </div>

        <!-- Messages de succès/erreur -->
        <div v-if="successMessage" class="success-message">
          <span class="material-symbols-outlined">check_circle</span>
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="error-message">
          <span class="material-symbols-outlined">error</span>
          {{ errorMessage }}
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
    // TODO: Remplacer par la vraie API call
    // const response = await fetch(`${API_URL}/users/profile`, {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // })
    // const data = await response.json()
    
    // Pour l'instant, utiliser les données du localStorage
    const userData = JSON.parse(localStorage.getItem('user'))
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
  } catch (err) {
    console.error('Erreur lors du chargement du profil:', err)
    error.value = 'Erreur lors du chargement du profil'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR')
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

const startEditingPhoto = () => {
  isEditingPhoto.value = true
  newPhotoFile.value = null
}

const cancelEditingPhoto = () => {
  isEditingPhoto.value = false
  newPhotoFile.value = null
  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

const handlePhotoChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      errorMessage.value = 'Le fichier est trop volumineux. Taille maximale : 10MB'
      return
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      errorMessage.value = 'Type de fichier non autorisé. Formats acceptés : JPG, PNG, GIF, WEBP'
      return
    }
    newPhotoFile.value = file
    errorMessage.value = ''
    
    // Prévisualisation
    const reader = new FileReader()
    reader.onload = (e) => {
      profilePhotoUrl.value = e.target.result
    }
    reader.readAsDataURL(file)
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
    successMessage.value = 'Photo de profil mise à jour avec succès'
    setTimeout(() => {
      successMessage.value = ''
      cancelEditingPhoto()
    }, 3000)
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la photo:', err)
    errorMessage.value = 'Erreur lors de la mise à jour de la photo'
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
  
  try {
    // TODO: Remplacer par la vraie API call
    // const response = await fetch(`${API_URL}/users/profile`, {
    //   method: 'PUT',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(editForm)
    // })
    // const data = await response.json()
    
    // Mise à jour locale
    Object.assign(userProfile, {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      email: editForm.email,
      postalAddress: editForm.postalAddress,
      birthDate: editForm.birthDate,
      age: editForm.age
    })
    
    // Mettre à jour le localStorage
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
    // TODO: Remplacer par la vraie API call
    // Mise à jour locale
    Object.assign(userProfile, {
      companyName: editForm.companyName,
      siret: editForm.siret,
      website: editForm.website
    })
    
    // Mettre à jour le localStorage
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
    return
  }
  
  if (passwordForm.newPassword.length < 8) {
    errorMessage.value = 'Le mot de passe doit contenir au moins 8 caractères'
    return
  }
  
  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  const token = localStorage.getItem('access_token')
  
  try {
    // TODO: Remplacer par la vraie API call
    // const response = await fetch(`${API_URL}/users/profile/password`, {
    //   method: 'PUT',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     currentPassword: passwordForm.currentPassword,
    //     newPassword: passwordForm.newPassword
    //   })
    // })
    
    successMessage.value = 'Mot de passe modifié avec succès'
    setTimeout(() => {
      successMessage.value = ''
      cancelEditingPassword()
    }, 3000)
  } catch (err) {
    console.error('Erreur lors de la modification du mot de passe:', err)
    errorMessage.value = 'Erreur lors de la modification du mot de passe'
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
  background-color: #f5f5f5;
  padding: 30px 0;
  width: 100%;
  overflow-x: hidden;
}

.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
  box-sizing: border-box;
}

.profile-header {
  margin-bottom: 40px;
}

.profile-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-size: 2.5rem;
  color: #213547;
  margin: 0 0 10px 0;
}

.profile-subtitle {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 1.1rem;
  color: #666;
  margin: 0;
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
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.profile-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  box-sizing: border-box;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
  gap: 15px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.3rem;
  color: #213547;
  margin: 0;
  flex: 1;
  min-width: 0;
}

.section-icon {
  font-size: 24px;
  color: #645394;
  flex-shrink: 0;
}

.btn-edit {
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

.btn-edit:hover {
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

/* Photo de profil */
.profile-photo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.photo-container {
  position: relative;
  width: 150px;
  height: 150px;
}

.profile-photo,
.profile-photo-placeholder {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e0e0e0;
}

.profile-photo-placeholder {
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-photo-placeholder .material-symbols-outlined {
  font-size: 64px;
  color: #999;
}

.btn-edit-photo {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background-color: #645394;
  color: #ffffff;
  border: 3px solid #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit-photo:hover {
  background-color: #4F4670;
}

.photo-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
  max-width: 400px;
}

.file-input-hidden {
  display: none;
}

.file-upload-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #f5f5f5;
  color: #645394;
  border: 1px solid #645394;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-upload-label:hover {
  background-color: #645394;
  color: #ffffff;
}

.photo-actions {
  display: flex;
  gap: 10px;
}

.file-name {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

/* Informations */
.section-content {
  width: 100%;
}

.info-display {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  color: #666;
}

.info-value {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 1rem;
  color: #213547;
}

.info-link {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 1rem;
  color: #645394;
  text-decoration: none;
  transition: color 0.3s ease;
}

.info-link:hover {
  color: #4F4670;
  text-decoration: underline;
}

.info-note {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.95rem;
  color: #666;
  margin: 0;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 6px 12px;
  background-color: #f5f5f5;
  color: #645394;
  border-radius: 12px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
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
}

.form-input:read-only {
  background-color: #e0e0e0;
  cursor: not-allowed;
}

.form-error {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  color: #d32f2f;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 8px;
}

/* Messages */
.success-message,
.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  margin-top: 20px;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 0 15px;
  }

  .profile-title {
    font-size: 2rem;
  }

  .profile-section {
    padding: 20px;
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

  .form-row {
    grid-template-columns: 1fr;
  }

  .photo-container {
    width: 120px;
    height: 120px;
  }

  .profile-photo,
  .profile-photo-placeholder {
    width: 120px;
    height: 120px;
  }
}
</style>

