import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterParticulierDto } from './dto/register-particulier.dto';
import { RegisterProfessionnelDto } from './dto/register-professionnel.dto';
import { LoginDto } from './dto/login.dto';

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
}

