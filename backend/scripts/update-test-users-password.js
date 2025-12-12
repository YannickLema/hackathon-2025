const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function updatePasswords() {
  console.log('🔧 Mise à jour des mots de passe...\n');

  const password = 'test123';
  const hash = await bcrypt.hash(password, 10);

  const emails = ['admin@test.com', 'particulier@test.com', 'professionnel@test.com'];

  for (const email of emails) {
    try {
      const result = await prisma.user.updateMany({
        where: { email },
        data: {
          password: hash,
          status: 'VERIFIED',
          emailVerified: true,
        },
      });
      console.log(`✅ ${email} - ${result.count} utilisateur(s) mis à jour`);
    } catch (error) {
      console.error(`❌ Erreur pour ${email}:`, error.message);
    }
  }

  console.log('\n✅ Mise à jour terminée !');
}

updatePasswords()
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

