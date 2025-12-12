const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPassword() {
  const email = process.argv[2] || 'professionnel@test.com';
  const password = process.argv[3] || 'test123';
  
  console.log(`Réinitialisation du mot de passe pour ${email}...`);
  
  const hash = await bcrypt.hash(password, 10);
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { password: hash },
    });
    
    console.log(`✅ Mot de passe mis à jour pour ${user.email} (${user.role})`);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();

