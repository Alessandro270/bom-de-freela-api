import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registar novo utilizador',
    description:
      'Cria um novo utilizador com perfil de cliente automático e retorna o token JWT.',
  })
  @ApiResponse({ status: 201, description: 'Registo efetuado com sucesso' })
  @ApiResponse({ status: 409, description: 'Email já em uso' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login',
    description: 'Autentica o utilizador e retorna o token JWT.',
  })
  @ApiResponse({ status: 200, description: 'Login efetuado com sucesso' })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas ou conta desativada',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar recuperação de senha',
    description:
      'Envia um email com link de recuperação de senha (válido por 1h).',
  })
  @ApiResponse({
    status: 200,
    description: 'Email de recuperação enviado (se existir)',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Redefinir senha',
    description: 'Define uma nova senha utilizando o token recebido por email.',
  })
  @ApiResponse({ status: 200, description: 'Senha redefinida com sucesso' })
  @ApiResponse({ status: 400, description: 'Token inválido ou expirado' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
