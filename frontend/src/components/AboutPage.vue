<template>
  <div class="about-page-wrapper">
    <div class="about-page">
      <!-- Hero Section avec animation -->
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="about-title animated-title">À propos de Purple Dog</h1>
          <p class="hero-subtitle">Votre partenaire de confiance pour les objets de valeur</p>
        </div>
        <div class="hero-decoration">
          <div class="floating-shape shape-1"></div>
          <div class="floating-shape shape-2"></div>
          <div class="floating-shape shape-3"></div>
        </div>
      </div>

      <div class="about-container">
        <div class="about-content">
          <!-- Section Mission avec image -->
          <section class="about-section mission-section" ref="missionSection">
            <div class="section-content-wrapper">
              <div class="section-text-content">
                <h2 class="section-subtitle">Notre mission</h2>
                <h2 class="section-title">Enrichir le quotidien grâce à des objets d'exception</h2>
                <p class="section-text">
                  Purple Dog est une plateforme de vente en ligne spécialisée dans les objets de valeur. Nous offrons un espace sécurisé et fiable pour les particuliers et les professionnels souhaitant vendre ou acquérir des pièces uniques, des bijoux anciens aux œuvres d'art contemporaines, en passant par les meubles de collection.
                </p>
                <p class="section-text">
                  Notre mission est de garantir l'authenticité et la qualité de chaque objet, en connectant des vendeurs passionnés à des acheteurs de confiance. Nous mettons notre expertise au service d'une communauté grandissante, facilitant les transactions d'exception avec transparence et professionnalisme.
                </p>
              </div>
              <div class="section-image">
                <img 
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=1000&fit=crop" 
                  alt="Intérieur élégant avec objets de collection"
                  class="section-image-real"
                />
              </div>
            </div>
          </section>

          <!-- Section Histoire avec Carousel -->
          <section class="about-section history-section" ref="historySection">
            <div class="history-container">
              <div class="history-layout">
                <!-- Colonne de gauche avec texte -->
                <div class="history-text-column">
                  <div class="history-nav">
                    <button class="nav-btn" @click="previousSlide" type="button" aria-label="Précédent">‹</button>
                    <button class="nav-btn" @click="nextSlide" type="button" aria-label="Suivant">›</button>
                  </div>
                  <div class="history-content">
                    <div class="history-year">{{ historySlides[currentSlide]?.year }}</div>
                    <h2 class="history-title">{{ historySlides[currentSlide]?.title }}</h2>
                    <p class="history-description">
                      {{ historySlides[currentSlide]?.description }}
                    </p>
                  </div>
                </div>
                
                <!-- Colonne de droite avec image -->
                <div class="history-image-column">
                  <div class="history-image-card">
                    <img 
                      :src="historySlides[currentSlide]?.image" 
                      :alt="historySlides[currentSlide]?.title"
                      class="history-card-image"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section Valeurs avec cartes animées -->
          <section class="about-section values-section" ref="valuesSection">
            <div class="section-header">
              <h2 class="section-title">Nos valeurs</h2>
            </div>
            <div class="values-list">
              <div class="value-card" v-for="(value, index) in values" :key="index" :style="{ animationDelay: `${index * 0.1}s` }">
                <h3 class="value-title">{{ value.title }}</h3>
                <p class="value-text">{{ value.text }}</p>
              </div>
            </div>
          </section>

          <!-- Section Équipe -->
          <section class="about-section team-section" ref="teamSection">
            <div class="team-container">
              <h2 class="section-title">Notre équipe dirigeante</h2>
              <p class="section-intro">
                Purple Dog est une plateforme de vente en ligne majeure à l'intention des amateurs d'objets de valeur qui partagent avec notre équipe la même passion. Véritables vétérans du secteur, nous sommes déterminés à créer une plateforme innovante qui permet aux acheteurs de profiter pleinement de leur vie grâce à des objets d'exception.
              </p>
              <div class="team-members-list">
                <div class="team-member-profile" v-for="(member, index) in teamMembers" :key="index">
                  <div class="member-photo-container">
                    <img 
                      :src="member.image" 
                      :alt="member.name"
                      class="member-photo-circle"
                      @error="handleImageError($event, index)"
                      loading="lazy"
                      referrerpolicy="no-referrer"
                    />
                  </div>
                  <div class="member-bio">
                    <h3 class="member-name">{{ member.name }}</h3>
                    <div class="member-title">
                      <span v-for="(role, roleIndex) in member.roles" :key="roleIndex" class="member-role-title">
                        {{ role }}<span v-if="roleIndex < member.roles.length - 1">, </span>
                      </span>
                    </div>
                    <p class="member-description" v-if="member.biography">
                      {{ member.biography }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section Pourquoi nous avec statistiques -->
          <section class="about-section features-section" ref="featuresSection">
            <h2 class="section-title">Pourquoi choisir Purple Dog ?</h2>
            <div class="stats-grid">
              <div class="stat-card" v-for="(stat, index) in stats" :key="index">
                <div class="stat-number">{{ stat.number }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
            <ul class="features-list">
              <li class="feature-item" v-for="(feature, index) in features" :key="index">
                <div class="feature-icon">✓</div>
                <div class="feature-content">
                  <strong>{{ feature.title }}</strong> : {{ feature.description }}
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <!-- Section Newsletter en pleine largeur -->
      <NewsletterSection />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NewsletterSection from './NewsletterSection.vue'
import comeImage from '@/assets/come de drouas.jpeg'
import thomasImage from '@/assets/thomas yardin.jpeg'

const values = ref([
  {
    title: 'Authenticité',
    text: 'Nous garantissons l\'authenticité de chaque objet vendu sur notre plateforme grâce à un processus de vérification rigoureux.'
  },
  {
    title: 'Transparence',
    text: 'Nous croyons en la transparence totale dans toutes nos transactions, avec des informations claires et détaillées sur chaque objet.'
  },
  {
    title: 'Sécurité',
    text: 'Votre sécurité est notre priorité. Nous mettons en place des mesures de protection pour garantir des transactions sécurisées.'
  },
  {
    title: 'Excellence',
    text: 'Nous nous engageons à offrir un service d\'excellence, que ce soit pour les particuliers ou les professionnels.'
  }
])

const stats = ref([
  { number: '100%', label: 'Sécurisé' },
  { number: '24/7', label: 'Support' },
  { number: '1000+', label: 'Objets vérifiés' },
  { number: '500+', label: 'Membres actifs' }
])

const features = ref([
  {
    title: 'Expertise reconnue',
    description: 'Notre équipe possède une connaissance approfondie des objets de valeur et de leur marché.'
  },
  {
    title: 'Processus de vérification',
    description: 'Chaque objet est vérifié pour garantir son authenticité et sa qualité.'
  },
  {
    title: 'Plateforme sécurisée',
    description: 'Vos transactions sont protégées par des mesures de sécurité avancées.'
  },
  {
    title: 'Support client',
    description: 'Notre équipe est à votre disposition pour répondre à toutes vos questions.'
  },
  {
    title: 'Communauté de confiance',
    description: 'Rejoignez une communauté de passionnés et de professionnels sérieux.'
  }
])

    const missionSection = ref(null)
    const historySection = ref(null)
    const valuesSection = ref(null)
    const teamSection = ref(null)
    const featuresSection = ref(null)

const currentSlide = ref(0)

const teamMembers = ref([
  {
    name: 'Côme DE DROUAS',
    roles: ['Business Developer', 'Agent d\'artistes', 'Responsable de projets'],
    image: comeImage,
    biography: 'Côme DE DROUAS apporte son expertise en développement commercial et en gestion d\'artistes à Purple Dog. Avec son expérience approfondie dans le secteur de l\'art et des objets de valeur, il contribue à développer notre réseau de partenaires et à garantir la qualité des transactions sur notre plateforme.'
  },
  {
    name: 'Thomas YARDIN',
    roles: ['Business Developer', 'Account Manager Freelance'],
    image: thomasImage,
    biography: 'Thomas YARDIN, en tant que Business Developer et Account Manager, met son savoir-faire au service de Purple Dog pour créer des relations durables avec nos clients professionnels. Son approche personnalisée et son expertise en gestion de comptes garantissent une expérience exceptionnelle pour tous nos partenaires.'
  }
])

const historySlides = ref([
  {
    year: '2024',
    title: 'Fondation',
    description: 'Purple Dog est née à Paris de la passion pour les objets de valeur et du désir de créer une plateforme qui respecte à la fois les vendeurs et les acheteurs.',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop' // Image de Paris / fondation d'entreprise
  },
  {
    year: 'Notre vision',
    title: 'Démocratiser l\'excellence',
    description: 'Notre vision est de démocratiser l\'accès aux objets d\'exception tout en préservant leur authenticité et leur valeur. Nous croyons que chaque objet raconte une histoire.',
    image: 'https://cdn.pixabay.com/photo/2021/11/16/06/27/luggage-6800246_1280.jpg' // Image d'objets d'art et antiquités
  },
  {
    year: 'Aujourd\'hui',
    title: 'Une communauté grandissante',
    description: 'Purple Dog rassemble une communauté grandissante de passionnés, de collectionneurs et de professionnels qui partagent les mêmes valeurs : authenticité, transparence et excellence.',
    image: 'https://www.collectiana.org/images/notes-de-colloques/colloque-mars-04/colloque-les-collectionneurs-sont-ils-des-personnes-insolites-02.jpg' // Image de communauté / équipe
  }
])

// Auto-play du carousel
let carouselInterval = null

const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = null
  }
}

