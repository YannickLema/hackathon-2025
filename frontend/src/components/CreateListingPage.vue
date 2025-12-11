<template>
  <div class="create-listing-wrapper">
    <div class="create-listing-container">
      <!-- En-tête -->
      <div class="page-header">
        <router-link to="/dashboard/particulier" class="back-link">
          <span class="material-symbols-outlined">arrow_back</span>
          Retour au tableau de bord
        </router-link>
        <h1 class="page-title">Vendre un objet</h1>
        <p class="page-subtitle">Publiez votre objet de valeur en quelques étapes</p>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="listing-form">
        <!-- Étape 1: Informations de base -->
        <div class="form-section">
          <h2 class="section-title">
            <span class="material-symbols-outlined">info</span>
            Informations de base
          </h2>
          
          <div class="form-group">
            <label for="title" class="form-label">Titre de l'annonce<span class="required-asterisk">*</span></label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              class="form-input"
              placeholder="Ex: Montre ancienne de collection"
              required
              maxlength="200"
            />
            <span class="char-count">{{ form.title.length }}/200</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="category" class="form-label">Catégorie<span class="required-asterisk">*</span></label>
              <select
                id="category"
                v-model="form.category"
                class="form-input form-select"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="PEINTURE">Peinture</option>
                <option value="SCULPTURE">Sculpture</option>
                <option value="MONTRE">Montre</option>
                <option value="BIJOU">Bijou</option>
                <option value="OBJET_ART">Objet d'art</option>
                <option value="PHOTOGRAPHIE">Photographie</option>
                <option value="VETEMENT">Vêtement</option>
                <option value="ACCESSOIRE">Accessoire</option>
                <option value="DESIGN">Design</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>
            <div class="form-group">
              <label for="saleMode" class="form-label">Mode de vente<span class="required-asterisk">*</span></label>
              <select
                id="saleMode"
                v-model="form.saleMode"
                class="form-input form-select"
                required
                @change="handleSaleModeChange"
              >
                <option value="">Sélectionner un mode</option>
                <option value="INSTANT_SALE">Vente immédiate</option>
                <option value="AUCTION">Enchères</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="description" class="form-label">Description<span class="required-asterisk">*</span></label>
            <textarea
              id="description"
              v-model="form.description"
              class="form-input form-textarea"
              placeholder="Décrivez votre objet en détail (état, histoire, provenance, etc.)"
              required
              rows="6"
              maxlength="2000"
            ></textarea>
            <span class="char-count">{{ form.description.length }}/2000</span>
          </div>
        </div>

        <!-- Étape 2: Prix et dimensions -->
        <div class="form-section">
          <h2 class="section-title">
            <span class="material-symbols-outlined">euro</span>
            Prix et dimensions
          </h2>

          <div class="form-row">
            <div class="form-group">
              <label for="priceDesired" class="form-label">Prix souhaité (€)<span class="required-asterisk">*</span></label>
              <input
                id="priceDesired"
                v-model.number="form.priceDesired"
                type="number"
                class="form-input"
                placeholder="0.00"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div v-if="form.saleMode === 'AUCTION'" class="form-group">
              <label for="auctionStartPrice" class="form-label">Prix de départ des enchères (€)</label>
              <input
                id="auctionStartPrice"
                v-model.number="form.auctionStartPrice"
                type="number"
                class="form-input"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <p class="field-hint">Par défaut: 90% du prix souhaité</p>
            </div>
          </div>

          <div v-if="form.saleMode === 'AUCTION'" class="form-group">
            <label for="auctionEndAt" class="form-label">Date de fin des enchères</label>
            <input
              id="auctionEndAt"
              v-model="form.auctionEndAt"
              type="datetime-local"
              class="form-input"
              :min="minAuctionDate"
            />
            <p class="field-hint">Par défaut: 7 jours à partir de maintenant</p>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="dimensions" class="form-label">Dimensions<span class="required-asterisk">*</span></label>
              <input
                id="dimensions"
                v-model="form.dimensions"
                type="text"
                class="form-input"
                placeholder="Ex: 30cm x 20cm x 15cm"
                required
              />
            </div>
            <div class="form-group">
              <label for="weightKg" class="form-label">Poids (kg)<span class="required-asterisk">*</span></label>
              <input
                id="weightKg"
                v-model.number="form.weightKg"
                type="number"
                class="form-input"
                placeholder="0.00"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <!-- Étape 3: Photos -->
        <div class="form-section">
          <h2 class="section-title">
            <span class="material-symbols-outlined">photo_camera</span>
            Photos
          </h2>
          <p class="section-hint">Ajoutez au moins une photo de votre objet (maximum 10 photos)</p>

          <div class="photos-upload">
            <div
              v-for="(photo, index) in photos"
              :key="index"
              class="photo-item"
            >
              <div class="photo-preview">
                <img v-if="photo.url" :src="photo.url" :alt="`Photo ${index + 1}`" class="preview-img" />
                <div v-else class="photo-placeholder">
                  <span class="material-symbols-outlined">image</span>
                  <p>Photo {{ index + 1 }}</p>
                </div>
                <button
                  v-if="photos.length > 1"
                  type="button"
                  @click="removePhoto(index)"
                  class="photo-remove"
                  aria-label="Supprimer la photo"
                >
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>
              <input
                :id="`photo-${index}`"
                type="file"
                accept="image/*"
                @change="handlePhotoChange(index, $event)"
                class="file-input-hidden"
              />
              <label :for="`photo-${index}`" class="photo-upload-btn">
                <span class="material-symbols-outlined">upload</span>
                {{ photo.url ? 'Changer' : 'Ajouter' }}
              </label>
            </div>

            <button
              v-if="photos.length < 10"
              type="button"
              @click="addPhotoSlot"
              class="add-photo-btn"
            >
              <span class="material-symbols-outlined">add</span>
              Ajouter une photo
            </button>
          </div>
        </div>

        <!-- Étape 4: Documents (optionnel) -->
        <div class="form-section">
          <h2 class="section-title">
            <span class="material-symbols-outlined">description</span>
            Documents (optionnel)
          </h2>
          <p class="section-hint">Certificats d'authenticité, factures, etc.</p>

          <div class="documents-upload">
            <div
              v-for="(doc, index) in documents"
              :key="index"
              class="document-item"
            >
              <input
                :id="`doc-${index}`"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                @change="handleDocumentChange(index, $event)"
                class="file-input-hidden"
              />
              <label :for="`doc-${index}`" class="document-upload-btn">
                <span class="material-symbols-outlined">upload_file</span>
                {{ doc.url ? doc.label || 'Document ajouté' : 'Ajouter un document' }}
              </label>
              <input
                v-if="doc.url"
                v-model="doc.label"
                type="text"
                class="document-label-input"
                placeholder="Label du document (ex: Certificat d'authenticité)"
              />
              <button
                v-if="doc.url"
                type="button"
                @click="removeDocument(index)"
                class="document-remove"
                aria-label="Supprimer le document"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <button
              type="button"
              @click="addDocumentSlot"
              class="add-document-btn"
            >
              <span class="material-symbols-outlined">add</span>
              Ajouter un document
            </button>
          </div>
        </div>

        <!-- Messages d'erreur/succès -->
        <div v-if="error" class="error-message">
          <span class="material-symbols-outlined">error</span>
          {{ error }}
        </div>

        <div v-if="successMessage" class="success-message">
          <span class="material-symbols-outlined">check_circle</span>
          {{ successMessage }}
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <router-link to="/dashboard/particulier" class="btn-cancel">
            Annuler
          </router-link>
          <button type="submit" class="btn-submit" :disabled="isSubmitting || !isFormValid">
            <span class="material-symbols-outlined">publish</span>
            {{ isSubmitting ? 'Publication...' : 'Publier l\'annonce' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const isSubmitting = ref(false)
const error = ref('')
const successMessage = ref('')

const form = reactive({
  title: '',
  category: '',
  description: '',
  priceDesired: null,
  saleMode: '',
  auctionStartPrice: null,
  auctionEndAt: '',
  dimensions: '',
  weightKg: null
})

const photos = ref([{ url: '', file: null }])
const documents = ref([{ url: '', label: '', file: null }])

const minAuctionDate = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

const isFormValid = computed(() => {
  return form.title &&
         form.category &&
         form.description &&
         form.priceDesired > 0 &&
         form.saleMode &&
         form.dimensions &&
         form.weightKg > 0 &&
         photos.value.some(p => p.url) &&
         (!form.saleMode === 'AUCTION' || form.auctionEndAt || true)
})

const handleSaleModeChange = () => {
  if (form.saleMode === 'AUCTION' && form.priceDesired) {
    if (!form.auctionStartPrice) {
      form.auctionStartPrice = Math.round(form.priceDesired * 0.9 * 100) / 100
    }
    if (!form.auctionEndAt) {
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 7)
      form.auctionEndAt = endDate.toISOString().slice(0, 16)
    }
  }
}

const addPhotoSlot = () => {
  if (photos.value.length < 10) {
    photos.value.push({ url: '', file: null })
  }
}

const removePhoto = (index) => {
  photos.value.splice(index, 1)
  if (photos.value.length === 0) {
    photos.value.push({ url: '', file: null })
  }
}

const handlePhotoChange = (index, event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      error.value = 'Le fichier est trop volumineux. Taille maximale : 10MB'
      setTimeout(() => { error.value = '' }, 5000)
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      photos.value[index].url = e.target.result
      photos.value[index].file = file
    }
    reader.readAsDataURL(file)
  }
}

