import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountStatus } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }

    const secret = this.config.get<string>('JWT_SECRET') ?? 'dev-secret-change-me';
    let payload: { sub: string };

    try {
      payload = await this.jwtService.verifyAsync<{ sub: string }>(token, { secret });
    } catch (err) {
      throw new UnauthorizedException('Token invalide');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }
    if (user.status === AccountStatus.SUSPENDED) {
      throw new ForbiddenException('Compte suspendu');
    }
    if (!user.emailVerified) {
      throw new ForbiddenException('Email non vérifié');
    }

    // Attache l'utilisateur à la requête pour le reste du pipeline
    (request as Request & { user?: unknown }).user = user;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const auth = request.headers['authorization'];
    if (!auth) {
      return null;
    }
    const [type, token] = auth.split(' ');
    return type === 'Bearer' && token ? token : null;
  }
}