const nextSlide = () => {
  console.log('nextSlide appelé')
  stopCarousel() // Arrêter l'auto-play quand l'utilisateur clique
  if (currentSlide.value < historySlides.value.length - 1) {
    currentSlide.value++
  } else {
    currentSlide.value = 0 // Retour au début
  }
  console.log('currentSlide:', currentSlide.value)
}

const previousSlide = () => {
  console.log('previousSlide appelé')
  stopCarousel() // Arrêter l'auto-play quand l'utilisateur clique
  if (currentSlide.value > 0) {
    currentSlide.value--
  } else {
    currentSlide.value = historySlides.value.length - 1 // Aller à la fin
  }
  console.log('currentSlide:', currentSlide.value)
}

const goToSlide = (index) => {
  stopCarousel() // Arrêter l'auto-play quand l'utilisateur clique
  currentSlide.value = index
}

const handleImageError = (event, index) => {
  console.error(`Erreur de chargement de l'image pour ${teamMembers.value[index].name}`)
  // Optionnel : définir une image de fallback
  event.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
}

const startCarousel = () => {
  stopCarousel() // S'assurer qu'il n'y a pas de doublon
  carouselInterval = setInterval(() => {
    nextSlide()
  }, 5000) // Change de slide toutes les 5 secondes
}

