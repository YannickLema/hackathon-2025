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
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterParticulierDto } from './dto/register-particulier.dto';
import { RegisterProfessionnelDto } from './dto/register-professionnel.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly emailService: EmailService,
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

    // Générer et envoyer l'email de vérification
    await this.sendVerificationEmail(user.id, user.email, user.firstName);

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

    // Générer et envoyer l'email de vérification
    await this.sendVerificationEmail(user.id, user.email, user.firstName);

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

    if (!user.emailVerified) {
      throw new ForbiddenException('Veuillez vérifier votre email avant de vous connecter');
    }

    return this.buildAuthResponse(user);
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Token de vérification requis');
    }

    const verification = await this.prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      throw new BadRequestException('Token de vérification invalide');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('Token de vérification expiré');
    }

    // Vérifier l'email et mettre à jour le statut
    await this.prisma.user.update({
      where: { id: verification.userId },
      data: {
        emailVerified: true,
        status: AccountStatus.VERIFIED,
      },
    });

    // Supprimer le token de vérification
    await this.prisma.emailVerification.delete({
      where: { id: verification.id },
    });

    return { message: 'Email vérifié avec succès' };
  }

  async resendVerificationEmail(email: string) {
    if (!email) {
      throw new BadRequestException('Email requis');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
      return { message: 'Si cet email existe, un email de vérification a été envoyé' };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email déjà vérifié');
    }

    await this.sendVerificationEmail(user.id, user.email, user.firstName);

    return { message: 'Email de vérification envoyé' };
  }

  private async sendVerificationEmail(userId: string, email: string, firstName: string) {
    // Générer un token unique
    const token = crypto.randomBytes(32).toString('hex');

    // Expiration dans 24 heures
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Supprimer l'ancien token s'il existe
    await this.prisma.emailVerification.deleteMany({
      where: { userId },
    });

    // Créer le nouveau token
    await this.prisma.emailVerification.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    // Envoyer l'email
    await this.emailService.sendVerificationEmail(email, token, firstName);
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

