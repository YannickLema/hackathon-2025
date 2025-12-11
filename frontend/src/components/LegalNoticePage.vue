<template>
  <div class="legal-notice-page-wrapper">
    <div class="legal-notice-page">
      <div class="legal-notice-container">
        <h1 class="legal-notice-title">Mentions légales</h1>
        
        <div class="legal-content">
          <section class="legal-section">
            <h2 class="section-title">1. Informations sur l'entreprise</h2>
            <p class="section-text">
              <strong>Raison sociale :</strong> Purple Dog<br>
              <strong>Forme juridique :</strong> Société par Actions Simplifiée (SAS)<br>
              <strong>Siège social :</strong> Paris, France<br>
              <strong>Numéro SIRET :</strong> [À compléter]<br>
              <strong>Numéro TVA intracommunautaire :</strong> [À compléter]
            </p>
          </section>

          <section class="legal-section">
            <h2 class="section-title">2. Directeur de publication</h2>
            <p class="section-text">
              Le directeur de la publication est le représentant légal de Purple Dog.
            </p>
          </section>

          <section class="legal-section">
            <h2 class="section-title">3. Hébergement</h2>
            <p class="section-text">
              Le site est hébergé par :<br>
              <strong>Hébergeur :</strong> Hostinger<br>
              <strong>Adresse :</strong> Hostinger International Ltd., 61 Lordou Vironos Street, 6023 Larnaca, Chypre<br>
              <strong>Site web :</strong> <a href="https://www.hostinger.fr" target="_blank" rel="noopener noreferrer" class="legal-link">www.hostinger.fr</a>
            </p>
          </section>

          <section class="legal-section">
            <h2 class="section-title">4. Propriété intellectuelle</h2>
            <p class="section-text">
              L'ensemble du contenu de ce site (textes, images, vidéos, logos, etc.) est la propriété exclusive de Purple Dog ou de ses partenaires. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable de Purple Dog.
            </p>
          </section>

          <section class="legal-section">
            <h2 class="section-title">5. Protection des données personnelles</h2>
            <p class="section-text">
              Conformément à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant. Pour exercer ce droit, vous pouvez nous contacter à l'adresse suivante : <a href="mailto:contact@purpledog.fr" class="legal-link">contact@purpledog.fr</a>
            </p>
            <p class="section-text">
              Les données collectées sont utilisées exclusivement pour la gestion de votre compte, le traitement de vos commandes et l'amélioration de nos services. Elles ne sont en aucun cas transmises à des tiers à des fins commerciales.
            </p>
          </section>

          <section class="legal-section">
            <h2 class="section-title">6. Cookies</h2>
            <p class="section-text">
              Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. En continuant à naviguer sur ce site, vous acceptez l'utilisation de cookies conformément à notre politique de cookies.
            </p>
          </section>

          <section class="legal-section">
            <h2 class="section-title">7. Responsabilité</h2>
            <p class="section-text">
              Purple Dog s'efforce de fournir sur le site des informations aussi précises que possible. Toutefois, il ne pourra être tenu responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
            </p>
            <p class="section-text">
              Tous les informations indiquées sur le site sont données à titre indicatif, et sont susceptibles d'évoluer. Par ailleurs, les renseignements figurant sur le site ne sont pas exhaustifs.
            </p>
          </section>

          <section class="legal-section">
            <h2 class="section-title">8. Liens hypertextes</h2>
            <p class="section-text">
              Le site peut contenir des liens hypertextes vers d'autres sites présents sur le réseau Internet. Les liens vers ces autres ressources vous font quitter le site Purple Dog. Il est possible de créer un lien vers la page de présentation de ce site sans autorisation expresse de l'éditeur. Aucune autorisation ni demande d'information préalable ne peut être exigée par l'éditeur à l'égard d'un site qui souhaite établir un lien vers le site de l'éditeur.
            </p>
          </section>

          <section class="legal-section">
            <h2 class="section-title">9. Droit applicable</h2>
            <p class="section-text">
              Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut d'accord amiable, le litige sera porté devant les tribunaux français conformément aux règles de compétence en vigueur.
            </p>
          </section>

          <section class="legal-section">
            <h2 class="section-title">10. Contact</h2>
            <p class="section-text">
              Pour toute question concernant les présentes mentions légales, vous pouvez nous contacter :<br>
              <strong>Email :</strong> <a href="mailto:contact@purpledog.fr" class="legal-link">contact@purpledog.fr</a><br>
              <strong>Téléphone :</strong> [À compléter]
            </p>
          </section>
        </div>

        <div class="back-to-home">
          <router-link to="/" class="back-link">
            ← Retour à l'accueil
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.legal-notice-page-wrapper {
  display: flex;
  flex-direction: column;
}

.legal-notice-page {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 60px 20px;
  background-color: #ffffff;
}

.legal-notice-container {
  width: 100%;
  max-width: 900px;
}

.legal-notice-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-style: normal;
  font-size: 3rem;
  color: #000000;
  text-align: center;
  margin-bottom: 50px;
}

.legal-content {
  display: flex;
  flex-direction: column;
}

.legal-section {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-family: 'Georgia', serif;
  font-weight: 700;
  font-style: italic;
  font-size: 1.5rem;
  color: #213547;
  margin: 0;
}

.section-text {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 200;
  font-size: 1rem;
  color: #666;
  line-height: 1.8;
  margin: 0;
}

.legal-link {
  color: #645394;
  text-decoration: none;
  transition: color 0.3s ease;
}

.legal-link:hover {
  color: #4F4670;
  text-decoration: underline;
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
  .legal-notice-page {
    padding: 40px 15px;
  }

  .legal-notice-container {
    padding: 40px 30px;
  }

  .legal-notice-title {
    font-size: 2rem;
    margin-bottom: 30px;
  }

  .legal-content {
    gap: 30px;
  }

  .section-title {
    font-size: 1.3rem;
  }

  .section-text {
    font-size: 0.95rem;
  }
}
</style>