const addDocumentSlot = () => {
  documents.value.push({ url: '', label: '', file: null })
}

const removeDocument = (index) => {
  documents.value.splice(index, 1)
  if (documents.value.length === 0) {
    documents.value.push({ url: '', label: '', file: null })
  }
}

const handleDocumentChange = (index, event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      error.value = 'Le fichier est trop volumineux. Taille maximale : 10MB'
      setTimeout(() => { error.value = '' }, 5000)
      return
    }
    documents.value[index].file = file
    documents.value[index].url = file.name
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    error.value = 'Veuillez remplir tous les champs obligatoires et ajouter au moins une photo'
    setTimeout(() => { error.value = '' }, 5000)
    return
  }

  isSubmitting.value = true
  error.value = ''
  successMessage.value = ''
  const token = localStorage.getItem('access_token')

  try {
    // Préparer les photos
    const photosData = photos.value
      .filter(p => p.url)
      .map((p, idx) => ({
        url: p.url, // En production, il faudra uploader le fichier et obtenir l'URL
        position: idx
      }))

    // Préparer les documents
    const documentsData = documents.value
      .filter(d => d.file)
      .map(d => ({
        url: d.url, // En production, il faudra uploader le fichier et obtenir l'URL
        label: d.label || null
      }))

    const payload = {
      title: form.title,
      category: form.category,
      description: form.description,
      priceDesired: form.priceDesired,
      saleMode: form.saleMode,
      dimensions: form.dimensions,
      weightKg: form.weightKg,
      photos: photosData,
      ...(documentsData.length > 0 && { documents: documentsData })
    }

    if (form.saleMode === 'AUCTION') {
      payload.auctionStartPrice = form.auctionStartPrice || Math.round(form.priceDesired * 0.9 * 100) / 100
      payload.auctionEndAt = form.auctionEndAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    // TODO: Remplacer par la vraie API call
    // const response = await fetch(`${API_URL}/listings`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(payload)
    // })

    // Simulation
    successMessage.value = 'Annonce créée avec succès !'
    setTimeout(() => {
      router.push('/mes-objets')
    }, 2000)
  } catch (err) {
    console.error('Erreur lors de la création de l\'annonce:', err)
    error.value = 'Erreur lors de la création de l\'annonce. Veuillez réessayer.'
    setTimeout(() => { error.value = '' }, 5000)
  } finally {
    isSubmitting.value = false
  }
}

