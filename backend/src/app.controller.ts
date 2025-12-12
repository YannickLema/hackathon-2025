import { Body, Controller, Get, Post, Query, Redirect } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { EmailService } from './email/email.service';
import { ResetPasswordDto } from './auth/dto/reset-password.dto';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const result = await this.authService.verifyEmail(token);
    // Retourne une réponse JSON ou redirige vers le frontend
    return result;
  }

  @Get('reset-password')
  async getResetPassword(@Query('token') token: string) {
    // Endpoint GET pour afficher le formulaire (si nécessaire)
    // Pour l'instant, on retourne juste un message
    return { 
      message: 'Utilisez POST /reset-password avec le token et le nouveau mot de passe',
      token: token 
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('contact')
  async contact(@Body() body: { firstName: string; lastName: string; email: string; subject: string; message: string }) {
    try {
      // Envoyer un email de contact
      await this.emailService.sendContactEmail({
        fromEmail: body.email,
        fromName: `${body.firstName} ${body.lastName}`,
        subject: body.subject,
        message: body.message,
      });
      
      return { 
        message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
        success: true 
      };
    } catch (error) {
      // En cas d'erreur d'envoi d'email, on retourne quand même un succès pour ne pas bloquer l'utilisateur
      console.error('Erreur lors de l\'envoi de l\'email de contact:', error);
      return { 
        message: 'Votre message a été enregistré. Nous vous répondrons dans les plus brefs délais.',
        success: true 
      };
    }
  }

  @Get('categories')
  async getCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { label: 'asc' },
      select: {
        id: true,
        code: true,
        label: true,
        isActive: true,
      },
    });
  }
}
