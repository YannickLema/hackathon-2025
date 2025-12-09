export class RegisterParticulierDto {
  firstName!: string;
  lastName!: string;
  email!: string;
  password!: string;
  profilePhoto?: string;
  postalAddress!: string;
  isOver18!: boolean;
  newsletter?: boolean;
  rgpdAccepted!: boolean;
}

