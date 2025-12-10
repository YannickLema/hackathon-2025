import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterParticulierDto } from './dto/register-particulier.dto';
import { RegisterProfessionnelDto } from './dto/register-professionnel.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async registerParticulier(dto: RegisterParticulierDto) {
    this.validateParticulier(dto);
    await this.ensureEmailAvailable(dto.email);
    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: Role.PARTICULIER,
        status: AccountStatus.PENDING_VERIFICATION,
        emailVerified: false,
        particulierProfile: {
          create: {
            profilePhoto: dto.profilePhoto ?? null,
            postalAddress: dto.postalAddress,
            isOver18: dto.isOver18,
            newsletter: dto.newsletter ?? false,
            rgpdAccepted: dto.rgpdAccepted,
            rgpdAcceptedAt: dto.rgpdAccepted ? new Date() : null,
          },
        },
      },
      include: { particulierProfile: true },
    });

    return this.buildAuthResponse(user);
  }

  async registerProfessionnel(dto: RegisterProfessionnelDto) {
    this.validateProfessionnel(dto);
    await this.ensureEmailAvailable(dto.email);
    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: Role.PROFESSIONNEL,
        status: AccountStatus.PENDING_VERIFICATION,
        emailVerified: false,
        professionnelProfile: {
          create: {
            companyName: dto.companyName,
            siret: dto.siret,
            officialDocument: dto.officialDocument,
            postalAddress: dto.postalAddress,
            website: dto.website ?? null,
            specialities: dto.specialities,
            mostSearchedItems: dto.mostSearchedItems,
            socialNetworks: dto.socialNetworks ?? undefined,
            cgvAccepted: dto.cgvAccepted,
            cgvAcceptedAt: dto.cgvAccepted ? new Date() : null,
            mandateAccepted: dto.mandateAccepted,
            mandateAcceptedAt: dto.mandateAccepted ? new Date() : null,
            newsletter: dto.newsletter ?? false,
            rgpdAccepted: dto.rgpdAccepted,
            rgpdAcceptedAt: dto.rgpdAccepted ? new Date() : null,
          },
        },
      },
      include: { professionnelProfile: true },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    if (!dto?.email || !dto?.password) {
      throw new BadRequestException('Email et mot de passe sont requis');
    }
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (user.status === AccountStatus.SUSPENDED) {
      throw new ForbiddenException('Compte suspendu');
    }

    return this.buildAuthResponse(user);
  }

  private async ensureEmailAvailable(email: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email déjà utilisé');
    }
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    status: AccountStatus;
    emailVerified: boolean;
    password?: string;
  }) {
    const payload = { sub: user.id, role: user.role, email: user.email };
    const accessToken = this.jwt.sign(payload);

    const { password, ...safeUser } = user;
    return { accessToken, user: safeUser };
  }

  private validateParticulier(dto: RegisterParticulierDto) {
    if (!dto) {
      throw new BadRequestException('Corps de requête manquant');
    }
    if (!dto.email || !dto.password || !dto.firstName || !dto.lastName) {
      throw new BadRequestException(
        'Champs requis: firstName, lastName, email, password',
      );
    }
    if (!dto.postalAddress) {
      throw new BadRequestException('Adresse postale requise');
    }
    if (dto.isOver18 !== true) {
      throw new BadRequestException('Vous devez certifier être majeur (18+)');
    }
    if (dto.rgpdAccepted !== true) {
      throw new BadRequestException('Acceptation RGPD requise');
    }
  }

  async validateSiret(siret: string) {
    // Nettoyer le SIRET (supprimer les espaces)
    const cleanSiret = siret.replace(/\s/g, '');

    // Vérifier le format (14 chiffres)
    if (!cleanSiret || cleanSiret.length !== 14 || !/^\d+$/.test(cleanSiret)) {
      return {
        valid: false,
        error: 'Le SIRET doit contenir 14 chiffres',
      };
    }

    // Validation locale avec algorithme de Luhn (pour environnement de test)
    const isValidLuhn = this.validateLuhn(cleanSiret);
    
    if (!isValidLuhn) {
      return {
        valid: false,
        error: 'SIRET invalide (clé de contrôle incorrecte)',
      };
    }

    // Pour un environnement de test, on accepte tous les SIRET valides selon Luhn
    // Cela permet de tester sans avoir besoin d'une clé API INSEE
    // En production, vous pouvez décommenter le code ci-dessous pour utiliser l'API INSEE
    return {
      valid: true,
      companyName: null, // En test, on ne récupère pas le nom depuis l'API
    };

    /* Code pour production avec API INSEE (nécessite une clé API)
    try {
      const apiKey = process.env.INSEE_API_KEY;
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(
        `https://entreprise.api.gouv.fr/v3/insee/sirene/etablissements/${cleanSiret}`,
        {
          method: 'GET',
          headers,
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.etablissement) {
          return {
            valid: true,
            companyName:
              data.etablissement.unite_legale?.denomination ||
              data.etablissement.unite_legale?.prenom_usuel ||
              null,
          };
        } else {
          return {
            valid: false,
            error: 'SIRET introuvable dans l\'annuaire des entreprises',
          };
        }
      } else if (response.status === 404) {
        return {
          valid: false,
          error: 'SIRET introuvable dans l\'annuaire des entreprises',
        };
      } else {
        return {
          valid: false,
          error: 'Impossible de vérifier le SIRET. Veuillez réessayer plus tard.',
        };
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du SIRET:', err);
      return {
        valid: false,
        error: 'Erreur lors de la vérification. Veuillez réessayer plus tard.',
      };
    }
    */
  }

  /**
   * Valide un SIRET en utilisant l'algorithme de Luhn
   * Le SIRET est valide si sa clé de contrôle (dernier chiffre) est correcte
   * L'algorithme compte depuis la droite (le dernier chiffre est la clé)
   */
  private validateLuhn(siret: string): boolean {
    if (siret.length !== 14 || !/^\d+$/.test(siret)) {
      return false;
    }

    // Extraire les chiffres
    const digits = siret.split('').map(Number);
    const checkDigit = digits[13]; // Dernier chiffre (clé de contrôle)
    
    // Calculer la somme selon l'algorithme de Luhn
    // On compte depuis la droite (position 1 = dernier chiffre avant la clé)
    let sum = 0;
    for (let i = 0; i < 13; i++) {
      // Position depuis la droite (1 = dernier avant clé, 2 = avant-dernier, etc.)
      const positionFromRight = 13 - i;
      let digit = digits[i];
      
      // Multiplier par 2 les chiffres en position impaire depuis la droite (1, 3, 5, 7, 9, 11, 13)
      if (positionFromRight % 2 === 1) {
        digit *= 2;
        // Si le résultat est >= 10, additionner les chiffres
        if (digit >= 10) {
          digit = Math.floor(digit / 10) + (digit % 10);
        }
      }
      sum += digit;
    }
    
    // La clé de contrôle doit être telle que (sum + checkDigit) % 10 === 0
    const calculatedCheck = (10 - (sum % 10)) % 10;
    
    return calculatedCheck === checkDigit;
  }

  private validateProfessionnel(dto: RegisterProfessionnelDto) {
    if (!dto) {
      throw new BadRequestException('Corps de requête manquant');
    }
    const required = [
      'firstName',
      'lastName',
      'email',
      'password',
      'companyName',
      'siret',
      'officialDocument',
      'postalAddress',
    ];
    const bag = dto as unknown as Record<string, unknown>;
    const missing = required.filter((k) => !bag[k]);
    if (missing.length) {
      throw new BadRequestException(`Champs requis manquants: ${missing.join(', ')}`);
    }
    if (!dto.specialities || dto.specialities.length === 0) {
      throw new BadRequestException('Au moins une spécialité est requise');
    }
    if (!dto.mostSearchedItems || dto.mostSearchedItems.length === 0) {
      throw new BadRequestException(
        'Au moins un objet recherché est requis',
      );
    }
    if (dto.cgvAccepted !== true || dto.mandateAccepted !== true) {
      throw new BadRequestException('CGV et mandat doivent être acceptés');
    }
    if (dto.rgpdAccepted !== true) {
      throw new BadRequestException('Acceptation RGPD requise');
    }
  }
}

