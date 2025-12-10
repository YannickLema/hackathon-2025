import { Body, Controller, Get, Post, Query, Redirect } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { ResetPasswordDto } from './auth/dto/reset-password.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
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
}
