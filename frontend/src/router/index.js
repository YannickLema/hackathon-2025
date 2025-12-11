import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import LoginPage from '../components/LoginPage.vue'
import RegisterPage from '../components/RegisterPage.vue'
import ForgotPasswordPage from '../components/ForgotPasswordPage.vue'
import LegalNoticePage from '../components/LegalNoticePage.vue'
import AboutPage from '../components/AboutPage.vue'
import ContactPage from '../components/ContactPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordPage,
  },
  {
    path: '/mentions-legales',
    name: 'LegalNotice',
    component: LegalNoticePage,
  },
  {
    path: '/a-propos',
    name: 'About',
    component: AboutPage,
  },
  {
    path: '/contact',
    name: 'Contact',
    component: ContactPage,
  },
  {
    path: '/categorie/:id',
    name: 'Category',
    component: () => import('../components/CategoryPage.vue'),
  },
  {
    path: '/categorie/:categoryId/produit/:id',
    name: 'Product',
    component: () => import('../components/CategoryPage.vue'), // Temporaire, à remplacer par ProductPage.vue
  },
  {
    path: '/dashboard/particulier',
    name: 'DashboardParticulier',
    component: () => import('../components/DashboardParticulier.vue'),
  },
  {
    path: '/dashboard/professionnel',
    name: 'DashboardProfessionnel',
    component: () => import('../components/DashboardProfessionnel.vue'),
  },
  {
    path: '/profil',
    name: 'Profile',
    component: () => import('../components/ProfilePage.vue'),
  },
  {
    path: '/creer-annonce',
    name: 'CreateListing',
    component: () => import('../components/CreateListingPage.vue'),
  },
  {
    path: '/mes-objets',
    name: 'MyListings',
    component: () => import('../components/MyListingsPage.vue'),
  },
  {
    path: '/mes-annonces',
    name: 'MyListingsAlt',
    component: () => import('../components/MyListingsPage.vue'),
  },
  {
    path: '/recherche',
    name: 'Search',
    component: () => import('../components/SearchPage.vue'),
  },
  {
    path: '/mes-favoris',
    name: 'MyFavorites',
    component: () => import('../components/MyFavoritesPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

