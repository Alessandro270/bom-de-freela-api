import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity.js';
import { ClientProfile } from '../profiles/entities/client-profile.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { MailService } from '../mail/mail.service.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ClientProfile)
    private readonly clientProfileRepository: Repository<ClientProfile>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Já existe um utilizador com este email');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Criar perfil de cliente automaticamente
    const clientProfile = this.clientProfileRepository.create({
      userId: savedUser.id,
    });
    await this.clientProfileRepository.save(clientProfile);

    const token = await this.generateToken(savedUser);

    return {
      message: 'Registo efetuado com sucesso',
      accessToken: token,
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['clientProfile', 'freelancerProfile'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Conta desativada. Contacte o administrador.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = await this.generateToken(user);

    return {
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasClientProfile: !!user.clientProfile,
        hasFreelancerProfile: !!user.freelancerProfile,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    // Sempre retornar sucesso para não revelar se o email existe
    if (!user) {
      return {
        message:
          'Se o email existir, receberá um link de recuperação de senha.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
    await this.userRepository.save(user);

    try {
      await this.mailService.sendPasswordResetEmail(user.email, resetToken);
    } catch {
      // Log error but don't expose to user
    }

    return {
      message: 'Se o email existir, receberá um link de recuperação de senha.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetPasswordDto.token)
      .digest('hex');

    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    user.password = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    user.resetPasswordToken = null as any;
    user.resetPasswordExpires = null as any;
    await this.userRepository.save(user);

    return { message: 'Senha redefinida com sucesso' };
  }

  private async generateToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload);
  }
}