onMounted(() => {
  // Animation au scroll pour les sections
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        // Démarrer le carousel quand la section histoire est visible
        if (entry.target === historySection.value) {
          startCarousel()
        }
      } else {
        // Arrêter le carousel quand la section n'est plus visible
        if (entry.target === historySection.value) {
          stopCarousel()
        }
      }
    })
  }, observerOptions)

      const sections = [missionSection, historySection, valuesSection, teamSection, featuresSection]
  sections.forEach(section => {
    if (section.value) {
      observer.observe(section.value)
    }
  })
})
</script>

<style scoped>
.about-page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.about-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%);
}

/* Hero Section */
.hero-section {
  position: relative;
  padding: 100px 20px 80px;
  text-align: center;
  overflow: hidden;
  background: linear-gradient(135deg, #645394 0%, #4F4670 100%);
  color: white;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
}

.animated-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-style: normal;
  font-size: 4rem;
  margin-bottom: 20px;
  animation: fadeInUp 0.8s ease-out;
}

.hero-subtitle {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 1.5rem;
  opacity: 0.9;
  animation: fadeInUp 1s ease-out 0.2s both;
}

.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
  top: 60%;
  right: 15%;
  animation-delay: 5s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%);
  bottom: 20%;
  left: 20%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.about-container {
  width: 100%;
  max-width: 1200px;
  margin: -40px auto 0;
  position: relative;
  z-index: 2;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.about-section {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease-out;
}

.about-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.section-content-wrapper.reverse {
  grid-template-columns: 1fr 1fr;
}

.section-content-wrapper.reverse .section-image {
  order: -1;
}

.section-text-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-subtitle {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #645394;
  margin: 0 0 15px 0;
}

.section-image {
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;
}

.section-image-real {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.4s ease;
}

.section-image-real:hover {
  transform: scale(1.02);
}

.mission-section {
  background: #fafafa;
  padding: 80px 40px;
  margin-top: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.history-section {
  background: #ffffff;
  padding: 80px 40px;
  border-bottom: 1px solid #e0e0e0;
}

.history-container {
  max-width: 1200px;
  margin: 0 auto;
}

.history-container {
  max-width: 1200px;
  margin: 0 auto;
}

.history-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: stretch;
}

.history-text-column {
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-self: stretch;
}

.history-nav {
  display: flex;
  gap: 10px;
  align-self: flex-start;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  font-size: 20px;
  color: #213547;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background-color: #f5f5f5;
  border-color: #ccc;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.history-year {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #645394;
}

.history-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-style: normal;
  font-size: 2.5rem;
  color: #213547;
  margin: 0;
  line-height: 1.2;
}

.history-description {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 1.1rem;
  color: #213547;
  line-height: 1.6;
  flex: 1;
}

.history-image-column {
  display: flex;
  align-items: stretch;
  height: 100%;
}

.history-image-card {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
}

.history-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.history-image-card:hover .history-card-image {
  transform: scale(1.05);
}

