# Guide d'ajout d'images

## Sources d'images recommandées

### Pixabay (https://pixabay.com)
- Images gratuites et libres d'utilisation
- Pas besoin d'attribution
- Large choix d'images d'objets de collection, bijoux, art, etc.

### Catawiki (https://www.catawiki.com/fr)
- Images d'objets de collection authentiques
- Exemples réels d'objets de valeur
- Note: Vérifier les droits d'utilisation des images

### Unsplash (https://unsplash.com)
- Images haute qualité gratuites
- Parfait pour les visuels de produits

## Comment ajouter des images

### Dans le carrousel (FeaturedProduct.vue)

1. Trouvez une image sur Pixabay ou Catawiki
2. Copiez l'URL de l'image
3. Ajoutez-la dans le tableau `featuredImages` :

```javascript
const featuredImages = ref([
  {
    id: 1,
    title: 'Titre du produit',
    image: 'URL_DE_L_IMAGE',
    category: 'Catégorie'
  }
])
```

### Exemples d'URLs Pixabay

Pour des objets de collection, recherchez :
- "antique jewelry" 
- "vintage watch"
- "art painting"
- "collectible items"
- "luxury items"

### Exemples d'URLs Unsplash

Les URLs Unsplash peuvent être formatées ainsi :
```
https://images.unsplash.com/photo-[ID]?w=800&h=1200&fit=crop
```

## Remarques importantes

- **Droits d'auteur** : Assurez-vous d'avoir le droit d'utiliser les images
- **Taille** : Utilisez des images de bonne qualité (minimum 800x1200px)
- **Format** : JPG ou PNG recommandés
- **Optimisation** : Compressez les images pour améliorer les performances

