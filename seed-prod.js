// Script simple pour seed en production (JavaScript pur, pas TypeScript)
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Création des produits en production...\n');

  // Vérifier si des produits existent
  const count = await prisma.listing.count();
  if (count > 0) {
    console.log(`⚠️  ${count} produits existent déjà.`);
    return;
  }

  // Récupérer ou créer un utilisateur professionnel
  let user = await prisma.user.findFirst({
    where: { role: 'PROFESSIONNEL' },
  });

  if (!user) {
    console.log('📝 Création d\'un utilisateur professionnel...');
    user = await prisma.user.create({
      data: {
        email: 'professionnel@test.com',
        password: '$2b$10$rK8Q8Q8Q8Q8Q8Q8Q8Q8Q8O8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q',
        role: 'PROFESSIONNEL',
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
    console.log('✅ Utilisateur créé:', user.email);
  }

  const now = new Date();
  const auctionEndAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 jours

  const products = [
    {
      title: 'Montre de collection Rolex Submariner 1960',
      category: 'BIJOUX_MONTRES',
      dimensions: '42mm x 13mm',
      weightKg: 0.15,
      description: 'Magnifique montre de collection Rolex Submariner datant de 1960. En excellent état, avec boîte et papiers d\'origine.',
      priceDesired: 15000,
      saleMode: 'AUCTION',
      auctionStartPrice: 13500,
      auctionEndAt: auctionEndAt,
      photos: [
        { url: 'https://cdn.pixabay.com/photo/2015/11/07/11/46/wristwatch-1031019_1280.jpg', position: 0 },
        { url: 'https://cdn.pixabay.com/photo/2015/11/07/11/46/wristwatch-1031019_1280.jpg', position: 1 },
        { url: 'https://cdn.pixabay.com/photo/2015/11/07/11/46/wristwatch-1031019_1280.jpg', position: 2 },
      ],
    },
    {
      title: 'Peinture à l\'huile - Paysage Provençal',
      category: 'OBJETS_ART_TABLEAUX',
      dimensions: '80cm x 60cm',
      weightKg: 2.5,
      description: 'Superbe peinture à l\'huile représentant un paysage provençal. Signée par l\'artiste. Cadre en bois doré d\'époque.',
      priceDesired: 8500,
      saleMode: 'INSTANT_SALE',
      photos: [
        { url: 'https://cdn.pixabay.com/photo/2017/08/01/20/06/people-2571059_1280.jpg', position: 0 },
        { url: 'https://cdn.pixabay.com/photo/2017/08/01/20/06/people-2571059_1280.jpg', position: 1 },
      ],
    },
    {
      title: 'Sculpture en bronze - Art Déco',
      category: 'SCULPTURES_DECORATION',
      dimensions: '45cm x 30cm x 25cm',
      weightKg: 8.5,
      description: 'Magnifique sculpture en bronze de style Art Déco. Pièce unique, excellent état de conservation.',
      priceDesired: 12000,
      saleMode: 'AUCTION',
      auctionStartPrice: 10800,
      auctionEndAt: auctionEndAt,
      photos: [
        { url: 'https://cdn.pixabay.com/photo/2018/05/20/11/29/sculpture-3416007_1280.jpg', position: 0 },
        { url: 'https://cdn.pixabay.com/photo/2018/05/20/11/29/sculpture-3416007_1280.jpg', position: 1 },
      ],
    },
    {
      title: 'Collier en diamants - Art Nouveau',
      category: 'BIJOUX_MONTRES',
      dimensions: 'Longueur: 45cm',
      weightKg: 0.08,
      description: 'Exceptionnel collier en diamants de style Art Nouveau. Certificat d\'authenticité inclus.',
      priceDesired: 25000,
      saleMode: 'INSTANT_SALE',
      photos: [
        { url: 'https://cdn.pixabay.com/photo/2016/11/29/09/16/necklace-1868569_1280.jpg', position: 0 },
        { url: 'https://cdn.pixabay.com/photo/2016/11/29/09/16/necklace-1868569_1280.jpg', position: 1 },
      ],
    },
    {
      title: 'Vase en porcelaine de Sèvres - XVIIIe siècle',
      category: 'OBJETS_ART_TABLEAUX',
      dimensions: 'Hauteur: 35cm, Diamètre: 20cm',
      weightKg: 1.2,
      description: 'Rare vase en porcelaine de Sèvres du XVIIIe siècle. Décor floral finement peint. Marque de manufacture visible.',
      priceDesired: 18000,
      saleMode: 'AUCTION',
      auctionStartPrice: 16200,
      auctionEndAt: auctionEndAt,
      photos: [
        { url: 'https://cdn.pixabay.com/photo/2016/11/29/03/53/vase-1867331_1280.jpg', position: 0 },
        { url: 'https://cdn.pixabay.com/photo/2016/11/29/03/53/vase-1867331_1280.jpg', position: 1 },
      ],
    },
  ];

  console.log('📦 Création des produits...\n');
  for (const product of products) {
    const created = await prisma.listing.create({
      data: {
        sellerId: user.id,
        title: product.title,
        category: product.category,
        dimensions: product.dimensions,
        weightKg: product.weightKg,
        description: product.description,
        priceDesired: product.priceDesired,
        saleMode: product.saleMode,
        auctionStartPrice: product.auctionStartPrice || null,
        auctionEndAt: product.auctionEndAt || null,
        publishedAt: now,
        status: 'PUBLISHED',
        photos: {
          create: product.photos,
        },
      },
    });
    console.log(`✅ ${created.title}`);
  }

  console.log(`\n🎉 Terminé ! ${products.length} produits créés.`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

