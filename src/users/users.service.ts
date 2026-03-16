import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity.js';
import {
  UpdateNameDto,
  UpdateEmailDto,
  UpdatePasswordDto,
} from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['clientProfile', 'freelancerProfile'],
    });

    if (!user) {
      throw new NotFoundException('Utilizador não encontrado');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async getMe(userId: string) {
    const user = await this.findById(userId);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      clientProfile: user.clientProfile || null,
      freelancerProfile: user.freelancerProfile || null,
      createdAt: user.createdAt,
    };
  }

  async updateName(userId: string, dto: UpdateNameDto) {
    const user = await this.findById(userId);
    user.name = dto.name;
    await this.userRepository.save(user);

    return { message: 'Nome atualizado com sucesso', name: user.name };
  }

  async updateEmail(userId: string, dto: UpdateEmailDto) {
    const user = await this.findById(userId);

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha incorreta');
    }

    const existingUser = await this.findByEmail(dto.email);
    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Este email já está em uso');
    }

    user.email = dto.email;
    await this.userRepository.save(user);

    return { message: 'Email atualizado com sucesso', email: user.email };
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.findById(userId);

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Senha atualizada com sucesso' };
  }
}
