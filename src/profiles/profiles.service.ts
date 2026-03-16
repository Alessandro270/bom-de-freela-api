import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ClientProfile } from './entities/client-profile.entity.js';
import { FreelancerProfile } from './entities/freelancer-profile.entity.js';
import {
  CreateClientProfileDto,
  UpdateClientProfileDto,
  CreateFreelancerProfileDto,
  UpdateFreelancerProfileDto,
} from './dto/profile.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(ClientProfile)
    private readonly clientProfileRepository: Repository<ClientProfile>,
    @InjectRepository(FreelancerProfile)
    private readonly freelancerProfileRepository: Repository<FreelancerProfile>,
  ) {}

  // ─── Client Profile ───────────────────────────────────────

  async createClientProfile(userId: string, dto: CreateClientProfileDto) {
    const existing = await this.clientProfileRepository.findOne({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('Já possui um perfil de cliente');
    }

    const profile = this.clientProfileRepository.create({
      ...dto,
      userId,
    });

    return this.clientProfileRepository.save(profile);
  }

  async getClientProfile(id: string) {
    const profile = await this.clientProfileRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Perfil de cliente não encontrado');
    }

    return {
      id: profile.id,
      description: profile.description,
      profilePhoto: profile.profilePhoto,
      user: {
        id: profile.user.id,
        name: profile.user.name,
      },
      createdAt: profile.createdAt,
    };
  }

  async updateClientProfile(userId: string, dto: UpdateClientProfileDto) {
    const profile = await this.clientProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Perfil de cliente não encontrado');
    }

    Object.assign(profile, dto);
    return this.clientProfileRepository.save(profile);
  }

  // ─── Freelancer Profile ────────────────────────────────────

  async createFreelancerProfile(
    userId: string,
    dto: CreateFreelancerProfileDto,
  ) {
    const existing = await this.freelancerProfileRepository.findOne({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('Já possui um perfil de freelancer');
    }

    const profile = this.freelancerProfileRepository.create({
      ...dto,
      userId,
    });

    return this.freelancerProfileRepository.save(profile);
  }

  async getFreelancerProfile(id: string) {
    const profile = await this.freelancerProfileRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Perfil de freelancer não encontrado');
    }

    return {
      id: profile.id,
      title: profile.title,
      bio: profile.bio,
      skills: profile.skills,
      nif: profile.nif,
      phone: profile.phone,
      user: {
        id: profile.user.id,
        name: profile.user.name,
      },
      createdAt: profile.createdAt,
    };
  }

  async updateFreelancerProfile(
    userId: string,
    dto: UpdateFreelancerProfileDto,
  ) {
    const profile = await this.freelancerProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Perfil de freelancer não encontrado');
    }

    Object.assign(profile, dto);
    return this.freelancerProfileRepository.save(profile);
  }

  async searchFreelancers(
    query: PaginationQueryDto & { search?: string; skill?: string },
  ): Promise<PaginatedResult<any>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.freelancerProfileRepository
      .createQueryBuilder('fp')
      .leftJoinAndSelect('fp.user', 'user')
      .where('user.isActive = :isActive', { isActive: true });

    if (query.search) {
      qb.andWhere(
        '(fp.title LIKE :search OR fp.bio LIKE :search OR user.name LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.skill) {
      qb.andWhere('fp.skills LIKE :skill', { skill: `%${query.skill}%` });
    }

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    const mappedData = data.map((fp) => ({
      id: fp.id,
      title: fp.title,
      bio: fp.bio,
      skills: fp.skills,
      user: {
        id: fp.user.id,
        name: fp.user.name,
      },
    }));

    return {
      data: mappedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