@media (max-width: 1024px) {
  .history-layout {
    grid-template-columns: 1fr;
  }
  
  .history-image-column {
    height: 500px;
  }
}

@media (max-width: 768px) {
  .history-text-column {
    padding: 30px 20px;
  }
  
  .history-title {
    font-size: 2rem;
  }
  
  .history-description {
    font-size: 1rem;
  }
  
  .history-image-column {
    height: 400px;
  }
}

.values-section {
  background: #fafafa;
  padding: 60px 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.values-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  margin-top: 30px;
}

.value-card {
  background: #ffffff;
  padding: 40px 30px;
  border-radius: 8px;
  text-align: left;
  transition: all 0.4s ease;
  border: 1px solid #e0e0e0;
  animation: fadeInUp 0.6s ease-out both;
  position: relative;
  overflow: hidden;
}

.value-card:hover {
  transform: translateY(-5px);
  border-color: #645394;
  box-shadow: 0 8px 24px rgba(100, 83, 148, 0.15);
}


.value-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-style: italic;
  font-size: 1.3rem;
  color: #213547;
  margin: 0 0 15px 0;
  border-bottom: 2px solid #645394;
  padding-bottom: 10px;
  display: inline-block;
}

.value-text {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.team-section {
  background: #ffffff;
  padding: 80px 40px;
  border-bottom: 1px solid #e0e0e0;
}

.team-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-intro {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 1.1rem;
  color: #666;
  line-height: 1.8;
  margin: 0 0 60px 0;
  text-align: left;
}

.team-members-list {
  display: flex;
  flex-direction: column;
  gap: 60px;
}

.team-member-profile {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 50px;
  align-items: flex-start;
}

.member-photo-container {
  width: 200px;
  height: 200px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  background: #e0e0e0;
  position: relative;
}

.member-photo-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  background: #e0e0e0;
}

.member-bio {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.member-name {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-style: normal;
  font-size: 2rem;
  color: #213547;
  margin: 0;
  line-height: 1.2;
}

.member-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: #213547;
  margin: 0;
}

.member-role-title {
  font-weight: 600;
}

.member-description {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 1rem;
  color: #666;
  line-height: 1.8;
  margin: 0;
}

@media (max-width: 768px) {
  .team-member-profile {
    grid-template-columns: 1fr;
    gap: 30px;
    text-align: center;
  }

  .member-photo-container {
    width: 180px;
    height: 180px;
    margin: 0 auto;
  }

  .member-name {
    font-size: 1.5rem;
  }

  .section-intro {
    font-size: 1rem;
    text-align: left;
  }

  .member-bio {
    text-align: left;
  }
}

.features-section {
  background: #fafafa;
  padding: 80px 40px;
  border-bottom: 1px solid #e0e0e0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin: 40px 0;
}

.stat-card {
  background: linear-gradient(135deg, #645394 0%, #4F4670 100%);
  padding: 30px 20px;
  border-radius: 15px;
  text-align: center;
  color: white;
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease-out both;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

.stat-card:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 10px 30px rgba(100, 83, 148, 0.4);
}

.stat-number {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.stat-label {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 30px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 1rem;
  color: #666;
  line-height: 1.8;
  padding: 20px;
  border-radius: 12px;
  transition: all 0.3s ease;
  animation: slideInLeft 0.6s ease-out both;
}

.feature-item:nth-child(1) { animation-delay: 0.1s; }
.feature-item:nth-child(2) { animation-delay: 0.2s; }
.feature-item:nth-child(3) { animation-delay: 0.3s; }
.feature-item:nth-child(4) { animation-delay: 0.4s; }
.feature-item:nth-child(5) { animation-delay: 0.5s; }

.feature-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #645394;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
}



.section-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-style: italic;
  font-size: 2rem;
  color: #213547;
  margin: 0;
}

.section-text {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 1.1rem;
  color: #666;
  line-height: 1.8;
  margin: 0;
}

.back-to-home {
  margin-top: 50px;
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid #e0e0e0;
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
  .hero-section {
    padding: 60px 20px 50px;
  }

  .animated-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .about-container {
    padding: 0 15px 40px;
    margin-top: -30px;
  }

  .about-content {
    gap: 0;
  }

  .section-content-wrapper {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .section-content-wrapper.reverse .section-image {
    order: 0;
  }

  .section-image {
    height: 400px;
  }

  .mission-section,
  .team-section,
  .history-section,
  .values-section,
  .features-section {
    padding: 60px 20px;
  }

  .history-container {
    padding: 0;
  }

  .values-list {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .stat-number {
    font-size: 2rem;
  }


  .section-title {
    font-size: 1.5rem;
  }

  .section-text {
    font-size: 1rem;
  }
}
</style>

