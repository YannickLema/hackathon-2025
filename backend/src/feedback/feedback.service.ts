import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: any, dto: CreateFeedbackDto) {
    if (!user?.id && !user?.sub) throw new ForbiddenException('Utilisateur requis');

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id ?? user.sub },
      select: { id: true, role: true },
    });
    if (!dbUser) throw new ForbiddenException('Utilisateur introuvable');
    if (dbUser.role !== 'PROFESSIONNEL' && dbUser.role !== 'PARTICULIER') {
      throw new ForbiddenException('Réservé aux utilisateurs inscrits (particulier ou pro)');
    }

    const hasStars = dto.stars !== undefined;
    const hasNps = dto.nps !== undefined;
    const hasComment = dto.comment !== undefined && dto.comment.trim().length > 0;
    if (!hasStars && !hasNps && !hasComment) {
      throw new BadRequestException('Fournir au moins stars, nps ou comment');
    }

    if (hasStars) {
      if (!Number.isInteger(dto.stars) || dto.stars! < 1 || dto.stars! > 5) {
        throw new BadRequestException('stars doit être un entier entre 1 et 5');
      }
    }
    if (hasNps) {
      if (!Number.isInteger(dto.nps) || dto.nps! < 1 || dto.nps! > 10) {
        throw new BadRequestException('nps doit être un entier entre 1 et 10');
      }
    }

    const feedback = await this.prisma.feedback.create({
      data: {
        userId: dbUser.id,
        stars: hasStars ? dto.stars! : null,
        nps: hasNps ? dto.nps! : null,
        comment: hasComment ? dto.comment!.trim() : null,
      },
    });

    return feedback;
  }
}


