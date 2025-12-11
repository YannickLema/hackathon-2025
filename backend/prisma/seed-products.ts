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
  console.log('🌱 Début du chargement des produits...\n');

  // Récupérer les utilisateurs existants
  const particulier = await prisma.user.findUnique({
    where: { email: 'particulier@test.com' },
  });

  const professionnel = await prisma.user.findUnique({
    where: { email: 'professionnel@test.com' },
  });

  if (!particulier) {
    console.log('⚠️  Utilisateur particulier non trouvé. Créez-le d\'abord avec create-users.ts');
    return;
  }

  if (!professionnel) {
    console.log('⚠️  Utilisateur professionnel non trouvé. Créez-le d\'abord avec create-users.ts');
    return;
  }

  // Vérifier si des produits existent déjà
  const existingCount = await prisma.listing.count();
  if (existingCount > 0) {
    console.log(`⚠️  ${existingCount} produits existent déjà. Suppression...`);
    // Supprimer les relations d'abord
    try {
      await prisma.$executeRaw`DELETE FROM bids WHERE "listingId" IN (SELECT id FROM listings)`;
    } catch (e) {
      // Ignorer si la table n'existe pas encore
    }
    await prisma.listingPhoto.deleteMany();
    await prisma.listingDocument.deleteMany();
    await prisma.listing.deleteMany();
    console.log('✅ Anciens produits supprimés\n');
  }

  const now = new Date();

  // Produits créés par des particuliers
  const particulierListings = [
    {
      title: 'Vase en porcelaine de famille - XIXe siècle',
      category: ListingCategory.OBJETS_ART_TABLEAUX,
      dimensions: 'Hauteur: 30cm, Diamètre: 15cm',
      weightKg: 1.2,
      description: 'Magnifique vase en porcelaine hérité de ma grand-mère, datant du XIXe siècle. Décor floral délicat, quelques signes d\'usure mais en bon état général. Certificat d\'authenticité disponible.',
      priceDesired: 850,
      saleMode: SaleMode.INSTANT_SALE,
      sellerId: particulier.id,
      photos: Array.from({ length: 10 }, (_, i) => ({
        url: `https://cdn.pixabay.com/photo/2018/06/18/18/04/dishes-3483005_1280.jpg`,
        position: i,
      })),
    },
    {
      title: 'Tableau peinture à l\'huile - Paysage montagneux',
      category: ListingCategory.OBJETS_ART_TABLEAUX,
      dimensions: '50cm x 70cm',
      weightKg: 2.8,
      description: 'Tableau peinture à l\'huile représentant un paysage montagneux. Signé par l\'artiste, daté de 1995. Encadré dans un cadre en bois. Excellent état.',
      priceDesired: 1200,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 1080,
      auctionEndAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      sellerId: particulier.id,
      photos: Array.from({ length: 10 }, (_, i) => ({
        url: `https://cdn.pixabay.com/photo/2018/11/30/18/53/church-3848348_1280.jpg`,
        position: i,
      })),
    },
    {
      title: 'Montre ancienne - Marque suisse',
      category: ListingCategory.BIJOUX_MONTRES,
      dimensions: '40mm de diamètre',
      weightKg: 0.12,
      description: 'Montre ancienne de marque suisse, mécanisme manuel. Boîtier en or, cadran émaillé. Fonctionne correctement. Bracelet en cuir d\'origine.',
      priceDesired: 2500,
      saleMode: SaleMode.INSTANT_SALE,
      sellerId: particulier.id,
      photos: Array.from({ length: 10 }, (_, i) => ({
        url: `https://cdn.pixabay.com/photo/2015/11/07/11/46/wristwatch-1031019_1280.jpg`,
        position: i,
      })),
    },
  ];

  // Produits créés par des professionnels
  const professionnelListings = [
    {
      title: 'Montre de collection Rolex Submariner 1960',
      category: ListingCategory.BIJOUX_MONTRES,
      dimensions: '42mm x 13mm',
      weightKg: 0.15,
      description: 'Magnifique montre de collection Rolex Submariner datant de 1960. En excellent état, avec boîte et papiers d\'origine. Mouvement automatique fonctionnel. Bracelet original en acier inoxydable.',
      priceDesired: 15000,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 13500,
      auctionEndAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      sellerId: professionnel.id,
      photos: Array.from({ length: 10 }, (_, i) => ({
        url: `https://cdn.pixabay.com/photo/2015/11/07/11/46/wristwatch-1031019_1280.jpg`,
        position: i,
      })),
    },
    {
      title: 'Peinture à l\'huile - Paysage de Provence',
      category: ListingCategory.OBJETS_ART_TABLEAUX,
      dimensions: '60cm x 80cm',
      weightKg: 2.5,
      description: 'Superbe peinture à l\'huile représentant un paysage de Provence. Signée par l\'artiste, datée de 1985. Encadrée dans un cadre doré ancien. Excellent état de conservation.',
      priceDesired: 3500,
      saleMode: SaleMode.INSTANT_SALE,
      sellerId: professionnel.id,
      photos: Array.from({ length: 10 }, (_, i) => ({
        url: `https://cdn.pixabay.com/photo/2018/11/30/18/53/church-3848348_1280.jpg`,
        position: i,
      })),
    },
    {
      title: 'Collier en or et diamants - Art Déco',
      category: ListingCategory.BIJOUX_MONTRES,
      dimensions: 'Longueur: 45cm',
      weightKg: 0.08,
      description: 'Magnifique collier en or 18 carats avec diamants, style Art Déco des années 1920. Pièce authentique et rare. Certificat d\'authenticité inclus. État impeccable.',
      priceDesired: 8500,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 7650,
      auctionEndAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      sellerId: professionnel.id,
      photos: Array.from({ length: 10 }, (_, i) => ({
        url: `https://cdn.pixabay.com/photo/2014/03/06/21/57/coffer-281251_1280.jpg`,
        position: i,
      })),
    },
    {
      title: 'Sculpture en bronze - Figure féminine',
      category: ListingCategory.SCULPTURES_DECORATION,
      dimensions: 'Hauteur: 45cm, Largeur: 25cm, Profondeur: 20cm',
      weightKg: 8.5,
      description: 'Élégante sculpture en bronze représentant une figure féminine. Signée par l\'artiste, datée de 1970. Patine originale préservée. Pièce unique et authentique.',
      priceDesired: 4200,
      saleMode: SaleMode.INSTANT_SALE,
      sellerId: professionnel.id,
      photos: Array.from({ length: 10 }, (_, i) => ({
        url: `https://cdn.pixabay.com/photo/2021/12/30/16/46/bells-6904308_1280.jpg`,
        position: i,
      })),
    },
    {
      title: 'Sac à main Hermès Birkin - Cuir noir',
      category: ListingCategory.MODE_ACCESSOIRES_LUXE,
      dimensions: '30cm x 22cm x 16cm',
      weightKg: 1.2,
      description: 'Authentique sac à main Hermès Birkin en cuir noir. Modèle rare et recherché. Excellent état, avec serrure, clés et boîte d\'origine. Certificat d\'authenticité inclus.',
      priceDesired: 25000,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 22500,
      auctionEndAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      sellerId: professionnel.id,
      photos: Array.from({ length: 10 }, (_, i) => ({
        url: `https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop`,
        position: i,
      })),
    },
  ];

  console.log('📦 Création des produits par des particuliers...');
  for (const listing of particulierListings) {
    const created = await prisma.listing.create({
      data: {
        sellerId: listing.sellerId,
        title: listing.title,
        category: listing.category,
        dimensions: listing.dimensions,
        weightKg: listing.weightKg,
        description: listing.description,
        priceDesired: listing.priceDesired,
        saleMode: listing.saleMode,
        auctionStartPrice: listing.auctionStartPrice || null,
        auctionEndAt: listing.auctionEndAt || null,
        publishedAt: now,
        status: ListingStatus.PUBLISHED,
        photos: {
          create: listing.photos,
        },
      },
    });
    console.log(`✅ ${created.title} (Particulier)`);
  }

  console.log('\n📦 Création des produits par des professionnels...');
  for (const listing of professionnelListings) {
    const created = await prisma.listing.create({
      data: {
        sellerId: listing.sellerId,
        title: listing.title,
        category: listing.category,
        dimensions: listing.dimensions,
        weightKg: listing.weightKg,
        description: listing.description,
        priceDesired: listing.priceDesired,
        saleMode: listing.saleMode,
        auctionStartPrice: listing.auctionStartPrice || null,
        auctionEndAt: listing.auctionEndAt || null,
        publishedAt: now,
        status: ListingStatus.PUBLISHED,
        photos: {
          create: listing.photos,
        },
      },
    });
    console.log(`✅ ${created.title} (Professionnel)`);
  }

  const total = particulierListings.length + professionnelListings.length;
  console.log(`\n🎉 Terminé ! ${total} produits créés.`);
  console.log(`   - ${particulierListings.length} produits par des particuliers`);
  console.log(`   - ${professionnelListings.length} produits par des professionnels`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du chargement des produits:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

