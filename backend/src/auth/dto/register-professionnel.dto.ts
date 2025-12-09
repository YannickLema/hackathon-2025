export class RegisterProfessionnelDto {
  firstName!: string;
  lastName!: string;
  email!: string;
  password!: string;
  companyName!: string;
  siret!: string;
  officialDocument!: string;
  postalAddress!: string;
  website?: string;
  specialities!: string[]; // obligatoire
  mostSearchedItems!: string[]; // obligatoire
  socialNetworks?: import('@prisma/client').Prisma.InputJsonValue;
  cgvAccepted!: boolean;
  mandateAccepted!: boolean;
  newsletter?: boolean;
  rgpdAccepted!: boolean;
}

