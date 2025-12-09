<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-left">
          <img :src="logo" alt="Purple Dog Logo" class="footer-logo" />
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
import logo from '@/assets/Purple dog.svg'
</script>

<style scoped>
.footer {
  background-color: #ffffff;
  padding: 40px 0;
  margin-top: auto;
  border-top: 1px solid #e0e0e0;
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

.footer-logo {
  height: 60px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(60%) sepia(50%) saturate(2000%) hue-rotate(350deg) brightness(0.9) contrast(1.1);
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-link {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600; /* Semibold - Caption */
  color: #213547;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #E07A5F;
}

.contact-btn {
  background-color: #E07A5F;
  color: white;
}

.contact-btn:hover {
  background-color: #D2691E;
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
  
  .footer-logo {
    height: 50px;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
