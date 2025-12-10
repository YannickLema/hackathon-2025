import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';

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
}
