// Script pour créer 3 utilisateurs en production
const { PrismaClient, Role, AccountStatus } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('👥 Création des utilisateurs en production...\n');

  // Mot de passe par défaut pour tous : test123
  const password = await bcrypt.hash('test123', 10);

  // 1. Créer un utilisateur professionnel
  const proEmail = 'professionnel@test.com';
  let pro = await prisma.user.findUnique({
    where: { email: proEmail },
  });

  if (!pro) {
    pro = await prisma.user.create({
      data: {
        email: proEmail,
        password: password,
        role: Role.PROFESSIONNEL,
        firstName: 'Jean',
        lastName: 'Dupont',
        emailVerified: true,
        status: AccountStatus.VERIFIED,
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
    console.log('✅ Professionnel créé:', proEmail, '(mot de passe: test123)');
  } else {
    console.log('ℹ️  Professionnel existe déjà:', proEmail);
  }

  // 2. Créer un utilisateur particulier
  const particulierEmail = 'particulier@test.com';
  let particulier = await prisma.user.findUnique({
    where: { email: particulierEmail },
  });

  if (!particulier) {
    particulier = await prisma.user.create({
      data: {
        email: particulierEmail,
        password: password,
        role: Role.PARTICULIER,
        firstName: 'Marie',
        lastName: 'Martin',
        emailVerified: true,
        status: AccountStatus.VERIFIED,
        particulierProfile: {
          create: {
            postalAddress: '45 Avenue des Champs, 75008 Paris',
          },
        },
      },
    });
    console.log('✅ Particulier créé:', particulierEmail, '(mot de passe: test123)');
  } else {
    console.log('ℹ️  Particulier existe déjà:', particulierEmail);
  }

  // 3. Créer un utilisateur admin
  const adminEmail = 'admin@purpledog.site';
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: password,
        role: Role.ADMIN,
        firstName: 'Admin',
        lastName: 'PurpleDog',
        emailVerified: true,
        status: AccountStatus.VERIFIED,
      },
    });
    console.log('✅ Admin créé:', adminEmail, '(mot de passe: test123)');
  } else {
    console.log('ℹ️  Admin existe déjà:', adminEmail);
  }

  console.log('\n🎉 Terminé !');
  console.log('\n📋 Récapitulatif des utilisateurs:');
  console.log('   Professionnel:', proEmail, '- test123');
  console.log('   Particulier:', particulierEmail, '- test123');
  console.log('   Admin:', adminEmail, '- test123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

