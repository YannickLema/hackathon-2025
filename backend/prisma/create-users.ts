import { PrismaClient, Role, AccountStatus } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';
import * as bcrypt from 'bcrypt';

// Charger le .env depuis la racine du projet
config({ path: resolve(__dirname, '../../.env') });

// Ajuster DATABASE_URL si on est hors Docker
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@db:')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('@db:', '@localhost:');
}

const prisma = new PrismaClient();

async function main() {
  console.log('👤 Création des utilisateurs...\n');

  // Vérifier si les utilisateurs existent déjà
  const existingParticulier = await prisma.user.findUnique({
    where: { email: 'particulier@test.com' },
  });

  const existingProfessionnel = await prisma.user.findUnique({
    where: { email: 'professionnel@test.com' },
  });

  // Créer l'utilisateur particulier
  if (!existingParticulier) {
    console.log('📝 Création de l\'utilisateur particulier...');
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const particulier = await prisma.user.create({
      data: {
        email: 'particulier@test.com',
        password: hashedPassword,
        firstName: 'Marie',
        lastName: 'Martin',
        role: Role.PARTICULIER,
        emailVerified: true,
        status: AccountStatus.VERIFIED,
        particulierProfile: {
          create: {
            postalAddress: '15 Avenue des Champs-Élysées, 75008 Paris',
            isOver18: true,
            newsletter: false,
            rgpdAccepted: true,
            rgpdAcceptedAt: new Date(),
          },
        },
      },
    });
    console.log('✅ Utilisateur particulier créé:');
    console.log(`   Email: ${particulier.email}`);
    console.log(`   Mot de passe: test123`);
    console.log(`   Nom: ${particulier.firstName} ${particulier.lastName}\n`);
  } else {
    console.log('⚠️  L\'utilisateur particulier existe déjà: particulier@test.com\n');
  }

  // Créer l'utilisateur professionnel
  if (!existingProfessionnel) {
    console.log('📝 Création de l\'utilisateur professionnel...');
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const professionnel = await prisma.user.create({
      data: {
        email: 'professionnel@test.com',
        password: hashedPassword,
        firstName: 'Pierre',
        lastName: 'Dubois',
        role: Role.PROFESSIONNEL,
        emailVerified: true,
        status: AccountStatus.VERIFIED,
        professionnelProfile: {
          create: {
            companyName: 'Antiquités Dubois',
            siret: '98765432109876',
            postalAddress: '42 Rue de Rivoli, 75001 Paris',
            officialDocument: 'https://example.com/kbis.pdf',
            specialities: ['Art ancien', 'Bijoux', 'Montres', 'Objets d\'art'],
            mostSearchedItems: ['Peintures', 'Sculptures', 'Montres de collection'],
            website: 'https://www.antiquites-dubois.fr',
            cgvAccepted: true,
            cgvAcceptedAt: new Date(),
            mandateAccepted: true,
            mandateAcceptedAt: new Date(),
            newsletter: false,
            rgpdAccepted: true,
            rgpdAcceptedAt: new Date(),
          },
        },
      },
    });
    console.log('✅ Utilisateur professionnel créé:');
    console.log(`   Email: ${professionnel.email}`);
    console.log(`   Mot de passe: test123`);
    console.log(`   Nom: ${professionnel.firstName} ${professionnel.lastName}`);
    console.log(`   Entreprise: Antiquités Dubois\n`);
  } else {
    console.log('⚠️  L\'utilisateur professionnel existe déjà: professionnel@test.com\n');
  }

  console.log('🎉 Terminé !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la création des utilisateurs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

