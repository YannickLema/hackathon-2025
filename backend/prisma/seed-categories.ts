import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { code: 'BIJOUX_MONTRES', label: 'Bijoux / Montres' },
  { code: 'MEUBLES_ANCIENS', label: 'Meubles anciens' },
  { code: 'OBJETS_ART_TABLEAUX', label: 'Objets d’art / Tableaux' },
  { code: 'OBJETS_COLLECTION', label: 'Objets de collection' },
  { code: 'VINS_SPIRITUEUX', label: 'Vins / Spiritueux' },
  { code: 'INSTRUMENTS_MUSIQUE', label: 'Instruments de musique' },
  { code: 'LIVRES_MANUSCRITS', label: 'Livres / Manuscrits' },
  { code: 'MODE_ACCESSOIRES_LUXE', label: 'Mode / Accessoires de luxe' },
  { code: 'HORLOGERIE_PENDULES', label: 'Horlogerie / Pendules' },
  { code: 'PHOTOGRAPHIES', label: 'Photographies' },
  { code: 'VAISSELLE_ARGENTERIE_CRISTALLERIE', label: 'Vaisselle / Argenterie / Cristallerie' },
  { code: 'SCULPTURES_DECORATION', label: 'Sculptures / Décoration' },
  { code: 'VEHICULES_COLLECTION', label: 'Véhicules de collection' },
  { code: 'AUTRE', label: 'Autre' },
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({
      where: { code: c.code },
      update: { label: c.label, isActive: true },
      create: { code: c.code, label: c.label, isActive: true },
    });
  }
  console.log('Catégories insérées/ajustées');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

