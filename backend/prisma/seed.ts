import { PrismaClient, SaleMode, ListingStatus, Role } from '@prisma/client';
import { resolve } from 'path';
import { config } from 'dotenv';
import { randomUUID } from 'crypto';

// Charger le .env depuis la racine du projet
config({ path: resolve(__dirname, '../../.env') });

// Ajuster DATABASE_URL uniquement hors Docker
const inDocker =
  process.env.DOCKER === 'true' ||
  process.env.IN_DOCKER === 'true' ||
  process.env.CONTAINER === 'true';
if (!inDocker && process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@db:')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('@db:', '@localhost:');
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // Charger les catégories et préparer un helper code -> id
  const categories = await prisma.$queryRaw<Array<{ id: string; code: string }>>`
    SELECT id, code FROM categories WHERE "isActive" = true
  `;
  const catByCode = new Map<string, string>(categories.map((c) => [c.code, c.id]));
  const cat = (code: string): string => {
    const found = catByCode.get(code);
    if (!found) {
      const autre = catByCode.get('AUTRE');
      if (!autre) throw new Error('Aucune catégorie trouvée (y compris AUTRE)');
      return autre;
    }
    return found;
  };

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


  // Supprimer les anciens listings pour repartir à zéro
  const existingCount = await prisma.listing.count();
  if (existingCount > 0) {
    console.log(`🗑️  Suppression de ${existingCount} anciens listings...`);
    await prisma.listingPhoto.deleteMany();
    await prisma.listingDocument.deleteMany();
    await prisma.listing.deleteMany();
    console.log('✅ Anciens listings supprimés\n');
  }

  // Mapper les codes de catégories vers les enums de l'ancien système
  const categoryCodeToEnum = (code: string): string => {
    const mapping: Record<string, string> = {
      'BIJOUX_MONTRES': 'MONTRE',
      'OBJETS_ART_TABLEAUX': 'OBJET_ART',
      'SCULPTURES_DECORATION': 'SCULPTURE',
      'MODE_ACCESSOIRES_LUXE': 'ACCESSOIRE',
      'MEUBLES_ANCIENS': 'DESIGN',
      'VINS_SPIRITUEUX': 'AUTRE',
      'INSTRUMENTS_MUSIQUE': 'AUTRE',
      'LIVRES_MANUSCRITS': 'AUTRE',
      'PHOTOGRAPHIES_ANCIENNES': 'PHOTOGRAPHIE',
      'HORLOGERIE_PENDULES': 'MONTRE',
      'AUTRE': 'AUTRE',
    };
    return mapping[code] || 'AUTRE';
  };

  // Données de produits réels avec images variées
  const testListings = [
    {
      title: 'Montre de collection Rolex Submariner 1960',
      categoryCode: 'BIJOUX_MONTRES',
      dimensions: '42mm x 13mm',
      weightKg: 0.15,
      description: 'Magnifique montre de collection Rolex Submariner datant de 1960. En excellent état, avec boîte et papiers d\'origine. Mouvement automatique fonctionnel. Bracelet original en acier inoxydable. Certificat d\'authenticité inclus.',
      priceDesired: 15000,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 13500,
      photos: [
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', position: 0 },
        { url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800', position: 1 },
        { url: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=800', position: 2 },
        { url: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800', position: 3 },
        { url: 'https://images.unsplash.com/photo-1611591437281-8bfd43f443c1?w=800', position: 4 },
      ],
    },
    {
      title: 'Peinture à l\'huile - Paysage de Provence',
      categoryCode: 'OBJETS_ART_TABLEAUX',
      dimensions: '60cm x 80cm',
      weightKg: 2.5,
      description: 'Superbe peinture à l\'huile représentant un paysage de Provence. Signée par l\'artiste, datée de 1985. Encadrée dans un cadre doré ancien. Excellent état de conservation. Technique maîtrisée, couleurs vives et harmonieuses.',
      priceDesired: 3500,
      saleMode: SaleMode.INSTANT_SALE,
      photos: [
        { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', position: 0 },
        { url: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800', position: 1 },
        { url: 'https://images.unsplash.com/photo-1579783902614-a53fb8587b73?w=800', position: 2 },
        { url: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800', position: 3 },
        { url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800', position: 4 },
      ],
    },
    {
      title: 'Collier en or et diamants - Art Déco',
      categoryCode: 'BIJOUX_MONTRES',
      dimensions: 'Longueur: 45cm',
      weightKg: 0.08,
      description: 'Magnifique collier en or 18 carats avec diamants, style Art Déco des années 1920. Pièce authentique et rare. Certificat d\'authenticité inclus. État impeccable. Design géométrique caractéristique de l\'époque.',
      priceDesired: 8500,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 7650,
      photos: [
        { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', position: 0 },
        { url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800', position: 1 },
        { url: 'https://images.unsplash.com/photo-1611591437281-8bfd43f443c1?w=800', position: 2 },
        { url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', position: 3 },
        { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', position: 4 },
      ],
    },
    {
      title: 'Sculpture en bronze - Figure féminine',
      categoryCode: 'SCULPTURES_DECORATION',
      dimensions: 'Hauteur: 45cm, Largeur: 25cm, Profondeur: 20cm',
      weightKg: 8.5,
      description: 'Élégante sculpture en bronze représentant une figure féminine. Signée par l\'artiste, datée de 1970. Patine originale préservée. Pièce unique et authentique. Détails fins et expression artistique remarquable.',
      priceDesired: 4200,
      saleMode: SaleMode.INSTANT_SALE,
      photos: [
        { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', position: 0 },
        { url: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800', position: 1 },
        { url: 'https://images.unsplash.com/photo-1579783902614-a53fb8587b73?w=800', position: 2 },
        { url: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800', position: 3 },
        { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', position: 4 },
      ],
    },
    {
      title: 'Photographie ancienne - Portrait de famille 1900',
      categoryCode: 'PHOTOGRAPHIES_ANCIENNES',
      dimensions: '20cm x 25cm',
      weightKg: 0.05,
      description: 'Photographie ancienne sur papier albuminé, représentant un portrait de famille datant de 1900. Excellent état de conservation. Encadrée dans un cadre d\'époque. Document historique précieux.',
      priceDesired: 450,
      saleMode: SaleMode.INSTANT_SALE,
      photos: [
        { url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800', position: 0 },
        { url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800', position: 1 },
        { url: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800', position: 2 },
        { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', position: 3 },
        { url: 'https://images.unsplash.com/photo-1579783902614-a53fb8587b73?w=800', position: 4 },
      ],
    },
    {
      title: 'Meuble ancien - Commode Louis XVI',
      categoryCode: 'MEUBLES_ANCIENS',
      dimensions: '120cm x 60cm x 80cm',
      weightKg: 45,
      description: 'Superbe commode en bois massif de style Louis XVI. Marqueterie d\'époque, poignées en bronze doré originales. Restauration professionnelle récente. Pièce authentique et rare. Provenance certifiée.',
      priceDesired: 12000,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 10800,
      photos: [
        { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', position: 0 },
        { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', position: 1 },
        { url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800', position: 2 },
        { url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800', position: 3 },
        { url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', position: 4 },
      ],
    },
    {
      title: 'Violon ancien - Stradivarius réplique',
      categoryCode: 'INSTRUMENTS_MUSIQUE',
      dimensions: 'Longueur: 59cm',
      weightKg: 0.6,
      description: 'Magnifique violon ancien, réplique de Stradivarius. Daté de 1850, en excellent état. Son exceptionnel. Certificat d\'authenticité et étui d\'origine inclus. Instrument de qualité professionnelle.',
      priceDesired: 5500,
      saleMode: SaleMode.INSTANT_SALE,
      photos: [
        { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', position: 0 },
        { url: 'https://images.unsplash.com/photo-1511192336575-5a9afd8f8c58?w=800', position: 1 },
        { url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800', position: 2 },
        { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', position: 3 },
        { url: 'https://images.unsplash.com/photo-1511192336575-5a9afd8f8c58?w=800', position: 4 },
      ],
    },
    {
      title: 'Sac à main Hermès Birkin - Cuir noir',
      categoryCode: 'MODE_ACCESSOIRES_LUXE',
      dimensions: '30cm x 22cm x 16cm',
      weightKg: 1.2,
      description: 'Authentique sac à main Hermès Birkin en cuir noir. Modèle rare et recherché. Excellent état, avec serrure, clés et boîte d\'origine. Certificat d\'authenticité inclus. Pièce de collection prestigieuse.',
      priceDesired: 25000,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 22500,
      photos: [
        { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800', position: 0 },
        { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', position: 1 },
        { url: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800', position: 2 },
        { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', position: 3 },
        { url: 'https://images.unsplash.com/photo-1564422170191-4bd349ca3ac1?w=800', position: 4 },
      ],
    },
    {
      title: 'Vase en porcelaine de Sèvres - XVIIIe siècle',
      categoryCode: 'OBJETS_ART_TABLEAUX',
      dimensions: 'Hauteur: 35cm, Diamètre: 20cm',
      weightKg: 1.8,
      description: 'Exceptionnel vase en porcelaine de Sèvres datant du XVIIIe siècle. Décor floral bleu et or. Marque de manufacture authentique. État de conservation remarquable. Pièce de musée.',
      priceDesired: 6800,
      saleMode: SaleMode.INSTANT_SALE,
      photos: [
        { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', position: 0 },
        { url: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800', position: 1 },
        { url: 'https://images.unsplash.com/photo-1579783902614-a53fb8587b73?w=800', position: 2 },
        { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', position: 3 },
        { url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800', position: 4 },
      ],
    },
    {
      title: 'Livre ancien - Première édition 1850',
      categoryCode: 'LIVRES_MANUSCRITS',
      dimensions: '22cm x 15cm x 3cm',
      weightKg: 0.8,
      description: 'Livre ancien, première édition datant de 1850. Reliure en cuir d\'époque, pages en excellent état. Ouvrage rare et recherché par les collectionneurs. Provenance certifiée.',
      priceDesired: 1200,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 1080,
      photos: [
        { url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', position: 0 },
        { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', position: 1 },
        { url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800', position: 2 },
        { url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800', position: 3 },
        { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', position: 4 },
      ],
    },
    {
      title: 'Tableau impressionniste - Bord de mer',
      categoryCode: 'OBJETS_ART_TABLEAUX',
      dimensions: '50cm x 70cm',
      weightKg: 1.8,
      description: 'Huile sur toile style impressionniste, bord de mer. Signée, datée 1952. Technique maîtrisée, couleurs vives et harmonieuses. Encadrement d\'époque.',
      priceDesired: 3200,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 2800,
      photos: [
        { url: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800', position: 0 },
        { url: 'https://images.unsplash.com/photo-1579783902614-a53fb8587b73?w=800', position: 1 },
        { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', position: 2 },
        { url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800', position: 3 },
        { url: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800', position: 4 },
      ],
    },
    {
      title: 'Sculpture contemporaine en acier',
      categoryCode: 'SCULPTURES_DECORATION',
      dimensions: '120cm x 40cm x 30cm',
      weightKg: 12,
      description: 'Sculpture moderne en acier brossé, pièce unique. Design épuré et contemporain. Signée par l\'artiste. Parfaite pour un intérieur moderne.',
      priceDesired: 5400,
      saleMode: SaleMode.INSTANT_SALE,
      photos: [
        { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', position: 0 },
        { url: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800', position: 1 },
        { url: 'https://images.unsplash.com/photo-1579783902614-a53fb8587b73?w=800', position: 2 },
        { url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', position: 3 },
        { url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800', position: 4 },
      ],
    },
    {
      title: 'Sac de luxe vintage Chanel',
      categoryCode: 'MODE_ACCESSOIRES_LUXE',
      dimensions: '32cm x 24cm x 15cm',
      weightKg: 0.9,
      description: 'Sac en cuir grainé Chanel, édition limitée, très bon état. Modèle vintage des années 1990. Certificat d\'authenticité inclus. Pièce de collection.',
      priceDesired: 7600,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 6800,
      photos: [
        { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800', position: 0 },
        { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', position: 1 },
        { url: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800', position: 2 },
        { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', position: 3 },
        { url: 'https://images.unsplash.com/photo-1564422170191-4bd349ca3ac1?w=800', position: 4 },
      ],
    },
    {
      title: 'Bague en diamant solitaire - 2 carats',
      categoryCode: 'BIJOUX_MONTRES',
      dimensions: 'Taille: 54',
      weightKg: 0.005,
      description: 'Magnifique bague en or blanc 18 carats avec diamant solitaire de 2 carats. Certificat GIA inclus. Monture classique et élégante. Parfaite pour fiançailles ou anniversaire.',
      priceDesired: 18000,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 16200,
      photos: [
        { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', position: 0 },
        { url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800', position: 1 },
        { url: 'https://images.unsplash.com/photo-1611591437281-8bfd43f443c1?w=800', position: 2 },
        { url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', position: 3 },
        { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', position: 4 },
      ],
    },
    {
      title: 'Pendule ancienne - Style Empire',
      categoryCode: 'HORLOGERIE_PENDULES',
      dimensions: 'Hauteur: 60cm, Largeur: 30cm',
      weightKg: 5.2,
      description: 'Superbe pendule ancienne style Empire, début XIXe siècle. Mécanisme d\'origine restauré et fonctionnel. Bronze doré et marbre. Pièce authentique et rare.',
      priceDesired: 4500,
      saleMode: SaleMode.INSTANT_SALE,
      photos: [
        { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', position: 0 },
        { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', position: 1 },
        { url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800', position: 2 },
        { url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800', position: 3 },
        { url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', position: 4 },
      ],
    },
    {
      title: 'Bouteille de vin Château Margaux 1982',
      categoryCode: 'VINS_SPIRITUEUX',
      dimensions: 'Hauteur: 30cm',
      weightKg: 1.5,
      description: 'Bouteille de vin Château Margaux millésime 1982. Conservation parfaite, niveau optimal. Étiquette intacte. Millésime exceptionnel, très recherché par les collectionneurs.',
      priceDesired: 3500,
      saleMode: SaleMode.AUCTION,
      auctionStartPrice: 3150,
      photos: [
        { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800', position: 0 },
        { url: 'https://images.unsplash.com/photo-1506377247727-4b5e6b5b8b6c?w=800', position: 1 },
        { url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800', position: 2 },
        { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800', position: 3 },
        { url: 'https://images.unsplash.com/photo-1506377247727-4b5e6b5b8b6c?w=800', position: 4 },
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

    const categoryEnum = categoryCodeToEnum(listing.categoryCode);

    // Utiliser SQL direct pour contourner le problème de schéma
    const listingId = randomUUID();
    
    await prisma.$executeRaw`
      INSERT INTO listings (
        id, "sellerId", title, category, dimensions, "weightKg", description, 
        "priceDesired", "saleMode", "auctionStartPrice", "auctionEndAt", 
        "publishedAt", status, "createdAt", "updatedAt"
      ) VALUES (
        ${listingId}::text,
        ${professionalUser.id}::text,
        ${listing.title}::text,
        ${categoryEnum}::"ListingCategory",
        ${listing.dimensions}::text,
        ${listing.weightKg}::numeric,
        ${listing.description}::text,
        ${listing.priceDesired}::numeric,
        ${listing.saleMode}::"SaleMode",
        ${listing.auctionStartPrice || null}::numeric,
        ${auctionEndAt || null}::timestamp,
        ${now}::timestamp,
        ${ListingStatus.PUBLISHED}::"ListingStatus",
        ${now}::timestamp,
        ${now}::timestamp
      )
    `;

    // Créer les photos
    for (const photo of listing.photos) {
      await prisma.$executeRaw`
        INSERT INTO listing_photos (id, "listingId", url, position, "createdAt")
        VALUES (gen_random_uuid()::text, ${listingId}::text, ${photo.url}::text, ${photo.position}::integer, ${now}::timestamp)
      `;
    }

    console.log(`✅ Produit créé: ${listing.title}`);
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

