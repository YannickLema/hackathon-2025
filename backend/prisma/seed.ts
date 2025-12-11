import { PrismaClient, ListingCategory, SaleMode, ListingStatus, Role } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Charger le .env depuis la racine du projet
config({ path: resolve(__dirname, '../../.env') });

// Ajuster DATABASE_URL si on est hors Docker
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@db:')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('@db:', '@localhost:');
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // Vérifier si un utilisateur professionnel existe
  let professionalUser = await prisma.user.findFirst({
    where: { role: Role.PROFESSIONNEL },
  });

  // Si aucun professionnel n'existe, en créer un
  if (!professionalUser) {
    console.log('📝 Création d\'un utilisateur professionnel de test...');
    professionalUser = await prisma.user.create({
      data: {
        email: 'professionnel@test.com',
        password: '$2b$10$rK8Q8Q8Q8Q8Q8Q8Q8Q8Q8O8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q', // password: test123
        role: Role.PROFESSIONNEL,
        firstName: 'Jean',
        lastName: 'Dupont',
        emailVerified: true,
        status: 'VERIFIED',
        professionnelProfile: {
          create: {
            companyName: 'Galerie Dupont',
            siret: '12345678901234',
            postalAddress: '123 Rue de la Paix, 75001 Paris',
            officialDocument: 'https://example.com/kbis.pdf',
            specialities: ['Art ancien', 'Bijoux', 'Montres'],
            mostSearchedItems: ['Peintures', 'Sculptures', 'Objets d\'art'],
          },
        },
      },
    });
    console.log('✅ Utilisateur professionnel créé:', professionalUser.email);
  }

  // Vérifier si des listings existent déjà
  const existingListings = await prisma.listing.count();
  if (existingListings > 0) {
    console.log(`⚠️  ${existingListings} listings existent déjà. Voulez-vous continuer ?`);
    // Pour l'instant, on continue quand même
  }

  // Données de produits de test
  const testListings = [
    {
      title: 'Montre de collection Rolex Submariner 1960',
      category: ListingCategory.MONTRE,
      dimensions: '42mm x 13mm',
      weightKg: 0.15,
      description: 'Magnifique montre de collection Rolex Submariner datant de 1960. En excellent état, avec boîte et papiers d\'origine. Mouvement automatique fonctionnel. Bracelet original en acier inoxydable.',
      priceDesired: 15000,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 13500,
      photos: [
        { url: 'https://cdn.pixabay.com/photo/2015/11/07/11/46/wristwatch-1031019_1280.jpg', position: 0 },
        { url: 'https://cdn.pixabay.com/photo/2015/11/07/11/46/wristwatch-1031019_1280.jpg', position: 1 },
        { url: 'https://cdn.pixabay.com/photo/2015/11/07/11/46/wristwatch-1031019_1280.jpg', position: 2 },
        { url: 'https://cdn.pixabay.com/photo/2015/11/07/11/46/wristwatch-1031019_1280.jpg', position: 3 },
        { url: 'https://cdn.pixabay.com/photo/2015/11/07/11/46/wristwatch-1031019_1280.jpg', position: 4 },
        { url: 'https://cdn.pixabay.com/photo/2015/11/07/11/46/wristwatch-1031019_1280.jpg', position: 5 },
        { url: 'https://cdn.pixabay.com/photo/2015/11/07/11/46/wristwatch-1031019_1280.jpg', position: 6 },
        { url: 'https://cdn.pixabay.com/photo/2015/11/07/11/46/wristwatch-1031019_1280.jpg', position: 7 },
        { url: 'https://cdn.pixabay.com/photo/2015/11/07/11/46/wristwatch-1031019_1280.jpg', position: 8 },
        { url: 'https://cdn.pixabay.com/photo/2015/11/07/11/46/wristwatch-1031019_1280.jpg', position: 9 },
      ],
    },
    {
      title: 'Peinture à l\'huile - Paysage de Provence',
      category: ListingCategory.PEINTURE,
      dimensions: '60cm x 80cm',
      weightKg: 2.5,
      description: 'Superbe peinture à l\'huile représentant un paysage de Provence. Signée par l\'artiste, datée de 1985. Encadrée dans un cadre doré ancien. Excellent état de conservation.',
      priceDesired: 3500,
      saleMode: SaleMode.INSTANT_SALE,
      photos: [
        { url: 'https://cdn.pixabay.com/photo/2018/11/30/18/53/church-3848348_1280.jpg', position: 0 },
        { url: 'https://cdn.pixabay.com/photo/2018/11/30/18/53/church-3848348_1280.jpg', position: 1 },
        { url: 'https://cdn.pixabay.com/photo/2018/11/30/18/53/church-3848348_1280.jpg', position: 2 },
        { url: 'https://cdn.pixabay.com/photo/2018/11/30/18/53/church-3848348_1280.jpg', position: 3 },
        { url: 'https://cdn.pixabay.com/photo/2018/11/30/18/53/church-3848348_1280.jpg', position: 4 },
        { url: 'https://cdn.pixabay.com/photo/2018/11/30/18/53/church-3848348_1280.jpg', position: 5 },
        { url: 'https://cdn.pixabay.com/photo/2018/11/30/18/53/church-3848348_1280.jpg', position: 6 },
        { url: 'https://cdn.pixabay.com/photo/2018/11/30/18/53/church-3848348_1280.jpg', position: 7 },
        { url: 'https://cdn.pixabay.com/photo/2018/11/30/18/53/church-3848348_1280.jpg', position: 8 },
        { url: 'https://cdn.pixabay.com/photo/2018/11/30/18/53/church-3848348_1280.jpg', position: 9 },
      ],
    },
    {
      title: 'Collier en or et diamants - Art Déco',
      category: ListingCategory.BIJOU,
      dimensions: 'Longueur: 45cm',
      weightKg: 0.08,
      description: 'Magnifique collier en or 18 carats avec diamants, style Art Déco des années 1920. Pièce authentique et rare. Certificat d\'authenticité inclus. État impeccable.',
      priceDesired: 8500,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 7650,
      photos: [
        { url: 'https://cdn.pixabay.com/photo/2014/03/06/21/57/coffer-281251_1280.jpg', position: 0 },
        { url: 'https://cdn.pixabay.com/photo/2014/03/06/21/57/coffer-281251_1280.jpg', position: 1 },
        { url: 'https://cdn.pixabay.com/photo/2014/03/06/21/57/coffer-281251_1280.jpg', position: 2 },
        { url: 'https://cdn.pixabay.com/photo/2014/03/06/21/57/coffer-281251_1280.jpg', position: 3 },
        { url: 'https://cdn.pixabay.com/photo/2014/03/06/21/57/coffer-281251_1280.jpg', position: 4 },
        { url: 'https://cdn.pixabay.com/photo/2014/03/06/21/57/coffer-281251_1280.jpg', position: 5 },
        { url: 'https://cdn.pixabay.com/photo/2014/03/06/21/57/coffer-281251_1280.jpg', position: 6 },
        { url: 'https://cdn.pixabay.com/photo/2014/03/06/21/57/coffer-281251_1280.jpg', position: 7 },
        { url: 'https://cdn.pixabay.com/photo/2014/03/06/21/57/coffer-281251_1280.jpg', position: 8 },
        { url: 'https://cdn.pixabay.com/photo/2014/03/06/21/57/coffer-281251_1280.jpg', position: 9 },
      ],
    },
    {
      title: 'Sculpture en bronze - Figure féminine',
      category: ListingCategory.SCULPTURE,
      dimensions: 'Hauteur: 45cm, Largeur: 25cm, Profondeur: 20cm',
      weightKg: 8.5,
      description: 'Élégante sculpture en bronze représentant une figure féminine. Signée par l\'artiste, datée de 1970. Patine originale préservée. Pièce unique et authentique.',
      priceDesired: 4200,
      saleMode: SaleMode.INSTANT_SALE,
      photos: [
        { url: 'https://cdn.pixabay.com/photo/2021/12/30/16/46/bells-6904308_1280.jpg', position: 0 },
        { url: 'https://cdn.pixabay.com/photo/2021/12/30/16/46/bells-6904308_1280.jpg', position: 1 },
        { url: 'https://cdn.pixabay.com/photo/2021/12/30/16/46/bells-6904308_1280.jpg', position: 2 },
        { url: 'https://cdn.pixabay.com/photo/2021/12/30/16/46/bells-6904308_1280.jpg', position: 3 },
        { url: 'https://cdn.pixabay.com/photo/2021/12/30/16/46/bells-6904308_1280.jpg', position: 4 },
        { url: 'https://cdn.pixabay.com/photo/2021/12/30/16/46/bells-6904308_1280.jpg', position: 5 },
        { url: 'https://cdn.pixabay.com/photo/2021/12/30/16/46/bells-6904308_1280.jpg', position: 6 },
        { url: 'https://cdn.pixabay.com/photo/2021/12/30/16/46/bells-6904308_1280.jpg', position: 7 },
        { url: 'https://cdn.pixabay.com/photo/2021/12/30/16/46/bells-6904308_1280.jpg', position: 8 },
        { url: 'https://cdn.pixabay.com/photo/2021/12/30/16/46/bells-6904308_1280.jpg', position: 9 },
      ],
    },
    {
      title: 'Photographie ancienne - Portrait de famille 1900',
      category: ListingCategory.PHOTOGRAPHIE,
      dimensions: '20cm x 25cm',
      weightKg: 0.05,
      description: 'Photographie ancienne sur papier albuminé, représentant un portrait de famille datant de 1900. Excellent état de conservation. Encadrée dans un cadre d\'époque.',
      priceDesired: 450,
      saleMode: SaleMode.INSTANT_SALE,
      photos: [
        { url: 'https://cdn.pixabay.com/photo/2015/04/07/14/34/camera-711040_1280.jpg', position: 0 },
        { url: 'https://cdn.pixabay.com/photo/2015/04/07/14/34/camera-711040_1280.jpg', position: 1 },
        { url: 'https://cdn.pixabay.com/photo/2015/04/07/14/34/camera-711040_1280.jpg', position: 2 },
        { url: 'https://cdn.pixabay.com/photo/2015/04/07/14/34/camera-711040_1280.jpg', position: 3 },
        { url: 'https://cdn.pixabay.com/photo/2015/04/07/14/34/camera-711040_1280.jpg', position: 4 },
        { url: 'https://cdn.pixabay.com/photo/2015/04/07/14/34/camera-711040_1280.jpg', position: 5 },
        { url: 'https://cdn.pixabay.com/photo/2015/04/07/14/34/camera-711040_1280.jpg', position: 6 },
        { url: 'https://cdn.pixabay.com/photo/2015/04/07/14/34/camera-711040_1280.jpg', position: 7 },
        { url: 'https://cdn.pixabay.com/photo/2015/04/07/14/34/camera-711040_1280.jpg', position: 8 },
        { url: 'https://cdn.pixabay.com/photo/2015/04/07/14/34/camera-711040_1280.jpg', position: 9 },
      ],
    },
    {
      title: 'Meuble ancien - Commode Louis XVI',
      category: ListingCategory.DESIGN,
      dimensions: '120cm x 60cm x 80cm',
      weightKg: 45,
      description: 'Superbe commode en bois massif de style Louis XVI. Marqueterie d\'époque, poignées en bronze doré originales. Restauration professionnelle récente. Pièce authentique et rare.',
      priceDesired: 12000,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 10800,
      photos: [
        { url: 'https://cdn.pixabay.com/photo/2017/07/11/12/11/chair-backrest-2493326_1280.jpg', position: 0 },
        { url: 'https://cdn.pixabay.com/photo/2017/07/11/12/11/chair-backrest-2493326_1280.jpg', position: 1 },
        { url: 'https://cdn.pixabay.com/photo/2017/07/11/12/11/chair-backrest-2493326_1280.jpg', position: 2 },
        { url: 'https://cdn.pixabay.com/photo/2017/07/11/12/11/chair-backrest-2493326_1280.jpg', position: 3 },
        { url: 'https://cdn.pixabay.com/photo/2017/07/11/12/11/chair-backrest-2493326_1280.jpg', position: 4 },
        { url: 'https://cdn.pixabay.com/photo/2017/07/11/12/11/chair-backrest-2493326_1280.jpg', position: 5 },
        { url: 'https://cdn.pixabay.com/photo/2017/07/11/12/11/chair-backrest-2493326_1280.jpg', position: 6 },
        { url: 'https://cdn.pixabay.com/photo/2017/07/11/12/11/chair-backrest-2493326_1280.jpg', position: 7 },
        { url: 'https://cdn.pixabay.com/photo/2017/07/11/12/11/chair-backrest-2493326_1280.jpg', position: 8 },
        { url: 'https://cdn.pixabay.com/photo/2017/07/11/12/11/chair-backrest-2493326_1280.jpg', position: 9 },
      ],
    },
    {
      title: 'Violon ancien - Stradivarius réplique',
      category: ListingCategory.AUTRE,
      dimensions: 'Longueur: 59cm',
      weightKg: 0.6,
      description: 'Magnifique violon ancien, réplique de Stradivarius. Daté de 1850, en excellent état. Son exceptionnel. Certificat d\'authenticité et étui d\'origine inclus.',
      priceDesired: 5500,
      saleMode: SaleMode.INSTANT_SALE,
      photos: [
        { url: 'https://cdn.pixabay.com/photo/2020/12/09/18/42/violin-5818267_1280.jpg', position: 0 },
        { url: 'https://cdn.pixabay.com/photo/2020/12/09/18/42/violin-5818267_1280.jpg', position: 1 },
        { url: 'https://cdn.pixabay.com/photo/2020/12/09/18/42/violin-5818267_1280.jpg', position: 2 },
        { url: 'https://cdn.pixabay.com/photo/2020/12/09/18/42/violin-5818267_1280.jpg', position: 3 },
        { url: 'https://cdn.pixabay.com/photo/2020/12/09/18/42/violin-5818267_1280.jpg', position: 4 },
        { url: 'https://cdn.pixabay.com/photo/2020/12/09/18/42/violin-5818267_1280.jpg', position: 5 },
        { url: 'https://cdn.pixabay.com/photo/2020/12/09/18/42/violin-5818267_1280.jpg', position: 6 },
        { url: 'https://cdn.pixabay.com/photo/2020/12/09/18/42/violin-5818267_1280.jpg', position: 7 },
        { url: 'https://cdn.pixabay.com/photo/2020/12/09/18/42/violin-5818267_1280.jpg', position: 8 },
        { url: 'https://cdn.pixabay.com/photo/2020/12/09/18/42/violin-5818267_1280.jpg', position: 9 },
      ],
    },
    {
      title: 'Sac à main Hermès Birkin - Cuir noir',
      category: ListingCategory.ACCESSOIRE,
      dimensions: '30cm x 22cm x 16cm',
      weightKg: 1.2,
      description: 'Authentique sac à main Hermès Birkin en cuir noir. Modèle rare et recherché. Excellent état, avec serrure, clés et boîte d\'origine. Certificat d\'authenticité inclus.',
      priceDesired: 25000,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 22500,
      photos: [
        { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop', position: 0 },
        { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop', position: 1 },
        { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop', position: 2 },
        { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop', position: 3 },
        { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop', position: 4 },
        { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop', position: 5 },
        { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop', position: 6 },
        { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop', position: 7 },
        { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop', position: 8 },
        { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop', position: 9 },
      ],
    },
    {
      title: 'Vase en porcelaine de Sèvres - XVIIIe siècle',
      category: ListingCategory.OBJET_ART,
      dimensions: 'Hauteur: 35cm, Diamètre: 20cm',
      weightKg: 1.8,
      description: 'Exceptionnel vase en porcelaine de Sèvres datant du XVIIIe siècle. Décor floral bleu et or. Marque de manufacture authentique. État de conservation remarquable.',
      priceDesired: 6800,
      saleMode: SaleMode.INSTANT_SALE,
      photos: [
        { url: 'https://cdn.pixabay.com/photo/2018/06/18/18/04/dishes-3483005_1280.jpg', position: 0 },
        { url: 'https://cdn.pixabay.com/photo/2018/06/18/18/04/dishes-3483005_1280.jpg', position: 1 },
        { url: 'https://cdn.pixabay.com/photo/2018/06/18/18/04/dishes-3483005_1280.jpg', position: 2 },
        { url: 'https://cdn.pixabay.com/photo/2018/06/18/18/04/dishes-3483005_1280.jpg', position: 3 },
        { url: 'https://cdn.pixabay.com/photo/2018/06/18/18/04/dishes-3483005_1280.jpg', position: 4 },
        { url: 'https://cdn.pixabay.com/photo/2018/06/18/18/04/dishes-3483005_1280.jpg', position: 5 },
        { url: 'https://cdn.pixabay.com/photo/2018/06/18/18/04/dishes-3483005_1280.jpg', position: 6 },
        { url: 'https://cdn.pixabay.com/photo/2018/06/18/18/04/dishes-3483005_1280.jpg', position: 7 },
        { url: 'https://cdn.pixabay.com/photo/2018/06/18/18/04/dishes-3483005_1280.jpg', position: 8 },
        { url: 'https://cdn.pixabay.com/photo/2018/06/18/18/04/dishes-3483005_1280.jpg', position: 9 },
      ],
    },
    {
      title: 'Livre ancien - Première édition 1850',
      category: ListingCategory.AUTRE,
      dimensions: '22cm x 15cm x 3cm',
      weightKg: 0.8,
      description: 'Livre ancien, première édition datant de 1850. Reliure en cuir d\'époque, pages en excellent état. Ouvrage rare et recherché par les collectionneurs.',
      priceDesired: 1200,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 1080,
      photos: [
        { url: 'https://cdn.pixabay.com/photo/2014/09/05/18/32/old-books-436498_1280.jpg', position: 0 },
        { url: 'https://cdn.pixabay.com/photo/2014/09/05/18/32/old-books-436498_1280.jpg', position: 1 },
        { url: 'https://cdn.pixabay.com/photo/2014/09/05/18/32/old-books-436498_1280.jpg', position: 2 },
        { url: 'https://cdn.pixabay.com/photo/2014/09/05/18/32/old-books-436498_1280.jpg', position: 3 },
        { url: 'https://cdn.pixabay.com/photo/2014/09/05/18/32/old-books-436498_1280.jpg', position: 4 },
        { url: 'https://cdn.pixabay.com/photo/2014/09/05/18/32/old-books-436498_1280.jpg', position: 5 },
        { url: 'https://cdn.pixabay.com/photo/2014/09/05/18/32/old-books-436498_1280.jpg', position: 6 },
        { url: 'https://cdn.pixabay.com/photo/2014/09/05/18/32/old-books-436498_1280.jpg', position: 7 },
        { url: 'https://cdn.pixabay.com/photo/2014/09/05/18/32/old-books-436498_1280.jpg', position: 8 },
        { url: 'https://cdn.pixabay.com/photo/2014/09/05/18/32/old-books-436498_1280.jpg', position: 9 },
      ],
    },
  ];

  // Créer les listings
  console.log('📦 Création des produits...');
  const now = new Date();
  
  for (const listing of testListings) {
    const auctionEndAt = listing.saleMode === SaleMode.AUCTION
      ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      : null;

    const created = await prisma.listing.create({
      data: {
        sellerId: professionalUser.id,
        title: listing.title,
        category: listing.category,
        dimensions: listing.dimensions,
        weightKg: listing.weightKg,
        description: listing.description,
        priceDesired: listing.priceDesired,
        saleMode: listing.saleMode,
        auctionStartPrice: listing.auctionStartPrice || null,
        auctionEndAt: auctionEndAt,
        publishedAt: now,
        status: ListingStatus.PUBLISHED,
        photos: {
          create: listing.photos,
        },
      },
    });

    console.log(`✅ Produit créé: ${created.title}`);
  }

  console.log(`\n🎉 Seed terminé ! ${testListings.length} produits créés.`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

