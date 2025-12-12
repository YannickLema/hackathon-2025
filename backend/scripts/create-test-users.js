const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log('🔧 Création des utilisateurs de test...\n');

  const users = [
    {
      email: 'admin@test.com',
      password: 'test123',
      firstName: 'Admin',
      lastName: 'Test',
      role: 'ADMIN',
      status: 'VERIFIED',
      emailVerified: true,
    },
    {
      email: 'particulier@test.com',
      password: 'test123',
      firstName: 'Marie',
      lastName: 'Martin',
      role: 'PARTICULIER',
      status: 'VERIFIED',
      emailVerified: true,
      particulierProfile: {
        postalAddress: '123 Rue de la Paix, 75001 Paris',
        isOver18: true,
        newsletter: false,
        rgpdAccepted: true,
        rgpdAcceptedAt: new Date(),
      },
    },
    {
      email: 'professionnel@test.com',
      password: 'test123',
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'PROFESSIONNEL',
      status: 'VERIFIED',
      emailVerified: true,
      professionnelProfile: {
        companyName: 'Antiquités Dupont',
        siret: '12345678901234',
        postalAddress: '456 Avenue des Champs, 75008 Paris',
        website: 'https://www.antiquites-dupont.fr',
        specialities: ['Meubles anciens', 'Objets d\'art'],
        mostSearchedItems: ['Armoires', 'Commodes', 'Tableaux'],
        newsletter: false,
        cgvAccepted: true,
        cgvAcceptedAt: new Date(),
        mandateAccepted: true,
        mandateAcceptedAt: new Date(),
        rgpdAccepted: true,
        rgpdAcceptedAt: new Date(),
      },
    },
  ];

  for (const userData of users) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existing) {
        console.log(`⚠️  Utilisateur ${userData.email} existe déjà, mise à jour...`);
        
        // Mettre à jour le mot de passe
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await prisma.user.update({
          where: { email: userData.email },
          data: {
            password: hashedPassword,
            status: userData.status,
            emailVerified: userData.emailVerified,
          },
        });
        console.log(`✅ ${userData.email} (${userData.role}) - Mot de passe mis à jour\n`);
        continue;
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Préparer les données
      const { particulierProfile, professionnelProfile, ...userFields } = userData;

      const createData = {
        ...userFields,
        password: hashedPassword,
      };

      if (particulierProfile) {
        createData.particulierProfile = { create: particulierProfile };
      }

      if (professionnelProfile) {
        createData.professionnelProfile = { create: professionnelProfile };
      }

      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: createData,
        include: {
          particulierProfile: true,
          professionnelProfile: true,
        },
      });

      console.log(`✅ ${user.email} (${user.role}) créé avec succès`);
      console.log(`   Mot de passe: ${userData.password}\n`);
    } catch (error) {
      console.error(`❌ Erreur lors de la création de ${userData.email}:`, error.message);
    }
  }

  console.log('✅ Création des utilisateurs terminée !\n');
  console.log('📋 Comptes de test disponibles :');
  console.log('  👤 ADMIN : admin@test.com / test123');
  console.log('  👤 PARTICULIER : particulier@test.com / test123');
  console.log('  👤 PROFESSIONNEL : professionnel@test.com / test123');
}

createTestUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