const checkAuth = () => {
  const token = localStorage.getItem('access_token')
  const userData = localStorage.getItem('user')
  
  if (!token || !userData) {
    router.push('/login')
    return false
  }
  
  try {
    const user = JSON.parse(userData)
    if (user.role !== 'PARTICULIER' && user.role !== 'particulier') {
      router.push('/dashboard/professionnel')
      return false
    }
  } catch (e) {
    router.push('/login')
    return false
  }
  
  return true
}

onMounted(() => {
  if (!checkAuth()) return
})
</script>

<style scoped>
.create-listing-wrapper {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30px 0;
  width: 100%;
  overflow-x: hidden;
}

.create-listing-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 40px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: #645394;
  text-decoration: none;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.back-link:hover {
  gap: 12px;
  color: #4F4670;
}

.page-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-size: 2.5rem;
  color: #213547;
  margin: 0 0 10px 0;
}

.page-subtitle {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.listing-form {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  box-sizing: border-box;
}

.form-section {
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid #e8e8e8;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 30px;
  padding-bottom: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1.3rem;
  color: #213547;
  margin: 0 0 25px 0;
}

.section-title .material-symbols-outlined {
  font-size: 28px;
  color: #645394;
}

.section-hint {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 20px 0;
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
  position: relative;
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

.form-input,
.form-select,
.form-textarea {
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

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #645394;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(100, 83, 148, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.char-count {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.8rem;
  color: #999;
  text-align: right;
  margin-top: -5px;
}

.field-hint {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 400;
  font-size: 0.8rem;
  color: #999;
  margin: 5px 0 0 0;
}

/* Photos */
.photos-upload {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.photo-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.photo-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f5f5;
  border: 2px dashed #e0e0e0;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.photo-placeholder .material-symbols-outlined {
  font-size: 32px;
  margin-bottom: 5px;
}

.photo-placeholder p {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.85rem;
  margin: 0;
}

.photo-remove {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 28px;
  height: 28px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-remove:hover {
  background-color: #d32f2f;
}

.file-input-hidden {
  display: none;
}

.photo-upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background-color: #f5f5f5;
  color: #645394;
  border: 1px solid #645394;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.photo-upload-btn:hover {
  background-color: #645394;
  color: #ffffff;
}

.add-photo-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  background-color: #fafafa;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  color: #666;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  aspect-ratio: 1;
}

.add-photo-btn:hover {
  border-color: #645394;
  color: #645394;
  background-color: #f5f5f5;
}

.add-photo-btn .material-symbols-outlined {
  font-size: 32px;
}

/* Documents */
.documents-upload {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 8px;
}

.document-upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: #f5f5f5;
  color: #645394;
  border: 1px solid #645394;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.document-upload-btn:hover {
  background-color: #645394;
  color: #ffffff;
}

.document-label-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.9rem;
  background-color: #ffffff;
}

.document-remove {
  width: 36px;
  height: 36px;
  background-color: #ffebee;
  color: #d32f2f;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.document-remove:hover {
  background-color: #d32f2f;
  color: #ffffff;
}

.add-document-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #666;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-document-btn:hover {
  border-color: #645394;
  color: #645394;
  background-color: #f5f5f5;
}

/* Messages */
.error-message,
.success-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  border-radius: 8px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 20px;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-top: 30px;
  border-top: 1px solid #e8e8e8;
}

.btn-cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 28px;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  text-decoration: none;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  background-color: #645394;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-submit:hover:not(:disabled) {
  background-color: #4F4670;
  transform: translateY(-2px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .create-listing-container {
    padding: 0 15px;
  }

  .listing-form {
    padding: 25px;
  }

  .page-title {
    font-size: 2rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .photos-upload {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }
}
</style>

