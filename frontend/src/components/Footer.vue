<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-left">
          <div class="logo-placeholder">Logo</div>
          <div class="footer-links">
            <a href="#" class="footer-link">Mentions legales</a>
            <a href="#" class="footer-link">A propos</a>
          </div>
        </div>
        <div class="footer-right">
          <button class="btn-oval contact-btn">Nous contacter</button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  background-color: #2a2a2a;
  padding: 30px 0;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.logo-placeholder {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600; /* Semibold - Caption */
  color: white;
  font-size: 18px;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-link {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600; /* Semibold - Caption */
  color: white;
  text-decoration: none;
  font-size: 14px;
  transition: opacity 0.3s ease;
}

.footer-link:hover {
  opacity: 0.8;
}

.contact-btn {
  background-color: #6c63ff;
  color: white;
}

.contact-btn:hover {
  background-color: #5a52e6;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-left {
    flex-direction: column;
    gap: 15px;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
