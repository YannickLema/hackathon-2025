import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterParticulierDto } from './dto/register-particulier.dto';
import { RegisterProfessionnelDto } from './dto/register-professionnel.dto';
import { LoginDto } from './dto/login.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/particulier')
  registerParticulier(@Body() dto: RegisterParticulierDto) {
    return this.authService.registerParticulier(dto);
  }

  @Post('register/professionnel')
  registerProfessionnel(@Body() dto: RegisterProfessionnelDto) {
    return this.authService.registerProfessionnel(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  resendVerificationEmail(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('validate-siret/:siret')
  async validateSiret(@Param('siret') siret: string) {
    return this.authService.validateSiret(siret);
  }

  @Post('admin/verify-email')
  async adminVerifyEmail(@Body() body: { email: string }) {
    return this.authService.adminVerifyEmail(body.email);
  }
}

